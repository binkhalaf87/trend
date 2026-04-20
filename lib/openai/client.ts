import OpenAI from "openai";
import type { DbTrend } from "@/types/db";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GenerateOptions {
  type: string;
  trend?: Pick<DbTrend, "titleAr" | "titleEn" | "descriptionAr" | "summaryAr">;
  platform?: string;
  tone?: string;
  customPrompt?: string;
}

interface GeneratedResult {
  title?: string;
  body: string;
  hashtags: string[];
}

const TYPE_INSTRUCTIONS: Record<string, string> = {
  POST:         "اكتب بوست جذاب لمنصات التواصل الاجتماعي",
  CAPTION:      "اكتب وصفاً قصيراً وجذاباً للصورة أو الفيديو",
  AD_COPY:      "اكتب نص إعلاني مقنع وقصير يحقق تحويلات عالية",
  PRODUCT_DESC: "اكتب وصفاً احترافياً للمنتج يحث على الشراء",
  EMAIL_BODY:   "اكتب رسالة بريد إلكتروني تسويقية بمقدمة وجسم وختام",
  VIDEO_IDEA:   "اكتب فكرة فيديو كاملة مع سكريبت مختصر",
  HASHTAGS:     "اقترح 15 هاشتاق مناسب للنشر على منصات التواصل",
  SEO_KEYWORDS: "اقترح 10 كلمات مفتاحية SEO للمنتج المرتبط بهذا الترند",
  // backward compat
  SOCIAL_POST:         "اكتب بوست جذاب لمنصات التواصل الاجتماعي",
  PRODUCT_DESCRIPTION: "اكتب وصفاً احترافياً للمنتج يحث على الشراء",
  EMAIL:               "اكتب رسالة بريد إلكتروني تسويقية بمقدمة وجسم وختام",
  BLOG_EXCERPT:        "اكتب مقدمة مدونة جذابة تشجع القارئ على الاستمرار",
};

export async function generateArabicContent(options: GenerateOptions): Promise<GeneratedResult> {
  const { type, trend, platform, tone = "احترافي", customPrompt } = options;

  const systemPrompt = `أنت كاتب محتوى عربي متخصص في التسويق الإلكتروني والمتاجر الإلكترونية.
تكتب محتوى باللغة العربية الفصحى المبسطة المناسبة للسوق الخليجي والعربي.
اجعل المحتوى طبيعياً وجذاباً ومناسباً لمتاجر التجزئة الإلكترونية.`;

  const userPrompt = [
    TYPE_INSTRUCTIONS[type] ?? "اكتب محتوى تسويقياً",
    trend ? `الترند: ${trend.titleAr} (${trend.titleEn})` : "",
    trend?.descriptionAr ? `وصف الترند: ${trend.descriptionAr}` : "",
    trend?.summaryAr    ? `ملخص: ${trend.summaryAr}` : "",
    platform ? `المنصة: ${platform}` : "",
    `النبرة: ${tone}`,
    customPrompt ? `تعليمات إضافية: ${customPrompt}` : "",
    `\nأعطني JSON بهذا الشكل بالضبط:
{
  "title": "عنوان قصير (اختياري)",
  "body": "نص المحتوى الرئيسي",
  "hashtags": ["#هاشتاق1", "#هاشتاق2", "#هاشتاق3"]
}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 800,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);

  return {
    title:    parsed.title    ?? undefined,
    body:     parsed.body     ?? "",
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
  };
}
