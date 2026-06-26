/**
 * Redis cache utility with in-memory fallback.
 * 
 * In production, configure REDIS_URL environment variable.
 * Falls back to in-memory cache when Redis is unavailable.
 */

interface CacheEntry {
  value: string;
  expiry: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiry <= now) {
        this.store.delete(key);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiry <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  async flush(): Promise<void> {
    this.store.clear();
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Singleton instances
const memoryCache = new MemoryCache();

let redisClient: unknown = null;
let useRedis = false;

async function getRedisClient(): Promise<unknown> {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  try {
    // Dynamic import to avoid build errors when redis is not installed
    const Redis = (await import("ioredis")).default;
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });
    useRedis = true;
    return redisClient;
  } catch {
    console.warn("Redis not available, using in-memory cache");
    return null;
  }
}

function getCacheKey(prefix: string, key: string): string {
  return `marriage-media:${prefix}:${key}`;
}

export const cache = {
  async get<T>(prefix: string, key: string): Promise<T | null> {
    const cacheKey = getCacheKey(prefix, key);

    // Try Redis first
    if (useRedis) {
      try {
        const client = await getRedisClient();
        if (client) {
          const val = await (client as { get: (k: string) => Promise<string | null> }).get(cacheKey);
          if (val) return JSON.parse(val) as T;
        }
      } catch {
        // Fall through to memory cache
      }
    }

    // Fall back to memory
    const val = await memoryCache.get(cacheKey);
    if (val) return JSON.parse(val) as T;
    return null;
  },

  async set(prefix: string, key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    const cacheKey = getCacheKey(prefix, key);
    const serialized = JSON.stringify(value);

    // Try Redis first
    if (useRedis) {
      try {
        const client = await getRedisClient();
        if (client) {
          await (client as { set: (k: string, v: string, ...args: unknown[]) => Promise<string> }).set(cacheKey, serialized, "EX", ttlSeconds);
          return;
        }
      } catch {
        // Fall through to memory cache
      }
    }

    // Fall back to memory
    await memoryCache.set(cacheKey, serialized, ttlSeconds);
  },

  async del(prefix: string, key: string): Promise<void> {
    const cacheKey = getCacheKey(prefix, key);

    if (useRedis) {
      try {
        const client = await getRedisClient();
        if (client) {
          await (client as { del: (k: string) => Promise<number> }).del(cacheKey);
        }
      } catch {
        // ignore
      }
    }

    await memoryCache.del(cacheKey);
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const fullPattern = `marriage-media:${pattern}`;

    if (useRedis) {
      try {
        const client = await getRedisClient();
        if (client) {
          const keys = await (client as { keys: (p: string) => Promise<string[]> }).keys(fullPattern);
          if (keys.length > 0) {
            await (client as { del: (...keys: string[]) => Promise<number> }).del(...keys);
          }
        }
      } catch {
        // ignore
      }
    }

    await memoryCache.delPattern(`marriage-media:${pattern}`);
  },

  async flush(): Promise<void> {
    if (useRedis) {
      try {
        const client = await getRedisClient();
        if (client) {
          const keys = await (client as { keys: (p: string) => Promise<string[]> }).keys("marriage-media:*");
          if (keys.length > 0) {
            await (client as { del: (...keys: string[]) => Promise<number> }).del(...keys);
          }
        }
      } catch {
        // ignore
      }
    }

    await memoryCache.flush();
  },
};

// Cache key prefixes
export const CACHE_PREFIXES = {
  PROFILE: "profile",
  SEARCH: "search",
  USER: "user",
  RECOMMENDATIONS: "recommendations",
  ADMIN_ANALYTICS: "admin:analytics",
  NOTIFICATIONS: "notifications",
  CONVERSATIONS: "conversations",
  PAYMENTS: "payments",
} as const;

// Cache TTL in seconds
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;