import type { TrendDataPoint, AnomalyResult } from "./types";

// ─── Thresholds ───────────────────────────────────────────────────────────────

const Z_SCORE_ANOMALY_THRESHOLD = 2.0; // > 2σ = significant anomaly
const GROWTH_BREAKOUT_THRESHOLD = 150; // > 150% vs 30d avg = breakout

// ─── Analyse a single trend's history ────────────────────────────────────────

export function detectAnomaly(
  trendId: string,
  titleEn: string,
  history: TrendDataPoint[] // ordered oldest → newest
): AnomalyResult | null {
  if (history.length < 3) return null;

  const values = history.map((p) => p.signalStrength);
  const currentValue = values[values.length - 1];

  const last30 = values.slice(-30);
  const last7 = values.slice(-7);
  const baseline = last30.slice(0, last30.length - 1); // exclude current point

  if (baseline.length < 2) return null;

  const mean30d = mean(baseline);
  const stdDev30d = stdDev(baseline);
  const mean7d = mean(last7.slice(0, -1));

  const zScore = stdDev30d === 0
    ? (currentValue > mean30d ? 3 : 0)
    : (currentValue - mean30d) / stdDev30d;

  const growthVs30d = mean30d === 0
    ? (currentValue > 0 ? 999 : 0)
    : ((currentValue - mean30d) / mean30d) * 100;

  const growthVs7d = mean7d === 0
    ? (currentValue > 0 ? 999 : 0)
    : ((currentValue - mean7d) / mean7d) * 100;

  const isAnomaly =
    zScore >= Z_SCORE_ANOMALY_THRESHOLD ||
    growthVs30d >= GROWTH_BREAKOUT_THRESHOLD;

  const signalStrength = calcSignalStrength(zScore, growthVs30d, currentValue);
  const newStatus = determineStatus(signalStrength, growthVs7d, history);

  return {
    trendId,
    titleEn,
    currentValue,
    mean30d: round(mean30d),
    stdDev30d: round(stdDev30d),
    zScore: round(zScore),
    signalStrength,
    isAnomaly,
    growthVs7d: round(growthVs7d),
    growthVs30d: round(growthVs30d),
    newStatus,
  };
}

// ─── Batch processing ─────────────────────────────────────────────────────────

export function detectAnomalies(
  dataByTrend: Map<string, { titleEn: string; points: TrendDataPoint[] }>
): AnomalyResult[] {
  const results: AnomalyResult[] = [];

  for (const [trendId, { titleEn, points }] of dataByTrend) {
    const result = detectAnomaly(trendId, titleEn, points);
    if (result) results.push(result);
  }

  // Sort by z-score descending (most anomalous first)
  return results.sort((a, b) => b.zScore - a.zScore);
}

// ─── Signal strength: 0-100 from z-score + growth ────────────────────────────

function calcSignalStrength(
  zScore: number,
  growthVs30d: number,
  rawValue: number
): number {
  // Component 1: Z-score contribution (0-50 pts)
  //   z=0 → 0, z=1 → 17, z=2 → 33, z=3 → 50
  const zComponent = Math.min(50, Math.max(0, (zScore / 3) * 50));

  // Component 2: Growth rate contribution (0-30 pts)
  //   growth=0% → 0, growth=150% → 30, growth=300%+ → 30
  const growthComponent = Math.min(30, Math.max(0, (growthVs30d / 300) * 30));

  // Component 3: Absolute value contribution (0-20 pts)
  //   rawValue 0-100 mapped to 0-20
  const valueComponent = Math.min(20, Math.max(0, (rawValue / 100) * 20));

  return Math.round(zComponent + growthComponent + valueComponent);
}

// ─── Determine TrendStatus from signal trajectory ─────────────────────────────

function determineStatus(
  signalStrength: number,
  growthVs7d: number,
  history: TrendDataPoint[]
): string {
  const values = history.map((p) => p.signalStrength);
  const recent = values.slice(-7);
  const trend = linearTrend(recent);

  if (signalStrength >= 80 && trend > 0) return "PEAK";
  if (signalStrength >= 60 && growthVs7d >= 20) return "RISING";
  if (trend < -5 && signalStrength < 50) return "DECLINING";
  return "EARLY";
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

function mean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((sum, x) => sum + (x - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

/** Slope of simple linear regression. Positive = rising, negative = falling. */
function linearTrend(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const xs = values.map((_, i) => i);
  const meanX = mean(xs);
  const meanY = mean(values);
  const num = xs.reduce((s, x, i) => s + (x - meanX) * (values[i] - meanY), 0);
  const den = xs.reduce((s, x) => s + (x - meanX) ** 2, 0);
  return den === 0 ? 0 : num / den;
}

function round(n: number, dec = 2): number {
  return Math.round(n * 10 ** dec) / 10 ** dec;
}
