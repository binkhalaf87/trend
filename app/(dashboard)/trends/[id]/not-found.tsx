import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrendNotFound() {
  return (
    <div className="rounded-[32px] border border-dashed border-[#534AB7]/20 bg-white/75 px-6 py-14 text-center shadow-[0_18px_40px_rgba(15,23,42,0.04)] dark:border-[#534AB7]/25 dark:bg-white/5">
      <h1 className="text-3xl font-extrabold">هذا الترند غير متوفر</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
        ربما تم حذفه أو انتهت صلاحيته، أو أن الرابط غير صحيح. يمكنك الرجوع لقائمة الترندات
        واستكشاف أحدث الفرص النشطة الآن.
      </p>
      <Button asChild className="mt-6 rounded-full bg-[#534AB7] px-5 text-white hover:bg-[#4d44ad]">
        <Link href="/trends">
          <Compass className="h-4 w-4" />
          العودة إلى الترندات
        </Link>
      </Button>
    </div>
  );
}
