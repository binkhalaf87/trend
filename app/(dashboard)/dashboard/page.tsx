import { Metadata } from "next";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TrendCard } from "@/components/trends/trend-card";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileText, Bell, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { MOCK_TRENDS } from "@/lib/utils/mock-data";

export const metadata: Metadata = { title: "لوحة التحكم" };

const STATS = [
  {
    title: "الترندات النشطة",
    value: "47",
    change: "+12%",
    trend: "up" as const,
    icon: TrendingUp,
    description: "مقارنة بالأسبوع الماضي",
  },
  {
    title: "المحتوى المُولَّد",
    value: "183",
    change: "+28%",
    trend: "up" as const,
    icon: FileText,
    description: "هذا الشهر",
  },
  {
    title: "التنبيهات غير المقروءة",
    value: "6",
    change: "جديد",
    trend: "neutral" as const,
    icon: Bell,
    description: "آخر 24 ساعة",
  },
  {
    title: "معدل التفاعل",
    value: "8.4x",
    change: "+3.2x",
    trend: "up" as const,
    icon: ArrowUpRight,
    description: "مقارنة بالمحتوى العادي",
  },
];

export default function DashboardPage() {
  const topTrends = MOCK_TRENDS.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-1">
          مرحباً! هذه آخر الترندات الصاعدة في مجال متجرك.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Top Trends */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">أبرز الترندات اليوم</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/trends" className="gap-1">
              عرض الكل
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {topTrends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      </div>
    </div>
  );
}
