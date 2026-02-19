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

IDENTIDADE VISUAL DA BRANDIFY:
- Cores: preto (#0a0a0a), branco, azul royal (#2563eb)
- Estilo: dark, moderno, profissional, impactante
- Referências visuais: artes estilo Canva Pro com fundo escuro/preto, tipografia bold grande, mockups de celulares/notebooks mostrando sites, ícones minimalistas
- O feed atual usa frases provocativas em destaque ("QUEM NÃO É VISTO NÃO É LEMBRADO. VENDE.", "SE O INSTAGRAM CAIR HOJE, SUA LOJA SOBREVIVE?", "COMO PARAR DE ATRAIR CURIOSOS")
- Parceria entre a Brandify e o nicho do cliente deve ser destacada

PROPOSTA DE VALOR CENTRAL:
A Brandify cria sites e lojas virtuais que VENDEM. Cada post deve conectar o nicho do cliente com a necessidade de ter presença digital profissional. A mensagem central é: "Sua empresa do nicho X precisa de um site profissional pra vender mais, e a Brandify faz isso pra você."

Sua missão é gerar um PLANEJAMENTO de conteúdo para Instagram para ${monthLabel || "o período"}. CADA SEMANA FOCA EM UM NICHO DE CLIENTE DIFERENTE.

TOTAL: ${totalFeed} posts no feed + ${totalStories} stories

REGRAS DE CONTEÚDO:
- Tudo em PORTUGUÊS DO BRASIL
- Cada post do feed deve ter: título curto e provocativo (estilo frase de impacto), legenda completa com emojis e hashtags, descrição detalhada da arte/imagem (para geração por IA), horário sugerido, dia da semana, tipo de conteúdo
- Cada story deve ter: texto principal (curto, impactante), descrição do visual, tipo (enquete, dica, bastidor, CTA, depoimento, carrossel), dia da semana, CTA
- As legendas devem usar copywriting persuasivo com gatilhos mentais (urgência, prova social, autoridade, escassez)
- Tom de voz: direto, confiante, provocativo mas profissional

ESTRATÉGIA DE CONTEÚDO POR POST (REGRA OBRIGATÓRIA):
Cada semana tem 2 posts no feed. Eles DEVEM seguir este padrão:
- POST 1 — "DOR DO NICHO": Focado 100% na dor/problema específico do nicho da semana. Deve provocar, cutucar, mostrar o que o cliente do nicho está perdendo por não ter um site/loja profissional. Exemplo: "Sua clínica depende de indicação? Enquanto você espera, seu concorrente aparece no Google." É direto, agressivo, específico.
- POST 2 — "NEUTRO/GERAL": Conteúdo mais amplo e generalizado sobre presença digital, vendas online, ou autoridade da Brandify. Não menciona o nicho diretamente. Exemplo: "80% dos clientes pesquisam no Google antes de comprar. Cadê seu site?", "Um site profissional trabalha por você 24h por dia", "Você sabia que empresas com site vendem 3x mais?". É inspiracional, educativo, serve pra qualquer público.

PARA STORIES: Alternar entre conteúdo específico do nicho e conteúdo geral/bastidores da Brandify. Não deixar todos os stories focados apenas no nicho — intercalar com dicas gerais, provas sociais da Brandify, e CTAs universais.

DESCRIÇÃO DAS ARTES (campo imageDescription e visualDescription):
REGRA CRÍTICA: Cada arte deve ter uma descrição ÚNICA e DIFERENTE. Mesmo que dois posts abordem temas parecidos (ex: "clínica sem site" e "barbearia sem site"), a descrição visual deve variar COMPLETAMENTE em:
- Layout (ora mockup de celular, ora texto gigante centralizado, ora divisão em blocos, ora estilo cartão, ora slide de apresentação)
- Composição (ora texto à esquerda com gráfico à direita, ora centralizado, ora assimétrico)
- Elementos visuais (ora mockup de notebook, ora ícones, ora setas, ora linhas geométricas, ora gráficos abstratos)
- Ângulo do texto (ora frase provocativa curta, ora pergunta retórica, ora dado estatístico impactante)

PALETA OBRIGATÓRIA — DESCREVA USANDO APENAS:
- Fundo: PRETO PURO (#000000 / #0a0a0a) — sem cores quentes, sem gradientes coloridos
- Texto: BRANCO (#FFFFFF)
- Destaque: AZUL ROYAL (#2563eb) — para palavras-chave, ícones, linhas
- PROIBIDO: vermelho, verde, amarelo, laranja, rosa, roxo ou qualquer cor vibrante
- O visual deve ser SÓBRIO, PREMIUM e ESCURO

LOGO: Mencionar na descrição que a logo da Brandify (símbolo ">>" em azul + texto "brandify" em branco) deve aparecer no canto superior direito ou inferior direito.
@brandifycoo como marca d'água discreta.
NUNCA incluir rostos humanos realistas — usar silhuetas, ícones ou formas abstratas.

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
            "title": "string",
            "caption": "string (legenda completa com emojis e hashtags)",
            "imageDescription": "string (descrição DETALHADA da arte)",
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
