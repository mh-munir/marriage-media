export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Referral, Profile } from "@/models";
import { requireAuth } from "@/lib/auth";

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "MM";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get referral info
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    let referral = await Referral.findOne({ referrerId: user._id });

    if (!referral) {
      // Create referral code
      const code = generateReferralCode();
      referral = await Referral.create({
        referrerId: user._id,
        referralCode: code,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      });
    }

    const totalReferrals = await Referral.countDocuments({
      referrerId: user._id,
      status: "completed",
    });

    return NextResponse.json({
      referralCode: referral.referralCode,
      totalReferrals,
      rewardAmount: referral.rewardAmount,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://marriagemedia.com"}/register?ref=${referral.referralCode}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Apply referral code during registration (called with coupon-style)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 });
    }

    const referral = await Referral.findOne({
      referralCode: referralCode.toUpperCase(),
      status: "pending",
    });

    if (!referral) {
      return NextResponse.json({ error: "Invalid or expired referral code" }, { status: 400 });
    }

    if (referral.referrerId.toString() === user._id.toString()) {
      return NextResponse.json({ error: "You cannot use your own referral code" }, { status: 400 });
    }

    // Mark referral as completed
    referral.referredId = user._id;
    referral.status = "completed";
    await referral.save();

    // Give premium days to both referrer and referred
    const premiumDays = referral.rewardAmount;
    const expiryDate = new Date(Date.now() + premiumDays * 24 * 60 * 60 * 1000);

    await Profile.findOneAndUpdate(
      { userId: user._id },
      {
        isPremium: true,
        premiumExpiry: expiryDate,
        premiumPlan: "referral",
      }
    );

    // Also reward the referrer
    const referrerProfile = await Profile.findOne({ userId: referral.referrerId });
    if (referrerProfile) {
      const currentExpiry = referrerProfile.premiumExpiry && new Date(referrerProfile.premiumExpiry) > new Date()
        ? new Date(referrerProfile.premiumExpiry)
        : new Date();
      const newExpiry = new Date(currentExpiry.getTime() + premiumDays * 24 * 60 * 60 * 1000);

      await Profile.findOneAndUpdate(
        { userId: referral.referrerId },
        {
          isPremium: true,
          premiumExpiry: newExpiry,
          premiumPlan: "referral",
        }
      );
    }

    return NextResponse.json({
      message: `You received ${premiumDays} days of premium! Your referrer also received ${premiumDays} days.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}