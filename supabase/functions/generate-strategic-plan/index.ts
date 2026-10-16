import { aiFetch, requireAIResponse, AIServiceError } from "../_shared/ai-fetch.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { businessName, segment, currentRevenue, goal, timeframe, challenges, channels, teamSize } = await req.json();

    const prompt = `Você é um consultor estratégico de negócios. Crie um plano de ação completo para:

Negócio: ${businessName}
Segmento: ${segment}
Faturamento atual: R$ ${currentRevenue || "Não informado"}/mês
Meta: ${goal}
Prazo: ${timeframe}
Desafios atuais: ${challenges || "Não informados"}
Canais de venda/marketing: ${channels || "Não informados"}
Tamanho da equipe: ${teamSize || "Não informado"}

Gere o plano em JSON com esta estrutura exata:
{
  "vision": "(visão estratégica em 1-2 frases)",
  "kpis": [
    { "name": "(nome do KPI)", "current": "(valor informado ou Não informado; nunca invente a linha de base)", "target": "(meta)", "unit": "(ex: R$, %, un)" }
  ],
  "phases": [
    {
      "name": "(nome da fase)",
      "duration": "(ex: Semanas 1-2)",
      "objective": "(objetivo da fase)",
      "actions": [
        { "task": "(tarefa concreta)", "responsible": "(quem)", "deadline": "(prazo relativo)" }
      ]
    }
  ],
  "weeklyRoutine": [
    { "day": "Segunda", "focus": "(foco do dia)", "tasks": ["(tarefa 1)", "(tarefa 2)"] },
    { "day": "Terça", "focus": "(foco)", "tasks": ["(tarefa)"] },
    { "day": "Quarta", "focus": "(foco)", "tasks": ["(tarefa)"] },
    { "day": "Quinta", "focus": "(foco)", "tasks": ["(tarefa)"] },
    { "day": "Sexta", "focus": "(foco)", "tasks": ["(tarefa)"] }
  ],
  "risks": [
    { "risk": "(risco)", "mitigation": "(como mitigar)" }
  ],
  "quickWins": ["(ação rápida 1)", "(ação rápida 2)", "(ação rápida 3)"]
}

Diferencie metas sugeridas de fatos. Não invente faturamento atual, clientes, conversões ou equipe. Valores não informados devem constar como Não informado.
Crie 3-4 fases. Responda APENAS com JSON válido, sem markdown.`;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const res = await aiFetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }),
    });

    await requireAIResponse(res);

    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, (c: string) => c === "\n" || c === "\r" || c === "\t" ? c : "");
    cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

    const plan = JSON.parse(cleaned);
    if (!plan || typeof plan.vision !== "string" || !Array.isArray(plan.kpis) || !Array.isArray(plan.phases) || !Array.isArray(plan.weeklyRoutine) || !Array.isArray(plan.risks) || !Array.isArray(plan.quickWins) || plan.phases.some((p: any) => !Array.isArray(p.actions))) {
      throw new Error("A IA retornou um plano incompleto. Tente novamente.");
    }

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-strategic-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: e instanceof AIServiceError ? e.status : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
