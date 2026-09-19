export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";
import { registerSchema } from "@/lib/validations";
import { allocatePublicId } from "@/lib/public-id";
import { createNotification } from "@/lib/notifications";
import { sendVerificationCodeSMS } from "@/lib/sms";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const { phone, password } = result.data;
    const normalizedPhone = phone.replace(/\s/g, "");

    // Check if user already exists
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      if (!existingUser.isPhoneVerified) {
        const otp = crypto.randomInt(100000, 1000000).toString();
        const smsResult = await sendVerificationCodeSMS(normalizedPhone, otp);
        if (!smsResult.success) {
          return NextResponse.json({ error: smsResult.error || "Unable to send verification code." }, { status: 503 });
        }

        existingUser.password = await bcrypt.hash(password, await bcrypt.genSalt(12));
        existingUser.registrationOtpHash = crypto.createHash("sha256").update(otp).digest("hex");
        existingUser.registrationOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        existingUser.registrationOtpAttempts = 0;
        await existingUser.save();

        return NextResponse.json({
          message: "Your pending account was found. A new verification code was sent to your mobile number.",
          userId: existingUser._id,
          publicId: existingUser.publicId,
        });
      }

      return NextResponse.json(
        { error: "An account with this mobile number already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const otp = crypto.randomInt(100000, 1000000).toString();
    const user = await User.create({
      publicId: await allocatePublicId(),
      phone: normalizedPhone,
      password: hashedPassword,
      role: "user",
      isEmailVerified: false,
      isPhoneVerified: false,
      isActive: true,
      registrationOtpHash: crypto.createHash("sha256").update(otp).digest("hex"),
      registrationOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      registrationOtpAttempts: 0,
    });

    const smsResult = await sendVerificationCodeSMS(normalizedPhone, otp);
    if (!smsResult.success) {
      await User.findByIdAndDelete(user._id);
      return NextResponse.json({ error: smsResult.error || "Unable to send verification code." }, { status: 503 });
    }

    try {
      const admins = await User.find({ role: { $in: ["admin", "superadmin"] }, isActive: true }).select("_id").lean();
      await Promise.all(
        admins.map((admin) => createNotification({
          userId: admin._id.toString(),
          type: "system",
          title: "New member registration",
          message: `A new member account (${user.publicId || normalizedPhone}) was created.`,
          link: "/admin/users",
          channels: ["inapp"],
        })),
      );
    } catch (notificationError) {
      console.error("Admin registration notification failed:", notificationError);
    }

    const response = NextResponse.json(
      {
        message: "Account created. Verify your mobile number to continue.",
        userId: user._id,
        publicId: user.publicId,
      },
      { status: 201 }
    );
    return response;
  } catch (error: unknown) {
    const databaseError = error as {
      code?: number;
      message?: string;
      name?: string;
    };

    console.error("Registration error:", {
      name: databaseError.name,
      code: databaseError.code,
      message: databaseError.message,
    });

    if (databaseError.code === 11000) {
      return NextResponse.json(
        { error: "An account with this mobile number already exists" },
        { status: 409 }
      );
    }

    if (
      databaseError.name === "MongooseServerSelectionError" ||
      databaseError.name === "MongoServerSelectionError" ||
      databaseError.name === "MongoNetworkError" ||
      databaseError.name === "MongooseError"
    ) {
      return NextResponse.json(
        { error: "Database temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
