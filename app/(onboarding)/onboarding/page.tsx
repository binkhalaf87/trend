import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isOnboardingComplete } from "@/lib/auth/helpers";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "إعداد متجرك — TrendZone" };

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const complete = await isOnboardingComplete(authUser!.id);
  if (complete) redirect("/dashboard");

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
