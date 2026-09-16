export const dynamic = "force-dynamic";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";
import { resetPasswordSchema } from "@/lib/validations";
import { validatePhoneNumber } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid password reset request" }, { status: 400 });
    }

    await connectToDatabase();
    const phone = String(body.phone || "").replace(/\s/g, "");
    if (!validatePhoneNumber(phone)) {
      return NextResponse.json({ error: "Enter a valid 11-digit mobile number." }, { status: 400 });
    }
    const tokenHash = crypto.createHash("sha256").update(result.data.token).digest("hex");
    const user = await User.findOne({
      phone,
      resetPasswordToken: tokenHash,
      resetPasswordExpiry: { $gt: new Date() },
      resetPasswordAttempts: { $lt: 5 },
    }).select("+password +resetPasswordToken +resetPasswordExpiry +resetPasswordAttempts");

    if (!user) {
      await User.findOneAndUpdate({ phone }, { $inc: { resetPasswordAttempts: 1 } });
      return NextResponse.json({ error: "The recovery code is invalid, expired, or has been used too many times." }, { status: 400 });
    }

    user.password = await bcrypt.hash(result.data.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.resetPasswordAttempts = 0;
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    await user.save();

    return NextResponse.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Unable to reset password." }, { status: 500 });
  }
}