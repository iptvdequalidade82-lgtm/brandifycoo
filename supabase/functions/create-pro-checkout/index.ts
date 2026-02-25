import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CAKTO_API_BASE = "https://api.cakto.com.br";
const PRO_PRICE_REAIS = 39.90;
const PRO_PLAN_NAME = "IA Studio Pro - Brandify";

async function getCaktoToken(): Promise<string> {
  const clientId = Deno.env.get("CAKTO_CLIENT_ID");
  const clientSecret = Deno.env.get("CAKTO_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Cakto credentials not configured");

  const response = await fetch(`${CAKTO_API_BASE}/public_api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
  });

  if (!response.ok) throw new Error("Failed to authenticate with Cakto");
  const data = await response.json();
  return data.access_token;
}

async function createCaktoOffer(
  token: string,
  productId: string,
  name: string,
  priceReais: number
): Promise<{ id: string; checkoutUrl: string }> {
  const response = await fetch(`${CAKTO_API_BASE}/public_api/offers/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name.substring(0, 255),
      price: priceReais,
      product: productId,
      status: "active",
      type: "unique",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Cakto create offer error:", text);
    throw new Error(`Cakto: ${text}`);
  }

  const offer = await response.json();
  return {
    id: offer.id,
    checkoutUrl: `https://pay.cakto.com.br/${offer.id}`,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated user (not admin)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Faça login para assinar o plano Pro" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Check if user already has an active subscription
    const { data: existing } = await serviceClient
      .from("subscriptions")
      .select("id, status, cakto_checkout_url")
      .eq("user_id", user.id)
      .eq("plan", "pro")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.status === "active") {
      return new Response(JSON.stringify({ error: "Você já possui o plano Pro ativo!", already_pro: true }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If there's a pending subscription with checkout URL, return it
    if (existing?.status === "pending" && existing?.cakto_checkout_url) {
      return new Response(JSON.stringify({ url: existing.cakto_checkout_url, subscription_id: existing.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Cakto offer
    const caktoToken = await getCaktoToken();
    const productId = Deno.env.get("CAKTO_PRODUCT_ID");
    if (!productId) throw new Error("CAKTO_PRODUCT_ID not configured");

    const offerName = `${PRO_PLAN_NAME} - ${user.email || user.id.slice(0, 8)}`;
    const offer = await createCaktoOffer(caktoToken, productId, offerName, PRO_PRICE_REAIS);

    // Build checkout URL with pre-filled data
    let checkoutUrl = offer.checkoutUrl;
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
        plan: "pro",
        status: "pending",
        amount_cents: Math.round(PRO_PRICE_REAIS * 100),
        cakto_offer_id: offer.id,
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
