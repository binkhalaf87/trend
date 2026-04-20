"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = [
  { value: "FASHION", label: "موضة وملابس" },
  { value: "ELECTRONICS", label: "إلكترونيات" },
  { value: "HOME_DECOR", label: "ديكور المنزل" },
  { value: "BEAUTY", label: "جمال وعناية" },
  { value: "FOOD", label: "طعام ومشروبات" },
  { value: "FITNESS", label: "لياقة ورياضة" },
  { value: "GAMING", label: "ألعاب" },
  { value: "KIDS", label: "أطفال" },
  { value: "OTHER", label: "أخرى" },
];

export function ProfileSettings() {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast({ title: "تم الحفظ", description: "تم تحديث ملفك الشخصي بنجاح." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">معلومات الملف الشخصي</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { id: "name", label: "الاسم الكامل", type: "text", placeholder: "محمد أحمد" },
            { id: "storeName", label: "اسم المتجر", type: "text", placeholder: "متجر النجاح" },
            { id: "email", label: "البريد الإلكتروني", type: "email", placeholder: "you@example.com" },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id} className="space-y-1.5">
              <label htmlFor={id} className="text-sm font-medium">{label}</label>
              <input
                id={id}
                type={type}
                placeholder={placeholder}
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">تصنيف المتجر</label>
            <select className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
              {CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            حفظ التغييرات
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
