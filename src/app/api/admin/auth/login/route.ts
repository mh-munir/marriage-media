export const dynamic = "force-dynamic";

import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";
import { generateTokenPair } from "@/lib/security";

const DEFAULT_ADMIN_EMAIL = "admin@marriagemedia.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@12345";

function getBootstrapAdminCredentials() {
  const configuredEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  return {
    email: configuredEmail,
    password: configuredPassword,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const bootstrap = getBootstrapAdminCredentials();
    const isBootstrapAdmin =
      email === bootstrap.email &&
      password === bootstrap.password;

    let user: any = null;

    try {
      await connectToDatabase();
      user = await User.findOne({ email }).select("+password");
    } catch (dbError) {
      console.error("Admin login database connection failed:", dbError);

      if (!isBootstrapAdmin) {
        return NextResponse.json({ error: "Database unavailable. Please try again in a moment." }, { status: 503 });
      }

      user = {
        _id: { toString: () => `local-admin-${Date.now()}` },
        email,
        password: await bcrypt.hash(password, 12),
        role: "superadmin",
        isActive: true,
        isBlocked: false,
        isEmailVerified: true,
        isPhoneVerified: false,
        avatarUrl: "",
        profileCompleted: 100,
        lastLoginAt: new Date(),
      };
    }

    if (!user && isBootstrapAdmin) {
      user = await User.create({
        email,
        password: await bcrypt.hash(password, 12),
        role: "superadmin",
        roleMutationAllowed: true,
        isActive: true,
        isBlocked: false,
        isEmailVerified: true,
        isPhoneVerified: false,
        profileCompleted: 100,
      });
    }

    if (user && isBootstrapAdmin && user.role !== "superadmin") {
      user.role = "superadmin";
      user.roleMutationAllowed = true;
      if (typeof user.save === "function") {
        await user.save();
      }
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

    if (typeof user.save === "function") {
      user.lastLoginAt = new Date();
      await user.save();
    }

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
