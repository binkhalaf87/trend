import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BodySchema = z.object({
  trendId: z.string(),
  action: z.enum(["up", "down"]),
  redditUsername: z.string(),
});

// يستقبل تصويتات من Devvit Reddit App
export async function POST(req: NextRequest) {
  try {
    // تحقق من DEVVIT_SECRET
    const secret = req.headers.get("x-devvit-secret");
    if (secret !== process.env.DEVVIT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = BodySchema.parse(await req.json());

    const trend = await prisma.trend.update({
      where: { id: body.trendId },
      data: {
        redditVotes: { increment: body.action === "up" ? 1 : -1 },
      },
      select: { id: true, redditVotes: true },
    });

    return NextResponse.json({ success: true, redditVotes: trend.redditVotes });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[POST /api/trends/reddit-vote]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
