export const dynamic = "force-dynamic";

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Payment, Profile } from "@/models";
import { verifyPayment, type PaymentProvider } from "@/lib/payment-gateway";

const providers = new Set<PaymentProvider>(["stripe", "sslcommerz", "bkash", "nagad", "paypal"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(...values: unknown[]): string {
  const value = values.find((candidate) => typeof candidate === "string" && candidate.length > 0);
  return typeof value === "string" ? value : "";
}

function verifyStripeSignature(payload: string, signature: string, secret: string): boolean {
  const fields = signature.split(",").map((field) => field.split("=", 2));
  const timestamp = fields.find(([key]) => key === "t")?.[1];
  const signatures = fields.filter(([key]) => key === "v1").map(([, value]) => value);
  const timestampSeconds = Number(timestamp);

  if (!timestamp || !Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return signatures.some((candidate) => {
    if (!/^[a-f\d]{64}$/i.test(candidate)) return false;
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(candidate, "hex"));
  });
}

async function completeVerifiedPayment(
  provider: PaymentProvider,
  transactionId: string,
  gatewayTransactionId: string,
) {
  if (!transactionId || !gatewayTransactionId) {
    return NextResponse.json({ error: "Transaction references are required" }, { status: 400 });
  }

  await connectToDatabase();
  const payment = await Payment.findOne({ transactionId, paymentMethod: provider });
  if (!payment) return NextResponse.json({ error: "Pending payment not found" }, { status: 404 });
  const grantPremium = (premiumExpiry: Date = payment.expiryDate) => Profile.findOneAndUpdate(
    { userId: payment.userId },
    {
      isPremium: true,
      premiumExpiry,
      premiumPlan: payment.metadata?.planId || payment.plan,
    },
  );
  if (payment.status === "completed") {
    await grantPremium();
    return NextResponse.json({ received: true });
  }
  if (payment.status !== "pending") return NextResponse.json({ error: "Payment is not pending" }, { status: 409 });

  const verification = await verifyPayment({
    provider,
    transactionId,
    invoiceNumber: payment.invoiceNumber,
    gatewayTransactionId,
  });
  const expectedAmount = provider === "paypal"
    ? Number((payment.amount / Number(process.env.PAYPAL_BDT_PER_USD)).toFixed(2))
    : payment.amount;
  const expectedCurrency = provider === "paypal" ? "USD" : payment.currency.toUpperCase();
  if (
    !verification.success ||
    verification.status !== "completed" ||
    typeof verification.amount !== "number" ||
    Math.abs(verification.amount - expectedAmount) > 0.01 ||
    verification.currency?.toUpperCase() !== expectedCurrency
  ) {
    return NextResponse.json({ error: "Payment could not be independently verified" }, { status: 400 });
  }

  const now = new Date();
  const expiry = new Date(now.getTime() + payment.planDuration * 24 * 60 * 60 * 1000);
  const completed = await Payment.findOneAndUpdate(
    { _id: payment._id, status: "pending" },
    { $set: { status: "completed", startDate: now, expiryDate: expiry } },
    { new: true },
  );

  if (!completed) {
    const latest = await Payment.findById(payment._id).select("status").lean();
    if (latest?.status !== "completed") {
      return NextResponse.json({ error: "Payment state changed; retry verification" }, { status: 409 });
    }
    await grantPremium();
    return NextResponse.json({ received: true });
  }

  await grantPremium(expiry);

  return NextResponse.json({ received: true });
}

export async function POST(request: NextRequest) {
  try {
    const providerParam = request.nextUrl.searchParams.get("provider");
    if (providerParam === "stripe") {
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      const signature = request.headers.get("stripe-signature") || "";
      if (!secret) return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 503 });

      const rawBody = await request.text();
      if (!verifyStripeSignature(rawBody, signature, secret)) {
        return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 401 });
      }

      const event: unknown = JSON.parse(rawBody);
      if (!isRecord(event) || event.type !== "checkout.session.completed" || !isRecord(event.data) || !isRecord(event.data.object)) {
        return NextResponse.json({ received: true });
      }
      const session = event.data.object;
      if (session.payment_status !== "paid" || !isRecord(session.metadata)) {
        return NextResponse.json({ received: true });
      }

      return completeVerifiedPayment(
        "stripe",
        stringValue(session.metadata.transactionId),
        stringValue(session.id),
      );
    }

    if (!providerParam || !providers.has(providerParam as PaymentProvider)) {
      return NextResponse.json({ error: "Unsupported payment provider" }, { status: 400 });
    }

    const contentType = request.headers.get("content-type") || "";
    let body: unknown;
    if (contentType.includes("application/x-www-form-urlencoded")) {
      body = Object.fromEntries(new URLSearchParams(await request.text()));
    } else if (contentType.includes("multipart/form-data")) {
      body = Object.fromEntries(await request.formData());
    } else {
      body = await request.json();
    }
    if (!isRecord(body)) return NextResponse.json({ error: "Invalid callback payload" }, { status: 400 });

    const provider = providerParam as PaymentProvider;
    const transactionId = stringValue(body.transactionId, body.tran_id, body.transactionReference);
    const gatewayTransactionId = stringValue(
      body.gatewayTransactionId,
      body.val_id,
      body.paymentID,
      body.paymentReferenceId,
      body.paymentRefId,
      body.token,
      body.orderId,
    );

    return completeVerifiedPayment(provider, transactionId, gatewayTransactionId);
  } catch (error) {
    console.error("Payment webhook verification failed:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider") as PaymentProvider | null;
  const transactionId = request.nextUrl.searchParams.get("transactionId") || "";
  const gatewayTransactionId = stringValue(
    request.nextUrl.searchParams.get("gatewayTransactionId"),
    request.nextUrl.searchParams.get("session_id"),
    request.nextUrl.searchParams.get("paymentID"),
    request.nextUrl.searchParams.get("token"),
    request.nextUrl.searchParams.get("paymentRefId"),
    request.nextUrl.searchParams.get("val_id"),
  );

  let paymentSucceeded = false;
  try {
    if (provider && providers.has(provider)) {
      const response = await completeVerifiedPayment(provider, transactionId, gatewayTransactionId);
      paymentSucceeded = response.status === 200;
    }
  } catch (error) {
    console.error("Payment return verification failed:", error);
  }

  const returnUrl = new URL("/dashboard/settings", process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin);
  returnUrl.searchParams.set("payment", paymentSucceeded ? "success" : "verification-failed");
  return NextResponse.redirect(returnUrl, 303);
}
