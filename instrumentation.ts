export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const PORT = process.env.PORT ?? "3000";
  const BASE = `http://localhost:${PORT}`;
  const SECRET = process.env.CRON_SECRET ?? "";
  const HOUR = 60 * 60 * 1000;

  async function callCron(path: string) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        headers: { Authorization: `Bearer ${SECRET}` },
      });
      const data = await res.json();
      console.log(`[cron] ${path}`, data);
    } catch (err) {
      console.error(`[cron] ${path} failed:`, err);
    }
  }

  // Delay initial run until server is ready
  setTimeout(() => callCron("/api/cron/collect-trends"), 15_000);

  // Collect every hour
  setInterval(() => callCron("/api/cron/collect-trends"), HOUR);

  // Analyze every 2 hours
  setInterval(() => callCron("/api/cron/analyze-trends"), 2 * HOUR);

  console.log("[instrumentation] cron jobs registered");
}
