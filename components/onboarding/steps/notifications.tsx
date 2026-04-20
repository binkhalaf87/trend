"use client";

import { Bell, Mail, MessageCircle, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "@/components/onboarding/onboarding-wizard";

const CHANNELS = [
  {
    id: "EMAIL",
    icon: Mail,
    title: "البريد الإلكتروني",
    desc: "تنبيهات يومية وملخص أسبوعي",
    alwaysOn: true,
  },
  {
    id: "WHATSAPP",
    icon: MessageCircle,
    title: "واتساب",
    desc: "تنبيهات فورية على هاتفك",
    alwaysOn: false,
    requiresPlan: "GROWTH",
  },
  {
    id: "PUSH",
    icon: Smartphone,
    title: "إشعار المتصفح",
    desc: "نافذة منبثقة عند صعود ترند مهم",
    alwaysOn: false,
    requiresPlan: "GROWTH",
  },
];

interface Props {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function NotificationsStep({ data, onChange }: Props) {
  const toggleChannel = (id: string) => {
    const current = data.alertChannels;
    if (current.includes(id)) {
      onChange({ alertChannels: current.filter((c) => c !== id) });
    } else {
      onChange({ alertChannels: [...current, id] });
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        اختر كيف تريد أن نُخبرك عند اكتشاف ترند جديد في مجالك.
      </p>

      <div className="space-y-3">
        {CHANNELS.map(({ id, icon: Icon, title, desc, alwaysOn, requiresPlan }) => {
          const isOn = alwaysOn || data.alertChannels.includes(id);

          return (
            <div
              key={id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                isOn ? "border-primary bg-primary/5" : "border-border",
                alwaysOn && "opacity-80"
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  isOn ? "bg-primary/15" : "bg-muted"
                )}
              >
                <Icon className={cn("h-5 w-5", isOn ? "text-primary" : "text-muted-foreground")} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{title}</p>
                  {requiresPlan && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Growth+
                    </span>
                  )}
                  {alwaysOn && (
                    <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                      مجاني دائماً
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>

              <button
                type="button"
                disabled={alwaysOn}
                onClick={() => toggleChannel(id)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors shrink-0",
                  isOn ? "bg-primary" : "bg-muted",
                  alwaysOn && "cursor-not-allowed"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-4 w-4 rounded-full bg-white transition-all shadow-sm",
                    isOn ? "left-6" : "left-1"
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* WhatsApp number input */}
      {data.alertChannels.includes("WHATSAPP") && (
        <div className="space-y-1.5 animate-fade-in">
          <Label htmlFor="whatsapp">رقم واتساب</Label>
          <Input
            id="whatsapp"
            type="tel"
            value={data.whatsappNumber}
            onChange={(e) => onChange({ whatsappNumber: e.target.value })}
            placeholder="+966 5X XXX XXXX"
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">سيُفعَّل بعد اختيار باقة Growth أو أعلى</p>
        </div>
      )}
    </div>
  );
}
