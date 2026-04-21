import { NextRequest, NextResponse } from "next/server";
import { sendTrendAlerts, sendWeeklyDigest } from "@/lib/collectors/alert-sender";
import { logCollectorRun, verifyCronSecret } from "@/lib/collectors/utils";
import { notifyAdminOnFailure } from "@/lib/collectors/alert-sender";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();

  try {
    const { alertsCreated, usersNotified, errors } = await sendTrendAlerts();

    // Send weekly digest every Monday at 08:00 Riyadh time (05:00 UTC)
    const now = new Date();
    const isMonday = now.getUTCDay() === 1;
    const isDigestHour = now.getUTCHours() === 5;
    if (isMonday && isDigestHour) {
      await sendWeeklyDigest();
    }

    const completedAt = new Date();

    await logCollectorRun({
      source: "SEND_ALERTS",
      status: errors.length === 0 ? "SUCCESS" : "PARTIAL",
      startedAt,
      completedAt,
      itemsFound: usersNotified,
      itemsSaved: alertsCreated,
      errorMsg: errors.length ? errors.slice(0, 10).join("\n") : undefined,
      metadata: { alertsCreated, usersNotified },
    });

    console.log(`[cron/send-alerts] created=${alertsCreated} users=${usersNotified} errors=${errors.length}`);

    return NextResponse.json({
      ok: true,
      alertsCreated,
      usersNotified,
      errors: errors.length,
      durationMs: completedAt.getTime() - startedAt.getTime(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await notifyAdminOnFailure("SEND_ALERTS", msg);
    await logCollectorRun({
      source: "SEND_ALERTS",
      status: "FAILED",
      startedAt,
      completedAt: new Date(),
      errorMsg: msg,
    });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
