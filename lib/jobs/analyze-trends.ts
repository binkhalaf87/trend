import { prisma } from "@/lib/prisma";
import { detectAnomalies } from "@/lib/collectors/anomaly-detection";
import {
  loadTrendHistory,
  applyAnomalyResults,
} from "@/lib/collectors/trend-processor";
import { logCollectorRun } from "@/lib/collectors/utils";
import { notifyAdminOnFailure } from "@/lib/collectors/alert-sender";
import { forecastTrend } from "@/lib/ai";

export async function runAnalyzeTrends(): Promise<{
  analyzed: number;
  anomaliesDetected: number;
  trendsUpdated: number;
}> {
  const startedAt = new Date();
  const errors: string[] = [];

  try {
    const historyMap = await loadTrendHistory();
    if (!historyMap.size) {
      console.log("[analyze-trends] no trends to analyze");
      return { analyzed: 0, anomaliesDetected: 0, trendsUpdated: 0 };
    }

    const anomalies = detectAnomalies(historyMap);
    const trueAnomalies = anomalies.filter((a) => a.isAnomaly);
    const { updated, errors: applyErrors } = await applyAnomalyResults(anomalies);
    errors.push(...applyErrors);

    const forecasted = await applyForecasts(historyMap);
    const decliningCount = await markDecliningTrends();

    const completedAt = new Date();
    await logCollectorRun({
      source: "ANALYZE_TRENDS",
      status: errors.length === 0 ? "SUCCESS" : "PARTIAL",
      startedAt,
      completedAt,
      itemsFound: historyMap.size,
      itemsSaved: updated,
      errorMsg: errors.length ? errors.join("\n") : undefined,
      metadata: {
        totalAnalyzed: historyMap.size,
        anomaliesDetected: trueAnomalies.length,
        trendsUpdated: updated,
        trendsForecasted: forecasted,
        trendsDeclined: decliningCount,
      },
    });

    console.log(`[analyze-trends] analyzed=${historyMap.size} anomalies=${trueAnomalies.length} updated=${updated}`);
    return { analyzed: historyMap.size, anomaliesDetected: trueAnomalies.length, trendsUpdated: updated };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await notifyAdminOnFailure("ANALYZE_TRENDS", msg);
    await logCollectorRun({
      source: "ANALYZE_TRENDS",
      status: "FAILED",
      startedAt,
      completedAt: new Date(),
      errorMsg: msg,
    });
    throw err;
  }
}

async function markDecliningTrends(): Promise<number> {
  const staleThreshold = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const result = await prisma.trend.updateMany({
    where: { status: { in: ["PEAK", "RISING"] }, updatedAt: { lt: staleThreshold } },
    data: { status: "DECLINING" },
  });
  return result.count;
}

async function applyForecasts(
  historyMap: Awaited<ReturnType<typeof loadTrendHistory>>
): Promise<number> {
  let updated = 0;
  const results = await Promise.allSettled(
    Array.from(historyMap.entries()).map(async ([trendId, value]) => {
      const forecast = await forecastTrend(value.points);
      const now = new Date();
      const peakExpectedAt = forecast.peakDate
        ? new Date(forecast.peakDate)
        : new Date(now.getTime() + forecast.peakInDays * 24 * 60 * 60 * 1000);
      const nextStatus =
        forecast.peakInDays <= 1 ? "PEAK" : forecast.peakInDays <= 5 ? "RISING" : undefined;
      await prisma.trend.update({
        where: { id: trendId },
        data: {
          peakExpectedAt,
          peakConfidence: forecast.confidence,
          engagementScore: forecast.marketSizeScore,
          descriptionAr: forecast.reasoningAr,
          ...(nextStatus ? { status: nextStatus as "PEAK" | "RISING" } : {}),
        },
      });
    })
  );
  for (const r of results) if (r.status === "fulfilled") updated++;
  return updated;
}
