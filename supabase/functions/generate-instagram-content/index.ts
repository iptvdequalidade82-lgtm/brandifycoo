import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { niches, brandContext, monthLabel, weeksConfig } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const nichesList = niches.map((n: string, i: number) => {
      const wl = weeksConfig?.[i];
      return `- ${wl?.label || `Semana ${i + 1}`}: ${n}`;
    }).join("\n");

    const weeksCount = niches.length;

    // Build calendar instructions
    let calendarInstructions = "";
    if (weeksConfig) {
      calendarInstructions = weeksConfig.map((wc: any, i: number) => {
        const days = wc.days || ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
        const storiesCount = days.length * 2;
        return `- ${wc.label} (${wc.range || ""}): ${days.length} dias (${days.join(", ")}). Gere 2 posts no feed + ${storiesCount} stories (2 por dia). Use weekNumber ${i + 1} no JSON.`;
      }).join("\n");
    }

    const totalFeed = weeksCount * 2;
    const totalStories = weeksConfig
      ? weeksConfig.reduce((sum: number, wc: any) => sum + (wc.days?.length || 7) * 2, 0)
      : weeksCount * 14;

    const systemPrompt = `Você é um estrategista de marketing digital e social media especialista em Instagram para a agência Brandify (@brandifycoo). A Brandify é uma agência de criação de sites profissionais e lojas virtuais que ajuda empresas de diversos nichos a venderem mais online.

IDENTIDADE VISUAL DA BRANDIFY — ESTILO EDITORIAL HUMANO:
- A estética DEVE parecer 100% criada por humanos, NUNCA por IA
- Cores base: preto suave, cinza quente, off-white
- Azul (#2563eb) APENAS como sotaque institucional discreto — nunca dominante
- PROIBIDO: gradientes, neon, glow, efeitos digitais, cores vibrantes saturadas

📸 DIRETRIZES DE IMAGEM (OBRIGATÓRIAS para imageDescription e visualDescription):
Sempre descrever fotografias REALISTAS de ambientes de trabalho:
- Mesas com notebooks, celulares, xícaras de café, mãos humanas trabalhando
- Bastidores reais de agência — sem poses artificiais
- Iluminação natural, sombras suaves, imperfeições reais (mesa levemente bagunçada, grão natural, tons quentes)
- A foto deve parecer tirada por um fotógrafo profissional num dia normal de trabalho

EVITAR COMPLETAMENTE nas descrições visuais:
- Ilustrações, mockups 3D, elementos futuristas, fundos artificiais
- Imagens "perfeitas demais" ou hiperpolidas
- Estética de template, startup futurista ou banco de imagem artificial
- Padrões visuais genéricos repetitivos

✍️ LAYOUT E COMPOSIÇÃO:
- Muito espaço em branco, texto bem posicionado e respirando
- Composição simples e elegante, estilo revista editorial
- Títulos curtos, objetivos e editoriais — linguagem confiante, sem tom de anúncio
- Nada de marketing agressivo ou CTA chamativo demais

🔤 TIPOGRAFIA (descrever nas artes):
- Títulos: fonte serifada editorial elegante (Playfair Display, Didot, Bodoni, Georgia) — bold ou italic
- Textos de apoio: sans-serif neutra e limpa (Inter, Helvetica)
- NUNCA usar fontes futuristas ou exageradamente tecnológicas

LOGO: Mencionar que a logo ">> brandify" e "@brandifycoo" aparecem discretamente no canto.

🧠 PRINCÍPIO FINAL: Todo conteúdo deve parecer "Criado por uma agência real, com pessoas reais, em um dia normal de trabalho." Se parecer IA, está ERRADO.

Responda APENAS em JSON válido com esta estrutura:
{
  "monthPlan": {
    "monthStrategy": "string (resumo geral da estratégia em 3-4 frases)",
    "weeks": [
      {
        "weekNumber": 1,
        "niche": "string (nicho da semana)",
        "theme": "string (tema/abordagem da semana)",
        "strategy": "string (estratégia específica)",
        "feedPosts": [
          {
            "id": "w1-feed-1",
            "day": "Quinta",
            "time": "19:00",
            "title": "string (OBRIGATÓRIO: o título DEVE ser autoexplicativo sobre o que a Brandify faz para aquele nicho. Exemplo CORRETO: 'Seu site odontológico vendendo 24h' ou 'Loja virtual para sua clínica'. Exemplo ERRADO: 'Café autêntico' ou 'Sorrisos perfeitos'. O título da imagem precisa explicar sozinho do que se trata o post, sem depender da legenda.)",
            "caption": "string (legenda completa com emojis e hashtags — complementa o título, não repete)",
            "imageDescription": "string (descrição DETALHADA da arte. A arte DEVE conter texto que conecte a Brandify ao nicho do cliente, ex: 'Brandify cria sites para dentistas' visível na imagem. NUNCA descrever uma imagem genérica do nicho sem mencionar criação de sites/lojas virtuais.)",
            "contentType": "carrossel|imagem|reels",
            "marketingTip": "string"
          }
        ],
        "stories": [
          {
            "id": "w1-story-1",
            "day": "Quinta",
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

    const userPrompt = `Gere o planejamento de Instagram para ${monthLabel || "o período"} (${weeksCount} semanas) com um NICHO DIFERENTE por semana:

${nichesList}

${brandContext ? `CONTEXTO ADICIONAL: ${brandContext}` : ""}

${calendarInstructions ? `CALENDÁRIO — SIGA RIGOROSAMENTE:\n${calendarInstructions}` : ""}

IMPORTANTE: Use weekNumber sequencial (1, 2, 3...) e os IDs devem ser w1-feed-1, w1-story-1, w2-feed-1, etc.
Cada semana deve focar 100% no nicho indicado, mostrando como a Brandify pode ajudar aquele tipo de cliente.
Total: ${totalFeed} posts no feed + ${totalStories} stories.`;

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

    const jsonStart = jsonStr.indexOf("{");
    const jsonEnd = jsonStr.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found in response");
    jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);

    jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, (ch) => {
      if (ch === "\n" || ch === "\r" || ch === "\t") return ch;
      return "";
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
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
