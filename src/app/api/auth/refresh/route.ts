export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { rotateTokens } from "@/lib/security";
import { saveAuditLog } from "@/lib/security";

/**
 * JWT Rotation endpoint.
 * Client sends the refresh token; server invalidates it and issues a new pair.
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    const refreshToken =
      request.cookies.get("refreshToken")?.value ||
      (await request.json().catch(() => ({})) as Record<string, string>).refreshToken;

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 401 });
    }

    // Rotate: revoke old, issue new pair
    const newTokens = await rotateTokens(refreshToken);

    if (!newTokens) {
      // Invalid or revoked refresh token
      await saveAuditLog(
        request,
        "token_refresh_failed",
        "auth",
        undefined,
        undefined,
        { reason: "invalid_or_revoked_refresh_token" }
      );

      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    // Audit log
    await saveAuditLog(
      request,
      "token_refresh",
      "auth",
      undefined,
      undefined,
      { newAccessTokenExpiresAt: newTokens.accessTokenExpiresAt }
    );

    const response = NextResponse.json({
      message: "Tokens refreshed",
      accessToken: newTokens.accessToken,
      accessTokenExpiresAt: newTokens.accessTokenExpiresAt,
    });

    // Update access token cookie
    response.cookies.set("token", newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    // Update refresh token cookie
    response.cookies.set("refreshToken", newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}