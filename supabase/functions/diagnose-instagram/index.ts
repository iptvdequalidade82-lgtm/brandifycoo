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

    const prompt = `Você é um especialista em marketing digital e Instagram com anos de experiência analisando perfis comerciais. 

Faça um diagnóstico COMPLETO e DETALHADO do perfil @${cleanHandle} no Instagram. Como especialista, analise todos os aspectos visíveis de um perfil público:

1. **Bio**: Está clara? Tem CTA? Tem link? Comunica o que a empresa/pessoa faz?
2. **Foto de perfil**: É profissional? É reconhecível? Tem boa resolução?
3. **Nome e @**: São fáceis de encontrar? Comunicam o nicho?
4. **Destaques (Stories fixos)**: Existem? Estão organizados? Têm capas profissionais?
5. **Feed visual**: O feed tem identidade visual? As cores são consistentes? Tem padrão?
6. **Tipo de conteúdo**: Tem Reels? Carrosséis? Posts estáticos? Qual a variedade?
7. **Legendas**: São envolventes? Têm CTAs? Usam hashtags estratégicas?
8. **Frequência de postagem**: Posta com regularidade ou é inconsistente?
9. **Engajamento aparente**: Os posts parecem ter interações? Há respostas nos comentários?
10. **Estratégia geral**: O perfil parece ter uma estratégia clara ou é aleatório?

Baseie sua análise no seu conhecimento como especialista. Dê uma análise honesta, direta e útil.

Responda APENAS com JSON válido nesta estrutura exata (sem markdown, sem \`\`\`):
{
  "score": (número de 0 a 100 baseado na sua avaliação geral),
  "scoreLabel": "(Crítico / Fraco / Regular / Bom / Excelente)",
  "summary": "(resumo de 2-3 frases do estado geral do perfil, mencionando o @ e o que parece ser o nicho)",
  "metrics": [
    { "name": "Bio e Apresentação", "value": "(avaliação curta)", "status": "good|warning|critical", "tip": "(dica específica para melhorar)" },
    { "name": "Identidade Visual", "value": "(avaliação curta)", "status": "good|warning|critical", "tip": "(dica específica)" },
    { "name": "Estratégia de Conteúdo", "value": "(avaliação curta)", "status": "good|warning|critical", "tip": "(dica específica)" },
    { "name": "Uso de Reels", "value": "(avaliação curta)", "status": "good|warning|critical", "tip": "(dica específica)" },
    { "name": "Engajamento", "value": "(avaliação curta)", "status": "good|warning|critical", "tip": "(dica específica)" },
    { "name": "Frequência de Posts", "value": "(avaliação curta)", "status": "good|warning|critical", "tip": "(dica específica)" }
  ],
  "strengths": ["(ponto forte 1)", "(ponto forte 2)", "(ponto forte 3)"],
  "weaknesses": ["(fraqueza 1)", "(fraqueza 2)", "(fraqueza 3)"],
  "actionPlan": [
    { "priority": "alta", "action": "(ação concreta e específica para o perfil)", "expectedImpact": "(resultado esperado)" },
    { "priority": "alta", "action": "(ação concreta)", "expectedImpact": "(resultado esperado)" },
    { "priority": "media", "action": "(ação concreta)", "expectedImpact": "(resultado esperado)" },
    { "priority": "media", "action": "(ação concreta)", "expectedImpact": "(resultado esperado)" },
    { "priority": "baixa", "action": "(ação concreta)", "expectedImpact": "(resultado esperado)" }
  ]
}`;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    let responseText = "";

    if (GEMINI_API_KEY) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("Gemini error:", res.status, errText);
        throw new Error("Erro ao consultar IA");
      }
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
      if (!res.ok) {
        const status = res.status;
        const errText = await res.text();
        console.error("AI gateway error:", status, errText);
        if (status === 429) throw new Error("Limite de requisições atingido. Tente novamente em alguns segundos.");
        if (status === 402) throw new Error("Créditos insuficientes. Contate o suporte.");
        throw new Error("Erro ao consultar IA");
      }
      const data = await res.json();
      responseText = data?.choices?.[0]?.message?.content || "";
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