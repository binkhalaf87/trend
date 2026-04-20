import type { TrendCategory } from "@/types/db";

/**
 * Prisma يُعيد حقول Json كـ `unknown`. هذه الدوال تُحوّلها للأنواع الصحيحة.
 */

export function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function parseCategoryArray(value: unknown): TrendCategory[] {
  return parseStringArray(value) as TrendCategory[];
}

export function parseMetadata(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/** تحويل Prisma Trend row لـ DbTrend مع casting صحيح */
export function hydrateTrend<T extends {
  keywords: unknown;
  relatedProducts: unknown;
  sourceUrls: unknown;
}>(row: T): Omit<T, "keywords" | "relatedProducts" | "sourceUrls"> & {
  keywords: string[];
  relatedProducts: string[];
  sourceUrls: string[];
} {
  return {
    ...row,
    keywords:        parseStringArray(row.keywords),
    relatedProducts: parseStringArray(row.relatedProducts),
    sourceUrls:      parseStringArray(row.sourceUrls),
  };
}

/** تحويل TrendContent row */
export function hydrateTrendContent<T extends { hashtags: unknown }>(
  row: T
): Omit<T, "hashtags"> & { hashtags: string[] } {
  return { ...row, hashtags: parseStringArray(row.hashtags) };
}

/** تحويل Influencer row */
export function hydrateInfluencer<T extends { categories: unknown }>(
  row: T
): Omit<T, "categories"> & { categories: TrendCategory[] } {
  return { ...row, categories: parseCategoryArray(row.categories) };
}

/** بناء where clause للفلترة بكفاءة */
export function buildTrendWhere(params: {
  category?: string;
  status?: string;
  source?: string;
  geo?: string;
  minSignal?: number;
}) {
  return {
    ...(params.category  && { category:        params.category  as any }),
    ...(params.status    && { status:           params.status    as any }),
    ...(params.source    && { source:           params.source    as any }),
    ...(params.geo       && { geographicFocus:  params.geo       as any }),
    ...(params.minSignal && { signalStrength:   { gte: params.minSignal } }),
  };
}
