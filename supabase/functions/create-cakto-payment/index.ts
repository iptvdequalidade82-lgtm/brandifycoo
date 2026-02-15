import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CAKTO_API_BASE = "https://api.cakto.com.br";

const PaymentSchema = z.object({
  proposal_id: z.string().uuid("Invalid proposal ID"),
  amount_reais: z.number().positive().min(5, "O preço mínimo é R$ 5,00").max(1000000, "Amount too large"),
  client_name: z.string().trim().min(1).max(200, "Name too long"),
  client_email: z.string().email("Invalid email").max(255).optional().default(""),
  description: z.string().max(1000).optional().default(""),
});

// Also support a "list_products" action for debugging
const ListSchema = z.object({
  action: z.literal("list_products"),
});

async function getCaktoToken(): Promise<string> {
  const clientId = Deno.env.get("CAKTO_CLIENT_ID");
  const clientSecret = Deno.env.get("CAKTO_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Cakto credentials not configured");
  }

  const response = await fetch(`${CAKTO_API_BASE}/public_api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Cakto token error:", text);
    throw new Error("Failed to authenticate with Cakto");
  }

  const data = await response.json();
  return data.access_token;
}

async function getCaktoProducts(token: string): Promise<any[]> {
  const response = await fetch(`${CAKTO_API_BASE}/public_api/products/?status=active`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to list Cakto products");
  }

  const data = await response.json();
  return data.results || [];
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
    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.json();

    // Handle list_products action
    const listResult = ListSchema.safeParse(rawBody);
    if (listResult.success) {
      const caktoToken = await getCaktoToken();
      const products = await getCaktoProducts(caktoToken);
      return new Response(
        JSON.stringify({ products: products.map((p: any) => ({ id: p.id, name: p.name, status: p.status })) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Validate payment input
    const parseResult = PaymentSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Dados inválidos", details: parseResult.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { amount_reais, client_name, client_email, description, proposal_id } = parseResult.data;

    // Verify proposal exists
    const { data: proposal } = await supabaseAdmin
      .from("proposals")
      .select("id")
      .eq("id", proposal_id)
      .single();

    if (!proposal) {
      return new Response(JSON.stringify({ error: "Proposal not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate with Cakto
    const caktoToken = await getCaktoToken();

    // Use fixed product ID from secret, or fall back to first active product
    const fixedProductId = Deno.env.get("CAKTO_PRODUCT_ID");
    let productId: string;

    if (fixedProductId) {
      productId = fixedProductId;
    } else {
      const products = await getCaktoProducts(caktoToken);
      if (products.length === 0) {
        return new Response(
          JSON.stringify({ error: "Nenhum produto ativo encontrado na Cakto. Crie um produto primeiro." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      productId = products[0].id;
    }

    // Create offer with custom price
    const safeName = `${client_name.replace(/[<>"']/g, "").substring(0, 100)} - ${(description || "Serviço Brandify").replace(/[<>"']/g, "").substring(0, 100)}`;
    const offer = await createCaktoOffer(caktoToken, productId, safeName, amount_reais);

    // Build checkout URL with pre-filled customer data
    let checkoutUrl = offer.checkoutUrl;
    const params = new URLSearchParams();
    if (client_name) params.set("name", client_name);
    if (client_email) params.set("email", client_email);
    if (params.toString()) {
      checkoutUrl += `?${params.toString()}`;
    }

    // Update proposal with Cakto data
    await supabaseAdmin
      .from("proposals")
      .update({
        cakto_offer_id: offer.id,
        cakto_checkout_url: checkoutUrl,
        status: "sent",
      })
      .eq("id", proposal_id);

    return new Response(
      JSON.stringify({ url: checkoutUrl, offer_id: offer.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating Cakto payment:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno ao criar pagamento" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
