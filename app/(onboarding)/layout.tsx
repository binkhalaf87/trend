import { TrendingUp } from "lucide-react";
import Link from "next/link";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="h-16 flex items-center justify-center border-b bg-background">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          TrendZone
        </Link>
      </header>
      <main className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-xl">{children}</div>
      </main>
    </div>
  );
}
