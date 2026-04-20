"use client";

import { CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PLANS = [
  {
    id: "FREE",
    name: "مجاني",
    price: 0,
    features: ["5 ترندات يومياً", "10 محتوى شهرياً", "تنبيهات أسبوعية"],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 199,
    features: ["ترندات غير محدودة", "200 محتوى شهرياً", "تنبيهات فورية", "تحليلات متقدمة"],
    recommended: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 599,
    features: ["كل مميزات Pro", "API access", "دعم مخصص 24/7", "تقارير أسبوعية"],
  },
];

export function BillingSettings() {
  const currentPlan = "FREE";

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <Card key={plan.id} className={plan.recommended ? "border-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {isCurrent && <Badge variant="secondary">خطتك الحالية</Badge>}
                  {plan.recommended && !isCurrent && <Badge>الأفضل</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground text-sm">ر.س/شهر</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent}
                  className="w-full gap-1"
                  size="sm"
                >
                  {isCurrent ? "خطتك الحالية" : (
                    <><Zap className="h-3.5 w-3.5" />ترقية الآن</>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
