"use client";

import { useState } from "react";
import { Copy, RefreshCw, Eye, EyeOff, Code2, Webhook, BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSubscription } from "@/hooks/use-subscription";

function maskKey(key: string) {
  return key.slice(0, 8) + "••••••••••••••••••••••••" + key.slice(-6);
}

export function ApiSettings() {
  const { plan } = useSubscription();
  const isEnterprise = plan === "ENTERPRISE";

  const [apiKey]        = useState("tzk_live_8f3a2b1c9d4e5f6a7b8c9d0e1f2a3b4c");
  const [showKey, setShowKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied]   = useState<"key" | "webhook" | null>(null);

  const copy = async (text: string, type: "key" | "webhook") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isEnterprise) {
    return (
      <Card className="rounded-3xl border border-border/60 bg-white/80 dark:bg-white/5 p-8 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#534AB7]/10 mx-auto">
          <Lock className="h-8 w-8 text-[#534AB7]" />
        </div>
        <div>
          <p className="text-lg font-bold">متاح في باقة Enterprise</p>
          <p className="text-sm text-muted-foreground mt-1">
            ترقّ إلى Enterprise للوصول إلى API وربط أنظمتك مباشرةً بـ TrendZone
          </p>
        </div>
        <Button className="rounded-2xl bg-[#534AB7] hover:bg-[#443da3] text-white">
          ترقية الباقة
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* API Key */}
      <Card className="rounded-3xl border border-border/60 bg-white/80 dark:bg-white/5 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-[#534AB7]" />
            <h3 className="font-bold">مفتاح API</h3>
          </div>
          <Badge className="border-none bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            نشط
          </Badge>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              readOnly
              value={showKey ? apiKey : maskKey(apiKey)}
              className="rounded-2xl bg-muted/50 font-mono text-sm pr-4"
              dir="ltr"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-2xl shrink-0"
            onClick={() => setShowKey((v) => !v)}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-2xl shrink-0"
            onClick={() => copy(apiKey, "key")}
          >
            {copied === "key" ? (
              <span className="text-xs text-emerald-600">✓</span>
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-2xl gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950">
            <RefreshCw className="h-3.5 w-3.5" />
            إعادة توليد المفتاح
          </Button>
          <p className="text-xs text-muted-foreground self-center">تحذير: إعادة التوليد تُبطل المفتاح القديم فوراً</p>
        </div>
      </Card>

      {/* Webhook */}
      <Card className="rounded-3xl border border-border/60 bg-white/80 dark:bg-white/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-[#534AB7]" />
          <h3 className="font-bold">Webhook URL</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          سيُرسَل POST request لهذا الـ URL عند اكتشاف أي ترند جديد مناسب لمتجرك.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="https://your-store.com/api/trendzone-webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="rounded-2xl bg-muted/50 flex-1"
            dir="ltr"
          />
          <Button
            className="shrink-0 rounded-2xl bg-[#534AB7] hover:bg-[#443da3] text-white"
            disabled={!webhookUrl}
          >
            حفظ
          </Button>
        </div>

        <div className="rounded-2xl bg-muted/50 p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">مثال على الـ Payload:</p>
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap" dir="ltr">{`{
  "event": "new_trend",
  "trend": {
    "id": "trend_xyz",
    "titleAr": "اسم الترند",
    "signalStrength": 92,
    "category": "FASHION",
    "peakDays": 4
  },
  "timestamp": "2025-01-01T10:00:00Z"
}`}</pre>
        </div>
      </Card>

      {/* Docs */}
      <Card className="rounded-3xl border border-[#534AB7]/20 bg-[#534AB7]/4 dark:bg-[#534AB7]/10 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-[#534AB7]" />
            <div>
              <p className="font-bold">توثيق API</p>
              <p className="text-sm text-muted-foreground">اقرأ الـ Docs الكاملة مع أمثلة كود بعدة لغات</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-2xl gap-2 shrink-0">
            <BookOpen className="h-4 w-4" />
            فتح الـ Docs
          </Button>
        </div>
      </Card>
    </div>
  );
}
