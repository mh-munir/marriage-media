export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Payment, Profile, Coupon, SitePage } from "@/models";
import { requireAuth, generateInvoiceNumber, generateTransactionId } from "@/lib/auth";
import { sendPaymentConfirmationEmail } from "@/lib/email";
import { validatePhoneNumber } from "@/lib/utils";
import { defaultPricingPlans, parsePricingAmount, SUBSCRIPTION_PLAN_ACCESS } from "@/lib/pricing";

// Create subscription payment
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);
    if (user.role !== "user") return NextResponse.json({ error: "Admin accounts cannot subscribe." }, { status: 403 });

    const body = await request.json();
    const { plan, paymentMethod, billingInfo, couponCode } = body;

    if (!plan || !paymentMethod || !billingInfo) {
      return NextResponse.json(
        { error: "Plan, payment method, and billing info are required" },
        { status: 400 }
      );
    }
    if (billingInfo.phone && !validatePhoneNumber(String(billingInfo.phone).replace(/\D/g, ""))) {
      return NextResponse.json({ error: "Enter a valid 11-digit billing mobile number" }, { status: 400 });
    }

    const planId = typeof plan === "string" ? plan : "";
    const planConfig = Object.hasOwn(SUBSCRIPTION_PLAN_ACCESS, planId)
      ? SUBSCRIPTION_PLAN_ACCESS[planId as keyof typeof SUBSCRIPTION_PLAN_ACCESS]
      : null;
    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const pricingPage = await SitePage.findOne({ slug: "pricing" }).select("pricingPlans").lean();
    const pricingPlans = pricingPage?.pricingPlans?.length ? pricingPage.pricingPlans : defaultPricingPlans;
    const configuredPlan = pricingPlans.find((item) => item.id === planId);
    const amount = configuredPlan ? parsePricingAmount(configuredPlan.price) : 0;
    if (!amount) {
      return NextResponse.json({ error: "This plan does not have a price configured yet." }, { status: 400 });
    }
    let discountAmount = 0;

    // Apply coupon
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (coupon) {
        // Check usage limits
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
        }
        if (coupon.usedBy.includes(user._id)) {
          return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 });
        }
        if (coupon.applicablePlans.length > 0 && !coupon.applicablePlans.includes(plan)) {
          return NextResponse.json({ error: "Coupon not applicable to this plan" }, { status: 400 });
        }
        if (amount < coupon.minPurchaseAmount) {
          return NextResponse.json({ error: `Minimum purchase amount is ${coupon.minPurchaseAmount}` }, { status: 400 });
        }

        if (coupon.discountType === "percentage") {
          discountAmount = Math.round((amount * coupon.discountValue) / 100);
          if (coupon.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
          }
        } else {
          discountAmount = coupon.discountValue;
        }

        // Update coupon usage
        await Coupon.findByIdAndUpdate(coupon._id, {
          $inc: { usedCount: 1 },
          $push: { usedBy: user._id },
        });
      }
    }

    const finalAmount = Math.max(0, amount - discountAmount);
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000);

    const payment = await Payment.create({
      userId: user._id,
      amount: finalAmount,
      currency: "BDT",
      plan: plan === "basic" ? "quarterly" : "yearly",
      planDuration: planConfig.durationDays,
      paymentMethod,
      transactionId: generateTransactionId(),
      status: "completed",
      invoiceNumber: generateInvoiceNumber(),
      billingInfo: {
        name: billingInfo.name,
        email: billingInfo.email,
        phone: billingInfo.phone || "",
        address: billingInfo.address || "",
      },
      startDate,
      expiryDate,
      metadata: {
        planId,
        profileDetailLimit: String(SUBSCRIPTION_PLAN_ACCESS[planId as keyof typeof SUBSCRIPTION_PLAN_ACCESS].profileDetailLimit),
        ...(discountAmount > 0 ? { couponCode, discountAmount: discountAmount.toString() } : {}),
      },
    });

    // Update profile premium status
    await Profile.findOneAndUpdate(
      { userId: user._id },
      {
        isPremium: true,
        premiumExpiry: expiryDate,
        premiumPlan: plan,
      }
    );

    // Send confirmation email
    const profile = await Profile.findOne({ userId: user._id });
    if (profile) {
      await sendPaymentConfirmationEmail(
        billingInfo.email,
        `${profile.firstName} ${profile.lastName}`,
        plan,
        `BDT ${finalAmount}`,
        expiryDate.toLocaleDateString()
      );
    }

    return NextResponse.json({ payment, message: "Subscription activated successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Get subscription status
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);
    if (user.role !== "user") return NextResponse.json({ subscription: { isPremium: false, premiumExpiry: null, premiumPlan: null, isActive: false }, payments: [] });

    const profile = await Profile.findOne({ userId: user._id }).select("isPremium premiumExpiry premiumPlan").lean();
    const payments = await Payment.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).lean();

    return NextResponse.json({
      subscription: {
        isPremium: profile?.isPremium || false,
        premiumExpiry: profile?.premiumExpiry || null,
        premiumPlan: profile?.premiumPlan || null,
        isActive: profile?.isPremium && profile?.premiumExpiry && new Date(profile.premiumExpiry) > new Date(),
      },
      payments,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
