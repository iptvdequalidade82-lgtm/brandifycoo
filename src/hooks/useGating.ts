import { useUserPlan } from "@/hooks/useUserPlan";

// Plan hierarchy: free < basico < pro < premium
const PLAN_RANK: Record<string, number> = {
  free: 0,
  basico: 1,
  pro: 2,
  premium: 3,
};

export type PlanTier = "free" | "basico" | "pro" | "premium";

export function useGating() {
  const { userPlan, loading } = useUserPlan();

  const currentRank = PLAN_RANK[userPlan?.plan || "free"] ?? 0;

  /** Check if user has access to a feature requiring `minPlan` */
  const hasAccess = (minPlan: PlanTier): boolean => {
    if (loading) return false;
    const required = PLAN_RANK[minPlan] ?? 0;
    return currentRank >= required;
  };

  /** Get the label of the minimum plan required */
  const requiredLabel = (minPlan: PlanTier): string => {
    const labels: Record<string, string> = {
      free: "Gratuito",
      basico: "Básico",
      pro: "Profissional",
      premium: "Premium",
    };
    return labels[minPlan] || minPlan;
  };

  return { hasAccess, requiredLabel, userPlan, loading, currentRank };
}
