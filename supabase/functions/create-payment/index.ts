import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PaymentSchema = z.object({
  proposal_id: z.string().uuid("Invalid proposal ID"),
  amount_cents: z.number().int().positive().max(100_000_000, "Amount too large"),
  installments: z.number().int().min(1).max(12, "Max 12 installments"),
  client_name: z.string().trim().min(1).max(200, "Name too long"),
  client_email: z.string().email("Invalid email").max(255),
  description: z.string().max(1000).optional().default(""),
});

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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin role using service role client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate and sanitize input
    const rawBody = await req.json();
    const parseResult = PaymentSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parseResult.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { amount_cents, installments, client_name, client_email, description, proposal_id } = parseResult.data;

    // Verify proposal exists and belongs to admin
    const { data: proposal } = await supabaseAdmin
      .from("proposals")
      .select("id, created_by")
      .eq("id", proposal_id)
      .single();

    if (!proposal) {
      return new Response(JSON.stringify({ error: "Proposal not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Sanitize text for Stripe
    const safeName = client_name.replace(/[<>"']/g, "").substring(0, 200);
    const safeDescription = (description || "Serviço Brandify").replace(/[<>"']/g, "").substring(0, 500);

    const sessionParams: any = {
      payment_method_types: ["card", "boleto"],
      customer_email: client_email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: safeDescription || "Serviço Brandify",
              description: `Cliente: ${safeName}`,
            },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin") || "https://brandifycoo.lovable.app"}/pagamento-sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") || "https://brandifycoo.lovable.app"}/`,
      metadata: {
        proposal_id,
        client_name: safeName,
      },
    };

    // Allow installments on card if > 1
    if (installments > 1) {
      sessionParams.payment_method_options = {
        card: {
          installments: {
            enabled: true,
          },
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
