import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "إنشاء حساب" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-brand-gradient flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">أنشئ حسابك المجاني</h1>
          <p className="text-muted-foreground text-sm">
            ابدأ باكتشاف الترندات وتوليد المحتوى العربي
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            سجّل دخولك
          </Link>
        </p>
      </div>
    </div>
  );
}
