import Link from "next/link";
import { Compass, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrendEmptyState() {
  return (
    <div className="rounded-[32px] border border-dashed border-[#534AB7]/20 bg-white/75 px-6 py-12 text-center shadow-[0_18px_40px_rgba(15,23,42,0.04)] dark:border-[#534AB7]/25 dark:bg-white/5">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#534AB7]/10 text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff]">
        <SearchX className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-2xl font-extrabold">ما لقينا ترندات مناسبة الآن</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
        هذا شيء طبيعي أحيانًا مع الفلاتر الضيقة. جرّب توسيع الفئة أو العودة إلى ترتيب
        الأقوى حتى تظهر لك فرص أكثر مرتبطة بالسوق.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-full bg-[#534AB7] px-5 text-white hover:bg-[#4d44ad]">
          <Link href="/trends">
            <Compass className="h-4 w-4" />
            استعرض كل الفئات
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full border-[#534AB7]/20 hover:bg-[#534AB7]/6">
          <Link href="/settings">وسّع فئات متجرك</Link>
        </Button>
      </div>
    </div>
  );
}
