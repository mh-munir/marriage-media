/**
 * Email sending utility.
 * In production, integrate with SendGrid, AWS SES, or Resend.
 * This provides a mock implementation with template rendering.
 */

import connectToDatabase from "./mongodb";
import { EmailTemplate } from "@/models";

interface SendEmailParams {
  to: string;
  templateSlug: string;
  variables: Record<string, string>;
  fallbackSubject?: string;
  fallbackHtml?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Render a template by replacing {{variable}} placeholders.
 */
function renderTemplate(
  content: string,
  variables: Record<string, string>
): string {
  let rendered = content;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    rendered = rendered.replace(regex, value);
  }
  return rendered;
}

/**
 * Send an email using a stored template.
 */
export async function sendTemplatedEmail(
  params: SendEmailParams
): Promise<EmailResult> {
  try {
    await connectToDatabase();

    const template = await EmailTemplate.findOne({
      slug: params.templateSlug,
      isActive: true,
    });

    let subject: string;
    let htmlContent: string;

    if (template) {
      subject = renderTemplate(template.subject, params.variables);
      htmlContent = renderTemplate(template.htmlContent, params.variables);

      // Update usage stats
      await EmailTemplate.findByIdAndUpdate(template._id, {
        $inc: { usageCount: 1 },
        lastUsedAt: new Date(),
      });
    } else if (params.fallbackSubject && params.fallbackHtml) {
      subject = renderTemplate(params.fallbackSubject, params.variables);
      htmlContent = renderTemplate(params.fallbackHtml, params.variables);
    } else {
      return { success: false, error: "Template not found and no fallback provided" };
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM_EMAIL;
    if (resendApiKey && resendFrom) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: resendFrom, to: [params.to], subject, html: htmlContent }),
      });
      if (!response.ok) {
        const details = await response.text();
        return { success: false, error: `Email provider rejected the message: ${details}` };
      }
      const result = (await response.json()) as { id?: string };
      return { success: true, messageId: result.id || `msg_${Date.now()}` };
    }

    if (process.env.NODE_ENV === "production") {
      return { success: false, error: "Email provider is not configured." };
    }

    console.log(`[Email] Sent to ${params.to}: ${subject}`);

    return { success: true, messageId: `msg_${Date.now()}` };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a simple email without a template.
 */
export async function sendEmail(
  to: string,
  subject: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _htmlContent: string
): Promise<EmailResult> {
  try {
    console.log(`[Email] Sent to ${to}: ${subject}`);
    return { success: true, messageId: `msg_${Date.now()}` };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send welcome email to new user.
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<EmailResult> {
  return sendTemplatedEmail({
    to: email,
    templateSlug: "welcome",
    variables: { name, email },
    fallbackSubject: "Welcome to Marriage Media!",
    fallbackHtml: `
      <h1>Welcome to Marriage Media, ${name}!</h1>
      <p>We're excited to have you on board. Start your journey to find your perfect life partner.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://marriagemedia.com"}/dashboard">Complete Your Profile</a></p>
    `,
  });
}

/**
 * Send verification approval email.
 */
export async function sendVerificationApprovedEmail(
  email: string,
  name: string
): Promise<EmailResult> {
  return sendTemplatedEmail({
    to: email,
    templateSlug: "verification-approved",
    variables: { name },
    fallbackSubject: "Your Profile Has Been Verified!",
    fallbackHtml: `
      <h1>Congratulations, ${name}!</h1>
      <p>Your profile has been verified. You now have a verified badge on your profile.</p>
    `,
  });
}

/**
 * Send payment confirmation email.
 */
export async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  plan: string,
  amount: string,
  expiryDate: string
): Promise<EmailResult> {
  return sendTemplatedEmail({
    to: email,
    templateSlug: "payment-confirmation",
    variables: { name, plan, amount, expiryDate },
    fallbackSubject: "Payment Confirmed - Marriage Media",
    fallbackHtml: `
      <h1>Payment Confirmed!</h1>
      <p>Hi ${name},</p>
      <p>Your ${plan} subscription has been activated. It expires on ${expiryDate}.</p>
      <p>Amount: ${amount}</p>
    `,
  });
}

/**
 * Send password reset email.
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
): Promise<EmailResult> {
  return sendTemplatedEmail({
    to: email,
    templateSlug: "password-reset",
    variables: { name, resetLink },
    fallbackSubject: "Reset Your Password - Marriage Media",
    fallbackHtml: `
      <h1>Password Reset Request</h1>
      <p>Hi ${name},</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
    `,
  });
}

/**
 * Send new interest notification email.
 */
export async function sendInterestNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string
): Promise<EmailResult> {
  return sendTemplatedEmail({
    to: recipientEmail,
    templateSlug: "new-interest",
    variables: { recipientName, senderName },
    fallbackSubject: "New Interest Received - Marriage Media",
    fallbackHtml: `
      <h1>New Interest!</h1>
      <p>Hi ${recipientName},</p>
      <p>${senderName} has sent you an interest. Check it out!</p>
    `,
  });
}

/**
 * Seed default email templates in the database.
 */
export async function seedDefaultTemplates(
  adminUserId: string
): Promise<void> {
  await connectToDatabase();

  const templates = [
    {
      name: "Welcome Email",
      slug: "welcome",
      subject: "Welcome to Marriage Media, {{name}}!",
      htmlContent: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #e11d48;">Welcome to Marriage Media!</h1>
          <p>Hi {{name}},</p>
          <p>Thank you for joining Marriage Media, Bangladesh's most trusted matrimony platform.</p>
          <p>Start your journey to find your perfect life partner today.</p>
          <a href="{{appUrl}}/dashboard" style="display: inline-block; background: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Complete Your Profile</a>
          <p style="margin-top: 24px; color: #666;">If you have any questions, reply to this email.</p>
        </div>
      `,
      variables: ["name", "appUrl"],
      category: "transactional" as const,
    },
    {
      name: "Password Reset",
      slug: "password-reset",
      subject: "Reset Your Password - Marriage Media",
      htmlContent: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1>Password Reset</h1>
          <p>Hi {{name}},</p>
          <p>Click below to reset your password. This link expires in 1 hour.</p>
          <a href="{{resetLink}}" style="display: inline-block; background: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Reset Password</a>
          <p style="margin-top: 24px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
      variables: ["name", "resetLink"],
      category: "security" as const,
    },
    {
      name: "Payment Confirmation",
      slug: "payment-confirmation",
      subject: "Payment Confirmed - Marriage Media",
      htmlContent: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #e11d48;">Payment Confirmed!</h1>
          <p>Hi {{name}},</p>
          <p>Your <strong>{{plan}}</strong> subscription has been activated.</p>
          <p>Amount: {{amount}} | Expires: {{expiryDate}}</p>
          <p>Enjoy your premium features!</p>
        </div>
      `,
      variables: ["name", "plan", "amount", "expiryDate"],
      category: "transactional" as const,
    },
    {
      name: "Verification Approved",
      slug: "verification-approved",
      subject: "Your Profile Has Been Verified!",
      htmlContent: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #e11d48;">Congratulations, {{name}}!</h1>
          <p>Your profile has been verified. You now have a verified badge.</p>
          <p>Verified profiles get 3x more views and interests.</p>
        </div>
      `,
      variables: ["name"],
      category: "notification" as const,
    },
    {
      name: "New Interest",
      slug: "new-interest",
      subject: "New Interest Received - Marriage Media",
      htmlContent: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1>New Interest!</h1>
          <p>Hi {{recipientName}},</p>
          <p><strong>{{senderName}}</strong> has sent you an interest.</p>
          <a href="{{appUrl}}/dashboard/interests" style="display: inline-block; background: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Interest</a>
        </div>
      `,
      variables: ["recipientName", "senderName", "appUrl"],
      category: "notification" as const,
    },
  ];

  for (const template of templates) {
    await EmailTemplate.findOneAndUpdate(
      { slug: template.slug },
      { ...template, createdBy: adminUserId, isActive: true },
      { upsert: true }
    );
  }
}