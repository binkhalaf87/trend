import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateArabicContent } from "@/lib/openai/client";
import { z } from "zod";

const GenerateSchema = z.object({
  trendId: z.string().optional(),
  type: z.enum(["SOCIAL_POST", "PRODUCT_DESCRIPTION", "AD_COPY", "EMAIL", "BLOG_EXCERPT"]),
  platform: z.string().optional(),
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
      trend = await prisma.trend.findUnique({ where: { id: body.trendId } });
      if (!trend) return NextResponse.json({ error: "Trend not found" }, { status: 404 });
    }

    const generated = await generateArabicContent({
      type: body.type,
      trend: trend ?? undefined,
      platform: body.platform,
      tone: body.tone,
      customPrompt: body.customPrompt,
    });

    const content = await prisma.generatedContent.create({
      data: {
        userId: dbUser.id,
        trendId: body.trendId ?? null,
        type: body.type,
        titleAr: generated.title,
        bodyAr: generated.body,
        hashtags: generated.hashtags,
        platform: body.platform,
        tone: body.tone,
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

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const limit = Number(new URL(req.url).searchParams.get("limit") ?? "20");
    const offset = Number(new URL(req.url).searchParams.get("offset") ?? "0");

    const [items, total] = await Promise.all([
      prisma.generatedContent.findMany({
        where: { userId: dbUser.id },
        include: { trend: { select: { nameAr: true, category: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.generatedContent.count({ where: { userId: dbUser.id } }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error("[GET /api/content]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
