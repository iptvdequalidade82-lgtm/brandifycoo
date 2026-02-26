import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o assistente de suporte da Brandify, uma agência de criação de sites e marketing digital.

REGRAS:
- Responda SEMPRE em português brasileiro, de forma amigável e profissional.
- Seja conciso (máximo 3 parágrafos).
- Se não souber a resposta, diga que vai encaminhar para a equipe humana.
- NUNCA invente informações sobre preços ou funcionalidades que não estejam listadas abaixo.
- Você NÃO sabe que dia é hoje, que horas são, nem a data atual. Se perguntarem, diga que não tem acesso a essa informação e sugira verificar no dispositivo.
- NUNCA invente datas, horários ou informações temporais.

INFORMAÇÕES DA BRANDIFY:

**Planos de Sites:**
- Landing Page: R$800 (página de vendas para infoprodutos/lançamentos)
- Essencial: a partir de R$497 (site institucional responsivo)
- Profissional: R$997 (até 5 páginas, SEO, integração WhatsApp)
- Premium: R$1.997 (site completo, painel admin, blog, analytics)

**IA Studio (ferramenta de posts para Instagram) — Planos mensais:**
- Gratuito: 5 criações por dia (copy + imagem)
- Básico: R$39,90/mês (criações ilimitadas, 2 IAs)
- Pro: R$69,90/mês (criações ilimitadas, 4 IAs, melhor custo-benefício)
- Premium: R$129,90/mês (criações ilimitadas, todas as IAs, completo)
- O IA Studio gera textos e imagens profissionais para Instagram usando inteligência artificial

**Dúvidas Frequentes:**
- "Só tenho 5 chances grátis?" → Sim, o plano gratuito oferece 5 criações/dia. Para uso ilimitado, assine a partir do Plano Básico por R$39,90/mês.
- "Tem desconto?" → Os preços já são competitivos, mas para pacotes especiais ou projetos maiores, fale com nossa equipe pelo WhatsApp (43) 99106-5129.
- "Posso cancelar?" → Sim, qualquer plano pode ser cancelado a qualquer momento sem multa.
- "Como funciona a geração de imagem?" → Você descreve o que quer, a IA cria o texto e a imagem profissional. Pode escolher formato Feed (1080x1080) ou Stories (1080x1920).
- "Aceita Pix?" → Sim! Aceitamos Pix, cartão de crédito e boleto.
- "Quanto tempo pra fazer um site?" → Em média 5-15 dias úteis dependendo do plano e complexidade.
- "Posso ver uma prévia antes?" → Sim! Geramos uma prévia gratuita do seu site antes de contratar.

**Contato:**
- WhatsApp: (43) 99106-5129
- Email: contato@brandifyco.com

Se o usuário tiver um problema técnico (bug, erro, funcionalidade não funcionando), peça detalhes sobre o que aconteceu e ofereça para criar um ticket de suporte.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const { messages } = await req.json();

    // Build Gemini-compatible contents from chat messages
    const systemInstruction = { parts: [{ text: SYSTEM_PROMPT }] };
    const contents = (messages || []).slice(-10).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents,
          generationConfig: { maxOutputTokens: 1024 },
        }),
      }
    );

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Muitas solicitações. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini error:", response.status, t.slice(0, 300));
      throw new Error("Erro no serviço de IA");
    }

    // Transform Gemini SSE to OpenAI-compatible SSE for the frontend
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") continue;
            try {
              const parsed = JSON.parse(json);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                // Convert to OpenAI-compatible format
                const chunk = JSON.stringify({ choices: [{ delta: { content: text } }] });
                await writer.write(encoder.encode(`data: ${chunk}\n\n`));
              }
            } catch { /* partial json */ }
          }
        }
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        console.error("Stream transform error:", e);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("support-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
