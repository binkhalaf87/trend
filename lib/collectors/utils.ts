import { prisma } from "@/lib/prisma";
import type { RetryOptions } from "./types";

// ─── Retry with exponential backoff ───────────────────────────────────────────

const DEFAULTS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 1_000,
  maxDelayMs: 30_000,
  backoffFactor: 2,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULTS, ...options };
  let lastError: Error | undefined;
  let delay = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === opts.maxAttempts) break;
      console.warn(`[retry] attempt ${attempt} failed, retrying in ${delay}ms`);
      await sleep(delay);
      delay = Math.min(delay * opts.backoffFactor, opts.maxDelayMs);
    }
  }
  throw lastError;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── DB logger ────────────────────────────────────────────────────────────────

export async function logCollectorRun(data: {
  source: string;
  status: string;
  startedAt: Date;
  completedAt?: Date;
  itemsFound?: number;
  itemsSaved?: number;
  errorMsg?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.collectorRun.create({ data });
  } catch (e) {
    console.error("[logCollectorRun] could not persist:", e);
  }
}

// ─── Category detection ───────────────────────────────────────────────────────

const CATEGORY_PATTERNS: Array<[RegExp, string]> = [
  [/fashion|clothes|dress|abaya|hijab|عباية|ملابس|موضة|عبايات/i, "FASHION"],
  [/beauty|makeup|skincare|perfume|عطر|مكياج|بشرة|كريم/i, "BEAUTY"],
  [/phone|laptop|tablet|tech|إلكترون|هاتف|جهاز|تقنية/i, "ELECTRONICS"],
  [/home|decor|furniture|kitchen|منزل|ديكور|أثاث|مطبخ/i, "HOME"],
  [/food|recipe|restaurant|cafe|طعام|وصفة|مطعم|قهوة/i, "FOOD"],
  [/fitness|gym|sport|yoga|رياضة|لياقة|تمرين/i, "FITNESS"],
  [/kids|children|baby|toy|أطفال|طفل|لعبة/i, "KIDS"],
  [/travel|hotel|flight|vacation|سفر|فندق|رحلة/i, "TRAVEL"],
  [/game|gaming|playstation|xbox|ألعاب|قيمنق/i, "GAMING"],
];

export function detectCategory(text: string): string {
  for (const [pattern, category] of CATEGORY_PATTERNS) {
    if (pattern.test(text)) return category;
  }
  return "OTHER";
}

// ─── Region → GeoFocus enum ───────────────────────────────────────────────────

const GEO_MAP: Record<string, string> = {
  SA: "SA", AE: "AE", KW: "KW", QA: "QA",
  BH: "BH", OM: "OM", EG: "EG",
  GULF: "GULF", ARAB: "ARAB",
};

export function regionToGeoFocus(region: string): string {
  return GEO_MAP[region.toUpperCase()] ?? "GULF";
}

// ─── English → Arabic keyword map (commercial terms) ─────────────────────────

const EN_AR_MAP: Record<string, string> = {
  fashion: "موضة", beauty: "جمال", shoes: "أحذية", clothes: "ملابس",
  phone: "هاتف", laptop: "لابتوب", perfume: "عطر", watch: "ساعة",
  bag: "حقيبة", makeup: "مكياج", skincare: "عناية بالبشرة",
  food: "طعام", coffee: "قهوة", gaming: "قيمنق", travel: "سفر",
  fitness: "لياقة", kids: "أطفال", home: "منزل", decor: "ديكور",
};

export function translateTitle(titleEn: string): string {
  const lower = titleEn.toLowerCase();
  for (const [en, ar] of Object.entries(EN_AR_MAP)) {
    if (lower.includes(en)) return `${ar} (${titleEn})`;
  }
  return titleEn; // fallback: keep English (AI generator will translate later)
}

// ─── Commercial keyword extraction ────────────────────────────────────────────

const COMMERCIAL_SIGNALS_EN = [
  "buy", "shop", "store", "price", "sale", "discount", "deal",
  "best", "review", "where to", "how much", "order",
];

const COMMERCIAL_SIGNALS_AR = [
  "شراء", "بيع", "سعر", "عرض", "خصم", "متجر", "أفضل", "مكان",
];

export function isCommercialQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    COMMERCIAL_SIGNALS_EN.some((s) => lower.includes(s)) ||
    COMMERCIAL_SIGNALS_AR.some((s) => text.includes(s))
  );
}

// ─── Simple rate limiter (token bucket) ───────────────────────────────────────

export function createRateLimiter(callsPerMinute: number) {
  let tokens = callsPerMinute;
  const interval = setInterval(() => {
    tokens = callsPerMinute;
  }, 60_000);
  if (typeof interval === "object" && "unref" in interval) {
    (interval as NodeJS.Timeout).unref();
  }

  return async function throttle<T>(fn: () => Promise<T>): Promise<T> {
    while (tokens <= 0) {
      await sleep(500);
    }
    tokens--;
    return fn();
  };
}

// ─── Cron auth guard ──────────────────────────────────────────────────────────

export function verifyCronSecret(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
