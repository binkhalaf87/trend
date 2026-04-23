CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "storeName" TEXT,
    "storeUrl" TEXT,
    "storeCategory" "TrendCategory",
    "storeDescription" TEXT,
    "subscriptionPlan" "SubscriptionPlan",
    "subscriptionStatus" "SubscriptionStatus",
    "subscriptionEndDate" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "whatsappNumber" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'ar',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
    "notifyByEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyByWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "notifyByPush" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trends" (
    "id" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "summaryAr" TEXT,
    "descriptionAr" TEXT,
    "category" "TrendCategory" NOT NULL,
    "status" "TrendStatus" NOT NULL DEFAULT 'EARLY',
    "source" "TrendSource" NOT NULL,
    "geographicFocus" "GeoFocus" NOT NULL DEFAULT 'GULF',
    "signalStrength" INTEGER NOT NULL DEFAULT 0,
    "growthRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "searchVolume7d" INTEGER NOT NULL DEFAULT 0,
    "socialMentions7d" INTEGER NOT NULL DEFAULT 0,
    "engagementScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "peakExpectedAt" TIMESTAMP(3),
    "peakConfidence" DOUBLE PRECISION,
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "relatedProducts" JSONB NOT NULL DEFAULT '[]',
    "sourceUrls" JSONB NOT NULL DEFAULT '[]',
    "priceRangeAr" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "trends_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trend_content" (
    "id" TEXT NOT NULL,
    "trendId" TEXT NOT NULL,
    "platform" "ContentPlatform" NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "generatedBy" "GeneratedBy" NOT NULL DEFAULT 'OPENAI',
    "titleAr" TEXT,
    "contentAr" TEXT NOT NULL,
    "hashtags" JSONB NOT NULL DEFAULT '[]',
    "ctaAr" TEXT,
    "qualityScore" INTEGER,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "promptUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trend_content_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_trends" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trendId" TEXT NOT NULL,
    "isSaved" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "isActedUpon" BOOLEAN NOT NULL DEFAULT false,
    "relevanceScore" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_trends_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trendId" TEXT,
    "type" "AlertType" NOT NULL,
    "messageAr" TEXT NOT NULL,
    "detailsAr" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentVia" "AlertChannel"[],
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "alert_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "minSignalStrength" INTEGER DEFAULT 70,
    "minGrowthRate" DOUBLE PRECISION DEFAULT 50,
    "channels" "AlertChannel"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "alert_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "influencers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "platform" "InfluencerPlatform" NOT NULL,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "categories" JSONB NOT NULL DEFAULT '[]',
    "bio" TEXT,
    "contactEmail" TEXT,
    "whatsapp" TEXT,
    "priceRange" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "country" TEXT DEFAULT 'SA',
    "city" TEXT,
    "avgLikes" INTEGER,
    "avgComments" INTEGER,
    "avgViews" INTEGER,
    "avatarUrl" TEXT,
    "profileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "influencers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "influencer_matches" (
    "id" TEXT NOT NULL,
    "trendId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL DEFAULT 0,
    "reasonAr" TEXT,
    "isContacted" BOOLEAN NOT NULL DEFAULT false,
    "contactedAt" TIMESTAMP(3),
    "dealStatus" TEXT,
    "recommendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "influencer_matches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trend_history" (
    "id" TEXT NOT NULL,
    "trendId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signalStrength" INTEGER NOT NULL DEFAULT 0,
    "searchVolume" INTEGER NOT NULL DEFAULT 0,
    "socialMentions" INTEGER NOT NULL DEFAULT 0,
    "growthRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "trend_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "collector_runs" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "itemsFound" INTEGER NOT NULL DEFAULT 0,
    "itemsSaved" INTEGER NOT NULL DEFAULT 0,
    "errorMsg" TEXT,
    "metadata" JSONB,
    CONSTRAINT "collector_runs_pkey" PRIMARY KEY ("id")
);
