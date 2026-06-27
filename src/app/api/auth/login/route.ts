import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  generateTokenPair,
  isAccountLocked,
  recordFailedLoginAttempt,
  resetFailedLoginAttempts,
  detectSuspiciousLogin,
  createDeviceSession,
  recordLoginHistory,
  saveAuditLog,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    // 1 ── Rate limiting
    const rateLimitResult = checkRateLimit(ipAddress, RATE_LIMITS.login);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(rateLimitResult.total),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 2 ── Validate input
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const { email, password } = result.data;

    // 3 ── Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // 4 ── Account lockout check
    if (await isAccountLocked(user._id.toString())) {
      const lockoutInfo = await User.findById(user._id).select("lockedUntil");
      const remainingMs = lockoutInfo?.lockedUntil
        ? new Date(lockoutInfo.lockedUntil).getTime() - Date.now()
        : 0;
      const remainingMinutes = Math.ceil(Math.max(0, remainingMs) / 60000);

      // Record blocked login
      await recordLoginHistory({
        userId: user._id.toString(),
        ipAddress,
        userAgent,
        status: "blocked",
        failureReason: "account_locked",
      });

      return NextResponse.json(
        {
          error: `Account is locked. Please try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}.`,
          lockedUntil: lockoutInfo?.lockedUntil,
        },
        { status: 423 }
      );
    }

    // 5 ── Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // 6 ── Check if user is blocked
    if (user.isBlocked) {
      return NextResponse.json(
        { error: "Your account has been blocked. Please contact support." },
        { status: 403 }
      );
    }

    // 7 ── Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Record failed attempt & check lockout
      const { locked, attemptsRemaining } = await recordFailedLoginAttempt(user._id.toString());

      await recordLoginHistory({
        userId: user._id.toString(),
        ipAddress,
        userAgent,
        status: "failed",
        failureReason: "invalid_password",
      });

      if (locked) {
        return NextResponse.json(
          { error: "Account locked due to too many failed attempts. Please try again in 30 minutes." },
          { status: 423 }
        );
      }

      return NextResponse.json(
        {
          error: "Invalid email or password",
          attemptsRemaining,
        },
        { status: 401 }
      );
    }

    // 8 ── Detect suspicious login
    const suspiciousCheck = await detectSuspiciousLogin(
      user._id.toString(),
      ipAddress,
      userAgent
    );

    // 9 ── Successful login — reset lockout, generate tokens
    await resetFailedLoginAttempts(user._id.toString());

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // JWT rotation: generate access + refresh token pair
    const tokens = generateTokenPair(tokenPayload);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // 10 ── Record login history
    await recordLoginHistory({
      userId: user._id.toString(),
      ipAddress,
      userAgent,
      status: "success",
      isSuspicious: suspiciousCheck.isSuspicious,
    });

    // 11 ── Create device session
    await createDeviceSession(user._id.toString(), ipAddress, userAgent);

    // 12 ── Audit log
    await saveAuditLog(
      request,
      "login",
      "auth",
      user._id.toString(),
      user._id.toString(),
      {
        email: user.email,
        ip: ipAddress,
        suspicious: suspiciousCheck.isSuspicious,
        suspiciousReasons: suspiciousCheck.reasons,
        riskScore: suspiciousCheck.riskScore,
      }
    );

    // 13 ── Build response
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      // Include token pair for client-side JWT rotation
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      // Only warn the user (don't block) if login is suspicious
      ...(suspiciousCheck.isSuspicious && {
        securityWarning: {
          message: "Unusual login detected. If this wasn't you, change your password immediately.",
          reasons: suspiciousCheck.reasons,
        },
      }),
    });

    // Short-lived access token in cookie
    response.cookies.set("token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes (matches JWT expiry)
      path: "/",
    });

    // Long-lived refresh token in cookie
    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}