import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  Flame,
  FolderPlus,
  LayoutTemplate,
  LineChart,
  RadioTower,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildContentPreview,
  buildSourceLinks,
  buildTrendHistory,
  categoryLabel,
  competitorActivityClassName,
  competitorActivityLabel,
  findTopInfluencer,
  formatFollowers,
  formatGrowthRate,
  formatPeakLabel,
  inferCompetitorStores,
  sourceLabel,
  statusBadgeClassName,
  statusLabel,
} from "@/lib/trends/helpers";
import {
  hydrateInfluencer,
  hydrateTrend,
  hydrateTrendContent,
} from "@/lib/utils/prisma-helpers";
import { TrendChart } from "@/components/trends/trend-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type TrendDetailPageProps = {
  params: { id: string };
};

export default async function TrendDetailPage({ params }: TrendDetailPageProps) {
  const trend = await getTrendDetail(params.id);

  if (!trend) {
    notFound();
  }

  const defaultRelevanceScore = trend.userTrendState?.relevanceScore ?? trend.signalStrength;

  const topInfluencer = findTopInfluencer(trend.influencerMatches);

  async function addToStoreAction() {
    "use server";

    const supabase = createSupabaseServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
      select: { id: true },
    });
    if (!dbUser) return;

    await prisma.userTrend.upsert({
      where: {
        userId_trendId: {
          userId: dbUser.id,
          trendId: params.id,
        },
      },
      update: {
        isSaved: true,
        isActedUpon: true,
        updatedAt: new Date(),
      },
        create: {
          userId: dbUser.id,
          trendId: params.id,
          isSaved: true,
          isActedUpon: true,
          relevanceScore: defaultRelevanceScore,
        },
      });

    revalidatePath("/trends");
    revalidatePath(`/trends/${params.id}`);
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/45 bg-gradient-to-br from-[#1c1734] via-[#241d45] to-[#534AB7] px-6 py-7 text-white shadow-[0_24px_60px_rgba(83,74,183,0.30)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`border-none ${statusBadgeClassName(trend.status)}`}>
                {statusLabel(trend.status)}
              </Badge>
              <Badge className="border-none bg-white/12 text-white">
                {categoryLabel(trend.category)}
              </Badge>
              <Badge className="border-none bg-white/12 text-white">
                {trend.geographicFocus}
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                {trend.titleAr}
              </h1>
              <p className="text-sm text-white/75">{trend.titleEn}</p>
            </div>

            <p className="max-w-3xl text-sm leading-8 text-white/80">
              {trend.descriptionAr ?? trend.summaryAr ?? "ترند متصاعد بإشارات واضحة في السوق الخليجي ويستحق متابعة قريبة."}
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] bg-white/10 px-4 py-4">
                <p className="text-xs text-white/60">قوة الإشارة</p>
                <p className="mt-2 text-2xl font-extrabold">{trend.signalStrength}%</p>
              </div>
              <div className="rounded-[24px] bg-white/10 px-4 py-4">
                <p className="text-xs text-white/60">نسبة النمو</p>
                <p className="mt-2 text-2xl font-extrabold text-green-300">{formatGrowthRate(trend.growthRate)}</p>
              </div>
              <div className="rounded-[24px] bg-white/10 px-4 py-4">
                <p className="text-xs text-white/60">الذروة المتوقعة</p>
                <p className="mt-2 text-base font-extrabold">{formatPeakLabel(trend.peakExpectedAt)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 xl:min-w-[300px]">
            <form action={addToStoreAction}>
              <Button className="w-full rounded-full bg-white text-[#534AB7] hover:bg-white/90">
                <FolderPlus className="h-4 w-4" />
                {trend.isSavedForUser ? "مضاف إلى متجري" : "أضف لمتجري"}
              </Button>
            </form>
            <Button asChild variant="outline" className="w-full rounded-full border-white/20 bg-white/8 text-white hover:bg-white/12 hover:text-white">
              <Link href={`/content?trend=${trend.id}`}>
                ابدأ الخطة
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            {topInfluencer ? (
              <div className="rounded-[28px] border border-white/15 bg-white/8 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">أفضل مؤثر لهذا الترند</p>
                    <p className="text-base font-extrabold">{topInfluencer.influencer.name}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  {topInfluencer.reasonAr ?? "مطابقة مرتفعة مع جمهور الترند وحجم التفاعل المتوقع."}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
        <div className="space-y-6">
          <Card className="rounded-[32px] border-white/50 bg-white/85 shadow-[0_20px_45px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/5">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
              <div>
                <CardTitle className="text-xl font-extrabold">رسم نمو الترند</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  قراءة 14 يوم ماضية مع توقعات المسار للـ 14 يوم القادمة.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#534AB7]/8 px-3 py-2 text-xs font-semibold text-[#534AB7] dark:bg-[#534AB7]/15 dark:text-[#c9c4ff]">
                <LineChart className="h-3.5 w-3.5" />
                Forecast 14d
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <TrendChart data={trend.history} />

              <div className="grid gap-3 sm:grid-cols-3">
                <MetricPill label="أعلى إشارة متوقعة" value={`${trend.forecastSummary.maxSignal}%`} icon={TrendingUp} />
                <MetricPill label="نافذة الذروة" value={trend.forecastSummary.peakWindow} icon={CalendarClock} />
                <MetricPill label="حجم البحث المتوقع" value={trend.forecastSummary.searchExpectation} icon={RadioTower} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/50 bg-white/85 shadow-[0_20px_45px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-extrabold">مصادر الإشارة وروابطها</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {trend.signalSources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[26px] border border-border/70 bg-background/70 p-4 transition-all hover:border-[#534AB7]/25 hover:bg-[#534AB7]/[0.03] dark:bg-black/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold">{sourceLabel(source.source)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{source.host}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/50 bg-white/85 shadow-[0_20px_45px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-extrabold">المحتوى الجاهز لهذا الترند</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trend.contentPreview.length > 0 ? (
                trend.contentPreview.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[26px] border border-border/70 bg-background/70 p-4 dark:bg-black/10"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-none bg-[#534AB7]/10 text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff]">
                        {item.platform}
                      </Badge>
                      <Badge variant="secondary" className="border-none">
                        {item.contentType}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm font-bold">{item.titleAr ?? "محتوى جاهز للنشر"}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.preview}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-[#534AB7]/20 bg-background/60 p-6 text-center dark:bg-black/10">
                  <p className="text-lg font-extrabold">لا يوجد محتوى محفوظ لهذا الترند بعد</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    افتح الخطة الآن وسيتم إنشاء محتوى عربي مناسب لهذا الترند ولمتجرك.
                  </p>
                  <Button asChild className="mt-4 rounded-full bg-[#534AB7] text-white hover:bg-[#4d44ad]">
                    <Link href={`/content?trend=${trend.id}`}>توليد المحتوى</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[32px] border-white/50 bg-white/85 shadow-[0_20px_45px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-extrabold">المتاجر المنافسة التي تركب الترند</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trend.competitors.map((competitor) => (
                <div key={competitor.name} className="rounded-[26px] border border-border/70 bg-background/70 p-4 dark:bg-black/10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold">{competitor.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{competitor.focus}</p>
                    </div>
                    <Badge className={`border-none ${competitorActivityClassName(competitor.activityLevel)}`}>
                      {competitorActivityLabel(competitor.activityLevel)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{competitor.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/50 bg-white/85 shadow-[0_20px_45px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-extrabold">مؤثرون مقترحون</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trend.influencerMatches.length > 0 ? (
                trend.influencerMatches.map((match) => (
                  <div key={match.id} className="rounded-[26px] border border-border/70 bg-background/70 p-4 dark:bg-black/10">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold">{match.influencer.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{match.influencer.handle}</p>
                      </div>
                      <Badge className="border-none bg-[#534AB7]/10 text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff]">
                        {match.matchScore}%
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <MiniMetric label="المتابعون" value={formatFollowers(match.influencer.followersCount)} />
                      <MiniMetric label="التفاعل" value={`${match.influencer.engagementRate}%`} />
                      <MiniMetric label="السعر" value={match.influencer.priceRange ?? "مرن"} />
                    </div>

                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      {match.reasonAr ?? "مطابقة جيدة مع نوع الترند والجمهور المتوقع."}
                    </p>

                    {match.influencer.profileUrl ? (
                      <Button asChild variant="outline" className="mt-4 w-full rounded-full border-[#534AB7]/20 hover:bg-[#534AB7]/6">
                        <a href={match.influencer.profileUrl} target="_blank" rel="noreferrer">
                          تواصل معه
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-[#534AB7]/20 bg-background/60 p-6 text-center dark:bg-black/10">
                  <p className="text-lg font-extrabold">لا يوجد مؤثرون مقترحون بعد</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    شغّل محرك المطابقة لهذا الترند وسيتم اقتراح أفضل الحسابات الملائمة.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none bg-gradient-to-br from-[#f3f1ff] to-[#ebe8ff] shadow-[0_20px_45px_rgba(83,74,183,0.08)] dark:from-[#151226] dark:to-[#211a39]">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#534AB7] text-white">
                  <Store className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-extrabold">قرار سريع</p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    هذا الترند في مرحلة {statusLabel(trend.status)} ونسبة نموه الحالية {formatGrowthRate(trend.growthRate)}.
                    إذا كان متجرك قريبًا من فئة {categoryLabel(trend.category)} فنافذة الدخول مناسبة الآن.
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild className="rounded-full bg-[#534AB7] text-white hover:bg-[#4d44ad]">
                  <Link href={`/content?trend=${trend.id}`}>
                    <LayoutTemplate className="h-4 w-4" />
                    افتح المحتوى
                  </Link>
                </Button>
                <form action={addToStoreAction}>
                  <Button type="submit" variant="outline" className="w-full rounded-full border-[#534AB7]/20 hover:bg-[#534AB7]/6">
                    <ShoppingBag className="h-4 w-4" />
                    أضف لمتجري
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

async function getTrendDetail(id: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const dbUser = authUser
    ? await prisma.user.findUnique({
        where: { supabaseId: authUser.id },
        select: { id: true },
      })
    : null;

  const trend = await prisma.trend.findUnique({
    where: { id },
    include: {
      content: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      influencerMatches: {
        include: { influencer: true },
        orderBy: { matchScore: "desc" },
        take: 3,
      },
      userTrends: {
        ...(dbUser ? { where: { userId: dbUser.id } } : {}),
        take: 1,
      },
    },
  });

  if (!trend) return null;

  const hydratedTrend = hydrateTrend(trend);
  const history = buildTrendHistory(hydratedTrend);
  const content = trend.content.map((item) => hydrateTrendContent(item));
  const influencerMatches = trend.influencerMatches.map((match) => ({
    ...match,
    influencer: hydrateInfluencer(match.influencer),
  }));

  const forecast = history.filter((point) => point.forecast);
  const maxSignal = Math.max(...forecast.map((point) => point.signalStrength));

  return {
    ...hydratedTrend,
    content,
    contentPreview: buildContentPreview(content),
    influencerMatches,
    signalSources: buildSourceLinks(hydratedTrend),
    competitors: inferCompetitorStores(hydratedTrend),
    history,
    forecastSummary: {
      maxSignal,
      peakWindow: forecast[0] ? `${forecast[0].label} - ${forecast[Math.min(4, forecast.length - 1)]?.label ?? forecast[0].label}` : "قريبًا",
      searchExpectation: `${Math.round((forecast.reduce((sum, point) => sum + point.searchVolume, 0) / Math.max(1, forecast.length)) / 1000)}K`,
    },
    isSavedForUser: trend.userTrends?.[0]?.isSaved ?? false,
    userTrendState: trend.userTrends?.[0] ?? null,
  };
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-[#534AB7]/6 px-3 py-3 dark:bg-white/5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-extrabold">{value}</p>
    </div>
  );
}

function MetricPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
}) {
  return (
    <div className="rounded-[24px] border border-border/70 bg-background/70 px-4 py-4 dark:bg-black/10">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-lg font-extrabold">{value}</p>
    </div>
  );
}
