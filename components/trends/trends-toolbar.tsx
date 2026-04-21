"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { TREND_CATEGORY_FILTERS, TREND_SORT_OPTIONS } from "@/lib/trends/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TrendsToolbarProps = {
  category: string;
  sort: string;
  query: string;
};

export function TrendsToolbar({ category, sort, query }: TrendsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  function updateParam(key: string, value?: string) {
    const params = new URLSearchParams(currentParams.toString());

    if (!value || value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    if (key !== "q") {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="space-y-4 rounded-[28px] border border-white/50 bg-white/80 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={query}
            placeholder="ابحث عن اسم الترند أو وصفه..."
            className="h-12 rounded-2xl border-white/40 bg-background/80 pr-11 text-sm shadow-none dark:border-white/10"
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              updateParam("q", (event.currentTarget as HTMLInputElement).value.trim());
            }}
          />
        </div>

        <Select value={sort} onValueChange={(value) => updateParam("sort", value)}>
          <SelectTrigger className="h-12 rounded-2xl border-white/40 bg-background/80 dark:border-white/10">
            <SelectValue placeholder="الترتيب" />
          </SelectTrigger>
          <SelectContent>
            {TREND_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="ml-2 inline-flex items-center gap-2 rounded-full bg-[#534AB7]/8 px-3 py-2 text-xs font-semibold text-[#534AB7] dark:bg-[#534AB7]/15 dark:text-[#c9c4ff]">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          الفئات
        </div>

        {TREND_CATEGORY_FILTERS.map((option) => {
          const active = category === option.value;
          return (
            <Button
              key={option.value}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              disabled={isPending}
              className={
                active
                  ? "rounded-full bg-[#534AB7] px-4 text-white hover:bg-[#4d44ad]"
                  : "rounded-full border-white/50 bg-background/70 px-4 hover:bg-[#534AB7]/6 dark:border-white/10"
              }
              onClick={() => updateParam("category", option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
