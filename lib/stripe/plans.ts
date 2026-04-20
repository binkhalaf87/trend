import { CheckCircle2 } from "lucide-react";

export type PlanId = "STARTER" | "GROWTH" | "ENTERPRISE";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: PlanId;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  priceUSD: number;
  priceSAR: number;
  priceIdEnv: string;
  badge?: string;
  color: string;
  limits: {
    trendsPerDay: number | "unlimited";
    contentPerMonth: number | "unlimited";
    alertChannels: string[];
    markets: number | "unlimited";
  };
  features: PlanFeature[];
}

export const PLANS: Record<PlanId, Plan> = {
  STARTER: {
    id: "STARTER",
    nameAr: "المبتدئ",
    nameEn: "Starter",
    descriptionAr: "مثالي للمتاجر الناشئة التي تريد اكتشاف الترندات",
    priceUSD: 29,
    priceSAR: 109,
    priceIdEnv: "STRIPE_PRICE_STARTER",
    color: "blue",
    limits: {
      trendsPerDay: 20,
      contentPerMonth: 50,
      alertChannels: ["EMAIL"],
      markets: 1,
    },
    features: [
      { text: "20 ترند يومياً", included: true },
      { text: "50 محتوى مُولَّد/شهر", included: true },
      { text: "تنبيهات بالإيميل", included: true },
      { text: "سوق واحد (السعودية أو الإمارات)", included: true },
      { text: "5 مؤثرين مقترحين", included: true },
      { text: "تنبيهات واتساب", included: false },
      { text: "تحليلات متقدمة", included: false },
      { text: "API Access", included: false },
    ],
  },

  GROWTH: {
    id: "GROWTH",
    nameAr: "النمو",
    nameEn: "Growth",
    descriptionAr: "للمتاجر النشطة التي تريد التفوق على المنافسين",
    priceUSD: 79,
    priceSAR: 299,
    priceIdEnv: "STRIPE_PRICE_GROWTH",
    badge: "الأكثر شيوعاً",
    color: "primary",
    limits: {
      trendsPerDay: "unlimited",
      contentPerMonth: 200,
      alertChannels: ["EMAIL", "WHATSAPP"],
      markets: 3,
    },
    features: [
      { text: "ترندات غير محدودة", included: true },
      { text: "200 محتوى مُولَّد/شهر", included: true },
      { text: "تنبيهات إيميل + واتساب", included: true },
      { text: "3 أسواق (خليجية)", included: true },
      { text: "20 مؤثر مقترح", included: true },
      { text: "تحليلات متقدمة", included: true },
      { text: "تنبيهات فورية push", included: true },
      { text: "API Access", included: false },
    ],
  },

  ENTERPRISE: {
    id: "ENTERPRISE",
    nameAr: "المؤسسي",
    nameEn: "Enterprise",
    descriptionAr: "للعلامات التجارية الكبيرة والوكالات التسويقية",
    priceUSD: 199,
    priceSAR: 749,
    priceIdEnv: "STRIPE_PRICE_ENTERPRISE",
    color: "purple",
    limits: {
      trendsPerDay: "unlimited",
      contentPerMonth: "unlimited",
      alertChannels: ["EMAIL", "WHATSAPP", "PUSH"],
      markets: "unlimited",
    },
    features: [
      { text: "ترندات غير محدودة", included: true },
      { text: "محتوى غير محدود", included: true },
      { text: "جميع قنوات التنبيه", included: true },
      { text: "جميع الأسواق العربية", included: true },
      { text: "مؤثرون غير محدودين", included: true },
      { text: "تحليلات متقدمة", included: true },
      { text: "API Access كامل", included: true },
      { text: "دعم أولوية 24/7", included: true },
    ],
  },
};

export const PLAN_LIST = Object.values(PLANS);

// Feature gates — ما يمكن لكل باقة فعله
export const FEATURES = {
  TRENDS_UNLIMITED:     { STARTER: false, GROWTH: true,  ENTERPRISE: true  },
  CONTENT_ADVANCED:     { STARTER: false, GROWTH: true,  ENTERPRISE: true  },
  ALERTS_WHATSAPP:      { STARTER: false, GROWTH: true,  ENTERPRISE: true  },
  ALERTS_PUSH:          { STARTER: false, GROWTH: true,  ENTERPRISE: true  },
  ANALYTICS:            { STARTER: false, GROWTH: true,  ENTERPRISE: true  },
  API_ACCESS:           { STARTER: false, GROWTH: false, ENTERPRISE: true  },
  MULTI_MARKET:         { STARTER: false, GROWTH: true,  ENTERPRISE: true  },
  PRIORITY_SUPPORT:     { STARTER: false, GROWTH: false, ENTERPRISE: true  },
} as const;

export type Feature = keyof typeof FEATURES;

export function canAccess(plan: PlanId | null | undefined, feature: Feature): boolean {
  if (!plan) return false;
  return FEATURES[feature][plan] ?? false;
}

export function getPriceId(plan: PlanId): string {
  const envKey = PLANS[plan].priceIdEnv;
  return process.env[envKey] ?? "";
}
