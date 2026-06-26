/**
 * Security utilities for the application.
 * Implements: Helmet-like headers, CSRF protection, XSS protection, input sanitization.
 */

import { type NextRequest, NextResponse } from "next/server";

/**
 * Generate security headers for all responses.
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Strict Transport Security
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    // Content Security Policy
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
    ].join("; "),
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    // Prevent clickjacking
    "X-Frame-Options": "DENY",
    // XSS Protection
    "X-XSS-Protection": "1; mode=block",
    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Permissions Policy
    "Permissions-Policy": "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
    // X-DNS-Prefetch-Control
    "X-DNS-Prefetch-Control": "on",
    // Cross-Origin Embedder Policy
    "Cross-Origin-Opener-Policy": "same-origin",
    // Cross-Origin Resource Policy
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

/**
 * CSRF token generation and validation.
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
 * Sanitize user input to prevent XSS attacks.
 */
export function sanitizeInput(input: string): string {
  // Use String.fromCharCode to avoid encoding issues
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

/**
 * Rate limit configuration per endpoint.
 */
export const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  "/api/auth/login": { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min
  "/api/auth/register": { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  "/api/auth/refresh": { maxRequests: 10, windowMs: 15 * 60 * 1000 },
  "/api/profile": { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per min
  "/api/profile/search": { maxRequests: 30, windowMs: 60 * 1000 },
  "/api/payment/checkout": { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  "/api/verification": { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  "/api/ai": { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
};

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

/**
 * Generate a consistent audit log entry.
 */
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

export function createAuditLog(
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