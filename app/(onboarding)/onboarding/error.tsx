"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[OnboardingPage] error:", error.message, error.digest);
  }, [error]);

  return (
    <div className="text-center space-y-4 py-12">
      <p className="text-sm text-muted-foreground">
        خطأ في تحميل الصفحة — سيتم توجيهك للصفحة الرئيسية...
      </p>
      {error.digest && (
        <p className="text-xs font-mono text-muted-foreground">{error.digest}</p>
      )}
      <button
        onClick={() => router.push("/login")}
        className="text-sm underline text-primary"
      >
        العودة لتسجيل الدخول
      </button>
    </div>
  );
}
