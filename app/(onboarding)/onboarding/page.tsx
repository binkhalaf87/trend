import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserInDb, isOnboardingComplete } from "@/lib/auth/helpers";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "إعداد متجرك — TrendZone" };

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");
  if (!authUser.email) redirect("/login?error=missing_email");

  try {
    await ensureUserInDb(
      authUser.id,
      authUser.email,
      authUser.user_metadata?.name ?? authUser.user_metadata?.full_name
    );

    const complete = await isOnboardingComplete(authUser.id);
    if (complete) redirect("/dashboard");
  } catch (err) {
    console.error("[OnboardingPage] db error:", err);
    // اعرض صفحة الـ onboarding حتى لو فشل الـ DB sync — المستخدم مسجّل دخوله
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6 md:p-8">
        <div className="mb-6 text-center space-y-1">
          <h1 className="text-2xl font-bold">مرحباً! لنُعدّ متجرك 👋</h1>
          <p className="text-muted-foreground text-sm">
            4 خطوات سريعة لتخصيص تجربتك في TrendZone
          </p>
        </div>
        <OnboardingWizard />
      </CardContent>
    </Card>
  );
}
