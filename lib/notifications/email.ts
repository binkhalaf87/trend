import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "TrendZone <alerts@trendzone.sa>";

// ─── Instant alert email ──────────────────────────────────────────────────────
export async function sendTrendAlertEmail({
  to,
  storeName,
  trendNameAr,
  signalStrength,
  peakDays,
  contentUrl,
}: {
  to: string;
  storeName: string;
  trendNameAr: string;
  signalStrength: number;
  peakDays: number;
  contentUrl: string;
}) {
  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ترند جديد لمتجرك</title>
</head>
<body style="margin:0;padding:0;background:#f5f4ff;font-family:'Cairo',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4ff;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(83,74,183,0.10);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#534AB7,#7c74e8);padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">⚡ TrendZone</p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">تنبيه ترند جديد</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:15px;color:#64748b;">مرحباً ${storeName}،</p>
              <h2 style="margin:0 0 24px;font-size:22px;font-weight:900;color:#1e1b4b;">🔥 ترند صاعد في مجالك!</h2>

              <div style="background:#f5f4ff;border-radius:16px;padding:24px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:20px;font-weight:800;color:#534AB7;">${trendNameAr}</p>
                <div style="display:flex;gap:16px;margin-top:12px;">
                  <div style="background:#fff;border-radius:12px;padding:12px 20px;text-align:center;flex:1;">
                    <p style="margin:0;font-size:28px;font-weight:900;color:#534AB7;">${signalStrength}%</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#64748b;">قوة الإشارة</p>
                  </div>
                  <div style="background:#fff;border-radius:12px;padding:12px 20px;text-align:center;flex:1;">
                    <p style="margin:0;font-size:28px;font-weight:900;color:#10b981;">${peakDays}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#64748b;">أيام للذروة</p>
                  </div>
                </div>
              </div>

              <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.7;">
                المحتوى الجاهز للنشر على إنستقرام، سناب شات، تيك توك وSEO — جاهز وينتظرك الآن.
              </p>

              <a href="${contentUrl}" style="display:inline-block;background:linear-gradient(135deg,#534AB7,#7c74e8);color:#fff;text-decoration:none;border-radius:14px;padding:14px 32px;font-size:15px;font-weight:700;">
                👉 افتح المحتوى الجاهز
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                تلقيت هذا البريد لأنك مشترك في تنبيهات TrendZone.<br/>
                <a href="#" style="color:#534AB7;text-decoration:none;">إلغاء الاشتراك</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `🔥 ترند جديد: ${trendNameAr} — اركبه قبل منافسيك`,
    html,
  });
}

// ─── Daily digest email ───────────────────────────────────────────────────────
export async function sendDailyDigestEmail({
  to,
  storeName,
  trends,
  dashboardUrl,
}: {
  to: string;
  storeName: string;
  trends: { nameAr: string; signalStrength: number; category: string }[];
  dashboardUrl: string;
}) {
  const trendRows = trends
    .slice(0, 5)
    .map(
      (t) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:#1e1b4b;">${t.nameAr}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;">
          <span style="background:#f5f4ff;color:#534AB7;border-radius:8px;padding:4px 10px;font-size:13px;font-weight:700;">${t.signalStrength}%</span>
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f4ff;font-family:'Cairo',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4ff;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(83,74,183,0.10);">
        <tr>
          <td style="background:linear-gradient(135deg,#534AB7,#7c74e8);padding:28px 40px;text-align:center;">
            <p style="margin:0;font-size:24px;font-weight:900;color:#fff;">📊 ملخصك اليومي</p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">أبرز ترندات اليوم لـ ${storeName}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
              <tr style="background:#f8fafc;">
                <th style="padding:12px 16px;text-align:right;font-size:13px;color:#64748b;font-weight:600;">الترند</th>
                <th style="padding:12px 16px;text-align:center;font-size:13px;color:#64748b;font-weight:600;">قوة الإشارة</th>
              </tr>
              ${trendRows}
            </table>
            <div style="margin-top:28px;text-align:center;">
              <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#534AB7,#7c74e8);color:#fff;text-decoration:none;border-radius:14px;padding:14px 32px;font-size:15px;font-weight:700;">
                فتح لوحة التحكم
              </a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `📊 ملخص ترندات اليوم لمتجرك — ${new Date().toLocaleDateString("ar-SA")}`,
    html,
  });
}
