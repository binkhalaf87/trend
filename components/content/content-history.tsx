"use client";

import { useEffect, useState } from "react";
import { Copy, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TYPE_LABELS: Record<string, string> = {
  SOCIAL_POST: "بوست",
  PRODUCT_DESCRIPTION: "وصف منتج",
  AD_COPY: "إعلان",
  EMAIL: "بريد",
  BLOG_EXCERPT: "مدونة",
};

export function ContentHistory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground text-sm">جاري التحميل...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">لا يوجد محتوى مُولَّد بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{TYPE_LABELS[item.type] ?? item.type}</Badge>
                  {item.trend && (
                    <Badge variant="outline" className="text-xs">{item.trend.nameAr}</Badge>
                  )}
                </div>
                {item.titleAr && <p className="font-medium text-sm">{item.titleAr}</p>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => navigator.clipboard.writeText(item.bodyAr)}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{item.bodyAr}</p>
            {item.hashtags?.length > 0 && (
              <p className="text-xs text-primary">{item.hashtags.join(" ")}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
