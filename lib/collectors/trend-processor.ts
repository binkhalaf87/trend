import { prisma } from "@/lib/prisma";
import type { RawTrendData, AnomalyResult } from "./types";

// ─── Save / update trends from collector output ───────────────────────────────

export async function processTrends(raw: RawTrendData[]): Promise<{
  created: number;
  updated: number;
  errors: string[];
}> {
  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const item of raw) {
    try {
      const existing = await prisma.trend.findUnique({
        where: { titleEn: item.titleEn },
      });

      if (existing) {
        // Merge: take the higher signal value, update metrics
        const newSignal = calcSignalStrength(item);
        await prisma.trend.update({
          where: { id: existing.id },
          data: {
            titleAr: item.titleAr || existing.titleAr,
            summaryAr: item.summaryAr ?? existing.summaryAr,
            descriptionAr: item.descriptionAr ?? existing.descriptionAr,
            category: validateEnum(item.category, VALID_CATEGORIES, existing.category as (typeof VALID_CATEGORIES)[number]) as any,
            growthRate: Math.max(existing.growthRate, item.growthRate ?? 0),
            searchVolume7d: Math.max(
              existing.searchVolume7d,
              item.searchVolume ?? 0
            ),
            socialMentions7d: (existing.socialMentions7d ?? 0) + (item.socialMentions ?? 0),
            signalStrength: Math.max(existing.signalStrength, newSignal),
            engagementScore: Math.max(existing.engagementScore ?? 0, item.engagementScore ?? 0, item.marketSizeScore ?? 0),
            peakExpectedAt: item.peakExpectedAt ?? existing.peakExpectedAt,
            peakConfidence: item.peakConfidence ?? existing.peakConfidence,
            keywords: mergeKeywords(
              existing.keywords as string[],
              item.keywords
            ),
            sourceUrls: mergeKeywords(
              existing.sourceUrls as string[],
              item.sourceUrls ?? []
            ),
            relatedProducts: mergeKeywords(
              existing.relatedProducts as string[],
              item.relatedProducts ?? []
            ),
            updatedAt: new Date(),
          },
        });

        await recordHistory(existing.id, {
          signalStrength: newSignal,
          searchVolume: item.searchVolume ?? 0,
          socialMentions: item.socialMentions ?? 0,
          growthRate: item.growthRate ?? 0,
        });

        updated++;
      } else {
        const newTrend = await prisma.trend.create({
          data: {
            titleEn: item.titleEn,
            titleAr: item.titleAr,
            summaryAr: item.summaryAr,
            descriptionAr: item.descriptionAr,
            category: validateEnum(item.category, VALID_CATEGORIES, "OTHER") as any,
            status: "EARLY",
            source: item.source as any,
            geographicFocus: validateEnum(item.region, VALID_GEO, "GULF") as any,
            signalStrength: calcSignalStrength(item),
            growthRate: item.growthRate ?? 0,
            searchVolume7d: item.searchVolume ?? 0,
            socialMentions7d: item.socialMentions ?? 0,
            engagementScore: item.engagementScore ?? item.marketSizeScore ?? 0,
            peakExpectedAt: item.peakExpectedAt,
            peakConfidence: item.peakConfidence,
            keywords: item.keywords ?? [],
            sourceUrls: item.sourceUrls ?? [],
            relatedProducts: item.relatedProducts ?? [],
            imageUrl: item.imageUrl,
            detectedAt: new Date(),
          },
        });

        await recordHistory(newTrend.id, {
          signalStrength: newTrend.signalStrength,
          searchVolume: item.searchVolume ?? 0,
          socialMentions: item.socialMentions ?? 0,
          growthRate: item.growthRate ?? 0,
        });

        created++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`"${item.titleEn}": ${msg}`);
      console.error("[TrendProcessor] error processing:", item.titleEn, err);
    }
  }

  return { created, updated, errors };
}

// ─── Apply anomaly results back to DB ─────────────────────────────────────────

export async function applyAnomalyResults(
  results: AnomalyResult[]
): Promise<{ updated: number; errors: string[] }> {
  let updated = 0;
  const errors: string[] = [];

  for (const r of results) {
    if (!r.isAnomaly && r.signalStrength < 40) continue;

    try {
      await prisma.trend.update({
        where: { id: r.trendId },
        data: {
          signalStrength: r.signalStrength,
          growthRate: r.growthVs7d,
          status: r.newStatus as any,
          updatedAt: new Date(),
        },
      });
      updated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`trend ${r.trendId}: ${msg}`);
    }
  }

  return { updated, errors };
}

// ─── Load 30-day history for all active trends ────────────────────────────────

export async function loadTrendHistory() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const trends = await prisma.trend.findMany({
    where: {
      status: { not: "DECLINING" },
    },
    select: {
      id: true,
      titleEn: true,
      history: {
        where: { recordedAt: { gte: since } },
        orderBy: { recordedAt: "asc" },
        select: {
          signalStrength: true,
          searchVolume: true,
          socialMentions: true,
          growthRate: true,
          recordedAt: true,
        },
      },
    },
  });

  const map = new Map<
    string,
    { titleEn: string; points: Array<any> }
  >();

  for (const t of trends) {
    if (t.history.length < 3) continue;
    map.set(t.id, {
      titleEn: t.titleEn,
      points: t.history.map((h) => ({
        trendId: t.id,
        titleEn: t.titleEn,
        recordedAt: h.recordedAt,
        signalStrength: h.signalStrength,
        searchVolume: h.searchVolume,
        socialMentions: h.socialMentions,
        growthRate: h.growthRate,
      })),
    });
  }

  return map;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function recordHistory(
  trendId: string,
  metrics: {
    signalStrength: number;
    searchVolume: number;
    socialMentions: number;
    growthRate: number;
  }
): Promise<void> {
  await prisma.trendHistory.create({
    data: { trendId, ...metrics },
  });
}

function calcSignalStrength(item: RawTrendData): number {
  const growth = Math.min(item.growthRate ?? 0, 300);
  const volume = Math.min((item.searchVolume ?? 0) / 1000, 30);
  const social = Math.min((item.socialMentions ?? 0) / 10, 20);
  const raw = Math.min((item.rawScore ?? 0) / 100, 20);
  return Math.round(Math.min(100, (growth / 300) * 30 + volume + social + raw));
}

function mergeKeywords(existing: string[] | unknown, incoming: string[]): string[] {
  const arr = Array.isArray(existing) ? existing : [];
  return Array.from(new Set([...arr, ...incoming])).slice(0, 20);
}

function validateEnum<T extends string>(
  value: string,
  valid: readonly T[],
  fallback: T
): T {
  return valid.includes(value as T) ? (value as T) : fallback;
}

const VALID_CATEGORIES = [
  "FASHION", "BEAUTY", "ELECTRONICS", "HOME", "FOOD",
  "FITNESS", "KIDS", "TRAVEL", "GAMING", "OTHER",
] as const;

const VALID_GEO = [
  "SA", "AE", "KW", "QA", "BH", "OM", "EG", "GULF", "ARAB", "GLOBAL",
] as const;
