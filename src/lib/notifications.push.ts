/**
 * Browser Push Notification Service (FCM / Web Push)
 *
 * Server-side push notification sending via Firebase Cloud Messaging (HTTP v1 API)
 * and web-push for standard Push API subscriptions.
 *
 * Environment variables:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_PRIVATE_KEY
 *   FIREBASE_CLIENT_EMAIL
 *   VAPID_PUBLIC_KEY  (client-side only)
 *   VAPID_PRIVATE_KEY (server-side)
 *   VAPID_EMAIL
 */

import webPush from "web-push";

// ---------------------------------------------------------------------------
// Firebase Cloud Messaging (HTTP v1)
// ---------------------------------------------------------------------------

/**
 * Send a push notification via Firebase Cloud Messaging HTTP v1 API.
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
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: { title, body },
            data: data || {},
            webpush: {
              headers: { TTL: "86400" },
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

  const header = Buffer.from(
    JSON.stringify({ algorithm: "RS256", typ: "JWT" })
  ).toString("base64url");

  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  ).toString("base64url");

  const message = `${header}.${payload}`;

  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(message);
  const signature = sign.sign(privateKey, "base64url");

  const jwt = `${message}.${signature}`;

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

// ---------------------------------------------------------------------------
// Web Push (standard Push API via web-push library)
// ---------------------------------------------------------------------------

/**
 * Initialize web-push with VAPID keys if configured.
 */
function getWebPushConfigured(): boolean {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL;

  if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
    return false;
  }

  try {
    webPush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Send a web-push notification to a standard Push API subscription.
 */
export async function sendWebPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  if (!getWebPushConfigured()) {
    console.warn("Web push not configured (missing VAPID keys)");
    return false;
  }

  try {
    const payload = JSON.stringify({ title, body, data: data || {} });
    await webPush.sendNotification(subscription, payload);
    return true;
  } catch (error) {
    console.error("Web push notification failed:", error);
    return false;
  }
}

/**
 * Send push notifications to all of a user's subscriptions (both FCM and web push).
 */
export async function sendPushToUser(
  pushSubscriptions: Array<{
    type: string;
    token?: string;
    endpoint?: string;
    keys?: { p256dh: string; auth: string };
  }>,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const sub of pushSubscriptions) {
    try {
      if (sub.type === "fcm" && sub.token) {
        const ok = await sendPushNotification(sub.token, title, body, data);
        if (ok) sent++; else failed++;
      } else if (sub.type === "webpush" && sub.endpoint && sub.keys) {
        const ok = await sendWebPushNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          title,
          body,
          data
        );
        if (ok) sent++; else failed++;
      }
    } catch {
      failed++;
    }
  }

  return { sent, failed };
}