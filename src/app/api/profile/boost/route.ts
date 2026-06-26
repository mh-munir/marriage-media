import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Profile, Payment } from "@/models";
import { requireAuth, generateInvoiceNumber, generateTransactionId } from "@/lib/auth";

const BOOST_CONFIG = {
  durationHours: 24,
  price: 200, // BDT
};

// Boost profile
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if already boosted within last 24 hours
    if (profile.isProfileBoosted && profile.boostedAt) {
      const hoursSinceBoost = (Date.now() - new Date(profile.boostedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceBoost < BOOST_CONFIG.durationHours) {
        return NextResponse.json(
          { error: `Profile is already boosted. ${Math.ceil(BOOST_CONFIG.durationHours - hoursSinceBoost)}h remaining.` },
          { status: 400 }
        );
      }
    }

    // Create boost payment
    const payment = await Payment.create({
      userId: user._id,
      amount: BOOST_CONFIG.price,
      currency: "BDT",
      plan: "monthly" as const,
      planDuration: 1,
      paymentMethod: "sslcommerz" as const,
      transactionId: generateTransactionId(),
      status: "completed",
      invoiceNumber: generateInvoiceNumber(),
      billingInfo: {
        name: profile.firstName + " " + profile.lastName,
        email: user.email,
      },
      startDate: new Date(),
      expiryDate: new Date(Date.now() + BOOST_CONFIG.durationHours * 60 * 60 * 1000),
    });

    // Apply boost
    await Profile.findByIdAndUpdate(profile._id, {
      isProfileBoosted: true,
      boostedAt: new Date(),
    });

    return NextResponse.json({
      message: "Profile boosted for 24 hours",
      payment,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Check boost status
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuth(request);

    const profile = await Profile.findOne({ userId: user._id })
      .select("isProfileBoosted boostedAt")
      .lean();

    let remainingHours = 0;
    if (profile?.isProfileBoosted && profile?.boostedAt) {
      const elapsed = (Date.now() - new Date(profile.boostedAt).getTime()) / (1000 * 60 * 60);
      remainingHours = Math.max(0, BOOST_CONFIG.durationHours - elapsed);
    }

    return NextResponse.json({
      isBoosted: remainingHours > 0,
      remainingHours: Math.round(remainingHours * 10) / 10,
      boostPrice: BOOST_CONFIG.price,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}