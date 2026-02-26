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

    const isStory = type === "story" || type === "stories";
    const aspectRatio = isStory ? "9:16" : "1:1";
    const dimensions = isStory ? "1080x1920" : "1080x1080";

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
      // ALIMENTAÇÃO & BEBIDAS
      "churrascaria|churrasco|grelha|churrasqueira|açougue|carnes|picanha": `🥩 NICHE — CHURRASCARIA/BBQ: Smoking grill, charcoal flames, sizzling picanha, espeto/skewers, rustic wood boards. Fire orange, ember red, smoky atmosphere.`,
      "restaurante|comida|food|gastronomia|culinária|culinaria": `🍽️ NICHE — RESTAURANT: Beautifully plated dishes, chef hands, fresh ingredients, steam. Warm golden, rich browns.`,
      "pizza|pizzaria": `🍕 NICHE — PIZZARIA: Wood-fired oven, stretching cheese, pizza paddle, rustic table. Warm reds, golden crust tones.`,
      "hambúrguer|hamburgueria|burger|lanche|lanchonete|fast food": `🍔 NICHE — HAMBURGUERIA: Juicy stacked burger, melting cheese, crispy fries, craft beer. Dark moody, warm amber.`,
      "sushi|japonês|japones|temaki|sashimi": `🍣 NICHE — JAPANESE FOOD: Sushi platter, chopsticks, soy sauce, bamboo mat, wasabi. Black, red, minimalist zen.`,
      "padaria|confeitaria|bolo|doce|pão|panificadora": `🧁 NICHE — BAKERY: Fresh bread, pastries, flour dust, wooden shelves, cake displays. Warm cream, golden wheat tones.`,
      "café|cafeteria|coffee|cappuccino|expresso": `☕ NICHE — COFFEE SHOP: Latte art, coffee beans, espresso machine, cozy mugs. Warm browns, cream, rustic wood.`,
      "açaí|acai|sorveteria|sorvete|gelato|frozen": `🍦 NICHE — ICE CREAM/AÇAÍ: Colorful bowls, toppings, fruit, frozen treats. Vibrant purple, pink, tropical.`,
      "cervejaria|cerveja|brewery|bar|pub|boteco": `🍺 NICHE — BAR/BREWERY: Craft beer taps, amber pints, bar counter, neon signs. Amber gold, dark wood, moody lighting.`,
      "doceria|brigadeiro|chocolate|trufa": `🍫 NICHE — SWEETS: Artisan chocolates, brigadeiros, elegant packaging. Rich brown, gold accents, velvet.`,
      "food truck|trailer|comida de rua": `🚚 NICHE — FOOD TRUCK: Street food, colorful truck, outdoor scene, casual vibes. Vibrant, urban, fun.`,
      "nutrição|nutricionista|dieta|alimentação saudável|healthy": `🥗 NICHE — NUTRITION: Fresh salads, meal prep, measuring tape, healthy bowls. Fresh greens, clean whites.`,

      // BELEZA & ESTÉTICA
      "salão|salao|cabeleireiro|cabelo|beleza|beauty|hair": `💇 NICHE — BEAUTY SALON: Scissors, hair styling, mirrors, salon chairs. Rose gold, soft pink, champagne.`,
      "barbearia|barbeiro|barba|corte masculino|fade": `💈 NICHE — BARBERSHOP: Straight razor, barber chair, pomade, hot towel. Deep blacks, gold, chrome.`,
      "manicure|unhas|nail|pedicure|esmalteria": `💅 NICHE — NAIL SALON: Polished nails, nail art, UV lamp, color palette. Soft pink, nude, elegant.`,
      "estética|estetica|skincare|limpeza de pele|peeling|facial": `✨ NICHE — AESTHETICS: Facial treatment, clean skin, spa elements, serums. Soft whites, rose, clinical elegance.`,
      "maquiagem|makeup|maquiadora": `💄 NICHE — MAKEUP: Brushes, palettes, lipstick, mirror, beauty editorial. Glam, rich tones, editorial lighting.`,
      "sobrancelha|micropigmentação|design de sobrancelha": `👁️ NICHE — BROW DESIGN: Precise brow shaping, micro tools, before/after. Clean, precise, soft tones.`,
      "depilação|depilacao|laser|cera": `🌸 NICHE — HAIR REMOVAL: Clean skin, laser equipment, spa room. Soft pink, clinical white, calming.`,
      "spa|massagem|relaxamento|terapia": `🧖 NICHE — SPA: Hot stones, essential oils, bamboo, towels, candles. Earth tones, zen, tranquil.`,
      "perfumaria|perfume|fragrância|fragrancia": `🌹 NICHE — PERFUME: Elegant bottles, flowers, mist, luxury packaging. Gold, deep burgundy, sophisticated.`,

      // SAÚDE & BEM-ESTAR
      "dentista|odontologia|odontológico|clareamento|sorriso|ortodontia|implante": `🦷 NICHE — DENTAL: Bright smiles, clean clinical elements, dental tools. Whites, light blues, mint green.`,
      "médico|medico|hospital|clínica médica|clinica medica|saúde|saude": `🏥 NICHE — HEALTH/MEDICAL: Stethoscope, white coat, clean clinical elements. Whites, light blues, professional.`,
      "farmácia|farmacia|drogaria|medicamento": `💊 NICHE — PHARMACY: Medicine shelves, clean counter, health products. Green cross, white, clinical.`,
      "psicólogo|psicologo|psicologia|terapia|saúde mental": `🧠 NICHE — PSYCHOLOGY: Calm environment, cozy office, warm light, notebook. Soft lavender, warm cream, peaceful.`,
      "fisioterapia|fisioterapeuta|reabilitação|pilates|rpg": `🏃 NICHE — PHYSIOTHERAPY: Exercise equipment, stretching, rehabilitation. Blue, white, active, clinical.`,
      "fonoaudiologia|fonoaudiólogo|fono": `🗣️ NICHE — SPEECH THERAPY: Communication, voice, calm office, kid-friendly. Soft blue, warm, professional.`,
      "oftalmologista|ótica|otica|óculos|oculos|lente|optometria|visão": `👓 NICHE — OPTICIAN/EYEWEAR: Stylish glasses displays, eye chart, lens equipment, frames. Clean modern, sophisticated blacks, golds.`,
      "dermatologista|dermatologia|pele": `🧴 NICHE — DERMATOLOGY: Healthy skin close-up, skincare products, clinical. Clean whites, soft pink, medical.`,
      "ortopedia|ortopedista|coluna|joelho": `🦴 NICHE — ORTHOPEDICS: X-ray imagery, skeleton models, rehabilitation. Clinical blue, white, professional.`,
      "pediatra|pediatria|criança|infantil": `👶 NICHE — PEDIATRICS: Happy children, colorful toys, friendly doctor. Bright pastels, playful, warm.`,
      "veterinário|veterinaria|vet|animal|clínica veterinária": `🐾 NICHE — VETERINARY: Dogs/cats, stethoscope, clinic. Warm pastels, caring, professional.`,

      // FITNESS & ESPORTES
      "academia|fitness|gym|treino|musculação|crossfit|personal": `🏋️ NICHE — FITNESS/GYM: Dumbbells, barbells, weight plates, gym floor. Dark blacks, neon accents, steel grays.`,
      "yoga|meditação|meditacao|mindfulness": `🧘 NICHE — YOGA: Mat, peaceful pose, nature, sunrise. Soft earth tones, zen, minimal.`,
      "artes marciais|mma|jiu jitsu|muay thai|karate|boxe|luta": `🥊 NICHE — MARTIAL ARTS: Fight gloves, octagon, training, sweat. Dark reds, blacks, intense energy.`,
      "futebol|soccer|campo|quadra": `⚽ NICHE — SOCCER: Ball, cleats, pitch, goal net. Green, white, action shots.`,
      "corrida|running|maratona|atletismo": `🏃 NICHE — RUNNING: Track, running shoes, finish line, motion blur. Dynamic, energetic colors.`,
      "natação|natacao|piscina|swimming": `🏊 NICHE — SWIMMING: Pool lanes, goggles, splash, underwater. Deep blue, aqua, clean.`,
      "surf|praia|beach|stand up|sup": `🏄 NICHE — SURF: Waves, surfboard, beach sunset, ocean. Blue, sand, golden hour.`,
      "ciclismo|bike|bicicleta|mountain bike": `🚴 NICHE — CYCLING: Bike, trail, helmet, road. Dynamic, outdoor greens, action.`,
      "skate|skateboard": `🛹 NICHE — SKATE: Board, ramp, urban, streetwear. Grungy, bold, street culture.`,
      "dança|danca|ballet|funk|studio de dança": `💃 NICHE — DANCE: Dance studio, mirrors, movement, expression. Vibrant, expressive, dynamic.`,

      // SERVIÇOS PROFISSIONAIS
      "advocacia|advogado|jurídico|juridico|direito|lei|escritório de advocacia": `⚖️ NICHE — LAW: Gavel, law books, scales of justice. Navy blue, dark wood, gold. Elegant office.`,
      "contabilidade|contador|contábil|contabil|financeiro|fiscal": `📊 NICHE — ACCOUNTING: Calculator, spreadsheets, financial charts, documents. Navy, gray, professional.`,
      "arquitetura|arquiteto|projeto|planta|design de interiores|decoração|decoracao": `📐 NICHE — ARCHITECTURE/DESIGN: Blueprints, models, modern buildings, drafting tools. Clean whites, blacks, minimal.`,
      "engenharia|engenheiro|obra|construção|construcao|construtora|pedreiro|empreiteira": `🏗️ NICHE — CONSTRUCTION/ENGINEERING: Hard hat, crane, building site, blueprints, concrete. Safety yellow, steel gray, industrial.`,
      "eletricista|elétrica|eletrica|instalação elétrica|fiação|quadro elétrico|energia": `⚡ NICHE — ELECTRICIAN: Wiring, electrical panel, multimeter, light bulbs, cable tools, safety gloves. Electric yellow, blue sparks, industrial gray.`,
      "encanador|encanamento|hidráulica|hidraulica|cano|tubulação|vazamento|bombeiro hidráulico": `🔧 NICHE — PLUMBER: Pipes, wrench, water faucet, copper tubing, bathroom fixtures. Blue, chrome, industrial.`,
      "pintor|pintura|tinta|parede|reforma": `🎨 NICHE — PAINTER: Paint roller, color swatches, fresh painted wall, brushes. Colorful, clean, fresh.`,
      "marceneiro|marcenaria|madeira|móveis|moveis|carpintaria": `🪵 NICHE — CARPENTRY: Wood workshop, saw, custom furniture, wood grain. Warm wood tones, rustic, craftsmanship.`,
      "serralheiro|serralheria|ferro|portão|grade|solda": `🔩 NICHE — METALWORK: Welding sparks, iron gate, metal workshop. Orange sparks, dark gray, industrial.`,
      "vidraceiro|vidraçaria|vidro|espelho|box": `🪟 NICHE — GLASS: Glass panels, mirrors, clean reflections, frameless shower. Transparent, light blue, modern.`,
      "dedetização|dedetizadora|controle de pragas|pest control": `🦟 NICHE — PEST CONTROL: Spray equipment, protective gear, clean home after. Green, white, professional.`,
      "limpeza|faxina|cleaning|lavanderia|passadeira": `🧹 NICHE — CLEANING: Sparkling clean surfaces, cleaning supplies, before/after. Fresh blue, white, spotless.`,
      "jardinagem|jardineiro|paisagismo|jardim|gramado": `🌿 NICHE — LANDSCAPING: Lush garden, tools, green lawn, flower beds. Fresh greens, earth tones, natural.`,
      "mudança|frete|transporte|carreto": `🚚 NICHE — MOVING/FREIGHT: Truck, boxes, organized loading, team work. Blue, professional, reliable.`,
      "segurança|vigilância|monitoramento|câmera|alarme|portaria": `🔒 NICHE — SECURITY: Cameras, control room, security guard, alarm system. Dark blue, black, authoritative.`,
      "ar condicionado|climatização|refrigeração|hvac|split": `❄️ NICHE — AC/HVAC: AC unit, comfortable room, installation, fresh air. Cool blue, white, clean.`,
      "energia solar|painel solar|fotovoltaica|solar": `☀️ NICHE — SOLAR ENERGY: Solar panels, rooftop, sun rays, green energy. Blue, yellow, sustainable green.`,
      "desentupidora|desentupimento|esgoto": `🚿 NICHE — DRAIN CLEANING: Equipment, pipe clearing, professional service. Blue, gray, industrial.`,

      // TECNOLOGIA & DIGITAL
      "tecnologia|tech|software|app|aplicativo|startup|saas": `💻 NICHE — TECH: Laptop, code, modern workspace, digital screens. Electric blue, dark, futuristic-minimal.`,
      "celular|smartphone|loja de celular|assistência técnica|conserto de celular|iphone|samsung": `📱 NICHE — CELL PHONE SHOP: Phone displays, repair tools, accessories, screen fix. Sleek black, electric blue, modern.`,
      "informática|computador|notebook|pc|hardware": `🖥️ NICHE — COMPUTER: Hardware, components, setup, workstation. Dark, RGB accents, tech.`,
      "marketing|marketing digital|social media|agência|agencia|tráfego|trafego": `📈 NICHE — DIGITAL MARKETING: Analytics dashboard, social icons, growth charts. Modern purple, blue, dynamic.`,
      "fotografia|fotógrafo|fotografo|ensaio|foto|studio fotográfico": `📸 NICHE — PHOTOGRAPHY: Camera, lens, lighting setup, beautiful shot. Rich cinematic, dramatic light.`,
      "videografia|vídeo|video|filmagem|produtora|audiovisual": `🎬 NICHE — VIDEO: Cinema camera, clapperboard, film reel, editing suite. Cinematic dark, rich color grading.`,
      "design gráfico|designer|logo|identidade visual|branding": `🎨 NICHE — GRAPHIC DESIGN: Color palette, design tools, creative workspace. Creative, bold, modern.`,
      "desenvolvimento|programação|programacao|desenvolvedor|dev|web": `👨‍💻 NICHE — DEVELOPMENT: Code editor, terminal, modern desk setup. Dark theme, green/blue code highlights.`,
      "impressão|gráfica|grafica|banner|adesivo|comunicação visual": `🖨️ NICHE — PRINT SHOP: Large format printer, banners, business cards, vinyl. Colorful, professional, production.`,

      // EDUCAÇÃO & FORMAÇÃO
      "escola|colégio|colegio|ensino|infantil|creche": `🏫 NICHE — SCHOOL: Classroom, children, books, playground. Bright, playful, educational.`,
      "faculdade|universidade|vestibular|enem|cursinho|pré-vestibular": `🎓 NICHE — UNIVERSITY: Campus, study groups, graduation. Navy, academic, aspirational.`,
      "curso|treinamento|capacitação|workshop|mentoria|coaching": `📚 NICHE — COURSES/TRAINING: Whiteboard, presentation, group learning. Professional, inspiring.`,
      "idiomas|inglês|ingles|espanhol|francês|lingua|language": `🌍 NICHE — LANGUAGES: World flags, conversation bubbles, study materials. International, colorful, educational.`,
      "música|musica|instrumento|violão|guitarra|piano|bateria|escola de música": `🎵 NICHE — MUSIC: Instruments, sheet music, studio, performance. Rich, artistic, expressive.`,
      "auto escola|autoescola|cnh|habilitação|habilitacao|carteira de motorista": `🚗 NICHE — DRIVING SCHOOL: Car with learner sign, steering wheel, traffic signs. Blue, yellow, educational.`,

      // COMÉRCIO & VAREJO
      "loja de roupa|moda|fashion|vestuário|boutique|streetwear|tênis|sneaker": `👗 NICHE — FASHION: Clothing racks, fabric textures, styled outfits. Trendy colors, editorial.`,
      "joalheria|joia|ouro|prata|bijuteria|semi joia": `💎 NICHE — JEWELRY: Sparkling pieces, elegant display, velvet boxes. Gold, silver, luxury black.`,
      "floricultura|flores|flower|buquê|arranjo|florista": `💐 NICHE — FLORIST: Beautiful arrangements, colorful petals, elegant vases. Vibrant, romantic, natural.`,
      "supermercado|mercado|mercearia|hortifruti|atacado": `🛒 NICHE — SUPERMARKET: Fresh produce, organized aisles, shopping cart. Fresh, colorful, abundant.`,
      "papelaria|material escolar|escritório|office": `📝 NICHE — STATIONERY: Notebooks, pens, organized desk, colorful supplies. Pastel, organized, creative.`,
      "sex shop|lingerie|sensual": `🖤 NICHE — LINGERIE: Elegant fabrics, lace details, sophisticated setting. Deep red, black, sensual elegance.`,
      "cosméticos|cosmético|cosmetico|skincare|dermocosmético": `🧴 NICHE — COSMETICS: Product bottles, serums, clean aesthetic. Soft pink, white, minimal luxury.`,
      "brinquedo|toy|loja infantil|kids": `🧸 NICHE — TOY STORE: Colorful toys, playful setting, children joy. Bright, fun, energetic.`,
      "varejo|loja|comércio|comercio|promoção|liquidação": `🏪 NICHE — RETAIL: Store displays, sale tags, shopping bags. Bold red, commercial, dynamic.`,
      "móveis|moveis|colchão|colchao|decoração de interiores|home": `🛋️ NICHE — FURNITURE: Beautiful room setups, modern furniture, cozy spaces. Warm neutrals, elegant.`,
      "material de construção|ferragista|ferragem|ferramentaria": `🏗️ NICHE — HARDWARE STORE: Tools, building materials, organized shelves. Industrial orange, gray.`,

      // AUTOMOTIVO
      "oficina|mecânica|mecanica|carro|auto|funilaria": `🔧 NICHE — AUTO SHOP: Car parts, tools, lifted vehicle, engine. Metallic grays, chrome. Garage.`,
      "lavagem|lava jato|lava-jato|car wash|polimento|estética automotiva|estetica automotiva": `🚿 NICHE — CAR WASH: Shiny wet car, foam, pressure washer, gleaming finish. Blue, chrome, reflective.`,
      "pneu|borracharia|alinhamento|balanceamento": `🛞 NICHE — TIRES: Tire stack, alignment machine, workshop. Black rubber, industrial, professional.`,
      "autopeças|auto peças|peça automotiva|retífica": `⚙️ NICHE — AUTO PARTS: Engine components, organized shelves, car parts. Chrome, dark, industrial.`,
      "moto|motocicleta|oficina de motos|motociclismo": `🏍️ NICHE — MOTORCYCLE: Bike, helmet, leather, speed. Dark chrome, rebellious, powerful.`,
      "concessionária|concessionaria|revenda|seminovos|carros usados": `🚘 NICHE — CAR DEALER: Showroom, shiny cars, keys handover. Luxury, polished, professional.`,

      // IMÓVEIS & MORADIA
      "imobiliária|imobiliaria|imóvel|imovel|casa|apartamento|corretor|condomínio|condominio": `🏠 NICHE — REAL ESTATE: Luxury property, keys, modern architecture. Warm whites, golden hour.`,
      "hotel|pousada|hospedagem|resort|airbnb": `🏨 NICHE — HOTEL: Luxury room, pool, concierge, lobby. Elegant gold, warm whites, hospitality.`,
      "síndico|sindico|administradora|condomínio": `🏢 NICHE — CONDO MANAGEMENT: Building facade, common areas, organized. Professional blue, clean.`,

      // EVENTOS & ENTRETENIMENTO
      "festa|evento|buffet|decoração de festa|balão|aniversário|casamento|wedding": `🎉 NICHE — EVENTS: Balloons, decorations, tables, lighting, celebration. Festive gold, vibrant, elegant.`,
      "dj|som|iluminação|iluminacao|balada|show|banda|música ao vivo": `🎧 NICHE — DJ/ENTERTAINMENT: Turntable, stage lights, crowd, speakers. Neon, dark, energetic.`,
      "cinema|teatro|espetáculo|cultura": `🎭 NICHE — THEATER/CINEMA: Stage, curtains, spotlight, popcorn. Rich red, dramatic, artistic.`,
      "parque|diversão|recreação|playground|lazer": `🎠 NICHE — AMUSEMENT: Fun rides, colorful, family joy. Bright, playful, exciting.`,

      // PET & ANIMAIS
      "pet|pet shop|cachorro|gato|banho e tosa|ração|animal de estimação": `🐾 NICHE — PET: Cute dogs/cats, paw prints, grooming tools. Warm pastels, playful.`,
      "aquário|peixe|aquarismo": `🐠 NICHE — AQUARIUM: Colorful fish, tanks, aquatic plants. Deep blue, aquatic, serene.`,

      // RELIGIÃO & COMUNIDADE
      "igreja|pastor|culto|cristão|cristao|evangélico|evangelico|católico|catolico": `⛪ NICHE — CHURCH: Sanctuary, cross, worship, community. Warm gold, deep blue, spiritual.`,
      "ong|social|comunidade|voluntário|voluntario|caridade": `🤝 NICHE — NGO/CHARITY: Helping hands, community, hope. Warm, compassionate, human.`,

      // FINANÇAS & NEGÓCIOS
      "banco|financeira|empréstimo|emprestimo|crédito|credito|consórcio|consorcio": `🏦 NICHE — FINANCE: Money, charts, secure vault, growth graphs. Dark green, gold, trustworthy.`,
      "investimento|bolsa|trader|trading|cripto|bitcoin|ações|acoes": `📈 NICHE — INVESTMENTS: Stock charts, bull/bear, trading screens. Green/red, dark, dynamic.`,
      "seguros|seguro|seguradora|proteção": `🛡️ NICHE — INSURANCE: Shield, family, protection, safety umbrella. Blue, trustworthy, reliable.`,
      "consultoria|consultor|assessoria|gestão|gestao": `💼 NICHE — CONSULTING: Boardroom, strategy, presentation, leadership. Navy, gold, corporate.`,

      // TRANSPORTE & LOGÍSTICA
      "uber|motorista|transporte|táxi|taxi|99|corrida": `🚗 NICHE — RIDE SERVICE: Car, city streets, driver. Dark, urban, professional.`,
      "logística|logistica|entrega|delivery|motoboy|envio|courier": `📦 NICHE — LOGISTICS/DELIVERY: Packages, delivery van, organized warehouse. Blue, brown, efficient.`,

      // AGRO & NATUREZA
      "agro|agrícola|agricola|fazenda|rural|pecuária|pecuaria|soja|milho|plantação": `🌾 NICHE — AGRICULTURE: Golden fields, tractor, harvest, sunrise over crops. Green, golden, earthy.`,
      "paisagismo|piscina|piscineiro|manutenção de piscina": `🏊 NICHE — POOL: Crystal clear pool, maintenance tools, beautiful backyard. Aqua blue, clean, refreshing.`,

      // MODA & ACESSÓRIOS
      "tatuagem|tattoo|tatuador|estúdio de tatuagem": `🖋️ NICHE — TATTOO: Tattoo machine, ink, skin art, studio. Dark, artistic, edgy.`,
      "ótica|relojoaria|relógio|relogio|acessórios|acessorios": `⌚ NICHE — WATCHES/ACCESSORIES: Luxury timepieces, displays, elegant details. Gold, black, sophisticated.`,
      "costura|costureira|alfaiate|ateliê|atelie|sob medida": `🧵 NICHE — TAILOR: Sewing machine, fabric, measuring tape, needles. Classic, craftsmanship, elegant.`,
    };

    let nicheInstruction = "";
    const promptLower = prompt.toLowerCase();
    for (const [keywords, instruction] of Object.entries(nicheMap)) {
      if (keywords.split("|").some((kw) => promptLower.includes(kw))) {
        nicheInstruction = `\n\n🏪 NICHE-SPECIFIC VISUALS:\n${instruction}\nCRITICAL: Visual elements MUST match the business niche. Do NOT use random animals or unrelated objects. Every element should reinforce the niche.`;
        break;
      }
    }

    // Fallback: even if no niche keyword matched, instruct the AI to auto-detect and adapt
    if (!nicheInstruction) {
      nicheInstruction = `\n\n🏪 AUTO-DETECT NICHE:\nAnalyze the topic/headline below and automatically determine the business niche. Then include ONLY visual elements that are directly related to that specific business. For example: if the topic mentions a bakery, show bread and ovens, NOT cars or animals. Every prop, background, and visual element must reinforce the client's business sector.`;
    }

    const imagePrompt = `Create a MINIMALIST, high-end, professional social media ${type === "story" ? "story (9:16 vertical, 1080x1920px)" : "feed post (1:1 square, 1080x1080px)"} for BRANDIFY, a premium Brazilian creative agency.

The image must look 100% realistic, like a real brand campaign — NOT AI-generated.

🏆 #1 PRIORITY — FOLLOW THE VISUAL MODEL REFERENCES:
The visual model below is your PRIMARY guide. Study its EXACT layout, composition, typography placement, font style, color grading, and overall vibe. Replicate that SAME level of quality and style.
ONLY adapt the subject matter/props to match the client's business niche (described in the topic below).

⚠️ NICHE ADAPTATION:
- KEEP the same layout structure, text placement, font style, color grading from the visual model
- REPLACE subject matter, objects, scenery to match the CLIENT'S BUSINESS NICHE
- The final image should look like the same designer made it, but for a different business

🎯 VISUAL MODEL (PRIMARY REFERENCE — REPLICATE THIS STYLE): ${selectedModel}
${modelInstructions[selectedModel]}
${referenceInstruction}
${nicheInstruction}

📸 STYLE & MOOD:
- MINIMALIST and CLEAN — less is more
- Camera feel: real photography, DSLR/cinema camera, shallow depth of field
- Lighting: dramatic but simple — golden hour, moody, cinematic
- Colors: RESTRAINED palette — 2-3 colors maximum. Avoid gray text, avoid too many accent colors
- Finish: ultra-polished, editorial, premium

✍️ TYPOGRAPHY — KEEP IT SIMPLE:
- Use FEW words — short headline only (3-6 words MAX). No long phrases or paragraphs
- Bold sans-serif or elegant serif — one font style, clean
- Text should be impactful but NOT overwhelming — 20-35% of frame at most
- NO excessive text layers, NO multiple captions, NO bullet points
- WATERMARK: Small subtle "@brandifycoo" in bottom-right corner — semi-transparent
- Text must feel INTEGRATED into the composition

📐 COMPOSITION — MINIMALIST:
- GENEROUS negative space — let the image BREATHE
- One clear focal point, not cluttered
- Simple, elegant, modern — like a high-end magazine ad
- Main subject relevant to the client's business niche

🚫 ABSOLUTELY FORBIDDEN:
- AI artifacts, fake lighting, plastic skin
- TOO MUCH TEXT — if there are more than 6-8 words in the headline, it's WRONG
- Too many colors, gray colored text, overly busy compositions
- Stock-photo look, generic marketing layout, Canva templates
- Futuristic UI, cyberpunk aesthetics, flat design, vector art
- USING THE VISUAL MODEL SUBJECT LITERALLY when niche differs
- Visual elements that DON'T MATCH the business niche
- Gemini star watermark or any AI branding
- Cluttered, busy, or text-heavy designs — KEEP IT MINIMAL

🧠 QUALITY CHECK: The result must be SIMPLE, CLEAN, MINIMAL, and PREMIUM. Follow the visual model reference as closely as possible. Few words, few colors, maximum impact. If the design has too much text or feels busy → WRONG.

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
