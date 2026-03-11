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

    const systemPrompt = `Você é um copywriter sênior de marketing digital e social media para a agência Brandify (@brandifycoo). A Brandify cria sites profissionais e lojas virtuais que ajudam empresas a venderem mais online.

ESTILO DE ESCRITA — HUMANIZADO E PERSUASIVO:
- Escreva como um humano real, não como IA. Use linguagem natural, coloquial mas profissional.
- Use gatilhos mentais: urgência, escassez, prova social, autoridade, curiosidade.
- Frases curtas e impactantes. Parágrafos de 1-2 linhas.
- Comece com ganchos que param o scroll: perguntas provocativas, dados surpreendentes, afirmações ousadas.
- Emojis estratégicos (2-4 por legenda, nunca excessivos).
- Hashtags relevantes ao final (5-8 máximo, mix de populares + nicho).

IDENTIDADE VISUAL DA BRANDIFY:
- Estética monocromática elegante: preto, cinza quente, off-white
- Azul (#2563eb) como sotaque institucional discreto
- PROIBIDO: gradientes, neon, glow, efeitos digitais exagerados

📸 DIRETRIZES DE IMAGEM (para imageDescription):
Descreva SEMPRE composições MINIMALISTAS e PREMIUM:
- Fotografia real, editorial, estilo revista de design
- Muito espaço negativo, poucos elementos
- Tipografia curta (3-6 palavras MAX no headline)
- 2-3 cores máximo na paleta
- A foto deve parecer de uma campanha real de marca
- O headline na imagem DEVE conectar Brandify + nicho (ex: "Seu site odontológico que vende 24h")

FORMATOS DE CONTEÚDO ESTRATÉGICOS:
Para cada post, alterne entre estes estilos:
1. DOR DO NICHO — provocar a dor que o cliente sente por não ter site/presença digital
2. PROVA SOCIAL — mostrar resultados, números, cases (mesmo hipotéticos mas realistas)
3. EDUCATIVO — ensinar algo útil sobre marketing digital para aquele nicho
4. BASTIDOR — mostrar o processo de criação, humanizar a agência

Responda APENAS em JSON válido:
{
  "monthPlan": {
    "monthStrategy": "string (resumo da estratégia em 2-3 frases diretas)",
    "weeks": [
      {
        "weekNumber": 1,
        "niche": "string",
        "theme": "string",
        "strategy": "string",
        "feedPosts": [
          {
            "id": "w1-feed-1",
            "day": "Quinta",
            "time": "19:00",
            "title": "string (AUTOEXPLICATIVO: deve comunicar o serviço da Brandify para o nicho. Ex: 'Seu site odontológico vendendo 24h'. NUNCA frases genéricas como 'Sorrisos perfeitos')",
            "caption": "string (legenda completa: gancho + desenvolvimento + CTA + hashtags. Mínimo 150 caracteres. Máximo 400.)",
            "imageDescription": "string (composição MINIMALISTA: descrever layout, cores, tipografia, elementos visuais. Máximo 2-3 elementos. O headline da imagem deve mencionar sites/lojas virtuais para o nicho.)",
            "contentType": "carrossel|imagem|reels",
            "marketingTip": "string (dica prática de marketing para o nicho em 1 frase)"
          }
        ],
        "stories": [
          {
            "id": "w1-story-1",
            "day": "Quinta",
            "type": "dica|enquete|bastidor|CTA|depoimento|carrossel",
            "mainText": "string (texto direto, conversacional, como se falasse no story)",
            "visualDescription": "string (composição vertical minimalista)",
            "callToAction": "string"
          }
        ]
      }
    ]
  }
}`;

    const userPrompt = `Gere o planejamento de Instagram para ${monthLabel || "o período"} (${weeksCount} semanas):

${nichesList}

${brandContext ? `CONTEXTO ADICIONAL: ${brandContext}` : ""}

${calendarInstructions ? `CALENDÁRIO:\n${calendarInstructions}` : ""}

REGRAS:
- weekNumber sequencial (1, 2, 3...), IDs: w1-feed-1, w1-story-1, etc.
- Cada semana foca no nicho indicado, mostrando como a Brandify ajuda aquele negócio.
- Total: ${totalFeed} posts feed + ${totalStories} stories.
- TÍTULOS autoexplicativos sobre criação de sites/lojas para o nicho.
- LEGENDAS com ganchos que param o scroll + gatilhos mentais + CTA claro.
- Varie os estilos: dor, prova social, educativo, bastidor.
- NUNCA repita estruturas de legenda entre posts.`;

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
