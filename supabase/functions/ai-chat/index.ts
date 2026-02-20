import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { data: { user }, error } = await anonClient.auth.getUser(token);
      if (error || !user) {
        return new Response(JSON.stringify({ error: "Não autorizado" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Acesso negado" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { messages: allMessages, model, conversationId, generateImage } = await req.json();
    // Limit history to last 20 messages for performance
    const messages = allMessages.slice(-20);

    // Image generation mode
    if (generateImage) {
      const imageModel = model === "gpt" ? "google/gemini-2.5-flash-image" : "google/gemini-2.5-flash-image";
      const lastMessage = messages[messages.length - 1];

      const payload: any = {
        model: imageModel,
        messages: [lastMessage],
        modalities: ["image", "text"],
      };

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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

      if (!res.ok) {
        const t = await res.text();
        console.error("Image gen failed:", res.status, t.slice(0, 500));
        throw new Error("Falha ao gerar imagem");
      }

      const data = await res.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      const textContent = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ imageUrl, content: textContent, model: imageModel }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Text chat mode with streaming
    let aiModel: string;
    if (model === "gpt") {
      aiModel = "openai/gpt-5-mini";
    } else if (model === "gemini") {
      aiModel = "google/gemini-3-flash-preview";
    } else {
      // Auto mode - default to gemini flash for speed
      aiModel = "google/gemini-3-flash-preview";
    }

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
            content: "Você é um assistente de IA avançado da Brandify. Responda sempre em português brasileiro. Seja claro, profissional e útil. Você pode ajudar com textos, ideias, estratégias de marketing, copywriting, análise de dados e muito mais. Formate suas respostas com markdown quando apropriado. IMPORTANTE: Você NÃO tem ferramentas externas. NUNCA responda com JSON, blocos de código com ações, ou formatos de tool-calling como {\"action\": ...}. Responda sempre em linguagem natural.",
          },
          ...messages,
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

    // Stream response back with model info header
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
