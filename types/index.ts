// ─── Enums ────────────────────────────────────────────────────────────────────

export type SubscriptionPlan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING";

export type TrendCategory =
  | "FASHION"
  | "ELECTRONICS"
  | "HOME_DECOR"
  | "BEAUTY"
  | "FOOD"
  | "FITNESS"
  | "GAMING"
  | "TRAVEL"
  | "KIDS"
  | "OTHER";

export type TrendStatus = "RISING" | "PEAK" | "DECLINING" | "STABLE";
export type ContentType = "SOCIAL_POST" | "PRODUCT_DESCRIPTION" | "AD_COPY" | "EMAIL" | "BLOG_EXCERPT";
export type AlertType = "TREND_SPIKE" | "NEW_TREND" | "COMPETITOR_ALERT" | "WEEKLY_DIGEST";

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface TrendItem {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string | null;
  category: TrendCategory;
  status: TrendStatus;
  score: number;
  momentum: number;
  searchVolume: number;
  socialMentions: number;
  sourceUrls: string[];
  tags: string[];
  imageUrl?: string | null;
  relatedProducts: string[];
  detectedAt: string;
  updatedAt: string;
}

export interface GeneratedContent {
  id: string;
  userId: string;
  trendId?: string | null;
  type: ContentType;
  titleAr?: string | null;
  bodyAr: string;
  hashtags: string[];
  platform?: string | null;
  tone?: string | null;
  createdAt: string;
  trend?: Pick<TrendItem, "nameAr" | "category"> | null;
}

export interface AlertItem {
  id: string;
  type: AlertType;
  titleAr: string;
  bodyAr: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  supabaseId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  storeName?: string | null;
  storeCategory?: TrendCategory | null;
  language: string;
  timezone: string;
  subscription?: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodEnd?: string | null;
  } | null;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items?: T[];
  trends?: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface ApiError {
  error: string | Array<{ message: string; path: (string | number)[] }>;
}
