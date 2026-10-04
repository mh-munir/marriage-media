import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter (per-server instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// In-memory IP blacklist/whitelist (swap with DB lookups in production)
const ipBlacklist = new Set<string>();
const ipWhitelist = new Set<string>();

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

  const visitorId = request.cookies.get("siteVisitorId")?.value;
  if (
    request.method === "GET" &&
    request.headers.get("accept")?.includes("text/html") &&
    (!visitorId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId))
  ) {
    response.cookies.set("siteVisitorId", crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

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
    "camera=(), microphone=(self), geolocation=()"
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

  // Extract client IP early for all security checks
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

  // CORS for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  // IP Blacklist / Whitelist
  if (ipBlacklist.has(ip)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (ipWhitelist.size > 0 && !ipWhitelist.has(ip)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Request body size limit (10 MB)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
    return new NextResponse("Payload Too Large", { status: 413 });
  }

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  // SQL-Injection / XSS early rejection on URLs
  const fullUrl = request.nextUrl.href;
  const injectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b)/i,
    /(<script\b[^>]*>[\s\S]*?<\/script>)/gi,
    /(javascript:)/gi,
    /(on\w+\s*=\s*['"])/gi,
    /(data:text\/html)/gi,
  ];
  if (injectionPatterns.some((p) => p.test(fullUrl))) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // CSRF protection for state-changing form submissions
  const method = request.method.toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const origin = request.headers.get("origin");
      const referer = request.headers.get("referer");
      const host = request.headers.get("host");
      const validOrigin = origin && host && origin.includes(host);
      const validReferer = referer && host && referer.includes(host);
      if (!validOrigin && !validReferer) {
        return new NextResponse("CSRF Validation Failed", { status: 403 });
      }
    }
  }

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const pathname = request.nextUrl.pathname;
    const apiMethod = request.method;

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
    } else if (apiMethod !== "GET") {
      maxRequests = 30;
      windowMs = 60 * 1000; // 30 writes per minute
    }

    const rateLimitKey = `${ip}:${pathname}:${apiMethod}`;
    if (!checkRateLimit(rateLimitKey, maxRequests, windowMs)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: response.headers }
      );
    }

    response.headers.set("X-RateLimit-Policy", "api");
    response.headers.set("X-Client-IP", ip);
  }

  // Add request ID for traceability
  response.headers.set("X-Request-ID", crypto.randomUUID());

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|screenshots/|manifest.json|sw.js).*)",
  ],
};
