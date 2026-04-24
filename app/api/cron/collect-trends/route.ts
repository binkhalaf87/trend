import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/collectors/utils";
import { runCollectTrends } from "@/lib/jobs/collect-trends";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runCollectTrends();
  return NextResponse.json({ ok: true, ...result });
}
