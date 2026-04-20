"use client";

import { Store, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingData } from "@/components/onboarding/onboarding-wizard";

const CATEGORIES = [
  { value: "FASHION",     emoji: "👗", label: "موضة وملابس"     },
  { value: "BEAUTY",      emoji: "💄", label: "جمال وعناية"     },
  { value: "ELECTRONICS", emoji: "📱", label: "إلكترونيات"      },
  { value: "HOME",        emoji: "🏠", label: "منزل وديكور"     },
  { value: "FOOD",        emoji: "🍔", label: "طعام ومشروبات"   },
  { value: "FITNESS",     emoji: "💪", label: "لياقة ورياضة"    },
  { value: "KIDS",        emoji: "🧸", label: "أطفال وألعاب"    },
  { value: "OTHER",       emoji: "🛍️", label: "أخرى"           },
];

interface Props {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function StoreInfoStep({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="store-name">اسم المتجر *</Label>
        <div className="relative">
          <Store className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="store-name"
            value={data.storeName}
            onChange={(e) => onChange({ storeName: e.target.value })}
            placeholder="مثال: متجر الأناقة"
            className="pr-10"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="store-url">
          رابط المتجر <span className="text-muted-foreground font-normal">(اختياري)</span>
        </Label>
        <div className="relative">
          <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="store-url"
            type="url"
            value={data.storeUrl}
            onChange={(e) => onChange({ storeUrl: e.target.value })}
            placeholder="https://mystore.com"
            className="pr-10"
            dir="ltr"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>تصنيف المتجر *</Label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(({ value, emoji, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ storeCategory: value as any })}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-sm font-medium text-right transition-all ${
                data.storeCategory === value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <span className="text-xl">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
