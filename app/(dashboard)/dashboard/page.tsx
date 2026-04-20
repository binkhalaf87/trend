import { Metadata } from "next";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  FileText, 
  Bell, 
  ArrowLeft,
  ArrowUpRight, 
  Users, 
  Zap, 
  Clock, 
  LayoutDashboard,
  Settings,
  CreditCard,
  MoreVertical,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { MOCK_TRENDS } from "@/lib/utils/mock-data";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "لوحة التحكم" };

const STATS = [
  {
    title: "الترندات النشطة",
    value: "128",
    change: "+14%",
    trend: "up" as const,
    icon: TrendingUp,
    description: "مقارنة بالأسبوع الماضي",
  },
  {
    title: "التنبيهات غير المقروءة",
    value: "12",
    change: "جديد",
    trend: "neutral" as const,
    icon: Bell,
    description: "آخر 24 ساعة",
  },
  {
    title: "محتوى جاهز للنشر",
    value: "45",
    change: "جاهز",
    trend: "neutral" as const,
    icon: Zap,
    description: "تم توليده بواسطة AI",
  },
  {
    title: "نسبة النمو",
    value: "24.8%",
    change: "+5.2%",
    trend: "up" as const,
    icon: ArrowUpRight,
    description: "نمو التفاعل هذا الأسبوع",
  },
];

const ALERTS = [
  { id: 1, title: "ترند جديد في العناية بالبشرة", time: "منذ دقيقتين", type: "critical", color: "text-red-500" },
  { id: 2, title: "ارتفاع في البحث عن 'عبايات صيفية'", time: "منذ ساعة", type: "high", color: "text-orange-500" },
  { id: 3, title: "اكتمال توليد محتوى 'ساعات ذكية'", time: "منذ 3 ساعات", type: "info", color: "text-blue-500" },
];

export default function DashboardPage() {
  const topTrends = MOCK_TRENDS.slice(0, 4);
  const featuredInfluencer = {
    name: "سارة المودة",
    handle: "@sara_almoda",
    followers: "420K",
    engagement: "6.8%",
    price: "2000-5000 ر.س",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  };

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 dark:border-white/10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#534AB7] flex items-center justify-center text-white shadow-lg shadow-[#534AB7]/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold font-cairo">متجر الأناقة</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="bg-[#534AB7]/10 text-[#534AB7] hover:bg-[#534AB7]/20 border-none">باقة النمو (Pro)</Badge>
              <span className="text-xs text-muted-foreground">تجديد خلال 12 يوم</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Button variant="outline" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 border-2 border-background rounded-full" />
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 p-1 pl-3 rounded-full hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>MA</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline-block">محمد أحمد</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
              <DropdownMenuItem>الإعدادات</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">تسجيل الخروج</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.title} className="bg-card p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                <stat.icon className={cn("h-5 w-5", stat.title === "نسبة النمو" ? "text-green-500" : "text-[#534AB7]")} />
              </div>
              <span className={cn("text-xs font-bold px-2 py-1 rounded-full", 
                stat.trend === "up" ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600"
              )}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-sm text-muted-foreground font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Hot Trends - Span 2 Columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#534AB7]" />
              الترندات الساخنة لمتجرك
            </h2>
            <Button variant="link" asChild className="text-[#534AB7]">
              <Link href="/trends">مشاهدة الجميع</Link>
            </Button>
          </div>
          
          <div className="space-y-3">
            {topTrends.map((trend, index) => (
              <div key={trend.id} className="bg-card p-5 rounded-2xl border flex flex-col md:flex-row md:items-center gap-6 group hover:border-[#534AB7]/50 transition-colors">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className={cn("border-none", 
                      index === 0 ? "bg-[#534AB7]" : index === 1 ? "bg-green-500" : "bg-orange-500"
                    )}>
                      {index === 0 ? "ساخن" : index === 1 ? "صاعد" : "جديد"}
                    </Badge>
                    <h3 className="font-bold">{trend.titleAr}</h3>
                    <span className="text-xs text-muted-foreground">{trend.category}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span>قوة الإشارة</span>
                      <span className="font-bold">{trend.signalStrength}%</span>
                    </div>
                    <Progress value={trend.signalStrength} className="h-1.5 bg-accent" indicatorColor="bg-[#534AB7]" />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> الذروة: خلال 3 أيام</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 18K تفاعل</span>
                  </div>
                </div>
                <Button className="bg-[#534AB7] hover:bg-[#534AB7]/90 text-white rounded-xl gap-2 shadow-lg shadow-[#534AB7]/20 transition-all active:scale-95">
                  ابدأ الخطة
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-8">
          {/* Suggested Influencer */}
          <div className="bg-[#534AB7] rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-4">
              <h2 className="text-lg font-bold">مؤثر مقترح</h2>
              <p className="text-white/80 text-xs">الأفضل لترند "عبايات الفراشة"</p>
              <div className="flex items-center gap-4 py-2">
                <Avatar className="h-14 w-14 border-2 border-white/20">
                  <AvatarImage src={featuredInfluencer.image} />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{featuredInfluencer.name}</p>
                  <p className="text-xs text-white/60">{featuredInfluencer.handle}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 p-2 rounded-lg text-center">
                  <p className="opacity-60">متابعين</p>
                  <p className="font-bold">{featuredInfluencer.followers}</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg text-center">
                  <p className="opacity-60">تفاعل</p>
                  <p className="font-bold">{featuredInfluencer.engagement}</p>
                </div>
              </div>
              <Button className="w-full bg-white text-[#534AB7] hover:bg-white/90 font-bold rounded-xl gap-2 transition-transform active:scale-[0.98]">
                <MessageSquare className="h-4 w-4" />
                تواصل معه
              </Button>
            </div>
          </div>

          {/* Latest Alerts */}
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h2 className="font-bold flex items-center justify-between">
              آخر التنبيهات
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </h2>
            <div className="space-y-4">
              {ALERTS.map((alert) => (
                <div key={alert.id} className="flex gap-3 text-sm group cursor-pointer">
                  <div className={cn("mt-1 shrink-0", alert.color)}>
                    <div className="h-2 w-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                  </div>
                  <Link href="/alerts" className="space-y-1 flex-1">
                    <p className="font-medium group-hover:text-[#534AB7] transition-colors leading-tight">{alert.title}</p>
                    <p className="text-[10px] text-muted-foreground">{alert.time}</p>
                  </Link>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full text-xs rounded-xl" asChild>
              <Link href="/alerts">عرض جميع الإشعارات</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t md:hidden flex justify-around p-3 z-50">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#534AB7]">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </Link>
        <Link href="/trends" className="flex flex-col items-center gap-1 text-muted-foreground">
          <TrendingUp className="h-5 w-5" />
          <span className="text-[10px]">الترندات</span>
        </Link>
        <Link href="/content" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Zap className="h-5 w-5" />
          <span className="text-[10px]">المحتوى</span>
        </Link>
        <Link href="/alerts" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="text-[10px]">التنبيهات</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Settings className="h-5 w-5" />
          <span className="text-[10px]">الإعدادات</span>
        </Link>
      </nav>
    </div>
  );
}
