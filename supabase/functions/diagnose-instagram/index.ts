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
    const profileUrl = `https://www.instagram.com/${cleanHandle}/`;

    // Step 1: Scrape the real Instagram profile using Firecrawl
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("Firecrawl não configurado");

    console.log("Scraping Instagram profile:", profileUrl);

    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: profileUrl,
        formats: ["markdown", "screenshot"],
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeRes.json();

    if (!scrapeRes.ok) {
      console.error("Firecrawl error:", JSON.stringify(scrapeData));
      throw new Error("Não foi possível acessar o perfil do Instagram");
    }

    const pageMarkdown = scrapeData?.data?.markdown || scrapeData?.markdown || "";
    const screenshotBase64 = scrapeData?.data?.screenshot || scrapeData?.screenshot || "";
    const pageMetadata = scrapeData?.data?.metadata || scrapeData?.metadata || {};

    console.log("Scraped content length:", pageMarkdown.length);
    console.log("Has screenshot:", !!screenshotBase64);

    if (!pageMarkdown && !screenshotBase64) {
      throw new Error("Não foi possível extrair dados do perfil. Verifique se o @ está correto.");
    }

    // Step 2: Send the REAL scraped data to AI for analysis
    const prompt = `Você é um especialista em marketing digital e Instagram com anos de experiência.

Abaixo está o conteúdo REAL extraído do perfil @${cleanHandle} no Instagram. Analise APENAS o que você consegue ver nos dados abaixo. NÃO INVENTE informações. Se algo não está visível nos dados, diga "Não foi possível avaliar" para aquele item.

=== DADOS REAIS DO PERFIL ===
Título da página: ${pageMetadata.title || "N/A"}
Descrição: ${pageMetadata.description || "N/A"}

Conteúdo extraído da página:
${pageMarkdown.substring(0, 8000)}
=== FIM DOS DADOS ===

Com base EXCLUSIVAMENTE nos dados acima, faça o diagnóstico. Seja honesto — se o perfil tem poucos posts ou nenhum reels, DIGA ISSO. Se a bio não tem link, DIGA ISSO. Não invente conteúdo que não existe.

Responda APENAS com JSON válido nesta estrutura exata (sem markdown, sem \`\`\`):
{
  "score": (número de 0 a 100),
  "scoreLabel": "(Crítico / Fraco / Regular / Bom / Excelente)",
  "summary": "(resumo honesto de 2-3 frases baseado nos dados reais)",
  "metrics": [
    { "name": "Bio e Apresentação", "value": "(o que você VIU nos dados)", "status": "good|warning|critical", "tip": "(dica específica)" },
    { "name": "Identidade Visual", "value": "(o que você VIU)", "status": "good|warning|critical", "tip": "(dica)" },
    { "name": "Estratégia de Conteúdo", "value": "(baseado nos posts REAIS visíveis)", "status": "good|warning|critical", "tip": "(dica)" },
    { "name": "Uso de Reels", "value": "(baseado no que é VISÍVEL)", "status": "good|warning|critical", "tip": "(dica)" },
    { "name": "Engajamento", "value": "(baseado nos números REAIS se visíveis)", "status": "good|warning|critical", "tip": "(dica)" },
    { "name": "Frequência de Posts", "value": "(baseado nas datas REAIS se visíveis)", "status": "good|warning|critical", "tip": "(dica)" }
  ],
  "strengths": ["(ponto forte real)", "(ponto forte real)", "(ponto forte real)"],
  "weaknesses": ["(fraqueza real)", "(fraqueza real)", "(fraqueza real)"],
  "actionPlan": [
    { "priority": "alta", "action": "(ação baseada nos problemas REAIS)", "expectedImpact": "(resultado esperado)" },
    { "priority": "alta", "action": "(ação concreta)", "expectedImpact": "(resultado)" },
    { "priority": "media", "action": "(ação concreta)", "expectedImpact": "(resultado)" },
    { "priority": "media", "action": "(ação concreta)", "expectedImpact": "(resultado)" },
    { "priority": "baixa", "action": "(ação concreta)", "expectedImpact": "(resultado)" }
  ]
}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    let responseText = "";

    // Use screenshot + text for multimodal analysis if available
    if (LOVABLE_API_KEY && screenshotBase64) {
      // Multimodal: send screenshot + text to Gemini Pro for visual analysis
      const messages = [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/png;base64,${screenshotBase64}` } },
          ],
        },
      ];

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("AI gateway error:", res.status, errText);
        if (res.status === 429) throw new Error("Limite de requisições atingido. Tente novamente em alguns segundos.");
        throw new Error("Erro ao consultar IA");
      }
      const data = await res.json();
      responseText = data?.choices?.[0]?.message?.content || "";
    } else if (LOVABLE_API_KEY) {
      // Text-only fallback
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error("Erro ao consultar IA");
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

    // Clean and parse JSON
    let cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, (c: string) => c === "\n" || c === "\r" || c === "\t" ? c : "");
    cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

    const diagnosis = JSON.parse(cleaned);

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
