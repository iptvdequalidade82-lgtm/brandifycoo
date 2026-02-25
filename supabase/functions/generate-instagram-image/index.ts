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

    // Rotate between 18 visual models trained from real reference posts
    const visualModels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"];
    const selectedModel = visualModels[Math.floor(Math.random() * visualModels.length)];

    const modelInstructions: Record<string, string> = {
      A: `MODEL A — IMPACTFUL TYPOGRAPHY WITH SCENIC BACKGROUND:
- Dramatic real photograph as full background (ocean cliffs, mountains, sunsets, city skylines, epic landscapes)
- Person (back turned or face hidden) as central figure — wearing streetwear, hoodie, or dark clothes
- MASSIVE bold typography that DOMINATES the image — words so big they fill 40-60% of the frame
- Text uses CLIPPING MASK effect: the letters are filled with a different landscape/sky texture visible THROUGH the text
- Cinematic color grading: golden hour, blue tones, dramatic clouds
- Motivational/aspirational Portuguese text in the headline
- Reference: "O PLANO DE DEUS NUNCA INCLUIU DESISTIR, SÓ VENCER" style with landscape-filled giant text`,

      B: `MODEL B — DARK LUXURY NIGHT SCENE:
- Night urban setting: gas station, parking lot, city street at night — low-key dramatic lighting
- Luxury/sport car (BMW, Mercedes, Porsche) as main element with person leaning on it
- Person in dark clothing, face obscured or in shadow — mysterious, powerful vibe
- GIANT white bold typography with BRAND PATTERN FILL (like Louis Vuitton monogram inside letters)
- High contrast: deep blacks, bright whites, subtle red accents from car lights
- Mood: power, ambition, luxury, street culture meets high fashion
- Reference: "A ÚNICA OPÇÃO É VENCER" with LV-pattern filled letters over night car scene`,

      C: `MODEL C — EXTREME SPORTS ACTION:
- Real action photography: snowboarding, surfing, skateboarding, mountain biking, motorsport
- Dynamic composition with motion blur or powder/spray effects
- Person in the middle of action — full body, dramatic pose
- Clean, elegant typography — mix of italic script and bold sans-serif
- Soft or dramatic colors matching the sport: pink/purple for snow, blue for ocean, warm for desert
- Text positioned to complement the action, not block it
- Reference: snowboarder with clean white text and generous negative space`,

      D: `MODEL D — CINEMATIC SPEED & MOTION:
- Motion blur background suggesting high speed — racing, driving, running
- Dark/moody atmosphere with dramatic lighting (headlights, speed streaks)
- Object in sharp focus against blurred background (helmet, car detail, face)
- Bold white/silver typography with MOTION BLUR EFFECT on the text itself
- Red and black color palette, cinematic grain
- Reference: Ferrari helmet with "NÃO TENHA MEDO DE IR DEVAGAR, SÓ EM PARAR" in motion-blurred text`,

      E: `MODEL E — EDITORIAL BRAND STORYTELLING:
- Dark, sophisticated editorial layout — magazine-quality composition
- Large hero portrait (profile shot, close-up) with dramatic side lighting
- Overlay of subtle design elements: grids, brackets, technical marks, UI hints
- Multi-weight typography: large headline + smaller body text + brand credits
- Key words highlighted in ACCENT COLOR (orange, red, or brand color)
- Agency branding visible at top
- Reference: Nike editorial with "Como a Nike descobriu um novo pote de ouro" style dark layout`,

      F: `MODEL F — ASPIRATIONAL LIFESTYLE WITH GIANT NUMBERS/TEXT:
- Golden hour or dramatic sunset/sunrise as background
- Person reaching out toward camera (POV perspective) or standing at dramatic location
- ENORMOUS numbers or single word that FILLS the entire frame
- Numbers/text use CLIPPING MASK showing the sky/landscape THROUGH the characters
- Warm golden tones, ocean rocks, dramatic clouds
- Reference: "SEJA BEM VINDO 2026" with sunset-filled numbers over ocean rocks`,

      G: `MODEL G — SURREAL ENVIRONMENT WITH PRODUCT/LAPTOP:
- Creative surreal-but-grounded scene: underwater, jungle, space, fantasy setting
- Real product (laptop, phone, tablet) floating or placed in the surreal environment
- Laptop screen showing a real website or social media feed
- GIANT stylized text with CLIPPING MASK or transparency — text filled with environment texture
- Bubbles, particles, organic elements (rope, plants, rocks) adding depth
- Agency branding at bottom with elegant small text
- Think "tech product in magical world" — premium and creative
- Reference: Laptop underwater with "4 EXTENSÕES ESCONDIDAS QUE VÃO SALVAR A SUA VIDA!" style`,

      H: `MODEL H — BOLD AGENCY SOCIAL MEDIA STYLE (Orange/Dark):
- Strong brand colors: ORANGE and BLACK as dominant palette, or vibrant accent + dark background
- 3D rendered characters, mascots, or stylized portraits as hero elements
- Character can be: funny/expressive person, animal with human traits, superhero-styled figure
- Bold, chunky typography — mix of different weights and sizes for visual hierarchy
- Agency header bar at top: "AGÊNCIA [NAME]" with logo
- Multiple text elements: headline + subheadline + CTA + small body text
- Energetic, fun, attention-grabbing — designed to STOP THE SCROLL
- Social media UI elements visible (save icon, share icon) as design accents
- Reference: Agência Tenks grid with orange/dark posts, 3D characters, bold headlines`,

      I: `MODEL I — ROYAL/PREMIUM PORTRAIT:
- Rich, deep color background (burgundy, royal red, deep purple, dark gold)
- Person facing camera with CROWN, luxury accessories, or royal elements
- Premium editorial portrait — dramatic lighting on face, dark vignette
- Overlay of faded text (lorem ipsum style) as texture behind the person
- GIANT headline at bottom using GRADIENT TEXT (gold to orange) or mixed serif/sans-serif
- "Parental Advisory" style badges or stamp-like design elements as accents
- Mood: royalty, authority, confidence, premium content
- Reference: Man with crown, red background, "Copie o meu Prompt" with gradient gold text`,

      J: `MODEL J — DARK TECH/LAUNCH ANNOUNCEMENT:
- Deep black/dark background with subtle grid or particle effects
- Hyper-detailed 3D rendered animal or creature as hero (cat, wolf, lion, eagle)
- Creature has GLOWING EYES (red, orange, or electric blue) — dramatic and intense
- Brand logo and name prominently at top
- GIANT bold colored text (orange, red) as main headline — product or event name
- "SAVE THE DATE" or launch-style urgency elements
- Design tool icons (Photoshop toolbar, pen tool icons) floating as subtle background elements
- Mood: powerful, tech-forward, aggressive launch energy
- Reference: Black cat with red glowing eyes, "MIAL - Método IA Lucrativa" dark launch post`,

      K: `MODEL K — BEACH/LIFESTYLE RETROSPECTIVE:
- Person at beach or outdoor lifestyle setting — relaxed, confident pose
- GIANT white typography (numbers or words) as background element, person IN FRONT of text
- Text so large it extends beyond the frame edges
- Mix of handwritten script + bold block text
- Small design elements: measurement scale on sides, brand credits in corners
- Bright blue sky, warm natural light, summer vibes
- Reference: "RETROSPECTIVA 2025" with giant white numbers behind beach person`,

      L: `MODEL L — SURREAL FLYING OBJECT WITH FLOWERS:
- Object (car, product, person) FLOATING in the sky among clouds
- Surrounded by flowers, petals, or natural organic elements
- Dreamy, magical composition — surreal but beautiful
- GIANT 3D-perspective typography that wraps around or behind the floating object
- Script/handwritten accent text in contrasting color (red, orange)
- Warm golden/sunset tones mixed with floral colors
- Reference: Red Porsche flying among clouds and flowers with giant perspective text`,

      M: `MODEL M — MONOCHROMATIC BOLD WITH ANIMAL:
- Strong single-color background (gold/yellow, red, blue, green)
- Hyper-detailed animal as hero: lion, leopard, tiger, eagle, wolf
- GIANT bold typography with TEXTURE FILL — text filled with animal print or material pattern
- Mix of script + massive bold text for hierarchy
- Small decorative elements: checkered bars, star icons, brand watermarks
- Reference: Golden leopard on yellow with textured "GRADIENTS" text`,

      N: `MODEL N — CLASSICAL STATUE REMIX:
- Greek/Roman marble statue REMIXED with modern elements (fur coat, gold chains, sneakers)
- Bright sky background with fluffy clouds — pastel palette (pink, baby blue)
- GIANT white text behind statue using CLIPPING MASK
- Elegant script + massive bold text combination
- Measurement scale and technical marks on edges
- Reference: Greek statue with pink fur coat, "Posts dos ALUNOS" giant text`,

      O: `MODEL O — GOLDEN HOUR SPORTS ACTION:
- Dynamic sports action: basketball dunk, soccer, boxing, MMA
- Golden hour lighting with LIGHT TRAIL effects (glowing streaks around athlete)
- Low-angle dramatic camera — athlete looks heroic
- Bold white + gold/orange typography at top
- Mix of block sans-serif + hand-brushed text
- Lens flare and bokeh effects — cinematic sports photography
- Reference: Basketball player mid-dunk with golden light trails, "PROMPTS SPORTS"`,

      P: `MODEL P — FUTURISTIC FASHION EDITORIAL:
- Strong single-color background (electric blue, hot pink, chrome silver)
- Person in futuristic/metallic fashion: chrome jacket, reflective visor, metallic helmet
- Profile or 3/4 angle portrait — editorial fashion photography
- GIANT text same color as background but different shade — embossed/debossed effect
- Mix of elegant script + massive block letters
- Technical marks: measurement scale, year, category labels
- Reference: Woman in chrome blue outfit with tonal "TEXTURAS" text`,

      Q: `MODEL Q — CHROME/METALLIC ANIMAL TYPOGRAPHY:
- Deep black background — pure darkness
- Hyper-detailed animal face: white tiger, wolf, eagle, panther
- Animal has GLOWING EYES (electric blue, ice white)
- CHROME/METALLIC 3D typography arching above — letters look like liquid metal
- Script accent text in white or silver
- Monochromatic cool palette: black, white, silver, ice blue
- Reference: White tiger with blue eyes, chrome "ESTAMPAS" text arching above`,

      R: `MODEL R — VIBRANT COLOR-BLOCKED WITH VEHICLE:
- Rich saturated single-color environment (emerald green, deep red, electric blue, hot pink)
- Person in matching-color outfit + luxury car in SAME COLOR
- Everything color-coordinated — monochromatic but vibrant
- GIANT bold white or contrasting text overlaid
- Mix of script + bold typography
- Cherry blossoms, fabric waves, or themed elements matching the color
- Reference: Mercedes G-Class in pink cherry blossom scene with giant text`,
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

    // ── Niche detection: add contextually relevant visual elements ──
    const nicheMap: Record<string, string> = {
      "churrascaria|churrasco|grelha|churrasqueira|açougue|carnes": `🥩 NICHE — CHURRASCARIA/BBQ: Include smoking grill, charcoal flames, sizzling picanha, espeto/skewers, rustic wood cutting boards. Warm fire orange, ember red, smoky atmosphere. Environment: rustic steakhouse, outdoor BBQ pit, churrasqueira de tijolos.`,
      "salão|salao|cabeleireiro|cabelo|beleza|beauty|estética|estetica|manicure|unhas": `💇 NICHE — BEAUTY SALON: Include scissors, hair styling, mirrors, salon chairs. Rose gold, soft pink, champagne tones. Environment: modern salon interior.`,
      "academia|fitness|gym|treino|musculação|crossfit|personal": `🏋️ NICHE — FITNESS: Include dumbbells, barbells, weight plates, gym floor. Dark blacks, neon accents, steel grays. Environment: modern gym interior.`,
      "restaurante|comida|food|gastronomia|pizza|hambúrguer|hamburgueria|sushi|padaria|confeitaria|bolo|café|cafeteria": `🍽️ NICHE — FOOD: Include beautifully plated dishes, chef hands, fresh ingredients, steam. Warm golden, rich browns, fresh greens. Environment: restaurant/kitchen.`,
      "advocacia|advogado|jurídico|juridico|direito|escritório": `⚖️ NICHE — LAW: Include gavel, law books, scales of justice. Navy blue, dark wood, gold. Environment: elegant office.`,
      "dentista|odontologia|clareamento|sorriso": `🦷 NICHE — DENTAL: Include bright smiles, clean clinical elements. Whites, light blues, mint green. Environment: modern dental office.`,
      "imobiliária|imobiliaria|imóvel|casa|apartamento|corretor": `🏠 NICHE — REAL ESTATE: Include luxury property, keys, modern architecture. Warm whites, golden hour. Environment: luxury apartment.`,
      "loja|roupa|moda|fashion|boutique|streetwear|tênis|sneaker": `👗 NICHE — FASHION: Include clothing racks, fashion accessories, styled outfits. Trendy colors. Environment: boutique interior.`,
      "pet|veterinário|veterinario|cachorro|gato|banho e tosa": `🐾 NICHE — PET: Include cute dogs/cats, paw prints, grooming tools. Warm pastels. Environment: pet shop/vet clinic.`,
      "barbearia|barbeiro|barba|corte masculino": `💈 NICHE — BARBERSHOP: Include straight razor, barber chair, pomade. Deep blacks, gold, chrome. Environment: modern barbershop.`,
      "oficina|mecânica|mecanica|carro|auto|funilaria": `🔧 NICHE — AUTO: Include car parts, tools, lifted vehicle. Metallic grays, chrome. Environment: professional garage.`,
      "escola|educação|educacao|curso|aula|professor": `📚 NICHE — EDUCATION: Include books, classroom, notebooks. Navy blue, warm wood. Environment: modern classroom.`,
      "farmácia|farmacia|médico|medico|hospital|clínica médica": `🏥 NICHE — HEALTH: Include stethoscope, clean clinical elements. Whites, light blues. Environment: modern clinic.`,
    };

    let nicheInstruction = "";
    const promptLower = prompt.toLowerCase();
    for (const [keywords, instruction] of Object.entries(nicheMap)) {
      if (keywords.split("|").some((kw) => promptLower.includes(kw))) {
        nicheInstruction = `\n\n🏪 NICHE-SPECIFIC VISUALS:\n${instruction}\nCRITICAL: Visual elements MUST match the business niche. Do NOT use random animals or unrelated objects. Every element should reinforce the niche.`;
        break;
      }
    }

    const imagePrompt = `Create a clean, high-end, professional social media ${type === "story" ? "story (9:16 vertical, 1080x1920px)" : "feed post (1:1 square, 1080x1080px)"} for BRANDIFY, a premium Brazilian creative agency.

The image must look 100% realistic, like a real brand campaign — NOT AI-generated.

🎯 VISUAL MODEL: ${selectedModel}
${modelInstructions[selectedModel]}
${referenceInstruction}
${nicheInstruction}

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
- WATERMARK: Place a small, subtle "BRANDIFY" or "@brandifycoo" text in the BOTTOM-RIGHT corner — semi-transparent, minimal, like a professional agency watermark. Do NOT use the Gemini star logo.
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
- Visual elements that DON'T MATCH the business niche — no random animals for a restaurant, no food for a gym
- Gemini star watermark or any AI branding — do NOT include the Gemini star logo anywhere
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
