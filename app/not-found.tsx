import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-background">
      <div className="space-y-6 max-w-md">
        <div className="text-8xl font-black text-[#534AB7]/20 select-none">404</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold">الصفحة غير موجودة</h1>
          <p className="text-muted-foreground">
            يبدو أن الصفحة التي تبحث عنها لم تعد موجودة أو تم نقلها.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#534AB7] px-6 py-3 text-sm font-semibold text-white hover:bg-[#443da3] transition-colors"
        >
          العودة للوحة التحكم
        </Link>
      </div>
    </div>
  );
}
