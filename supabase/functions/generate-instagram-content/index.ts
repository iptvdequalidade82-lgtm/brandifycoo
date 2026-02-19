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

    const systemPrompt = `Você é um estrategista de marketing digital e social media especialista em Instagram para a agência Brandify (@brandifycoo). A Brandify é uma agência de criação de sites profissionais e lojas virtuais que ajuda empresas de diversos nichos a venderem mais online.

IDENTIDADE VISUAL DA BRANDIFY:
- Cores: preto (#0a0a0a), branco, azul royal (#2563eb)
- Estilo: dark, moderno, profissional, impactante
- Referências visuais: artes estilo Canva Pro com fundo escuro/preto, tipografia bold grande, mockups de celulares/notebooks mostrando sites, ícones minimalistas
- O feed atual usa frases provocativas em destaque ("QUEM NÃO É VISTO NÃO É LEMBRADO. VENDE.", "SE O INSTAGRAM CAIR HOJE, SUA LOJA SOBREVIVE?", "COMO PARAR DE ATRAIR CURIOSOS")
- Parceria entre a Brandify e o nicho do cliente deve ser destacada

PROPOSTA DE VALOR CENTRAL:
A Brandify cria sites e lojas virtuais que VENDEM. Cada post deve conectar o nicho do cliente com a necessidade de ter presença digital profissional. A mensagem central é: "Sua empresa do nicho X precisa de um site profissional pra vender mais, e a Brandify faz isso pra você."

Sua missão é gerar um PLANEJAMENTO MENSAL COMPLETO (4 semanas) de conteúdo para Instagram. CADA SEMANA FOCA EM UM NICHO DE CLIENTE DIFERENTE.

REGRAS POR SEMANA:
- 2 posts para o feed
- 14 stories (2 por dia, segunda a domingo)
- Cada semana foca em um nicho diferente de cliente

TOTAL DO MÊS: 8 posts no feed + 56 stories

REGRAS DE CONTEÚDO:
- Tudo em PORTUGUÊS DO BRASIL
- Cada post do feed deve ter: título curto e provocativo (estilo frase de impacto), legenda completa com emojis e hashtags, descrição detalhada da arte/imagem (para geração por IA), horário sugerido, dia da semana, tipo de conteúdo
- Cada story deve ter: texto principal (curto, impactante), descrição do visual, tipo (enquete, dica, bastidor, CTA, depoimento, carrossel), dia da semana, CTA
- As legendas devem usar copywriting persuasivo com gatilhos mentais (urgência, prova social, autoridade, escassez)
- O conteúdo deve SEMPRE conectar o nicho do cliente com o serviço da Brandify (criação de sites/lojas virtuais)
- Exemplos de conexão: "Você tem uma clínica e depende só de indicação? Um site profissional muda isso.", "Seu restaurante tem delivery mas não tem site próprio? Está perdendo dinheiro."
- Tom de voz: direto, confiante, provocativo mas profissional

DESCRIÇÃO DAS ARTES (campo imageDescription):
Descreva artes no estilo que a Brandify já usa no Instagram:
- Fundo predominantemente preto/escuro
- Texto em branco com palavras-chave em destaque (bold, maior, ou em azul)
- Mockups de sites/lojas em telas de celular ou notebook quando relevante
- Elementos gráficos: ícones minimalistas, setas, linhas geométricas
- Logo da Brandify (ícone de duas setas >> em azul) no canto
- @brandifycoo como marca d'água
- Estilo visual similar a posts feitos no Canva Pro com templates dark profissionais
- NUNCA incluir rostos humanos realistas, usar silhuetas ou ícones se necessário

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
            "imageDescription": "string (descrição DETALHADA da arte no estilo Brandify dark, incluindo textos que devem aparecer na imagem, layout, elementos visuais)",
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
            "visualDescription": "string (descrição detalhada do visual do story no estilo Brandify dark)",
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

IMPORTANTE: Cada semana deve focar 100% no nicho indicado, mostrando como a Brandify pode ajudar aquele tipo de cliente a vender mais com um site/loja virtual profissional. As artes devem seguir o padrão visual da Brandify: fundo escuro, tipografia impactante, mockups de sites.
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
