import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_CHECKLIST = [
  "Conteúdo recebido",
  "Domínio registrado",
  "Hospedagem configurada",
  "Design aprovado",
  "Desenvolvimento concluído",
  "Revisão do cliente",
  "Site publicado",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Cakto webhook received:", JSON.stringify(body).substring(0, 500));

    // Validate webhook secret if configured
    const webhookSecret = Deno.env.get("CAKTO_WEBHOOK_SECRET");
    if (webhookSecret) {
      const receivedSecret = body?.secret || req.headers.get("x-webhook-secret");
      if (receivedSecret !== webhookSecret) {
        console.error("Invalid webhook secret");
        return new Response(JSON.stringify({ error: "Invalid secret" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Extract event type - Cakto sends event info in the payload
    const eventType = body?.event || body?.custom_id || "unknown";
    
    // Only process purchase_approved events
    if (eventType !== "purchase_approved" && body?.status !== "approved" && body?.status !== "paid") {
      console.log("Ignoring event:", eventType);
      return new Response(JSON.stringify({ received: true, ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Extract offer/checkout info from the webhook payload
    // Cakto webhook payload includes order data with checkout info
    const checkoutUrl = body?.checkoutUrl || body?.checkout_url || "";
    const offerId = body?.offer?.id || body?.offer_id || "";
    const customerEmail = body?.customer?.email || body?.email || "";
    const customerName = body?.customer?.name || body?.name || "";

    // Try to find the proposal by cakto_offer_id or by matching checkout URL
    let proposal = null;

    if (offerId) {
      const { data } = await supabaseAdmin
        .from("proposals")
        .select("*")
        .eq("cakto_offer_id", offerId)
        .maybeSingle();
      proposal = data;
    }

    if (!proposal && checkoutUrl) {
      // Try matching by checkout URL (partial match)
      const { data } = await supabaseAdmin
        .from("proposals")
        .select("*")
        .like("cakto_checkout_url", `%${checkoutUrl.split("?")[0]}%`)
        .maybeSingle();
      proposal = data;
    }

    if (!proposal && customerEmail) {
      // Fallback: match by customer email + status sent
      const { data } = await supabaseAdmin
        .from("proposals")
        .select("*")
        .eq("client_email", customerEmail)
        .eq("status", "sent")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      proposal = data;
    }

    if (!proposal) {
      console.log("No matching proposal found for Cakto webhook");
      return new Response(JSON.stringify({ received: true, matched: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if already processed
    if (proposal.status === "paid") {
      console.log("Proposal already paid:", proposal.id);
      return new Response(JSON.stringify({ received: true, already_paid: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 1. Mark proposal as paid
    await supabaseAdmin
      .from("proposals")
      .update({ status: "paid" })
      .eq("id", proposal.id);

    // 2. Auto-create project
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
      })
      .select()
      .single();

    if (projectError || !project) {
      console.error("Failed to create project:", projectError);
    } else {
      // 3. Create default checklist
      const checklistItems = DEFAULT_CHECKLIST.map((label, i) => ({
        project_id: project.id,
        label,
        sort_order: i,
        checked: false,
      }));
      await supabaseAdmin.from("project_checklist").insert(checklistItems);

      // 4. Log activity
      await supabaseAdmin.from("activity_logs").insert({
        entity_type: "project",
        entity_id: project.id,
        action: "created",
        created_by: proposal.created_by,
        details: {
          title: proposal.title,
          client_name: proposal.client_name,
          plan: "essencial",
          from_proposal: proposal.id,
          auto_created: true,
          platform: "cakto",
        },
      });

      await supabaseAdmin.from("activity_logs").insert({
        entity_type: "proposal",
        entity_id: proposal.id,
        action: "status_changed",
        created_by: proposal.created_by,
        details: {
          title: proposal.title,
          client_name: proposal.client_name,
          from: "Enviado",
          to: "Pago",
          auto_converted: true,
          platform: "cakto",
        },
      });

      console.log(`Cakto: Proposal ${proposal.id} paid → Project ${project.id} auto-created`);
    }

    return new Response(JSON.stringify({ received: true, matched: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Cakto webhook error:", error.message);
    return new Response(JSON.stringify({ error: "Webhook handler failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
