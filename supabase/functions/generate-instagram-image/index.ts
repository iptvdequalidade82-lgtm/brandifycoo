import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, type, referenceImage } = await req.json(); // referenceImage: optional base64 data URL

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

    const referenceInstruction = referenceImage
      ? `\n\n📎 REFERENCE IMAGE PROVIDED:
The user has uploaded a reference image (could be a logo, photo, or design idea).
- Analyze the reference image carefully: extract colors, style, mood, branding elements, logos, and visual identity.
- INCORPORATE elements from the reference into the final post design.
- If it's a LOGO: integrate it prominently into the post design as the brand identity.
- If it's a PHOTO: use it as visual inspiration for the composition, colors, and mood.
- If it's a DESIGN: absorb the style and recreate something similar but elevated and professional.
- The final result should feel like a natural evolution of the reference, not a copy.`
      : "";

    const imagePrompt = `Create a clean, high-end, professional social media ${type === "story" ? "story (9:16 vertical, 1080x1920px)" : "feed post (1:1 square, 1080x1080px)"} for BRANDIFY, a premium Brazilian creative agency.

The image must look 100% realistic, like a real brand campaign — NOT AI-generated.

🎯 VISUAL MODEL: ${selectedModel}
${modelInstructions[selectedModel]}
${referenceInstruction}

📸 STYLE & MOOD:
- Style: minimal, editorial, premium, corporate-modern
- Mood: confident, aspirational, elegant, professional
- Camera feel: real photography, DSLR look, shallow depth of field when needed
- Lighting: natural soft light, studio-quality, realistic shadows
- Colors: neutral palette (white, black, gray, soft beige), subtle accent colors only if necessary
- Finish: ultra-polished, realistic, timeless, premium brand aesthetic

✍️ TYPOGRAPHY:
- Modern sans-serif OR elegant serif font — clean kerning, perfect alignment
- MAIN HEADLINE: Large, bold, high-contrast text — SHORT (3-7 words), punchy, editorial
  - Can be WHITE on dark backgrounds or BLACK/DARK on light backgrounds
  - Must be a DOMINANT visual element commanding attention
  - Use creative line breaks for visual rhythm
- SECONDARY LINE: Smaller, lighter weight text — a provocative question or subheadline
- CREDIT: "POR BRANDIFY" in elegant small-caps spaced-out text
- WATERMARK: "@brandifycoo" small and subtle in a corner
- No exaggerated text effects, no outlines, no glows — clean and editorial only

📐 COMPOSITION:
- Balanced, spacious, strong negative space, rule of thirds
- The subject/photo should be the hero — typography complements, never fights
- Think luxury brand Instagram or LinkedIn campaign
- Similar to Ferrari, Apple, Nike, or high-end marketing agencies

🚫 ABSOLUTELY FORBIDDEN (NEGATIVE PROMPT):
- AI artifacts, fake lighting, plastic skin, exaggerated realism
- Surreal visuals, cartoon style, low-quality design
- Stock-photo look, generic marketing layout
- Futuristic UI, neon colors, cyberpunk aesthetics
- Artificial textures, over-saturated colors
- Exaggerated depth or surreal elements
- "AI look" faces or objects
- Random icons or generic illustrations
- Flat design, vector art, clipart, Canva template look
- If it looks AI-generated → WRONG. Regenerate.

🧠 QUALITY CHECK: This must look like a REAL brand created it for Instagram or LinkedIn. Think luxury brands, tech companies, or professional marketing agencies. If it looks simple, generic, or AI-made → regenerate.

CONTENT/TOPIC for the headline: ${prompt}`;

    let imageUrl: string | undefined;

    // Build message content parts (text + optional reference image)
    const buildMessageContent = () => {
      const parts: any[] = [{ type: "text", text: imagePrompt }];
      if (referenceImage) {
        // referenceImage is a base64 data URL like "data:image/png;base64,..."
        parts.push({
          type: "image_url",
          image_url: { url: referenceImage },
        });
      }
      return parts;
    };

    // Provider 1: Lovable AI Gateway (primary)
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
              messages: [{ role: "user", content: buildMessageContent() }],
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

    // Provider 2: Direct Gemini API (fallback)
    if (GEMINI_API_KEY && !imageUrl) {
      const model = "gemini-2.5-flash-image";
      console.log(`Trying direct Gemini fallback: ${model}`);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        // Build parts for Gemini native format
        const geminiParts: any[] = [{ text: imagePrompt }];
        if (referenceImage) {
          // Extract mime type and base64 data from data URL
          const match = referenceImage.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) {
            geminiParts.push({
              inlineData: { mimeType: match[1], data: match[2] },
            });
          }
        }

        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: geminiParts }],
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
