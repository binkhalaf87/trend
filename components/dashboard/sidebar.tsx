"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Bell,
  Settings,
  Sparkles,
  LogOut,
  ChevronLeft,
  MessageSquareShare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/trends",    label: "الترندات",    icon: TrendingUp },
  { href: "/content",   label: "المحتوى",     icon: FileText },
  { href: "/alerts",    label: "التنبيهات",   icon: Bell },
  { href: "/settings",  label: "الإعدادات",   icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const storeName = user?.storeName ?? "TrendZone Store";
  const storeCategory = user?.storeCategory ?? "OTHER";

  return (
    <>
      <aside className="sticky top-0 hidden min-h-screen border-l border-white/10 bg-white/80 px-5 py-6 backdrop-blur-xl dark:bg-[#121020]/85 md:flex md:flex-col">
        <div className="mb-8 flex items-center gap-3 rounded-[28px] bg-brand-gradient px-4 py-4 text-white shadow-[0_18px_45px_rgba(83,74,183,0.28)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold tracking-tight">TrendZone</p>
            <p className="truncate text-xs text-white/75">لوحة نمو ذكية لمتجرك</p>
          </div>
        </div>

        <div className="mb-6 rounded-[28px] border border-white/50 bg-white/70 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5">
          <p className="text-xs text-muted-foreground">المتجر الحالي</p>
          <p className="mt-2 text-base font-bold text-foreground">{storeName}</p>
          <div className="mt-3 flex items-center gap-2">
            <Badge className="border-none bg-[#534AB7]/12 text-[#534AB7] dark:bg-[#534AB7]/20 dark:text-[#c9c4ff]">
              {categoryLabel(storeCategory)}
            </Badge>
            <Badge variant="secondary" className="border-none">
              جاهز للمتابعة
            </Badge>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                active
                  ? "bg-[#534AB7] text-white shadow-[0_16px_32px_rgba(83,74,183,0.25)]"
                  : "text-muted-foreground hover:bg-white hover:text-foreground dark:hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-[#534AB7] dark:text-[#c9c4ff]")} />
              {label}
              {active && <ChevronLeft className="mr-auto h-3 w-3" />}
            </Link>
          );
        })}
        </nav>

        <div className="mt-6 rounded-[28px] border border-[#534AB7]/15 bg-[#534AB7]/7 p-4 dark:border-[#8c84f2]/20 dark:bg-[#534AB7]/12">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#534AB7] text-white">
              <MessageSquareShare className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">موجز اليوم</p>
              <p className="text-xs leading-6 text-muted-foreground">
                راقب الترندات الأعلى أولًا ثم افتح المحتوى الجاهز لتحويل الزخم إلى نشر فعلي.
              </p>
            </div>
          </div>
          <Button variant="ghost" className="mt-4 w-full justify-start rounded-2xl text-muted-foreground">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-50 md:hidden">
        <div className="grid grid-cols-5 rounded-[28px] border border-white/40 bg-background/90 p-2 shadow-[0_12px_35px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all",
                  active
                    ? "bg-[#534AB7] text-white"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function categoryLabel(value: string) {
  const labels: Record<string, string> = {
    FASHION: "موضة",
    BEAUTY: "عناية",
    ELECTRONICS: "إلكترونيات",
    HOME: "منزل",
    FOOD: "طعام",
    FITNESS: "لياقة",
    KIDS: "أطفال",
    TRAVEL: "سفر",
    GAMING: "ألعاب",
    OTHER: "متنوع",
  };

  return labels[value] ?? "متنوع";
}
