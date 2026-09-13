export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { Verification } from "@/models";
import { createNotification } from "@/lib/notifications";
import { validatePhoneNumber } from "@/lib/utils";

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/auth/verify-phone
 * Send OTP to phone number
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Mobile number must be exactly 11 digits" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(`${user._id}:phone`, { code: otp, expiresAt });

    // In production, send OTP via SMS provider (Twilio, etc.)
    // For now, we'll log it and create a verification record
    console.log(`Phone OTP for ${phone}: ${otp}`);

    // Create/update verification record
    await Verification.findOneAndUpdate(
      { userId: user._id, type: "phone" },
      {
        userId: user._id,
        type: "phone",
        value: phone,
        status: "pending",
        verificationCode: otp,
        expiresAt: new Date(expiresAt),
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "OTP sent to your phone number",
      // In development, return the OTP for testing
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Phone verification error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/verify-phone
 * Verify OTP code
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const stored = otpStore.get(`${user._id}:phone`);

    if (!stored) {
      return NextResponse.json(
        { error: "No OTP request found. Please request a new code." },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(`${user._id}:phone`);
      return NextResponse.json(
        { error: "OTP has expired. Please request a new code." },
        { status: 400 }
      );
    }

    if (stored.code !== code) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // OTP verified successfully
    otpStore.delete(`${user._id}:phone`);

    // Update verification record
    await Verification.findOneAndUpdate(
      { userId: user._id, type: "phone" },
      { status: "verified", verifiedAt: new Date() }
    );

    // Create notification
    await createNotification({
      userId: user._id.toString(),
      type: "verification",
      title: "Phone Verified",
      message: "Your phone number has been verified successfully!",
      link: "/dashboard/verification",
    });

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Phone verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify phone" },
      { status: 500 }
    );
  }
}