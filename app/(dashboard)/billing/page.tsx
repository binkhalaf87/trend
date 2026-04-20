import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";
import { BillingDashboard } from "@/components/billing/billing-dashboard";
import type { PlanId } from "@/lib/stripe/plans";

export const metadata: Metadata = { title: "الاشتراك والفواتير" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const userId = user!.id;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الاشتراك والفواتير</h1>
        <p className="text-muted-foreground mt-1">إدارة باقتك وطريقة الدفع وسجل الفواتير.</p>
      </div>

      {searchParams.success && (
        <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-green-700 dark:text-green-400">
          <span className="text-xl">🎉</span>
          <div>
            <p className="font-semibold text-sm">تم تفعيل اشتراكك بنجاح!</p>
            <p className="text-xs mt-0.5">يمكنك الاستمتاع بجميع مزايا الباقة الآن.</p>
          </div>
        </div>
      )}

      {searchParams.canceled && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-700 dark:text-amber-400">
          <span className="text-xl">↩️</span>
          <p className="text-sm">لم تُكمل عملية الدفع — اشتراكك الحالي لا يزال نشطاً.</p>
        </div>
      )}

      <BillingDashboard
        currentPlan={(subscription?.plan ?? null) as PlanId | null}
        status={subscription?.status ?? null}
        periodEnd={subscription?.currentPeriodEnd ?? null}
        cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd}
      />
    </div>
  );
}
