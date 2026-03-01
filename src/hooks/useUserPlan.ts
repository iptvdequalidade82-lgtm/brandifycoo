import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserPlan {
  plan: string;
  status: string;
  expiresAt: string | null;
  isActive: boolean;
  label: string;
}

const PLAN_LABELS: Record<string, string> = {
  basico: "Básico",
  pro: "Profissional",
  premium: "Premium",
};

export function useUserPlan() {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserPlan(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status, expires_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const isActive = !data.expires_at || new Date(data.expires_at) > new Date();
        setUserPlan({
          plan: data.plan,
          status: data.status,
          expiresAt: data.expires_at,
          isActive,
          label: PLAN_LABELS[data.plan] || data.plan,
        });
      } else {
        setUserPlan({ plan: "free", status: "active", expiresAt: null, isActive: true, label: "Gratuito" });
      }
      setLoading(false);
    };

    fetch();
  }, [user]);

  return { userPlan, loading };
}
