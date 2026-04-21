import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Bolt,
  BriefcaseBusiness,
  CalendarClock,
  ChevronLeft,
  Crown,
  Eye,
  Flame,
  LayoutGrid,
  MessageCircleMore,
  Settings,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MOCK_TRENDS } from "@/lib/utils/mock-data";
import { hydrateTrend } from "@/lib/utils/prisma-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const metadata: Metadata = {
  title: "لوحة التحكم",
};

type DashboardData = {
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
    storeName: string;
    planLabel: string;
    storeCategoryLabel: string;
  };
  stats: Array<{
    label: string;
    value: string;
    note: string;
    icon: typeof TrendingUp;
    accent: string;
  }>;
  hotTrends: Array<{
    id: string;
    title: string;
    categoryLabel: string;
    signalStrength: number;
    statusLabel: string;
    statusClassName: string;
    peakLabel: string;
    summary: string;
  }>;
  alerts: Array<{
    id: string;
    title: string;
    timeLabel: string;
    href: string;
    accentClassName: string;
    Icon: typeof TriangleAlert;
  }>;
  suggestedInfluencer: {
    name: string;
    handle: string;
    followersLabel: string;
    engagementLabel: string;
    priceLabel: string;
    profileUrl?: string | null;
    reason: string;
  };
  unreadAlerts: number;
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-white/45 bg-gradient-to-br from-[#534AB7] via-[#655ad2] to-[#8b84f1] px-5 py-6 text-white shadow-[0_28px_70px_rgba(83,74,183,0.28)] md:px-8 md:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
              <Sparkles className="h-3.5 w-3.5" />
              Dashboard الذكية لمتجرك
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[24px] bg-white/15 shadow-inner shadow-white/10">
                <LayoutGrid className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                    TrendZone
                  </h1>
                  <Badge className="border-none bg-white/15 px-3 py-1 text-white hover:bg-white/20">
                    {data.user.planLabel}
                  </Badge>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-white/80 md:text-base">
                  أهلاً بك في مركز القرار. هنا نراقب الترندات الأقرب لمجالك، ونلخّص
                  لك ما يستحق التنفيذ اليوم بدل التشتت بين الضجيج.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:min-w-[320px]">
            <div className="flex items-center justify-between rounded-[28px] border border-white/15 bg-black/10 px-4 py-4 backdrop-blur-md">
              <div className="space-y-1">
                <p className="text-xs text-white/65">المتجر الحالي</p>
                <p className="text-lg font-bold">{data.user.storeName}</p>
                <p className="text-xs text-white/70">{data.user.storeCategoryLabel}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                >
                  <Bell className="h-5 w-5" />
                  {data.unreadAlerts > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-extrabold text-[#534AB7]">
                      {data.unreadAlerts}
                    </span>
                  ) : null}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto rounded-full border border-white/15 bg-white/10 px-2 py-1.5 text-white hover:bg-white/15 hover:text-white"
                    >
                      <Avatar className="h-10 w-10 border border-white/20">
                        <AvatarImage src={data.user.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-white/20 text-sm font-bold text-white">
                          {getInitials(data.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden text-right sm:block">
                        <p className="text-sm font-bold">{data.user.name}</p>
                        <p className="text-[11px] text-white/70">{data.user.email}</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                    <DropdownMenuItem className="gap-2">
                      <UserRound className="h-4 w-4" />
                      الملف الشخصي
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Crown className="h-4 w-4" />
                      إدارة الباقة
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Settings className="h-4 w-4" />
                      الإعدادات
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-white/70">أولوية اليوم</p>
                <p className="mt-2 text-sm font-bold">الترندات الساخنة</p>
              </div>
              <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-white/70">المهمة التالية</p>
                <p className="mt-2 text-sm font-bold">افتح الخطة الجاهزة</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat, index) => (
          <Card
            key={stat.label}
            className="animate-slide-up rounded-[28px] border-white/50 bg-white/85 shadow-[0_20px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.note}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.accent}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[32px] border-white/50 bg-white/85 shadow-[0_24px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <CardTitle className="text-xl font-extrabold">الترندات الساخنة لمتجرك</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  أقوى الفرص المرتبطة بمجالك مرتبة حسب قوة الإشارة وقرب الذروة.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-full border-[#534AB7]/20 text-[#534AB7] hover:bg-[#534AB7]/8 hover:text-[#534AB7]">
                <Link href="/trends">
                  كل الترندات
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6">
              {data.hotTrends.map((trend, index) => (
                <div
                  key={trend.id}
                  className="group rounded-[28px] border border-border/70 bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-[#534AB7]/30 hover:shadow-[0_18px_40px_rgba(83,74,183,0.10)] dark:bg-black/10"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`border-none px-3 py-1 ${trend.statusClassName}`}>
                          {trend.statusLabel}
                        </Badge>
                        <Badge variant="secondary" className="border-none">
                          {trend.categoryLabel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-extrabold">{trend.title}</h3>
                        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                          {trend.summary}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>قوة الإشارة</span>
                            <span className="text-foreground">{trend.signalStrength}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#e8e6fb] dark:bg-white/10">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-[#8c84f2] via-[#6e63da] to-[#534AB7] transition-all"
                              style={{ width: `${trend.signalStrength}%` }}
                            />
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#534AB7]/8 px-3 py-2 text-xs font-semibold text-[#534AB7] dark:bg-[#534AB7]/15 dark:text-[#c9c4ff]">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {trend.peakLabel}
                        </div>
                      </div>
                    </div>

                    <Button asChild className="rounded-full bg-[#534AB7] px-5 text-white shadow-[0_14px_30px_rgba(83,74,183,0.28)] hover:bg-[#4a41a7]">
                      <Link href={`/content?trend=${trend.id}`}>
                        ابدأ الخطة
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/50 bg-white/85 shadow-[0_24px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-xl font-extrabold">آخر التنبيهات</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  آخر 5 تنبيهات مهمة وصلتك اليوم مرتبطة بترنداتك الأقوى.
                </p>
              </div>
              <Button asChild variant="ghost" className="rounded-full text-[#534AB7] hover:bg-[#534AB7]/8 hover:text-[#534AB7]">
                <Link href="/alerts">عرض الكل</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="group flex items-center gap-4 rounded-[24px] border border-border/60 bg-background/60 px-4 py-4 transition-all hover:border-[#534AB7]/25 hover:bg-[#534AB7]/[0.03] dark:bg-black/10"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${alert.accentClassName}`}>
                    <alert.Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{alert.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{alert.timeLabel}</p>
                  </div>
                  <Eye className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-[#534AB7]" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[32px] border-none bg-gradient-to-br from-[#19152f] via-[#221b40] to-[#534AB7] text-white shadow-[0_28px_65px_rgba(83,74,183,0.34)]">
            <CardContent className="relative p-6">
              <div className="absolute -left-10 top-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-[#c8c3ff]/15 blur-3xl" />
              <div className="relative space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  مؤثر مقترح للترند الأقوى
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold">{data.suggestedInfluencer.name}</h2>
                  <p className="mt-1 text-sm text-white/75">{data.suggestedInfluencer.handle}</p>
                </div>

                <p className="text-sm leading-7 text-white/80">
                  {data.suggestedInfluencer.reason}
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-[22px] bg-white/10 px-3 py-4 text-center">
                    <p className="text-[11px] text-white/60">المتابعون</p>
                    <p className="mt-2 text-sm font-extrabold">{data.suggestedInfluencer.followersLabel}</p>
                  </div>
                  <div className="rounded-[22px] bg-white/10 px-3 py-4 text-center">
                    <p className="text-[11px] text-white/60">التفاعل</p>
                    <p className="mt-2 text-sm font-extrabold">{data.suggestedInfluencer.engagementLabel}</p>
                  </div>
                  <div className="rounded-[22px] bg-white/10 px-3 py-4 text-center">
                    <p className="text-[11px] text-white/60">السعر</p>
                    <p className="mt-2 text-sm font-extrabold">{data.suggestedInfluencer.priceLabel}</p>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full rounded-full bg-white text-[#534AB7] hover:bg-white/90"
                >
                  <Link href={data.suggestedInfluencer.profileUrl ?? "/content"}>
                    <MessageCircleMore className="h-4 w-4" />
                    تواصل معه
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/50 bg-white/85 shadow-[0_24px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-extrabold">ملخص تنفيذي سريع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[24px] border border-border/70 bg-background/70 px-4 py-4 dark:bg-black/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#534AB7]/10 text-[#534AB7] dark:bg-[#534AB7]/18 dark:text-[#c9c4ff]">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">الأولوية الآن</p>
                    <p className="text-xs text-muted-foreground">ابدأ بالترند الأعلى ثم افتح الحزمة الجاهزة للنشر.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-border/70 bg-background/70 px-4 py-4 dark:bg-black/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400">
                    <Bolt className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">أفضل وقت للنشر</p>
                    <p className="text-xs text-muted-foreground">الترندات الصاعدة اليوم تمنحك فرصة وصول أسرع قبل الذروة.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

async function getDashboardData(): Promise<DashboardData> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return buildFallbackDashboardData();
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
      include: {
        subscription: {
          select: {
            plan: true,
            status: true,
          },
        },
      },
    });

    if (!dbUser) {
      return buildFallbackDashboardData();
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    const trendWhere = {
      status: { in: ["EARLY", "RISING", "PEAK"] as const },
      ...(dbUser.storeCategory
        ? {
            OR: [
              { category: dbUser.storeCategory },
              { signalStrength: { gte: 82 } },
            ],
          }
        : {}),
    };

    const [
      activeTrendsCount,
      unreadAlertsCount,
      newAlertsToday,
      contentReadyCount,
      averageGrowth,
      hotTrendRows,
      alertRows,
    ] = await Promise.all([
      prisma.trend.count({ where: trendWhere }),
      prisma.alert.count({
        where: {
          userId: dbUser.id,
          isRead: false,
        },
      }),
      prisma.alert.count({
        where: {
          userId: dbUser.id,
          createdAt: { gte: startOfToday },
        },
      }),
      prisma.trendContent.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.trend.aggregate({
        where: {
          updatedAt: { gte: sevenDaysAgo },
          ...(dbUser.storeCategory ? { category: dbUser.storeCategory } : {}),
        },
        _avg: {
          growthRate: true,
        },
      }),
      prisma.trend.findMany({
        where: trendWhere,
        orderBy: [
          { signalStrength: "desc" },
          { growthRate: "desc" },
        ],
        take: 5,
        include: {
          influencerMatches: {
            include: {
              influencer: true,
            },
            orderBy: { matchScore: "desc" },
            take: 1,
          },
        },
      }),
      prisma.alert.findMany({
        where: {
          userId: dbUser.id,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          trend: {
            select: {
              id: true,
              titleAr: true,
              signalStrength: true,
              growthRate: true,
            },
          },
        },
      }),
    ]);

    if (!hotTrendRows.length) {
      return buildFallbackDashboardData({
        storeName: dbUser.storeName ?? undefined,
        name: dbUser.name ?? undefined,
      });
    }

    const topInfluencer = hotTrendRows[0]?.influencerMatches?.[0]?.influencer;

    return {
      user: {
        name: dbUser.name ?? "صاحب المتجر",
        email: dbUser.email,
        avatarUrl: dbUser.avatarUrl,
        storeName: dbUser.storeName ?? "متجر TrendZone",
        planLabel: planLabel(dbUser.subscription?.plan ?? dbUser.subscriptionPlan ?? "STARTER"),
        storeCategoryLabel: categoryLabel(dbUser.storeCategory ?? "OTHER"),
      },
      stats: [
        {
          label: "الترندات النشطة الآن",
          value: formatCompactNumber(activeTrendsCount),
          note: "ترندات يمكن استثمارها اليوم",
          icon: TrendingUp,
          accent: "bg-[#534AB7]/10 text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff]",
        },
        {
          label: "تنبيهات جديدة اليوم",
          value: formatCompactNumber(newAlertsToday),
          note: `${unreadAlertsCount} غير مقروءة حتى الآن`,
          icon: Bell,
          accent: "bg-orange-500/12 text-orange-600 dark:text-orange-300",
        },
        {
          label: "محتوى جاهز للنشر",
          value: formatCompactNumber(contentReadyCount),
          note: "متاح مباشرة عبر صفحة المحتوى",
          icon: Sparkles,
          accent: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
        },
        {
          label: "نسبة نمو هذا الأسبوع",
          value: `${Math.max(0, Math.round(averageGrowth._avg.growthRate ?? 0))}%`,
          note: "أداء إجمالي في الفئة الأقرب لمتجرك",
          icon: Bolt,
          accent: "bg-green-500/12 text-green-600 dark:text-green-300",
        },
      ],
      hotTrends: hotTrendRows.map((row) => {
        const trend = hydrateTrend(row as never);
        return {
          id: trend.id,
          title: trend.titleAr,
          categoryLabel: categoryLabel(trend.category),
          signalStrength: trend.signalStrength,
          statusLabel: trendStatusLabel(trend.status),
          statusClassName: trendStatusClassName(trend.status),
          peakLabel: formatPeakLabel(trend.peakExpectedAt),
          summary: trend.summaryAr ?? trend.descriptionAr ?? "ترند واعد في السوق ويستحق المتابعة الفورية.",
        };
      }),
      alerts: alertRows.map((alert) => {
        const severity = alert.type === "TREND_SPIKE" ? "high" : alert.type === "PEAK_WARNING" ? "medium" : "normal";
        return {
          id: alert.id,
          title: alert.messageAr,
          timeLabel: formatRelativeTime(alert.createdAt),
          href: alert.trendId ? `/trends?trend=${alert.trendId}` : "/alerts",
          accentClassName: alertSeverityClassName(severity),
          Icon: alertSeverityIcon(severity),
        };
      }),
      suggestedInfluencer: topInfluencer
        ? {
            name: topInfluencer.name,
            handle: topInfluencer.handle,
            followersLabel: formatCompactNumber(topInfluencer.followersCount),
            engagementLabel: `${topInfluencer.engagementRate}%`,
            priceLabel: topInfluencer.priceRange ?? "يحدد عند التواصل",
            profileUrl: topInfluencer.profileUrl,
            reason: "متوافق مع الفئة الأقوى حاليًا، ولديه حجم جمهور وتفاعل مناسبين لبدء حملة سريعة.",
          }
        : fallbackInfluencer(),
      unreadAlerts: unreadAlertsCount,
    };
  } catch (error) {
    console.error("[DashboardPage] fallback", error);
    return buildFallbackDashboardData();
  }
}

function buildFallbackDashboardData(overrides?: { name?: string; storeName?: string }): DashboardData {
  const trends = MOCK_TRENDS
    .slice(0, 5)
    .sort((a, b) => b.score - a.score);

  return {
    user: {
      name: overrides?.name ?? "محمد أحمد",
      email: "owner@trendzone.sa",
      avatarUrl: null,
      storeName: overrides?.storeName ?? "متجر الأناقة الخليجية",
      planLabel: "باقة النمو",
      storeCategoryLabel: "موضة",
    },
    stats: [
      {
        label: "الترندات النشطة الآن",
        value: "24",
        note: "ترندات قابلة للتنفيذ فورًا",
        icon: TrendingUp,
        accent: "bg-[#534AB7]/10 text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff]",
      },
      {
        label: "تنبيهات جديدة اليوم",
        value: "7",
        note: "4 غير مقروءة",
        icon: Bell,
        accent: "bg-orange-500/12 text-orange-600 dark:text-orange-300",
      },
      {
        label: "محتوى جاهز للنشر",
        value: "18",
        note: "بوستات ورسائل وSEO",
        icon: Sparkles,
        accent: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
      },
      {
        label: "نسبة نمو هذا الأسبوع",
        value: "31%",
        note: "أعلى من الأسبوع الماضي",
        icon: Bolt,
        accent: "bg-green-500/12 text-green-600 dark:text-green-300",
      },
    ],
    hotTrends: trends.map((trend, index) => ({
      id: trend.id,
      title: trend.nameAr,
      categoryLabel: categoryLabel(mapLegacyCategory(trend.category)),
      signalStrength: trend.score,
      statusLabel: index === 0 ? "ساخن" : index < 3 ? "صاعد" : "جديد",
      statusClassName: index === 0
        ? "bg-[#534AB7] text-white"
        : index < 3
          ? "bg-green-500/15 text-green-700 dark:text-green-300"
          : "bg-orange-500/15 text-orange-700 dark:text-orange-300",
      peakLabel: `ذروة متوقعة خلال ${index + 1} ${index === 0 ? "يوم" : "أيام"}`,
      summary: trend.descriptionAr ?? "ترند قوي مرتبط بذوق السوق الخليجي ويستحق التفعيل السريع.",
    })),
    alerts: [
      {
        id: "a1",
        title: "قفزة مفاجئة في البحث عن عباءة الفراشة",
        timeLabel: "قبل 8 دقائق",
        href: "/trends?trend=1",
        accentClassName: "bg-[#534AB7]/12 text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff]",
        Icon: Flame,
      },
      {
        id: "a2",
        title: "محتوى TikTok جاهز للنشر للترند الأعلى",
        timeLabel: "قبل 27 دقيقة",
        href: "/content?trend=1",
        accentClassName: "bg-green-500/12 text-green-600 dark:text-green-300",
        Icon: Bolt,
      },
      {
        id: "a3",
        title: "ارتفاع اهتمام جديد في فئة العناية",
        timeLabel: "قبل ساعة",
        href: "/trends?trend=4",
        accentClassName: "bg-orange-500/12 text-orange-600 dark:text-orange-300",
        Icon: TriangleAlert,
      },
      {
        id: "a4",
        title: "ترند إلكترونيات دخل منطقة الذروة",
        timeLabel: "قبل ساعتين",
        href: "/trends?trend=2",
        accentClassName: "bg-[#534AB7]/12 text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff]",
        Icon: TrendingUp,
      },
      {
        id: "a5",
        title: "اقتراح مؤثر جديد لحملة هذا الأسبوع",
        timeLabel: "قبل 3 ساعات",
        href: "/content",
        accentClassName: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
        Icon: MessageCircleMore,
      },
    ],
    suggestedInfluencer: fallbackInfluencer(),
    unreadAlerts: 4,
  };
}

function fallbackInfluencer() {
  return {
    name: "سارة المودة",
    handle: "@sara_almoda",
    followersLabel: "420K",
    engagementLabel: "6.8%",
    priceLabel: "2,000 - 5,000 ر.س",
    profileUrl: "/content",
    reason: "يناسب الترند الأعلى حاليًا، وجمهوره قريب من شريحة الشراء السريعة في السوق الخليجي.",
  };
}

function categoryLabel(value: string) {
  const labels: Record<string, string> = {
    FASHION: "موضة",
    BEAUTY: "عناية",
    ELECTRONICS: "إلكترونيات",
    HOME: "منزل",
    HOME_DECOR: "منزل",
    FOOD: "طعام",
    FITNESS: "لياقة",
    KIDS: "أطفال",
    TRAVEL: "سفر",
    GAMING: "ألعاب",
    OTHER: "متنوع",
  };

  return labels[value] ?? "متنوع";
}

function planLabel(value: string) {
  const labels: Record<string, string> = {
    STARTER: "باقة البداية",
    GROWTH: "باقة النمو",
    ENTERPRISE: "باقة الأعمال",
    FREE: "الخطة المجانية",
    PRO: "الباقة الاحترافية",
  };

  return labels[value] ?? "باقة النمو";
}

function trendStatusLabel(status: string) {
  if (status === "PEAK") return "ساخن";
  if (status === "RISING") return "صاعد";
  return "جديد";
}

function trendStatusClassName(status: string) {
  if (status === "PEAK") return "bg-[#534AB7] text-white";
  if (status === "RISING") return "bg-green-500/15 text-green-700 dark:text-green-300";
  return "bg-orange-500/15 text-orange-700 dark:text-orange-300";
}

function mapLegacyCategory(value: string) {
  return value === "HOME_DECOR" ? "HOME" : value;
}

function formatCompactNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }
  return `${value}`;
}

function formatPeakLabel(date: Date | null) {
  if (!date) return "الذروة خلال أيام قليلة";

  const now = Date.now();
  const diffDays = Math.max(0, Math.round((date.getTime() - now) / (24 * 60 * 60 * 1000)));
  if (diffDays <= 0) return "الذروة اليوم";
  if (diffDays === 1) return "الذروة غدًا";
  return `الذروة خلال ${diffDays} أيام`;
}

function formatRelativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / (60 * 1000)));
  if (diffMinutes < 60) return `قبل ${diffMinutes} دقيقة`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `قبل ${diffHours} ساعة`;
  const diffDays = Math.round(diffHours / 24);
  return `قبل ${diffDays} يوم`;
}

function alertSeverityClassName(severity: "high" | "medium" | "normal") {
  if (severity === "high") return "bg-[#534AB7]/12 text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff]";
  if (severity === "medium") return "bg-orange-500/12 text-orange-600 dark:text-orange-300";
  return "bg-sky-500/12 text-sky-600 dark:text-sky-300";
}

function alertSeverityIcon(severity: "high" | "medium" | "normal") {
  if (severity === "high") return Flame;
  if (severity === "medium") return TriangleAlert;
  return Bell;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
