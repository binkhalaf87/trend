import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
        content: { take: 5, orderBy: { createdAt: "desc" } },
        influencerMatches: {
          include: { influencer: true },
          orderBy: { matchScore: "desc" },
          take: 3,
        },
      },
    });

    if (!trend) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(trend);
  } catch (error) {
    console.error("[GET /api/trends/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
