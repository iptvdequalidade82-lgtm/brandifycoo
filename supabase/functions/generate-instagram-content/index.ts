import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Niche Psychology Database ──
const NICHE_PSYCHOLOGY: Record<string, { pains: string[]; desires: string[]; objections: string[]; keywords: string[] }> = {
  "dentista|odontologia|sorriso": {
    pains: ["Pacientes que só aparecem com dor", "Agenda vazia na segunda", "Pacientes que somem após orçamento", "Perder para concorrentes com Instagram bonito"],
    desires: ["Agenda lotada todos os dias", "Pacientes de alto ticket", "Ser referência da região", "Faturar 6 dígitos/mês"],
    objections: ["Site não traz paciente", "Instagram já funciona", "Marketing é caro"],
    keywords: ["implante", "ortodontia", "harmonização", "clareamento", "sorriso"],
  },
  "advogado|advocacia|jurídico|direito": {
    pains: ["Clientes que pedem desconto", "Depender de indicação", "Não ser encontrado no Google", "Concorrentes investindo em marketing"],
    desires: ["Clientes de alto valor", "Autoridade digital", "Casos mais complexos e rentáveis", "Escritório reconhecido"],
    objections: ["OAB restringe publicidade", "Meu nicho é diferente", "Já tenho indicações"],
    keywords: ["trabalhista", "tributário", "criminal", "família", "empresarial"],
  },
  "barbearia|barbeiro|barba": {
    pains: ["Clientes que vão só pelo preço", "Agenda vazia no meio da semana", "Não conseguir fidelizar", "Concorrentes abrindo perto"],
    desires: ["Agenda lotada todo dia", "Clientes fiéis que voltam", "Ser a barbearia referência", "Cobrar mais pelo serviço"],
    objections: ["Meus clientes não usam internet", "Já posto no Instagram", "Barbearia é presencial"],
    keywords: ["corte", "barba", "degradê", "pigmentação", "platinado"],
  },
  "restaurante|comida|food|gastronomia": {
    pains: ["Delivery dominando as vendas", "Mesas vazias fora do horário", "Depender de iFood", "Não ter presença digital forte"],
    desires: ["Casa cheia todo dia", "Delivery próprio lucrativo", "Cardápio digital bonito", "Ser o restaurante da moda"],
    objections: ["Já estou no iFood", "Comida vende sozinha", "Marketing não funciona para restaurante"],
    keywords: ["cardápio", "delivery", "reserva", "chef", "experiência gastronômica"],
  },
  "academia|fitness|gym|treino|personal": {
    pains: ["Alunos que cancelam em 3 meses", "Não conseguir novos alunos", "Concorrência de smart fit", "Dificuldade em mostrar resultados"],
    desires: ["Lista de espera de alunos", "Retenção acima de 80%", "Ser a academia premium da região", "Personal com agenda lotada"],
    objections: ["Aluno quer preço baixo", "Já tenho Instagram", "Meu público é local"],
    keywords: ["musculação", "crossfit", "funcional", "emagrecimento", "hipertrofia"],
  },
  "salão|cabeleireiro|beleza|beauty": {
    pains: ["Horários vazios na agenda", "Clientes que não voltam", "Preço baixo para competir", "Concorrentes com Instagram bonito"],
    desires: ["Agenda lotada por 2 meses", "Clientes de alto ticket", "Ser referência em beleza", "Cobrar mais caro com confiança"],
    objections: ["Minhas clientes vêm por indicação", "Já posto fotos", "Salão é presencial"],
    keywords: ["coloração", "mechas", "corte", "escova", "tratamento capilar"],
  },
  "imobiliária|imóvel|corretor|casa": {
    pains: ["Leads frios", "Concorrência online brutal", "Portais cobrando caro", "Clientes que somem"],
    desires: ["Leads qualificados todo dia", "Site próprio que converte", "Autoridade no mercado imobiliário", "Vendas acima de R$500k"],
    objections: ["Já uso portais", "Imóvel vende presencialmente", "Meu CRM já funciona"],
    keywords: ["apartamento", "casa", "loteamento", "financiamento", "construtora"],
  },
  "clínica|médico|saúde|hospital": {
    pains: ["Pacientes que não retornam", "Depender de convênios", "Não ser encontrado online", "Agenda com buracos"],
    desires: ["Pacientes particulares de alto valor", "Agenda cheia toda semana", "Ser referência médica", "Faturamento sem convênio"],
    objections: ["CFM restringe marketing", "Pacientes vêm por convênio", "Saúde é diferente"],
    keywords: ["consulta", "exame", "tratamento", "especialista", "clínica"],
  },
  "pet|pet shop|cachorro|gato|veterinário": {
    pains: ["Concorrência de grandes redes", "Clientes só de banho e tosa", "Não vender produtos premium", "Falta de diferenciação"],
    desires: ["Clientes fiéis mensais", "Vender planos e pacotes", "Ser o pet shop queridinho", "Ticket médio alto"],
    objections: ["Meus clientes são do bairro", "Pet shop é local", "Já tenho WhatsApp"],
    keywords: ["banho", "tosa", "ração", "vacina", "adestramento"],
  },
  "contabilidade|contador|financeiro": {
    pains: ["Clientes que só querem o barato", "Perder clientes para contabilidade online", "Não demonstrar valor", "Depender de indicação"],
    desires: ["Clientes empresariais de alto valor", "Autoridade digital", "Escalar sem contratar", "Ser referência tributária"],
    objections: ["Contabilidade é técnica", "Meus clientes não estão online", "Já tenho carteira cheia"],
    keywords: ["imposto", "CNPJ", "MEI", "tributário", "fiscal"],
  },
};

// ── Viral Content Frameworks ──
const CAPTION_FRAMEWORKS = [
  { name: "PAS", desc: "Problema → Agitação → Solução. Comece com a dor, agite o problema, ofereça a solução." },
  { name: "AIDA", desc: "Atenção → Interesse → Desejo → Ação. Hook forte, desenvolva interesse, crie desejo, CTA direto." },
  { name: "BAB", desc: "Before → After → Bridge. Mostre o antes (sem site), o depois (com resultados), a ponte (Brandify)." },
  { name: "STORYTELLING", desc: "Conte uma mini-história real ou hipotética de transformação de um cliente do nicho." },
  { name: "CONTRARIAN", desc: "Afirmação polêmica/contraintuitiva que quebra padrões. Ex: 'Seu Instagram bonito está te fazendo PERDER clientes'." },
  { name: "LISTICLE", desc: "Lista numerada de dicas, erros ou razões. Ex: '5 motivos que sua clínica perde pacientes online'." },
];

const HOOK_PATTERNS = [
  "Pergunta provocativa que expõe uma dor escondida",
  "Dado/número surpreendente (real ou estimativa realista)",
  "Afirmação ousada que gera curiosidade",
  "Mini-história em 1 linha que prende",
  "'Pare de [erro comum]' — imperativo direto",
  "'Enquanto você [ação], seu concorrente [vantagem]'",
  "'Se você é [profissão] e ainda não tem [coisa], leia isso'",
  "'Isso aqui salvou [resultado] para [tipo de cliente]'",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const extractGatewayText = (payload: any): string => {
  const raw = payload?.choices?.[0]?.message?.content;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((part: any) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        return "";
      })
      .join("");
  }
  return "";
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { niches, brandContext, monthLabel, weeksConfig } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const nichesList = niches.map((n: string, i: number) => {
      const wl = weeksConfig?.[i];
      return `- ${wl?.label || `Semana ${i + 1}`}: ${n}`;
    }).join("\n");

    const weeksCount = niches.length;

    // ── Detect niche psychology for each week ──
    const normalizeText = (text: string) =>
      text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const nichePsychologyBlocks = niches.map((niche: string, i: number) => {
      const normalized = normalizeText(niche);
      let matched: typeof NICHE_PSYCHOLOGY[string] | null = null;

      for (const [keywords, data] of Object.entries(NICHE_PSYCHOLOGY)) {
        if (keywords.split("|").some(kw => normalized.includes(normalizeText(kw)))) {
          matched = data;
          break;
        }
      }

      if (!matched) return `Semana ${i + 1} (${niche}): Adapte o conteúdo com dores reais desse nicho.`;

      return `Semana ${i + 1} (${niche}):
  DORES REAIS: ${matched.pains.join(" | ")}
  DESEJOS: ${matched.desires.join(" | ")}
  OBJEÇÕES COMUNS: ${matched.objections.join(" | ")}
  PALAVRAS-CHAVE DO NICHO: ${matched.keywords.join(", ")}`;
    }).join("\n\n");

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

    // Select random frameworks for variety
    const selectedFrameworks = CAPTION_FRAMEWORKS.sort(() => Math.random() - 0.5).slice(0, 4);
    const selectedHooks = HOOK_PATTERNS.sort(() => Math.random() - 0.5).slice(0, 4);

    const systemPrompt = `Você é um ESTRATEGISTA DE CONTEÚDO SÊNIOR com 15 anos de experiência em marketing digital, copywriting e social media. Você trabalha para a Brandify (@brandifycoo), uma agência que cria sites e lojas virtuais profissionais.

## SUA MISSÃO
Gerar conteúdo que PARA O SCROLL, gera ENGAJAMENTO REAL e CONVERTE seguidores em clientes. Cada post deve ter um OBJETIVO ESTRATÉGICO claro.

## PSICOLOGIA DO NICHO (USE OBRIGATORIAMENTE)
${nichePsychologyBlocks}

## FRAMEWORKS DE COPYWRITING (ALTERNE ENTRE ELES)
${selectedFrameworks.map(f => `- ${f.name}: ${f.desc}`).join("\n")}

## PADRÕES DE HOOK PARA GANCHOS
${selectedHooks.map((h, i) => `${i + 1}. ${h}`).join("\n")}

## REGRAS DE COPYWRITING HUMANIZADO
1. PROIBIDO começar com "Você sabia que..." em mais de 1 post. Varie os ganchos.
2. PROIBIDO usar frases genéricas como "No mundo digital de hoje" ou "Em um mercado competitivo".
3. PROIBIDO legendas que pareçam IA — use gírias profissionais naturais, contrações, tom conversacional.
4. Cada legenda DEVE ter: gancho (1ª linha), desenvolvimento (2-4 linhas), CTA forte (última linha).
5. Emojis: 2-4 por legenda, estratégicos e nunca no início da primeira linha.
6. Hashtags: 5-8, mix de volume alto + nicho específico. SEMPRE ao final.
7. MÍNIMO 180 caracteres, MÁXIMO 450. Parágrafos curtos de 1-2 linhas com quebras.
8. Tom: direto, confiante, levemente provocativo. Como um amigo especialista falando verdades.

## TIPOS DE POST (ALTERNE OBRIGATORIAMENTE)
Para cada semana com 2 posts, use combinações diferentes:
- POST DE DOR: Expõe um problema real que o cliente do nicho enfrenta. Agita a dor. Apresenta a solução (Brandify).
- POST DE PROVA: Case de sucesso (real ou hipotético-realista). Números concretos. Transformação antes/depois.
- POST EDUCATIVO: Ensina algo útil sobre marketing/presença digital para o nicho. Posiciona como autoridade.
- POST DE AUTORIDADE: Mostra bastidores, processo de trabalho, expertise da equipe.
- POST DE ENGAJAMENTO: Pergunta provocativa, enquete, "concorda ou discorda?", caixa de resposta.
- POST DE VENDA DIRETA: Oferta clara com urgência/escassez. CTA para WhatsApp ou link.

## TÍTULOS DAS IMAGENS (AUTOEXPLICATIVOS)
O título DEVE comunicar o serviço da Brandify para o nicho específico.
✅ BOM: "Seu site odontológico vendendo 24h", "Loja virtual que lota sua barbearia"
❌ RUIM: "Sorrisos perfeitos", "Transformação digital", "Inovação"

## DESCRIÇÃO DA ARTE (imageDescription)
Descreva composições PREMIUM e MINIMALISTAS:
- Fotografia editorial real, estilo revista de design
- MUITO espaço negativo, poucos elementos (máx 2-3)
- Headline curto (3-6 palavras) que conecta Brandify + nicho
- 2-3 cores na paleta
- DEVE parecer feito por designer profissional, NUNCA parecer IA
- Inclua ELEMENTOS VISUAIS ESPECÍFICOS DO NICHO (ferramentas, ambiente, produtos do negócio)
- A arte deve ser autoexplicativa mesmo sem ler a legenda

## STORIES ESTRATÉGICOS
Stories devem seguir uma JORNADA DIÁRIA:
- Story 1 do dia: Conteúdo de valor ou curiosidade (puxa atenção)
- Story 2 do dia: CTA ou engajamento (converte a atenção)

Tipos: dica prática, enquete provocativa, bastidor real, CTA direto, depoimento, carrossel de antes/depois.

## IDENTIDADE VISUAL
- Estética monocromática elegante: preto, cinza quente, off-white
- Azul (#2563eb) como sotaque institucional discreto
- PROIBIDO: gradientes, neon, glow, efeitos digitais exagerados

Responda APENAS em JSON válido (sem markdown, sem comentários):
{
  "monthPlan": {
    "monthStrategy": "string (resumo da estratégia mensal em 2-3 frases — mencione os nichos e o objetivo)",
    "weeks": [
      {
        "weekNumber": 1,
        "niche": "string",
        "theme": "string (tema estratégico da semana)",
        "strategy": "string (abordagem específica: qual dor atacar, qual desejo ativar)",
        "feedPosts": [
          {
            "id": "w1-feed-1",
            "day": "Quinta",
            "time": "19:00",
            "title": "string (AUTOEXPLICATIVO sobre Brandify + nicho)",
            "caption": "string (gancho + desenvolvimento + CTA + hashtags. 180-450 chars)",
            "imageDescription": "string (composição MINIMALISTA com elementos visuais DO NICHO. Headline da imagem conecta Brandify + nicho)",
            "contentType": "carrossel|imagem|reels",
            "marketingTip": "string (dica PRÁTICA e ESPECÍFICA para o nicho)"
          }
        ],
        "stories": [
          {
            "id": "w1-story-1",
            "day": "Quinta",
            "type": "dica|enquete|bastidor|CTA|depoimento|carrossel",
            "mainText": "string (conversacional, direto, como se falasse no story)",
            "visualDescription": "string (composição vertical MINIMALISTA com elementos do nicho)",
            "callToAction": "string"
          }
        ]
      }
    ]
  }
}`;

    const userPrompt = `Gere o planejamento ESTRATÉGICO de Instagram para ${monthLabel || "o período"} (${weeksCount} semanas):

${nichesList}

${brandContext ? `CONTEXTO ADICIONAL DO CLIENTE: ${brandContext}` : ""}

${calendarInstructions ? `CALENDÁRIO EXATO:\n${calendarInstructions}` : ""}

CHECKLIST OBRIGATÓRIO:
✅ weekNumber sequencial (1, 2, 3...), IDs: w1-feed-1, w1-story-1, etc.
✅ Cada semana foca no nicho indicado — USE AS DORES E DESEJOS REAIS do banco de psicologia.
✅ Total: ${totalFeed} posts feed + ${totalStories} stories.
✅ TÍTULOS autoexplicativos sobre criação de sites/lojas para o nicho.
✅ LEGENDAS com gancho na 1ª linha + framework de copy + CTA claro.
✅ Alterne os tipos de post: dor, prova, educativo, autoridade, engajamento, venda.
✅ NUNCA repita estrutura de legenda entre posts (varie ganchos, frameworks, tons).
✅ imageDescription com elementos visuais ESPECÍFICOS do nicho (ferramentas, ambiente, produtos).
✅ Stories em pares: 1 de valor + 1 de conversão por dia.
✅ Horários variados e estratégicos (17h-21h para feed, manhã/noite para stories).`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gemini error:", response.status, t);
      throw new Error("Erro no serviço de IA");
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

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
