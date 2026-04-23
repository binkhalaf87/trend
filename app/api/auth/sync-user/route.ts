import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserInDb, isOnboardingComplete } from "@/lib/auth/helpers";

export async function POST() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUserInDb(
      user.id,
      user.email,
      user.user_metadata?.name ?? user.user_metadata?.full_name
    );

    const onboardingComplete = await isOnboardingComplete(user.id);

    if (user.user_metadata?.onboarding_completed !== onboardingComplete) {
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          onboarding_completed: onboardingComplete,
        },
      });
    }

    return NextResponse.json({
      redirectTo: onboardingComplete ? "/dashboard" : "/onboarding",
    });
  } catch (error) {
    console.error("[POST /api/auth/sync-user]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
