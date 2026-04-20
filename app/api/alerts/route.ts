import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const onlyUnread = new URL(req.url).searchParams.get("unread") === "true";

    const alerts = await prisma.alert.findMany({
      where: { userId: dbUser.id, ...(onlyUnread && { isRead: false }) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("[GET /api/alerts]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { ids, markAll } = await req.json();

    if (markAll) {
      await prisma.alert.updateMany({
        where: { userId: dbUser.id, isRead: false },
        data: { isRead: true },
      });
    } else if (Array.isArray(ids) && ids.length > 0) {
      await prisma.alert.updateMany({
        where: { userId: dbUser.id, id: { in: ids } },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/alerts]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
