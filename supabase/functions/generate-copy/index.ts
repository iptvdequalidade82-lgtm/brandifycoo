import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, offer, audience, tone } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const typeLabels: Record<string, string> = {
      whatsapp: "Mensagem de WhatsApp (primeira mensagem, follow-up e fechamento)",
      anuncio: "Anúncio para Meta Ads (Facebook/Instagram)",
      landing: "Textos para Landing Page (headline, sub-headline, benefícios, CTA)",
      reels: "Script para Reels/Shorts (gancho, desenvolvimento, CTA)",
    };

    const toneLabels: Record<string, string> = {
      profissional: "Profissional e autoritário",
      direto: "Direto e objetivo",
      amigavel: "Amigável e acessível",
    };

    const systemPrompt = `Você é um copywriter brasileiro de elite, especialista em marketing digital e vendas.
Seu trabalho é criar copys de alta conversão, persuasivas e prontas para uso.

REGRAS:
- Escreva SEMPRE em português brasileiro natural e fluente
- Use gatilhos mentais (urgência, escassez, prova social, autoridade) de forma sutil
- Adapte o tom conforme solicitado
- Cada variação deve ter um ÂNGULO COMPLETAMENTE DIFERENTE (não apenas trocar palavras)
- Variação A: abordagem emocional/storytelling
- Variação B: abordagem racional/benefícios diretos  
- Variação C: abordagem de urgência/escassez
- Use emojis com moderação e estratégia
- Formato limpo e fácil de copiar/colar`;

    const userPrompt = `Crie 3 variações de copy (A, B e C) para:

TIPO: ${typeLabels[type] || type}
OFERTA: ${offer}
PÚBLICO-ALVO: ${audience}
TOM: ${toneLabels[tone] || tone}

Retorne EXATAMENTE neste formato (sem markdown extra):

---VARIAÇÃO A---
[copy completa A]

---VARIAÇÃO B---
[copy completa B]

---VARIAÇÃO C---
[copy completa C]`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }), {
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse variations
    const variations: string[] = [];
    const parts = content.split(/---VARIAÇÃO [ABC]---/i).filter((s: string) => s.trim());
    for (const part of parts) {
      variations.push(part.trim());
    }

    // Ensure we always return 3
    while (variations.length < 3) {
      variations.push("Variação não gerada. Tente novamente.");
    }

    return new Response(JSON.stringify({ variations: variations.slice(0, 3) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-copy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
