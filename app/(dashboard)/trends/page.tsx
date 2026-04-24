import { Metadata } from "next";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hydrateTrend } from "@/lib/utils/prisma-helpers";
import {
  TREND_CATEGORY_FILTERS,
  categoryLabel,
  normalizeTrendSort,
} from "@/lib/trends/helpers";
import { TrendGridCard } from "@/components/trends/trend-grid-card";
import { TrendEmptyState } from "@/components/trends/trend-empty-state";
import { TrendsToolbar } from "@/components/trends/trends-toolbar";
import { Badge } from "@/components/ui/badge";
import type { TrendSource } from "@/types/db";

export const metadata: Metadata = {
  title: "الترندات",
};

type TrendsPageProps = {
  searchParams?: {
    category?: string;
    sort?: string;
    q?: string;
  };
};

export default async function TrendsPage({ searchParams }: TrendsPageProps) {
  const category = normalizeCategory(searchParams?.category);
  const sort = normalizeTrendSort(searchParams?.sort);
  const query = searchParams?.q?.trim() ?? "";
  const data = await getTrendsPageData({ category, sort, query });

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/45 bg-gradient-to-br from-white via-[#f7f6ff] to-[#efedff] px-5 py-6 shadow-[0_20px_55px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-gradient-to-br dark:from-[#151226] dark:via-[#18142a] dark:to-[#211a39] md:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#534AB7]/10 px-3 py-1 text-xs font-semibold text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff]">
              <Sparkles className="h-3.5 w-3.5" />
              مراقبة الترندات لمتجرك
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">الترندات الساخنة</h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                فلتر، رتّب، وابحث عن الفرص الأقرب لمنتجاتك. كل بطاقة هنا تعطيك
                صورة سريعة عن القوة، السرعة، والوقت الأنسب للدخول.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/50 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                الترندات الظاهرة
              </div>
              <p className="mt-2 text-2xl font-extrabold">{data.trends.length}</p>
            </div>
            <div className="rounded-[24px] border border-white/50 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Flame className="h-3.5 w-3.5" />
                أعلى فئة
              </div>
              <p className="mt-2 text-base font-extrabold">{data.topCategoryLabel}</p>
            </div>
            <div className="rounded-[24px] border border-white/50 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                الفلتر الحالي
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge className="border-none bg-[#534AB7]/10 text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff]">
                  {category === "ALL" ? "كل الفئات" : categoryLabel(category)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrendsToolbar category={category} sort={sort} query={query} />

      {data.trends.length === 0 ? (
        <TrendEmptyState />
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
          {data.trends.map((trend) => (
            <TrendGridCard
              key={trend.id}
              trend={{
                id: trend.id,
                titleAr: trend.titleAr,
                titleEn: trend.titleEn,
                summaryAr: trend.summaryAr,
                category: trend.category,
                status: trend.status,
                signalStrength: trend.signalStrength,
                growthRate: trend.growthRate,
                peakExpectedAt: trend.peakExpectedAt,
                sources: [trend.source, ...trend.extraSources]
                  .filter((source): source is TrendSource => source !== null)
                  .slice(0, 3),
                redditVotes: trend.redditVotes ?? 0,
              }}
            />
          ))}
        </section>
      )}
    </div>
  );
}

async function getTrendsPageData({
  category,
  sort,
  query,
}: {
  category: string;
  sort: string;
  query: string;
}) {
  const supabase = createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const dbUser = authUser
    ? await prisma.user.findUnique({
        where: { supabaseId: authUser.id },
        select: { id: true, storeCategory: true },
      })
    : null;

  const clauses: Array<Record<string, unknown>> = [];

  if (category !== "ALL") {
    clauses.push({ category: category as any });
  }

  if (query) {
    clauses.push({
      OR: [
        { titleAr: { contains: query, mode: "insensitive" as const } },
        { titleEn: { contains: query, mode: "insensitive" as const } },
        { summaryAr: { contains: query, mode: "insensitive" as const } },
      ],
    });
  }

  if (category === "ALL" && dbUser?.storeCategory) {
    clauses.push({
      OR: [
        { category: dbUser.storeCategory },
        { signalStrength: { gte: 78 } },
      ],
    });
  }

  const where = clauses.length > 0 ? { AND: clauses } : {};

  const rows = await prisma.trend.findMany({
    where,
    orderBy:
      sort === "newest"
        ? [{ detectedAt: "desc" }]
        : sort === "peak"
          ? [{ peakExpectedAt: "asc" }, { signalStrength: "desc" }]
          : [{ signalStrength: "desc" }, { growthRate: "desc" }],
    take: 24,
  });

  const trends = rows.map((row) => {
    const trend = hydrateTrend(row);
    return {
      ...trend,
      extraSources: inferExtraSources(trend.sourceUrls),
    };
  });

  const topCategory = trends[0]?.category ?? dbUser?.storeCategory ?? "OTHER";

  return {
    trends,
    topCategoryLabel: categoryLabel(topCategory),
  };
}

function normalizeCategory(value?: string) {
  if (!value) return "ALL";
  const allowed = new Set(TREND_CATEGORY_FILTERS.map((item) => item.value));
  return allowed.has(value as never) ? value : "ALL";
}

function inferExtraSources(urls: string[]): TrendSource[] {
  const sources: TrendSource[] = [];

  for (const url of urls) {
    const normalized = url.toLowerCase();
    let source: TrendSource | null = null;

    if (normalized.includes("google")) source = "GOOGLE_TRENDS";
    else if (normalized.includes("reddit")) source = "REDDIT";
    else if (normalized.includes("tiktok")) source = "TIKTOK";
    else if (normalized.includes("instagram")) source = "INSTAGRAM";
    else if (normalized.includes("amazon")) source = "AMAZON";
    else if (normalized.includes("pinterest")) source = "PINTEREST";
    else if (normalized.includes("twitter") || normalized.includes("x.com")) source = "TWITTER";

    if (source) {
      sources.push(source);
    }
  }

  return Array.from(new Set(sources));
}
