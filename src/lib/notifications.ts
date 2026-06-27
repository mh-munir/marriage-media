/**
 * Multi-Channel Notification Dispatch System
 *
 * Orchestrates notifications across all channels:
 * - In-App (MongoDB Notification collection)
 * - Browser Push (FCM / Web Push)
 * - Email (SMTP / SendGrid / Resend)
 * - SMS (Twilio / HTTP provider)
 * - WhatsApp (WhatsApp Business API)
 *
 * Respects user preferences and quiet hours for each channel.
 */

import connectToDatabase from "./mongodb";
import { Notification, NotificationPreference, User } from "@/models";
import { sendPushNotification } from "./notifications.push";
import { sendEmail, sendTemplatedEmail } from "./email";
import { sendSMS } from "./sms";
import { sendWhatsAppMessage } from "./whatsapp";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AppNotificationType =
  | "interest"
  | "message"
  | "profile_view"
  | "payment"
  | "verification"
  | "system"
  | "promotion";

export interface CreateNotificationParams {
  userId: string;
  type: AppNotificationType;
  title: string;
  message: string;
  link?: string;
  /** Which channels to use. Defaults to ["inapp"]. Use "all" for every enabled channel. */
  channels?: NotificationChannel[];
  /** Email-specific overrides */
  emailSubject?: string;
  emailHtml?: string;
  /** SMS-specific overrides */
  smsMessage?: string;
  /** Template slug for email */
  emailTemplate?: string;
  emailTemplateVariables?: Record<string, string>;
}

export type NotificationChannel =
  | "inapp"
  | "push"
  | "email"
  | "sms"
  | "whatsapp"
  | "all";

export interface NotificationDispatchResult {
  inapp: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check whether the current time falls within the user's quiet hours. */
function isInQuietHours(prefs: {
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}): boolean {
  if (!prefs.quietHoursEnabled) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = prefs.quietHoursStart.split(":").map(Number);
  const [endH, endM] = prefs.quietHoursEnd.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes > endMinutes) {
    // Spans midnight
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/** Map our notification types to preference keys. */
const emailPrefMap: Record<string, string> = {
  interest: "interests",
  message: "messages",
  profile_view: "profileViews",
  payment: "payments",
  verification: "security",
  system: "newsletters",
  promotion: "promotions",
};

const pushPrefMap: Record<string, string> = {
  interest: "interests",
  message: "messages",
  profile_view: "profileViews",
  payment: "payments",
  verification: "security",
  system: "security",
  promotion: "promotions",
};

const smsPrefMap: Record<string, string> = {
  interest: "interests",
  payment: "payments",
  verification: "verification",
  system: "security",
};

const whatsappPrefMap: Record<string, string> = {
  interest: "interests",
  message: "messages",
  payment: "payments",
  verification: "security",
  system: "security",
  promotion: "promotions",
};

// ---------------------------------------------------------------------------
// Core Dispatch
// ---------------------------------------------------------------------------

/**
 * Send a notification across multiple channels, respecting user preferences.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<NotificationDispatchResult> {
  await connectToDatabase();

  const result: NotificationDispatchResult = {
    inapp: false,
    push: false,
    email: false,
    sms: false,
    whatsapp: false,
  };

  const requested = params.channels || ["inapp"];
  const wantAll = requested.includes("all");
  const channels = wantAll
    ? (["inapp", "push", "email", "sms", "whatsapp"] as NotificationChannel[])
    : requested;

  // Fetch preferences + user data
  const [preferences, user] = await Promise.all([
    NotificationPreference.findOne({ userId: params.userId }).lean(),
    User.findById(params.userId).select(
      "email phone phoneCountryCode pushSubscriptions whatsappNumber whatsappOptIn"
    ).lean(),
  ]);

  if (!user) return result;

  const quiet = preferences
    ? isInQuietHours(preferences)
    : false;

  // ---- In-App ----
  if (channels.includes("inapp")) {
    try {
      await Notification.create({
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || "",
        isRead: false,
      });
      result.inapp = true;
    } catch (err) {
      console.error("In-app notification failed:", err);
    }
  }

  // If quiet hours, skip all external channels
  if (quiet) return result;

  // ---- Push ----
  if (channels.includes("push") && user.pushSubscriptions?.length) {
    const pushEnabled = preferences
      ? preferences.push[pushPrefMap[params.type] as keyof typeof preferences.push] !== false
      : true;

    if (pushEnabled) {
      const subscriptions = user.pushSubscriptions as Array<{
        type: string;
        token?: string;
        endpoint?: string;
        keys?: { p256dh: string; auth: string };
      }>;

      for (const sub of subscriptions) {
        try {
          if (sub.type === "fcm" && sub.token) {
            await sendPushNotification(sub.token, params.title, params.message, {
              url: params.link || "/dashboard",
              type: params.type,
            });
          }
          // Web push subscriptions are handled via the web-push library
        } catch (err) {
          console.error("Push notification failed:", err);
        }
      }
      result.push = true;
    }
  }

  // ---- Email ----
  if (channels.includes("email") && user.email) {
    const emailEnabled = preferences
      ? preferences.email[emailPrefMap[params.type] as keyof typeof preferences.email] !== false
      : true;

    if (emailEnabled) {
      try {
        if (params.emailTemplate) {
          await sendTemplatedEmail({
            to: user.email,
            templateSlug: params.emailTemplate,
            variables: params.emailTemplateVariables || {},
            fallbackSubject: params.emailSubject || params.title,
            fallbackHtml: `<p>${params.message}</p>`,
          });
        } else {
          await sendEmail(
            user.email,
            params.emailSubject || params.title,
            params.emailHtml || buildDefaultEmailHtml(params)
          );
        }
        result.email = true;
      } catch (err) {
        console.error("Email notification failed:", err);
      }
    }
  }

  // ---- SMS ----
  if (channels.includes("sms") && user.phone) {
    const smsEnabled = preferences
      ? preferences.sms[smsPrefMap[params.type] as keyof typeof preferences.sms] !== false
      : true;

    if (smsEnabled) {
      try {
        await sendSMS({
          to: user.phone,
          message: params.smsMessage || params.message,
        });
        result.sms = true;
      } catch (err) {
        console.error("SMS notification failed:", err);
      }
    }
  }

  // ---- WhatsApp ----
  if (channels.includes("whatsapp") && user.whatsappNumber && user.whatsappOptIn) {
    const waEnabled = preferences
      ? preferences.whatsapp[whatsappPrefMap[params.type] as keyof typeof preferences.whatsapp] !== false
      : true;

    if (waEnabled) {
      try {
        await sendWhatsAppMessage({
          to: user.whatsappNumber,
          message: params.message,
        });
        result.whatsapp = true;
      } catch (err) {
        console.error("WhatsApp notification failed:", err);
      }
    }
  }

  return result;
}

/**
 * Build a default HTML email body from notification params.
 */
function buildDefaultEmailHtml(params: CreateNotificationParams): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://marriagemedia.com";
  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
      <div style="background:#e11d48;color:#fff;padding:20px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;font-size:22px;">Marriage Media</h1>
      </div>
      <div style="padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
        <h2 style="color:#1f2937;margin-top:0;">${params.title}</h2>
        <p style="color:#4b5563;line-height:1.6;">${params.message}</p>
        ${params.link ? `<a href="${appUrl}${params.link}" style="display:inline-block;background:#e11d48;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;margin-top:12px;">View Details</a>` : ""}
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Marriage Media - Find Your Perfect Life Partner</p>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Convenience Functions (high-level)
// ---------------------------------------------------------------------------

/**
 * Send an interest notification to a user.
 */
export async function notifyNewInterest(
  recipientUserId: string,
  senderName: string,
  link?: string
): Promise<NotificationDispatchResult> {
  return createNotification({
    userId: recipientUserId,
    type: "interest",
    title: "New Interest Received!",
    message: `${senderName} has sent you an interest. Check out their profile!`,
    link: link || "/dashboard/interests",
    channels: ["all"],
    emailTemplate: "new-interest",
    emailTemplateVariables: { recipientName: "", senderName },
    emailSubject: `New Interest from ${senderName} - Marriage Media`,
    smsMessage: `${senderName} has sent you an interest on Marriage Media! Log in to view.`,
  });
}

/**
 * Send a new message notification.
 */
export async function notifyNewMessage(
  recipientUserId: string,
  senderName: string,
  preview: string,
  link?: string
): Promise<NotificationDispatchResult> {
  return createNotification({
    userId: recipientUserId,
    type: "message",
    title: `New message from ${senderName}`,
    message: preview.length > 100 ? preview.substring(0, 100) + "..." : preview,
    link: link || "/dashboard/messages",
    channels: ["inapp", "push"],
  });
}

/**
 * Send a profile view notification.
 */
export async function notifyProfileView(
  ownerUserId: string,
  viewerName: string,
  link?: string
): Promise<NotificationDispatchResult> {
  return createNotification({
    userId: ownerUserId,
    type: "profile_view",
    title: "Profile Viewed",
    message: `${viewerName} viewed your profile.`,
    link: link || "/dashboard/analytics",
    channels: ["inapp", "push"],
  });
}

/**
 * Send a payment confirmation notification.
 */
export async function notifyPaymentConfirmation(
  userId: string,
  plan: string,
  amount: string,
  expiryDate: string,
  link?: string
): Promise<NotificationDispatchResult> {
  return createNotification({
    userId,
    type: "payment",
    title: "Payment Confirmed!",
    message: `Your ${plan} subscription (${amount}) has been activated. Expires: ${expiryDate}.`,
    link: link || "/dashboard",
    channels: ["all"],
    emailTemplate: "payment-confirmation",
    emailTemplateVariables: { name: "", plan, amount, expiryDate },
    emailSubject: `Payment Confirmed - ${plan} - Marriage Media`,
    smsMessage: `Your ${plan} subscription (${amount}) has been confirmed on Marriage Media.`,
  });
}

/**
 * Send a verification status notification.
 */
export async function notifyVerificationStatus(
  userId: string,
  status: "approved" | "rejected",
  link?: string
): Promise<NotificationDispatchResult> {
  const isApproved = status === "approved";
  return createNotification({
    userId,
    type: "verification",
    title: isApproved ? "Profile Verified!" : "Verification Update",
    message: isApproved
      ? "Congratulations! Your profile has been verified. You now have a verified badge."
      : "Your verification request was not approved. Please review and resubmit.",
    link: link || "/dashboard/verification",
    channels: ["all"],
    emailTemplate: isApproved ? "verification-approved" : undefined,
    emailSubject: isApproved
      ? "Your Profile Has Been Verified!"
      : "Verification Update - Marriage Media",
    smsMessage: isApproved
      ? "Your Marriage Media profile has been verified!"
      : "Marriage Media: Your verification request was not approved. Please check your account.",
  });
}

/**
 * Send a system announcement notification.
 */
export async function notifySystem(
  userId: string,
  title: string,
  message: string,
  link?: string
): Promise<NotificationDispatchResult> {
  return createNotification({
    userId,
    type: "system",
    title,
    message,
    link,
    channels: ["inapp", "push", "email"],
  });
}

/**
 * Send a promotional notification.
 */
export async function notifyPromotion(
  userId: string,
  title: string,
  message: string,
  link?: string
): Promise<NotificationDispatchResult> {
  return createNotification({
    userId,
    type: "promotion",
    title,
    message,
    link,
    channels: ["inapp", "push", "email"],
  });
}

// ---------------------------------------------------------------------------
// Query Functions
// ---------------------------------------------------------------------------

/**
 * Get user notifications with pagination.
 */
export async function getUserNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  await connectToDatabase();

  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId }),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    unreadCount,
  };
}

/**
 * Mark notifications as read.
 */
export async function markNotificationsRead(
  userId: string,
  notificationIds?: string[]
): Promise<void> {
  await connectToDatabase();

  const filter: Record<string, unknown> = { userId, isRead: false };
  if (notificationIds && notificationIds.length > 0) {
    filter._id = { $in: notificationIds };
  }

  await Notification.updateMany(filter, {
    isRead: true,
    readAt: new Date(),
  });
}

/**
 * Delete notifications for a user.
 */
export async function deleteNotifications(
  userId: string,
  notificationIds?: string[]
): Promise<void> {
  await connectToDatabase();

  if (notificationIds && notificationIds.length > 0) {
    await Notification.deleteMany({ _id: { $in: notificationIds }, userId });
  } else {
    await Notification.deleteMany({ userId });
  }
}