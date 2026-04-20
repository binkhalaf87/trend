import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, TrendingUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIST, type PlanId } from "@/lib/stripe/plans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "الأسعار — TrendZone" };

const PLAN_ICON_BG: Record<PlanId, string> = {
  STARTER:    "bg-blue-500/10 text-blue-600",
  GROWTH:     "bg-primary/10 text-primary",
  ENTERPRISE: "bg-purple-500/10 text-purple-600",
};

const FAQ = [
  { q: "هل يمكنني إلغاء اشتراكي في أي وقت؟", a: "نعم، يمكنك الإلغاء في أي وقت دون رسوم إضافية. ستستمر في الاستفادة حتى نهاية الفترة المدفوعة." },
  { q: "هل هناك فترة تجريبية مجانية؟", a: "نعم! كل الباقات تأتي بـ 14 يوم مجانياً — لا يلزم بطاقة ائتمان لبدء التجربة." },
  { q: "ما طرق الدفع المقبولة؟", a: "نقبل جميع بطاقات الائتمان العالمية (Visa, Mastercard, Amex) عبر Stripe." },
  { q: "هل يمكن الترقية أو التخفيض بين الباقات؟", a: "بالتأكيد. يمكنك تغيير باقتك في أي وقت من لوحة التحكم، والفرق في السعر يُحسب بالتناسب." },
  { q: "كيف تُحدَّث الترندات؟", a: "ترصد منصتنا ترندات جديدة كل ساعة من Google Trends وTikTok وReddit وPinterest." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-40 glass">
        <div className="container h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            TrendZone
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild><Link href="/login">دخول</Link></Button>
            <Button size="sm" asChild><Link href="/register">ابدأ مجاناً</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 text-center space-y-4">
        <Badge variant="secondary" className="text-sm px-4 py-1">
          🎁 تجربة مجانية 14 يوماً على جميع الباقات
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          اختر الباقة المناسبة لمتجرك
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          ابدأ مجاناً وانتقل للخطة المدفوعة عندما تصبح جاهزاً. لا تعقيدات، لا رسوم خفية.
        </p>
      </section>

      {/* Plans grid */}
      <section className="container pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLAN_LIST.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border-2 bg-card p-6 flex flex-col",
                plan.badge ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" : "border-border"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <Badge className="text-xs px-3 py-1">{plan.badge}</Badge>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-lg", PLAN_ICON_BG[plan.id])}>
                  {plan.id === "STARTER" ? "⚡" : plan.id === "GROWTH" ? "👑" : "🏢"}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{plan.nameAr}</h3>
                  <p className="text-sm text-muted-foreground">{plan.descriptionAr}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{plan.priceSAR}</span>
                  <span className="text-muted-foreground">ر.س<span className="text-xs">/شهر</span></span>
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 text-sm">
                    {f.included
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      : <XCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
                    <span className={cn(!f.included && "text-muted-foreground/50")}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.badge ? "default" : "outline"}
                className="w-full gap-2"
                asChild
              >
                <Link href={`/register?plan=${plan.id}`}>
                  ابدأ تجربة مجانية
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          جميع الأسعار بالريال السعودي، شاملة الضريبة المضافة. يمكن الدفع بالدولار الأمريكي عبر Stripe.
        </p>
      </section>

      {/* FAQ */}
      <section className="border-t">
        <div className="container py-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">الأسئلة الشائعة</h2>
          <div className="space-y-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="space-y-2">
                <h3 className="font-semibold text-sm">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-gradient text-white py-16 text-center">
        <div className="container space-y-4 max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold">جاهز لاكتشاف الترند التالي؟</h2>
          <p className="text-white/80">ابدأ بتجربة مجانية 14 يوماً — بدون بطاقة ائتمان.</p>
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <Link href="/register">
              أنشئ حسابك المجاني
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} TrendZone. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}
