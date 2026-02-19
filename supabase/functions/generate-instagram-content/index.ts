import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { niches, brandContext } = await req.json();
    // niches: string[] with 4 items, one per week

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const nichesList = niches.map((n: string, i: number) => `- Semana ${i + 1}: ${n}`).join("\n");

    const systemPrompt = `Você é um estrategista de marketing digital e social media especialista em Instagram para a agência Brandify (@brandifycoo). A Brandify é uma agência de criação de sites e lojas virtuais com estética moderna, futurista e profissional — cores predominantes: azul royal (#2563eb), preto (#0a0a0a) e branco.

Sua missão é gerar um PLANEJAMENTO MENSAL COMPLETO (4 semanas) de conteúdo para Instagram. CADA SEMANA FOCA EM UM NICHO DE CLIENTE DIFERENTE.

REGRAS POR SEMANA:
- 2 posts para o feed
- 14 stories (2 por dia, segunda a domingo)
- Cada semana foca em um nicho diferente de cliente

TOTAL DO MÊS: 8 posts no feed + 56 stories

Cada post do feed deve ter: título curto, legenda completa com emojis e hashtags, descrição da arte/imagem ideal, horário sugerido, dia da semana, tipo de conteúdo
Cada story deve ter: texto principal (curto, impactante), descrição do visual, tipo (enquete, dica, bastidor, CTA, depoimento, carrossel), dia da semana, CTA

As legendas devem usar copywriting persuasivo com gatilhos mentais (urgência, prova social, autoridade, escassez).
O conteúdo deve mostrar como a Brandify ajuda aquele nicho específico com sites e lojas virtuais.
Tom de voz: profissional mas acessível, confiante, moderno.

Responda APENAS em JSON válido com esta estrutura:
{
  "monthPlan": {
    "monthStrategy": "string (resumo geral da estratégia do mês em 3-4 frases)",
    "weeks": [
      {
        "weekNumber": 1,
        "niche": "string (nicho da semana)",
        "theme": "string (tema/abordagem da semana)",
        "strategy": "string (estratégia específica)",
        "feedPosts": [
          {
            "id": "w1-feed-1",
            "day": "Segunda",
            "time": "19:00",
            "title": "string",
            "caption": "string (legenda completa com emojis e hashtags)",
            "imageDescription": "string (descrição detalhada da arte)",
            "contentType": "carrossel|imagem|reels",
            "marketingTip": "string"
          }
        ],
        "stories": [
          {
            "id": "w1-story-1",
            "day": "Segunda",
            "type": "dica|enquete|bastidor|CTA|depoimento|carrossel",
            "mainText": "string",
            "visualDescription": "string",
            "callToAction": "string"
          }
        ]
      }
    ]
  }
}`;

    const userPrompt = `Gere o planejamento MENSAL de Instagram (4 semanas) com um NICHO DIFERENTE por semana:

${nichesList}

${brandContext ? `CONTEXTO ADICIONAL: ${brandContext}` : ""}

Cada semana deve focar 100% no nicho indicado, mostrando como a Brandify pode ajudar aquele tipo de cliente.
2 posts no feed + 14 stories por semana. Total: 8 posts + 56 stories.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("Erro no gateway de IA");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
    jsonStr = jsonStr.trim();

    // Find JSON boundaries
    const jsonStart = jsonStr.indexOf("{");
    const jsonEnd = jsonStr.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found in response");
    jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);

    // Remove control characters that break JSON
    jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, (ch) => {
      if (ch === "\n" || ch === "\r" || ch === "\t") return ch;
      return "";
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Fix common LLM JSON issues
      jsonStr = jsonStr
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/\\\n/g, "\\n")
        .replace(/(?<!\\)\\(?!["\\/bfnrtu])/g, "\\\\");
      parsed = JSON.parse(jsonStr);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-instagram-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
