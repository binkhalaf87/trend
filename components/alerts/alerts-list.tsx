"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, React.ElementType> = {
  TREND_SPIKE: TrendingUp,
  NEW_TREND: TrendingUp,
  COMPETITOR_ALERT: AlertTriangle,
  WEEKLY_DIGEST: Bell,
};

export function AlertsList() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then(setAlerts)
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground text-sm">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{unreadCount} غير مقروء</Badge>
          <Button variant="ghost" size="sm" onClick={markAllRead} className="gap-1 text-xs">
            <CheckCheck className="h-3.5 w-3.5" />
            تحديد الكل كمقروء
          </Button>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <Bell className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">لا توجد تنبيهات حتى الآن</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const Icon = TYPE_ICONS[alert.type] ?? Bell;
            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                  !alert.isRead && "bg-primary/5 border-primary/20"
                )}
              >
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  !alert.isRead ? "bg-primary/15" : "bg-muted"
                )}>
                  <Icon className={cn("h-4 w-4", !alert.isRead ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", !alert.isRead && "font-semibold")}>{alert.titleAr}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{alert.bodyAr}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.createdAt).toLocaleDateString("ar-SA", { dateStyle: "medium" })}
                  </p>
                </div>
                {!alert.isRead && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
