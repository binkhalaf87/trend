import Link from "next/link";
import { ArrowLeft, Clock3, Flame, Layers3, TrendingUp, ArrowBigUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  categoryLabel,
  formatGrowthRate,
  formatPeakLabel,
  sourceBadge,
  statusBadgeClassName,
  statusLabel,
} from "@/lib/trends/helpers";
import type { TrendSource, TrendStatus } from "@/types/db";

export type TrendGridCardItem = {
  id: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string | null;
  category: string;
  status: TrendStatus;
  signalStrength: number;
  growthRate: number;
  peakExpectedAt: Date | null;
  sources: TrendSource[];
  redditVotes?: number;
};

export function TrendGridCard({ trend }: { trend: TrendGridCardItem }) {
  return (
    <Card className="group h-full rounded-[28px] border-white/50 bg-white/85 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(83,74,183,0.12)] dark:border-white/10 dark:bg-white/5">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`border-none ${statusBadgeClassName(trend.status)}`}>
                {statusLabel(trend.status)}
              </Badge>
              <Badge variant="secondary" className="border-none">
                {categoryLabel(trend.category)}
              </Badge>
            </div>
            <div>
              <h3 className="text-lg font-extrabold leading-tight">{trend.titleAr}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{trend.titleEn}</p>
            </div>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#534AB7]/10 text-[#534AB7] dark:bg-[#534AB7]/18 dark:text-[#c9c4ff]">
            <Flame className="h-5 w-5" />
          </div>
        </div>

        <p className="min-h-[52px] text-sm leading-7 text-muted-foreground">
          {trend.summaryAr ?? "ترند واعد وقابل للتحويل إلى محتوى وحملة سريعة لمتجرك."}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">قوة الإشارة</span>
            <span>{trend.signalStrength}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#ebe8ff] dark:bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#8e86f4] via-[#6f63da] to-[#534AB7] transition-all"
              style={{ width: `${trend.signalStrength}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-border/70 bg-background/70 px-3 py-3 dark:bg-black/10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              نسبة الارتفاع
            </div>
            <p className="mt-2 text-base font-extrabold text-green-600 dark:text-green-300">
              {formatGrowthRate(trend.growthRate)}
            </p>
          </div>
          <div className="rounded-[22px] border border-border/70 bg-background/70 px-3 py-3 dark:bg-black/10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              الذروة
            </div>
            <p className="mt-2 text-sm font-extrabold">{formatPeakLabel(trend.peakExpectedAt)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-[22px] border border-border/70 bg-background/70 px-3 py-3 dark:bg-black/10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Layers3 className="h-3.5 w-3.5" />
            المصادر
          </div>
          <div className="flex items-center gap-2">
            {trend.sources.map((source) => {
              const badge = sourceBadge(source);
              return (
                <span
                  key={`${trend.id}-${source}`}
                  title={source}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${badge.className}`}
                >
                  {badge.short}
                </span>
              );
            })}
          </div>
        </div>
      </CardContent>

      {(trend.redditVotes ?? 0) > 0 && (
        <div className="mx-5 mb-3 flex items-center gap-2 rounded-[18px] border border-orange-200/60 bg-orange-50/60 px-3 py-2 dark:border-orange-500/20 dark:bg-orange-500/10">
          <ArrowBigUp className="h-4 w-4 text-orange-500" />
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
            {trend.redditVotes} تصويت Reddit
          </span>
        </div>
      )}

      <CardFooter className="grid grid-cols-2 gap-3 p-5 pt-0">
        <Button asChild className="rounded-full bg-[#534AB7] text-white hover:bg-[#4d44ad]">
          <Link href={`/content?trend=${trend.id}`}>
            ابدأ الخطة
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full border-[#534AB7]/20 hover:bg-[#534AB7]/6">
          <Link href={`/trends/${trend.id}`}>تفاصيل</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
