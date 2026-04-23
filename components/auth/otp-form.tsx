"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { Loader2, ArrowRight, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { getAuthCallbackUrl } from "@/lib/site-url";

interface OtpFormProps {
  email: string;
  flow: "login" | "register";
  name?: string;
  onBack: () => void;
}

export function OtpForm({ email, flow, name, onBack }: OtpFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    // تحقق تلقائي عند اكتمال الـ 6 أرقام
    if (next.every((d) => d) && val) {
      verifyCode(next.join(""));
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      verifyCode(text);
    }
  };

  const verifyCode = async (code: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (error) throw error;

      const syncResponse = await fetch("/api/auth/sync-user", {
        method: "POST",
      });

      if (!syncResponse.ok) {
        throw new Error("Failed to sync signed-in user");
      }

      const { redirectTo } = (await syncResponse.json()) as {
        redirectTo?: string;
      };

      router.replace(redirectTo ?? "/dashboard");
      router.refresh();
    } catch (err: any) {
      toast({
        title: "رمز خاطئ",
        description: err?.message ?? "يرجى التحقق من الرمز والمحاولة مجدداً",
        variant: "destructive",
      });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: flow === "register",
          emailRedirectTo: getAuthCallbackUrl(),
          ...(flow === "register" && name?.trim()
            ? { data: { name: name.trim() } }
            : {}),
        },
      });
      if (error) throw error;
      toast({ title: "تم إعادة الإرسال", description: "تحقق من بريدك الإلكتروني" });
    } catch {
      toast({ title: "خطأ", description: "فشل إعادة الإرسال", variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <MailCheck className="h-7 w-7 text-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold">تحقق من بريدك</h2>
        <p className="text-sm text-muted-foreground mt-1">
          أرسلنا رمز مكوّن من 6 أرقام إلى
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {/* OTP inputs */}
      <div className="flex justify-center gap-2" dir="ltr" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="h-12 w-11 rounded-lg border-2 bg-background text-center text-lg font-bold outline-none transition-colors focus:border-primary disabled:opacity-50"
            disabled={loading}
          />
        ))}
      </div>

      <Button
        className="w-full gap-2"
        onClick={() => verifyCode(otp.join(""))}
        disabled={otp.some((d) => !d) || loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        تأكيد الدخول
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors"
          onClick={onBack}
        >
          ← تغيير البريد
        </button>
        <button
          type="button"
          className="text-primary hover:underline disabled:opacity-50"
          onClick={resendOtp}
          disabled={resending}
        >
          {resending ? "جاري الإرسال..." : "إعادة إرسال الرمز"}
        </button>
      </div>
    </div>
  );
}
