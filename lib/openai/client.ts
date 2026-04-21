import { generateContent } from "@/lib/ai";
import type { Store, TrendContent } from "@/lib/ai";
import type { DbTrend } from "@/types/db";

interface GenerateOptions {
  type: string;
  trend?: Pick<DbTrend, "titleAr" | "titleEn" | "descriptionAr" | "summaryAr" | "category" | "keywords" | "relatedProducts">;
  platform?: string;
  tone?: string;
  customPrompt?: string;
  store?: Store;
}

interface GeneratedResult {
  title?: string;
  body: string;
  hashtags: string[];
  seoKeywords?: string[];
  ctaAr?: string;
  generatedBy?: "OPENAI" | "CLAUDE";
}

export async function generateArabicContent(options: GenerateOptions): Promise<GeneratedResult> {
  const store = options.store ?? {
    name: "TrendZone Store",
    category: options.trend?.category ?? "OTHER",
    tone: options.tone ?? "عصري وجذاب",
  };

  const bundle = await generateContent(
    {
      titleAr: options.trend?.titleAr ?? "ترند موسمي",
      titleEn: options.trend?.titleEn ?? "Seasonal trend",
      descriptionAr: [options.trend?.descriptionAr, options.customPrompt].filter(Boolean).join("\n\n") || null,
      summaryAr: options.trend?.summaryAr ?? null,
      category: options.trend?.category ?? "OTHER",
      keywords: options.trend?.keywords ?? [],
      relatedProducts: options.trend?.relatedProducts ?? [],
    },
    store
  );

  const selected = selectAsset(bundle, options.type, options.platform);

  return {
    title: selected.titleAr,
    body: selected.contentType === "SEO_KEYWORDS"
      ? [selected.bodyAr, ...(selected.seoKeywords ?? [])].filter(Boolean).join("\n")
      : selected.bodyAr,
    hashtags: selected.hashtags,
    seoKeywords: selected.seoKeywords,
    ctaAr: selected.ctaAr,
    generatedBy: selected.generatedBy,
  };
}

function selectAsset(bundle: TrendContent[], type: string, platform?: string): TrendContent {
  const normalizedType = type.toUpperCase();
  const normalizedPlatform = platform?.toUpperCase();

  if (normalizedType === "SEO_KEYWORDS" || normalizedPlatform === "SEO") {
    return bundle.find((item) => item.assetType === "SEO_KEYWORDS") ?? bundle[0];
  }

  if (normalizedType === "VIDEO_IDEA" || normalizedType === "BLOG_EXCERPT" || normalizedPlatform === "TIKTOK") {
    return bundle.find((item) => item.assetType === "TIKTOK_VIDEO_IDEA") ?? bundle[0];
  }

  if (normalizedType === "CAPTION" || normalizedPlatform === "SNAPCHAT") {
    return bundle.find((item) => item.assetType === "SNAPCHAT_CAPTION") ?? bundle[0];
  }

  if (normalizedType === "EMAIL_BODY" || normalizedType === "EMAIL" || normalizedPlatform === "WHATSAPP") {
    return bundle.find((item) => item.assetType === "WHATSAPP_MESSAGE") ?? bundle[0];
  }

  return bundle.find((item) => item.assetType === "INSTAGRAM_POST") ?? bundle[0];
}
