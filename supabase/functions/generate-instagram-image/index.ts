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

    // Rotate between 6 visual models trained from real reference posts
    const visualModels = ["A", "B", "C", "D", "E", "F"];
    const selectedModel = visualModels[Math.floor(Math.random() * visualModels.length)];

    const modelInstructions: Record<string, string> = {
      A: `MODEL A — IMPACTFUL TYPOGRAPHY WITH SCENIC BACKGROUND:
- Dramatic real photograph as full background (ocean cliffs, mountains, sunsets, city skylines, epic landscapes)
- Person (back turned or face hidden) as central figure — wearing streetwear, hoodie, or dark clothes
- MASSIVE bold typography that DOMINATES the image — words so big they fill 40-60% of the frame
- Text uses CLIPPING MASK effect: the letters are filled with a different landscape/sky texture visible THROUGH the text
- Cinematic color grading: golden hour, blue tones, dramatic clouds
- Motivational/aspirational Portuguese text in the headline
- Think Instagram viral motivational pages with premium design quality
- Reference: "O PLANO DE DEUS NUNCA INCLUIU DESISTIR, SÓ VENCER" style with landscape-filled giant text`,

      B: `MODEL B — DARK LUXURY NIGHT SCENE:
- Night urban setting: gas station, parking lot, city street at night — low-key dramatic lighting
- Luxury/sport car (BMW, Mercedes, Porsche) as main element with person leaning on it
- Person in dark clothing, face obscured or in shadow — mysterious, powerful vibe
- GIANT white bold typography with BRAND PATTERN FILL (like Louis Vuitton monogram inside letters)
- High contrast: deep blacks, bright whites, subtle red accents from car lights
- Text occupies upper 40% of image, car/person in lower 60%
- Mood: power, ambition, luxury, street culture meets high fashion
- Reference: "A ÚNICA OPÇÃO É VENCER" with LV-pattern filled letters over night car scene`,

      C: `MODEL C — EXTREME SPORTS ACTION:
- Real action photography: snowboarding, surfing, skateboarding, mountain biking, motorsport
- Dynamic composition with motion blur or powder/spray effects
- Person in the middle of action — full body, dramatic pose
- Clean, elegant typography — mix of italic script and bold sans-serif
- Soft or dramatic colors matching the sport: pink/purple for snow, blue for ocean, warm for desert
- Text positioned to complement the action, not block it
- Smaller, refined text — "faça acontecer, surpreenda a todos" style
- Reference: snowboarder with clean white text and generous negative space`,

      D: `MODEL D — CINEMATIC SPEED & MOTION:
- Motion blur background suggesting high speed — racing, driving, running
- Dark/moody atmosphere with dramatic lighting (headlights, speed streaks)
- Object in sharp focus against blurred background (helmet, car detail, face)
- Bold white/silver typography with MOTION BLUR EFFECT on the text itself
- Text feels like it's MOVING with the subject
- Strong motivational message in Portuguese
- Red and black color palette, cinematic grain
- Reference: Ferrari helmet with "NÃO TENHA MEDO DE IR DEVAGAR, SÓ EM PARAR" in motion-blurred text`,

      E: `MODEL E — EDITORIAL BRAND STORYTELLING:
- Dark, sophisticated editorial layout — magazine-quality composition
- Large hero portrait (profile shot, close-up) with dramatic side lighting
- Overlay of subtle design elements: grids, brackets, technical marks, UI hints
- Multi-weight typography: large headline + smaller body text + brand credits
- Key words highlighted in ACCENT COLOR (orange, red, or brand color)
- Agency branding visible: "AGÊNCIA" or brand name at top
- Think Nike campaign or premium agency case study post
- Reference: Nike editorial with "Como a Nike descobriu um novo pote de ouro" style dark layout`,

      F: `MODEL F — ASPIRATIONAL LIFESTYLE WITH GIANT NUMBERS/TEXT:
- Golden hour or dramatic sunset/sunrise as background
- Person reaching out toward camera (POV perspective) or standing at dramatic location
- ENORMOUS numbers or single word that FILLS the entire frame
- Numbers/text use CLIPPING MASK showing the sky/landscape THROUGH the characters
- Smaller secondary text above or below the giant text
- Inspirational/seasonal theme: new year, new chapter, fresh start
- Warm golden tones, ocean rocks, dramatic clouds
- Reference: "SEJA BEM VINDO 2026" with sunset-filled numbers over ocean rocks`,
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
- Style: bold, impactful, cinematic, premium street-culture meets high-end design
- Mood: powerful, aspirational, motivational, ambitious, unstoppable
- Camera feel: real photography, DSLR/cinema camera, shallow depth of field, motion blur when appropriate
- Lighting: dramatic — golden hour, moody night, cinematic contrast, studio rim lighting
- Colors: high contrast — deep blacks, bright whites, golden tones, or sport-specific palettes
- Finish: ultra-polished, viral-worthy, looks like a top Brazilian Instagram page post

✍️ TYPOGRAPHY:
- MASSIVE bold sans-serif headlines — text should be a DOMINANT visual element (40-60% of frame)
- Use creative typography effects: CLIPPING MASKS (landscape visible through letters), PATTERN FILLS, MOTION BLUR on text
- Mix font weights dramatically: giant bold keyword + smaller elegant secondary text
- Creative line breaks for visual rhythm and impact
- Can use script/handwritten fonts for secondary accents
- WATERMARK: "@brandifycoo" or "POR BRANDIFY" small and subtle in a corner
- Text must feel INTEGRATED into the composition, not floating on top

📐 COMPOSITION:
- Person as central figure (face often hidden, back turned, or in shadow) — wearing streetwear/dark clothes
- Dramatic backgrounds: landscapes, night cities, extreme sports venues, luxury settings
- Text and subject share the same visual space — neither fights the other
- Think top viral Brazilian Instagram pages: motivational, powerful, visually stunning
- Similar to @mentemilionaria, @agenciatenks, luxury streetwear brands

🚫 ABSOLUTELY FORBIDDEN (NEGATIVE PROMPT):
- AI artifacts, fake lighting, plastic skin, exaggerated realism
- Surreal visuals, cartoon style, low-quality design
- Stock-photo look, generic marketing layout, Canva templates
- Futuristic UI, cyberpunk aesthetics
- Flat design, vector art, clipart
- Small, weak typography — text MUST be bold and impactful
- Generic motivational quote layouts with plain backgrounds
- If it looks AI-generated or like a basic template → WRONG. Regenerate.

🧠 QUALITY CHECK: This must look like a REAL post from a top Brazilian creative agency or viral motivational Instagram page. Think luxury streetwear brands, premium agencies, or pages with 1M+ followers. If it looks simple, generic, or AI-made → regenerate.

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
