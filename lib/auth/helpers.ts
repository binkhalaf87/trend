import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { DbUser } from "@/types/db";

/** جلب المستخدم الحالي مع بيانات الاشتراك */
export async function getCurrentUser(): Promise<DbUser | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    return dbUser;
  } catch {
    return null;
  }
}

/** إنشاء مستخدم في DB بعد أول تسجيل */
export async function ensureUserInDb(supabaseId: string, email: string, name?: string) {
  return prisma.user.upsert({
    where: { supabaseId },
    create: { supabaseId, email, name: name ?? null },
    update: { email },
  });
}

/** هل أتمّ المستخدم الـ onboarding? */
export async function isOnboardingComplete(supabaseId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { supabaseId },
    select: { storeName: true },
  });
  return !!user?.storeName;
}
