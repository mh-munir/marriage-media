import { NextRequest, NextResponse } from "next/server";
import { verifyToken, generateToken, generateRefreshToken, type JWTPayload } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 });
    }

    const payload = verifyToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(payload.userId).select("-password");

    if (!user || !user.isActive || user.isBlocked) {
      return NextResponse.json({ error: "User not found or deactivated" }, { status: 401 });
    }

    const newPayload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newToken = generateToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    const response = NextResponse.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });

    // Set HTTP-only cookies
    response.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 });
  }
}