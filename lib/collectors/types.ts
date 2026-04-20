// ─── Source & Status ──────────────────────────────────────────────────────────

export type CollectorSource = "GOOGLE_TRENDS" | "REDDIT" | "PINTEREST";
export type CollectorRunStatus = "RUNNING" | "SUCCESS" | "FAILED" | "PARTIAL";

// ─── Raw data emitted by each collector ───────────────────────────────────────

export interface RawTrendData {
  titleEn: string;
  titleAr: string;
  keywords: string[];
  searchVolume?: number;
  growthRate?: number;
  socialMentions?: number;
  source: CollectorSource;
  region: string;         // GeoFocus value: "SA" | "AE" | "GULF" …
  category: string;       // TrendCategory value
  sourceUrls?: string[];
  relatedProducts?: string[];
  rawScore?: number;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

// ─── Historical data point for anomaly detection ──────────────────────────────

export interface TrendDataPoint {
  trendId: string;
  titleEn: string;
  recordedAt: Date;
  signalStrength: number;
  searchVolume: number;
  socialMentions: number;
  growthRate: number;
}

// ─── Anomaly detection output ─────────────────────────────────────────────────

export interface AnomalyResult {
  trendId: string;
  titleEn: string;
  currentValue: number;
  mean30d: number;
  stdDev30d: number;
  zScore: number;
  signalStrength: number;   // 0-100 derived from z-score
  isAnomaly: boolean;
  growthVs7d: number;       // % change vs 7-day average
  growthVs30d: number;      // % change vs 30-day average
  newStatus: string;        // suggested TrendStatus
}

// ─── Collector run result ─────────────────────────────────────────────────────

export interface CollectorResult {
  source: CollectorSource;
  trendsFound: RawTrendData[];
  trendsSaved: number;
  errors: string[];
  durationMs: number;
}

// ─── Retry options ────────────────────────────────────────────────────────────

export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}

// ─── Google Trends raw responses ──────────────────────────────────────────────

export interface GTTimelinePoint {
  time: string;
  formattedTime: string;
  value: number[];
  hasData: boolean[];
}

export interface GTInterestOverTime {
  default: {
    timelineData: GTTimelinePoint[];
    averages: number[];
  };
}

export interface GTRankedKeyword {
  query: string;
  value: number | string;
  link: string;
  hasData: boolean;
}

export interface GTRelatedQueries {
  default: {
    rankedList: Array<{ rankedKeyword: GTRankedKeyword[] }>;
  };
}

// ─── Reddit raw responses ─────────────────────────────────────────────────────

export interface RedditPost {
  title: string;
  score: number;
  num_comments: number;
  created_utc: number;
  url: string;
  permalink: string;
  selftext: string;
  subreddit: string;
  upvote_ratio: number;
  thumbnail?: string;
}

export interface RedditListingResponse {
  data: {
    children: Array<{ data: RedditPost }>;
    after?: string;
  };
}

// ─── Pinterest raw responses ──────────────────────────────────────────────────

export interface PinterestTrendItem {
  keyword: string;
  trend_type: string;
  weekly_growth_percent: number;
  monthly_growth_percent: number;
  yoy_growth_percent: number;
  normalized_growth_rate: number[];
  time_series?: Array<{ date: string; value: number }>;
}

export interface PinterestTrendsResponse {
  trends: PinterestTrendItem[];
}
