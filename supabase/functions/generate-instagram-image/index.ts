import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!LOVABLE_API_KEY && !GEMINI_API_KEY) throw new Error("No API key configured");

    const isStory = type === "story" || type === "stories";
    const aspectRatio = isStory ? "9:16" : "1:1";
    const dimensions = isStory ? "1080x1920" : "1080x1080";

    // 12 curated visual styles — best performing, most diverse
    const styles = [
      {
        id: "CINEMATIC_LANDSCAPE",
        desc: `Full-bleed dramatic landscape photograph (ocean, mountains, golden hour sky). Person with back turned or silhouetted. MASSIVE bold typography filling 40-50% of frame using clipping mask (sky/landscape visible THROUGH the letters). Cinematic color grading. Aspirational mood.`
      },
      {
        id: "DARK_LUXURY",
        desc: `Night urban setting with dramatic low-key lighting. Dark clothing, mysterious figure. One luxury element (car, watch, environment). High contrast: deep blacks + bright whites + subtle warm accent. Bold white typography with texture fill or pattern inside letters.`
      },
      {
        id: "EDITORIAL_BRAND",
        desc: `Magazine-quality dark editorial layout. Large hero portrait with dramatic side lighting. Multi-weight typography: big headline + small body + brand credits. One accent color (orange or gold) for key words. Design overlays: subtle grids, brackets. Agency feel.`
      },
      {
        id: "CLEAN_TYPOGRAPHY_3D",
        desc: `Clean white/light gray background — ultra minimal, Swiss poster aesthetic. MASSIVE bold black condensed text dominating frame. ONE letter replaced by hyper-realistic 3D textured object (grass, metal, fabric, food). Object casts real shadow. Small orange accent label. Handwritten subtitle.`
      },
      {
        id: "MONOCHROME_BOLD",
        desc: `Strong single vivid color background (gold, emerald, royal blue). One dominant visual element matching niche. GIANT bold typography with texture fill — animal print, metal, fabric pattern inside letters. Mix of script + massive bold for hierarchy. Minimal composition.`
      },
      {
        id: "WARM_NATURE_EDITORIAL",
        desc: `Warm dominant palette: amber, golden orange. Photorealistic macro-style hero element relevant to niche. GIANT mixed typography: massive serif word + elegant script accent. Warm bokeh particles. Glass/translucent overlay cards. Numbered counter in corner. Nature editorial feel.`
      },
      {
        id: "DARK_DRAMATIC_CREATURE",
        desc: `Deep moody dark atmosphere (underwater, cave, dark forest). Dramatic 3D element central. GIANT bold gradient typography (white to amber) overlapping the scene. Bioluminescent glows, particles, dramatic rim lighting. Deep blues + teal + amber text accents.`
      },
      {
        id: "GLASSMORPHISM_PORTRAIT",
        desc: `Dramatic full-frame background (nature, cityscape, abstract). FROSTED GLASS CARD at bottom — glassmorphism with rounded corners, blur backdrop. Glass card has bold accent text in orange/gold + regular white. Cinematic lighting, rich colors, depth layers.`
      },
      {
        id: "STATUE_REMIX",
        desc: `Greek/Roman marble statue or 3D sculpture, REMIXED with modern elements. Strong single color dominates (purple, blue, pink). ENORMOUS condensed bold typography filling background at multiple opacity levels (100%, 40%, 15%). Accent labels in tilted dark tags.`
      },
      {
        id: "RETRO_EDITORIAL",
        desc: `Real landscape with vintage/retro color grading — warm film grain. One focal object relevant to niche. GIANT bold editorial typography: strong condensed sans-serif + flowing script mix. Handwritten annotation accent. Photographic toolbar mockup as meta-reference.`
      },
      {
        id: "ACTION_NEON",
        desc: `Near-black background with dramatic NEON LIGHT TRAILS (pink, cyan, purple). Dynamic action pose or moving element. Smoke/fog effects. GIANT white bold typography STACKED VERTICALLY. Script/graffiti accent at bottom. Geometric patterns subtly in background.`
      },
      {
        id: "VIBRANT_3D_MASCOT",
        desc: `Light/white background. MASSIVE bold vivid-colored word as background element filling entire frame. Hyper-realistic colorful 3D element centered, overlapping the giant text. Color palette swatches scattered. Small decorative elements (sparkles, petals). Energetic, eye-catching.`
      },
    ];

    const selected = styles[Math.floor(Math.random() * styles.length)];

    // ── Niche detection ──
    const nicheMap: Record<string, string> = {
      "churrascaria|churrasco|açougue|carnes|picanha": "BBQ/GRILL: Smoking grill, charcoal flames, sizzling meat, rustic wood. Fire orange, ember red.",
      "restaurante|comida|food|gastronomia|culinária": "RESTAURANT: Plated dishes, chef hands, fresh ingredients, steam. Warm golden, rich browns.",
      "pizza|pizzaria": "PIZZARIA: Wood-fired oven, stretching cheese, rustic table. Warm reds, golden crust.",
      "hambúrguer|hamburgueria|burger|lanche": "HAMBURGUERIA: Juicy burger, melting cheese, crispy fries. Dark moody, warm amber.",
      "padaria|confeitaria|bolo|doce|pão": "BAKERY: Fresh bread, pastries, flour dust. Warm cream, golden wheat.",
      "café|cafeteria|coffee": "COFFEE: Latte art, coffee beans, espresso machine, cozy mugs. Warm browns, cream.",
      "salão|cabeleireiro|cabelo|beleza|beauty": "BEAUTY: Scissors, hair styling, salon chairs. Rose gold, soft pink.",
      "barbearia|barbeiro|barba": "BARBERSHOP: Straight razor, barber chair, pomade. Deep blacks, gold, chrome.",
      "dentista|odontologia|sorriso": "DENTAL: Bright smiles, clean clinical. Whites, light blues, mint green.",
      "médico|hospital|clínica|saúde": "MEDICAL: Stethoscope, white coat, clinical. Whites, light blues.",
      "advocacia|advogado|jurídico|direito": "LAW: Gavel, law books, scales of justice. Navy blue, dark wood, gold.",
      "contabilidade|contador|financeiro": "ACCOUNTING: Calculator, financial charts. Navy, gray, professional.",
      "arquitetura|arquiteto|design de interiores": "ARCHITECTURE: Blueprints, modern buildings. Clean whites, blacks, minimal.",
      "academia|fitness|gym|treino|musculação|personal": "FITNESS: Dumbbells, barbells, gym. Dark blacks, neon accents, steel grays.",
      "imobiliária|imóvel|casa|apartamento|corretor": "REAL ESTATE: Luxury property, keys, modern architecture. Warm whites, golden hour.",
      "tecnologia|tech|software|app|startup": "TECH: Laptop, code, modern workspace. Electric blue, dark, minimal.",
      "marketing|social media|agência|tráfego": "DIGITAL MARKETING: Analytics, social icons, growth. Modern purple, blue.",
      "fotografia|fotógrafo|ensaio": "PHOTOGRAPHY: Camera, lens, lighting. Rich cinematic, dramatic light.",
      "loja de roupa|moda|fashion|boutique": "FASHION: Clothing racks, styled outfits. Trendy colors, editorial.",
      "pet|pet shop|cachorro|gato|banho e tosa": "PET: Cute dogs/cats, paw prints, grooming. Warm pastels, playful.",
      "estética|skincare|limpeza de pele": "AESTHETICS: Facial treatment, clean skin, serums. Soft whites, rose.",
      "oficina|mecânica|carro|auto": "AUTO SHOP: Car parts, tools, engine. Metallic grays, chrome.",
      "engenharia|construção|construtora": "CONSTRUCTION: Hard hat, crane, building. Safety yellow, steel gray.",
      "eletricista|elétrica|instalação elétrica": "ELECTRICIAN: Wiring, electrical panel, tools. Electric yellow, blue, gray.",
      "escola|ensino|educação|curso": "EDUCATION: Classroom, books, learning. Bright, professional.",
      "psicólogo|psicologia|terapia|saúde mental": "PSYCHOLOGY: Calm environment, warm light. Soft lavender, cream.",
      "farmácia|drogaria|medicamento": "PHARMACY: Medicine shelves, health products. Green cross, white.",
      "nutrição|nutricionista|dieta|saudável": "NUTRITION: Fresh salads, meal prep, healthy. Fresh greens, clean whites.",
      "floricultura|flores|buquê": "FLORIST: Beautiful arrangements, colorful petals. Vibrant, romantic.",
      "joalheria|joia|ouro|prata": "JEWELRY: Sparkling pieces, velvet boxes. Gold, silver, luxury black.",
      "energia solar|painel solar|fotovoltaica": "SOLAR: Solar panels, sun rays, green energy. Blue, yellow, green.",
      "celular|smartphone|assistência técnica": "CELL PHONE: Phone displays, repair tools. Sleek black, electric blue.",
      "veterinário|clínica veterinária": "VETERINARY: Dogs/cats, stethoscope, clinic. Warm pastels, professional.",
      "hotel|pousada|hospedagem|resort": "HOTEL: Luxury room, pool, lobby. Elegant gold, warm whites.",
      "festa|evento|buffet|casamento": "EVENTS: Balloons, decorations, celebration. Festive gold, vibrant.",
      "supermercado|mercado|hortifruti": "SUPERMARKET: Fresh produce, organized aisles. Fresh, colorful.",
      "ar condicionado|climatização|refrigeração": "AC/HVAC: AC unit, comfortable room. Cool blue, white, clean.",
      "limpeza|faxina|lavanderia": "CLEANING: Sparkling surfaces, supplies. Fresh blue, white.",
      "jardinagem|paisagismo|jardim": "LANDSCAPING: Lush garden, tools, green lawn. Fresh greens, earthy.",
      "segurança|vigilância|monitoramento|câmera": "SECURITY: Cameras, control room, alarm. Dark blue, black.",
      "manicure|unhas|nail|pedicure": "NAIL SALON: Polished nails, nail art. Soft pink, nude, elegant.",
      "maquiagem|makeup|maquiadora": "MAKEUP: Brushes, palettes, lipstick. Glam, rich tones.",
      "yoga|meditação|mindfulness": "YOGA: Mat, peaceful pose, nature. Earth tones, zen, minimal.",
      "sushi|japonês|temaki|sashimi": "JAPANESE FOOD: Sushi platter, chopsticks, bamboo. Black, red, zen.",
      "cervejaria|cerveja|bar|pub": "BAR/BREWERY: Craft beer taps, bar counter. Amber gold, moody.",
      "açaí|sorveteria|sorvete|gelato": "ICE CREAM/AÇAÍ: Colorful bowls, toppings. Vibrant purple, tropical.",
      "tatuagem|tattoo|tatuador": "TATTOO: Tattoo machine, ink, skin art. Dark, artistic, edgy.",
      "agro|fazenda|rural|pecuária": "AGRICULTURE: Golden fields, tractor, harvest. Green, golden, earthy.",
      "ótica|óculos|lente|optometria": "EYEWEAR: Stylish glasses, eye chart, frames. Modern, sophisticated.",
    };

    let nicheInstruction = "";
    const promptLower = prompt.toLowerCase();
    for (const [keywords, instruction] of Object.entries(nicheMap)) {
      if (keywords.split("|").some((kw) => promptLower.includes(kw))) {
        nicheInstruction = `\n🏪 NICHE VISUALS: ${instruction}\nEvery visual element MUST match this business niche.`;
        break;
      }
    }
    if (!nicheInstruction) {
      nicheInstruction = `\n🏪 AUTO-DETECT: Analyze the topic and include ONLY visual elements directly related to that specific business.`;
    }

    const referenceInstruction = referenceImage
      ? `\n📎 REFERENCE IMAGE: Analyze the uploaded reference — extract colors, style, mood, branding. Incorporate these elements into the final design naturally.`
      : "";

    const imagePrompt = `Create a PREMIUM social media ${isStory ? "STORY (VERTICAL 9:16, 1080x1920px — MUST be portrait/vertical)" : "post (SQUARE 1:1, 1080x1080px)"} for BRANDIFY (@brandifycoo), a Brazilian creative agency.

CRITICAL RULES:
1. Must look 100% HUMAN-MADE — like a real designer created it. NO AI artifacts.
2. MINIMALIST — generous negative space, clean composition, one focal point.
3. MAX 3-6 words in the headline. Short, impactful, editorial.
4. 2-3 color palette MAX. Bold but restrained.
5. Headline MUST mention websites/digital services for the niche (e.g. "Seu site que vende 24h", "Loja virtual para [nicho]"). NEVER generic phrases.

🎯 VISUAL STYLE — ${selected.id}:
${selected.desc}

ADAPT the style above to match the client's niche below. Keep the SAME composition/layout quality but replace subjects/props to fit the business.
${nicheInstruction}
${referenceInstruction}

📸 PHOTOGRAPHY: Real DSLR quality, shallow depth of field, cinematic lighting, natural textures.
✍️ TYPOGRAPHY: Bold sans-serif or elegant serif. Clean, integrated, not overwhelming (20-35% of frame max).
🏷️ Small subtle "@brandifycoo" watermark in bottom-right corner.

🚫 FORBIDDEN: AI artifacts, too much text, gray text, busy compositions, stock-photo look, Canva templates, vector art, AI watermarks.

TOPIC/HEADLINE: ${prompt}`;

    let imageUrl: string | undefined;

    const buildMessageContent = () => {
      const parts: any[] = [{ type: "text", text: imagePrompt }];
      if (referenceImage) {
        parts.push({ type: "image_url", image_url: { url: referenceImage } });
      }
      return parts;
    };

    // Primary: Lovable AI Gateway
    if (LOVABLE_API_KEY && !imageUrl) {
      const gatewayModels = ["google/gemini-3.1-flash-image-preview", "google/gemini-3-pro-image-preview"];
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
              image_config: { aspect_ratio: aspectRatio },
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

    // Fallback: Direct Gemini API
    if (GEMINI_API_KEY && !imageUrl) {
      console.log("Trying direct Gemini fallback");
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`;
        const geminiParts: any[] = [{ text: imagePrompt }];
        if (referenceImage) {
          const match = referenceImage.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) geminiParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
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
                console.log("Direct Gemini succeeded");
                break;
              }
            }
          }
        } else {
          const t = await res.text();
          console.error("Direct Gemini failed:", res.status, t.slice(0, 300));
        }
      } catch (e) {
        console.error("Direct Gemini threw:", e);
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
