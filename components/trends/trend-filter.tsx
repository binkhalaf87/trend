"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { value: "all", label: "الكل" },
  { value: "FASHION", label: "موضة" },
  { value: "ELECTRONICS", label: "إلكترونيات" },
  { value: "HOME_DECOR", label: "ديكور" },
  { value: "BEAUTY", label: "جمال" },
  { value: "FOOD", label: "طعام" },
  { value: "FITNESS", label: "لياقة" },
  { value: "GAMING", label: "ألعاب" },
];

const STATUSES = [
  { value: "all", label: "الكل" },
  { value: "RISING", label: "صاعد" },
  { value: "PEAK", label: "ذروة" },
  { value: "STABLE", label: "مستقر" },
];

export function TrendFilter() {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="ابحث عن ترند..."
          className="w-full h-10 rounded-lg border bg-background pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground flex items-center gap-1 ml-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          التصنيف:
        </span>
        {CATEGORIES.map(({ value, label }) => (
          <Button
            key={value}
            variant={value === "all" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground flex items-center gap-1 ml-1">
          الحالة:
        </span>
        {STATUSES.map(({ value, label }) => (
          <Button
            key={value}
            variant={value === "all" ? "secondary" : "outline"}
            size="sm"
            className="h-7 text-xs"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
