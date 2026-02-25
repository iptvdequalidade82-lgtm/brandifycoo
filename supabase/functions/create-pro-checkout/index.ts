import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fixed Cakto checkout URLs (managed in Cakto dashboard)
const PLANS = {
  basico: {
    name: "Básico",
    price_cents: 4990,
    checkout_url: "https://pay.cakto.com.br/xyg6djs_784476",
    offer_id: "xyg6djs_784476",
  },
  pro: {
    name: "Pro",
    price_cents: 6990,
    checkout_url: "https://pay.cakto.com.br/3bbk9vi",
    offer_id: "3bbk9vi",
  },
  premium: {
    name: "Premium",
    price_cents: 12990,
    checkout_url: "https://pay.cakto.com.br/yxdhikx",
    offer_id: "yxdhikx",
  },
} as const;

type PlanKey = keyof typeof PLANS;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Faça login para assinar um plano" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { plan: planKey } = await req.json() as { plan?: string };
    if (!planKey || !(planKey in PLANS)) {
      return new Response(JSON.stringify({ error: "Plano inválido. Use: basico, pro ou premium" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = PLANS[planKey as PlanKey];

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const anonClient = createClient(supabaseUrl, supabaseAnon);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Sessão inválida. Faça login novamente." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(supabaseUrl, supabaseService, { auth: { persistSession: false } });

    // Check if user already has an active subscription for this plan or higher
    const { data: existing } = await serviceClient
      .from("subscriptions")
      .select("id, status, plan, cakto_checkout_url")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({
        error: `Você já possui o plano ${existing.plan} ativo!`,
        already_subscribed: true,
        current_plan: existing.plan,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build checkout URL with pre-filled data
    let checkoutUrl = plan.checkout_url;
    const params = new URLSearchParams();
    if (user.email) params.set("email", user.email);
    const fullName = user.user_metadata?.full_name;
    if (fullName) params.set("name", fullName);
    if (params.toString()) checkoutUrl += `?${params.toString()}`;

    // Create pending subscription record
    const { data: subscription, error: subError } = await serviceClient
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan: planKey,
        status: "pending",
        amount_cents: plan.price_cents,
        cakto_offer_id: plan.offer_id,
        cakto_checkout_url: checkoutUrl,
        payment_method: "cakto",
      })
      .select("id")
      .single();

    if (subError) {
      console.error("Error creating subscription:", subError);
      throw new Error("Erro ao criar assinatura");
    }

    return new Response(JSON.stringify({ url: checkoutUrl, subscription_id: subscription.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("create-pro-checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar pagamento" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
