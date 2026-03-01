import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { handle, followers, following, posts, avgLikes, avgComments, postsPerWeek, bio, niche } = await req.json();

    const engagementRate = followers > 0 ? (((avgLikes || 0) + (avgComments || 0)) / followers) * 100 : 0;
    const followRatio = following > 0 ? (followers / following).toFixed(2) : "N/A";

    const prompt = `Você é um especialista em marketing digital e Instagram. Analise o perfil @${handle} com os seguintes dados:

- Seguidores: ${followers}
- Seguindo: ${following}
- Posts: ${posts}
- Média de curtidas por post: ${avgLikes}
- Média de comentários por post: ${avgComments}
- Taxa de engajamento calculada: ${engagementRate.toFixed(2)}%
- Proporção seguidores/seguindo: ${followRatio}
- Posts por semana: ${postsPerWeek}
- Bio: ${bio || "Não informada"}
- Nicho: ${niche || "Não informado"}

Gere um diagnóstico completo em JSON com a seguinte estrutura exata:
{
  "score": (número de 0 a 100),
  "scoreLabel": "(Crítico / Fraco / Regular / Bom / Excelente)",
  "summary": "(resumo de 2-3 frases do estado geral do perfil)",
  "metrics": [
    { "name": "Taxa de Engajamento", "value": "${engagementRate.toFixed(2)}%", "status": "good|warning|critical", "tip": "(dica curta)" },
    { "name": "Frequência de Posts", "value": "${postsPerWeek}/semana", "status": "good|warning|critical", "tip": "(dica curta)" },
    { "name": "Proporção Seguidores/Seguindo", "value": "${followRatio}", "status": "good|warning|critical", "tip": "(dica curta)" },
    { "name": "Volume de Conteúdo", "value": "${posts} posts", "status": "good|warning|critical", "tip": "(dica curta)" }
  ],
  "strengths": ["(ponto forte 1)", "(ponto forte 2)"],
  "weaknesses": ["(fraqueza 1)", "(fraqueza 2)"],
  "actionPlan": [
    { "priority": "alta|media|baixa", "action": "(ação concreta)", "expectedImpact": "(resultado esperado)" }
  ]
}

Responda APENAS com o JSON válido, sem markdown.`;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    let responseText = "";

    if (GEMINI_API_KEY) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data = await res.json();
      responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else if (LOVABLE_API_KEY) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      responseText = data?.choices?.[0]?.message?.content || "";
    } else {
      throw new Error("No AI API key configured");
    }

    // Clean and parse JSON
    let cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, (c) => c === "\n" || c === "\r" || c === "\t" ? c : "");
    cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

    const diagnosis = JSON.parse(cleaned);

    return new Response(JSON.stringify(diagnosis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("diagnose-instagram error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
