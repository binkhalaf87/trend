import { Metadata } from "next";
import { TrendCard } from "@/components/trends/trend-card";
import { TrendFilter } from "@/components/trends/trend-filter";
import { MOCK_TRENDS } from "@/lib/utils/mock-data";

export const metadata: Metadata = { title: "الترندات" };

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الترندات</h1>
        <p className="text-muted-foreground mt-1">
          استكشف الترندات الصاعدة في السوق العربي — محدّثة كل ساعة.
        </p>
      </div>

      <TrendFilter />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_TRENDS.map((trend) => (
          <TrendCard key={trend.id} trend={trend} showActions />
        ))}
      </div>
    </div>
  );
}
