import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, type } = await req.json(); // type: "feed" | "story"

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!GEMINI_API_KEY && !LOVABLE_API_KEY) throw new Error("No API key configured");

    const aspectRatio = type === "story" ? "9:16" : "1:1";
    const dimensions = type === "story" ? "1080x1920" : "1080x1080";

    const imagePrompt = `Ultra-realistic editorial photograph for Instagram ${type === "story" ? "story (9:16 vertical format)" : "feed post (1:1 square format)"}.

CRITICAL STYLE — MUST LOOK 100% HUMAN-MADE, NEVER AI-GENERATED:
- Realistic photography of real work environments: desks with notebooks, smartphones, coffee cups, human hands typing or working
- Behind-the-scenes of a real creative agency at work — no posed or artificial setups
- Natural lighting, soft shadows, real-world imperfections (slightly messy desk, natural grain, warm tones)
- The image must feel like it was taken by a professional photographer during a normal workday

TYPOGRAPHY (overlaid on the photo):
- Headlines: elegant editorial SERIF font (like Playfair Display, Didot, Bodoni, Georgia) — bold or italic
- Supporting text: clean neutral sans-serif (like Inter, Helvetica, or similar)
- NEVER use futuristic, tech-heavy, or exaggerated fonts
- Text must breathe — generous white space, simple and elegant composition

COLOR PALETTE:
- Base: soft black, warm gray, off-white
- Blue (#2563EB) only as a subtle, institutional accent — never dominant
- FORBIDDEN: gradients, neon, glow effects, digital artifacts, vibrant saturated colors

LAYOUT:
- Generous negative space, text well-positioned and breathing
- Simple, clean, editorial magazine composition
- Short, confident, editorial headlines — no aggressive marketing or flashy CTAs

ABSOLUTELY AVOID:
- Illustrations, 3D mockups, futuristic elements, artificial backgrounds
- "Too perfect" or hyper-polished images — they must feel real
- Stock photo aesthetic or template look
- Startup/tech visual clichés

Include subtle ">> brandify" logo and "@brandifycoo" watermark in corner.

FINAL PRINCIPLE: The result must look like "Created by a real agency, with real people, on a normal workday." If it looks like AI, the result is wrong.

Content to feature: ${prompt}`;

    let imageUrl: string | undefined;

    // Provider 1: Lovable AI Gateway (primary — no billing needed)
    if (LOVABLE_API_KEY && !imageUrl) {
      const gatewayModels = ["google/gemini-2.5-flash-image", "google/gemini-3-pro-image-preview"];
      for (const model of gatewayModels) {
        if (imageUrl) break;
        console.log(`Trying gateway: ${model}`);
        try {
          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: imagePrompt }],
              modalities: ["image", "text"],
            }),
          });
          if (res.status === 429) {
            return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (res.status === 402) {
            return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), {
              status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (res.ok) {
            const data = await res.json();
            imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            if (imageUrl) { console.log(`Gateway ${model} succeeded`); break; }
            console.error(`Gateway ${model}: no image`);
          } else {
            const t = await res.text();
            console.error(`Gateway ${model} failed:`, res.status, t.slice(0, 300));
          }
        } catch (e) {
          console.error(`Gateway ${model} threw:`, e);
        }
      }
    }

    // Provider 2: Direct Gemini API (fallback — requires billing for image models)
    if (GEMINI_API_KEY && !imageUrl) {
      const model = "gemini-2.5-flash-image";
      console.log(`Trying direct Gemini fallback: ${model}`);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: imagePrompt }] }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          const parts = data.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.mimeType?.startsWith("image/")) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                console.log(`Direct Gemini succeeded`);
                break;
              }
            }
          }
        } else {
          const t = await res.text();
          console.error(`Direct Gemini failed:`, res.status, t.slice(0, 300));
        }
      } catch (e) {
        console.error(`Direct Gemini threw:`, e);
      }
    }

    if (!imageUrl) {
      throw new Error("Serviços de IA temporariamente indisponíveis. Tente novamente em alguns minutos.");
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-instagram-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
