import { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Sparkles, BarChart3, Bell } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "تسجيل الدخول" };

const HIGHLIGHTS = [
  { icon: TrendingUp, text: "اكتشف الترندات قبل 72 ساعة" },
  { icon: Sparkles,   text: "محتوى عربي جاهز في ثوانٍ" },
  { icon: BarChart3,  text: "تحليلات السوق الخليجي" },
  { icon: Bell,       text: "تنبيهات فورية بواتساب" },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Right panel — brand (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-gradient flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/30"
              style={{
                width: `${Math.random() * 200 + 50}px`,
                height: `${Math.random() * 200 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl">TrendZone</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold leading-tight">
              حوّل الترندات
              <br />
              إلى مبيعات 🚀
            </h1>
            <p className="text-white/80 text-lg">
              اكتشف ما يبحث عنه السوق الخليجي اليوم قبل أن يصل للمنافسين.
            </p>
          </div>

          <div className="space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-white/90 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/50 text-xs">
          © {new Date().getFullYear()} TrendZone. جميع الحقوق محفوظة.
        </p>
      </div>

      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <div className="h-12 w-12 rounded-2xl bg-brand-gradient flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold">أهلاً بعودتك 👋</h2>
            <p className="text-muted-foreground text-sm">
              سجّل دخولك لعرض آخر الترندات الصاعدة في مجالك
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              أنشئه مجاناً الآن
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
