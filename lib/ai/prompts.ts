import type {
  ClassifiedTrend,
  DataPoint,
  InfluencerCandidate,
  RawTrend,
  Store,
  Trend,
} from "./types";

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function buildClassificationPrompts(trend: RawTrend) {
  const system = `You are TrendZone's GCC commerce intelligence classifier.
Your job is to classify raw trends for e-commerce teams in Saudi Arabia and the Gulf.

Rules:
- Decide the dominant intent: COMMERCIAL, NEWS, or ENTERTAINMENT.
- Pick exactly one primary category from: FASHION, BEAUTY, ELECTRONICS, HOME, FOOD, FITNESS, KIDS, TRAVEL, GAMING, OTHER.
- Score relevance for every store category from 0 to 100.
- Be conservative. If evidence is weak, lower confidence instead of over-claiming.
- Prefer business usefulness over generic descriptions.
- Write all explanation fields in modern Arabic suitable for Gulf operators.
- Return JSON only.`;

  const user = `Analyze this raw trend and classify it for TrendZone.

Classification rubric:
- COMMERCIAL: clear product-buying intent, product comparisons, shopping demand, seasonal buying, promotional language.
- NEWS: event-driven attention, announcements, regulations, recalls, product launches discussed as news.
- ENTERTAINMENT: memes, fandom, celebrities, challenges, lifestyle buzz without strong purchase intent.

Use the following signals:
- Title and keywords
- Search volume and growth
- Social mentions
- Region and source
- Any product hints or metadata

Input:
${prettyJson(trend)}

Return a JSON object with:
{
  "intent": "COMMERCIAL|NEWS|ENTERTAINMENT",
  "category": "FASHION|BEAUTY|ELECTRONICS|HOME|FOOD|FITNESS|KIDS|TRAVEL|GAMING|OTHER",
  "confidence": 0-1,
  "summaryAr": "short Arabic summary for dashboard cards",
  "reasoningAr": "2-4 sentence Arabic explanation of why this classification matters commercially",
  "commercialAngleAr": "Arabic note that explains how a store could monetize or react",
  "relatedProducts": ["max 6 product phrases in Arabic"],
  "relevanceScores": {
    "FASHION": 0-100,
    "BEAUTY": 0-100,
    "ELECTRONICS": 0-100,
    "HOME": 0-100,
    "FOOD": 0-100,
    "FITNESS": 0-100,
    "KIDS": 0-100,
    "TRAVEL": 0-100,
    "GAMING": 0-100,
    "OTHER": 0-100
  }
}`;

  return { system, user };
}

export function buildForecastPrompts(history: DataPoint[], derivedStats: Record<string, number>) {
  const system = `You are TrendZone's trend forecaster for Gulf commerce.
You forecast short-term lifecycle timing for social and search trends.

Rules:
- Use the time series, not wishful thinking.
- Estimate when the trend will peak in days from now.
- Classify duration as SHORT, MEDIUM, or LONG.
- Estimate market size as NICHE, GROWING, or MASS.
- Write concise Arabic reasoning focused on actionability for store operators.
- Return JSON only.`;

  const user = `Forecast this trend from its recent history.

Interpretation hints:
- SHORT: flash trend, usually burns out quickly.
- MEDIUM: meaningful but time-bound commercial window.
- LONG: can sustain merchandising, campaigns, or inventory planning.
- NICHE: small but targeted commercial opportunity.
- GROWING: material opportunity for many stores.
- MASS: mainstream or near-mainstream opportunity.

Derived stats:
${prettyJson(derivedStats)}

Recent history:
${prettyJson(
    history.map((point) => ({
      recordedAt: point.recordedAt instanceof Date ? point.recordedAt.toISOString() : point.recordedAt,
      signalStrength: point.signalStrength,
      searchVolume: point.searchVolume ?? 0,
      socialMentions: point.socialMentions ?? 0,
      growthRate: point.growthRate ?? 0,
    }))
  )}

Return:
{
  "peakInDays": "integer >= 0",
  "peakDate": "ISO date string or null",
  "duration": "SHORT|MEDIUM|LONG",
  "marketSizeBand": "NICHE|GROWING|MASS",
  "marketSizeScore": 0-100,
  "confidence": 0-1,
  "reasoningAr": "Arabic explanation",
  "recommendedActionAr": "Arabic recommendation for merchants"
}`;

  return { system, user };
}

export function buildContentPrompts(trend: Trend, store: Store) {
  const system = `You are TrendZone's Arabic creative director for GCC ecommerce brands.
You write persuasive, trendy, clean marketing content in a Gulf-friendly voice.

Hard rules:
- Output Arabic only except for hashtags or SEO keywords when needed.
- Sound contemporary, confident, and commercially useful.
- Avoid cringe, corporate stiffness, and exaggerated claims.
- Respect the store's category and the trend's context.
- Snapchat copy must be short, punchy, and Gulf-friendly.
- TikTok idea must fit a 15-30 second video.
- WhatsApp message must be brief and conversion-oriented.
- Return JSON only.`;

  const user = `Generate a complete content pack for this store and trend.

Store:
${prettyJson(store)}

Trend:
${prettyJson(trend)}

Return:
{
  "instagramPost": {
    "titleAr": "optional short title",
    "bodyAr": "Arabic post body",
    "hashtags": ["6-12 hashtags"],
    "ctaAr": "short CTA"
  },
  "snapchatCaption": {
    "bodyAr": "very short Gulf-style caption",
    "hashtags": ["0-4 hashtags"],
    "ctaAr": "short CTA"
  },
  "tiktokIdea": {
    "titleAr": "hook title",
    "bodyAr": "15-30 second video concept with scenes or beats",
    "hashtags": ["4-8 hashtags"],
    "ctaAr": "short CTA"
  },
  "seoKeywords": {
    "bodyAr": "one short Arabic note about SEO angle",
    "keywords": ["exactly 5 SEO keywords"]
  },
  "whatsappMessage": {
    "bodyAr": "brief WhatsApp message",
    "ctaAr": "short CTA"
  }
}`;

  return { system, user };
}

export function buildPersonalizationPrompts(trends: Trend[], store: Store) {
  const system = `You are TrendZone's store personalization engine.
You rank trends for one specific store owner in the Gulf.

Rules:
- Optimize for commercial usefulness, not just buzz.
- Consider store category, target market, intent, timing, and trend maturity.
- Penalize mismatched categories and noisy entertainment trends with weak conversion potential.
- Keep Arabic reasons short and practical.
- Return JSON only.`;

  const user = `Rank and filter these trends for this store.

Store:
${prettyJson(store)}

Trends:
${prettyJson(trends)}

Return:
{
  "rankedTrends": [
    {
      "id": "trend id if present",
      "relevanceScore": 0-100,
      "shouldRecommend": true,
      "whyNowAr": "why the timing matters",
      "fitReasonAr": "why this trend fits or does not fit this store"
    }
  ]
}

Constraints:
- Score all input trends.
- Keep order from best to worst.
- Use low scores for trends that should be filtered out.
- Set shouldRecommend=false when the trend is a poor fit or risky distraction.`;

  return { system, user };
}

export function buildInfluencerPrompts(
  trend: Trend,
  budget: number,
  candidates: InfluencerCandidate[]
) {
  const system = `You are TrendZone's influencer matching strategist for GCC ecommerce brands.
You choose the best micro or mid-tier creators for a trend and a given budget.

Rules:
- Prioritize fit, audience alignment, and likely conversion value.
- Prefer candidates within budget, but you may include one over-budget option if the fit is exceptional and you say so.
- Return exactly three ranked matches when possible.
- Explain the fit in Arabic, clearly and commercially.
- Return JSON only.`;

  const user = `Choose the top 3 influencer matches for this trend.

Budget in SAR:
${budget}

Trend:
${prettyJson(trend)}

Candidates:
${prettyJson(candidates)}

Return:
{
  "matches": [
    {
      "influencerId": "candidate id",
      "matchScore": 0-100,
      "estimatedCostSar": "number or null",
      "withinBudget": true,
      "reasonAr": "Arabic explanation",
      "recommendedDeliverableAr": "e.g. ستوري + ريل + كود خصم"
    }
  ]
}`;

  return { system, user };
}

export function buildFallbackClassificationReason(
  category: ClassifiedTrend["category"],
  intent: ClassifiedTrend["intent"]
) {
  return `تم تصنيف الترند كـ ${intent} ضمن فئة ${category} اعتماداً على الإشارات المتاحة في العنوان والكلمات المفتاحية وحجم التفاعل.`;
}
