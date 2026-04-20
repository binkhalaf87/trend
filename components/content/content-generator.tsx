"use client";

import { useState } from "react";
import { Wand2, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const CONTENT_TYPES = [
  { value: "SOCIAL_POST", label: "بوست سوشيال ميديا" },
  { value: "PRODUCT_DESCRIPTION", label: "وصف منتج" },
  { value: "AD_COPY", label: "إعلان مدفوع" },
  { value: "EMAIL", label: "رسالة بريد إلكتروني" },
  { value: "BLOG_EXCERPT", label: "مقتطف مدونة" },
];

const PLATFORMS = ["Instagram", "TikTok", "Twitter/X", "Snapchat", "LinkedIn"];
const TONES = ["احترافي", "مرح وعفوي", "تحفيزي", "عاطفي", "إخباري"];

export function ContentGenerator() {
  const [type, setType] = useState("SOCIAL_POST");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("احترافي");
  const [customPrompt, setCustomPrompt] = useState("");
  const [result, setResult] = useState<{ title?: string; body: string; hashtags: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, platform, tone, customPrompt }),
      });
      if (!res.ok) throw new Error("فشل التوليد");
      const data = await res.json();
      setResult({ title: data.titleAr, body: data.bodyAr, hashtags: data.hashtags });
    } catch {
      toast({ title: "خطأ", description: "فشل توليد المحتوى، يرجى المحاولة مجدداً.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    const text = [result.title, result.body, result.hashtags.join(" ")].filter(Boolean).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">إعدادات المحتوى</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">نوع المحتوى</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={type === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setType(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">المنصة</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <Button key={p} variant={platform === p ? "secondary" : "outline"} size="sm" onClick={() => setPlatform(p)}>
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">نبرة الكتابة</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <Button key={t} variant={tone === t ? "secondary" : "outline"} size="sm" onClick={() => setTone(t)}>
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">تعليمات إضافية (اختياري)</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="مثال: ركّز على عرض خصم 20%..."
              rows={3}
              className="w-full rounded-lg border bg-background p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button onClick={generate} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? "جاري التوليد..." : "ولّد المحتوى"}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">المحتوى المُولَّد</CardTitle>
          {result && (
            <Button variant="outline" size="sm" onClick={copy} className="gap-1">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "تم النسخ" : "نسخ"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!result ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
              سيظهر المحتوى هنا بعد التوليد
            </div>
          ) : (
            <div className="space-y-3">
              {result.title && <p className="font-semibold">{result.title}</p>}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.body}</p>
              {result.hashtags.length > 0 && (
                <p className="text-sm text-primary">{result.hashtags.join(" ")}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
