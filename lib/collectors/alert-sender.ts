import { prisma } from "@/lib/prisma";
import type { AnomalyResult } from "./types";

// ─── Main: create alerts for all users who should be notified ─────────────────

export async function sendTrendAlerts(): Promise<{
  alertsCreated: number;
  usersNotified: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let alertsCreated = 0;
  const notifiedUsers = new Set<string>();

  // Load high-signal trends detected in last 2 hours
  const recentTrends = await prisma.trend.findMany({
    where: {
      signalStrength: { gte: 60 },
      updatedAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    },
    orderBy: { signalStrength: "desc" },
    take: 50,
  });

  if (!recentTrends.length) return { alertsCreated: 0, usersNotified: 0, errors };

  // Load all active users with their alert settings and store category
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { subscriptionStatus: "ACTIVE" },
        { subscriptionStatus: "TRIALING" },
      ],
    },
    select: {
      id: true,
      storeCategory: true,
      notifyByEmail: true,
      notifyByPush: true,
      notifyByWhatsapp: true,
      alertSettings: {
        where: { isEnabled: true },
      },
    },
  });

  for (const user of users) {
    // Which trends are relevant to this user's store category?
    const relevantTrends = recentTrends.filter((trend) => {
      if (!user.storeCategory) return true; // no category set = show all
      return trend.category === user.storeCategory || trend.signalStrength >= 85;
    });

    for (const trend of relevantTrends) {
      const setting = user.alertSettings.find(
        (s) => s.alertType === "TREND_SPIKE" || s.alertType === "NEW_TREND"
      );

      const minSignal = setting?.minSignalStrength ?? 70;
      const minGrowth = setting?.minGrowthRate ?? 50;

      if (
        trend.signalStrength < minSignal &&
        trend.growthRate < minGrowth
      ) continue;

      // Don't duplicate: skip if alert already sent for this user+trend today
      const alreadySent = await prisma.alert.findFirst({
        where: {
          userId: user.id,
          trendId: trend.id,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });
      if (alreadySent) continue;

      const channels = buildChannels(user);
      const alertType = trend.signalStrength >= 80 ? "TREND_SPIKE" : "NEW_TREND";

      try {
        await prisma.alert.create({
          data: {
            userId: user.id,
            trendId: trend.id,
            type: alertType,
            messageAr: buildMessage(trend.titleAr, trend.signalStrength, alertType),
            detailsAr: buildDetails(trend),
            sentVia: channels,
            sentAt: new Date(),
            metadata: {
              signalStrength: trend.signalStrength,
              growthRate: trend.growthRate,
              category: trend.category,
            },
          },
        });

        alertsCreated++;
        notifiedUsers.add(user.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`user ${user.id} / trend ${trend.id}: ${msg}`);
      }
    }
  }

  return {
    alertsCreated,
    usersNotified: notifiedUsers.size,
    errors,
  };
}

// ─── Send weekly digest alerts ────────────────────────────────────────────────

export async function sendWeeklyDigest(): Promise<void> {
  const topTrends = await prisma.trend.findMany({
    where: {
      status: { in: ["RISING", "PEAK"] },
      signalStrength: { gte: 50 },
    },
    orderBy: { signalStrength: "desc" },
    take: 10,
  });

  if (!topTrends.length) return;

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { subscriptionStatus: "ACTIVE" },
        { subscriptionStatus: "TRIALING" },
      ],
      notifyByEmail: true,
    },
    select: { id: true },
  });

  for (const user of users) {
    const alreadySent = await prisma.alert.findFirst({
      where: {
        userId: user.id,
        type: "WEEKLY_DIGEST",
        createdAt: { gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      },
    });
    if (alreadySent) continue;

    await prisma.alert.create({
      data: {
        userId: user.id,
        type: "WEEKLY_DIGEST",
        messageAr: `📊 ملخصك الأسبوعي: ${topTrends.length} ترند صاعد في مجالك`,
        detailsAr: topTrends
          .slice(0, 5)
          .map((t, i) => `${i + 1}. ${t.titleAr} (قوة الإشارة: ${t.signalStrength})`)
          .join("\n"),
        sentVia: ["EMAIL", "IN_APP"],
        sentAt: new Date(),
        metadata: {
          trendIds: topTrends.map((t) => t.id),
          topTrend: topTrends[0]?.titleAr,
        },
      },
    });
  }
}

// ─── Notify admin if a collector failed ───────────────────────────────────────

export async function notifyAdminOnFailure(
  source: string,
  error: string
): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    // Find admin user in DB
    const admin = await prisma.user.findFirst({
      where: { email: adminEmail },
      select: { id: true },
    });
    if (!admin) return;

    await prisma.alert.create({
      data: {
        userId: admin.id,
        type: "NEW_TREND",
        messageAr: `⚠️ فشل جامع البيانات: ${source}`,
        detailsAr: error.slice(0, 500),
        sentVia: ["EMAIL", "IN_APP"],
        sentAt: new Date(),
        metadata: { isAdminAlert: true, source, error },
      },
    });
  } catch (e) {
    console.error("[alertSender] notifyAdminOnFailure failed:", e);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildChannels(user: {
  notifyByEmail: boolean;
  notifyByPush: boolean;
  notifyByWhatsapp: boolean;
}): string[] {
  const channels: string[] = ["IN_APP"];
  if (user.notifyByEmail) channels.push("EMAIL");
  if (user.notifyByPush) channels.push("PUSH");
  if (user.notifyByWhatsapp) channels.push("WHATSAPP");
  return channels;
}

function buildMessage(
  titleAr: string,
  signalStrength: number,
  type: string
): string {
  if (type === "TREND_SPIKE") {
    return `🚀 ارتفاع مفاجئ: "${titleAr}" — قوة الإشارة ${signalStrength}/100`;
  }
  return `✨ ترند جديد: "${titleAr}" — قوة الإشارة ${signalStrength}/100`;
}

function buildDetails(trend: {
  titleAr: string;
  growthRate: number;
  category: string;
  source: string;
}): string {
  return [
    `معدل النمو: ${Math.round(trend.growthRate)}%`,
    `الفئة: ${CATEGORY_AR[trend.category] ?? trend.category}`,
    `المصدر: ${SOURCE_AR[trend.source] ?? trend.source}`,
  ].join(" • ");
}

const CATEGORY_AR: Record<string, string> = {
  FASHION: "موضة", BEAUTY: "جمال", ELECTRONICS: "إلكترونيات",
  HOME: "منزل", FOOD: "طعام", FITNESS: "لياقة", KIDS: "أطفال",
  TRAVEL: "سفر", GAMING: "ألعاب", OTHER: "أخرى",
};

const SOURCE_AR: Record<string, string> = {
  GOOGLE_TRENDS: "جوجل ترندز", REDDIT: "ريديت",
  PINTEREST: "بينتريست", TIKTOK: "تيك توك",
  INSTAGRAM: "إنستغرام", TWITTER: "تويتر", AMAZON: "أمازون",
};
