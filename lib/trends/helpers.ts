import type {
  DbInfluencer,
  DbTrend,
  TrendCategory,
  TrendSource,
  TrendStatus,
} from "@/types/db";

export const TREND_CATEGORY_FILTERS: Array<{ value: "ALL" | TrendCategory; label: string }> = [
  { value: "ALL", label: "الكل" },
  { value: "FASHION", label: "موضة" },
  { value: "BEAUTY", label: "عناية" },
  { value: "ELECTRONICS", label: "إلكترونيات" },
  { value: "HOME", label: "منزل" },
  { value: "FOOD", label: "طعام" },
];

export const TREND_SORT_OPTIONS = [
  { value: "strength", label: "الأقوى" },
  { value: "newest", label: "الأحدث" },
  { value: "peak", label: "الأقرب للذروة" },
] as const;

export type TrendSortValue = (typeof TREND_SORT_OPTIONS)[number]["value"];

export type TrendHistoryPoint = {
  label: string;
  date: string;
  signalStrength: number;
  growthRate: number;
  searchVolume: number;
  forecast: boolean;
};

export type TrendCompetitor = {
  name: string;
  focus: string;
  note: string;
  activityLevel: "HIGH" | "MEDIUM" | "EARLY";
};

export function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    FASHION: "موضة",
    BEAUTY: "عناية",
    ELECTRONICS: "إلكترونيات",
    HOME: "منزل",
    FOOD: "طعام",
    FITNESS: "لياقة",
    KIDS: "أطفال",
    TRAVEL: "سفر",
    GAMING: "ألعاب",
    OTHER: "متنوع",
  };

  return labels[category] ?? category;
}

export function statusLabel(status: TrendStatus) {
  const labels: Record<TrendStatus, string> = {
    EARLY: "جديد",
    RISING: "صاعد",
    PEAK: "ساخن",
    DECLINING: "هابط",
  };

  return labels[status] ?? "جديد";
}

export function statusBadgeClassName(status: TrendStatus) {
  if (status === "PEAK") {
    return "bg-[#534AB7] text-white";
  }
  if (status === "RISING") {
    return "bg-green-500/15 text-green-700 dark:text-green-300";
  }
  if (status === "EARLY") {
    return "bg-orange-500/15 text-orange-700 dark:text-orange-300";
  }
  return "bg-slate-500/15 text-slate-700 dark:text-slate-300";
}

export function sourceLabel(source: TrendSource) {
  const labels: Record<TrendSource, string> = {
    GOOGLE_TRENDS: "Google",
    REDDIT: "Reddit",
    TIKTOK: "TikTok",
    PINTEREST: "Pinterest",
    INSTAGRAM: "Instagram",
    TWITTER: "Twitter",
    AMAZON: "Amazon",
  };

  return labels[source] ?? source;
}

export function sourceBadge(source: TrendSource) {
  const config: Record<TrendSource, { short: string; className: string }> = {
    GOOGLE_TRENDS: { short: "G", className: "bg-blue-500/10 text-blue-600 dark:text-blue-300" },
    REDDIT: { short: "R", className: "bg-orange-500/10 text-orange-600 dark:text-orange-300" },
    TIKTOK: { short: "T", className: "bg-pink-500/10 text-pink-600 dark:text-pink-300" },
    PINTEREST: { short: "P", className: "bg-rose-500/10 text-rose-600 dark:text-rose-300" },
    INSTAGRAM: { short: "I", className: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300" },
    TWITTER: { short: "X", className: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
    AMAZON: { short: "A", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  };

  return config[source];
}

export function normalizeTrendSort(sort?: string): TrendSortValue {
  if (sort === "newest" || sort === "peak") return sort;
  return "strength";
}

export function formatGrowthRate(value: number) {
  const rounded = Math.round(value);
  return `${rounded >= 0 ? "+" : ""}${rounded}%`;
}

export function formatPeakLabel(date: Date | null) {
  if (!date) return "تقدير قيد التحديث";

  const now = Date.now();
  const diffDays = Math.round((date.getTime() - now) / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) return "الذروة اليوم";
  if (diffDays === 1) return "الذروة غدًا";
  return `بعد ${diffDays} أيام`;
}

export function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function buildTrendHistory(
  trend: Pick<DbTrend, "detectedAt" | "signalStrength" | "growthRate" | "searchVolume7d" | "peakExpectedAt">
): TrendHistoryPoint[] {
  const points: TrendHistoryPoint[] = [];
  const anchor = trend.detectedAt ? new Date(trend.detectedAt) : new Date();
  const baseSignal = Math.max(18, Math.round(trend.signalStrength * 0.34));
  const peakSignal = Math.min(100, Math.round(trend.signalStrength * 1.08));

  for (let index = 13; index >= 0; index--) {
    const date = new Date(anchor);
    date.setDate(date.getDate() - index);
    const progress = (13 - index) / 13;
    const signal = Math.round(baseSignal + (trend.signalStrength - baseSignal) * easeOut(progress));
    const searchVolume = Math.round((trend.searchVolume7d / 14) * (0.65 + progress * 0.7));
    const growthRate = Math.round((trend.growthRate * (0.3 + progress * 0.8)) / 4);

    points.push({
      label: formatDateLabel(date),
      date: date.toISOString(),
      signalStrength: clamp(signal, 8, 100),
      growthRate,
      searchVolume,
      forecast: false,
    });
  }

  const forecastStart = points.at(-1)?.signalStrength ?? trend.signalStrength;

  for (let index = 1; index <= 14; index++) {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const peakInfluence = trend.peakExpectedAt
      ? 1 - Math.min(1, Math.abs(diffInDays(date, trend.peakExpectedAt)) / 14)
      : 0.4;
    const signal = Math.round(
      forecastStart +
      (peakSignal - forecastStart) * Math.min(1, index / 7) -
      Math.max(0, index - 10) * 2 +
      peakInfluence * 4
    );

    points.push({
      label: formatDateLabel(date),
      date: date.toISOString(),
      signalStrength: clamp(signal, 10, 100),
      growthRate: Math.round(Math.max(12, trend.growthRate * 0.2) - index * 3),
      searchVolume: Math.round((trend.searchVolume7d / 14) * (1 + peakInfluence * 0.45)),
      forecast: true,
    });
  }

  return points;
}

export function inferCompetitorStores(
  trend: Pick<DbTrend, "category" | "sourceUrls" | "relatedProducts" | "geographicFocus" | "titleAr">
): TrendCompetitor[] {
  const labelsByCategory: Record<string, Array<{ name: string; focus: string }>> = {
    FASHION: [
      { name: "دار اللمسة الخليجية", focus: "عبايات ومناسبات" },
      { name: "بوتيك المشهد", focus: "إطلاقات سريعة للموضة" },
      { name: "ستايل ركن", focus: "منتجات ترند قصيرة المدى" },
    ],
    BEAUTY: [
      { name: "GlowHub Gulf", focus: "عناية وبشرات حساسة" },
      { name: "لمسة بشرة", focus: "روتينات TikTok سريعة" },
      { name: "Pure Drop", focus: "منتجات حماية وترطيب" },
    ],
    ELECTRONICS: [
      { name: "Gear District", focus: "ملحقات وهواتف" },
      { name: "تقنية بلس", focus: "إكسسوارات عالية التحويل" },
      { name: "Electro Dash", focus: "ترندات أمازون التقنية" },
    ],
    HOME: [
      { name: "بيت مودرن", focus: "ديكور مطبخ ومنزل" },
      { name: "ركن الترتيب", focus: "تنظيم وديكور" },
      { name: "Homely Edit", focus: "ديكور بصري من Pinterest" },
    ],
    FOOD: [
      { name: "Snack Story", focus: "منتجات ذواقة" },
      { name: "نكهة يوم", focus: "منتجات موسمية" },
      { name: "Taste Cart", focus: "هدايا ومشروبات" },
    ],
  };

  const sourceHint = trend.sourceUrls[0] ? safeHostname(trend.sourceUrls[0]) : "السوق";

  return (labelsByCategory[trend.category] ?? labelsByCategory.FASHION).map((item, index) => ({
    name: item.name,
    focus: item.focus,
    note:
      index === 0
        ? `يراقب إشارات ${sourceHint} ويختبر منتجات مشابهة لـ ${trend.titleAr}.`
        : index === 1
          ? `يعتمد على تقديم نسخ سريعة من المنتجات المرتبطة بـ ${trend.relatedProducts[0] ?? trend.titleAr}.`
          : `نشط في سوق ${trend.geographicFocus} ويستفيد من زخم الترند عبر محتوى يومي.`,
    activityLevel: index === 0 ? "HIGH" : index === 1 ? "MEDIUM" : "EARLY",
  }));
}

export function competitorActivityLabel(level: TrendCompetitor["activityLevel"]) {
  return level === "HIGH" ? "نشاط مرتفع" : level === "MEDIUM" ? "نشاط متوسط" : "دخول مبكر";
}

export function competitorActivityClassName(level: TrendCompetitor["activityLevel"]) {
  return level === "HIGH"
    ? "bg-[#534AB7]/12 text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff]"
    : level === "MEDIUM"
      ? "bg-orange-500/12 text-orange-700 dark:text-orange-300"
      : "bg-green-500/12 text-green-700 dark:text-green-300";
}

export function formatFollowers(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return `${value}`;
}

export function buildContentPreview(content: Array<{ platform: string; contentType: string; titleAr: string | null; contentAr: string }>) {
  return content.map((item) => ({
    ...item,
    preview: item.contentAr.length > 140 ? `${item.contentAr.slice(0, 140)}...` : item.contentAr,
  }));
}

export function buildSourceLinks(trend: Pick<DbTrend, "source" | "sourceUrls">) {
  const links = trend.sourceUrls.length
    ? trend.sourceUrls
    : [`https://www.google.com/search?q=${encodeURIComponent(sourceLabel(trend.source))}`];

  return links.map((url) => ({
    url,
    host: safeHostname(url),
    source: trend.source,
  }));
}

export function findTopInfluencer(
  influencers: Array<{ influencer: DbInfluencer; matchScore: number }>
) {
  return [...influencers].sort((a, b) => b.matchScore - a.matchScore)[0] ?? null;
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "trendzone.ai";
  }
}

function easeOut(value: number) {
  return 1 - Math.pow(1 - value, 2);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function diffInDays(left: Date, right: Date) {
  return Math.round((left.getTime() - right.getTime()) / (24 * 60 * 60 * 1000));
}
