"use client";

import { Bell, TrendingUp, AlertTriangle, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ALERT_TYPES = [
  {
    type: "TREND_SPIKE",
    icon: TrendingUp,
    title: "ارتفاع مفاجئ للترند",
    description: "عند ارتفاع أي ترند بنسبة 50%+ في ساعة واحدة",
  },
  {
    type: "NEW_TREND",
    icon: Bell,
    title: "ترند جديد",
    description: "عند اكتشاف ترند جديد في مجال متجرك",
  },
  {
    type: "COMPETITOR_ALERT",
    icon: AlertTriangle,
    title: "تنبيه المنافسين",
    description: "عند نشاط غير عادي من المنافسين",
  },
  {
    type: "WEEKLY_DIGEST",
    icon: Mail,
    title: "ملخص أسبوعي",
    description: "ملخص كل الترندات الأسبوع المنصرم",
  },
];

export function AlertSettings() {
  return (
    <div className="space-y-4 max-w-2xl">
      {ALERT_TYPES.map(({ type, icon: Icon, title, description }) => (
        <Card key={type}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm">{title}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
                </div>
              </div>
              {/* Toggle placeholder — wire to real state */}
              <button className="h-6 w-11 rounded-full bg-primary transition-colors relative">
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform translate-x-5" />
              </button>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
