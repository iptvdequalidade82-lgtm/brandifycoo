import { aiFetch, requireAIResponse, AIServiceError } from "../_shared/ai-fetch.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, businessContext } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `Você é um assistente de atendimento ao cliente profissional e amigável, especializado no seguinte negócio:

NOME DO NEGÓCIO: ${businessContext?.name || "Meu Negócio"}
SEGMENTO: ${businessContext?.segment || "Não informado"}
SERVIÇOS/PRODUTOS: ${businessContext?.services || "Não informado"}
HORÁRIO DE FUNCIONAMENTO: ${businessContext?.hours || "Não informado"}
INFORMAÇÕES ADICIONAIS: ${businessContext?.extra || "Nenhuma"}

REGRAS DE ATENDIMENTO:
- Responda SEMPRE em português brasileiro natural e profissional
- Seja cordial, empático e prestativo
- Ofereça soluções claras e objetivas
- Se não souber uma informação, sugira que o cliente entre em contato por WhatsApp/telefone
- Use emojis com moderação (1-2 por mensagem no máximo)
- Mantenha respostas concisas (máx 3 parágrafos)
- Tente sempre levar para uma ação (agendar, comprar, visitar)
- NÃO invente informações que não foram fornecidas sobre o negócio
- Se houver apenas horas de funcionamento, NÃO deduza dias da semana. Informe apenas as horas e diga que os dias precisam ser confirmados.
- Não prometa integração automática com WhatsApp, reserva efetiva ou confirmação de agendamento.`;

    // Convert messages to Gemini format
    const geminiContents = (messages || []).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await aiFetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiContents,
          generationConfig: { maxOutputTokens: 1024 },
        }),
      }
    );

    await requireAIResponse(response);

    // Transform Gemini SSE to OpenAI-compatible SSE
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
    console.error("atendedor-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: e instanceof AIServiceError ? e.status : 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
