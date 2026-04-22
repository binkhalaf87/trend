import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) throw new Error("Upstash Redis env vars missing");
    _redis = new Redis({ url, token });
  }
  return _redis;
}

// ─── Generic helpers ──────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    return await getRedis().get<T>(key);
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  try {
    await getRedis().set(key, value, { ex: ttlSeconds });
  } catch {
    // cache miss is non-fatal
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await getRedis().del(key);
  } catch {}
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────
// Returns true if the request is allowed, false if rate-limited.
export async function rateLimit(
  identifier: string,
  maxRequests = 10,
  windowSeconds = 60
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const key     = `rl:${identifier}`;
    const current = await getRedis().incr(key);
    if (current === 1) await getRedis().expire(key, windowSeconds);
    const remaining = Math.max(0, maxRequests - current);
    return { allowed: current <= maxRequests, remaining };
  } catch {
    // If Redis is down, allow the request
    return { allowed: true, remaining: maxRequests };
  }
}

// ─── Named cache helpers ──────────────────────────────────────────────────────

export const CACHE_KEYS = {
  trends:       (userId: string) => `trends:${userId}`,
  trendDetail:  (id: string)     => `trend:${id}`,
  alerts:       (userId: string) => `alerts:${userId}`,
  content:      (userId: string) => `content:${userId}`,
  userProfile:  (id: string)     => `user:${id}`,
} as const;
