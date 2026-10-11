import { aiFetch, requireAIResponse, AIServiceError } from "../_shared/ai-fetch.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, offer, audience, tone } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const typeLabels: Record<string, string> = {
      whatsapp: "Mensagem de WhatsApp (primeira mensagem, follow-up e fechamento)",
      anuncio: "Anúncio para Meta Ads (Facebook/Instagram)",
      landing: "Textos para Landing Page (headline, sub-headline, benefícios, CTA)",
      reels: "Script para Reels/Shorts (gancho, desenvolvimento, CTA)",
    };

    const toneLabels: Record<string, string> = {
      profissional: "Profissional e autoritário",
      direto: "Direto e objetivo",
      amigavel: "Amigável e acessível",
    };

    const systemPrompt = `Você é um copywriter brasileiro de elite, especialista em marketing digital e vendas.
Seu trabalho é criar copys de alta conversão, persuasivas e prontas para uso.

REGRAS:
- Escreva SEMPRE em português brasileiro natural e fluente
- Use apenas informações fornecidas. NÃO invente depoimentos, números de clientes, resultados, garantias, descontos, estoque limitado ou prazos.
- Urgência, escassez e prova social somente quando comprovadas na oferta.
- Adapte o tom conforme solicitado
- Cada variação deve ter um ÂNGULO COMPLETAMENTE DIFERENTE (não apenas trocar palavras)
- Variação A: abordagem emocional/storytelling
- Variação B: abordagem racional/benefícios diretos  
- Variação C: ação direta; urgência/escassez apenas se explicitamente informadas
- Use emojis com moderação e estratégia
- Formato limpo e fácil de copiar/colar`;

    const userPrompt = `Crie 3 variações de copy (A, B e C) para:

TIPO: ${typeLabels[type] || type}
OFERTA: ${offer}
PÚBLICO-ALVO: ${audience}
TOM: ${toneLabels[tone] || tone}

Retorne EXATAMENTE neste formato (sem markdown extra):

---VARIAÇÃO A---
[copy completa A]

---VARIAÇÃO B---
[copy completa B]

---VARIAÇÃO C---
[copy completa C]`;

    const response = await aiFetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
      }),
    });

    await requireAIResponse(response);

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse variations
    const variations: string[] = [];
    const parts = content.split(/---VARIAÇÃO [ABC]---/i).filter((s: string) => s.trim());
    for (const part of parts) {
      variations.push(part.trim());
    }

    if (variations.length !== 3 || variations.some(v => !v.trim())) {
      throw new Error("A IA retornou um resultado incompleto. Tente novamente.");
    }

    return new Response(JSON.stringify({ variations: variations.slice(0, 3) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-copy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: e instanceof AIServiceError ? e.status : 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
