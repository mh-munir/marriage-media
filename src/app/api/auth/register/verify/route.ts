export const dynamic = "force-dynamic";

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";
import { generateTokenPair } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { userId?: string; code?: string };
    if (!body.userId || !/^\d{6}$/.test(body.code || "")) {
      return NextResponse.json({ error: "User ID and a valid 6-digit code are required." }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(body.userId).select("+registrationOtpHash +registrationOtpExpiry +registrationOtpAttempts");
    if (!user || user.isPhoneVerified) {
      return NextResponse.json({ error: "This verification request is invalid." }, { status: 400 });
    }
    if ((user.registrationOtpAttempts || 0) >= 5) {
      return NextResponse.json({ error: "Too many incorrect attempts. Please register again." }, { status: 429 });
    }
    if (!user.registrationOtpExpiry || user.registrationOtpExpiry < new Date()) {
      return NextResponse.json({ error: "This code has expired. Please register again." }, { status: 400 });
    }

    const codeHash = crypto.createHash("sha256").update(body.code || "").digest("hex");
    if (codeHash !== user.registrationOtpHash) {
      user.registrationOtpAttempts = (user.registrationOtpAttempts || 0) + 1;
      await user.save();
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }

    user.isPhoneVerified = true;
    user.registrationOtpHash = undefined;
    user.registrationOtpExpiry = undefined;
    user.registrationOtpAttempts = 0;
    await user.save();

    const tokens = generateTokenPair({ userId: user._id.toString(), email: user.email || "", role: user.role });
    const response = NextResponse.json({ message: "Mobile number verified successfully.", accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    response.cookies.set("token", tokens.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 15 * 60, path: "/" });
    response.cookies.set("refreshToken", tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 30 * 24 * 60 * 60, path: "/" });
    return response;
  } catch (error) {
    console.error("Registration OTP verification error:", error);
    return NextResponse.json({ error: "Unable to verify mobile number." }, { status: 500 });
  }
}