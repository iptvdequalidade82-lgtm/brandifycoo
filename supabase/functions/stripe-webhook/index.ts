import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_CHECKLIST = [
  "✅ 50% entrada pago",
  "Conteúdo recebido",
  "Domínio registrado",
  "Hospedagem configurada",
  "Design aprovado",
  "Desenvolvimento concluído",
  "Revisão do cliente",
  "Site publicado",
  "💰 50% final pago",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const proposalId = session.metadata?.proposal_id;

      if (proposalId) {
        // 1. Get proposal data
        const { data: proposal } = await supabaseAdmin
          .from("proposals")
          .select("*")
          .eq("id", proposalId)
          .eq("stripe_session_id", session.id)
          .single();

        if (!proposal) {
          console.error("Proposal not found:", proposalId);
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        // 2. Mark proposal as paid
        await supabaseAdmin
          .from("proposals")
          .update({ status: "paid" })
          .eq("id", proposalId);

        const halfAmount = Math.round(proposal.amount_cents / 2);

        // 3. Auto-create project from proposal with partial payment
        const { data: project, error: projectError } = await supabaseAdmin
          .from("projects")
          .insert({
            client_name: proposal.client_name,
            client_phone: proposal.client_phone || null,
            client_email: proposal.client_email || null,
            title: proposal.title,
            plan: "essencial",
            notes: proposal.description || null,
            start_date: new Date().toISOString().split("T")[0],
            created_by: proposal.created_by,
            total_amount_cents: proposal.amount_cents,
            amount_received_cents: halfAmount,
            payment_status: "partial",
          })
          .select()
          .single();

        if (projectError || !project) {
          console.error("Failed to create project:", projectError);
        } else {
          // 4. Create default checklist
          const checklistItems = DEFAULT_CHECKLIST.map((label, i) => ({
            project_id: project.id,
            label,
            sort_order: i,
            checked: i === 0, // First item (50% entrada) auto-checked
            checked_at: i === 0 ? new Date().toISOString() : null,
          }));
          await supabaseAdmin.from("project_checklist").insert(checklistItems);

          // 5. Log activity
          await supabaseAdmin.from("activity_logs").insert({
            entity_type: "project",
            entity_id: project.id,
            action: "created",
            created_by: proposal.created_by,
            details: {
              title: proposal.title,
              client_name: proposal.client_name,
              plan: "essencial",
              from_proposal: proposalId,
              auto_created: true,
            },
          });

          await supabaseAdmin.from("activity_logs").insert({
            entity_type: "proposal",
            entity_id: proposalId,
            action: "status_changed",
            created_by: proposal.created_by,
            details: {
              title: proposal.title,
              client_name: proposal.client_name,
              from: "Enviado",
              to: "Pago",
              auto_converted: true,
            },
          });

          console.log(`Proposal ${proposalId} paid → Project ${project.id} auto-created`);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return new Response(JSON.stringify({ error: "Webhook handler failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
