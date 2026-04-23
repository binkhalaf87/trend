import { withRetry, sleep, detectCategory, translateTitle, regionToGeoFocus } from "./utils";
import type { RawTrendData, PinterestTrendItem, PinterestTrendsResponse } from "./types";

const PINTEREST_API = "https://api.pinterest.com/v5";

// Pinterest supports limited regions for their Trends API
const SUPPORTED_REGIONS = ["US", "GB", "AU", "CA", "DE", "FR"];

// ─── Main collector ───────────────────────────────────────────────────────────

export async function fetchPinterestTrends(
  categories: string[] = [],
  region = "US"
): Promise<RawTrendData[]> {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) {
    console.warn("[Pinterest] PINTEREST_ACCESS_TOKEN not set — skipping");
    return [];
  }

  // Pinterest API only supports specific regions — use US as proxy for now
  const apiRegion = SUPPORTED_REGIONS.includes(region) ? region : "US";
  const results: RawTrendData[] = [];

  for (const trendType of ["growing", "monthly"] as const) {
    try {
      const trends = await withRetry(() =>
        fetchTrendsByType(token, apiRegion, trendType)
      );
      results.push(...mapToRawTrends(trends, categories));
      await sleep(500);
    } catch (err) {
      console.error(`[Pinterest] fetchTrendsByType(${trendType}) failed:`, err);
    }
  }

  return deduplicateByTitle(results);
}

// ─── API call ─────────────────────────────────────────────────────────────────

async function fetchTrendsByType(
  token: string,
  region: string,
  trendType: "growing" | "monthly"
): Promise<PinterestTrendItem[]> {
  const params = new URLSearchParams({
    limit: "50",
    trend_type: trendType,
  });

  const url = `${PINTEREST_API}/trends/keywords/${region}/top/monthly?${params}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 0 },
  });

  if (res.status === 401) throw new Error("Pinterest token expired or invalid");
  if (res.status === 403) throw new Error("Pinterest API access forbidden");
  if (!res.ok) throw new Error(`Pinterest API ${res.status}: ${await res.text()}`);

  const data: PinterestTrendsResponse = await res.json();
  return data.trends ?? [];
}

// ─── Map Pinterest data to RawTrendData ───────────────────────────────────────

function mapToRawTrends(
  items: PinterestTrendItem[],
  filterCategories: string[]
): RawTrendData[] {
  return items
    .filter((item) => {
      if (!filterCategories.length) return true;
      const category = detectCategory(item.keyword);
      return filterCategories.includes(category);
    })
    .filter((item) => item.monthly_growth_percent > 10) // only meaningful growth
    .map((item) => {
      const growthRate = Math.max(
        item.monthly_growth_percent,
        item.weekly_growth_percent
      );

      const timeSeries = item.time_series ?? [];
      const recentValues = timeSeries.slice(-7).map((p) => p.value);
      const avgValue = recentValues.length
        ? recentValues.reduce((a, b) => a + b, 0) / recentValues.length
        : 50;

      return {
        titleEn: item.keyword,
        titleAr: translateTitle(item.keyword),
        keywords: [item.keyword, ...extractRelatedKeywords(item.keyword)],
        searchVolume: Math.round(avgValue * 100),
        growthRate: Math.round(growthRate),
        source: "PINTEREST" as const,
        region: "GLOBAL",
        category: detectCategory(item.keyword),
        sourceUrls: [
          `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(item.keyword)}`,
        ],
        rawScore: avgValue,
        metadata: {
          weeklyGrowth: item.weekly_growth_percent,
          monthlyGrowth: item.monthly_growth_percent,
          yoyGrowth: item.yoy_growth_percent,
          trendType: item.trend_type,
          timeSeries: timeSeries.slice(-14),
        },
      } satisfies RawTrendData;
    });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractRelatedKeywords(keyword: string): string[] {
  // Generate simple variations: adjectives, suffixes
  const words = keyword.toLowerCase().split(/\s+/);
  const variants: string[] = [];

  if (words.length > 1) {
    variants.push(words[words.length - 1]); // last word alone
    variants.push(words[0]);               // first word alone
  }

  return Array.from(new Set(variants)).slice(0, 4);
}

function deduplicateByTitle(items: RawTrendData[]): RawTrendData[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.titleEn.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
