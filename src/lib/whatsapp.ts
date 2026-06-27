/**
 * WhatsApp Notification Service
 * Uses WhatsApp Business API (Cloud API by Meta).
 *
 * Environment variables:
 *   WHATSAPP_API_URL=https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages
 *   WHATSAPP_ACCESS_TOKEN=your-whatsapp-business-access-token
 *   WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
 */

interface SendWhatsAppParams {
  to: string; // E.164 format
  templateName?: string;
  languageCode?: string;
  templateParams?: string[];
  message?: string; // For free-form messages (within 24h window)
}

interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a WhatsApp message via the WhatsApp Business Cloud API.
 */
export async function sendWhatsAppMessage(
  params: SendWhatsAppParams
): Promise<WhatsAppResult> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!apiUrl || !accessToken) {
    console.warn("WhatsApp Business API not configured, skipping WhatsApp message");
    return { success: false, error: "WhatsApp not configured" };
  }

  try {
    // Clean phone number (remove + prefix for WhatsApp API)
    const toNumber = params.to.replace(/[^\d]/g, "");

    // Use template message (for outbound messages outside 24h window)
    if (params.templateName) {
      return await sendTemplateMessage(toNumber, params, apiUrl, accessToken);
    }

    // Use free-form text message (within 24h customer service window)
    if (params.message) {
      return await sendTextMessage(toNumber, params.message, apiUrl, accessToken);
    }

    return { success: false, error: "No template or message provided" };
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "WhatsApp send failed",
    };
  }
}

/**
 * Send a template-based WhatsApp message (for proactive notifications).
 */
async function sendTemplateMessage(
  toNumber: string,
  params: SendWhatsAppParams,
  apiUrl: string,
  accessToken: string
): Promise<WhatsAppResult> {
  const languageCode = params.languageCode || "en";

  const body: Record<string, unknown> = {
    messaging_product: "whatsapp",
    to: toNumber,
    type: "template",
    template: {
      name: params.templateName,
      language: { code: languageCode },
    },
  };

  // Add template parameters if provided
  if (params.templateParams && params.templateParams.length > 0) {
    (body.template as Record<string, unknown>).components = [
      {
        type: "body",
        parameters: params.templateParams.map((param) => ({
          type: "text",
          text: param,
        })),
      },
    ];
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (response.ok && data.messages?.[0]?.id) {
    return { success: true, messageId: data.messages[0].id };
  }

  return {
    success: false,
    error: data.error?.message || "WhatsApp template message failed",
  };
}

/**
 * Send a free-form text WhatsApp message (within 24h window).
 */
async function sendTextMessage(
  toNumber: string,
  message: string,
  apiUrl: string,
  accessToken: string
): Promise<WhatsAppResult> {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toNumber,
      type: "text",
      text: { body: message },
    }),
  });

  const data = await response.json();

  if (response.ok && data.messages?.[0]?.id) {
    return { success: true, messageId: data.messages[0].id };
  }

  return {
    success: false,
    error: data.error?.message || "WhatsApp text message failed",
  };
}

/**
 * Send interest notification via WhatsApp.
 */
export async function sendInterestWhatsApp(
  phone: string,
  senderName: string,
  countryCode?: string
): Promise<WhatsAppResult> {
  const formatted = phone.replace(/[^\d]/g, "");
  const toNumber = formatted.startsWith("880") || formatted.startsWith("1")
    ? `+${formatted}`
    : `${countryCode || "+880"}${formatted}`;

  return sendWhatsAppMessage({
    to: toNumber,
    templateName: "new_interest",
    languageCode: "en",
    templateParams: [senderName],
    message: `${senderName} has sent you an interest on Marriage Media! Open the app to view their profile and respond.`,
  });
}

/**
 * Send payment confirmation via WhatsApp.
 */
export async function sendPaymentWhatsApp(
  phone: string,
  plan: string,
  amount: string,
  countryCode?: string
): Promise<WhatsAppResult> {
  const formatted = phone.replace(/[^\d]/g, "");
  const toNumber = formatted.startsWith("880") || formatted.startsWith("1")
    ? `+${formatted}`
    : `${countryCode || "+880"}${formatted}`;

  return sendWhatsAppMessage({
    to: toNumber,
    templateName: "payment_confirmation",
    languageCode: "en",
    templateParams: [plan, amount],
    message: `Your ${plan} subscription (${amount}) has been confirmed on Marriage Media. Enjoy your premium features!`,
  });
}

/**
 * Send security alert via WhatsApp.
 */
export async function sendSecurityWhatsApp(
  phone: string,
  message: string,
  countryCode?: string
): Promise<WhatsAppResult> {
  const formatted = phone.replace(/[^\d]/g, "");
  const toNumber = formatted.startsWith("880") || formatted.startsWith("1")
    ? `+${formatted}`
    : `${countryCode || "+880"}${formatted}`;

  return sendWhatsAppMessage({
    to: toNumber,
    templateName: "security_alert",
    languageCode: "en",
    templateParams: [message],
    message: `[Marriage Media Security] ${message}`,
  });
}