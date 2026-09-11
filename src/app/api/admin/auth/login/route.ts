export const dynamic = "force-dynamic";

import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";
import { generateTokenPair } from "@/lib/security";

const DEFAULT_ADMIN_EMAIL = "admin@marriagemedia.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@12345";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    let user = await User.findOne({ email }).select("+password");

    // Development bootstrap keeps the local admin panel usable on a fresh database.
    if (!user && process.env.NODE_ENV !== "production" && email === (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL) && password === (process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD)) {
      user = await User.create({
        email,
        password: await bcrypt.hash(password, 12),
        role: "admin",
        isActive: true,
        isBlocked: false,
        isEmailVerified: true,
        isPhoneVerified: false,
      });
    }

    if (!user || !user.isActive || user.isBlocked || (user.role !== "admin" && user.role !== "superadmin")) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    user.lastLoginAt = new Date();
    await user.save();

    const response = NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        isPremium: false,
        isVerified: user.isEmailVerified,
        profileCompleted: user.profileCompleted || 0,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    response.cookies.set("token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });
    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Unable to sign in as admin" }, { status: 500 });
  }
}
