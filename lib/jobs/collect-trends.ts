import { fetchGoogleTrends, fetchDailyTrends } from "@/lib/collectors/google-trends";
import { fetchRedditTrends } from "@/lib/collectors/reddit";
import { fetchPinterestTrends } from "@/lib/collectors/pinterest";
import { processTrends } from "@/lib/collectors/trend-processor";
import { logCollectorRun } from "@/lib/collectors/utils";
import { notifyAdminOnFailure } from "@/lib/collectors/alert-sender";
import { classifyTrend } from "@/lib/ai";
import type { RawTrendData } from "@/lib/collectors/types";

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

const SUBREDDITS = ["SaudiArabia", "dubai", "AskMiddleEast", "UAE", "Kuwait", "Egypt"];
const PINTEREST_CATEGORIES = ["FASHION", "BEAUTY", "HOME", "ELECTRONICS", "FOOD"];

export async function runCollectTrends(): Promise<{
  found: number;
  created: number;
  updated: number;
  errors: number;
}> {
  const startedAt = new Date();
  const allRaw: RawTrendData[] = [];
  const errors: string[] = [];

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
    errors.push(`Google Trends fatal: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    allRaw.push(...(await fetchRedditTrends(SUBREDDITS, 24)));
  } catch (err) {
    const msg = `Reddit: ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
    await notifyAdminOnFailure("REDDIT", msg);
  }

  try {
    allRaw.push(...(await fetchPinterestTrends(PINTEREST_CATEGORIES)));
  } catch (err) {
    errors.push(`Pinterest: ${err instanceof Error ? err.message : String(err)}`);
  }

  const enrichedRaw = await enrichRawTrends(allRaw, errors);
  const { created, updated, errors: saveErrors } = await processTrends(enrichedRaw);
  errors.push(...saveErrors);

  const completedAt = new Date();
  const status = errors.length === 0 ? "SUCCESS" : allRaw.length > 0 ? "PARTIAL" : "FAILED";

  await logCollectorRun({
    source: "COLLECT_TRENDS",
    status,
    startedAt,
    completedAt,
    itemsFound: allRaw.length,
    itemsSaved: created + updated,
    errorMsg: errors.length ? errors.join("\n") : undefined,
    metadata: { created, updated },
  });

  console.log(`[collect-trends] found=${enrichedRaw.length} created=${created} updated=${updated} errors=${errors.length}`);
  return { found: enrichedRaw.length, created, updated, errors: errors.length };
}

async function enrichRawTrends(items: RawTrendData[], errors: string[]): Promise<RawTrendData[]> {
  const enriched = await Promise.allSettled(
    items.map(async (item) => {
      const classified = await classifyTrend({
        titleEn: item.titleEn,
        titleAr: item.titleAr,
        descriptionAr: item.descriptionAr,
        summaryAr: item.summaryAr,
        keywords: item.keywords,
        source: item.source,
        region: item.region,
        categoryHint: item.category,
        searchVolume: item.searchVolume,
        growthRate: item.growthRate,
        socialMentions: item.socialMentions,
        signalStrength: item.rawScore,
        sourceUrls: item.sourceUrls,
        relatedProducts: item.relatedProducts,
        metadata: item.metadata,
      });
      return {
        ...item,
        category: classified.category,
        summaryAr: classified.summaryAr,
        descriptionAr: `${classified.reasoningAr}\n\n${classified.commercialAngleAr}`,
        relatedProducts: classified.relatedProducts.length
          ? classified.relatedProducts
          : item.relatedProducts,
      } satisfies RawTrendData;
    })
  );

  return enriched.map((result, index) => {
    if (result.status === "fulfilled") return result.value;
    const item = items[index];
    errors.push(`AI classify ${item.titleEn}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`);
    return item;
  });
}
