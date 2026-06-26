/**
 * In-memory rate limiter for API endpoints.
 * For production, use Redis-backed rate limiting (e.g., @upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 300000);
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  total: number;
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const { windowMs, maxRequests, keyPrefix = "rl" } = config;
  const fullKey = `${keyPrefix}:${key}`;
  const now = Date.now();

  const entry = store.get(fullKey);

  if (!entry || now > entry.resetAt) {
    store.set(fullKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs, total: maxRequests };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, total: maxRequests };
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt, total: maxRequests };
}

/**
 * Rate limit configs for different endpoints
 */
export const RATE_LIMITS = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "login" },
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: "register" },
  api: { windowMs: 60 * 1000, maxRequests: 60, keyPrefix: "api" },
  search: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: "search" },
  message: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: "msg" },
  interest: { windowMs: 60 * 1000, maxRequests: 20, keyPrefix: "interest" },
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: "pwdreset" },
  upload: { windowMs: 60 * 60 * 1000, maxRequests: 20, keyPrefix: "upload" },
} as const;