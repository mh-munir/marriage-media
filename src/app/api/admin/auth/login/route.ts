export const dynamic = "force-dynamic";

import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";
import { generateTokenPair } from "@/lib/security";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error("Admin login database connection failed:", dbError);
      return NextResponse.json({ error: "Database unavailable. Please try again in a moment." }, { status: 503 });
    }

    const user = await User.findOne({ email }).select("+password");

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
        avatar: user.avatarUrl || "",
        isPremium: false,
        isVerified: user.isEmailVerified,
        profileCompleted: user.profileCompleted || 0,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    response.cookies.set("adminToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });
    response.cookies.set("adminRefreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    const legacyAccess = verifyToken(request.cookies.get("token")?.value || "");
    if (legacyAccess?.role === "admin" || legacyAccess?.role === "superadmin") {
      response.cookies.set("token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 0, path: "/" });
    }
    const legacyRefresh = verifyToken(request.cookies.get("refreshToken")?.value || "");
    if (legacyRefresh?.role === "admin" || legacyRefresh?.role === "superadmin") {
      response.cookies.set("refreshToken", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 0, path: "/" });
    }

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Unable to sign in as admin" }, { status: 500 });
  }
}
