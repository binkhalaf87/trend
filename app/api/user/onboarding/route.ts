import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureUserInDb } from "@/lib/auth/helpers";
import { z } from "zod";

const OnboardingSchema = z.object({
  storeName:     z.string().min(2).max(100),
  storeUrl:      z.string().url().optional().or(z.literal("")),
  storeCategory: z.enum(["FASHION","BEAUTY","ELECTRONICS","HOME","FOOD","FITNESS","KIDS","TRAVEL","GAMING","OTHER"]),
  targetMarkets: z.array(z.string()).min(1),
  alertChannels: z.array(z.string()).min(1),
  whatsappNumber: z.string().optional(),
  selectedPlan:  z.enum(["STARTER","GROWTH","ENTERPRISE"]),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.email) {
      return NextResponse.json({ error: "Missing authenticated email" }, { status: 400 });
    }

    const body = OnboardingSchema.parse(await req.json());

    await ensureUserInDb(
      user.id,
      user.email,
      user.user_metadata?.name ?? user.user_metadata?.full_name
    );

    // احفظ في DB
    const updated = await prisma.user.update({
      where: { supabaseId: user.id },
      data: {
        storeName:      body.storeName,
        storeUrl:       body.storeUrl || null,
        storeCategory:  body.storeCategory,
        whatsappNumber: body.whatsappNumber || null,
        notifyByEmail:     body.alertChannels.includes("EMAIL"),
        notifyByWhatsapp:  body.alertChannels.includes("WHATSAPP"),
        notifyByPush:      body.alertChannels.includes("PUSH"),
      },
    });

    // احفظ إشارة onboarding_completed في Supabase metadata
    await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        store_name: body.storeName,
      },
    });

    // أنشئ Alert Settings الافتراضية
    const alertTypes = ["NEW_TREND", "PEAK_WARNING", "TREND_SPIKE", "WEEKLY_DIGEST"] as const;
    await Promise.all(
      alertTypes.map((alertType) =>
        prisma.alertSetting.upsert({
          where: { userId_alertType: { userId: updated.id, alertType } },
          create: {
            userId: updated.id,
            alertType,
            channels: body.alertChannels as any,
          },
          update: { channels: body.alertChannels as any },
        })
      )
    );

    return NextResponse.json({ success: true, userId: updated.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[POST /api/user/onboarding]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
