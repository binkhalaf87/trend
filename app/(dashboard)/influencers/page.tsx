import { Metadata } from "next";
import { InfluencersList } from "@/components/influencers/influencers-list";

export const metadata: Metadata = { title: "المشاهير والمؤثرون" };

export default function InfluencersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">المشاهير والمؤثرون</h1>
        <p className="text-muted-foreground mt-1">
          اعثر على المؤثر المناسب لترندك وابدأ تعاوناً ناجحاً.
        </p>
      </div>
      <InfluencersList />
    </div>
  );
}
