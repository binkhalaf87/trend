// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║               TrendZone — Database Types (mirror of Prisma schema)          ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ─── Enums ────────────────────────────────────────────────────────────────────

export type SubscriptionPlan = "STARTER" | "GROWTH" | "ENTERPRISE";
export type SubscriptionStatus = "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "PAUSED";

export type TrendCategory =
  | "FASHION"
  | "BEAUTY"
  | "ELECTRONICS"
  | "HOME"
  | "FOOD"
  | "FITNESS"
  | "KIDS"
  | "TRAVEL"
  | "GAMING"
  | "OTHER";

export type TrendStatus = "EARLY" | "RISING" | "PEAK" | "DECLINING";
export type TrendSource = "GOOGLE_TRENDS" | "REDDIT" | "TIKTOK" | "PINTEREST" | "INSTAGRAM" | "TWITTER" | "AMAZON";
export type GeoFocus = "SA" | "AE" | "KW" | "QA" | "BH" | "OM" | "EG" | "GULF" | "ARAB" | "GLOBAL";

export type ContentPlatform = "INSTAGRAM" | "TIKTOK" | "SNAPCHAT" | "TWITTER" | "YOUTUBE" | "SEO" | "EMAIL" | "WHATSAPP";
export type ContentType = "POST" | "CAPTION" | "VIDEO_IDEA" | "HASHTAGS" | "SEO_KEYWORDS" | "AD_COPY" | "PRODUCT_DESC" | "EMAIL_BODY";
export type GeneratedBy = "OPENAI" | "CLAUDE";

export type AlertType = "NEW_TREND" | "PEAK_WARNING" | "COMPETITOR_MOVE" | "TREND_SPIKE" | "WEEKLY_DIGEST";
export type AlertChannel = "PUSH" | "WHATSAPP" | "EMAIL" | "IN_APP";

export type InfluencerPlatform = "INSTAGRAM" | "TIKTOK" | "SNAPCHAT" | "YOUTUBE" | "TWITTER";

// ─── 1. User ──────────────────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  supabaseId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;

  storeName: string | null;
  storeUrl: string | null;
  storeCategory: TrendCategory | null;
  storeDescription: string | null;

  subscriptionPlan: SubscriptionPlan | null;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionEndDate: Date | null;
  trialEndsAt: Date | null;

  whatsappNumber: string | null;
  preferredLanguage: string;
  timezone: string;

  notifyByEmail: boolean;
  notifyByWhatsapp: boolean;
  notifyByPush: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface DbUserWithRelations extends DbUser {
  subscription: DbSubscription | null;
  userTrends: DbUserTrend[];
  alerts: DbAlert[];
  alertSettings: DbAlertSetting[];
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface DbSubscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialStart: Date | null;
  trialEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── 2. Trend ─────────────────────────────────────────────────────────────────

export interface DbTrend {
  id: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string | null;
  descriptionAr: string | null;

  category: TrendCategory;
  status: TrendStatus;
  source: TrendSource;
  geographicFocus: GeoFocus;

  signalStrength: number;       // 0-100
  growthRate: number;           // % خلال 7 أيام
  searchVolume7d: number;
  socialMentions7d: number;
  engagementScore: number;

  peakExpectedAt: Date | null;
  peakConfidence: number | null;  // 0-1

  // JSON fields — عند القراءة من Prisma تُعاد كـ unknown
  keywords: string[];
  relatedProducts: string[];
  sourceUrls: string[];
  priceRangeAr: string | null;

  imageUrl: string | null;
  videoUrl: string | null;

  detectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbTrendWithRelations extends DbTrend {
  content: DbTrendContent[];
  userTrends: DbUserTrend[];
  alerts: DbAlert[];
  influencerMatches: DbInfluencerMatchWithInfluencer[];
}

// ─── 3. TrendContent ─────────────────────────────────────────────────────────

export interface DbTrendContent {
  id: string;
  trendId: string;
  platform: ContentPlatform;
  contentType: ContentType;
  generatedBy: GeneratedBy;
  titleAr: string | null;
  contentAr: string;
  hashtags: string[];
  ctaAr: string | null;
  qualityScore: number | null;
  isApproved: boolean;
  promptUsed: string | null;
  createdAt: Date;
}

export interface DbTrendContentWithTrend extends DbTrendContent {
  trend: Pick<DbTrend, "id" | "titleAr" | "titleEn" | "category" | "status">;
}

// ─── 4. UserTrend ────────────────────────────────────────────────────────────

export interface DbUserTrend {
  id: string;
  userId: string;
  trendId: string;
  isSaved: boolean;
  isDismissed: boolean;
  isActedUpon: boolean;
  relevanceScore: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbUserTrendWithTrend extends DbUserTrend {
  trend: DbTrend;
}

// ─── 5. Alert ────────────────────────────────────────────────────────────────

export interface DbAlert {
  id: string;
  userId: string;
  trendId: string | null;
  type: AlertType;
  messageAr: string;
  detailsAr: string | null;
  isRead: boolean;
  sentVia: AlertChannel[];
  sentAt: Date | null;
  readAt: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface DbAlertWithTrend extends DbAlert {
  trend: Pick<DbTrend, "id" | "titleAr" | "category" | "status"> | null;
}

// ─── AlertSetting ─────────────────────────────────────────────────────────────

export interface DbAlertSetting {
  id: string;
  userId: string;
  alertType: AlertType;
  isEnabled: boolean;
  minSignalStrength: number | null;
  minGrowthRate: number | null;
  channels: AlertChannel[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── 6. Influencer ───────────────────────────────────────────────────────────

export interface DbInfluencer {
  id: string;
  name: string;
  handle: string;
  platform: InfluencerPlatform;
  followersCount: number;
  engagementRate: number;
  categories: TrendCategory[];
  bio: string | null;
  contactEmail: string | null;
  whatsapp: string | null;
  priceRange: string | null;
  currency: string;
  isVerified: boolean;
  isActive: boolean;
  country: string | null;
  city: string | null;
  avgLikes: number | null;
  avgComments: number | null;
  avgViews: number | null;
  avatarUrl: string | null;
  profileUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── 7. InfluencerMatch ───────────────────────────────────────────────────────

export interface DbInfluencerMatch {
  id: string;
  trendId: string;
  influencerId: string;
  matchScore: number;
  reasonAr: string | null;
  isContacted: boolean;
  contactedAt: Date | null;
  dealStatus: string | null;
  recommendedAt: Date;
  updatedAt: Date;
}

export interface DbInfluencerMatchWithInfluencer extends DbInfluencerMatch {
  influencer: DbInfluencer;
}

export interface DbInfluencerMatchWithTrend extends DbInfluencerMatch {
  trend: Pick<DbTrend, "id" | "titleAr" | "category" | "status" | "signalStrength">;
}

// ─── Query Helper Types ───────────────────────────────────────────────────────

/** Trend card — للعرض في القوائم */
export type TrendCard = Pick<
  DbTrend,
  | "id"
  | "titleAr"
  | "titleEn"
  | "summaryAr"
  | "category"
  | "status"
  | "source"
  | "geographicFocus"
  | "signalStrength"
  | "growthRate"
  | "peakExpectedAt"
  | "imageUrl"
  | "detectedAt"
>;

/** Trend detail — للصفحة الداخلية */
export type TrendDetail = DbTrend & {
  content: DbTrendContent[];
  influencerMatches: DbInfluencerMatchWithInfluencer[];
  _count: { userTrends: number };
};

/** Dashboard stats */
export interface DashboardStats {
  activeTrendsCount: number;
  savedTrendsCount: number;
  generatedContentCount: number;
  unreadAlertsCount: number;
  topTrends: TrendCard[];
}

/** Paginated response wrapper */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** API error shape */
export interface ApiError {
  error: string;
  details?: unknown;
  code?: string;
}
