import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/collectors/utils";
import { runAnalyzeTrends } from "@/lib/jobs/analyze-trends";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runAnalyzeTrends();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
