import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserInDb, isOnboardingComplete } from "@/lib/auth/helpers";
import { buildAppUrl } from "@/lib/site-url";

function normalizeNextPath(next: string | null) {
  if (!next || !next.startsWith("/")) {
    return "/dashboard";
  }

  return next;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const next = normalizeNextPath(searchParams.get("next"));

  try {
    if (!code) {
      return NextResponse.redirect(
        buildAppUrl("/login?error=missing_auth_code", req.nextUrl.origin)
      );
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user || !data.user.email) {
      throw error ?? new Error("Failed to exchange auth code for session");
    }

    let redirectTo = "/onboarding";

    try {
      await ensureUserInDb(
        data.user.id,
        data.user.email,
        data.user.user_metadata?.name ?? data.user.user_metadata?.full_name
      );

      const onboarded = await isOnboardingComplete(data.user.id);
      if (data.user.user_metadata?.onboarding_completed !== onboarded) {
        await supabase.auth.updateUser({
          data: {
            ...data.user.user_metadata,
            onboarding_completed: onboarded,
          },
        });
      }

      redirectTo = onboarded ? next : "/onboarding";
    } catch (syncError) {
      console.error("[GET /api/auth/callback] user sync failed", syncError);
      redirectTo = next === "/dashboard" ? "/onboarding" : next;
    }

    return NextResponse.redirect(buildAppUrl(redirectTo, req.nextUrl.origin));
  } catch (error) {
    console.error("[GET /api/auth/callback] auth callback failed", error);
    return NextResponse.redirect(
      buildAppUrl("/login?error=auth_callback_failed", req.nextUrl.origin)
    );
  }
}
