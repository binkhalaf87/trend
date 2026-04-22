import twilio from "twilio";

let _client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!_client) {
    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) throw new Error("Twilio credentials missing");
    _client = twilio(sid, token);
  }
  return _client;
}

const FROM = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM ?? "+14155238886"}`;

// ─── Send a single trend alert via WhatsApp ───────────────────────────────────
export async function sendWhatsAppAlert({
  to,
  trendNameAr,
  signalStrength,
  peakDays,
  contentUrl,
}: {
  to: string;                // رقم بصيغة +966XXXXXXXX
  trendNameAr: string;
  signalStrength: number;
  peakDays: number;
  contentUrl: string;
}) {
  const body =
    `🔥 *ترند جديد لمتجرك!*\n\n` +
    `*${trendNameAr}*\n\n` +
    `📊 قوة الإشارة: *${signalStrength}%*\n` +
    `⏳ الذروة خلال: *${peakDays} أيام*\n\n` +
    `👉 المحتوى الجاهز:\n${contentUrl}`;

  const normalised = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  return getClient().messages.create({ from: FROM, to: normalised, body });
}

// ─── Daily digest via WhatsApp ────────────────────────────────────────────────
export async function sendWhatsAppDigest({
  to,
  storeName,
  topTrends,
  dashboardUrl,
}: {
  to: string;
  storeName: string;
  topTrends: { nameAr: string; signalStrength: number }[];
  dashboardUrl: string;
}) {
  const list = topTrends
    .slice(0, 3)
    .map((t, i) => `${i + 1}. *${t.nameAr}* — ${t.signalStrength}%`)
    .join("\n");

  const body =
    `📊 *ملخص ترندات اليوم*\n` +
    `متجر: ${storeName}\n\n` +
    `أبرز الترندات:\n${list}\n\n` +
    `👉 ${dashboardUrl}`;

  const normalised = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  return getClient().messages.create({ from: FROM, to: normalised, body });
}
