"use client";

import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Instagram, Youtube, Twitter,
  MessageCircle, Mail, ExternalLink, TrendingUp, Users,
  BarChart2, MapPin, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MOCK_TRENDS } from "@/lib/utils/mock-data";
import type { InfluencerItem } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

function platformIcon(platform: string) {
  switch (platform) {
    case "INSTAGRAM": return <Instagram className="h-5 w-5 text-pink-500" />;
    case "TIKTOK":    return <span className="font-black text-sm">TK</span>;
    case "SNAPCHAT":  return <span className="text-yellow-400">👻</span>;
    case "YOUTUBE":   return <Youtube className="h-5 w-5 text-red-500" />;
    case "TWITTER":   return <Twitter className="h-5 w-5 text-sky-500" />;
    default:          return <MessageCircle className="h-5 w-5" />;
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

function formatN(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

export function InfluencerDetail({ influencer: inf }: { influencer: InfluencerItem }) {
  const [msgSent, setMsgSent] = useState(false);
  const matchedTrends = MOCK_TRENDS.filter((t) => inf.matchedTrendIds.includes(t.id));

  const defaultEmail = `mailto:${inf.contactEmail}?subject=${encodeURIComponent("طلب تعاون - ترند جديد")}&body=${encodeURIComponent(
    `السلام عليكم ${inf.name}،\n\nأودّ التعاون معك في حملة ترويجية.\n\nشكراً`
  )}`;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/influencers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowRight className="h-4 w-4" />
        العودة للمؤثرين
      </Link>

      {/* Hero card */}
      <Card className="rounded-3xl border border-border/60 bg-white/80 dark:bg-white/5 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#534AB7]/20 to-[#8c84f2]/20 text-3xl font-black text-[#534AB7] shrink-0">
            {inf.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-2xl font-extrabold">{inf.name}</h1>
              {inf.isVerified && (
                <Badge className="border-none bg-[#534AB7]/12 text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff] gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  موثّق
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {platformIcon(inf.platform)}
              <span className="text-sm font-medium">{inf.handle}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="text-sm">{platformLabel(inf.platform)}</span>
              {inf.city && (
                <>
                  <span className="text-muted-foreground/50">·</span>
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-sm">{inf.city}</span>
                </>
              )}
            </div>
            {inf.bio && <p className="text-sm text-muted-foreground">{inf.bio}</p>}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {inf.categories.map((c) => (
                <span key={c} className="text-xs px-2.5 py-1 rounded-xl bg-[#534AB7]/10 text-[#534AB7] dark:text-[#c9c4ff] font-medium">
                  {categoryLabel(c)}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            {msgSent ? (
              <div className="rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-2.5 text-center font-semibold">
                ✅ تم إرسال الطلب
              </div>
            ) : (
              <a href={defaultEmail} onClick={() => setMsgSent(true)}>
                <Button className="w-full rounded-2xl bg-[#534AB7] hover:bg-[#443da3] text-white gap-2">
                  <Mail className="h-4 w-4" />
                  تواصل معه
                </Button>
              </a>
            )}
            {inf.profileUrl && (
              <a href={inf.profileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full rounded-2xl gap-2">
                  <ExternalLink className="h-4 w-4" />
                  زيارة الحساب
                </Button>
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "المتابعون", value: formatN(inf.followersCount), icon: Users, color: "text-[#534AB7]" },
          { label: "معدل التفاعل", value: inf.engagementRate + "%", icon: BarChart2, color: "text-emerald-600" },
          { label: "متوسط اللايكات", value: formatN(inf.avgLikes ?? 0), icon: Star, color: "text-amber-500" },
          { label: "نقاط التطابق", value: inf.matchScore + "/100", icon: TrendingUp, color: "text-rose-500" },
        ].map((s) => (
          <Card key={s.label} className="rounded-3xl border border-border/60 bg-white/80 dark:bg-white/5 p-4 text-center">
            <s.icon className={cn("h-5 w-5 mx-auto mb-1", s.color)} />
            <p className={cn("text-xl font-extrabold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AI Match & Price */}
        <Card className="rounded-3xl border border-border/60 bg-white/80 dark:bg-white/5 p-5 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#534AB7]" />
            تحليل التطابق الذكي
          </h2>
          <div className="rounded-2xl bg-[#534AB7]/6 dark:bg-[#534AB7]/15 border border-[#534AB7]/15 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">نقاط التطابق الإجمالية</p>
              <span className="text-2xl font-extrabold text-[#534AB7]">{inf.matchScore}</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#534AB7]/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#534AB7] transition-all"
                style={{ width: `${inf.matchScore}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{inf.matchReasonAr}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">نطاق التسعير</p>
            <p className="text-2xl font-extrabold">{inf.priceRange}</p>
            <p className="text-xs text-muted-foreground">للبوست الواحد — يختلف حسب نوع المحتوى والمدة</p>
          </div>
        </Card>

        {/* Matched trends */}
        <Card className="rounded-3xl border border-border/60 bg-white/80 dark:bg-white/5 p-5 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#534AB7]" />
            الترندات المناسبة له
          </h2>
          {matchedTrends.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد ترندات مرتبطة حالياً</p>
          ) : (
            <div className="space-y-2">
              {matchedTrends.map((t) => (
                <Link
                  key={t.id}
                  href={`/trends/${t.id}`}
                  className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold">{t.nameAr}</p>
                    <p className="text-xs text-muted-foreground">{categoryLabel(t.category)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-[#534AB7]/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#534AB7]">{t.score}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              جمهوره في{" "}
              <span className="font-semibold text-foreground">{inf.country === "SA" ? "السعودية" : inf.country === "AE" ? "الإمارات" : "الكويت"}</span>
              {" "}— مناسب للسوق الخليجي
            </p>
          </div>
        </Card>
      </div>

      {/* Joint campaign */}
      <Card className="rounded-3xl border border-[#534AB7]/20 bg-gradient-to-l from-[#534AB7]/6 to-[#8c84f2]/6 p-5">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="font-bold">🚀 شارك في حملة جماعية مع هذا المؤثر</p>
            <p className="text-sm text-muted-foreground mt-1">
              انضم مع متاجر أخرى في مجال {categoryLabel(inf.categories[0] ?? "OTHER")} وقسّم التكلفة — يصل التوفير إلى 60%
            </p>
          </div>
          <Button className="shrink-0 rounded-2xl bg-[#534AB7] hover:bg-[#443da3] text-white">
            طلب حملة مشتركة
          </Button>
        </div>
      </Card>
    </div>
  );
}
