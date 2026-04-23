"use client";

import { useState } from "react";
import { Loader2, Mail, User, Store, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "@/components/auth/google-button";
import { OtpForm } from "@/components/auth/otp-form";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { getAuthCallbackUrl } from "@/lib/site-url";

type Step = "form" | "otp";

export function RegisterForm() {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          data: { name: name.trim() },
          emailRedirectTo: getAuthCallbackUrl(),
        },
      });
      if (error) throw error;
      setStep("otp");
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.message ?? "فشل إنشاء الحساب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return <OtpForm email={email} flow="register" name={name} onBack={() => setStep("form")} />;
  }

  return (
    <div className="space-y-5">
      <GoogleButton label="التسجيل بحساب Google" />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">أو بالبريد الإلكتروني</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="reg-name">اسمك الكامل</Label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="محمد الأحمد"
              required
              className="pr-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-email">البريد الإلكتروني</Label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="pr-10"
              dir="ltr"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !email || !name}
          className="w-full gap-2 h-11"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
          إنشاء الحساب مجاناً
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        بالتسجيل أنت توافق على{" "}
        <a href="/terms" className="text-primary hover:underline">شروط الاستخدام</a>
        {" "}و{" "}
        <a href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</a>
      </p>
    </div>
  );
}
