import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hydrateTrend } from "@/lib/utils/prisma-helpers";

// endpoint عام — يُستخدم من Devvit/Reddit بدون تسجيل دخول
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 20);

    const trends = await prisma.trend.findMany({
      where: {
        status: { in: ["EARLY", "RISING", "PEAK"] },
        ...(category ? { category: category as any } : {}),
      },
      orderBy: { signalStrength: "desc" },
      take: limit,
      select: {
        id: true,
        titleAr: true,
        category: true,
        status: true,
        signalStrength: true,
        growthRate: true,
        summaryAr: true,
        redditVotes: true,
        keywords: true,
        relatedProducts: true,
        sourceUrls: true,
      },
    });

    return NextResponse.json(
      { trends: trends.map(hydrateTrend) },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=60",
        },
      }
    );
  } catch {
    return NextResponse.json({ trends: [] });
  }
}
