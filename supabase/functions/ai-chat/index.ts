import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Keywords that indicate image generation/editing intent
const IMAGE_KEYWORDS = [
  "gerar imagem", "gere uma imagem", "crie uma imagem", "criar imagem",
  "gerar foto", "crie uma foto", "criar foto",
  "gerar logo", "crie um logo", "criar logo", "crie uma logo",
  "gerar arte", "crie uma arte", "criar arte",
  "gerar ilustração", "crie uma ilustração",
  "gerar banner", "crie um banner", "criar banner",
  "gerar post", "crie um post visual",
  "editar imagem", "edite essa imagem", "editar essa foto",
  "modifique essa imagem", "altere essa imagem",
  "recrie essa imagem", "recriar imagem", "refazer imagem",
  "transforme essa imagem", "melhore essa imagem",
  "generate image", "create image", "edit image",
  "desenhe", "desenhar", "ilustre", "ilustrar",
];

function detectImageIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return IMAGE_KEYWORDS.some((kw) => lower.includes(kw));
}

function hasImageAttachment(messages: any[]): boolean {
  const last = messages[messages.length - 1];
  if (!last) return false;
  if (Array.isArray(last.content)) {
    return last.content.some((p: any) => p.type === "image_url");
  }
  return false;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const MAX_ATTEMPTS_PER_MODEL = 2;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth: allow anonymous access for basic chat, but track user if logged in
    let userId: string | null = null;
    let isAdmin = false;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      if (token !== anonKey) {
        const anonClient = createClient(supabaseUrl, anonKey);
        const { data: { user } } = await anonClient.auth.getUser(token);
        if (user) {
          userId = user.id;
          const { data: adminCheck } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
          isAdmin = !!adminCheck;
        }
      }
    }

    const { messages: allMessages, model, conversationId, generateImage } = await req.json();
    const messages = allMessages.slice(-20);

    // Extract text from last message for intent detection
    const lastMsg = messages[messages.length - 1];
    const lastText = typeof lastMsg?.content === "string"
      ? lastMsg.content
      : Array.isArray(lastMsg?.content)
        ? lastMsg.content.find((p: any) => p.type === "text")?.text || ""
        : "";

    // Auto-detect: should we generate/edit an image?
    const hasAttachment = hasImageAttachment(messages);
    const wantsImage = generateImage || detectImageIntent(lastText);
    const shouldGenerateImage = wantsImage || (hasAttachment && detectImageIntent(lastText));

    // ═══════════════════════════════════════════
    // IMAGE GENERATION / EDITING MODE
    // ═══════════════════════════════════════════
    if (shouldGenerateImage) {
      const imageSystemPrompt = `Você é um designer profissional da Brandify, especialista em criar posts virais para Instagram.

ESTILO VISUAL TREINADO (use como base para TODA geração de imagem):
- Posts com TIPOGRAFIA GIGANTE que domina 40-60% do frame
- Efeitos de CLIPPING MASK: paisagens/texturas visíveis DENTRO das letras
- Fundos cinematográficos: paisagens épicas, cenas noturnas urbanas, esportes radicais
- Pessoa como figura central (rosto oculto, de costas, ou na sombra) com streetwear
- Alto contraste: pretos profundos, brancos brilhantes, tons dourados
- Efeitos de MOTION BLUR no texto para sensação de velocidade
- Estilo editorial de agência premium brasileira (@mentemilionaria, @agenciatenks)
- Frases motivacionais/aspiracionais em português com tipografia impactante
- NUNCA crie imagens genéricas, flat design, ou com cara de template

Se receber uma imagem de referência, analise cores, estilo, logo e incorpore no resultado.`;

      // Build Gemini parts from last message
      const geminiParts: any[] = [{ text: imageSystemPrompt + "\n\n" + lastText }];
      if (Array.isArray(lastMsg.content)) {
        for (const part of lastMsg.content) {
          if (part.type === "image_url" && part.image_url?.url) {
            const url = part.image_url.url;
            const match = url.match(/^data:(image\/\w+);base64,(.+)$/);
            if (match) {
              geminiParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            }
          }
        }
      }

      const imageModels = ["gemini-2.5-flash-preview-image-generation", "gemini-2.0-flash-exp"];
      let imageUrl: string | undefined;
      let textContent = "";
      let imageModelUsed = "";
      let imageRateLimited = false;
      let imageLastError = "";

      for (const imageModel of imageModels) {
        if (imageUrl) break;

        for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
          console.log(`Image gen: trying ${imageModel} (attempt ${attempt}/${MAX_ATTEMPTS_PER_MODEL})`);

          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent?key=${GEMINI_API_KEY}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: geminiParts }],
                generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
              }),
            });

            if (res.status === 429) {
              imageRateLimited = true;
              if (attempt < MAX_ATTEMPTS_PER_MODEL) {
                await sleep(1200 * attempt);
                continue;
              }
              break;
            }

            if (!res.ok) {
              const t = await res.text();
              imageLastError = `${imageModel} failed: ${res.status} ${t.slice(0, 300)}`;
              console.error(imageLastError);
              if (res.status >= 500 && attempt < MAX_ATTEMPTS_PER_MODEL) {
                await sleep(900 * attempt);
                continue;
              }
              break;
            }

            const data = await res.json();
            const parts = data.candidates?.[0]?.content?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.mimeType?.startsWith("image/")) {
                  imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                  imageModelUsed = imageModel;
                } else if (part.text) {
                  textContent += part.text;
                }
              }
            }

            if (imageUrl) {
              console.log(`Image gen succeeded with ${imageModel}`);
              break;
            }

            imageLastError = `${imageModel} returned no image`;
            if (attempt < MAX_ATTEMPTS_PER_MODEL) {
              await sleep(700 * attempt);
              continue;
            }
            break;
          } catch (e) {
            imageLastError = `${imageModel} threw: ${e instanceof Error ? e.message : String(e)}`;
            console.error(imageLastError);
            if (attempt < MAX_ATTEMPTS_PER_MODEL) {
              await sleep(900 * attempt);
              continue;
            }
            break;
          }
        }
      }

      if (!imageUrl) {
        if (imageRateLimited) {
          return new Response(JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns segundos e tente novamente." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.error("Image generation failed:", imageLastError || "unknown error");
        return new Response(JSON.stringify({
          content: "Desculpe, não consegui gerar a imagem no momento. Tente novamente em alguns instantes.",
          model: "error",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ imageUrl, content: textContent || "Aqui está a imagem gerada! 🎨", model: imageModelUsed || "gemini-image" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══════════════════════════════════════════
    // TEXT CHAT MODE (Gemini streaming)
    // ═══════════════════════════════════════════
    const systemPrompt = "Você é um assistente de IA avançado da Brandify. Responda sempre em português brasileiro. Seja claro, profissional e útil. Você pode ajudar com textos, ideias, estratégias de marketing, copywriting, análise de dados e muito mais. Se o usuário enviar uma imagem, analise-a e responda sobre ela. Formate suas respostas com markdown quando apropriado. IMPORTANTE: Você NÃO tem ferramentas externas. NUNCA responda com JSON, blocos de código com ações, ou formatos de tool-calling como {\"action\": ...}. Responda sempre em linguagem natural. Se o usuário pedir para GERAR ou CRIAR uma imagem, diga que você está processando a solicitação.";

    // Clean base64 from old messages to reduce payload
    const cleanedMessages = messages.map((m: any, i: number) => {
      if (i === messages.length - 1) return m;
      if (typeof m.content === "string") return m;
      if (Array.isArray(m.content)) {
        return { ...m, content: m.content.filter((p: any) => p.type !== "image_url") };
      }
      return m;
    }).filter((m: any) => {
      if (Array.isArray(m.content) && m.content.length === 0) return false;
      return true;
    });

    // Convert to Gemini format
    const geminiContents = cleanedMessages.map((m: any) => {
      const role = m.role === "assistant" ? "model" : "user";
      if (typeof m.content === "string") {
        return { role, parts: [{ text: m.content }] };
      }
      if (Array.isArray(m.content)) {
        const parts: any[] = [];
        for (const p of m.content) {
          if (p.type === "text") parts.push({ text: p.text });
          else if (p.type === "image_url" && p.image_url?.url) {
            const match = p.image_url.url.match(/^data:(image\/\w+);base64,(.+)$/);
            if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
          }
        }
        return { role, parts };
      }
      return { role, parts: [{ text: String(m.content) }] };
    });

    const textModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
    let geminiModel = textModels[0];
    let response: Response | null = null;
    let textRateLimited = false;
    let textLastError = "";

    for (const candidateModel of textModels) {
      if (response?.ok) break;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: geminiContents,
                generationConfig: { maxOutputTokens: 4096 },
              }),
            }
          );

          if (res.status === 429) {
            textRateLimited = true;
            if (attempt < MAX_ATTEMPTS_PER_MODEL) {
              await sleep(1200 * attempt);
              continue;
            }
            break;
          }

          if (!res.ok) {
            const t = await res.text();
            textLastError = `${candidateModel}: ${res.status} ${t.slice(0, 500)}`;
            console.error("Gemini error:", textLastError);
            if (res.status >= 500 && attempt < MAX_ATTEMPTS_PER_MODEL) {
              await sleep(900 * attempt);
              continue;
            }
            break;
          }

          response = res;
          geminiModel = candidateModel;
          break;
        } catch (err) {
          textLastError = `${candidateModel}: ${err instanceof Error ? err.message : String(err)}`;
          console.error("Gemini stream error:", textLastError);
          if (attempt < MAX_ATTEMPTS_PER_MODEL) {
            await sleep(900 * attempt);
            continue;
          }
          break;
        }
      }
    }

    if (!response || !response.ok) {
      if (textRateLimited) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns segundos e tente novamente." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(textLastError || "Erro no serviço de IA");
    }

    const streamResponse = response;

    // Transform Gemini SSE to OpenAI-compatible SSE
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        const reader = streamResponse.body!.getReader();
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
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Model-Used": geminiModel,
      },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
