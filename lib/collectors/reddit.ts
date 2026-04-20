import { withRetry, sleep, detectCategory, translateTitle, isCommercialQuery, regionToGeoFocus } from "./utils";
import type { RawTrendData, RedditPost, RedditListingResponse } from "./types";

const REDDIT_BASE = "https://www.reddit.com";
const USER_AGENT = "TrendZone/1.0 (trend discovery bot; contact: admin@trendzone.sa)";

// Target subreddits for Gulf/Arab e-commerce signals
const DEFAULT_SUBREDDITS = [
  "SaudiArabia",
  "dubai",
  "AskMiddleEast",
  "saudiarabia",
  "UAE",
  "Kuwait",
  "Egypt",
];

// ─── Main collector ───────────────────────────────────────────────────────────

export async function fetchRedditTrends(
  subreddits: string[] = DEFAULT_SUBREDDITS,
  lookbackHours = 24
): Promise<RawTrendData[]> {
  const allPosts: RedditPost[] = [];

  for (const sub of subreddits) {
    try {
      const posts = await withRetry(() => fetchSubredditPosts(sub, "hot"));
      allPosts.push(...posts);
      await sleep(800); // be polite to Reddit
    } catch (err) {
      console.warn(`[Reddit] failed to fetch r/${sub}:`, err);
    }
  }

  return processRedditPosts(allPosts, lookbackHours);
}

// ─── Fetch posts from one subreddit ──────────────────────────────────────────

async function fetchSubredditPosts(
  subreddit: string,
  sort: "hot" | "rising" | "new" = "hot",
  limit = 50
): Promise<RedditPost[]> {
  const url = `${REDDIT_BASE}/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Reddit API ${res.status} for r/${subreddit}`);
  }

  const json: RedditListingResponse = await res.json();
  return json.data?.children?.map((c) => ({ ...c.data, subreddit })) ?? [];
}

// ─── Process raw posts into RawTrendData ─────────────────────────────────────

function processRedditPosts(
  posts: RedditPost[],
  lookbackHours: number
): RawTrendData[] {
  const cutoff = Date.now() / 1000 - lookbackHours * 3600;
  const grouped = new Map<string, RedditPost[]>();

  for (const post of posts) {
    if (post.created_utc < cutoff) continue;
    if (post.score < 10) continue; // skip low-signal posts

    const keyword = extractMainKeyword(post.title);
    if (!keyword) continue;

    if (!grouped.has(keyword)) grouped.set(keyword, []);
    grouped.get(keyword)!.push(post);
  }

  const results: RawTrendData[] = [];

  for (const [keyword, relatedPosts] of grouped) {
    const totalScore = relatedPosts.reduce((s, p) => s + p.score, 0);
    const totalComments = relatedPosts.reduce((s, p) => s + p.num_comments, 0);
    const avgUpvoteRatio = relatedPosts.reduce((s, p) => s + p.upvote_ratio, 0) / relatedPosts.length;

    // Only include posts with commercial relevance or high engagement
    const combined = relatedPosts.map((p) => p.title).join(" ");
    const hasCommercialSignal = isCommercialQuery(combined);
    if (!hasCommercialSignal && totalScore < 100) continue;

    const subreddits = [...new Set(relatedPosts.map((p) => p.subreddit))];
    const sourceUrls = relatedPosts
      .slice(0, 3)
      .map((p) => `${REDDIT_BASE}${p.permalink}`);

    const allKeywords = extractKeywordsFromPosts(relatedPosts);

    results.push({
      titleEn: keyword,
      titleAr: translateTitle(keyword),
      keywords: allKeywords,
      socialMentions: relatedPosts.length,
      growthRate: calcRedditGrowthRate(totalScore, relatedPosts.length),
      source: "REDDIT",
      region: detectRegionFromSubreddits(subreddits),
      category: detectCategory(combined),
      sourceUrls,
      rawScore: totalScore,
      metadata: {
        totalScore,
        totalComments,
        avgUpvoteRatio: Math.round(avgUpvoteRatio * 100) / 100,
        subreddits,
        postCount: relatedPosts.length,
      },
    });
  }

  // Sort by raw score descending
  return results.sort((a, b) => (b.rawScore ?? 0) - (a.rawScore ?? 0));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to",
  "for", "of", "and", "or", "but", "not", "with", "from", "this", "that",
  "it", "i", "we", "my", "your", "what", "how", "why", "when", "where",
  "anyone", "someone", "people", "anyone",
]);

function extractMainKeyword(title: string): string {
  // Remove emojis and special chars, keep alphanumeric + Arabic
  const cleaned = title
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
    .replace(/[^\w\s\u0600-\u06FF]/g, " ")
    .trim();

  // Take first meaningful noun phrase (2-4 words)
  const words = cleaned.split(/\s+/).filter((w) => {
    return w.length > 2 && !STOP_WORDS.has(w.toLowerCase());
  });

  if (!words.length) return "";
  return words.slice(0, 3).join(" ").toLowerCase();
}

function extractKeywordsFromPosts(posts: RedditPost[]): string[] {
  const freq = new Map<string, number>();

  for (const post of posts) {
    const text = `${post.title} ${post.selftext}`.toLowerCase();
    const words = text.split(/\W+/).filter((w) => w.length > 3 && !STOP_WORDS.has(w));
    for (const w of words) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);
}

function calcRedditGrowthRate(totalScore: number, postCount: number): number {
  // Heuristic: posts with high score/count ratio signal viral growth
  const virality = (totalScore / Math.max(postCount, 1));
  if (virality > 500) return 200;
  if (virality > 200) return 150;
  if (virality > 100) return 80;
  if (virality > 50)  return 40;
  return 20;
}

function detectRegionFromSubreddits(subreddits: string[]): string {
  const lower = subreddits.map((s) => s.toLowerCase());
  if (lower.some((s) => s.includes("saudi") || s.includes("ksa"))) return "SA";
  if (lower.some((s) => s.includes("dubai") || s.includes("uae"))) return "AE";
  if (lower.some((s) => s.includes("kuwait"))) return "KW";
  if (lower.some((s) => s.includes("egypt"))) return "EG";
  return "GULF";
}
