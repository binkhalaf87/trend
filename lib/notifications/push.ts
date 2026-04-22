import webpush from "web-push";

// تهيئة مرة واحدة عند التشغيل
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? "hello@trendzone.sa"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: { title: string; body: string; url?: string; icon?: string }
) {
  return webpush.sendNotification(
    subscription,
    JSON.stringify({
      title: payload.title,
      body:  payload.body,
      icon:  payload.icon ?? "/icon-192.png",
      badge: "/badge-72.png",
      data:  { url: payload.url ?? "/dashboard" },
    })
  );
}

export async function sendTrendPushAlert(
  subscription: PushSubscriptionData,
  trendNameAr: string,
  signalStrength: number
) {
  return sendPushNotification(subscription, {
    title: `🔥 ترند جديد: ${trendNameAr}`,
    body:  `قوة الإشارة ${signalStrength}% — المحتوى الجاهز ينتظرك`,
    url:   "/trends",
  });
}
