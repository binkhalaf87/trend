import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildContentPreview, buildSourceLinks, buildTrendHistory, inferCompetitorStores } from "@/lib/trends/helpers";
import { hydrateInfluencer, hydrateTrend, hydrateTrendContent } from "@/lib/utils/prisma-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const trend = await prisma.trend.findUnique({
      where: { id: params.id },
      include: {
        userTrends: {
          select: {
            id: true,
            isSaved: true,
            isActedUpon: true,
            relevanceScore: true,
          },
        },
        content: { take: 5, orderBy: { createdAt: "desc" } },
        influencerMatches: {
          include: { influencer: true },
          orderBy: { matchScore: "desc" },
          take: 3,
        },
      },
    });

    if (!trend) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const hydratedTrend = hydrateTrend(trend as never);
    const content = trend.content.map((item) => hydrateTrendContent(item as never));
    const influencerMatches = trend.influencerMatches.map((match) => ({
      ...match,
      influencer: hydrateInfluencer(match.influencer as never),
    }));
    const history = buildTrendHistory(hydratedTrend);

    return NextResponse.json({
      ...hydratedTrend,
      content,
      contentPreview: buildContentPreview(content),
      influencerMatches,
      signalSources: buildSourceLinks(hydratedTrend),
      competitors: inferCompetitorStores(hydratedTrend),
      history,
      forecast14d: history.filter((point) => point.forecast),
      isSavedForUser: trend.userTrends.some((item) => item.isSaved),
      userTrendState: trend.userTrends[0] ?? null,
    });
  } catch (error) {
    console.error("[GET /api/trends/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
