/**
 * Payment Gateway integration supporting multiple providers.
 * Supports: Stripe, SSLCommerz, bKash, Nagad, PayPal
 */

import { generateTransactionId, generateInvoiceNumber } from "./auth";

export type PaymentProvider = "stripe" | "sslcommerz" | "bkash" | "nagad" | "paypal";

export interface PaymentPlan {
  id: string;
  name: string;
  tier: "silver" | "gold" | "platinum";
  price: number;
  currency: string;
  duration: number; // days
  features: string[];
}

export interface PaymentInitRequest {
  userId: string;
  plan: PaymentPlan;
  provider: PaymentProvider;
  billingInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  successUrl: string;
  cancelUrl: string;
  ipAddress?: string;
}

export interface PaymentInitResponse {
  success: boolean;
  transactionId: string;
  invoiceNumber: string;
  paymentUrl?: string;
  gatewayData?: Record<string, unknown>;
  error?: string;
}

export interface PaymentVerifyRequest {
  provider: PaymentProvider;
  transactionId: string;
  invoiceNumber: string;
  gatewayTransactionId?: string;
  payload?: Record<string, unknown>;
}

export interface PaymentVerifyResponse {
  success: boolean;
  status: "completed" | "failed" | "pending";
  amount?: number;
  currency?: string;
  error?: string;
}

/**
 * Initialize a payment with the specified provider.
 */
export async function initPayment(
  request: PaymentInitRequest
): Promise<PaymentInitResponse> {
  const transactionId = generateTransactionId();
  const invoiceNumber = generateInvoiceNumber();

  switch (request.provider) {
    case "stripe":
      return initStripePayment(request, transactionId, invoiceNumber);
    case "sslcommerz":
      return initSSLCommerzPayment(request, transactionId, invoiceNumber);
    case "bkash":
      return initBkashPayment(request, transactionId, invoiceNumber);
    case "nagad":
      return initNagadPayment(request, transactionId, invoiceNumber);
    case "paypal":
      return initPayPalPayment(request, transactionId, invoiceNumber);
    default:
      return { success: false, transactionId, invoiceNumber, error: "Unsupported payment provider" };
  }
}

/**
 * Verify a payment with the specified provider.
 */
export async function verifyPayment(
  request: PaymentVerifyRequest
): Promise<PaymentVerifyResponse> {
  switch (request.provider) {
    case "stripe":
      return verifyStripePayment(request);
    case "sslcommerz":
      return verifySSLCommerzPayment(request);
    case "bkash":
      return verifyBkashPayment(request);
    case "nagad":
      return verifyNagadPayment(request);
    case "paypal":
      return verifyPayPalPayment(request);
    default:
      return { success: false, status: "failed", error: "Unsupported payment provider" };
  }
}

function buildPaymentCallbackUrl(successUrl: string, provider: PaymentProvider, transactionId: string): string {
  const callbackUrl = new URL("/api/payment/webhook", successUrl);
  callbackUrl.searchParams.set("provider", provider);
  callbackUrl.searchParams.set("transactionId", transactionId);
  return callbackUrl.toString();
}

async function getPayPalAccessToken(baseUrl: string, clientId: string, clientSecret: string): Promise<string | null> {
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  const result = await response.json();
  return response.ok && typeof result.access_token === "string" ? result.access_token : null;
}

// ==================== Stripe ====================

async function initStripePayment(
  request: PaymentInitRequest,
  transactionId: string,
  invoiceNumber: string
): Promise<PaymentInitResponse> {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return { success: false, transactionId, invoiceNumber, error: "Stripe not configured" };
    }

    // Stripe checkout session creation
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "payment",
        "success_url": `${buildPaymentCallbackUrl(request.successUrl, "stripe", transactionId)}&session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url": request.cancelUrl,
        "customer_email": request.billingInfo.email,
        "metadata[transactionId]": transactionId,
        "metadata[invoiceNumber]": invoiceNumber,
        "metadata[userId]": request.userId,
        "metadata[plan]": request.plan.id,
        "line_items[0][price_data][currency]": request.plan.currency.toLowerCase(),
        "line_items[0][price_data][product_data][name]": request.plan.name,
        "line_items[0][price_data][unit_amount]": (request.plan.price * 100).toString(),
        "line_items[0][quantity]": "1",
      }),
    });

    const session = await response.json();

    if (session.id) {
      return {
        success: true,
        transactionId,
        invoiceNumber,
        paymentUrl: session.url,
        gatewayData: { sessionId: session.id },
      };
    }

    return {
      success: false,
      transactionId,
      invoiceNumber,
      error: session.error?.message || "Failed to create Stripe session",
    };
  } catch (error) {
    return {
      success: false,
      transactionId,
      invoiceNumber,
      error: error instanceof Error ? error.message : "Stripe initialization failed",
    };
  }
}

async function verifyStripePayment(
  request: PaymentVerifyRequest
): Promise<PaymentVerifyResponse> {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return { success: false, status: "failed", error: "Stripe not configured" };
    }

    if (request.gatewayTransactionId) {
      const response = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${request.gatewayTransactionId}`,
        {
          headers: { "Authorization": `Bearer ${stripeKey}` },
        }
      );
      const session = await response.json();

      if (
        session.payment_status === "paid" &&
        session.metadata?.transactionId === request.transactionId &&
        session.metadata?.invoiceNumber === request.invoiceNumber
      ) {
        return {
          success: true,
          status: "completed",
          amount: session.amount_total ? session.amount_total / 100 : undefined,
          currency: session.currency?.toUpperCase(),
        };
      }
    }

    return { success: false, status: "failed", error: "Payment not confirmed" };
  } catch (error) {
    return {
      success: false,
      status: "failed",
      error: error instanceof Error ? error.message : "Stripe verification failed",
    };
  }
}

// ==================== SSLCommerz ====================

async function initSSLCommerzPayment(
  request: PaymentInitRequest,
  transactionId: string,
  invoiceNumber: string
): Promise<PaymentInitResponse> {
  try {
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePass = process.env.SSLCOMMERZ_STORE_PASS;
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";

    if (!storeId || !storePass) {
      return { success: false, transactionId, invoiceNumber, error: "SSLCommerz not configured" };
    }

    const baseUrl = isLive
      ? "https://securepay.sslcommerz.com"
      : "https://sandbox.sslcommerz.com";

    const response = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        store_id: storeId,
        store_passwd: storePass,
        total_amount: request.plan.price.toString(),
        currency: request.plan.currency,
        tran_id: transactionId,
        success_url: buildPaymentCallbackUrl(request.successUrl, "sslcommerz", transactionId),
        fail_url: request.cancelUrl,
        cancel_url: request.cancelUrl,
        ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook?provider=sslcommerz`,
        cus_name: request.billingInfo.name,
        cus_email: request.billingInfo.email,
        cus_phone: request.billingInfo.phone || "",
        cus_add1: request.billingInfo.address || "",
        product_name: request.plan.name,
        product_category: "subscription",
        product_profile: "non-physical-goods",
      }),
    });

    const result = await response.json();

    if (result.status === "SUCCESS" || result.GatewayPageURL) {
      return {
        success: true,
        transactionId,
        invoiceNumber,
        paymentUrl: result.GatewayPageURL,
        gatewayData: { sessionKey: result.sessionkey },
      };
    }

    return {
      success: false,
      transactionId,
      invoiceNumber,
      error: result.failedreason || "Failed to initialize SSLCommerz",
    };
  } catch (error) {
    return {
      success: false,
      transactionId,
      invoiceNumber,
      error: error instanceof Error ? error.message : "SSLCommerz initialization failed",
    };
  }
}

async function verifySSLCommerzPayment(
  request: PaymentVerifyRequest
): Promise<PaymentVerifyResponse> {
  try {
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePass = process.env.SSLCOMMERZ_STORE_PASS;
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";

    if (!storeId || !storePass) {
      return { success: false, status: "failed", error: "SSLCommerz not configured" };
    }

    const baseUrl = isLive
      ? "https://securepay.sslcommerz.com"
      : "https://sandbox.sslcommerz.com";

    const response = await fetch(`${baseUrl}/validator/api/validationserver.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        store_id: storeId,
        store_passwd: storePass,
        val_id: request.gatewayTransactionId || request.transactionId,
      }),
    });

    const result = await response.json();

    if (
      (result.status === "VALID" || result.status === "VALIDATED") &&
      result.tran_id === request.transactionId
    ) {
      return {
        success: true,
        status: "completed",
        amount: parseFloat(result.amount),
        currency: result.currency,
      };
    }

    return { success: false, status: "failed", error: "Payment validation failed" };
  } catch (error) {
    return {
      success: false,
      status: "failed",
      error: error instanceof Error ? error.message : "SSLCommerz verification failed",
    };
  }
}

// ==================== bKash ====================

async function initBkashPayment(
  request: PaymentInitRequest,
  transactionId: string,
  invoiceNumber: string
): Promise<PaymentInitResponse> {
  try {
    const appKey = process.env.BKASH_APP_KEY;
    const appSecret = process.env.BKASH_APP_SECRET;
    const username = process.env.BKASH_USERNAME;
    const password = process.env.BKASH_PASSWORD;
    const baseUrl = process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

    if (!appKey || !appSecret || !username || !password) {
      return { success: false, transactionId, invoiceNumber, error: "bKash not configured" };
    }

    // Get access token
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "username": username,
        "password": password,
      },
      body: JSON.stringify({ app_key: appKey, app_secret: appSecret }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.id_token) {
      return { success: false, transactionId, invoiceNumber, error: "bKash authentication failed" };
    }

    // Create payment
    const paymentResponse = await fetch(`${baseUrl}/checkout/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenData.id_token}`,
      },
      body: JSON.stringify({
        app_key: appKey,
        amount: request.plan.price.toString(),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: invoiceNumber,
        payerReference: request.billingInfo.phone || request.billingInfo.email,
        callbackURL: buildPaymentCallbackUrl(request.successUrl, "bkash", transactionId),
      }),
    });

    const paymentData = await paymentResponse.json();

    if (paymentData.bkashURL) {
      return {
        success: true,
        transactionId,
        invoiceNumber,
        paymentUrl: paymentData.bkashURL,
        gatewayData: { paymentID: paymentData.paymentID },
      };
    }

    return {
      success: false,
      transactionId,
      invoiceNumber,
      error: paymentData.errorMessage || "Failed to initialize bKash payment",
    };
  } catch (error) {
    return {
      success: false,
      transactionId,
      invoiceNumber,
      error: error instanceof Error ? error.message : "bKash initialization failed",
    };
  }
}

async function verifyBkashPayment(
  request: PaymentVerifyRequest
): Promise<PaymentVerifyResponse> {
  try {
    const appKey = process.env.BKASH_APP_KEY;
    const appSecret = process.env.BKASH_APP_SECRET;
    const username = process.env.BKASH_USERNAME;
    const password = process.env.BKASH_PASSWORD;
    const baseUrl = process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

    if (!appKey || !appSecret || !username || !password) {
      return { success: false, status: "failed", error: "bKash not configured" };
    }

    // Get access token
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "username": username,
        "password": password,
      },
      body: JSON.stringify({ app_key: appKey, app_secret: appSecret }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.id_token) {
      return { success: false, status: "failed", error: "bKash authentication failed" };
    }

    // Execute payment
    if (request.gatewayTransactionId) {
      const execResponse = await fetch(`${baseUrl}/checkout/payment/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenData.id_token}`,
        },
        body: JSON.stringify({
          app_key: appKey,
          paymentID: request.gatewayTransactionId,
        }),
      });

      const execData = await execResponse.json();

      if (
        execData.transactionStatus === "Completed" &&
        execData.paymentID === request.gatewayTransactionId &&
        execData.merchantInvoiceNumber === request.invoiceNumber
      ) {
        return {
          success: true,
          status: "completed",
          amount: parseFloat(execData.amount),
          currency: execData.currency,
        };
      }
    }

    return { success: false, status: "failed", error: "bKash payment not confirmed" };
  } catch (error) {
    return {
      success: false,
      status: "failed",
      error: error instanceof Error ? error.message : "bKash verification failed",
    };
  }
}

// ==================== Nagad ====================

async function initNagadPayment(
  request: PaymentInitRequest,
  transactionId: string,
  invoiceNumber: string
): Promise<PaymentInitResponse> {
  try {
    // Nagad integration placeholder - requires Nagad merchant credentials
    const merchantId = process.env.NAGAD_MERCHANT_ID;
    const publicKey = process.env.NAGAD_PUBLIC_KEY;

    if (!merchantId || !publicKey) {
      return { success: false, transactionId, invoiceNumber, error: "Nagad not configured" };
    }

    const baseUrl = process.env.NAGAD_BASE_URL || "https://sandbox.nagad.com.bd";

    const response = await fetch(`${baseUrl}/api/merchant/initsession`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PAYMENT-SDK": "true",
        "Authorization": `Bearer ${publicKey}`,
      },
      body: JSON.stringify({
        merchantId,
        amount: request.plan.price,
        currency: "BDT",
        orderReference: invoiceNumber,
        transactionReference: transactionId,
        callbackURL: buildPaymentCallbackUrl(request.successUrl, "nagad", transactionId),
        merchantCallbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook?provider=nagad`,
      }),
    });

    const result = await response.json();

    if (result.callbackUrl) {
      return {
        success: true,
        transactionId,
        invoiceNumber,
        paymentUrl: result.callbackUrl,
        gatewayData: { sessionToken: result.sensitiveData },
      };
    }

    return {
      success: false,
      transactionId,
      invoiceNumber,
      error: result.reason || "Failed to initialize Nagad payment",
    };
  } catch (error) {
    return {
      success: false,
      transactionId,
      invoiceNumber,
      error: error instanceof Error ? error.message : "Nagad initialization failed",
    };
  }
}

async function verifyNagadPayment(
  request: PaymentVerifyRequest
): Promise<PaymentVerifyResponse> {
  try {
    const merchantId = process.env.NAGAD_MERCHANT_ID;
    const publicKey = process.env.NAGAD_PUBLIC_KEY;

    if (!merchantId || !publicKey) {
      return { success: false, status: "failed", error: "Nagad not configured" };
    }

    const baseUrl = process.env.NAGAD_BASE_URL || "https://sandbox.nagad.com.bd";

    if (request.gatewayTransactionId) {
      const response = await fetch(
        `${baseUrl}/api/merchant/payment/${request.gatewayTransactionId}`,
        {
          headers: {
            "Authorization": `Bearer ${publicKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (
        result.orderStatus === "Success" &&
        result.transactionReference === request.transactionId &&
        result.orderReference === request.invoiceNumber
      ) {
        return {
          success: true,
          status: "completed",
          amount: result.amount,
          currency: result.currency,
        };
      }
    }

    return { success: false, status: "failed", error: "Nagad payment not confirmed" };
  } catch (error) {
    return {
      success: false,
      status: "failed",
      error: error instanceof Error ? error.message : "Nagad verification failed",
    };
  }
}

// ==================== PayPal ====================

async function initPayPalPayment(
  request: PaymentInitRequest,
  transactionId: string,
  invoiceNumber: string
): Promise<PaymentInitResponse> {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const isLive = process.env.PAYPAL_IS_LIVE === "true";

    if (!clientId || !clientSecret) {
      return { success: false, transactionId, invoiceNumber, error: "PayPal not configured" };
    }

    const baseUrl = isLive
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    const bdtPerUsd = Number(process.env.PAYPAL_BDT_PER_USD);
    if (!Number.isFinite(bdtPerUsd) || bdtPerUsd <= 0) {
      return { success: false, transactionId, invoiceNumber, error: "PayPal exchange rate is not configured" };
    }

    const accessToken = await getPayPalAccessToken(baseUrl, clientId, clientSecret);
    if (!accessToken) {
      return { success: false, transactionId, invoiceNumber, error: "PayPal authentication failed" };
    }

    // Create order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: transactionId,
          amount: {
            currency_code: "USD",
            value: (request.plan.price / bdtPerUsd).toFixed(2),
          },
          description: `${request.plan.name} Subscription`,
          custom_id: invoiceNumber,
        }],
        application_context: {
          return_url: buildPaymentCallbackUrl(request.successUrl, "paypal", transactionId),
          cancel_url: request.cancelUrl,
        },
      }),
    });

    const order = await orderResponse.json();

    if (order.id) {
      const approveUrl = order.links?.find(
        (l: { rel: string }) => l.rel === "approve"
      )?.href;

      return {
        success: true,
        transactionId,
        invoiceNumber,
        paymentUrl: approveUrl,
        gatewayData: { orderId: order.id },
      };
    }

    return {
      success: false,
      transactionId,
      invoiceNumber,
      error: order.message || "Failed to create PayPal order",
    };
  } catch (error) {
    return {
      success: false,
      transactionId,
      invoiceNumber,
      error: error instanceof Error ? error.message : "PayPal initialization failed",
    };
  }
}

async function verifyPayPalPayment(
  request: PaymentVerifyRequest
): Promise<PaymentVerifyResponse> {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const isLive = process.env.PAYPAL_IS_LIVE === "true";

    if (!clientId || !clientSecret) {
      return { success: false, status: "failed", error: "PayPal not configured" };
    }

    const baseUrl = isLive
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    if (!request.gatewayTransactionId) {
      return { success: false, status: "failed", error: "PayPal order reference is required" };
    }

    const bdtPerUsd = Number(process.env.PAYPAL_BDT_PER_USD);
    if (!Number.isFinite(bdtPerUsd) || bdtPerUsd <= 0) {
      return { success: false, status: "failed", error: "PayPal exchange rate is not configured" };
    }

    const accessToken = await getPayPalAccessToken(baseUrl, clientId, clientSecret);
    if (!accessToken) {
      return { success: false, status: "failed", error: "PayPal authentication failed" };
    }

    const headers = { Authorization: `Bearer ${accessToken}` };
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders/${request.gatewayTransactionId}`, { headers });
    const order = await orderResponse.json();
    const initialPurchaseUnit = order.purchase_units?.[0];
    if (
      !orderResponse.ok ||
      initialPurchaseUnit?.reference_id !== request.transactionId ||
      initialPurchaseUnit?.custom_id !== request.invoiceNumber
    ) {
      return { success: false, status: "failed", error: "PayPal order does not match this invoice" };
    }

    let result = order;
    if (order.status !== "COMPLETED") {
      const captureResponse = await fetch(
        `${baseUrl}/v2/checkout/orders/${request.gatewayTransactionId}/capture`,
        { method: "POST", headers: { ...headers, "Content-Type": "application/json" } },
      );
      result = await captureResponse.json();
      if (!captureResponse.ok) {
        return { success: false, status: "failed", error: "PayPal capture failed" };
      }
    }

    const purchaseUnit = result.purchase_units?.[0];
    if (
      result.status === "COMPLETED" &&
      purchaseUnit?.reference_id === request.transactionId &&
      purchaseUnit?.custom_id === request.invoiceNumber
    ) {
      const capture = purchaseUnit.payments?.captures?.[0];
      return {
        success: true,
        status: "completed",
        amount: capture?.amount?.value ? parseFloat(capture.amount.value) : undefined,
        currency: capture?.amount?.currency_code,
      };
    }

    return { success: false, status: "failed", error: "PayPal payment not confirmed" };
  } catch (error) {
    return {
      success: false,
      status: "failed",
      error: error instanceof Error ? error.message : "PayPal verification failed",
    };
  }
}
