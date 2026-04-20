"use client";

import { CheckCircle2, XCircle, Zap, Crown, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PLAN_LIST, type PlanId } from "@/lib/stripe/plans";
import type { OnboardingData } from "@/components/onboarding/onboarding-wizard";

const PLAN_ICONS: Record<PlanId, React.ElementType> = {
  STARTER: Zap,
  GROWTH: Crown,
  ENTERPRISE: Building2,
};

const PLAN_COLORS: Record<PlanId, string> = {
  STARTER:    "border-blue-500/40   bg-blue-500/5   text-blue-600",
  GROWTH:     "border-primary       bg-primary/5    text-primary",
  ENTERPRISE: "border-purple-500/40 bg-purple-500/5 text-purple-600",
};

interface Props {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function ChoosePlanStep({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        اختر الباقة التي تناسبك — يمكنك التغيير في أي وقت. الجميع يبدأ بتجربة مجانية 14 يوم.
      </p>

      <div className="space-y-3">
        {PLAN_LIST.map((plan) => {
          const Icon = PLAN_ICONS[plan.id];
          const selected = data.selectedPlan === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange({ selectedPlan: plan.id })}
              className={cn(
                "w-full text-right p-4 rounded-xl border-2 transition-all",
                selected ? PLAN_COLORS[plan.id] : "border-border hover:border-primary/40"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", selected ? "bg-current/10" : "bg-muted")}>
                  <Icon className={cn("h-5 w-5", selected ? "text-current" : "text-muted-foreground")} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">{plan.nameAr}</span>
                    {plan.badge && (
                      <Badge className="text-xs py-0">{plan.badge}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{plan.descriptionAr}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {plan.features.slice(0, 3).map((f) => (
                      <span
                        key={f.text}
                        className={cn(
                          "inline-flex items-center gap-1 text-xs",
                          !f.included && "opacity-40 line-through"
                        )}
                      >
                        {f.included
                          ? <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                          : <XCircle className="h-3 w-3 text-muted-foreground shrink-0" />}
                        {f.text}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 text-left">
                  <div className="text-lg font-bold">{plan.priceSAR}</div>
                  <div className="text-xs text-muted-foreground">ر.س/شهر</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-muted/50 rounded-xl p-3 text-center">
        <p className="text-xs text-muted-foreground">
          🎁 <strong>14 يوم مجاناً</strong> على أي باقة — لا يلزم بطاقة ائتمان الآن
        </p>
      </div>
    </div>
  );
}
