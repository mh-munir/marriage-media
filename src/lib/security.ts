/**
 * Security utilities for the application.
 * Implements: Helmet-like headers, CSRF protection, XSS protection, input sanitization,
 * JWT rotation, account lockout, IP whitelist/blacklist, suspicious login detection.
 */

import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "./mongodb";
import { User, LoginHistory, AuditLog, DeviceSession, BlockedIP, RevokedToken } from "@/models";
import { parseUserAgent, generateDeviceFingerprint } from "./device-parser";

const JWT_SECRET = process.env.JWT_SECRET!;

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Generate security headers for all responses.
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://www.google-analytics.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.stripe.com https://*.bkash.com https://sandbox.sslcommerz.com https://securepay.sslcommerz.com wss:",
      "frame-src 'self' https://js.stripe.com https://www.youtube.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(self), geolocation=()",
    "X-DNS-Prefetch-Control": "on",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}

/**
 * Apply security headers to a response.
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

// ============================================================================
// CSRF PROTECTION
// ============================================================================

/**
 * Generate a cryptographically secure CSRF token.
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate CSRF token from request header against session token.
 */
export function validateCSRFToken(
  requestToken: string | null,
  sessionToken: string | null
): boolean {
  if (!requestToken || !sessionToken) return false;
  return requestToken === sessionToken;
}

// ============================================================================
// XSS PROTECTION
// ============================================================================

/**
 * Sanitize user input to prevent XSS attacks.
 */
export function sanitizeInput(input: string): string {
  const map: Record<string, string> = {};
  map["&"] = String.fromCharCode(38) + "amp;";
  map["<"] = String.fromCharCode(38) + "lt;";
  map[">"] = String.fromCharCode(38) + "gt;";
  map['"'] = String.fromCharCode(38) + "quot;";
  map["'"] = String.fromCharCode(38) + "#x27;";
  map["/"] = String.fromCharCode(38) + "#x2F;";
  const reg = /[&<>"'/]/g;
  return input.replace(reg, (char) => map[char] || char);
}

/**
 * Validate that input doesn't contain common XSS patterns.
 */
export function containsXSS(input: string): boolean {
  const patterns = [
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /expression\(/gi,
  ];
  return patterns.some((pattern) => pattern.test(input));
}

// ============================================================================
// SQL INJECTION PREVENTION
// ============================================================================

/**
 * Validate that a string doesn't contain common injection patterns.
 */
export function containsSQLInjection(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|FETCH|DECLARE|TRUNCATE)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(CHAR\(|CONCAT\(|0x[0-9a-f]+)/i,
  ];
  return patterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize a request body against injection attacks.
 */
export function validateRequestBody(
  body: Record<string, unknown>
): { valid: boolean; error?: string } {
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      if (containsSQLInjection(value)) {
        return { valid: false, error: `Invalid characters detected in field: ${key}` };
      }
      if (containsXSS(value)) {
        return { valid: false, error: `Potentially malicious content detected in field: ${key}` };
      }
    }
  }
  return { valid: true };
}

// ============================================================================
// RATE LIMITING CONFIG
// ============================================================================

/**
 * Rate limit configuration per endpoint.
 */
export const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  "/api/auth/login": { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  "/api/auth/register": { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  "/api/auth/refresh": { maxRequests: 10, windowMs: 15 * 60 * 1000 },
  "/api/profile": { maxRequests: 30, windowMs: 60 * 1000 },
  "/api/profile/search": { maxRequests: 30, windowMs: 60 * 1000 },
  "/api/payment/checkout": { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  "/api/verification": { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  "/api/ai": { maxRequests: 20, windowMs: 60 * 60 * 1000 },
};

// ============================================================================
// IP HELPERS
// ============================================================================

/**
 * Get the client IP from request headers.
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ============================================================================
// JWT ROTATION
// ============================================================================

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

/**
 * Generate a short-lived access token (15 minutes).
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

/**
 * Generate a long-lived refresh token (30 days).
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign({ ...payload, type: "refresh" }, JWT_SECRET, { expiresIn: "30d" });
}

/**
 * Generate both access and refresh tokens (JWT rotation).
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ ...payload, type: "refresh" }, JWT_SECRET, { expiresIn: "30d" });
  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };
}

/**
 * Rotate tokens: issue new pair from a valid refresh token, invalidate the old one.
 */
export async function rotateTokens(
  oldRefreshToken: string
): Promise<TokenPair | null> {
  let payload: JWTPayload & { type: string };
  try {
    payload = jwt.verify(oldRefreshToken, JWT_SECRET) as JWTPayload & { type: string };
  } catch {
    return null;
  }
  if (payload.type !== "refresh") return null;

  await connectToDatabase();
  const isRevoked = await RevokedToken.findOne({ token: oldRefreshToken });
  if (isRevoked) return null;

  try {
    await RevokedToken.create({ token: oldRefreshToken, revokedAt: new Date() });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return null;
    }
    throw error;
  }

  return generateTokenPair({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  });
}

/**
 * Verify an access token.
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// ACCOUNT LOCKOUT
// ============================================================================

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const FAILED_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if an account is currently locked.
 */
export async function isAccountLocked(userId: string): Promise<boolean> {
  await connectToDatabase();
  const user = await User.findById(userId).select("lockedUntil");
  if (!user) return false;
  if (!user.lockedUntil) return false;
  return new Date(user.lockedUntil) > new Date();
}

/**
 * Record a failed login attempt and lock the account if threshold is exceeded.
 */
export async function recordFailedLoginAttempt(
  userId: string
): Promise<{ locked: boolean; attemptsRemaining: number }> {
  await connectToDatabase();

  const user = await User.findById(userId).select("failedLoginAttempts lockedUntil lastFailedLoginAt");
  if (!user) return { locked: false, attemptsRemaining: MAX_FAILED_ATTEMPTS };

  const now = new Date();

  // Reset counter if outside the window
  if (user.lastFailedLoginAt && now.getTime() - new Date(user.lastFailedLoginAt).getTime() > FAILED_ATTEMPT_WINDOW_MS) {
    user.failedLoginAttempts = 0;
  }

  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
  user.lastFailedLoginAt = now;

  let locked = false;
  if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    user.lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS);
    locked = true;

    // Log the lockout
    await AuditLog.create({
      userId: user._id,
      action: "account_locked",
      resource: "auth",
      ipAddress: "system",
      userAgent: "system",
      details: {
        reason: "max_failed_attempts",
        attempts: user.failedLoginAttempts,
        lockedUntil: user.lockedUntil,
      },
    });
  }

  await user.save();

  return {
    locked,
    attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - user.failedLoginAttempts),
  };
}

/**
 * Reset failed login attempts on successful login.
 */
export async function resetFailedLoginAttempts(userId: string): Promise<void> {
  await connectToDatabase();
  await User.findByIdAndUpdate(userId, {
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastFailedLoginAt: null,
  });
}

// ============================================================================
// SUSPICIOUS LOGIN DETECTION
// ============================================================================

export interface SuspiciousLoginResult {
  isSuspicious: boolean;
  reasons: string[];
  riskScore: number;
}

/**
 * Analyze a login attempt for suspicious indicators.
 */
export async function detectSuspiciousLogin(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<SuspiciousLoginResult> {
  await connectToDatabase();

  let riskScore = 0;
  const reasons: string[] = [];

  // 1. Check for rapid IP changes
  const recentIPs = await LoginHistory.distinct("ipAddress", {
    userId,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  if (recentIPs.length > 5) {
    riskScore += 30;
    reasons.push(`${recentIPs.length} different IPs in 24h`);
  }

  // 2. Check for impossible travel (same time, very different location)
  const recentLogins = await LoginHistory.find({
    userId,
    status: "success",
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
  }).sort({ createdAt: -1 }).limit(5);

  if (recentLogins.length > 0) {
    const lastLogin = recentLogins[0];
    if (lastLogin.ipAddress !== ipAddress) {
      const timeDiff = Date.now() - new Date(lastLogin.createdAt).getTime();
      if (timeDiff < 5 * 60 * 1000) {
        // 5 minutes
        riskScore += 40;
        reasons.push("Rapid IP change within 5 minutes");
      }
    }
  }

  // 3. Check if device is new
  const knownDevices = await LoginHistory.distinct("deviceFingerprint", {
    userId,
    status: "success",
  });
  const fingerprint = generateDeviceFingerprint(ipAddress, userAgent);
  if (knownDevices.length > 0 && !knownDevices.includes(fingerprint)) {
    riskScore += 15;
    reasons.push("New device detected");
  }

  // 4. Check for multiple accounts from same IP
  const accountsFromIP = await LoginHistory.distinct("userId", {
    ipAddress,
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });
  if (accountsFromIP.length > 2) {
    riskScore += 25;
    reasons.push(`${accountsFromIP.length} accounts from same IP`);
  }

  // 5. Check for failed login spike
  const recentFailed = await LoginHistory.countDocuments({
    userId,
    status: "failed",
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
  });
  if (recentFailed >= 3) {
    riskScore += 20;
    reasons.push(`${recentFailed} failed attempts in last hour`);
  }

  return {
    isSuspicious: riskScore >= 25,
    reasons,
    riskScore,
  };
}

// ============================================================================
// IP WHITELIST / BLACKLIST (Database-backed)
// ============================================================================

export interface IPEntry {
  ip: string;
  reason: string;
  addedBy?: string;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Check if an IP is blacklisted (database-backed, used by API routes).
 */
export async function isIPBlacklisted(ipAddress: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const entry = await BlockedIP.findOne({
      ip: ipAddress,
      type: "blacklist",
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    });
    return !!entry;
  } catch {
    return false;
  }
}

/**
 * Check if an IP is whitelisted.
 */
export async function isIPWhitelisted(ipAddress: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const entry = await BlockedIP.findOne({ ip: ipAddress, type: "whitelist" });
    return !!entry;
  } catch {
    return false;
  }
}

/**
 * Add an IP to the blacklist.
 */
export async function blacklistIP(
  ip: string,
  reason: string,
  addedBy?: string,
  expiresAt?: Date
): Promise<void> {
  await connectToDatabase();
  await BlockedIP.findOneAndUpdate(
    { ip, type: "blacklist" },
    { ip, type: "blacklist", reason, addedBy, expiresAt, createdAt: new Date() },
    { upsert: true }
  );
}

/**
 * Remove an IP from the blacklist.
 */
export async function unblacklistIP(ip: string): Promise<void> {
  await connectToDatabase();
  await BlockedIP.deleteOne({ ip, type: "blacklist" });
}

/**
 * Add an IP to the whitelist.
 */
export async function whitelistIP(
  ip: string,
  reason: string,
  addedBy?: string
): Promise<void> {
  await connectToDatabase();
  await BlockedIP.findOneAndUpdate(
    { ip, type: "whitelist" },
    { ip, type: "whitelist", reason, addedBy, createdAt: new Date() },
    { upsert: true }
  );
}

/**
 * Remove an IP from the whitelist.
 */
export async function removeWhitelistIP(ip: string): Promise<void> {
  await connectToDatabase();
  await BlockedIP.deleteOne({ ip, type: "whitelist" });
}

/**
 * Get all blacklist entries.
 */
export async function getBlacklistedIPs(): Promise<IPEntry[]> {
  await connectToDatabase();
  return BlockedIP.find({ type: "blacklist" }).sort({ createdAt: -1 }).lean();
}

/**
 * Get all whitelist entries.
 */
export async function getWhitelistedIPs(): Promise<IPEntry[]> {
  await connectToDatabase();
  return BlockedIP.find({ type: "whitelist" }).sort({ createdAt: -1 }).lean();
}

// ============================================================================
// DEVICE SESSION MANAGEMENT
// ============================================================================

/**
 * Create a device session on login.
 */
export async function createDeviceSession(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await connectToDatabase();
  const deviceInfo = parseUserAgent(userAgent);
  const deviceFingerprint = generateDeviceFingerprint(ipAddress, userAgent);

  // Mark old sessions as inactive if same fingerprint
  await DeviceSession.updateMany(
    { userId, deviceFingerprint },
    { isActive: false, logoutAt: new Date() }
  );

  // Create new session
  await DeviceSession.create({
    userId,
    deviceFingerprint,
    deviceType: deviceInfo.deviceType,
    deviceBrand: deviceInfo.deviceBrand,
    os: deviceInfo.os,
    browser: deviceInfo.browser,
    ipAddress,
    isActive: true,
    loginAt: new Date(),
    lastActivityAt: new Date(),
  });
}

/**
 * Update last activity timestamp for a device session.
 */
export async function updateDeviceActivity(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await connectToDatabase();
  const deviceFingerprint = generateDeviceFingerprint(ipAddress, userAgent);
  await DeviceSession.findOneAndUpdate(
    { userId, deviceFingerprint, isActive: true },
    { lastActivityAt: new Date() }
  );
}

/**
 * Revoke a specific device session.
 */
export async function revokeDeviceSession(
  userId: string,
  sessionId: string
): Promise<void> {
  await connectToDatabase();
  await DeviceSession.findOneAndUpdate(
    { _id: sessionId, userId },
    { isActive: false, logoutAt: new Date() }
  );
}

/**
 * Revoke all device sessions for a user.
 */
export async function revokeAllDeviceSessions(userId: string): Promise<void> {
  await connectToDatabase();
  await DeviceSession.updateMany(
    { userId, isActive: true },
    { isActive: false, logoutAt: new Date() }
  );
}

/**
 * Get active device sessions for a user.
 */
export async function getActiveDeviceSessions(userId: string) {
  await connectToDatabase();
  return DeviceSession.find({ userId, isActive: true })
    .sort({ lastActivityAt: -1 })
    .lean();
}

// ============================================================================
// LOGIN HISTORY
// ============================================================================

/**
 * Record a login attempt (success or failure).
 */
export async function recordLoginHistory(params: {
  userId: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failed" | "blocked";
  failureReason?: string;
  isSuspicious?: boolean;
}): Promise<void> {
  await connectToDatabase();
  const deviceInfo = parseUserAgent(params.userAgent);
  const deviceFingerprint = generateDeviceFingerprint(params.ipAddress, params.userAgent);

  await LoginHistory.create({
    userId: params.userId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    deviceFingerprint,
    deviceType: deviceInfo.deviceType,
    deviceBrand: deviceInfo.deviceBrand,
    os: deviceInfo.os,
    browser: deviceInfo.browser,
    status: params.status,
    failureReason: params.failureReason || "",
    isSuspicious: params.isSuspicious || false,
  });
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

/**
 * Generate a consistent audit log entry.
 */
export function createAuditLogEntry(
  request: NextRequest,
  action: string,
  resource: string,
  resourceId?: string,
  userId?: string,
  details?: Record<string, unknown>
): AuditLogEntry {
  return {
    userId,
    action,
    resource,
    resourceId,
    ipAddress: getClientIP(request),
    userAgent: request.headers.get("user-agent") || "unknown",
    timestamp: new Date(),
    details,
  };
}

/**
 * Persist an audit log entry to the database.
 */
export async function saveAuditLog(
  request: NextRequest,
  action: string,
  resource: string,
  resourceId?: string,
  userId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await connectToDatabase();
    await AuditLog.create(
      createAuditLogEntry(request, action, resource, resourceId, userId, details)
    );
  } catch (error) {
    console.error("Failed to save audit log:", error);
  }
}