import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { businessName, segment, offer, audience, style } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `Você é um especialista brasileiro em landing pages de alta conversão.
Seu trabalho é gerar os TEXTOS completos para uma landing page profissional.

RETORNE EXATAMENTE no formato JSON abaixo (sem markdown, sem \`\`\`):
{
  "headline": "Headline principal (máx 10 palavras)",
  "subheadline": "Sub-headline com proposta de valor (máx 25 palavras)",
  "cta": "Texto do botão CTA (máx 5 palavras)",
  "benefits": [
    { "title": "Benefício 1", "description": "Descrição curta" },
    { "title": "Benefício 2", "description": "Descrição curta" },
    { "title": "Benefício 3", "description": "Descrição curta" }
  ],
  "socialProof": "Frase de prova social (ex: +500 clientes atendidos)",
  "aboutSection": "Parágrafo sobre a empresa/serviço (2-3 frases)",
  "urgency": "Frase de urgência/escassez para antes do CTA final",
  "finalCta": "Texto do CTA final (máx 6 palavras)"
}

REGRAS:
- Português brasileiro natural e persuasivo
- Use gatilhos mentais sutilmente
- Adapte ao segmento e público informados
- Todos os textos devem ser prontos para usar`;

    const userPrompt = `Gere os textos da landing page para:

NEGÓCIO: ${businessName}
SEGMENTO: ${segment}
OFERTA: ${offer}
PÚBLICO-ALVO: ${audience}
ESTILO: ${style || "Profissional e moderno"}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gemini error:", response.status, t);
      throw new Error("Erro no serviço de IA");
    }

    const data = await response.json();
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean markdown fences
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    const landing = JSON.parse(content);

    return new Response(JSON.stringify({ landing }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-landing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
