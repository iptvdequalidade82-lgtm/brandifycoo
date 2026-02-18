import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { niche, brandContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um estrategista de marketing digital e social media especialista em Instagram para a agência Brandify (@brandifycoo). A Brandify é uma agência de criação de sites e lojas virtuais com estética moderna, futurista e profissional — cores predominantes: azul royal (#2563eb), preto (#0a0a0a) e branco.

Sua missão é gerar um PLANEJAMENTO MENSAL COMPLETO (4 semanas) de conteúdo para Instagram focado em um nicho específico do cliente.

REGRAS POR SEMANA:
- 2 posts para o feed
- 14 stories (2 por dia, segunda a domingo)

TOTAL DO MÊS: 8 posts no feed + 56 stories

Cada post do feed deve ter: título curto, legenda completa com emojis e hashtags, descrição da arte/imagem ideal, horário sugerido, dia da semana, tipo de conteúdo
Cada story deve ter: texto principal (curto, impactante), descrição do visual, tipo (enquete, dica, bastidor, CTA, depoimento, carrossel), dia da semana, CTA

As legendas devem usar copywriting persuasivo com gatilhos mentais (urgência, prova social, autoridade, escassez).
Foque em estratégias para atrair clientes do nicho especificado para contratar serviços de criação de sites e lojas virtuais.
Tom de voz: profissional mas acessível, confiante, moderno.

Cada semana deve ter um TEMA/FOCO diferente para manter variedade:
- Semana 1: Autoridade e educação
- Semana 2: Prova social e cases
- Semana 3: Dores e soluções
- Semana 4: Urgência e conversão

Responda APENAS em JSON válido com esta estrutura:
{
  "monthPlan": {
    "niche": "string",
    "monthStrategy": "string (resumo geral da estratégia do mês em 3-4 frases)",
    "weeks": [
      {
        "weekNumber": 1,
        "theme": "string (tema da semana)",
        "strategy": "string (estratégia específica da semana)",
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

    const userPrompt = `Gere o planejamento MENSAL de Instagram (4 semanas completas) para:

NICHO DO CLIENTE: ${niche}
${brandContext ? `CONTEXTO ADICIONAL: ${brandContext}` : ""}

Lembre-se: 4 semanas, cada uma com 2 posts no feed + 14 stories. Total: 8 posts + 56 stories.`;

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

    const parsed = JSON.parse(jsonStr.trim());

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
