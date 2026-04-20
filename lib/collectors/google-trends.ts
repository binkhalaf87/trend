import googleTrends from "google-trends-api";
import {
  withRetry,
  sleep,
  regionToGeoFocus,
  detectCategory,
  translateTitle,
} from "./utils";
import type {
  RawTrendData,
  GTInterestOverTime,
  GTRelatedQueries,
  GTTimelinePoint,
} from "./types";

// ─── Main collector ───────────────────────────────────────────────────────────

export async function fetchGoogleTrends(
  keywords: string[],
  region: string
): Promise<RawTrendData[]> {
  const results: RawTrendData[] = [];
  const geoFocus = regionToGeoFocus(region);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const keyword of keywords) {
    try {
      const [interestRaw, queriesRaw] = await Promise.allSettled([
        withRetry(() =>
          googleTrends.interestOverTime({
            keyword,
            geo: region,
            startTime: sevenDaysAgo,
            endTime: now,
          })
        ),
        withRetry(() =>
          googleTrends.relatedQueries({ keyword, geo: region })
        ),
      ]);

      if (interestRaw.status === "rejected") {
        console.warn(`[GoogleTrends] interestOverTime failed for "${keyword}":`, interestRaw.reason);
        continue;
      }

      const interestData: GTInterestOverTime = JSON.parse(interestRaw.value);
      const timeline: GTTimelinePoint[] = interestData.default?.timelineData ?? [];

      if (timeline.length < 3) continue;

      const values = timeline.map((p) => p.value[0] ?? 0);
      const growthRate = calcGrowthRate(values);
      const recentAvg = avg(values.slice(-3));

      // Filter: only keep if there's meaningful signal
      if (recentAvg < 10 && growthRate < 50) continue;

      // Rising queries from related queries
      const risingKeywords: string[] = [];
      if (queriesRaw.status === "fulfilled") {
        try {
          const queriesData: GTRelatedQueries = JSON.parse(queriesRaw.value);
          // rankedList[1] = rising, rankedList[0] = top
          const rising = queriesData.default?.rankedList?.[1]?.rankedKeyword ?? [];
          risingKeywords.push(
            ...rising
              .filter((q) => {
                const v = String(q.value);
                return v === "Breakout" || parseInt(v) >= 100;
              })
              .slice(0, 6)
              .map((q) => String(q.query))
          );
        } catch (_) {}
      }

      results.push({
        titleEn: keyword,
        titleAr: translateTitle(keyword),
        keywords: [keyword, ...risingKeywords].slice(0, 10),
        searchVolume: Math.round(recentAvg * 100),
        growthRate: Math.round(growthRate),
        source: "GOOGLE_TRENDS",
        region: geoFocus,
        category: detectCategory([keyword, ...risingKeywords].join(" ")),
        sourceUrls: [
          `https://trends.google.com/trends/explore?q=${encodeURIComponent(keyword)}&geo=${region}`,
        ],
        rawScore: recentAvg,
        metadata: {
          timeline: timeline.slice(-14).map((p) => ({
            time: p.formattedTime,
            value: p.value[0] ?? 0,
          })),
          risingKeywords,
        },
      });

      await sleep(1_500); // respect Google's rate limits
    } catch (err) {
      console.error(`[GoogleTrends] failed for keyword "${keyword}":`, err);
    }
  }

  return results;
}

// ─── Breakout detection: growth ≥ 150% ───────────────────────────────────────

export function findBreakoutKeywords(results: RawTrendData[]): RawTrendData[] {
  return results.filter((r) => (r.growthRate ?? 0) >= 150);
}

// ─── Fetch daily trending searches for a region ───────────────────────────────

export async function fetchDailyTrends(region: string): Promise<RawTrendData[]> {
  const geoFocus = regionToGeoFocus(region);
  const results: RawTrendData[] = [];

  try {
    const raw = await withRetry(() =>
      googleTrends.dailyTrends({ trendDate: new Date(), geo: region, hl: "ar" })
    );

    const data = JSON.parse(raw);
    const stories: Array<{ title: { query: string }; articles?: Array<{ title: string }> }> =
      data.default?.trendingSearchesDays?.[0]?.trendingSearches ?? [];

    for (const story of stories.slice(0, 20)) {
      const keyword = story.title?.query ?? "";
      if (!keyword) continue;

      results.push({
        titleEn: keyword,
        titleAr: translateTitle(keyword),
        keywords: [keyword],
        source: "GOOGLE_TRENDS",
        region: geoFocus,
        category: detectCategory(keyword),
        growthRate: 100, // daily trends are inherently "breaking"
        sourceUrls: [
          `https://trends.google.com/trends/trendingsearches/daily?geo=${region}`,
        ],
        rawScore: 80,
      });
    }
  } catch (err) {
    console.error("[GoogleTrends] fetchDailyTrends failed:", err);
  }

  return results;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function calcGrowthRate(values: number[]): number {
  if (values.length < 4) return 0;
  const half = Math.floor(values.length / 2);
  const oldAvg = avg(values.slice(0, half));
  const newAvg = avg(values.slice(half));
  if (oldAvg === 0) return newAvg > 0 ? 999 : 0;
  return ((newAvg - oldAvg) / oldAvg) * 100;
}
