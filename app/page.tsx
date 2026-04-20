import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Zap,
  Globe,
  BarChart3,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "اكتشاف مبكر للترندات",
    desc: "نرصد الترندات من Reddit وTwitter وGoogle قبل أن تنتشر بـ 72 ساعة",
  },
  {
    icon: Zap,
    title: "محتوى جاهز فوري",
    desc: "توليد بوستات ووصف منتجات وإعلانات بالعربي في ثوانٍ",
  },
  {
    icon: Globe,
    title: "تغطية السوق العربي",
    desc: "مخصص للسعودية والإمارات ومصر والكويت وكل السوق العربي",
  },
  {
    icon: BarChart3,
    title: "تحليلات وتنبيهات",
    desc: "تنبيهات فورية عند ارتفاع ترند في مجال متجرك",
  },
];

const PLANS = [
  {
    name: "مجاني",
    price: "0",
    features: ["5 ترندات يومياً", "10 محتوى شهرياً", "تنبيهات أسبوعية"],
    cta: "ابدأ مجاناً",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "199",
    badge: "الأكثر شيوعاً",
    features: [
      "ترندات غير محدودة",
      "200 محتوى شهرياً",
      "تنبيهات فورية",
      "تحليلات متقدمة",
    ],
    cta: "ابدأ تجربة مجانية",
    variant: "default" as const,
  },
  {
    name: "Enterprise",
    price: "599",
    features: [
      "كل مميزات Pro",
      "API access",
      "دعم مخصص",
      "تقارير أسبوعية",
    ],
    cta: "تواصل معنا",
    variant: "outline" as const,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span>TrendZone</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">المميزات</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">الأسعار</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">ابدأ مجاناً</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 text-center space-y-6 animate-fade-in">
        <Badge variant="secondary" className="text-sm px-4 py-1">
          🚀 اكتشف الترندات قبل المنافسين بـ 72 ساعة
        </Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance leading-tight">
          حوّل الترندات إلى
          <span className="text-primary"> مبيعات </span>
          لمتجرك
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground text-balance">
          TrendZone ترصد الترندات التجارية الصاعدة وتولّد لك محتوى عربياً جاهزاً
          للنشر على متجرك ومنصاتك الاجتماعية — كل شيء في مكان واحد.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/register">
              ابدأ مجاناً الآن
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard">عرض تجريبي</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-12">لماذا TrendZone؟</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border bg-card p-6 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-4">اختر خطتك</h2>
        <p className="text-center text-muted-foreground mb-12">
          ابدأ مجاناً، وانتقل للخطة المدفوعة عندما تكبر أعمالك
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border bg-card p-6 space-y-4 relative ${
                plan.badge ? "border-primary shadow-lg" : ""
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 right-1/2 translate-x-1/2">
                  {plan.badge}
                </Badge>
              )}
              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground">ر.س/شهر</span>
                </div>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.variant} className="w-full" asChild>
                <Link href="/register">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} TrendZone. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
