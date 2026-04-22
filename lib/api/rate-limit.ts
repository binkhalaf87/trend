import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/cache/redis";

/**
 * Wrap an API route handler with rate limiting.
 * Falls back gracefully if Redis is unavailable.
 */
export function withRateLimit(
  handler: (req: NextRequest, ctx?: unknown) => Promise<NextResponse>,
  options: { max?: number; windowSeconds?: number; keyFn?: (req: NextRequest) => string } = {}
) {
  return async (req: NextRequest, ctx?: unknown): Promise<NextResponse> => {
    const { max = 20, windowSeconds = 60, keyFn } = options;

    const identifier = keyFn
      ? keyFn(req)
      : req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

    const { allowed, remaining } = await rateLimit(
      `api:${req.nextUrl.pathname}:${identifier}`,
      max,
      windowSeconds
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "طلبات كثيرة جداً. حاول لاحقاً." },
        {
          status: 429,
          headers: {
            "Retry-After":           String(windowSeconds),
            "X-RateLimit-Limit":     String(max),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const res = await handler(req, ctx);
    res.headers.set("X-RateLimit-Limit",     String(max));
    res.headers.set("X-RateLimit-Remaining", String(remaining));
    return res;
  };
}
