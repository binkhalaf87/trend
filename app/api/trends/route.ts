import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { buildTrendWhere, hydrateTrend } from "@/lib/utils/prisma-helpers";
import { normalizeTrendSort } from "@/lib/trends/helpers";

const QuerySchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
  sort: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = QuerySchema.parse(Object.fromEntries(searchParams));
    const normalizedSort = normalizeTrendSort(query.sort);

    const where = {
      ...buildTrendWhere({
        category: query.category && query.category !== "ALL" ? query.category : undefined,
        status: query.status,
      }),
      ...(query.q
        ? {
            OR: [
              { titleAr: { contains: query.q, mode: "insensitive" as const } },
              { titleEn: { contains: query.q, mode: "insensitive" as const } },
              { summaryAr: { contains: query.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [trends, total] = await Promise.all([
      prisma.trend.findMany({
        where,
        orderBy:
          normalizedSort === "newest"
            ? { detectedAt: "desc" }
            : normalizedSort === "peak"
              ? { peakExpectedAt: "asc" }
              : { signalStrength: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.trend.count({ where }),
    ]);

    return NextResponse.json({
      trends: trends.map((trend) => hydrateTrend(trend)),
      total,
      offset: query.offset,
      limit: query.limit,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[GET /api/trends]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
