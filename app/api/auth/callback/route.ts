import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserInDb, isOnboardingComplete } from "@/lib/auth/helpers";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // تأكد من وجود المستخدم في DB
      await ensureUserInDb(
        data.user.id,
        data.user.email!,
        data.user.user_metadata?.name ?? data.user.user_metadata?.full_name
      );

      // هل أتمّ الـ onboarding؟
      const onboarded = await isOnboardingComplete(data.user.id);
      const redirectTo = onboarded ? next : "/onboarding";

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
