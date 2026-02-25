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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
      // If the token is NOT the anon key, try to authenticate the user
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
      // Use Gemini for image generation (best at multimodal)
      const imageModels = ["google/gemini-3-pro-image-preview", "google/gemini-2.5-flash-image"];

      let imageUrl: string | undefined;
      let textContent = "";

      for (const imageModel of imageModels) {
        if (imageUrl) break;
        console.log(`Image gen: trying ${imageModel}`);

        try {
          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: imageModel,
              messages: [
                {
                  role: "system",
                  content: `Você é um designer profissional da Brandify, especialista em criar posts virais para Instagram.

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

Se receber uma imagem de referência, analise cores, estilo, logo e incorpore no resultado.`,
                },
                lastMsg,
              ],
              modalities: ["image", "text"],
            }),
          });

          if (res.status === 429) {
            return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (res.status === 402) {
            return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
              status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          if (res.ok) {
            const data = await res.json();
            imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            textContent = data.choices?.[0]?.message?.content || "";
            if (imageUrl) {
              console.log(`Image gen succeeded with ${imageModel}`);
            }
          } else {
            const t = await res.text();
            console.error(`${imageModel} failed:`, res.status, t.slice(0, 300));
          }
        } catch (e) {
          console.error(`${imageModel} threw:`, e);
        }
      }

      if (!imageUrl) {
        return new Response(JSON.stringify({
          content: "Desculpe, não consegui gerar a imagem no momento. Tente novamente em alguns instantes.",
          model: "error",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ imageUrl, content: textContent || "Aqui está a imagem gerada! 🎨", model: imageModels[0] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══════════════════════════════════════════
    // TEXT CHAT MODE (with smart model routing)
    // ═══════════════════════════════════════════
    let aiModel: string;
    if (model === "gpt") {
      aiModel = "openai/gpt-5-mini";
    } else if (model === "gemini") {
      aiModel = "google/gemini-3-flash-preview";
    } else {
      // Auto mode: use GPT for complex reasoning, Gemini for speed
      // If there's an image attachment but no image generation intent, use Gemini (better at vision)
      if (hasAttachment) {
        aiModel = "google/gemini-3-flash-preview";
      } else {
        aiModel = "google/gemini-3-flash-preview";
      }
    }

    // Clean base64 from old messages to reduce payload
    const cleanedMessages = messages.map((m: any, i: number) => {
      if (i === messages.length - 1) return m; // keep last message intact
      if (typeof m.content === "string") return m;
      if (Array.isArray(m.content)) {
        return {
          ...m,
          content: m.content.filter((p: any) => p.type !== "image_url"),
        };
      }
      return m;
    }).filter((m: any) => {
      // Remove messages that became empty after cleaning
      if (Array.isArray(m.content) && m.content.length === 0) return false;
      return true;
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          {
            role: "system",
            content: "Você é um assistente de IA avançado da Brandify. Responda sempre em português brasileiro. Seja claro, profissional e útil. Você pode ajudar com textos, ideias, estratégias de marketing, copywriting, análise de dados e muito mais. Se o usuário enviar uma imagem, analise-a e responda sobre ela. Formate suas respostas com markdown quando apropriado. IMPORTANTE: Você NÃO tem ferramentas externas. NUNCA responda com JSON, blocos de código com ações, ou formatos de tool-calling como {\"action\": ...}. Responda sempre em linguagem natural. Se o usuário pedir para GERAR ou CRIAR uma imagem, diga que você está processando a solicitação.",
          },
          ...cleanedMessages,
        ],
        stream: true,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t.slice(0, 500));
      throw new Error("Erro no gateway de IA");
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Model-Used": aiModel,
      },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
