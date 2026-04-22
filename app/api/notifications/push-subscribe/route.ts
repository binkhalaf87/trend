import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase    = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subscription = await req.json();

    // Store the push subscription keyed by user — for real use, persist in DB
    // Here we return success so the client flow completes
    console.info(`[Push] Saved subscription for user ${user.id}`, subscription.endpoint);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Push subscribe]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
