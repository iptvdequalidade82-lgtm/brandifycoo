import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Niche Visual DNA ──
const NICHE_VISUAL_DNA: Record<string, { props: string; environment: string; palette: string; heroElement: string }> = {
  "barbearia|barbeiro|barba": {
    props: "straight razor, barber scissors, pomade jar, hot towel, barber cape, shaving brush",
    environment: "classic barbershop with leather chair, warm industrial lighting, dark wood, brick walls",
    palette: "deep black + warm gold + aged leather brown",
    heroElement: "barber chair or straight razor in dramatic close-up",
  },
  "dentista|odontologia|sorriso": {
    props: "dental mirror, bright confident smile, modern dental chair, teeth whitening light",
    environment: "clean modern dental clinic with soft blue-white lighting, minimalist decor",
    palette: "clinical white + mint green + light blue",
    heroElement: "radiant close-up smile or sleek dental equipment",
  },
  "advogado|advocacia|jurídico|direito": {
    props: "law books, gavel, scales of justice, legal documents, fountain pen",
    environment: "sophisticated law office with dark mahogany desk, floor-to-ceiling bookshelves",
    palette: "navy blue + dark wood brown + gold accents",
    heroElement: "scales of justice or stacked law books with dramatic side lighting",
  },
  "restaurante|comida|food|gastronomia|culinária": {
    props: "beautifully plated dish, chef hands, fresh herbs, wine glass, wooden cutting board",
    environment: "upscale restaurant kitchen or elegant dining table with warm ambient lighting",
    palette: "warm amber + rich browns + cream white",
    heroElement: "hero plated dish with steam or chef hands in action",
  },
  "academia|fitness|gym|treino|personal": {
    props: "dumbbells, barbell, kettlebell, gym rack, resistance bands, protein shake",
    environment: "industrial gym with dark concrete, neon accent lights, rubber floor",
    palette: "matte black + electric red or neon green + steel gray",
    heroElement: "dramatic dumbbell close-up or athletic silhouette",
  },
  "salão|cabeleireiro|cabelo|beleza|beauty": {
    props: "hair scissors, styling brush, hair dryer, color tubes, salon chair",
    environment: "chic modern salon with large mirrors, soft warm lighting, marble accents",
    palette: "rose gold + soft blush pink + warm white",
    heroElement: "flowing hair or styling scissors in elegant composition",
  },
  "imobiliária|imóvel|corretor|casa|apartamento": {
    props: "house keys, modern architecture facade, luxury interior, pool, balcony view",
    environment: "luxury property exterior at golden hour or stunning penthouse interior",
    palette: "warm cream + golden hour amber + deep charcoal",
    heroElement: "dramatic architectural shot or key handover moment",
  },
  "pet|pet shop|cachorro|gato|veterinário": {
    props: "adorable dog/cat portrait, paw prints, grooming tools, pet collar, treat",
    environment: "bright clean pet salon or cozy home setting with natural light",
    palette: "warm pastels + soft cream + playful coral or sky blue",
    heroElement: "close-up of adorable pet face with expressive eyes",
  },
  "pizza|pizzaria": {
    props: "wood-fired pizza with stretching cheese, pizza paddle, rustic oven, fresh basil",
    environment: "brick-walled pizzeria with roaring wood oven, warm orange glow",
    palette: "warm red + golden cheese yellow + rustic brown",
    heroElement: "dramatic cheese pull shot or pizza in front of fire",
  },
  "hambúrguer|hamburgueria|burger|lanche": {
    props: "towering gourmet burger, melting cheese, crispy fries, craft sauce drip",
    environment: "moody dark restaurant with dramatic overhead spotlighting",
    palette: "deep black + warm amber + rich sauce red",
    heroElement: "epic burger cross-section or dramatic cheese melt",
  },
  "café|cafeteria|coffee": {
    props: "latte art, coffee beans, espresso machine, ceramic cup, pour-over",
    environment: "artisan coffee shop with exposed brick, morning light streaming in",
    palette: "rich espresso brown + warm cream + soft sage green",
    heroElement: "beautiful latte art pour or steam rising from cup",
  },
  "contabilidade|contador|financeiro": {
    props: "financial charts, calculator, organized documents, laptop with spreadsheet",
    environment: "modern corporate office with clean desk, ambient monitor glow",
    palette: "navy blue + professional gray + crisp white",
    heroElement: "growth chart or organized workspace from above",
  },
  "fotografia|fotógrafo|ensaio": {
    props: "DSLR camera, lens collection, lighting equipment, photo prints, memory card",
    environment: "creative studio with dramatic lighting setup, backdrop rolls",
    palette: "rich cinematic tones + dramatic contrast + warm golden light",
    heroElement: "camera lens with dramatic reflection or behind-the-scenes shot",
  },
  "tecnologia|tech|software|startup": {
    props: "laptop with code, modern workspace, multiple monitors, sleek devices",
    environment: "minimalist tech office with ambient LED lighting, clean white desk",
    palette: "electric blue + matte black + cool white",
    heroElement: "code on screen with dramatic glow or sleek device array",
  },
  "loja de roupa|moda|fashion|boutique": {
    props: "styled outfit on hanger, fabric textures, fashion accessories, shopping bags",
    environment: "high-end boutique with curated displays, soft spotlight, minimal racks",
    palette: "nude tones + black + one bold accent (red or emerald)",
    heroElement: "draped fabric texture or styled flat lay",
  },
  "clínica|médico|saúde|hospital": {
    props: "stethoscope, medical equipment, clean clinical environment, doctor hands",
    environment: "modern medical clinic with soft blue-white lighting, clean lines",
    palette: "clinical white + calming blue + soft green",
    heroElement: "stethoscope in artistic arrangement or clean medical setting",
  },
  "estética|skincare|limpeza de pele": {
    props: "facial roller, serum dropper, clean skin close-up, treatment tools",
    environment: "luxurious spa treatment room with soft candlelight, white linens",
    palette: "soft white + blush pink + gold accents",
    heroElement: "dewy skin close-up or elegant product arrangement",
  },
  "energia solar|painel solar|fotovoltaica": {
    props: "solar panels on roof, bright sun, green landscape, modern inverter",
    environment: "modern home rooftop with gleaming solar panels under blue sky",
    palette: "sky blue + sunlight yellow + sustainable green",
    heroElement: "dramatic low-angle solar panel array catching sunlight",
  },
  "arquitetura|arquiteto|design de interiores": {
    props: "blueprints, architectural model, ruler, pencil, modern building facade",
    environment: "architect studio with large format prints, models on desk, natural light",
    palette: "clean white + charcoal + warm wood tones",
    heroElement: "striking modern building exterior or interior perspective",
  },
  "marketing|social media|agência|tráfego": {
    props: "analytics dashboard, social media icons, growth charts, creative workspace",
    environment: "modern agency workspace with multiple screens, colorful post-its",
    palette: "vibrant purple + electric blue + clean white",
    heroElement: "analytics screen showing growth or creative brainstorm setup",
  },
  "churrascaria|churrasco|açougue|carnes": {
    props: "sizzling grill with flames, premium cut of meat, tongs, charcoal, smoke",
    environment: "outdoor BBQ setting with fire pit, dramatic smoke, rustic wood table",
    palette: "fire orange + charcoal black + smoky amber",
    heroElement: "dramatic close-up of sizzling meat on flames",
  },
  "padaria|confeitaria|bolo|doce|pão": {
    props: "fresh golden bread, artisan pastries, flour dust in air, oven, wooden board",
    environment: "rustic bakery with warm oven glow, flour-dusted surfaces, basket display",
    palette: "warm wheat gold + cream white + rustic brown",
    heroElement: "golden crusty bread or elaborate pastry close-up",
  },
  "farmácia|drogaria|medicamento": {
    props: "organized medicine shelves, health products, pharmacy cross, clean counter",
    environment: "modern pharmacy with organized displays, clean white shelving",
    palette: "pharmacy green + clean white + professional blue",
    heroElement: "organized pharmacy shelf or green cross symbol",
  },
  "oficina|mecânica|carro|auto": {
    props: "car engine, wrench set, oil filter, lifted car, diagnostic tool",
    environment: "professional auto shop with hydraulic lift, tool wall, clean floor",
    palette: "metallic chrome + industrial gray + warning red accent",
    heroElement: "dramatic engine close-up or car on lift",
  },
  "joalheria|joia|ouro|prata": {
    props: "sparkling diamond ring, gold necklace, velvet display box, magnifying loupe",
    environment: "luxury jewelry display with dramatic spotlight on velvet cushion",
    palette: "deep black + rich gold + diamond white sparkle",
    heroElement: "macro shot of sparkling gemstone or golden piece",
  },
  "manicure|unhas|nail|pedicure": {
    props: "polished nails, nail art brushes, polish bottles, UV lamp, cuticle tools",
    environment: "chic nail salon station with organized polish collection, soft lighting",
    palette: "soft nude pink + elegant white + rose gold",
    heroElement: "stunning nail art close-up or elegant hand pose",
  },
  "tatuagem|tattoo|tatuador": {
    props: "tattoo machine, ink cups, stencil, detailed skin art, gloved hands",
    environment: "artist tattoo studio with flash art walls, dramatic focused lighting",
    palette: "deep black + skin tones + accent red or blue",
    heroElement: "tattoo machine in action or detailed ink work close-up",
  },
  "escola|ensino|educação|curso": {
    props: "books, laptop, colorful notebooks, whiteboard, graduation cap",
    environment: "modern classroom or study space with natural light, organized desk",
    palette: "bright blue + warm yellow + clean white",
    heroElement: "open book or focused study setup from above",
  },
  "psicólogo|psicologia|terapia|saúde mental": {
    props: "comfortable therapy chair, warm throw blanket, plant, journal, soft lamp",
    environment: "cozy therapy office with warm ambient lighting, earth-tone decor",
    palette: "soft lavender + warm cream + sage green",
    heroElement: "peaceful therapy space or journaling hands",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const type = typeof body?.type === "string" ? body.type.toLowerCase() : "feed";
    const referenceImage = typeof body?.referenceImage === "string" ? body.referenceImage : undefined;
    const niche = typeof body?.niche === "string" ? body.niche.trim() : "";

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt da imagem é obrigatório." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const isStory = type === "story" || type === "stories";
    const aspectRatio = isStory ? "9:16" : "1:1";
    const dimensions = isStory ? "1080x1920" : "1080x1080";

    // 12 curated visual styles
    const styles = [
      { id: "CINEMATIC_LANDSCAPE", desc: `Full-bleed dramatic landscape photograph. Person silhouetted or with back turned. MASSIVE bold typography filling 40-50% of frame using clipping mask. Cinematic color grading.` },
      { id: "DARK_LUXURY", desc: `Night urban setting with dramatic low-key lighting. High contrast: deep blacks + bright whites + subtle warm accent. Bold white typography with texture fill inside letters.` },
      { id: "EDITORIAL_BRAND", desc: `Magazine-quality dark editorial layout. Large hero subject with dramatic side lighting. Multi-weight typography. One accent color for key words. Design overlays: subtle grids.` },
      { id: "CLEAN_TYPOGRAPHY_3D", desc: `Clean white/light gray background — Swiss poster aesthetic. MASSIVE bold black condensed text. ONE letter replaced by hyper-realistic 3D textured object. Real shadow. Small accent label.` },
      { id: "MONOCHROME_BOLD", desc: `Strong single vivid color background. One dominant visual element. GIANT bold typography with texture fill. Mix of script + massive bold for hierarchy. Minimal composition.` },
      { id: "WARM_NATURE_EDITORIAL", desc: `Warm amber/golden palette. Photorealistic macro hero element. GIANT mixed typography: massive serif + elegant script accent. Warm bokeh particles. Glass overlay cards.` },
      { id: "DARK_DRAMATIC", desc: `Deep moody dark atmosphere. Dramatic 3D element central. GIANT bold gradient typography overlapping the scene. Rim lighting. Deep blues + teal + amber text.` },
      { id: "GLASSMORPHISM", desc: `Dramatic full-frame background. FROSTED GLASS CARD at bottom with bold accent text + regular white. Cinematic lighting, depth layers.` },
      { id: "SCULPTURE_REMIX", desc: `Classical sculpture or 3D form REMIXED with modern elements. Strong single dominant color. ENORMOUS condensed bold typography at multiple opacity levels.` },
      { id: "RETRO_EDITORIAL", desc: `Real landscape with vintage/retro color grading. One focal object. GIANT bold editorial typography: condensed sans-serif + flowing script mix. Film grain texture.` },
      { id: "SPOTLIGHT_PRODUCT", desc: `Near-black background with single dramatic spotlight from above. Hero product/object centered, floating. Bold white stacked typography. Smoke/dust particles catching light.` },
      { id: "VIBRANT_3D", desc: `Light/white background. MASSIVE bold vivid-colored word filling frame. Hyper-realistic colorful 3D element centered overlapping text. Color palette swatches. Energetic.` },
    ];

    const selected = styles[Math.floor(Math.random() * styles.length)];

    // ── Niche Visual DNA detection ──
    const normalizeText = (text: string) =>
      text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    let nicheVisualBlock = "";
    const detectionSource = normalizeText([niche, prompt].filter(Boolean).join(" "));

    for (const [keywords, dna] of Object.entries(NICHE_VISUAL_DNA)) {
      const hasMatch = keywords.split("|").map(kw => normalizeText(kw.trim())).some(kw => detectionSource.includes(kw));
      if (hasMatch) {
        nicheVisualBlock = `
🏪 NICHE VISUAL DNA (MANDATORY — THIS OVERRIDES EVERYTHING):
  PROPS to use: ${dna.props}
  ENVIRONMENT: ${dna.environment}
  COLOR PALETTE: ${dna.palette}
  HERO ELEMENT: ${dna.heroElement}

You MUST include at least 1 prop and the hero element from this niche. The image must be INSTANTLY recognizable as belonging to this business category.`;
        break;
      }
    }

    if (!nicheVisualBlock && niche) {
      nicheVisualBlock = `
🏪 NICHE VISUAL DNA (MANDATORY):
Business: ${niche}
Include ONLY visual elements, props, tools, and environments that are UNMISTAKABLY from this specific business niche.
The viewer must instantly recognize what business this post is about without reading any text.`;
    }

    if (!nicheVisualBlock) {
      nicheVisualBlock = `
🏪 AUTO-DETECT NICHE: Analyze the topic and include ONLY visual elements directly related to that specific business.`;
    }

    const referenceInstruction = referenceImage
      ? `\n📎 REFERENCE IMAGE PROVIDED: Analyze the reference image. Extract its color scheme, composition style, mood, and branding elements. Create a NEW image that maintains these visual qualities while incorporating the niche elements and headline above. Keep the same artistic direction but make it fresh.`
      : "";

    const imagePrompt = `Create a PREMIUM social media ${isStory ? "STORY (VERTICAL 9:16, 1080x1920px — MUST be portrait/vertical)" : "post (SQUARE 1:1, 1080x1080px)"} for BRANDIFY (@brandifycoo), a Brazilian creative agency.

## NON-NEGOTIABLE RULES
1. Must look 100% HUMAN-MADE — like a real senior designer created it. ZERO AI artifacts.
2. MINIMALIST composition — generous negative space, ONE clear focal point.
3. MAX 3-6 words in the headline. Short, impactful, editorial quality.
4. 2-3 color palette MAX. Bold but restrained.
5. Text must be perfectly typeset — clean kerning, consistent baseline, professional hierarchy.
6. NO floating random elements, NO busy backgrounds, NO stock photo feel.
7. Small subtle "@brandifycoo" watermark in bottom-right corner.

## 🔒 NICHE LOCK (HIGHEST PRIORITY)
Niche: ${niche || "Detect from topic"}
If the image is beautiful but NOT clearly from this niche, it is WRONG. Niche accuracy > visual style.
${nicheVisualBlock}

## 🎯 VISUAL STYLE FRAMEWORK — ${selected.id}
${selected.desc}

IMPORTANT: Adapt this style framework to the niche above. Keep the COMPOSITION and LAYOUT quality but replace ALL subjects, props, and elements with niche-specific ones from the Niche Visual DNA.

## 📸 TECHNICAL SPECS
- Real DSLR quality: shallow depth of field, cinematic lighting, natural textures
- Typography: Bold sans-serif or elegant serif. Clean, integrated (20-35% of frame max)
- ${isStory ? "VERTICAL orientation — full portrait layout" : "SQUARE composition — balanced 1:1"}
- Professional color grading — no oversaturation

## 🚫 STRICTLY FORBIDDEN
AI artifacts, glitchy text, too much text, gray text color, busy compositions, stock photo look, Canva template aesthetic, vector art, AI watermarks, generic imagery unrelated to niche.
${referenceInstruction}

## TOPIC/HEADLINE
${prompt}`;

    let imageUrl: string | undefined;

    const geminiParts: any[] = [{ text: imagePrompt }];
    if (referenceImage) {
      const match = referenceImage.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) geminiParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }

    // Try image generation models
    const imageModels = ["gemini-3.1-flash-image-preview", "gemini-3-pro-image-preview"];
    for (const model of imageModels) {
      if (imageUrl) break;
      console.log(`Trying direct Gemini: ${model}`);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: geminiParts }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
        });
        clearTimeout(timeout);

        if (res.status === 429) {
          console.warn(`Rate limited on ${model}, trying next...`);
          continue;
        }

        if (res.ok) {
          const data = await res.json();
          const parts = data.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.mimeType?.startsWith("image/")) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                console.log(`Direct Gemini ${model} succeeded`);
                break;
              }
            }
          }
        } else {
          const t = await res.text();
          console.error(`Direct Gemini ${model} failed:`, res.status, t.slice(0, 300));
        }
      } catch (e) {
        console.error(`Direct Gemini ${model} threw:`, e);
      }
    }

    if (!imageUrl) throw new Error("Serviços de IA temporariamente indisponíveis. Tente novamente em alguns minutos.");

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
