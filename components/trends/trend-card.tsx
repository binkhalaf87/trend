"use client";

import { TrendingUp, TrendingDown, Minus, Bookmark, Zap, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TrendItem } from "@/types";

const STATUS_CONFIG = {
  RISING: { label: "صاعد", icon: TrendingUp, color: "success" as const },
  PEAK: { label: "ذروة", icon: TrendingUp, color: "warning" as const },
  DECLINING: { label: "هابط", icon: TrendingDown, color: "destructive" as const },
  STABLE: { label: "مستقر", icon: Minus, color: "secondary" as const },
};

const CATEGORY_LABELS: Record<string, string> = {
  FASHION: "موضة",
  ELECTRONICS: "إلكترونيات",
  HOME_DECOR: "ديكور المنزل",
  BEAUTY: "جمال",
  FOOD: "طعام",
  FITNESS: "لياقة",
  GAMING: "ألعاب",
  TRAVEL: "سفر",
  KIDS: "أطفال",
  OTHER: "أخرى",
};

interface TrendCardProps {
  trend: TrendItem;
  showActions?: boolean;
}

export function TrendCard({ trend, showActions }: TrendCardProps) {
  const config = STATUS_CONFIG[trend.status] ?? STATUS_CONFIG.STABLE;
  const StatusIcon = config.icon;

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold leading-snug">{trend.nameAr}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{trend.nameEn}</p>
          </div>
          <Badge variant={config.color} className="shrink-0 gap-1">
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        {trend.descriptionAr && (
          <p className="text-sm text-muted-foreground line-clamp-2">{trend.descriptionAr}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">
            {CATEGORY_LABELS[trend.category] ?? trend.category}
          </Badge>
          {trend.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            نقاط: <strong className="text-foreground">{trend.score.toFixed(0)}</strong>
          </span>
          <span>
            البحث: <strong className="text-foreground">{trend.searchVolume.toLocaleString("ar")}</strong>
          </span>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-4 pt-0 gap-2">
          <Button size="sm" variant="outline" className="gap-1 flex-1">
            <Bookmark className="h-3.5 w-3.5" />
            حفظ
          </Button>
          <Button size="sm" className="gap-1 flex-1">
            <Zap className="h-3.5 w-3.5" />
            توليد محتوى
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
