"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white dark:bg-[#0e0c1e]">
        <div className="space-y-6 max-w-md">
          <div className="text-6xl select-none">⚠️</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">حدث خطأ غير متوقع</h1>
            <p className="text-gray-500 dark:text-gray-400">
              نأسف على الإزعاج. يرجى المحاولة مرة أخرى، أو التواصل مع الدعم إذا استمرت المشكلة.
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 font-mono">كود الخطأ: {error.digest}</p>
            )}
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#534AB7] px-6 py-3 text-sm font-semibold text-white hover:bg-[#443da3] transition-colors"
          >
            حاول مرة أخرى
          </button>
        </div>
      </body>
    </html>
  );
}
