// public/sw.js — Service Worker لـ Push Notifications

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch { data = { title: "TrendZone", body: event.data.text() }; }

  const title   = data.title   ?? "TrendZone";
  const options = {
    body:    data.body    ?? "لديك تنبيه جديد",
    icon:    data.icon    ?? "/icon-192.png",
    badge:   data.badge   ?? "/badge-72.png",
    dir:     "rtl",
    lang:    "ar",
    data:    { url: data.data?.url ?? "/dashboard" },
    actions: [
      { action: "open",    title: "افتح الآن" },
      { action: "dismiss", title: "إغلاق" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const url = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(url) && "focus" in c);
        if (existing) return existing.focus();
        return self.clients.openWindow(url);
      })
  );
});
