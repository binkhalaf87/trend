import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateArabicContent } from "@/lib/openai/client";
import { hydrateTrend } from "@/lib/utils/prisma-helpers";
import { z } from "zod";

const GenerateSchema = z.object({
  trendId: z.string().optional(),
  platform: z.enum(["INSTAGRAM", "TIKTOK", "SNAPCHAT", "TWITTER", "YOUTUBE", "SEO", "EMAIL", "WHATSAPP"]).optional(),
  contentType: z.enum(["POST", "CAPTION", "VIDEO_IDEA", "HASHTAGS", "SEO_KEYWORDS", "AD_COPY", "PRODUCT_DESC", "EMAIL_BODY"]).default("POST"),
  tone: z.string().optional(),
  customPrompt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = GenerateSchema.parse(await req.json());

    let trend = null;
    if (body.trendId) {
      const raw = await prisma.trend.findUnique({ where: { id: body.trendId } });
      if (!raw) return NextResponse.json({ error: "Trend not found" }, { status: 404 });
      trend = hydrateTrend(raw);
    }

    const generated = await generateArabicContent({
      type: body.contentType,
      trend: trend ?? undefined,
      platform: body.platform,
      tone: body.tone,
      customPrompt: body.customPrompt,
    });

    const content = await prisma.trendContent.create({
      data: {
        trendId: body.trendId ?? (await getDefaultTrendId()),
        platform: body.platform ?? "INSTAGRAM",
        contentType: body.contentType,
        generatedBy: "OPENAI",
        titleAr: generated.title ?? null,
        contentAr: generated.body,
        hashtags: JSON.stringify(generated.hashtags),
      },
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[POST /api/content]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = new URL(req.url).searchParams;
    const limit = Math.min(Number(params.get("limit") ?? "20"), 100);
    const offset = Number(params.get("offset") ?? "0");
    const platform = params.get("platform") ?? undefined;

    const where = {
      ...(platform && { platform: platform as any }),
    };

    const [items, total] = await Promise.all([
      prisma.trendContent.findMany({
        where,
        include: { trend: { select: { titleAr: true, category: true, status: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.trendContent.count({ where }),
    ]);

    return NextResponse.json({ items, total, offset, limit });
  } catch (error) {
    console.error("[GET /api/content]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getDefaultTrendId(): Promise<string> {
  const trend = await prisma.trend.findFirst({ orderBy: { signalStrength: "desc" } });
  if (!trend) throw new Error("No trends in database");
  return trend.id;
}
