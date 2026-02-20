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

    // Rotate between 4 visual models to avoid repetition
    const visualModels = ["A", "B", "C", "D"];
    const selectedModel = visualModels[Math.floor(Math.random() * visualModels.length)];

    const modelInstructions: Record<string, string> = {
      A: `MODEL A — HUMAN BACKSTAGE (real life):
- Real photograph of a creative workspace: desk with monitor/laptop, keyboard, coffee cup, human hands working, pen holders, notebooks
- Natural warm window light, soft shadows, slight grain — candid and unstaged
- Muted warm tones (gray, beige, soft brown) — like someone snapped it during a normal workday
- The monitor may show a real-looking work tool (project board, analytics, website editor)
- Imperfections welcome: slightly messy desk, real textures, natural grain`,

      B: `MODEL B — EDITORIAL CLEAN (Pinterest / magazine style):
- Minimalist editorial composition with strong central imagery
- Large breathing negative space — elegant and sophisticated
- Think high-end magazine cover or Pinterest editorial board
- Clean, structured layout with deliberate asymmetry
- Soft neutral backdrop (off-white, light gray, warm beige) with one strong focal element
- The focal element can be: a single object (book, phone, plant), an architectural detail, a texture close-up, or a lifestyle moment
- Must feel curated but not artificial`,

      C: `MODEL C — CONCEPTUAL PROFESSIONAL (high-end design studio):
- Creative, artistic, well-designed visual composition
- Think premium design studio portfolio piece or art direction showcase
- Can use collage elements, creative photography, surreal-but-grounded compositions
- Strong visual concept tied to the content topic
- Artistic but NEVER futuristic, cyberpunk, or neon
- Must look intentional and human-made, like a designer crafted it by hand
- Premium aesthetic: think Kinfolk, Cereal Magazine, or Monocle visual style`,

      D: `MODEL D — PRODUCT/THEME IN REAL CONTEXT:
- Real objects in realistic settings: phones showing interfaces, websites on screens, printed materials on desks, business cards, branded items
- Integrated into believable real-world scenes (on a table, held by a hand, on a shelf)
- NO floating objects, NO fake 3D mockups, NO artificial renders
- Must feel like something you could photograph in the real world
- Warm, natural lighting on physical objects with real shadows and reflections`,
    };

    const imagePrompt = `You are an award-winning art director creating an Instagram ${type === "story" ? "story (9:16 vertical, 1080x1920px)" : "feed post (1:1 square, 1080x1080px)"} for BRANDIFY, a premium Brazilian creative agency.

🎯 VISUAL MODEL: ${selectedModel}
${modelInstructions[selectedModel]}

📸 PHOTOGRAPHIC QUALITY (CRITICAL):
- The image must have the quality of a PROFESSIONAL DSLR photograph shot at f/1.8-2.8
- Rich depth of field with beautiful bokeh in the background
- Warm color grading like Kodak Portra 400 film — golden tones, creamy highlights, deep shadows
- Visible film grain and natural texture — NEVER hyper-clean digital renders
- Dramatic but natural lighting: golden hour, soft window light, or moody studio lighting
- Color palette: warm earth tones (amber, cognac, espresso, cream, charcoal) with occasional cool accents
- The overall mood should feel EXPENSIVE, CINEMATIC, and EDITORIAL — like a page from Kinfolk or Cereal magazine

✍️ TYPOGRAPHY (MUST be overlaid on the image, integrated into the composition):
- MAIN HEADLINE: Very large, bold WHITE SERIF font (Playfair Display Bold Italic or Didot Bold style)
  - The headline must be SHORT (3-7 words), punchy, editorial — like a luxury magazine cover
  - Position it as a DOMINANT element — it should command attention
  - Use line breaks creatively for visual rhythm (e.g., stacking words)
  - Add subtle drop shadow or dark overlay behind text for contrast and readability
- SECONDARY LINE: Smaller sans-serif (Inter Light / Helvetica Neue Light) below or near the headline — a provocative question or subheadline
- CREDIT: "POR BRANDIFY" in elegant small-caps spaced-out sans-serif
- WATERMARK: "@brandifycoo" small and subtle in a corner
- ALL TEXT must be WHITE or very light cream — high contrast against the image

🎨 VISUAL RICHNESS (IMPORTANT — avoid "too simple"):
- The composition must have LAYERS and DEPTH — foreground elements, mid-ground focus, background atmosphere
- Include rich environmental details: textures of wood, leather, paper, concrete, fabric, glass
- Use atmospheric elements: steam from coffee, dust particles in light beams, soft reflections, lens flare
- The image should feel LIVED-IN and TACTILE — you can almost feel the textures
- Think editorial fashion photography meets workspace documentary
- Include at least 3-4 distinct visual elements that create a complete scene

📐 COMPOSITION:
- Rule of thirds with intentional breaking for dramatic effect
- Strong leading lines drawing the eye to the headline
- Generous negative space where text lives, but rich detail elsewhere
- The overall layout should feel DESIGNED, not just photographed

🚫 ABSOLUTELY FORBIDDEN:
- Flat, simple, or minimalist-only compositions (must have visual RICHNESS)
- Illustrations, 3D renders, flat design, vector art, clipart
- Neon, glow, gradients, cyberpunk, futuristic aesthetics
- Stock photo look, template aesthetic, generic corporate imagery
- Hyper-perfect, overly polished, plastic-looking renders
- Plain solid color backgrounds
- If it looks AI-generated or like a Canva template → WRONG

🧠 QUALITY CHECK: This must look like it was shot by a professional photographer, styled by an art director, and designed by a senior graphic designer at a top creative agency. If it looks simple, generic, or AI-made → regenerate.

CONTENT/TOPIC for the headline: ${prompt}`;

    let imageUrl: string | undefined;

    // Provider 1: Lovable AI Gateway (primary — no billing needed)
    if (LOVABLE_API_KEY && !imageUrl) {
      const gatewayModels = ["google/gemini-3-pro-image-preview", "google/gemini-2.5-flash-image"];
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
