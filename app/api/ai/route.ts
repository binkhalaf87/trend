import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  classifyTrend,
  forecastTrend,
  generateContent,
  mapDbTrendToAiTrend,
  mapUserStoreToAiStore,
  matchInfluencers,
  personalizeForStore,
  saveInfluencerMatches,
} from "@/lib/ai";
import type { RawTrend, Store, Trend } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hydrateTrend } from "@/lib/utils/prisma-helpers";

const BodySchema = z.object({
  action: z.enum([
    "classify",
    "forecast",
    "generate-content",
    "personalize",
    "match-influencers",
  ]),
  trendId: z.string().optional(),
  budget: z.number().optional(),
  trend: z.record(z.any()).optional(),
  trends: z.array(z.record(z.any())).optional(),
  history: z.array(
    z.object({
      recordedAt: z.union([z.string(), z.date()]),
      signalStrength: z.number(),
      searchVolume: z.number().optional(),
      socialMentions: z.number().optional(),
      growthRate: z.number().optional(),
    })
  ).optional(),
  store: z.record(z.any()).optional(),
  persist: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = BodySchema.parse(await req.json());

    switch (body.action) {
      case "classify": {
        const trend = await loadRawTrend(body.trendId, body.trend as RawTrend | undefined);
        const result = await classifyTrend(trend);
        return NextResponse.json(result);
      }

      case "forecast": {
        const history = body.history?.length
          ? body.history
          : body.trendId
            ? await loadTrendHistory(body.trendId)
            : [];
        const result = await forecastTrend(history);
        return NextResponse.json(result);
      }

      case "generate-content": {
        const trend = await loadAiTrend(body.trendId, body.trend as Trend | undefined);
        const store = body.store ? (body.store as Store) : mapUserStoreToAiStore(dbUser);
        const items = await generateContent(trend, store);

        if (body.persist && body.trendId) {
          const saved = await Promise.all(
            items.map((item) =>
              prisma.trendContent.create({
                data: {
                  trendId: body.trendId!,
                  platform: item.platform,
                  contentType: item.contentType,
                  generatedBy: item.generatedBy,
                  titleAr: item.titleAr ?? null,
                  contentAr: item.contentType === "SEO_KEYWORDS"
                    ? [item.bodyAr, ...item.seoKeywords].filter(Boolean).join("\n")
                    : item.bodyAr,
                  hashtags: item.hashtags,
                  ctaAr: item.ctaAr ?? null,
                },
              })
            )
          );

          return NextResponse.json({ items, saved });
        }

        return NextResponse.json({ items });
      }

      case "personalize": {
        const trends = body.trends?.length
          ? (body.trends as Trend[])
          : body.trendId
            ? [await loadAiTrend(body.trendId, undefined)]
            : [];
        const store = body.store ? (body.store as Store) : mapUserStoreToAiStore(dbUser);
        const ranked = await personalizeForStore(trends, store);
        return NextResponse.json({ ranked });
      }

      case "match-influencers": {
        const trend = await loadAiTrend(body.trendId, body.trend as Trend | undefined);
        const matches = await matchInfluencers(trend, body.budget ?? 0);

        if (body.persist && body.trendId) {
          await saveInfluencerMatches(body.trendId, matches);
        }

        return NextResponse.json({ matches });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("[POST /api/ai]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function loadRawTrend(trendId?: string, trend?: RawTrend): Promise<RawTrend> {
  if (trendId) {
    const dbTrend = await prisma.trend.findUnique({ where: { id: trendId } });
    if (!dbTrend) throw new Error("Trend not found");
    const hydrated = hydrateTrend(dbTrend);
    return {
      id: hydrated.id,
      titleEn: hydrated.titleEn,
      titleAr: hydrated.titleAr,
      descriptionAr: hydrated.descriptionAr,
      summaryAr: hydrated.summaryAr,
      keywords: hydrated.keywords,
      source: hydrated.source,
      region: hydrated.geographicFocus,
      searchVolume: hydrated.searchVolume7d,
      growthRate: hydrated.growthRate,
      socialMentions: hydrated.socialMentions7d,
      signalStrength: hydrated.signalStrength,
      sourceUrls: hydrated.sourceUrls,
      relatedProducts: hydrated.relatedProducts,
    };
  }

  if (!trend) throw new Error("trend or trendId is required");
  return trend;
}

async function loadAiTrend(trendId?: string, trend?: Trend): Promise<Trend> {
  if (trendId) {
    const dbTrend = await prisma.trend.findUnique({ where: { id: trendId } });
    if (!dbTrend) throw new Error("Trend not found");
    return mapDbTrendToAiTrend(hydrateTrend(dbTrend));
  }

  if (!trend) throw new Error("trend or trendId is required");
  return trend;
}

async function loadTrendHistory(trendId: string) {
  const history = await prisma.trendHistory.findMany({
    where: { trendId },
    orderBy: { recordedAt: "asc" },
    select: {
      recordedAt: true,
      signalStrength: true,
      searchVolume: true,
      socialMentions: true,
      growthRate: true,
    },
  });

  return history;
}
