import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { handle } = await req.json();
    if (!handle) throw new Error("Handle é obrigatório");

    const cleanHandle = handle.replace(/^@/, "").trim();

    // Step 1: Use Firecrawl search to find real info about the Instagram profile
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("Firecrawl não configurado");

    console.log("Searching for Instagram profile:", cleanHandle);

    // Search for the profile info from multiple angles
    const searchQueries = [
      `site:instagram.com "${cleanHandle}" bio followers`,
      `"@${cleanHandle}" instagram perfil`,
    ];

    let searchResults = "";

    for (const query of searchQueries) {
      try {
        const searchRes = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            limit: 5,
            scrapeOptions: { formats: ["markdown"] },
          }),
        });

        const searchData = await searchRes.json();
        if (searchRes.ok && searchData?.data) {
          for (const result of searchData.data) {
            searchResults += `\n--- Fonte: ${result.url || "N/A"} ---\n`;
            searchResults += `Título: ${result.title || "N/A"}\n`;
            searchResults += `Descrição: ${result.description || "N/A"}\n`;
            if (result.markdown) {
              searchResults += result.markdown.substring(0, 2000) + "\n";
            }
          }
        }
      } catch (e) {
        console.error("Search query failed:", query, e);
      }
    }

    // Also try scraping a third-party Instagram viewer
    try {
      const viewerRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: `https://imginn.com/${cleanHandle}/`,
          formats: ["markdown"],
          waitFor: 2000,
        }),
      });

      const viewerData = await viewerRes.json();
      if (viewerRes.ok) {
        const md = viewerData?.data?.markdown || viewerData?.markdown || "";
        if (md) {
          searchResults += `\n--- Dados do perfil (viewer) ---\n${md.substring(0, 4000)}\n`;
        }
      }
    } catch (e) {
      console.error("Viewer scrape failed:", e);
    }

    console.log("Total search results length:", searchResults.length);

    // Step 2: Send real data to AI
    const hasRealData = searchResults.length > 100;

    const prompt = hasRealData
      ? `Você é um especialista em marketing digital e Instagram com anos de experiência.

Abaixo estão dados REAIS coletados da internet sobre o perfil @${cleanHandle} no Instagram. Analise APENAS o que você consegue ver nos dados. NÃO INVENTE informações. Se algo não está nos dados, diga "Não foi possível avaliar com os dados disponíveis".

=== DADOS REAIS COLETADOS ===
${searchResults.substring(0, 10000)}
=== FIM DOS DADOS ===

Com base nos dados acima, faça um diagnóstico honesto. Se há pouco conteúdo visível, reflita isso no score. Não invente posts, reels ou métricas que não estão nos dados.

Responda APENAS com JSON válido (sem markdown, sem \`\`\`):
{
  "score": (número de 0 a 100),
  "scoreLabel": "(Crítico / Fraco / Regular / Bom / Excelente)",
  "summary": "(resumo honesto baseado nos dados reais encontrados)",
  "metrics": [
    { "name": "Bio e Apresentação", "value": "(baseado nos dados reais)", "status": "good|warning|critical", "tip": "(dica específica)" },
    { "name": "Identidade Visual", "value": "(baseado nos dados reais)", "status": "good|warning|critical", "tip": "(dica)" },
    { "name": "Estratégia de Conteúdo", "value": "(baseado nos dados reais)", "status": "good|warning|critical", "tip": "(dica)" },
    { "name": "Uso de Reels", "value": "(baseado nos dados reais)", "status": "good|warning|critical", "tip": "(dica)" },
    { "name": "Engajamento", "value": "(baseado nos dados reais)", "status": "good|warning|critical", "tip": "(dica)" },
    { "name": "Frequência de Posts", "value": "(baseado nos dados reais)", "status": "good|warning|critical", "tip": "(dica)" }
  ],
  "strengths": ["(ponto forte real)", "(ponto forte real)", "(ponto forte real)"],
  "weaknesses": ["(fraqueza real)", "(fraqueza real)", "(fraqueza real)"],
  "actionPlan": [
    { "priority": "alta", "action": "(ação concreta)", "expectedImpact": "(resultado)" },
    { "priority": "alta", "action": "(ação concreta)", "expectedImpact": "(resultado)" },
    { "priority": "media", "action": "(ação concreta)", "expectedImpact": "(resultado)" },
    { "priority": "media", "action": "(ação concreta)", "expectedImpact": "(resultado)" },
    { "priority": "baixa", "action": "(ação concreta)", "expectedImpact": "(resultado)" }
  ]
}`
      : `Você é um especialista em marketing digital e Instagram.

O usuário quer um diagnóstico do perfil @${cleanHandle} no Instagram. Não foi possível coletar dados detalhados automaticamente, mas como especialista, use seu conhecimento geral para dar recomendações baseadas em boas práticas de Instagram para perfis comerciais/pessoais.

IMPORTANTE: Seja transparente e diga que a análise é baseada em recomendações gerais, já que não foi possível acessar os dados completos do perfil. Dê dicas práticas e acionáveis.

Responda APENAS com JSON válido (sem markdown, sem \`\`\`):
{
  "score": 50,
  "scoreLabel": "Análise Geral",
  "summary": "(explique que não foi possível acessar dados completos do perfil @${cleanHandle}, mas aqui estão recomendações baseadas em boas práticas)",
  "metrics": [
    { "name": "Bio e Apresentação", "value": "Verificação necessária", "status": "warning", "tip": "(dica de boas práticas)" },
    { "name": "Identidade Visual", "value": "Verificação necessária", "status": "warning", "tip": "(dica)" },
    { "name": "Estratégia de Conteúdo", "value": "Verificação necessária", "status": "warning", "tip": "(dica)" },
    { "name": "Uso de Reels", "value": "Verificação necessária", "status": "warning", "tip": "(dica)" },
    { "name": "Engajamento", "value": "Verificação necessária", "status": "warning", "tip": "(dica)" },
    { "name": "Frequência de Posts", "value": "Verificação necessária", "status": "warning", "tip": "(dica)" }
  ],
  "strengths": ["(recomendação 1)", "(recomendação 2)", "(recomendação 3)"],
  "weaknesses": ["(erro comum 1)", "(erro comum 2)", "(erro comum 3)"],
  "actionPlan": [
    { "priority": "alta", "action": "(ação)", "expectedImpact": "(resultado)" },
    { "priority": "alta", "action": "(ação)", "expectedImpact": "(resultado)" },
    { "priority": "media", "action": "(ação)", "expectedImpact": "(resultado)" },
    { "priority": "media", "action": "(ação)", "expectedImpact": "(resultado)" },
    { "priority": "baixa", "action": "(ação)", "expectedImpact": "(resultado)" }
  ]
}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    let responseText = "";

    if (LOVABLE_API_KEY) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const status = res.status;
        const errText = await res.text();
        console.error("AI gateway error:", status, errText);
        if (status === 429) throw new Error("Limite de requisições atingido. Tente novamente em alguns segundos.");
        throw new Error("Erro ao consultar IA");
      }
      const data = await res.json();
      responseText = data?.choices?.[0]?.message?.content || "";
    } else if (GEMINI_API_KEY) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!res.ok) throw new Error("Erro ao consultar IA");
      const data = await res.json();
      responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      throw new Error("Nenhuma chave de IA configurada");
    }

    if (!responseText) throw new Error("IA não retornou resposta");

    let cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, (c: string) => c === "\n" || c === "\r" || c === "\t" ? c : "");
    cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

    const diagnosis = JSON.parse(cleaned);
    diagnosis._dataSource = hasRealData ? "real" : "general";

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
