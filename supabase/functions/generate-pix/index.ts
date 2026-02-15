import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
    crc &= 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function buildPixPayload(pixKey: string, merchantName: string, merchantCity: string, amount: number, txId: string, description: string): string {
  const gui = tlv("00", "br.gov.bcb.pix");
  const key = tlv("01", pixKey);
  const desc = description ? tlv("02", description.substring(0, 72)) : "";
  const merchantAccountInfo = tlv("26", gui + key + desc);
  const additionalData = tlv("62", tlv("05", txId.substring(0, 25)));

  let payload = "";
  payload += tlv("00", "01");
  payload += merchantAccountInfo;
  payload += tlv("52", "0000");
  payload += tlv("53", "986");

  if (amount > 0) {
    const amountStr = amount.toFixed(2);
    payload += tlv("54", amountStr);
  }

  payload += tlv("58", "BR");
  payload += tlv("59", merchantName.substring(0, 25));
  payload += tlv("60", merchantCity.substring(0, 15));
  payload += additionalData;

  payload += "6304";
  const crc = crc16(payload);
  payload += crc;

  return payload;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposal_id, step } = await req.json();

    if (!proposal_id || typeof proposal_id !== "string") {
      return new Response(JSON.stringify({ error: "proposal_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .select("id, title, amount_cents, client_name, description, status")
      .eq("id", proposal_id)
      .single();

    if (error || !proposal) {
      return new Response(JSON.stringify({ error: "Proposal not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let pixKey = Deno.env.get("PIX_PHONE_KEY") || "";
    if (!pixKey) {
      return new Response(JSON.stringify({ error: "PIX key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    pixKey = pixKey.replace(/\D/g, "");
    if (!pixKey.startsWith("55")) {
      pixKey = "55" + pixKey;
    }
    pixKey = "+" + pixKey;

    // If step is provided, charge half the amount
    const isHalf = step === "init" || step === "final";
    const amountCents = isHalf ? Math.round(proposal.amount_cents / 2) : proposal.amount_cents;
    const amount = amountCents / 100;
    
    const txId = proposal.id.replace(/-/g, "").substring(0, 25);
    const stepLabel = step === "init" ? "Inicializacao" : step === "final" ? "Finalizacao" : "";
    const desc = stepLabel || proposal.title || "Brandify";

    const pixPayload = buildPixPayload(
      pixKey,
      "BRANDIFY",
      "SAO PAULO",
      amount,
      txId,
      desc
    );

    const titleLabel = step === "init"
      ? "Pagamento Inicialização"
      : step === "final"
        ? "Pagamento Finalização"
        : "Serviço Brandify";

    return new Response(
      JSON.stringify({
        pix_payload: pixPayload,
        amount_cents: amountCents,
        title: titleLabel,
        client_name: proposal.client_name,
        description: "Pagamento via PIX",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    console.error("Error generating PIX:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
