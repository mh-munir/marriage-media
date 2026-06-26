import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { Profile, Payment } from "@/models";
import {
  initPayment,
  SUBSCRIPTION_PLANS,
  type PaymentProvider,
} from "@/lib/payment-gateway";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectToDatabase();

    const body = await request.json();
    const { planId, provider, billingInfo } = body;

    // Validate plan
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Validate provider
    const validProviders: PaymentProvider[] = [
      "stripe",
      "sslcommerz",
      "bkash",
      "nagad",
      "paypal",
    ];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: "Invalid payment provider" },
        { status: 400 }
      );
    }

    // Validate billing info
    if (!billingInfo?.name || !billingInfo?.email) {
      return NextResponse.json(
        { error: "Billing name and email are required" },
        { status: 400 }
      );
    }

    // Get profile
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return NextResponse.json(
        { error: "Please complete your profile first" },
        { status: 400 }
      );
    }

    // Check for existing active subscription
    if (profile.isPremium && profile.premiumExpiry && new Date(profile.premiumExpiry) > new Date()) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Initialize payment
    const result = await initPayment({
      userId: user._id.toString(),
      plan,
      provider,
      billingInfo: {
        name: billingInfo.name,
        email: billingInfo.email,
        phone: billingInfo.phone,
        address: billingInfo.address,
      },
      successUrl: `${baseUrl}/dashboard/settings?payment=success`,
      cancelUrl: `${baseUrl}/pricing?payment=cancelled`,
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Payment initialization failed" },
        { status: 500 }
      );
    }

    // Create pending payment record
    await Payment.create({
      userId: user._id,
      amount: plan.price,
      currency: plan.currency,
      plan: plan.id.includes("monthly")
        ? "monthly"
        : plan.id.includes("quarterly")
          ? "quarterly"
          : plan.id.includes("yearly")
            ? "yearly"
            : "half-yearly",
      planDuration: plan.duration,
      paymentMethod: provider,
      transactionId: result.transactionId,
      status: "pending",
      invoiceNumber: result.invoiceNumber,
      billingInfo: {
        name: billingInfo.name,
        email: billingInfo.email,
        phone: billingInfo.phone || "",
        address: billingInfo.address || "",
      },
      startDate: new Date(),
      expiryDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
    });

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      invoiceNumber: result.invoiceNumber,
      paymentUrl: result.paymentUrl,
      gatewayData: result.gatewayData,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Payment checkout failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}