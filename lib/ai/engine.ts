import { prisma } from "@/lib/prisma";
import { hydrateInfluencer, hydrateTrend } from "@/lib/utils/prisma-helpers";
import type { DbInfluencer, DbTrend, TrendCategory } from "@/types/db";
import { z } from "zod";
import { AI_MODELS, getAnthropicClient, getOpenAIClient } from "./clients";
import {
  buildClassificationPrompts,
  buildContentPrompts,
  buildFallbackClassificationReason,
  buildForecastPrompts,
  buildInfluencerPrompts,
  buildPersonalizationPrompts,
} from "./prompts";
import type {
  ClassifiedTrend,
  DataPoint,
  Forecast,
  InfluencerCandidate,
  InfluencerMatch,
  RankedTrend,
  RawTrend,
  Store,
  Trend,
  TrendContent,
  TrendIntent,
} from "./types";
import { STORE_CATEGORIES } from "./types";

const classificationSchema = z.object({
  intent: z.enum(["COMMERCIAL", "NEWS", "ENTERTAINMENT"]),
  category: z.enum([
    "FASHION",
    "BEAUTY",
    "ELECTRONICS",
    "HOME",
    "FOOD",
    "FITNESS",
    "KIDS",
    "TRAVEL",
    "GAMING",
    "OTHER",
  ]),
  confidence: z.number(),
  summaryAr: z.string(),
  reasoningAr: z.string(),
  commercialAngleAr: z.string(),
  relatedProducts: z.array(z.string()).default([]),
  relevanceScores: z.record(z.number()),
});

const forecastSchema = z.object({
  peakInDays: z.number(),
  peakDate: z.string().nullable(),
  duration: z.enum(["SHORT", "MEDIUM", "LONG"]),
  marketSizeBand: z.enum(["NICHE", "GROWING", "MASS"]),
  marketSizeScore: z.number(),
  confidence: z.number(),
  reasoningAr: z.string(),
  recommendedActionAr: z.string(),
});

const contentPackSchema = z.object({
  instagramPost: z.object({
    titleAr: z.string().optional(),
    bodyAr: z.string(),
    hashtags: z.array(z.string()).default([]),
    ctaAr: z.string().optional(),
  }),
  snapchatCaption: z.object({
    bodyAr: z.string(),
    hashtags: z.array(z.string()).default([]),
    ctaAr: z.string().optional(),
  }),
  tiktokIdea: z.object({
    titleAr: z.string().optional(),
    bodyAr: z.string(),
    hashtags: z.array(z.string()).default([]),
    ctaAr: z.string().optional(),
  }),
  seoKeywords: z.object({
    bodyAr: z.string(),
    keywords: z.array(z.string()).default([]),
  }),
  whatsappMessage: z.object({
    bodyAr: z.string(),
    ctaAr: z.string().optional(),
  }),
});

const personalizationSchema = z.object({
  rankedTrends: z.array(
    z.object({
      id: z.string().optional(),
      relevanceScore: z.number(),
      shouldRecommend: z.boolean(),
      whyNowAr: z.string(),
      fitReasonAr: z.string(),
    })
  ),
});

const influencerSchema = z.object({
  matches: z.array(
    z.object({
      influencerId: z.string(),
      matchScore: z.number(),
      estimatedCostSar: z.number().nullable(),
      withinBudget: z.boolean(),
      reasonAr: z.string(),
      recommendedDeliverableAr: z.string(),
    })
  ),
});

export async function classifyTrend(trend: RawTrend): Promise<ClassifiedTrend> {
  const normalizedTrend = normalizeRawTrend(trend);

  try {
    const { system, user } = buildClassificationPrompts(normalizedTrend);
    const parsed = await callOpenAIJson({
      model: AI_MODELS.classifier,
      system,
      user,
      schema: classificationSchema,
      temperature: 0.1,
      maxTokens: 1200,
    });

    return normalizeClassifiedTrend(parsed);
  } catch (error) {
    console.error("[AI] classifyTrend fallback", error);
    return heuristicClassification(normalizedTrend);
  }
}

export async function forecastTrend(trendHistory: DataPoint[]): Promise<Forecast> {
  if (!trendHistory.length) {
    return {
      peakInDays: 0,
      peakDate: null,
      duration: "SHORT",
      marketSizeBand: "NICHE",
      marketSizeScore: 10,
      confidence: 0.2,
      reasoningAr: "لا توجد بيانات تاريخية كافية لبناء توقع موثوق.",
      recommendedActionAr: "اجمع مزيداً من البيانات قبل اتخاذ قرار تسويقي أو تشغيلي كبير.",
    };
  }

  const stats = deriveHistoryStats(trendHistory);

  try {
    const { system, user } = buildForecastPrompts(trendHistory, stats);
    const parsed = await callOpenAIJson({
      model: AI_MODELS.forecaster,
      system,
      user,
      schema: forecastSchema,
      temperature: 0.2,
      maxTokens: 1200,
    });

    return normalizeForecast(parsed);
  } catch (error) {
    console.error("[AI] forecastTrend fallback", error);
    return heuristicForecast(trendHistory, stats);
  }
}

export async function generateContent(trend: Trend, store: Store): Promise<TrendContent[]> {
  const normalizedTrend = normalizeTrend(trend);
  const normalizedStore = normalizeStore(store);

  try {
    const { system, user } = buildContentPrompts(normalizedTrend, normalizedStore);
    const anthropic = getAnthropicClient();

    if (anthropic) {
      const parsed = await callAnthropicJson({
        model: AI_MODELS.contentPrimary,
        system,
        user,
        schema: contentPackSchema,
        temperature: 0.5,
        maxTokens: 1800,
      });

      return mapContentPackToAssets(parsed, "CLAUDE");
    }

    const parsed = await callOpenAIJson({
      model: AI_MODELS.contentFallback,
      system,
      user,
      schema: contentPackSchema,
      temperature: 0.6,
      maxTokens: 1800,
    });

    return mapContentPackToAssets(parsed, "OPENAI");
  } catch (error) {
    console.error("[AI] generateContent fallback", error);
    return buildFallbackContent(normalizedTrend, normalizedStore);
  }
}

export async function personalizeForStore(trends: Trend[], store: Store): Promise<RankedTrend[]> {
  const normalizedStore = normalizeStore(store);
  const normalizedTrends = trends.map(normalizeTrend);

  try {
    const { system, user } = buildPersonalizationPrompts(normalizedTrends, normalizedStore);
    const parsed = await callOpenAIJson({
      model: AI_MODELS.personalizer,
      system,
      user,
      schema: personalizationSchema,
      temperature: 0.1,
      maxTokens: 1800,
    });

    const byId = new Map(
      normalizedTrends.map((trend, index) => [trend.id ?? `index:${index}`, { trend, index }])
    );

    const ranked = parsed.rankedTrends
      .map((item, index) => {
        const key = item.id ?? `index:${index}`;
        const found = byId.get(key) ?? { trend: normalizedTrends[index], index };
        if (!found?.trend) return null;
        return {
          ...found.trend,
          relevanceScore: clampScore(item.relevanceScore),
          shouldRecommend: item.shouldRecommend,
          whyNowAr: item.whyNowAr,
          fitReasonAr: item.fitReasonAr,
        } satisfies RankedTrend;
      })
      .filter((item): item is RankedTrend => Boolean(item))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    if (ranked.length === normalizedTrends.length) {
      return ranked;
    }
  } catch (error) {
    console.error("[AI] personalizeForStore fallback", error);
  }

  return heuristicPersonalization(normalizedTrends, normalizedStore);
}

export async function matchInfluencers(trend: Trend, budget: number): Promise<InfluencerMatch[]> {
  const normalizedTrend = normalizeTrend(trend);
  const candidates = await loadInfluencerCandidates(normalizedTrend, budget);

  if (!candidates.length) {
    return [];
  }

  try {
    const { system, user } = buildInfluencerPrompts(normalizedTrend, budget, candidates);
    const parsed = await callOpenAIJson({
      model: AI_MODELS.influencerMatcher,
      system,
      user,
      schema: influencerSchema,
      temperature: 0.2,
      maxTokens: 1500,
    });

    const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));

    return parsed.matches
      .map((match) => {
        const candidate = byId.get(match.influencerId);
        if (!candidate) return null;
        return {
          influencerId: candidate.id,
          name: candidate.name,
          handle: candidate.handle,
          platform: candidate.platform,
          matchScore: clampScore(match.matchScore),
          estimatedCostSar: match.estimatedCostSar,
          withinBudget: match.withinBudget,
          reasonAr: match.reasonAr,
          recommendedDeliverableAr: match.recommendedDeliverableAr,
        } satisfies InfluencerMatch;
      })
      .filter((item): item is InfluencerMatch => Boolean(item))
      .slice(0, 3);
  } catch (error) {
    console.error("[AI] matchInfluencers fallback", error);
    return heuristicInfluencerMatches(normalizedTrend, budget, candidates);
  }
}

export async function saveInfluencerMatches(trendId: string, matches: InfluencerMatch[]) {
  for (const match of matches) {
    await prisma.influencerMatch.upsert({
      where: {
        trendId_influencerId: {
          trendId,
          influencerId: match.influencerId,
        },
      },
      update: {
        matchScore: match.matchScore,
        reasonAr: match.reasonAr,
        updatedAt: new Date(),
      },
      create: {
        trendId,
        influencerId: match.influencerId,
        matchScore: match.matchScore,
        reasonAr: match.reasonAr,
      },
    });
  }
}

export function mapDbTrendToAiTrend(trend: DbTrend): Trend {
  const hydrated = hydrateTrend(trend as never);
  return normalizeTrend({
    id: hydrated.id,
    titleEn: hydrated.titleEn,
    titleAr: hydrated.titleAr,
    summaryAr: hydrated.summaryAr,
    descriptionAr: hydrated.descriptionAr,
    category: hydrated.category,
    geographicFocus: hydrated.geographicFocus,
    signalStrength: hydrated.signalStrength,
    growthRate: hydrated.growthRate,
    searchVolume7d: hydrated.searchVolume7d,
    socialMentions7d: hydrated.socialMentions7d,
    keywords: hydrated.keywords,
    relatedProducts: hydrated.relatedProducts,
    peakExpectedAt: hydrated.peakExpectedAt,
    peakConfidence: hydrated.peakConfidence,
  });
}

export function mapUserStoreToAiStore(user: {
  id?: string;
  storeName?: string | null;
  storeCategory?: TrendCategory | null;
  storeDescription?: string | null;
  preferredLanguage?: string | null;
}): Store {
  return normalizeStore({
    id: user.id,
    name: user.storeName ?? "متجر TrendZone",
    category: user.storeCategory ?? "OTHER",
    description: user.storeDescription,
    tone: user.preferredLanguage === "ar" ? "عصري وجذاب" : "modern",
  });
}

type JsonCallArgs<T extends z.ZodTypeAny> = {
  model: string;
  system: string;
  user: string;
  schema: T;
  temperature: number;
  maxTokens: number;
};

async function callOpenAIJson<T extends z.ZodTypeAny>({
  model,
  system,
  user,
  schema,
  temperature,
  maxTokens,
}: JsonCallArgs<T>): Promise<z.infer<T>> {
  const response = await getOpenAIClient().chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  return schema.parse(extractJsonObject(content));
}

async function callAnthropicJson<T extends z.ZodTypeAny>({
  model,
  system,
  user,
  schema,
  temperature,
  maxTokens,
}: JsonCallArgs<T>): Promise<z.infer<T>> {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = response.content
    .filter((block): block is { type: "text"; text: string } => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  if (!text) {
    throw new Error("Anthropic returned an empty response");
  }

  return schema.parse(extractJsonObject(text));
}

function normalizeRawTrend(trend: RawTrend): RawTrend {
  return {
    ...trend,
    titleAr: trend.titleAr?.trim() || trend.titleEn,
    summaryAr: trend.summaryAr ?? null,
    descriptionAr: trend.descriptionAr ?? null,
    keywords: uniqueStrings(trend.keywords),
    sourceUrls: uniqueStrings(trend.sourceUrls),
    relatedProducts: uniqueStrings(trend.relatedProducts),
  };
}

function normalizeTrend(trend: Trend): Trend {
  return {
    ...trend,
    titleAr: trend.titleAr || trend.titleEn,
    summaryAr: trend.summaryAr ?? null,
    descriptionAr: trend.descriptionAr ?? null,
    keywords: uniqueStrings(trend.keywords),
    relatedProducts: uniqueStrings(trend.relatedProducts),
  };
}

function normalizeStore(store: Store): Store {
  return {
    ...store,
    name: store.name?.trim() || "TrendZone Store",
    category: store.category ?? "OTHER",
    description: store.description ?? null,
    targetMarket: store.targetMarket ?? "GULF",
    tone: store.tone ?? "عصري وجذاب",
    audience: store.audience ?? "متسوقون في الخليج يبحثون عن الجديد",
  };
}

function normalizeClassifiedTrend(parsed: z.infer<typeof classificationSchema>): ClassifiedTrend {
  const relevanceScores = fillCategoryScores(parsed.relevanceScores);

  return {
    intent: parsed.intent,
    category: parsed.category,
    confidence: clampUnit(parsed.confidence),
    summaryAr: parsed.summaryAr.trim(),
    reasoningAr: parsed.reasoningAr.trim(),
    commercialAngleAr: parsed.commercialAngleAr.trim(),
    relatedProducts: uniqueStrings(parsed.relatedProducts).slice(0, 6),
    relevanceScores,
  };
}

function normalizeForecast(parsed: z.infer<typeof forecastSchema>): Forecast {
  return {
    peakInDays: Math.max(0, Math.round(parsed.peakInDays)),
    peakDate: parsed.peakDate,
    duration: parsed.duration,
    marketSizeBand: parsed.marketSizeBand,
    marketSizeScore: clampScore(parsed.marketSizeScore),
    confidence: clampUnit(parsed.confidence),
    reasoningAr: parsed.reasoningAr.trim(),
    recommendedActionAr: parsed.recommendedActionAr.trim(),
  };
}

function heuristicClassification(trend: RawTrend): ClassifiedTrend {
  const text = [
    trend.titleEn,
    trend.titleAr,
    trend.descriptionAr,
    ...(trend.keywords ?? []),
    ...(trend.relatedProducts ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const category = inferCategoryFromText(text);
  const intent = inferIntentFromText(text);
  const relevanceScores = fillCategoryScores({
    [category]: 88,
    OTHER: 40,
  });

  return {
    intent,
    category,
    confidence: 0.45,
    summaryAr: `ترند ${categoryLabelAr(category)} يتجه إلى ${intentLabelAr(intent)} مع قابلية استثمار أولية.`,
    reasoningAr: buildFallbackClassificationReason(category, intent),
    commercialAngleAr: "يستحق المتابعة السريعة واختبار محتوى أو عرض محدود قبل اتساع المنافسة.",
    relatedProducts: uniqueStrings(trend.relatedProducts ?? trend.keywords ?? []).slice(0, 5),
    relevanceScores,
  };
}

function heuristicForecast(history: DataPoint[], stats: Record<string, number>): Forecast {
  const slope = stats.slope ?? 0;
  const latest = stats.latestSignal ?? 0;
  const peakInDays = slope > 4 ? 2 : slope > 1 ? 5 : slope > -1 ? 8 : 1;
  const duration = latest > 75 || slope > 3 ? "MEDIUM" : latest > 45 ? "SHORT" : "SHORT";
  const marketSizeScore = clampScore(Math.round((latest * 0.6) + (stats.avgSearchVolumeNormalized ?? 0) * 0.4));

  return {
    peakInDays,
    peakDate: new Date(Date.now() + peakInDays * 24 * 60 * 60 * 1000).toISOString(),
    duration,
    marketSizeBand: marketSizeScore >= 75 ? "MASS" : marketSizeScore >= 45 ? "GROWING" : "NICHE",
    marketSizeScore,
    confidence: history.length >= 7 ? 0.55 : 0.35,
    reasoningAr: "تم تقدير المسار اعتماداً على ميل الإشارة الحديث وحجم التفاعل مقارنة بالنقاط السابقة.",
    recommendedActionAr: slope >= 0
      ? "ابدأ بحملة خفيفة واختبر الرسائل الإعلانية بسرعة قبل الوصول للذروة."
      : "تعامل معه كنافذة قصيرة وركّز على محتوى سريع بدل توسع تشغيلي كبير.",
  };
}

function heuristicPersonalization(trends: Trend[], store: Store): RankedTrend[] {
  return trends
    .map((trend) => {
      const categoryFit = trend.category === store.category ? 35 : trend.category === "OTHER" ? 10 : 0;
      const geoFit = matchesGeo(trend.geographicFocus, store.targetMarket) ? 15 : 5;
      const signalScore = Math.round((trend.signalStrength ?? 0) * 0.25);
      const growthScore = Math.round(Math.min(20, Math.max(0, trend.growthRate ?? 0) / 5));
      const commercialBoost = trend.intent === "COMMERCIAL" ? 20 : trend.intent === "NEWS" ? 8 : 4;
      const relevanceScore = clampScore(categoryFit + geoFit + signalScore + growthScore + commercialBoost);

      return {
        ...trend,
        relevanceScore,
        shouldRecommend: relevanceScore >= 50,
        whyNowAr: relevanceScore >= 70
          ? "الإشارة الحالية مرتفعة بما يكفي للاستفادة السريعة قبل زحمة المنافسين."
          : "قد يكون مناسباً كتجربة محتوى أو اختبار محدود.",
        fitReasonAr: trend.category === store.category
          ? "متوافق مباشرة مع فئة المتجر وسهل تحويله إلى عرض أو محتوى."
          : "ملاءمته أقل من الترندات الأقرب لفئة المتجر أو نية الشراء.",
      } satisfies RankedTrend;
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function mapContentPackToAssets(
  pack: z.infer<typeof contentPackSchema>,
  generatedBy: "OPENAI" | "CLAUDE"
): TrendContent[] {
  return [
    {
      assetType: "INSTAGRAM_POST",
      platform: "INSTAGRAM",
      contentType: "POST",
      generatedBy,
      titleAr: pack.instagramPost.titleAr,
      bodyAr: pack.instagramPost.bodyAr,
      hashtags: uniqueStrings(pack.instagramPost.hashtags),
      seoKeywords: [],
      ctaAr: pack.instagramPost.ctaAr,
    },
    {
      assetType: "SNAPCHAT_CAPTION",
      platform: "SNAPCHAT",
      contentType: "CAPTION",
      generatedBy,
      bodyAr: pack.snapchatCaption.bodyAr,
      hashtags: uniqueStrings(pack.snapchatCaption.hashtags),
      seoKeywords: [],
      ctaAr: pack.snapchatCaption.ctaAr,
    },
    {
      assetType: "TIKTOK_VIDEO_IDEA",
      platform: "TIKTOK",
      contentType: "VIDEO_IDEA",
      generatedBy,
      titleAr: pack.tiktokIdea.titleAr,
      bodyAr: pack.tiktokIdea.bodyAr,
      hashtags: uniqueStrings(pack.tiktokIdea.hashtags),
      seoKeywords: [],
      ctaAr: pack.tiktokIdea.ctaAr,
    },
    {
      assetType: "SEO_KEYWORDS",
      platform: "SEO",
      contentType: "SEO_KEYWORDS",
      generatedBy,
      bodyAr: pack.seoKeywords.bodyAr,
      hashtags: [],
      seoKeywords: uniqueStrings(pack.seoKeywords.keywords).slice(0, 5),
    },
    {
      assetType: "WHATSAPP_MESSAGE",
      platform: "WHATSAPP",
      contentType: "CAPTION",
      generatedBy,
      bodyAr: pack.whatsappMessage.bodyAr,
      hashtags: [],
      seoKeywords: [],
      ctaAr: pack.whatsappMessage.ctaAr,
    },
  ];
}

function buildFallbackContent(trend: Trend, store: Store): TrendContent[] {
  const categoryLabel = categoryLabelAr(store.category ?? trend.category);
  const coreAngle = trend.summaryAr ?? `ترند ${trend.titleAr} يلفت الانتباه حالياً في السوق.`;
  const hashtags = [
    `#${sanitizeHashtag(trend.titleAr)}`,
    `#${sanitizeHashtag(store.name)}`,
    `#${sanitizeHashtag(categoryLabel)}`,
  ].filter(Boolean);
  const seoKeywords = uniqueStrings([
    trend.titleAr,
    store.name,
    categoryLabel,
    ...(trend.relatedProducts ?? []).slice(0, 2),
  ]).slice(0, 5);

  return [
    {
      assetType: "INSTAGRAM_POST",
      platform: "INSTAGRAM",
      contentType: "POST",
      generatedBy: "OPENAI",
      titleAr: `${trend.titleAr} وصل للمشهد`,
      bodyAr: `${coreAngle}\n\n${store.name} يدخل على الخط بذوق ${categoryLabel} ولمسة خليجية عصرية. إذا ودك تلحق الموجة، هذا وقتك.`,
      hashtags,
      seoKeywords: [],
      ctaAr: "اطلب الآن قبل نفاد الكمية",
    },
    {
      assetType: "SNAPCHAT_CAPTION",
      platform: "SNAPCHAT",
      contentType: "CAPTION",
      generatedBy: "OPENAI",
      bodyAr: `الترند هذا ما ينفوت... شوفوا اختيار ${store.name} اليوم.`,
      hashtags: hashtags.slice(0, 2),
      seoKeywords: [],
      ctaAr: "اسحب وفالك الطيب",
    },
    {
      assetType: "TIKTOK_VIDEO_IDEA",
      platform: "TIKTOK",
      contentType: "VIDEO_IDEA",
      generatedBy: "OPENAI",
      titleAr: `فكرة فيديو ${trend.titleAr}`,
      bodyAr: "ابدأ بلقطة hook سريعة عن سبب انتشار الترند، ثم اعرض المنتج أو الفكرة المرتبطة به، واختم بسؤال يشجع الناس على التفاعل خلال 20 ثانية.",
      hashtags: hashtags,
      seoKeywords: [],
      ctaAr: "وش الخيار اللي يناسبك أكثر؟",
    },
    {
      assetType: "SEO_KEYWORDS",
      platform: "SEO",
      contentType: "SEO_KEYWORDS",
      generatedBy: "OPENAI",
      bodyAr: "الكلمات الأنسب تجمع بين اسم الترند ونية الشراء واسم الفئة.",
      hashtags: [],
      seoKeywords,
    },
    {
      assetType: "WHATSAPP_MESSAGE",
      platform: "WHATSAPP",
      contentType: "CAPTION",
      generatedBy: "OPENAI",
      bodyAr: `هلا! عندنا الآن خيار مرتبط بترند ${trend.titleAr} ومناسب لعشاق ${categoryLabel}. إذا حاب نرسل لك التفاصيل بسرعة، رد علينا بكلمة: أبغى.`,
      hashtags: [],
      seoKeywords: [],
      ctaAr: "رد بكلمة: أبغى",
    },
  ];
}

async function loadInfluencerCandidates(trend: Trend, budget: number): Promise<InfluencerCandidate[]> {
  const influencers = await prisma.influencer.findMany({
    where: {
      isActive: true,
      OR: [
        { categories: { array_contains: [trend.category] } },
        ...(trend.category === "OTHER" ? [] : [{ categories: { array_contains: ["OTHER"] } }]),
      ],
    },
    orderBy: [
      { engagementRate: "desc" },
      { followersCount: "desc" },
    ],
    take: 25,
  });

  return influencers
    .map((influencer) => hydrateInfluencer(influencer as unknown as DbInfluencer))
    .map((influencer) => ({
      id: influencer.id,
      name: influencer.name,
      handle: influencer.handle,
      platform: influencer.platform,
      followersCount: influencer.followersCount,
      engagementRate: influencer.engagementRate,
      categories: influencer.categories,
      priceRange: influencer.priceRange,
      bio: influencer.bio,
      country: influencer.country,
      avgLikes: influencer.avgLikes,
      avgComments: influencer.avgComments,
      avgViews: influencer.avgViews,
      isVerified: influencer.isVerified,
      profileUrl: influencer.profileUrl,
    }))
    .sort((a, b) => {
      const aFit = scoreInfluencerCandidate(a, trend, budget);
      const bFit = scoreInfluencerCandidate(b, trend, budget);
      return bFit - aFit;
    })
    .slice(0, 12);
}

function heuristicInfluencerMatches(
  trend: Trend,
  budget: number,
  candidates: InfluencerCandidate[]
): InfluencerMatch[] {
  return candidates
    .map((candidate) => {
      const estimatedCostSar = estimatePriceRangeSar(candidate.priceRange);
      const withinBudget = estimatedCostSar === null ? true : estimatedCostSar <= budget;
      const score = scoreInfluencerCandidate(candidate, trend, budget);

      return {
        influencerId: candidate.id,
        name: candidate.name,
        handle: candidate.handle,
        platform: candidate.platform,
        matchScore: score,
        estimatedCostSar,
        withinBudget,
        reasonAr: withinBudget
          ? "ملائم للفئة والجمهور مع تكلفة أقرب للميزانية المتاحة."
          : "ملائم جداً للترند لكن يحتاج هامش ميزانية أعلى من المطلوب.",
        recommendedDeliverableAr: candidate.platform === "SNAPCHAT"
          ? "سنابة + كود خصم"
          : candidate.platform === "INSTAGRAM"
            ? "ريل + ستوري + رابط"
            : "فيديو قصير + دعوة واضحة للشراء",
      } satisfies InfluencerMatch;
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

function deriveHistoryStats(history: DataPoint[]) {
  const points = [...history]
    .map((point) => ({
      recordedAt: new Date(point.recordedAt),
      signalStrength: point.signalStrength,
      searchVolume: point.searchVolume ?? 0,
      socialMentions: point.socialMentions ?? 0,
      growthRate: point.growthRate ?? 0,
    }))
    .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());

  const latest = points.at(-1);
  const earliest = points[0];
  const signalValues = points.map((point) => point.signalStrength);
  const avgSignal = average(signalValues);
  const avgSearchVolume = average(points.map((point) => point.searchVolume));
  const avgSearchVolumeNormalized = Math.min(100, avgSearchVolume / 100);
  const avgGrowth = average(points.map((point) => point.growthRate));
  const delta = latest && earliest ? latest.signalStrength - earliest.signalStrength : 0;
  const slope = points.length > 1 ? delta / (points.length - 1) : 0;

  return {
    points: points.length,
    latestSignal: latest?.signalStrength ?? 0,
    avgSignal,
    avgSearchVolume,
    avgSearchVolumeNormalized,
    avgGrowth,
    minSignal: Math.min(...signalValues),
    maxSignal: Math.max(...signalValues),
    delta,
    slope,
  };
}

function fillCategoryScores(input: Record<string, number>): Record<TrendCategory, number> {
  return STORE_CATEGORIES.reduce((acc, category) => {
    acc[category] = clampScore(input[category] ?? 0);
    return acc;
  }, {} as Record<TrendCategory, number>);
}

function inferCategoryFromText(text: string): TrendCategory {
  const rules: Array<{ category: TrendCategory; words: string[] }> = [
    { category: "FASHION", words: ["fashion", "abaya", "عباية", "شنطة", "bag", "style", "موضة", "ملابس", "outfit"] },
    { category: "BEAUTY", words: ["beauty", "skincare", "makeup", "عناية", "مكياج", "سيروم", "عطر", "perfume"] },
    { category: "ELECTRONICS", words: ["phone", "iphone", "سامسونج", "gadget", "device", "electronics", "ساعة ذكية", "gaming phone"] },
    { category: "HOME", words: ["decor", "home", "sofa", "kitchen", "منزل", "ديكور", "مطبخ", "أثاث"] },
    { category: "FOOD", words: ["coffee", "protein", "snack", "food", "restaurant", "قهوة", "وجبات", "مشروبات"] },
    { category: "FITNESS", words: ["fitness", "running", "gym", "رياضة", "لياقة", "protein powder"] },
    { category: "KIDS", words: ["kids", "baby", "children", "طفل", "أطفال"] },
    { category: "TRAVEL", words: ["travel", "flight", "visa", "سفر", "رحلة"] },
    { category: "GAMING", words: ["gaming", "esports", "playstation", "xbox", "لعبة", "قيمر"] },
  ];

  for (const rule of rules) {
    if (rule.words.some((word) => text.includes(word.toLowerCase()))) {
      return rule.category;
    }
  }

  return "OTHER";
}

function inferIntentFromText(text: string): TrendIntent {
  const commercialWords = ["buy", "sale", "discount", "offer", "shop", "price", "شراء", "خصم", "سعر", "توصيل"];
  const newsWords = ["launch", "regulation", "breaking", "update", "announce", "خبر", "إطلاق", "منع", "قرار", "تحديث"];
  const entertainmentWords = ["meme", "viral", "challenge", "celebrity", "fan", "ترند", "فيديو", "مشهور", "تحدي"];

  const commercialHits = commercialWords.filter((word) => text.includes(word)).length;
  const newsHits = newsWords.filter((word) => text.includes(word)).length;
  const entertainmentHits = entertainmentWords.filter((word) => text.includes(word)).length;

  if (commercialHits >= newsHits && commercialHits >= entertainmentHits) return "COMMERCIAL";
  if (newsHits >= entertainmentHits) return "NEWS";
  return "ENTERTAINMENT";
}

function scoreInfluencerCandidate(candidate: InfluencerCandidate, trend: Trend, budget: number) {
  const estimatedCost = estimatePriceRangeSar(candidate.priceRange);
  const categoryFit = candidate.categories.includes(trend.category) ? 35 : candidate.categories.includes("OTHER") ? 10 : 0;
  const engagement = Math.min(25, Math.round(candidate.engagementRate * 5));
  const followers = Math.min(20, Math.round(candidate.followersCount / 10000));
  const budgetFit = estimatedCost === null ? 10 : estimatedCost <= budget ? 20 : Math.max(0, 15 - Math.round((estimatedCost - budget) / 250));
  const verification = candidate.isVerified ? 5 : 0;
  return clampScore(categoryFit + engagement + followers + budgetFit + verification);
}

function estimatePriceRangeSar(value?: string | null): number | null {
  if (!value) return null;
  const matches = value.match(/\d+/g);
  if (!matches?.length) return null;
  const numbers = matches.map((part) => Number(part)).filter((part) => !Number.isNaN(part));
  if (!numbers.length) return null;
  return Math.round(average(numbers));
}

function matchesGeo(
  trendGeo?: Trend["geographicFocus"],
  storeGeo?: Store["targetMarket"]
) {
  if (!trendGeo || !storeGeo) return true;
  if (Array.isArray(storeGeo)) return storeGeo.includes(trendGeo);
  if (storeGeo === "GULF") return ["SA", "AE", "KW", "QA", "BH", "OM", "GULF"].includes(trendGeo);
  return trendGeo === storeGeo || trendGeo === "GULF";
}

function categoryLabelAr(category: TrendCategory) {
  return {
    FASHION: "الموضة",
    BEAUTY: "العناية والجمال",
    ELECTRONICS: "الإلكترونيات",
    HOME: "المنزل",
    FOOD: "الطعام",
    FITNESS: "اللياقة",
    KIDS: "الأطفال",
    TRAVEL: "السفر",
    GAMING: "الألعاب",
    OTHER: "المنتجات المتنوعة",
  }[category];
}

function intentLabelAr(intent: TrendIntent) {
  return {
    COMMERCIAL: "نية شرائية",
    NEWS: "اهتمام خبري",
    ENTERTAINMENT: "زخم ترفيهي",
  }[intent];
}

function uniqueStrings(values?: Array<string | null | undefined>) {
  return [...new Set((values ?? []).filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim()))];
}

function extractJsonObject(content: string) {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Could not extract JSON object from model response");
  }
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampUnit(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sanitizeHashtag(value: string) {
  return value.replace(/[^\p{L}\p{N}_]+/gu, "");
}
