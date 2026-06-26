/**
 * Push Notification Service
 * Supports: Browser Push (FCM), Email, In-App notifications
 */

import connectToDatabase from "./mongodb";
import { Notification, NotificationPreference } from "@/models";

// Map our detailed types to the existing model types
type AppNotificationType = "interest" | "message" | "profile_view" | "payment" | "verification" | "system" | "promotion";

export interface CreateNotificationParams {
  userId: string;
  type: AppNotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create an in-app notification.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<void> {
  await connectToDatabase();

  // Check user preferences to see if this type is enabled
  const preferences = await NotificationPreference.findOne({
    userId: params.userId,
  }).lean();

  if (preferences) {
    // Check quiet hours
    if (preferences.quietHoursEnabled) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [startHour, startMin] = preferences.quietHoursStart.split(":").map(Number);
      const [endHour, endMin] = preferences.quietHoursEnd.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      // Handle quiet hours that span midnight
      if (startMinutes > endMinutes) {
        if (currentTime >= startMinutes || currentTime < endMinutes) {
          return; // In quiet hours
        }
      } else {
        if (currentTime >= startMinutes && currentTime < endMinutes) {
          return; // In quiet hours
        }
      }
    }

    // Check email preferences
    const emailPrefMap: Record<string, keyof typeof preferences.email> = {
      interest: "interests",
      message: "messages",
      profile_view: "profileViews",
      payment: "payments",
      verification: "security",
      system: "newsletters",
      promotion: "promotions",
    };

    const emailKey = emailPrefMap[params.type];
    if (emailKey && preferences.email[emailKey] === false) {
      // User has disabled email for this type, but still create in-app notification
    }
  }

  // Create in-app notification
  await Notification.create({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link || "",
    isRead: false,
  });
}

/**
 * Send browser push notification via FCM.
 */
export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.warn("Firebase not configured, skipping push notification");
    return false;
  }

  try {
    const accessToken = await getFirebaseAccessToken();

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: {
              title,
              body,
            },
            data: data || {},
            webpush: {
              headers: {
                TTL: "86400",
              },
              notification: {
                title,
                body,
                icon: "/icons/icon-192x192.png",
                badge: "/icons/badge-72x72.png",
                vibrate: [100, 50, 100],
              },
            },
          },
        }),
      }
    );

    const result = await response.json();
    return !!result.name;
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return false;
  }
}

/**
 * Get Firebase access token using service account credentials.
 */
async function getFirebaseAccessToken(): Promise<string> {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error("Firebase credentials not configured");
  }

  // Create JWT for Firebase Auth
  const header = Buffer.from(JSON.stringify({
    algorithm: "RS256",
    typ: "JWT",
  })).toString("base64url");

  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })).toString("base64url");

  const message = `${header}.${payload}`;

  // Sign with private key
  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(message);
  const signature = sign.sign(privateKey, "base64url");

  const jwt = `${message}.${signature}`;

  // Exchange JWT for access token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Failed to get Firebase access token");
  }

  return data.access_token;
}

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