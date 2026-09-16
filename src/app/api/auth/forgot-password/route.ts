export const dynamic = "force-dynamic";

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";
import { forgotPasswordSchema } from "@/lib/validations";
import { validatePhoneNumber } from "@/lib/utils";
import { sendVerificationCodeSMS } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Enter a valid 11-digit mobile number." }, { status: 400 });
    }

    await connectToDatabase();
    const phone = result.data.phone.replace(/\s/g, "");
    if (!validatePhoneNumber(phone)) {
      return NextResponse.json({ error: "Enter a valid 11-digit mobile number." }, { status: 400 });
    }
    const user = await User.findOne({ phone }).select("+resetPasswordToken +resetPasswordExpiry +resetPasswordAttempts phone");

    // Keep this response identical for known and unknown addresses.
    if (!user) {
      return NextResponse.json({ message: "If an account exists, a recovery code has been sent." });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const tokenHash = crypto.createHash("sha256").update(code).digest("hex");
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
    user.resetPasswordAttempts = 0;
    await user.save();

    const smsResult = await sendVerificationCodeSMS(phone, code);

    if (!smsResult.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save();
      return NextResponse.json({ error: "Unable to send recovery code. SMS service is not configured." }, { status: 503 });
    }

    return NextResponse.json({ message: "If an account exists, a recovery code has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Unable to process password reset request." }, { status: 500 });
  }
}