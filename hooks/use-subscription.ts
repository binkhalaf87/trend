"use client";

import { useUser } from "@/hooks/use-user";
import { canAccess, type Feature, type PlanId } from "@/lib/stripe/plans";

export function useSubscription() {
  const { user, loading } = useUser();

  const plan = (user?.subscriptionPlan ?? null) as PlanId | null;
  const status = user?.subscriptionStatus ?? null;

  const isActive =
    status === "ACTIVE" ||
    status === "TRIALING";

  const isTrialing = status === "TRIALING";

  const isPro = plan === "GROWTH" || plan === "ENTERPRISE";
  const isEnterprise = plan === "ENTERPRISE";

  function can(feature: Feature): boolean {
    if (!isActive) return false;
    return canAccess(plan, feature);
  }

  function requiresPlan(minPlan: PlanId): boolean {
    const order: PlanId[] = ["STARTER", "GROWTH", "ENTERPRISE"];
    const current = order.indexOf(plan ?? "STARTER");
    const required = order.indexOf(minPlan);
    return current >= required && isActive;
  }

  return {
    plan,
    status,
    isActive,
    isTrialing,
    isPro,
    isEnterprise,
    loading,
    can,
    requiresPlan,
  };
}
