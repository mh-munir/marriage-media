export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { Profile, Payment, SitePage } from "@/models";
import {
  initPayment,
  type PaymentPlan,
  type PaymentProvider,
} from "@/lib/payment-gateway";
import { validatePhoneNumber } from "@/lib/utils";
import { defaultPricingPlans, parsePricingAmount, SUBSCRIPTION_PLAN_ACCESS } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectToDatabase();

    const body = await request.json();
    const { planId, provider, billingInfo } = body;

    const pricingPage = await SitePage.findOne({ slug: "pricing" }).select("pricingPlans").lean();
    const pricingPlans = pricingPage?.pricingPlans?.length ? pricingPage.pricingPlans : defaultPricingPlans;
    const configuredPlan = pricingPlans.find((item) => item.id === planId);
    const planAccess = typeof planId === "string" && Object.hasOwn(SUBSCRIPTION_PLAN_ACCESS, planId)
      ? SUBSCRIPTION_PLAN_ACCESS[planId as keyof typeof SUBSCRIPTION_PLAN_ACCESS]
      : null;
    if (!configuredPlan || !planAccess) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }
    const amount = parsePricingAmount(configuredPlan.price);
    if (!amount) {
      return NextResponse.json({ error: "This plan does not have a price configured yet." }, { status: 400 });
    }
    const plan: PaymentPlan = {
      id: configuredPlan.id,
      name: configuredPlan.name,
      tier: planId === "basic" ? "silver" : planId === "gold" ? "gold" : "platinum",
      price: amount,
      currency: "BDT",
      duration: planAccess.durationDays,
      features: configuredPlan.features,
    };

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
    if (billingInfo.phone && !validatePhoneNumber(String(billingInfo.phone).replace(/\D/g, ""))) {
      return NextResponse.json({ error: "Enter a valid 11-digit billing mobile number" }, { status: 400 });
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
      plan: plan.id === "basic" ? "quarterly" : plan.id === "gold" ? "half-yearly" : "yearly",
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
      metadata: { planId: plan.id },
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
