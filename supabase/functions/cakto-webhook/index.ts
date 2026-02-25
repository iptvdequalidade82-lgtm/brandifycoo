import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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

    // ── Known subscription offer IDs ──
    const SUBSCRIPTION_OFFER_IDS = ["xyg6djs_784476", "3bbk9vi", "yxdhikx"];

    // ── Check if this is a subscription payment ──
    let subscription = null;
    const isSubscriptionOffer = SUBSCRIPTION_OFFER_IDS.includes(offerId);

    if (offerId) {
      // First try exact match by offer ID
      const { data } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("cakto_offer_id", offerId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .maybeSingle();
      subscription = data;
    }

    // If offer ID matches a known subscription but no pending record, try by email
    if (!subscription && isSubscriptionOffer && customerEmail) {
      // Find user by email and their most recent pending subscription
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const matchedUser = users?.users?.find(u => u.email === customerEmail);
      if (matchedUser) {
        const { data } = await supabaseAdmin
          .from("subscriptions")
          .select("*")
          .eq("user_id", matchedUser.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .maybeSingle();
        subscription = data;
      }
    }

    if (subscription) {
      // Activate subscription
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "active",
          paid_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", subscription.id);

      console.log(`Subscription ${subscription.id} (plan: ${subscription.plan}) activated for user ${subscription.user_id}`);
      return new Response(JSON.stringify({ received: true, matched: true, type: "subscription", plan: subscription.plan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // ── Try to find a matching proposal (existing flow) ──
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
      const { data } = await supabaseAdmin
        .from("proposals")
        .select("*")
        .like("cakto_checkout_url", `%${checkoutUrl.split("?")[0]}%`)
        .maybeSingle();
      proposal = data;
    }

    if (!proposal && customerEmail) {
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
      console.log("No matching proposal or subscription found for Cakto webhook");
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

    const halfAmount = Math.round(proposal.amount_cents / 2);

    // 2. Auto-create project with partial payment
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
      // 3. Create default checklist
      const checklistItems = DEFAULT_CHECKLIST.map((label, i) => ({
        project_id: project.id,
        label,
        sort_order: i,
        checked: i === 0, // First item (50% entrada) auto-checked
        checked_at: i === 0 ? new Date().toISOString() : null,
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
