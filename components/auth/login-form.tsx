"use client";

import { useState } from "react";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "@/components/auth/google-button";
import { OtpForm } from "@/components/auth/otp-form";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { getAuthCallbackUrl } from "@/lib/site-url";

type Step = "email" | "otp";

export function LoginForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: getAuthCallbackUrl(),
        },
      });
      if (error) {
        // إذا لم يكن المستخدم موجوداً
        if (error.message.toLowerCase().includes("not found") || error.message.includes("signup")) {
          toast({
            title: "لا يوجد حساب",
            description: "هذا البريد غير مسجل. أنشئ حساباً جديداً.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }
      setStep("otp");
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.message ?? "فشل إرسال رمز التحقق",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return <OtpForm email={email} flow="login" onBack={() => setStep("email")} />;
  }

  return (
    <div className="space-y-5">
      <GoogleButton label="الدخول بحساب Google" />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">أو بالبريد الإلكتروني</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={sendOtp} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
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
        <Button type="submit" disabled={loading || !email} className="w-full gap-2 h-11">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
          إرسال رمز الدخول
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        سنرسل رمزاً مكوّناً من 6 أرقام إلى بريدك — بدون كلمة مرور 🔐
      </p>
    </div>
  );
}
