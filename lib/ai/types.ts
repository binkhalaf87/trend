import type {
  ContentPlatform,
  ContentType,
  GeneratedBy,
  GeoFocus,
  InfluencerPlatform,
  TrendCategory,
} from "@/types/db";

export const STORE_CATEGORIES: TrendCategory[] = [
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
];

export type TrendIntent = "COMMERCIAL" | "NEWS" | "ENTERTAINMENT";
export type TrendDuration = "SHORT" | "MEDIUM" | "LONG";
export type MarketSizeBand = "NICHE" | "GROWING" | "MASS";

export interface RawTrend {
  id?: string;
  titleEn: string;
  titleAr?: string | null;
  descriptionAr?: string | null;
  summaryAr?: string | null;
  keywords?: string[];
  source?: string;
  region?: GeoFocus | string | null;
  categoryHint?: string | null;
  searchVolume?: number | null;
  growthRate?: number | null;
  socialMentions?: number | null;
  signalStrength?: number | null;
  sourceUrls?: string[];
  relatedProducts?: string[];
  metadata?: Record<string, unknown>;
}

export interface ClassifiedTrend {
  intent: TrendIntent;
  category: TrendCategory;
  confidence: number;
  summaryAr: string;
  reasoningAr: string;
  commercialAngleAr: string;
  relatedProducts: string[];
  relevanceScores: Record<TrendCategory, number>;
}

export interface DataPoint {
  recordedAt: Date | string;
  signalStrength: number;
  searchVolume?: number | null;
  socialMentions?: number | null;
  growthRate?: number | null;
}

export interface Forecast {
  peakInDays: number;
  peakDate: string | null;
  duration: TrendDuration;
  marketSizeBand: MarketSizeBand;
  marketSizeScore: number;
  confidence: number;
  reasoningAr: string;
  recommendedActionAr: string;
}

export interface Store {
  id?: string;
  name: string;
  category?: TrendCategory | null;
  description?: string | null;
  targetMarket?: GeoFocus | GeoFocus[] | null;
  tone?: string | null;
  audience?: string | null;
}

export interface Trend {
  id?: string;
  titleEn: string;
  titleAr: string;
  summaryAr?: string | null;
  descriptionAr?: string | null;
  category: TrendCategory;
  intent?: TrendIntent | null;
  geographicFocus?: GeoFocus | null;
  signalStrength?: number | null;
  growthRate?: number | null;
  searchVolume7d?: number | null;
  socialMentions7d?: number | null;
  keywords?: string[];
  relatedProducts?: string[];
  relevanceScores?: Partial<Record<TrendCategory, number>>;
  peakExpectedAt?: Date | string | null;
  peakConfidence?: number | null;
  trendDuration?: TrendDuration | null;
  marketSizeBand?: MarketSizeBand | null;
  marketSizeScore?: number | null;
}

export interface TrendContent {
  assetType:
    | "INSTAGRAM_POST"
    | "SNAPCHAT_CAPTION"
    | "TIKTOK_VIDEO_IDEA"
    | "SEO_KEYWORDS"
    | "WHATSAPP_MESSAGE";
  platform: ContentPlatform;
  contentType: ContentType;
  generatedBy: GeneratedBy;
  titleAr?: string;
  bodyAr: string;
  hashtags: string[];
  seoKeywords: string[];
  ctaAr?: string;
}

export interface RankedTrend extends Trend {
  relevanceScore: number;
  shouldRecommend: boolean;
  whyNowAr: string;
  fitReasonAr: string;
}

export interface InfluencerCandidate {
  id: string;
  name: string;
  handle: string;
  platform: InfluencerPlatform;
  followersCount: number;
  engagementRate: number;
  categories: TrendCategory[];
  priceRange?: string | null;
  bio?: string | null;
  country?: string | null;
  avgLikes?: number | null;
  avgComments?: number | null;
  avgViews?: number | null;
  isVerified?: boolean;
  profileUrl?: string | null;
}

export interface InfluencerMatch {
  influencerId: string;
  name: string;
  handle: string;
  platform: InfluencerPlatform;
  matchScore: number;
  estimatedCostSar: number | null;
  withinBudget: boolean;
  reasonAr: string;
  recommendedDeliverableAr: string;
}
