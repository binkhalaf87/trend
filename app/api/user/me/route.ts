import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { subscription: { select: { plan: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true } } },
    });

    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // اجعل بيانات الاشتراك جزءاً من user object للاستخدام السهل
    const response = {
      ...dbUser,
      subscriptionPlan:   dbUser.subscription?.plan   ?? null,
      subscriptionStatus: dbUser.subscription?.status ?? null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/user/me]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
