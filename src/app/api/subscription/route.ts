export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Payment, Profile } from "@/models";
import { requireAuth } from "@/lib/auth";

// Create subscription payment
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    return NextResponse.json({ error: "Direct subscription activation is disabled. Submit a payment for admin review." }, { status: 410 });
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
