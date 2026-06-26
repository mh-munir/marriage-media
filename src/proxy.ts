import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter (per-server instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Enhanced Security Headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(), interest-cohort=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.stripe.com wss: ws:",
      "frame-src 'self' https://js.stripe.com https://www.youtube.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  // CORS for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const pathname = request.nextUrl.pathname;
    const method = request.method;

    // Different rate limits for different endpoints
    let maxRequests = 60;
    let windowMs = 60 * 1000; // 1 minute default

    if (pathname.includes("/auth/login")) {
      maxRequests = 5;
      windowMs = 15 * 60 * 1000; // 5 per 15 min
    } else if (pathname.includes("/auth/register")) {
      maxRequests = 3;
      windowMs = 60 * 60 * 1000; // 3 per hour
    } else if (pathname.includes("/payment/checkout")) {
      maxRequests = 5;
      windowMs = 60 * 60 * 1000; // 5 per hour
    } else if (method !== "GET") {
      maxRequests = 30;
      windowMs = 60 * 1000; // 30 writes per minute
    }

    const rateLimitKey = `${ip}:${pathname}:${method}`;
    if (!checkRateLimit(rateLimitKey, maxRequests, windowMs)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: response.headers }
      );
    }

    response.headers.set("X-RateLimit-Policy", "api");
    response.headers.set("X-Client-IP", ip);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|screenshots/|manifest.json|sw.js).*)",
  ],
};
