import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-brand-gradient flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">مرحباً بك في TrendZone</h1>
          <p className="text-muted-foreground text-sm">
            سجّل دخولك للوصول إلى لوحة التحكم
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            أنشئ حساباً مجانياً
          </Link>
        </p>
      </div>
    </div>
  );
}
