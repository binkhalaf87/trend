import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleTrends, fetchDailyTrends } from "@/lib/collectors/google-trends";
import { fetchRedditTrends } from "@/lib/collectors/reddit";
import { fetchPinterestTrends } from "@/lib/collectors/pinterest";
import { processTrends } from "@/lib/collectors/trend-processor";
import { logCollectorRun, verifyCronSecret } from "@/lib/collectors/utils";
import { notifyAdminOnFailure } from "@/lib/collectors/alert-sender";
import type { RawTrendData } from "@/lib/collectors/types";

export const maxDuration = 300; // 5 min — Vercel Pro max for cron routes

// ─── Keywords to track per region ─────────────────────────────────────────────

const TRACKED_KEYWORDS = {
  SA: [
    "عباية", "عطر رجالي", "ساعة ذكية", "أجهزة مطبخ", "ملابس رياضية",
    "كريم تفتيح", "هواتف سامسونج", "أثاث منزلي", "قهوة مختصة",
    "abaya", "saudi fashion", "skincare routine", "smart watch", "gaming phone",
  ],
  AE: [
    "dubai fashion", "luxury bags", "arabic perfume", "home decor",
    "protein powder", "running shoes", "electronics deal",
  ],
};

const SUBREDDITS = [
  "SaudiArabia", "dubai", "AskMiddleEast", "UAE", "Kuwait", "Egypt",
];

const PINTEREST_CATEGORIES = [
  "FASHION", "BEAUTY", "HOME", "ELECTRONICS", "FOOD",
];

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  const allRaw: RawTrendData[] = [];
  const errors: string[] = [];

  // ── 1. Google Trends ──────────────────────────────────────────────────────
  try {
    const [saResults, aeResults, dailySA] = await Promise.allSettled([
      fetchGoogleTrends(TRACKED_KEYWORDS.SA, "SA"),
      fetchGoogleTrends(TRACKED_KEYWORDS.AE, "AE"),
      fetchDailyTrends("SA"),
    ]);

    for (const result of [saResults, aeResults, dailySA]) {
      if (result.status === "fulfilled") {
        allRaw.push(...result.value);
      } else {
        const msg = `Google Trends: ${result.reason?.message ?? result.reason}`;
        errors.push(msg);
        await notifyAdminOnFailure("GOOGLE_TRENDS", msg);
      }
    }
  } catch (err) {
    const msg = `Google Trends fatal: ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
  }

  // ── 2. Reddit ─────────────────────────────────────────────────────────────
  try {
    const redditResults = await fetchRedditTrends(SUBREDDITS, 24);
    allRaw.push(...redditResults);
  } catch (err) {
    const msg = `Reddit: ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
    await notifyAdminOnFailure("REDDIT", msg);
  }

  // ── 3. Pinterest ──────────────────────────────────────────────────────────
  try {
    const pinterestResults = await fetchPinterestTrends(PINTEREST_CATEGORIES);
    allRaw.push(...pinterestResults);
  } catch (err) {
    const msg = `Pinterest: ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
    // Pinterest failures are non-critical (token may not be configured)
  }

  // ── 4. Persist ────────────────────────────────────────────────────────────
  const { created, updated, errors: saveErrors } = await processTrends(allRaw);
  errors.push(...saveErrors);

  const completedAt = new Date();
  const status = errors.length === 0
    ? "SUCCESS"
    : allRaw.length > 0 ? "PARTIAL" : "FAILED";

  await logCollectorRun({
    source: "COLLECT_TRENDS",
    status,
    startedAt,
    completedAt,
    itemsFound: allRaw.length,
    itemsSaved: created + updated,
    errorMsg: errors.length ? errors.join("\n") : undefined,
    metadata: {
      bySource: countBySource(allRaw),
      created,
      updated,
    },
  });

  console.log(`[cron/collect-trends] found=${allRaw.length} created=${created} updated=${updated} errors=${errors.length}`);

  return NextResponse.json({
    ok: true,
    found: allRaw.length,
    created,
    updated,
    errors: errors.length,
    durationMs: completedAt.getTime() - startedAt.getTime(),
  });
}

function countBySource(items: RawTrendData[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.source] = (acc[item.source] ?? 0) + 1;
    return acc;
  }, {});
}
