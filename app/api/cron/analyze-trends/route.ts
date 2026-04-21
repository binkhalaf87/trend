import { NextRequest, NextResponse } from "next/server";
import { detectAnomalies } from "@/lib/collectors/anomaly-detection";
import {
  loadTrendHistory,
  applyAnomalyResults,
} from "@/lib/collectors/trend-processor";
import { logCollectorRun, verifyCronSecret } from "@/lib/collectors/utils";
import { notifyAdminOnFailure } from "@/lib/collectors/alert-sender";
import { prisma } from "@/lib/prisma";
import { forecastTrend } from "@/lib/ai";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  const errors: string[] = [];

  try {
    // ── 1. Load 30-day history for all active trends ───────────────────────
    const historyMap = await loadTrendHistory();

    if (!historyMap.size) {
      return NextResponse.json({ ok: true, message: "no trends to analyze", analyzed: 0 });
    }

    // ── 2. Run anomaly detection ───────────────────────────────────────────
    const anomalies = detectAnomalies(historyMap);
    const trueAnomalies = anomalies.filter((a) => a.isAnomaly);

    // ── 3. Apply results back to DB ────────────────────────────────────────
    const { updated, errors: applyErrors } = await applyAnomalyResults(anomalies);
    errors.push(...applyErrors);

    // ── 4. Forecast peak timing and market window ─────────────────────────
    const forecasted = await applyForecasts(historyMap);

    // ── 5. Mark old PEAK trends as DECLINING ──────────────────────────────
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
        topAnomalies: trueAnomalies.slice(0, 5).map((a) => ({
          title: a.titleEn,
          zScore: a.zScore,
          signalStrength: a.signalStrength,
          growth: a.growthVs30d,
        })),
      },
    });

    console.log(
      `[cron/analyze-trends] analyzed=${historyMap.size} anomalies=${trueAnomalies.length} updated=${updated}`
    );

    return NextResponse.json({
      ok: true,
      analyzed: historyMap.size,
      anomaliesDetected: trueAnomalies.length,
      trendsUpdated: updated,
      trendsForecasted: forecasted,
      trendsDeclined: decliningCount,
      durationMs: completedAt.getTime() - startedAt.getTime(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(msg);

    await notifyAdminOnFailure("ANALYZE_TRENDS", msg);
    await logCollectorRun({
      source: "ANALYZE_TRENDS",
      status: "FAILED",
      startedAt,
      completedAt: new Date(),
      errorMsg: msg,
    });

    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// ─── Downgrade stale PEAK/RISING trends to DECLINING ─────────────────────────

async function markDecliningTrends(): Promise<number> {
  // Trends not updated in last 48h and at PEAK status → DECLINING
  const staleThreshold = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const result = await prisma.trend.updateMany({
    where: {
      status: { in: ["PEAK", "RISING"] },
      updatedAt: { lt: staleThreshold },
    },
    data: { status: "DECLINING" },
  });

  return result.count;
}

async function applyForecasts(
  historyMap: Awaited<ReturnType<typeof loadTrendHistory>>
): Promise<number> {
  let updated = 0;

  const results = await Promise.allSettled(
    [...historyMap.entries()].map(async ([trendId, value]) => {
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

  for (const result of results) {
    if (result.status === "fulfilled") {
      updated++;
    }
  }

  return updated;
}
