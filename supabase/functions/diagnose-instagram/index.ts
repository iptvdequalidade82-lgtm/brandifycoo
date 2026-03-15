import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type MetricStatus = "good" | "warning" | "critical";

const METRIC_NAMES = [
  "Bio e Apresentação",
  "Identidade Visual",
  "Estratégia de Conteúdo",
  "Uso de Reels",
  "Engajamento",
  "Frequência de Posts",
];

const NEGATIVE_SIGNAL_PATTERN = /(not found|page isn't available|perfil não encontrado|perfil indisponível|404|doesn't exist|conta inexistente|não foi possível acessar|profile is suspended|page not found|http error 429)/i;
const POSITIVE_SIGNAL_PATTERN = /(seguidores|followers|seguindo|following|publicações|posts|reels|bio|engajamento|curtidas|comentários|stories)/i;
const NUMERIC_SIGNAL_PATTERN = /(\d[\d.,\s]*\s*(followers|seguidores|following|seguindo|posts|publicações|reels|likes|curtidas|comments|comentários))/i;
const MIN_PARTIAL_DATA_LENGTH = 120;
const MIN_REAL_DATA_LENGTH = 260;

const toText = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
};

const normalizeStatus = (value: unknown): MetricStatus => {
  if (value === "good" || value === "warning" || value === "critical") return value;
  return "warning";
};

const clampScore = (value: unknown): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
};

const scoreLabelFromScore = (score: number) => {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Regular";
  if (score >= 20) return "Fraco";
  return "Crítico";
};

const normalizeDiagnosis = (raw: any, hasRealData: boolean) => {
  const score = clampScore(raw?.score);
  const rawMetrics = Array.isArray(raw?.metrics) ? raw.metrics : [];

  const metrics = METRIC_NAMES.map((metricName, index) => {
    const source = rawMetrics[index] ?? rawMetrics.find((m: any) => toText(m?.name, "").toLowerCase() === metricName.toLowerCase()) ?? {};
    return {
      name: metricName,
      value: toText(source?.value, "Não foi possível avaliar com os dados disponíveis."),
      status: normalizeStatus(source?.status),
      tip: toText(source?.tip, "Adicione métricas próprias para receber recomendações mais precisas."),
    };
  });

  const rawStrengths = Array.isArray(raw?.strengths) ? raw.strengths.filter((s: unknown) => typeof s === "string" && s.trim().length > 0) : [];
  const rawWeaknesses = Array.isArray(raw?.weaknesses) ? raw.weaknesses.filter((w: unknown) => typeof w === "string" && w.trim().length > 0) : [];
  const rawActions = Array.isArray(raw?.actionPlan) ? raw.actionPlan : [];

  const strengths = [
    rawStrengths[0] ?? "Existe oportunidade clara para melhorar a consistência de conteúdo.",
    rawStrengths[1] ?? "Há potencial para fortalecer posicionamento e autoridade do perfil.",
    rawStrengths[2] ?? "Com ajustes de formato e CTA, o perfil pode aumentar conversão.",
  ];

  const weaknesses = [
    rawWeaknesses[0] ?? "Faltam sinais claros de diferenciação da proposta de valor.",
    rawWeaknesses[1] ?? "A estrutura editorial pode estar pouco estratégica ou inconsistente.",
    rawWeaknesses[2] ?? "A comunicação pode ser mais orientada para objetivo de negócio.",
  ];

  const actionPlan = Array.from({ length: 5 }, (_, index) => {
    const source = rawActions[index] ?? {};
    return {
      priority: toText(source?.priority, index < 2 ? "alta" : index < 4 ? "media" : "baixa").toLowerCase(),
      action: toText(source?.action, `Definir ação estratégica #${index + 1} com foco em crescimento de alcance e conversão.`),
      expectedImpact: toText(source?.expectedImpact, "Melhorar consistência, posicionamento e performance do perfil no Instagram."),
    };
  });

  const summaryFallback = hasRealData
    ? "Diagnóstico concluído com base em dados públicos coletados e padrões de performance no Instagram."
    : "Não foi possível coletar dados públicos suficientes do perfil, então a análise foi baseada em melhores práticas e métricas informadas.";

  return {
    score,
    scoreLabel: toText(raw?.scoreLabel, scoreLabelFromScore(score)),
    summary: toText(raw?.summary, summaryFallback),
    metrics,
    strengths,
    weaknesses,
    actionPlan,
    _dataSource: hasRealData ? "real" : "general",
  };
};

const cleanHandleInput = (value: string) =>
  value
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .split(/[/?#]/)[0]
    .trim();

const extractJsonText = (text: string) => {
  const withoutFence = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  const firstBrace = withoutFence.indexOf("{");
  const lastBrace = withoutFence.lastIndexOf("}");
  const candidate = firstBrace >= 0 && lastBrace > firstBrace
    ? withoutFence.slice(firstBrace, lastBrace + 1)
    : withoutFence;

  return candidate
    .replace(/[\x00-\x1F\x7F]/g, (c: string) => (c === "\n" || c === "\r" || c === "\t" ? c : ""))
    .replace(/,\s*([}\]])/g, "$1")
    .trim();
};

const pushUniqueFragment = (fragments: string[], fragment: string, maxLength = 4500) => {
  const normalized = fragment.trim();
  if (!normalized) return;

  const clipped = normalized.length > maxLength ? normalized.substring(0, maxLength) : normalized;
  if (!fragments.includes(clipped)) fragments.push(clipped);
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assessDataSignals = (searchResults: string, cleanHandle: string) => {
  const normalized = searchResults.toLowerCase();
  const hasPositiveSignals = POSITIVE_SIGNAL_PATTERN.test(normalized);
  const hasNegativeSignals = NEGATIVE_SIGNAL_PATTERN.test(normalized);
  const hasNumericSignals = NUMERIC_SIGNAL_PATTERN.test(normalized);
  const handlePattern = new RegExp(`(^|[^a-z0-9_])@?${escapeRegex(cleanHandle)}([^a-z0-9_]|$)`, "i");
  const hasHandleMention = handlePattern.test(searchResults);

  const signalScore =
    (hasPositiveSignals ? 1 : 0) +
    (hasNumericSignals ? 2 : 0) +
    (hasHandleMention ? 1 : 0) -
    (hasNegativeSignals ? 2 : 0);

  const hasRealData = searchResults.length >= MIN_REAL_DATA_LENGTH && signalScore >= 2;
  const hasPartialData = !hasRealData && searchResults.length >= MIN_PARTIAL_DATA_LENGTH && signalScore >= 1;

  return {
    hasRealData,
    hasPartialData,
    signalScore,
    hasPositiveSignals,
    hasNegativeSignals,
    hasNumericSignals,
    hasHandleMention,
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { handle, extraMetrics } = await req.json();
    if (!handle) throw new Error("Handle é obrigatório");

    const cleanHandle = cleanHandleInput(handle);
    if (!cleanHandle) throw new Error("Informe um @ válido do Instagram");

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("Firecrawl não configurado");

    console.log("Searching for Instagram profile:", cleanHandle);

    const searchQueries = [
      `site:instagram.com "${cleanHandle}" followers posts bio`,
      `"@${cleanHandle}" instagram perfil`,
      `site:instagram.com/${cleanHandle} reels publicações`,
      `"${cleanHandle}" instagram seguidores`,
      `site:dumpor.com "${cleanHandle}" instagram`,
      `site:greatfon.com "${cleanHandle}" instagram`,
    ];

    const fragments: string[] = [];

    for (const query of searchQueries) {
      try {
        const searchRes = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            limit: 6,
            scrapeOptions: { formats: ["markdown"] },
          }),
        });

        const searchData = await searchRes.json();

        if (searchRes.ok && Array.isArray(searchData?.data)) {
          for (const result of searchData.data) {
            const chunk = [
              `Fonte: ${result?.url || "N/A"}`,
              `Título: ${result?.title || "N/A"}`,
              `Descrição: ${result?.description || "N/A"}`,
              typeof result?.markdown === "string" ? result.markdown.substring(0, 2200) : "",
            ]
              .filter(Boolean)
              .join("\n");

            pushUniqueFragment(fragments, chunk, 2800);
          }
        }
      } catch (e) {
        console.error("Search query failed:", query, e);
      }
    }

    const scrapeTargets = [
      `https://www.instagram.com/${cleanHandle}/`,
      `https://imginn.com/${cleanHandle}/`,
      `https://dumpor.com/v/${cleanHandle}`,
      `https://greatfon.com/v/${cleanHandle}`,
      `https://inflact.com/tools/profile-analyzer/?profile=${cleanHandle}`,
      `https://www.picuki.com/profile/${cleanHandle}`,
    ];

    for (const url of scrapeTargets) {
      try {
        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["markdown"],
            waitFor: 2000,
          }),
        });

        const scrapeData = await scrapeRes.json();

        if (scrapeRes.ok) {
          const md = scrapeData?.data?.markdown || scrapeData?.markdown || "";
          if (typeof md === "string" && md.trim().length > 0) {
            pushUniqueFragment(fragments, `Fonte: ${url}\n${md}`, 4200);
          }
        }
      } catch (e) {
        console.error("Scrape target failed:", url, e);
      }
    }

    const searchResults = fragments.join("\n\n---\n\n").trim();
    const {
      hasRealData,
      hasPartialData,
      signalScore,
      hasPositiveSignals,
      hasNegativeSignals,
      hasNumericSignals,
      hasHandleMention,
    } = assessDataSignals(searchResults, cleanHandle);

    console.log("Total search results length:", searchResults.length);
    console.log("Signals:", {
      hasRealData,
      hasPartialData,
      signalScore,
      hasPositiveSignals,
      hasNegativeSignals,
      hasNumericSignals,
      hasHandleMention,
      fragmentCount: fragments.length,
    });

    const prompt = hasRealData
      ? `Você é um especialista sênior em marketing digital e Instagram.

Analise APENAS os dados reais abaixo sobre @${cleanHandle}. NÃO invente.
Se algum ponto for incerto, informe de forma explícita e sugera próximos passos.

=== DADOS COLETADOS ===
${searchResults.substring(0, 12000)}
=== FIM DOS DADOS ===
${extraMetrics ? `\n=== MÉTRICAS INFORMADAS PELO CLIENTE ===\n${extraMetrics}\n=== FIM DAS MÉTRICAS ===\n` : ""}

Retorne SOMENTE JSON válido com este formato (sem markdown):
{
  "score": 0,
  "scoreLabel": "Crítico|Fraco|Regular|Bom|Excelente",
  "summary": "Resumo objetivo e estratégico",
  "metrics": [
    { "name": "Bio e Apresentação", "value": "...", "status": "good|warning|critical", "tip": "..." },
    { "name": "Identidade Visual", "value": "...", "status": "good|warning|critical", "tip": "..." },
    { "name": "Estratégia de Conteúdo", "value": "...", "status": "good|warning|critical", "tip": "..." },
    { "name": "Uso de Reels", "value": "...", "status": "good|warning|critical", "tip": "..." },
    { "name": "Engajamento", "value": "...", "status": "good|warning|critical", "tip": "..." },
    { "name": "Frequência de Posts", "value": "...", "status": "good|warning|critical", "tip": "..." }
  ],
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "actionPlan": [
    { "priority": "alta", "action": "...", "expectedImpact": "..." },
    { "priority": "alta", "action": "...", "expectedImpact": "..." },
    { "priority": "media", "action": "...", "expectedImpact": "..." },
    { "priority": "media", "action": "...", "expectedImpact": "..." },
    { "priority": "baixa", "action": "...", "expectedImpact": "..." }
  ]
}

Regra crítica: nenhum campo pode vir vazio.`
      : `Você é um especialista em marketing digital e Instagram.

Não foi possível coletar dados públicos suficientes para @${cleanHandle}.
${extraMetrics ? `Use fortemente as métricas fornecidas pelo cliente para personalizar a análise: ${extraMetrics}.` : "Faça uma análise estratégica baseada em boas práticas para perfis comerciais."}

Retorne SOMENTE JSON válido (sem markdown) no formato:
{
  "score": 0,
  "scoreLabel": "Análise Geral",
  "summary": "Explique com transparência que houve baixa visibilidade de dados públicos e entregue diagnóstico prático",
  "metrics": [
    { "name": "Bio e Apresentação", "value": "...", "status": "good|warning|critical", "tip": "..." },
    { "name": "Identidade Visual", "value": "...", "status": "good|warning|critical", "tip": "..." },
    { "name": "Estratégia de Conteúdo", "value": "...", "status": "good|warning|critical", "tip": "..." },
    { "name": "Uso de Reels", "value": "...", "status": "good|warning|critical", "tip": "..." },
    { "name": "Engajamento", "value": "...", "status": "good|warning|critical", "tip": "..." },
    { "name": "Frequência de Posts", "value": "...", "status": "good|warning|critical", "tip": "..." }
  ],
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "actionPlan": [
    { "priority": "alta", "action": "...", "expectedImpact": "..." },
    { "priority": "alta", "action": "...", "expectedImpact": "..." },
    { "priority": "media", "action": "...", "expectedImpact": "..." },
    { "priority": "media", "action": "...", "expectedImpact": "..." },
    { "priority": "baixa", "action": "...", "expectedImpact": "..." }
  ]
}

Regra crítica: nenhum campo pode vir vazio.`;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.6,
        },
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Limite de requisições atingido. Tente novamente em alguns segundos.");
      const errorText = await res.text();
      console.error("Gemini diagnose error:", res.status, errorText);
      throw new Error("Erro ao consultar IA");
    }

    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!responseText) throw new Error("IA não retornou resposta");

    const cleanedJson = extractJsonText(responseText);
    let parsed: any;

    try {
      parsed = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("Failed to parse AI diagnosis JSON", parseError, cleanedJson.substring(0, 1000));
      throw new Error("Não foi possível interpretar o diagnóstico gerado. Tente novamente.");
    }

    const diagnosis = normalizeDiagnosis(parsed, hasRealData);

    return new Response(JSON.stringify(diagnosis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("diagnose-instagram error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});