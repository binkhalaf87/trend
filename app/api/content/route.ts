import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateArabicContent } from "@/lib/openai/client";
import { hydrateTrend } from "@/lib/utils/prisma-helpers";
import { generateContent, mapDbTrendToAiTrend, mapUserStoreToAiStore } from "@/lib/ai";
import { z } from "zod";

const GenerateSchema = z.object({
  trendId: z.string().optional(),
  bundle: z.boolean().optional(),
  type: z.string().optional(),
  platform: z.string().optional(),
  contentType: z.enum(["POST", "CAPTION", "VIDEO_IDEA", "HASHTAGS", "SEO_KEYWORDS", "AD_COPY", "PRODUCT_DESC", "EMAIL_BODY"]).optional(),
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
    const normalizedPlatform = normalizePlatformName(body.platform);

    let trend = null;
    if (body.trendId) {
      const raw = await prisma.trend.findUnique({ where: { id: body.trendId } });
      if (!raw) return NextResponse.json({ error: "Trend not found" }, { status: 404 });
      trend = hydrateTrend(raw);
    }

    const targetTrendId = body.trendId ?? (await getDefaultTrendId());
    const targetTrend = trend ?? hydrateTrend(await prisma.trend.findUniqueOrThrow({ where: { id: targetTrendId } }));
    const store = mapUserStoreToAiStore(dbUser);
    const wantsBundle = body.bundle || (!body.contentType && !body.type);

    if (wantsBundle) {
      const generatedBundle = await generateContent(
        {
          ...mapDbTrendToAiTrend(targetTrend as any),
          descriptionAr: [targetTrend.descriptionAr, body.customPrompt].filter(Boolean).join("\n\n") || targetTrend.descriptionAr,
        },
        { ...store, tone: body.tone ?? store.tone }
      );

      const savedItems = await Promise.all(
        generatedBundle.map((item) =>
          prisma.trendContent.create({
            data: {
              trendId: targetTrendId,
              platform: item.platform,
              contentType: item.contentType,
              generatedBy: item.generatedBy,
              titleAr: item.titleAr ?? null,
              contentAr: item.contentType === "SEO_KEYWORDS"
                ? [item.bodyAr, ...item.seoKeywords].filter(Boolean).join("\n")
                : item.bodyAr,
              hashtags: item.hashtags,
              ctaAr: item.ctaAr ?? null,
              promptUsed: body.customPrompt ?? null,
            },
          })
        )
      );

      return NextResponse.json({ items: savedItems }, { status: 201 });
    }

    const requestedType = body.contentType ?? normalizeLegacyContentType(body.type);
    const generated = await generateArabicContent({
      type: requestedType,
      trend: targetTrend as any,
      platform: normalizedPlatform,
      tone: body.tone,
      customPrompt: body.customPrompt,
      store,
    });

    const content = await prisma.trendContent.create({
      data: {
        trendId: targetTrendId,
        platform: normalizePlatform(normalizedPlatform, requestedType),
        contentType: requestedType,
        generatedBy: generated.generatedBy ?? "OPENAI",
        titleAr: generated.title ?? null,
        contentAr: generated.body,
        hashtags: generated.hashtags,
        ctaAr: generated.ctaAr ?? null,
        promptUsed: body.customPrompt ?? null,
      },
    });

    return NextResponse.json({
      ...content,
      bodyAr: content.contentAr,
      hashtags: Array.isArray(content.hashtags) ? content.hashtags : generated.hashtags,
      seoKeywords: generated.seoKeywords ?? [],
    }, { status: 201 });
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

function normalizeLegacyContentType(type?: string) {
  switch (type?.toUpperCase()) {
    case "SOCIAL_POST":
      return "POST" as const;
    case "PRODUCT_DESCRIPTION":
      return "PRODUCT_DESC" as const;
    case "EMAIL":
      return "EMAIL_BODY" as const;
    case "BLOG_EXCERPT":
      return "VIDEO_IDEA" as const;
    default:
      return "POST" as const;
  }
}

function normalizePlatform(platform: string | undefined, contentType: string) {
  if (platform) return platform as "INSTAGRAM";
  if (contentType === "SEO_KEYWORDS") return "SEO";
  if (contentType === "VIDEO_IDEA") return "TIKTOK";
  if (contentType === "EMAIL_BODY") return "WHATSAPP";
  return "INSTAGRAM";
}

function normalizePlatformName(platform?: string) {
  if (!platform) return undefined;

  const normalized = platform.trim().toUpperCase();
  if (normalized === "TWITTER/X") return "TWITTER";
  if (normalized === "INSTAGRAM") return "INSTAGRAM";
  if (normalized === "TIKTOK") return "TIKTOK";
  if (normalized === "SNAPCHAT") return "SNAPCHAT";
  if (normalized === "LINKEDIN") return "INSTAGRAM";
  if (normalized === "EMAIL") return "EMAIL";
  if (normalized === "WHATSAPP") return "WHATSAPP";
  if (normalized === "SEO") return "SEO";
  return normalized;
}
