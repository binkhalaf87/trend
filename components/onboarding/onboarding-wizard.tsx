"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressSteps } from "@/components/onboarding/progress-steps";
import { StoreInfoStep } from "@/components/onboarding/steps/store-info";
import { TargetMarketStep } from "@/components/onboarding/steps/target-market";
import { NotificationsStep } from "@/components/onboarding/steps/notifications";
import { ChoosePlanStep } from "@/components/onboarding/steps/choose-plan";
import { useToast } from "@/components/ui/use-toast";
import type { TrendCategory } from "@/types/db";
import type { PlanId } from "@/lib/stripe/plans";

export interface OnboardingData {
  storeName: string;
  storeUrl: string;
  storeCategory: TrendCategory | "";
  targetMarkets: string[];
  alertChannels: string[];
  whatsappNumber: string;
  selectedPlan: PlanId;
}

const STEPS = [
  { id: 1, label: "متجرك" },
  { id: 2, label: "السوق" },
  { id: 3, label: "التنبيهات" },
  { id: 4, label: "الباقة" },
];

const DEFAULT: OnboardingData = {
  storeName: "",
  storeUrl: "",
  storeCategory: "",
  targetMarkets: [],
  alertChannels: ["EMAIL"],
  whatsappNumber: "",
  selectedPlan: "STARTER",
};

function canProceed(step: number, data: OnboardingData): boolean {
  if (step === 1) return !!data.storeName.trim() && !!data.storeCategory;
  if (step === 2) return data.targetMarkets.length > 0;
  if (step === 3) return data.alertChannels.length > 0;
  if (step === 4) return !!data.selectedPlan;
  return false;
}

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const update = (partial: Partial<OnboardingData>) => setData((d) => ({ ...d, ...partial }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const finish = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل الحفظ");

      setDone(true);

      // إذا اختار خطة مدفوعة ← إنشاء checkout session
      if (data.selectedPlan !== "STARTER") {
        const checkoutRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: data.selectedPlan }),
        });
        if (checkoutRes.ok) {
          const { url } = await checkoutRes.json();
          window.location.href = url;
          return;
        }
      }

      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-4 py-8 animate-fade-in">
        <div className="h-16 w-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold">تم! أهلاً بك في TrendZone 🎉</h2>
        <p className="text-muted-foreground text-sm">جاري توجيهك للوحة التحكم...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProgressSteps steps={STEPS} current={step} />

      {/* Step title */}
      <div className="space-y-1">
        {step === 1 && <><h2 className="text-xl font-bold">أخبرنا عن متجرك</h2><p className="text-sm text-muted-foreground">سنخصّص الترندات بناءً على مجال نشاطك</p></>}
        {step === 2 && <><h2 className="text-xl font-bold">من أين يشتري عملاؤك؟</h2><p className="text-sm text-muted-foreground">يمكنك اختيار أكثر من سوق</p></>}
        {step === 3 && <><h2 className="text-xl font-bold">كيف تريد أن نُخبرك؟</h2><p className="text-sm text-muted-foreground">لا تفوّت أي ترند صاعد في مجالك</p></>}
        {step === 4 && <><h2 className="text-xl font-bold">اختر باقتك</h2><p className="text-sm text-muted-foreground">ابدأ بـ 14 يوم مجاناً على أي خطة</p></>}
      </div>

      {/* Step content */}
      <div className="min-h-[320px]">
        {step === 1 && <StoreInfoStep data={data} onChange={update} />}
        {step === 2 && <TargetMarketStep data={data} onChange={update} />}
        {step === 3 && <NotificationsStep data={data} onChange={update} />}
        {step === 4 && <ChoosePlanStep data={data} onChange={update} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          onClick={back}
          disabled={step === 1}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          السابق
        </Button>

        {step < STEPS.length ? (
          <Button
            onClick={next}
            disabled={!canProceed(step, data)}
            className="gap-2"
          >
            التالي
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={finish}
            disabled={!canProceed(step, data) || saving}
            className="gap-2 min-w-[140px]"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {saving ? "جاري الحفظ..." : "إنهاء الإعداد"}
          </Button>
        )}
      </div>
    </div>
  );
}
