export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { rotateTokens } from "@/lib/security";
import { User } from "@/models";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { refreshToken?: string };
    const refreshToken = request.cookies.get("adminRefreshToken")?.value || body.refreshToken;
    const payload = refreshToken ? verifyToken(refreshToken) : null;
    if (!refreshToken || !payload || (payload.role !== "admin" && payload.role !== "superadmin")) {
      return NextResponse.json({ error: "Invalid admin refresh token" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(payload.userId).select("role isActive isBlocked").lean();
    if (!user || !user.isActive || user.isBlocked || (user.role !== "admin" && user.role !== "superadmin")) {
      return NextResponse.json({ error: "Invalid admin session" }, { status: 401 });
    }

    const tokens = await rotateTokens(refreshToken);
    if (!tokens) return NextResponse.json({ error: "Invalid or expired admin refresh token" }, { status: 401 });

    const response = NextResponse.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    });
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };
    response.cookies.set("adminToken", tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 });
    response.cookies.set("adminRefreshToken", tokens.refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 });
    return response;
  } catch (error: unknown) {
    console.error("Admin session refresh failed:", error);
    return NextResponse.json(
      { error: "Unable to refresh admin session. Please try again." },
      { status: 503 },
    );
  }
}
