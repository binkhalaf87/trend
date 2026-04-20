import { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "إنشاء حساب مجاني" };

const BENEFITS = [
  "14 يوم تجريبي مجاني — بدون بطاقة ائتمان",
  "اكتشاف ترندات حصرية للسوق الخليجي",
  "محتوى عربي جاهز للنشر فوراً",
  "تنبيهات مخصصة لمجال متجرك",
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Right panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-gradient flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl">TrendZone</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <div className="inline-block bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium">
              🎁 تجربة مجانية 14 يوماً
            </div>
            <h1 className="text-4xl font-extrabold leading-tight">
              ابدأ رحلتك
              <br />
              نحو المبيعات 📈
            </h1>
            <p className="text-white/80">
              انضم لـ +2,400 تاجر يستخدمون TrendZone لاكتشاف الفرص مبكراً.
            </p>
          </div>

          <ul className="space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-white/90" />
                <span className="text-white/80 text-sm">{b}</span>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex -space-x-2 space-x-reverse">
              {["م", "س", "ع", "ن"].map((letter) => (
                <div
                  key={letter}
                  className="h-8 w-8 rounded-full bg-white/30 border-2 border-white/20 flex items-center justify-center text-xs font-bold"
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-xs text-white/80">
              <strong className="text-white">+2,400</strong> تاجر انضموا هذا الشهر
            </p>
          </div>
        </div>

        <p className="relative z-10 text-white/50 text-xs">
          © {new Date().getFullYear()} TrendZone.
        </p>
      </div>

      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center">
            <div className="h-12 w-12 rounded-2xl bg-brand-gradient flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold">أنشئ حسابك مجاناً ✨</h2>
            <p className="text-muted-foreground text-sm">
              14 يوم تجريبي كامل — لا يلزم بطاقة ائتمان
            </p>
          </div>

          <RegisterForm />

          <p className="text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              سجّل دخولك
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
