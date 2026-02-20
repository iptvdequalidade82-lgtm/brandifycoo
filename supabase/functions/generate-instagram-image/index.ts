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

    const imagePrompt = `Create an Instagram ${type === "story" ? "story (9:16 vertical)" : "feed post (1:1 square)"} that looks EXACTLY like a real social media post made by a professional creative agency.

REFERENCE STYLE (follow this precisely):
The image must look like this example: A real photograph of a workspace — a hand holding a coffee mug in front of a monitor showing a project management tool (like Trello), with a keyboard, mouse pad, and pen holder visible. Over the photo, large elegant WHITE SERIF typography (like Playfair Display italic/bold) overlays the image with a short editorial headline. A smaller sans-serif credit line ("POR BRANDIFY") appears at top or bottom. The overall feel is: real, editorial, confident, behind-the-scenes.

📸 PHOTOGRAPH (background layer):
- MUST be a real-looking photograph of a creative workspace/agency environment
- Show: desk with monitor/laptop screen, keyboard, mouse, coffee cup, hand holding something, pen holders, natural window light
- The monitor should show a real-looking work tool (project board, analytics, website editor, social media dashboard)
- Natural warm lighting from a window, soft shadows, slight grain — NOT studio-perfect
- Muted, slightly desaturated warm tones (gray, beige, soft brown)
- The photo must feel candid and unstaged — like someone snapped it during work

✍️ TYPOGRAPHY (overlay on top of the photo):
- MAIN HEADLINE: Large, elegant WHITE SERIF font (Playfair Display, Didot, or Bodoni style) — use ITALIC for emphasis on key words
- The headline should be SHORT (3-8 words max), editorial, confident — like a magazine cover
- Position: centered or upper portion of the image, large enough to be the focal point
- SECONDARY TEXT: Small sans-serif (Inter/Helvetica style) at bottom — a question or subheadline in white or light gray
- CREDIT LINE: "POR BRANDIFY" in small spaced-out sans-serif at top or bottom
- "@brandifycoo" as subtle watermark

🎨 COLOR RULES:
- Photo: warm muted tones (grays, beiges, soft browns)
- All text: WHITE or off-white only
- Blue (#2563EB) only for subtle accent on ONE keyword if needed — never dominant
- FORBIDDEN: gradients, neon, glow, colored backgrounds, digital effects

🚫 ABSOLUTELY AVOID:
- Illustrations, 3D mockups, flat design, template aesthetics
- Artificial/generated-looking backgrounds or objects
- Perfect symmetry or hyper-clean compositions
- Stock photo aesthetic — must feel REAL and candid
- Any element that makes it look AI-generated

Content/topic for the headline: ${prompt}`;

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
