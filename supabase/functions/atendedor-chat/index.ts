import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, businessContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é um assistente de atendimento ao cliente profissional e amigável, especializado no seguinte negócio:

NOME DO NEGÓCIO: ${businessContext?.name || "Meu Negócio"}
SEGMENTO: ${businessContext?.segment || "Não informado"}
SERVIÇOS/PRODUTOS: ${businessContext?.services || "Não informado"}
HORÁRIO DE FUNCIONAMENTO: ${businessContext?.hours || "Não informado"}
INFORMAÇÕES ADICIONAIS: ${businessContext?.extra || "Nenhuma"}

REGRAS DE ATENDIMENTO:
- Responda SEMPRE em português brasileiro natural e profissional
- Seja cordial, empático e prestativo
- Ofereça soluções claras e objetivas
- Se não souber uma informação, sugira que o cliente entre em contato por WhatsApp/telefone
- Use emojis com moderação (1-2 por mensagem no máximo)
- Mantenha respostas concisas (máx 3 parágrafos)
- Tente sempre levar para uma ação (agendar, comprar, visitar)
- NÃO invente informações que não foram fornecidas sobre o negócio`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("atendedor-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
