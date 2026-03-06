import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user via JWT claims
    const anonClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) throw new Error("Sessão inválida");
    const userId = claimsData.claims.sub as string;

    const serviceClient = createClient(supabaseUrl, supabaseService, { auth: { persistSession: false } });

    // Check admin role
    const { data: isAdmin } = await serviceClient.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Acesso negado");

    // Get all auth users
    const { data: authData } = await serviceClient.auth.admin.listUsers({ perPage: 1000 });
    const authUsers = authData?.users || [];

    // Get all subscriptions
    const { data: subs } = await serviceClient
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    // Get all profiles
    const { data: profiles } = await serviceClient
      .from("profiles")
      .select("*");

    // Build combined user list
    const userList = authUsers.map((au) => {
      const profile = profiles?.find((p: any) => p.user_id === au.id);
      // Get latest subscription for this user
      const userSubs = subs?.filter((s: any) => s.user_id === au.id) || [];
      const activeSub = userSubs.find((s: any) => s.status === "active");
      const latestSub = activeSub || userSubs[0] || null;

      return {
        id: au.id,
        email: au.email || "",
        name: profile?.full_name || au.user_metadata?.full_name || null,
        created_at: au.created_at,
        last_sign_in: au.last_sign_in_at,
        subscription: latestSub ? {
          id: latestSub.id,
          plan: latestSub.plan,
          status: latestSub.status,
          amount_cents: latestSub.amount_cents,
          payment_method: latestSub.payment_method,
          paid_at: latestSub.paid_at,
          expires_at: latestSub.expires_at,
          created_at: latestSub.created_at,
        } : null,
      };
    });

    return new Response(JSON.stringify({ users: userList }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("admin-users error:", e);
    return new Response(JSON.stringify({ error: e.message || "Erro" }), {
      status: e.message === "Acesso negado" ? 403 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
