/**
 * SMS Notification Service
 * Supports: Twilio, and a generic HTTP SMS provider fallback.
 *
 * Environment variables:
 *   SMS_PROVIDER=twilio | http
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER
 *   SMS_API_URL (for http provider)
 *   SMS_API_KEY (for http provider)
 */

interface SendSMSParams {
  to: string;
  message: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an SMS via the configured provider.
 */
export async function sendSMS(params: SendSMSParams): Promise<SMSResult> {
  const provider = process.env.SMS_PROVIDER || "twilio";

  try {
    if (provider === "twilio") {
      return await sendViaTwilio(params);
    }
    return await sendViaHttpProvider(params);
  } catch (error) {
    console.error("SMS send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown SMS error",
    };
  }
}

/**
 * Send SMS via Twilio REST API.
 */
async function sendViaTwilio(params: SendSMSParams): Promise<SMSResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("Twilio credentials not configured, skipping SMS");
    return { success: false, error: "Twilio not configured" };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: params.to,
      From: fromNumber,
      Body: params.message,
    }),
  });

  const data = await response.json();

  if (response.ok && data.sid) {
    return { success: true, messageId: data.sid };
  }

  return {
    success: false,
    error: data.message || "Twilio SMS failed",
  };
}

/**
 * Send SMS via a generic HTTP SMS provider (e.g., Twilio Verify, MSG91, etc.)
 */
async function sendViaHttpProvider(params: SendSMSParams): Promise<SMSResult> {
  const apiUrl = process.env.SMS_API_URL;
  const apiKey = process.env.SMS_API_KEY;

  if (!apiUrl) {
    console.warn("SMS API URL not configured, skipping SMS");
    return { success: false, error: "SMS provider not configured" };
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      to: params.to,
      message: params.message,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (response.ok) {
    return { success: true, messageId: data.messageId || `sms_${Date.now()}` };
  }

  return {
    success: false,
    error: data.error || "SMS provider request failed",
  };
}

/**
 * Format a Bangladeshi phone number to E.164 format.
 */
export function formatPhoneE164(phone: string, countryCode: string = "+880"): string {
  const cleaned = phone.replace(/[^\d]/g, "");
  if (cleaned.startsWith("880")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `${countryCode}${cleaned}`;
  }
  return `${countryCode}${cleaned}`;
}

/**
 * Send an interest notification SMS.
 */
export async function sendInterestSMS(
  phone: string,
  senderName: string,
  countryCode?: string
): Promise<SMSResult> {
  const formatted = formatPhoneE164(phone, countryCode);
  return sendSMS({
    to: formatted,
    message: `${senderName} has sent you an interest on Marriage Media! Log in to view details.`,
  });
}

/**
 * Send a payment confirmation SMS.
 */
export async function sendPaymentSMS(
  phone: string,
  plan: string,
  amount: string,
  countryCode?: string
): Promise<SMSResult> {
  const formatted = formatPhoneE164(phone, countryCode);
  return sendSMS({
    to: formatted,
    message: `Your ${plan} subscription (${amount}) has been confirmed on Marriage Media. Enjoy your premium features!`,
  });
}

/**
 * Send a security alert SMS.
 */
export async function sendSecurityAlertSMS(
  phone: string,
  message: string,
  countryCode?: string
): Promise<SMSResult> {
  const formatted = formatPhoneE164(phone, countryCode);
  return sendSMS({
    to: formatted,
    message: `[Marriage Media Security] ${message}`,
  });
}

/**
 * Send a verification code SMS.
 */
export async function sendVerificationCodeSMS(
  phone: string,
  code: string,
  countryCode?: string
): Promise<SMSResult> {
  const formatted = formatPhoneE164(phone, countryCode);
  return sendSMS({
    to: formatted,
    message: `Your Marriage Media verification code is: ${code}. It expires in 10 minutes. Do not share this code.`,
  });
}