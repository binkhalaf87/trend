"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NOTIFICATIONS = [
  { id: "trend_spike", title: "ارتفاع مفاجئ للترند", description: "إشعار عند ارتفاع ترند 50%+ خلال ساعة" },
  { id: "new_trend", title: "ترند جديد", description: "إشعار عند اكتشاف ترند في مجال متجرك" },
  { id: "weekly_digest", title: "ملخص أسبوعي", description: "تقرير أسبوعي يُرسَل كل يوم الأحد" },
  { id: "marketing_tips", title: "نصائح تسويقية", description: "نصائح وأفكار لزيادة المبيعات" },
];

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">إعدادات الإشعارات</CardTitle>
        <CardDescription>اختر الإشعارات التي تريد تلقيها عبر البريد الإلكتروني</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {NOTIFICATIONS.map(({ id, title, description }) => (
          <div key={id} className="flex items-center justify-between py-2 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <button className="h-6 w-11 rounded-full bg-primary transition-colors relative shrink-0">
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform translate-x-5" />
            </button>
          </div>
        ))}
        <Button className="mt-2">حفظ الإعدادات</Button>
      </CardContent>
    </Card>
  );
}
