"use client";

import { cn } from "@/lib/utils";
import type { OnboardingData } from "@/components/onboarding/onboarding-wizard";

const MARKETS = [
  { value: "SA",   flag: "🇸🇦", name: "السعودية",         sub: "أكبر سوق خليجي" },
  { value: "AE",   flag: "🇦🇪", name: "الإمارات",          sub: "دبي وأبوظبي" },
  { value: "KW",   flag: "🇰🇼", name: "الكويت",            sub: "قوة شرائية عالية" },
  { value: "QA",   flag: "🇶🇦", name: "قطر",               sub: "سوق ثري" },
  { value: "BH",   flag: "🇧🇭", name: "البحرين",           sub: "مركز تسوق" },
  { value: "OM",   flag: "🇴🇲", name: "عُمان",             sub: "سوق نامٍ" },
  { value: "EG",   flag: "🇪🇬", name: "مصر",               sub: "أكبر سوق عربي" },
  { value: "GULF", flag: "🌍", name: "الخليج كله",         sub: "KSA + UAE + KW + أكثر" },
  { value: "ARAB", flag: "🌐", name: "الوطن العربي كله",   sub: "تغطية شاملة" },
];

interface Props {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function TargetMarketStep({ data, onChange }: Props) {
  const toggleMarket = (value: string) => {
    const current = data.targetMarkets;
    // GULF و ARAB تُلغي الاختيارات الفردية
    if (value === "GULF" || value === "ARAB") {
      onChange({ targetMarkets: current.includes(value) ? [] : [value] });
      return;
    }
    // إزالة GULF/ARAB عند اختيار دولة محددة
    const filtered = current.filter((m) => m !== "GULF" && m !== "ARAB");
    if (filtered.includes(value)) {
      onChange({ targetMarkets: filtered.filter((m) => m !== value) });
    } else {
      onChange({ targetMarkets: [...filtered, value] });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        اختر السوق الذي يستهدفه متجرك — سنُخصّص الترندات والمحتوى بناءً على ذلك.
      </p>

      <div className="grid grid-cols-1 gap-2">
        {MARKETS.map(({ value, flag, name, sub }) => {
          const selected = data.targetMarkets.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggleMarket(value)}
              className={cn(
                "flex items-center gap-4 p-3.5 rounded-xl border-2 text-right transition-all",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <span className="text-2xl">{flag}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium text-sm", selected && "text-primary")}>{name}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
              <div
                className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  selected ? "border-primary bg-primary" : "border-border"
                )}
              >
                {selected && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
