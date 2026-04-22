"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, SlidersHorizontal, Star, CheckCircle2,
  Instagram, Youtube, Twitter, MessageCircle, Users, TrendingUp,
  Sparkles, Mail, ExternalLink, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MOCK_INFLUENCERS, MOCK_TRENDS } from "@/lib/utils/mock-data";
import type { InfluencerItem, TrendCategory } from "@/types";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { value: "ALL", label: "الكل" },
  { value: "INSTAGRAM", label: "إنستقرام" },
  { value: "TIKTOK", label: "تيك توك" },
  { value: "SNAPCHAT", label: "سناب شات" },
  { value: "YOUTUBE", label: "يوتيوب" },
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: "ALL", label: "كل الفئات" },
  { value: "FASHION", label: "موضة" },
  { value: "BEAUTY", label: "عناية" },
  { value: "ELECTRONICS", label: "إلكترونيات" },
  { value: "HOME_DECOR", label: "منزل" },
  { value: "FOOD", label: "طعام" },
  { value: "FITNESS", label: "لياقة" },
  { value: "KIDS", label: "أطفال" },
];

const SIZES = [
  { value: "ALL", label: "كل الأحجام" },
  { value: "NANO", label: "نانو (< 50K)" },
  { value: "MICRO", label: "مايكرو (50K-200K)" },
  { value: "MID", label: "متوسط (200K-1M)" },
  { value: "MEGA", label: "ميغا (1M+)" },
];

function platformIcon(platform: string, className = "h-4 w-4") {
  const cls = className;
  switch (platform) {
    case "INSTAGRAM": return <Instagram className={cn(cls, "text-pink-500")} />;
    case "TIKTOK":    return <span className={cn("font-black text-[11px]", cls.includes("h-5") ? "text-base" : "")}>TK</span>;
    case "SNAPCHAT":  return <span className={cn("font-black text-yellow-400 text-[11px]")}>👻</span>;
    case "YOUTUBE":   return <Youtube className={cn(cls, "text-red-500")} />;
    case "TWITTER":   return <Twitter className={cn(cls, "text-sky-500")} />;
    default:          return <MessageCircle className={cls} />;
  }
}

function platformLabel(p: string) {
  const m: Record<string, string> = {
    INSTAGRAM: "إنستقرام", TIKTOK: "تيك توك",
    SNAPCHAT: "سناب شات", YOUTUBE: "يوتيوب", TWITTER: "تويتر",
  };
  return m[p] ?? p;
}

function categoryLabel(c: string) {
  const m: Record<string, string> = {
    FASHION: "موضة", BEAUTY: "عناية", ELECTRONICS: "إلكترونيات",
    HOME_DECOR: "منزل", FOOD: "طعام", FITNESS: "لياقة",
    KIDS: "أطفال", GAMING: "ألعاب", TRAVEL: "سفر", OTHER: "متنوع",
  };
  return m[c] ?? c;
}

function sizeFilter(followers: number, size: string) {
  if (size === "ALL") return true;
  if (size === "NANO")  return followers < 50000;
  if (size === "MICRO") return followers >= 50000 && followers < 200000;
  if (size === "MID")   return followers >= 200000 && followers < 1000000;
  if (size === "MEGA")  return followers >= 1000000;
  return true;
}

function formatFollowers(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

// ─── Contact Modal ──────────────────────────────────────────────────────────

function ContactModal({
  influencer,
  onClose,
}: {
  influencer: InfluencerItem;
  onClose: () => void;
}) {
  const hotTrend = MOCK_TRENDS.find((t) => influencer.matchedTrendIds.includes(t.id));
  const defaultMsg = `السلام عليكم ${influencer.name}،\n\nأنا صاحب متجر إلكتروني في مجال ${categoryLabel(influencer.categories[0] ?? "OTHER")} وأودّ التعاون معك في حملة ترويجية للترند الصاعد "${hotTrend?.nameAr ?? "ترند جديد"}".\n\nهل أنت متاح لمناقشة تفاصيل التعاون؟\n\nشكراً`;
  const [msg, setMsg] = useState(defaultMsg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-3xl bg-background border border-border shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">تواصل مع {influencer.name}</h3>
            <p className="text-sm text-muted-foreground">{influencer.handle}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <textarea
          className="w-full min-h-[180px] rounded-2xl border border-border bg-muted/40 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#534AB7]/40"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          dir="rtl"
        />

        <div className="flex gap-3">
          <a
            href={`mailto:${influencer.contactEmail}?subject=طلب تعاون - ترند جديد&body=${encodeURIComponent(msg)}`}
            className="flex-1"
          >
            <Button className="w-full bg-[#534AB7] hover:bg-[#443da3] text-white rounded-2xl gap-2">
              <Mail className="h-4 w-4" />
              إرسال بالإيميل
            </Button>
          </a>
          <Button variant="outline" className="rounded-2xl" onClick={onClose}>
            إغلاق
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">سيُحفظ سجل التواصل تلقائياً</p>
      </div>
    </div>
  );
}

// ─── Influencer Card ──────────────────────────────────────────────────────────

function InfluencerCard({
  inf,
  onContact,
}: {
  inf: InfluencerItem;
  onContact: (inf: InfluencerItem) => void;
}) {
  const matchedTrend = MOCK_TRENDS.find((t) => inf.matchedTrendIds[0] === t.id);

  return (
    <Card className="rounded-3xl border border-border/60 bg-white/80 dark:bg-white/5 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#534AB7]/20 to-[#8c84f2]/20 text-lg font-black text-[#534AB7]">
            {inf.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-base leading-tight">{inf.name}</p>
              {inf.isVerified && <CheckCircle2 className="h-4 w-4 text-[#534AB7] shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {platformIcon(inf.platform)}
              <span className="text-xs text-muted-foreground">{inf.handle}</span>
            </div>
          </div>
        </div>
        {/* AI match badge */}
        {inf.matchScore >= 85 && (
          <Badge className="shrink-0 border-none bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 gap-1 rounded-xl text-xs">
            <Sparkles className="h-3 w-3" />
            مناسب للترند
          </Badge>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-muted/50 px-3 py-2 text-center">
          <p className="text-base font-extrabold text-[#534AB7]">{formatFollowers(inf.followersCount)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">متابع</p>
        </div>
        <div className="rounded-2xl bg-muted/50 px-3 py-2 text-center">
          <p className="text-base font-extrabold text-emerald-600">{inf.engagementRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">تفاعل</p>
        </div>
        <div className="rounded-2xl bg-muted/50 px-3 py-2 text-center">
          <p className="text-base font-extrabold">{inf.matchScore}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">تطابق</p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5">
        {inf.categories.slice(0, 3).map((c) => (
          <span key={c} className="text-[11px] px-2.5 py-1 rounded-xl bg-[#534AB7]/10 text-[#534AB7] dark:text-[#c9c4ff] font-medium">
            {categoryLabel(c)}
          </span>
        ))}
        <span className="text-[11px] px-2.5 py-1 rounded-xl bg-muted text-muted-foreground font-medium">
          {platformLabel(inf.platform)}
        </span>
      </div>

      {/* AI reason */}
      {matchedTrend && (
        <div className="rounded-2xl bg-[#534AB7]/6 dark:bg-[#534AB7]/15 border border-[#534AB7]/15 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-[#534AB7] mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-[#534AB7] dark:text-[#c9c4ff]">
                مناسب لترند: {matchedTrend.nameAr}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{inf.matchReasonAr}</p>
            </div>
          </div>
        </div>
      )}

      {/* Price + actions */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[10px] text-muted-foreground">نطاق السعر</p>
          <p className="text-sm font-bold">{inf.priceRange}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/influencers/${inf.id}`}>
            <Button variant="outline" size="sm" className="rounded-2xl gap-1.5 text-xs">
              <ExternalLink className="h-3.5 w-3.5" />
              التفاصيل
            </Button>
          </Link>
          <Button
            size="sm"
            className="rounded-2xl gap-1.5 bg-[#534AB7] hover:bg-[#443da3] text-white text-xs"
            onClick={() => onContact(inf)}
          >
            <Mail className="h-3.5 w-3.5" />
            تواصل
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function InfluencersList() {
  const [search, setSearch]       = useState("");
  const [platform, setPlatform]   = useState("ALL");
  const [category, setCategory]   = useState("ALL");
  const [size, setSize]           = useState("ALL");
  const [sortBy, setSortBy]       = useState<"match" | "followers" | "engagement">("match");
  const [contactTarget, setContactTarget] = useState<InfluencerItem | null>(null);

  const filtered = useMemo(() => {
    return MOCK_INFLUENCERS
      .filter((inf) => {
        const q = search.toLowerCase();
        const matchSearch = !q || inf.name.includes(q) || inf.handle.includes(q) || inf.bio?.includes(q);
        const matchPlatform = platform === "ALL" || inf.platform === platform;
        const matchCat = category === "ALL" || inf.categories.includes(category as TrendCategory);
        const matchSize = sizeFilter(inf.followersCount, size);
        return matchSearch && matchPlatform && matchCat && matchSize && inf.isActive;
      })
      .sort((a, b) => {
        if (sortBy === "match")      return b.matchScore - a.matchScore;
        if (sortBy === "followers")  return b.followersCount - a.followersCount;
        if (sortBy === "engagement") return b.engagementRate - a.engagementRate;
        return 0;
      });
  }, [search, platform, category, size, sortBy]);

  return (
    <>
      {contactTarget && (
        <ContactModal influencer={contactTarget} onClose={() => setContactTarget(null)} />
      )}

      <div className="space-y-5">
        {/* Search & sort bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث باسم المؤثر أو الحساب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 rounded-2xl bg-background"
              dir="rtl"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none"
            dir="rtl"
          >
            <option value="match">الأعلى تطابقاً</option>
            <option value="followers">الأكثر متابعين</option>
            <option value="engagement">الأعلى تفاعلاً</option>
          </select>
        </div>

        {/* Filter pills */}
        <div className="space-y-2">
          {/* Platform filter */}
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={cn(
                  "rounded-2xl px-4 py-1.5 text-sm font-medium transition-all border",
                  platform === p.value
                    ? "bg-[#534AB7] text-white border-[#534AB7]"
                    : "bg-background text-muted-foreground border-border hover:border-[#534AB7]/40"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Category + size filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={cn(
                  "rounded-2xl px-3 py-1 text-xs font-medium transition-all border",
                  category === c.value
                    ? "bg-[#534AB7]/15 text-[#534AB7] border-[#534AB7]/30 dark:text-[#c9c4ff]"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:border-border"
                )}
              >
                {c.label}
              </button>
            ))}
            <div className="h-6 w-px bg-border mx-1 self-center" />
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSize(s.value)}
                className={cn(
                  "rounded-2xl px-3 py-1 text-xs font-medium transition-all border",
                  size === s.value
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:border-border"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{filtered.length}</span> مؤثر
          </p>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-20 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="font-semibold text-muted-foreground">لا يوجد مؤثرون بهذه المعايير</p>
            <p className="text-sm text-muted-foreground/60 mt-1">جرب توسيع فلاتر البحث</p>
            <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => { setSearch(""); setPlatform("ALL"); setCategory("ALL"); setSize("ALL"); }}>
              إعادة ضبط الفلاتر
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((inf) => (
              <InfluencerCard key={inf.id} inf={inf} onContact={setContactTarget} />
            ))}
          </div>
        )}

        {/* Joint campaign CTA */}
        <div className="rounded-3xl bg-gradient-to-l from-[#534AB7]/8 to-[#8c84f2]/8 border border-[#534AB7]/15 p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-base">حملة جماعية مشتركة 🚀</p>
            <p className="text-sm text-muted-foreground mt-1">
              انضم مع 3-5 متاجر في نفس المجال وقسّم تكلفة المؤثر — وفّر حتى 60%
            </p>
          </div>
          <Button className="shrink-0 rounded-2xl bg-[#534AB7] hover:bg-[#443da3] text-white gap-2">
            <Sparkles className="h-4 w-4" />
            انضم لحملة مشتركة
          </Button>
        </div>
      </div>
    </>
  );
}
