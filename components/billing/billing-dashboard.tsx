"use client";

import { useState } from "react";
import { Loader2, ExternalLink, AlertCircle, CheckCircle2, CreditCard, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PLANS, PLAN_LIST, type PlanId } from "@/lib/stripe/plans";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface BillingProps {
  currentPlan: PlanId | null;
  status: string | null;
  periodEnd: Date | null;
  cancelAtPeriodEnd?: boolean;
}

const STATUS_CONFIG = {
  ACTIVE:    { label: "نشط",        color: "success" as const,      icon: CheckCircle2 },
  TRIALING:  { label: "تجريبي",     color: "secondary" as const,    icon: Zap },
  PAST_DUE:  { label: "متأخر",      color: "destructive" as const,  icon: AlertCircle },
  CANCELED:  { label: "ملغى",       color: "destructive" as const,  icon: AlertCircle },
  PAUSED:    { label: "موقوف",      color: "warning" as const,      icon: AlertCircle },
};

export function BillingDashboard({ currentPlan, status, periodEnd, cancelAtPeriodEnd }: BillingProps) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState<PlanId | null>(null);
  const { toast } = useToast();

  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.TRIALING;
  const StatusIcon = cfg.icon;

  const openPortal = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast({ title: "خطأ", description: "فشل فتح بوابة الفواتير", variant: "destructive" });
    } finally {
      setLoadingPortal(false);
    }
  };

  const startCheckout = async (plan: PlanId) => {
    setLoadingCheckout(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast({ title: "خطأ", description: "فشل إنشاء جلسة الدفع", variant: "destructive" });
    } finally {
      setLoadingCheckout(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current plan card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">اشتراكك الحالي</CardTitle>
            <Badge variant={cfg.color} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {currentPlan ? PLANS[currentPlan].nameAr : "بدون اشتراك"}
              </p>
              {currentPlan && (
                <p className="text-sm text-muted-foreground">
                  {PLANS[currentPlan].priceSAR} ر.س / شهر
                </p>
              )}
            </div>
            {currentPlan && (
              <div className="text-sm text-muted-foreground text-left space-y-1">
                {periodEnd && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {cancelAtPeriodEnd ? "ينتهي في" : "يتجدد في"}:{" "}
                    {new Date(periodEnd).toLocaleDateString("ar-SA", { dateStyle: "medium" })}
                  </div>
                )}
              </div>
            )}
          </div>

          {cancelAtPeriodEnd && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              اشتراكك سيُلغى تلقائياً في نهاية الفترة الحالية.
            </div>
          )}

          <Separator />

          <div className="flex flex-wrap gap-2">
            {currentPlan && (
              <Button
                variant="outline"
                size="sm"
                onClick={openPortal}
                disabled={loadingPortal}
                className="gap-2"
              >
                {loadingPortal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
                إدارة طريقة الدفع
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={openPortal} disabled={loadingPortal} className="gap-2 text-muted-foreground">
              عرض سجل الفواتير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">الباقات المتاحة</CardTitle>
          <CardDescription>يمكنك التغيير في أي وقت — الفرق يُحسب بالتناسب</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {PLAN_LIST.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-xl border-2 p-4 space-y-3",
                    isCurrent ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div>
                    <p className="font-semibold text-sm">{plan.nameAr}</p>
                    <p className="text-lg font-bold mt-0.5">
                      {plan.priceSAR}{" "}
                      <span className="text-xs font-normal text-muted-foreground">ر.س/شهر</span>
                    </p>
                  </div>

                  <ul className="space-y-1">
                    {plan.features.slice(0, 4).map((f) => (
                      <li key={f.text} className={cn("flex items-center gap-1.5 text-xs", !f.included && "opacity-40")}>
                        <CheckCircle2 className={cn("h-3 w-3 shrink-0", f.included ? "text-green-500" : "text-muted-foreground")} />
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="secondary" size="sm" className="w-full" disabled>
                      باقتك الحالية
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => startCheckout(plan.id)}
                      disabled={!!loadingCheckout}
                      variant={plan.badge ? "default" : "outline"}
                    >
                      {loadingCheckout === plan.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        currentPlan && PLAN_LIST.findIndex(p => p.id === plan.id) > PLAN_LIST.findIndex(p => p.id === currentPlan) ? "ترقية" : "تغيير"
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
