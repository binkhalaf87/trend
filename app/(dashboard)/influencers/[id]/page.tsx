import { Metadata } from "next";
import { InfluencerDetail } from "@/components/influencers/influencer-detail";
import { MOCK_INFLUENCERS } from "@/lib/utils/mock-data";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const inf = MOCK_INFLUENCERS.find((i) => i.id === params.id);
  return { title: inf ? `${inf.name} — مؤثر` : "مؤثر" };
}

export default function InfluencerDetailPage({ params }: Props) {
  const influencer = MOCK_INFLUENCERS.find((i) => i.id === params.id);
  if (!influencer) notFound();
  return <InfluencerDetail influencer={influencer} />;
}
