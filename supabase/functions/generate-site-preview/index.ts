import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const planPrompts: Record<string, string> = {
  essencial: `Crie um site ONE-PAGE IMPRESSIONANTE com 5 seções. Este site precisa parecer que foi feito por uma agência que cobra R$5.000+.

HERO (100vh):
- Background: gradiente radial enorme (radial-gradient(ellipse 80% 60% at 50% 40%, rgba(accent,0.15), transparent))
- Título GIGANTE: clamp(3.5rem, 8vw, 6rem), font-weight 800, letter-spacing -0.03em
- Uma palavra do título com background: var(--accent-gradient), -webkit-background-clip: text, color: transparent
- Subtítulo em --muted, max-width 500px, font-size 1.15rem, line-height 1.7
- UM botão CTA grande: padding 1.25rem 3rem, background var(--accent-gradient), border-radius 9999px, box-shadow 0 0 30px rgba(accent,0.3), hover scale(1.05)
- Abaixo do CTA: uma fila de 3 mini-stats (ex: "100+ Clientes", "5★ Avaliação", "Desde 2020") com ícones SVG, separados por dividers verticais
- Scroll indicator animado no bottom (bouncing chevron)

SOBRE:
- Layout 2 colunas assimétrico (60/40). Coluna esquerda: título h2 com uma palavra em accent, parágrafo conciso, 3 bullet points com ícone SVG accent + texto
- Coluna direita: imagem grande com border-radius 1.5rem, box-shadow 0 25px 60px rgba(0,0,0,0.3), rotação leve (transform: rotate(2deg)), borda sutil 1px rgba(accent,0.2)

SERVIÇOS:
- Título centralizado com badge "Nossos Serviços" acima (background rgba(accent,0.1), color accent, padding 0.5rem 1.5rem, border-radius 9999px, font-size 0.85rem, font-weight 600, text-transform uppercase, letter-spacing 0.1em)
- Grid 3 colunas. Cards com: padding 2.5rem, background var(--card-bg), border 1px solid rgba(255,255,255,0.06), border-radius 1rem
- Cada card: ícone SVG 48px dentro de div com background var(--accent-gradient) opacity 0.1, border-radius 1rem, padding 1rem + título h3 bold + descrição 2 linhas em --muted
- Hover: border-color var(--accent), box-shadow 0 0 30px rgba(accent,0.1), transform translateY(-4px)

CONTATO:
- Layout 2 colunas. Esquerda: título, parágrafo, 3 itens de contato (email, telefone, localização) com ícone SVG accent
- Direita: formulário com inputs (background rgba(255,255,255,0.05), border 1px solid rgba(255,255,255,0.1), border-radius 0.75rem, padding 1rem 1.25rem, font-size 1rem). Focus: border-color var(--accent), box-shadow 0 0 0 3px rgba(accent,0.15)
- Botão submit fullwidth com gradient

FAQ:
- 4 perguntas. Cada item: border-bottom 1px solid rgba(255,255,255,0.08), padding 1.5rem 0
- Pergunta: font-weight 600, cursor pointer, display flex justify-content space-between, com ícone + SVG que rota no open
- Resposta: max-height 0 overflow hidden transition, color --muted

HEADER: position fixed, backdrop-filter blur(20px), background rgba(bg,0.8), border-bottom 1px solid rgba(255,255,255,0.06). Logo + 4 nav links (hover: color accent) + botão CTA pequeno com gradient.
FOOTER: background rgba(255,255,255,0.02), border-top 1px solid rgba(255,255,255,0.06). Logo + links + redes sociais (ícones SVG em circles hover accent). Copyright com CNPJ se fornecido.`,

  profissional: `Crie um site ONE-PAGE de ALTÍSSIMO NÍVEL com 7 seções. O objetivo é que o cliente veja e QUEIRA IMEDIATAMENTE contratar. Padrão Awwwards / Dribbble / sites de agências de R$15.000+.

HERO (100vh):
- Background multi-camada: gradiente radial grande + padrão SVG sutil do nicho (opacity 0.03) + orb flutuante decorativo (div com blur enorme, position absolute, background accent, opacity 0.08, border-radius 50%, width 400px, height 400px, top -100px, right -100px, animation float 8s ease-in-out infinite)
- Badge no topo: "🚀 Presença Digital Premium" — background rgba(accent,0.1), padding 0.6rem 1.5rem, border-radius 9999px, border 1px solid rgba(accent,0.2), font-size 0.85rem
- Título MONUMENTAL: clamp(3.5rem, 9vw, 7rem), font-weight 800, letter-spacing -0.04em, line-height 1.05. DUAS palavras-chave com gradient text (background: var(--accent-gradient), -webkit-background-clip: text, color: transparent)
- Subtítulo: max-width 550px, font-size 1.2rem, line-height 1.8, color --muted
- 2 botões: Primário (gradient, glow shadow, hover scale) + Secundário (border 1px solid rgba(accent,0.3), background transparent, hover background rgba(accent,0.1))
- Stats bar abaixo dos botões: 4 stats em row com dividers (números grandes font-size 1.5rem bold accent, labels pequenos muted)
- Scroll indicator com animação bounce

MARQUEE (opcional se couber):
- Faixa com scroll infinito CSS (@keyframes scroll: translateX(0) → translateX(-50%))
- Logos de tecnologias ou parceiros em grayscale, opacity 0.4, gap 4rem
- Divisores top/bottom com border 1px solid rgba(255,255,255,0.05)

SOBRE:
- Grid 2 colunas assimétrico. Esquerda: badge "Sobre Nós", título h2 impactante com palavra accent, 2 parágrafos curtos, 4 features em grid 2x2 (ícone accent + texto curto)
- Direita: imagem com moldura complexa (border-radius 1.5rem, sombra dramática, borda accent sutil, e um elemento decorativo floating atrás — div com gradient, blur, position absolute, z-index -1)

SERVIÇOS:
- Badge centralizado + título + subtítulo muted
- Grid 3 colunas. Cards PREMIUM: padding 3rem, background var(--card-bg), border 1px solid rgba(255,255,255,0.06), border-radius 1.25rem
- Ícone dentro de circle gradient (width 64px, height 64px, border-radius 1rem, background var(--accent-gradient), display flex align-items center justify-content center)
- Ícone SVG em branco (stroke: white)
- Título h3 + descrição + link "Saiba mais →" em accent
- Hover: translateY(-8px), border-color accent, box-shadow 0 20px 60px rgba(accent,0.15)

PORTFÓLIO:
- Badge + título
- Grid 2x2 com aspect-ratio 16/10. Imagens com object-fit cover + overlay gradient (transparent → rgba(0,0,0,0.8) bottom)
- Sobre o overlay: título do projeto + 2-3 tags (background rgba(accent,0.2), color accent-light, padding 0.3rem 0.8rem, border-radius 9999px, font-size 0.75rem)
- Hover: overlay sobe, scale(1.05) na imagem, aparece botão "Ver Projeto"

DEPOIMENTOS:
- Background section diferenciado (rgba(accent,0.03))
- 1 depoimento DESTAQUE grande centralizado: citação com aspas decorativas SVG (font-size 4rem, accent, opacity 0.3), texto em itálico font-size 1.25rem, foto circular + nome + cargo abaixo
- 3 cards menores abaixo em grid: foto circular 48px + estrelas douradas (#FFD700) + texto + nome/cargo

CONTATO:
- Grid 2 colunas. Esquerda: título, subtítulo, 4 itens info (ícone accent em circle rgba(accent,0.1) + label + valor). Abaixo: mapa embed ou box decorativo
- Direita: form com floating labels (label position absolute, top 1rem, transition, input:focus label top -0.5rem font-size 0.8rem color accent). Inputs estilizados premium. Botão gradient fullwidth com ícone →

FAQ:
- 5 perguntas accordion. Design premium: cards separados com background card-bg, border-radius 1rem, margin-bottom 0.75rem
- Toggle com ícone + rotação. Resposta com padding, color muted

HEADER: fixed, height 70px, backdrop-filter blur(25px), background rgba(bg,0.85), border-bottom 1px solid rgba(255,255,255,0.06). Logo + nav links com underline accent (::after width 0 → 100% no hover, height 2px, background accent-gradient) + CTA button gradient
FOOTER: 4 colunas (brand+desc, links, serviços, contato). Newsletter input. Social icons em circles. Copyright bar separada. Se CNPJ fornecido, exibir.

EFEITOS CSS OBRIGATÓRIOS:
- @keyframes fadeInUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
- @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-20px) } }
- .animate-in: animation fadeInUp 0.8s ease both
- JavaScript: IntersectionObserver que adiciona class 'animate-in' quando seção entra na viewport (threshold 0.1)
- Smooth scroll nos links de navegação
- Hover transitions em TODOS os elementos interativos (0.3s ease)`,

  premium: `Crie um site ONE-PAGE CINEMATOGRÁFICO e ESPETACULAR com 9+ seções. Este é o nível mais alto — deve parecer um site de R$30.000+ feito por agência internacional. O cliente precisa ficar DE QUEIXO CAÍDO.

HERO (100vh):
- Background ÉPICO multi-camada:
  1. Gradiente base (radial-gradient(ellipse 90% 70% at 50% 30%, rgba(accent,0.2), transparent 70%))
  2. Segundo orb decorativo (position absolute, width 500px, height 500px, background var(--accent-gradient), filter blur(120px), opacity 0.12, top -150px, right -100px, animation float 10s ease-in-out infinite)
  3. Terceiro orb menor (left side, accent-light color, animation com delay)
  4. Grid pattern sutil (background-image radial-gradient(rgba(accent,0.1) 1px, transparent 1px), background-size 30px 30px, opacity 0.3)
- Badge animado: ícone ✨ + "Site Premium" — border accent, background rgba(accent,0.08), animação pulse sutil
- Título ÉPICO: clamp(4rem, 10vw, 8rem), font-weight 900, letter-spacing -0.05em, line-height 1.0. MÚLTIPLAS palavras com gradient text. Pode ter <br> para quebra dramática
- Subtítulo sofisticado: font-size 1.3rem, line-height 1.8, max-width 600px, font-weight 300
- 2 botões PREMIUM: Primário (gradient, padding 1.5rem 3.5rem, border-radius 9999px, box-shadow 0 0 40px rgba(accent,0.4), hover glow intensifica + scale(1.05)) + Ghost (border accent, backdrop-filter blur)
- Stats impressionantes: 4 stats grandes em row (números clamp(2rem,4vw,3rem), accent color, labels muted, dividers estilizados)
- Mouse scroll indicator com animation bounce + pulse

MARQUEE DE PARCEIROS/TECH:
- Faixa fullwidth com @keyframes marquee (translateX(0) → translateX(-50%)), 20s linear infinite
- Ícones/logos em grayscale filter, opacity 0.4, hover: grayscale(0) opacity(1)
- Border top/bottom rgba(255,255,255,0.05)
- Duplicar conteúdo para loop seamless

SOBRE (com WOW factor):
- Badge + título épico com accent word
- Layout offset: texto esquerda (55%), imagem direita com composição complexa:
  - Imagem principal com border-radius 2rem, box-shadow dramática (0 30px 80px rgba(0,0,0,0.4))
  - Floating badge SOBRE a imagem (position absolute, bottom -20px, left -20px, background var(--bg), padding 1.5rem 2rem, border-radius 1rem, border 1px accent, shadow): número destaque + label (ex: "8+ Anos de Experiência")
  - Elemento decorativo pontilhado atrás (border 2px dashed rgba(accent,0.2), border-radius 2rem, position absolute, inset -15px, z-index -1)
- 4 features em lista com ícones accent checks

SERVIÇOS (grid impactante):
- Badge + título + subtítulo
- Grid 2x3 cards com hover PREMIUM:
  - Normal: padding 3rem, background card-bg, border rgba(255,255,255,0.06), border-radius 1.5rem
  - Ícone: 64px circle com gradient background, ícone SVG white dentro
  - Número do serviço: "01", "02"... em accent, font-size 3rem, opacity 0.1, position absolute top-right
  - Título + descrição + "Saiba mais →" link
  - HOVER: translateY(-10px), background gradient sutil, border-color accent, shadow dramática (0 25px 80px rgba(accent,0.2)), o ícone circle scale(1.1)

PORTFÓLIO (showcase premium):
- Badge + título
- Layout alternado: projetos pares (imagem esquerda, texto direita) e ímpares (inverso)
- Cada projeto: imagem com border-radius 1.5rem + aspect-ratio 16/10, ao lado: tag de categoria (accent pill), título h3, descrição curta, lista de tecnologias em tags, botão "Ver Projeto"
- Imagem hover: scale(1.03), shadow aumenta

NÚMEROS/RESULTADOS:
- Background diferenciado: gradiente de accent super sutil + border top/bottom
- Grid 4 colunas com números IMPACTANTES
- Cada: número grande (font-size clamp(2.5rem,5vw,4rem), font-weight 900, accent gradient text) + label muted + ícone SVG pequeno
- Dividers verticais estilizados entre items

DEPOIMENTOS (social proof premium):
- Quote destaque GRANDE: aspas decorativas SVG gigantes (accent, opacity 0.15), texto citação em Playfair Display italic font-size 1.5rem, line-height 1.8
- Abaixo: foto circular 64px com border accent + nome bold + cargo muted + estrelas ★★★★★ (#FFD700)
- Slider dots abaixo (3 dots, active = accent, others = muted opacity 0.3)
- 3 cards secundários em row abaixo

CTA SECTION (antes do contato):
- Background: gradiente accent intenso ou imagem com overlay
- Título grande branco, subtítulo, botão CTA ENORME branco com texto escuro
- Simples e impactante. Gera urgência.

CONTATO (premium):
- Grid 2 colunas. Esquerda: título épico, subtítulo, 4 info cards (ícone em circle accent bg + label + valor, cada um com border-radius, padding, background card-bg)
- Direita: form PREMIUM com floating labels, inputs com focus ring accent, textarea, checkbox terms, botão gradient com ícone e hover glow

FAQ:
- 6 perguntas em cards individuais (background card-bg, border-radius 1.25rem, margin-bottom 1rem)
- Click toggle: ícone rota, resposta expande com max-height transition
- JavaScript para toggle

HEADER: fixed, height 72px, backdrop-filter blur(30px) saturate(1.5), background rgba(bg,0.8), border-bottom rgba(255,255,255,0.05). Logo + nav links com ::after underline animation + CTA gradient pill. Scroll: background more opaque.
FOOTER ÉPICO: background linear-gradient(to bottom, var(--bg), darken). 4 colunas. Newsletter com input+button inline. Social icons. Awards/badges. Copyright bar com CNPJ.

EFEITOS OBRIGATÓRIOS:
- @keyframes fadeInUp, fadeIn, float, pulse, marquee
- IntersectionObserver em todas as seções (class .animate-in com stagger delays: children nth-child(1) delay 0s, nth-child(2) 0.1s, etc.)
- Smooth scroll
- Parallax sutil no hero (transform translateY com scroll listener leve)
- Cursor glow sutil (div 200px blur seguindo o mouse, accent color, opacity 0.05) — via JS mousemove
- Hover effects em TODOS os elementos interativos
- Prefers-reduced-motion: desabilitar animações`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan, businessName, phone, slogan, cnpj, segment, description, logoUrl, bannerUrl, galleryUrls, colorPalette } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const planKey = (plan || "essencial").toLowerCase();
    const planPrompt = planPrompts[planKey] || planPrompts.essencial;

    // Color palette mapping
    const palettes: Record<string, { bg: string; accent: string; accentLight: string; accentGradient: string; text: string; muted: string; cardBg: string }> = {
      midnight: { bg: "#0a0a1a", accent: "#2563eb", accentLight: "#3b82f6", accentGradient: "linear-gradient(135deg, #1e3a8a, #2563eb)", text: "#f8fafc", muted: "#94a3b8", cardBg: "rgba(255,255,255,0.04)" },
      aurora: { bg: "#0f0720", accent: "#6366f1", accentLight: "#a78bfa", accentGradient: "linear-gradient(135deg, #6366f1, #06b6d4, #a78bfa)", text: "#f0f0ff", muted: "#a5b4fc", cardBg: "rgba(99,102,241,0.06)" },
      neon: { bg: "#030712", accent: "#f43f5e", accentLight: "#ec4899", accentGradient: "linear-gradient(135deg, #f43f5e, #ec4899, #a855f7)", text: "#fdf2f8", muted: "#f9a8d4", cardBg: "rgba(244,63,94,0.06)" },
      cyber: { bg: "#0a0a0f", accent: "#00ff88", accentLight: "#22d3ee", accentGradient: "linear-gradient(135deg, #00ff88, #0ea5e9)", text: "#ecfdf5", muted: "#6ee7b7", cardBg: "rgba(0,255,136,0.05)" },
      sunset: { bg: "#0f0a0a", accent: "#f97316", accentLight: "#eab308", accentGradient: "linear-gradient(135deg, #ef4444, #f97316, #eab308)", text: "#fff7ed", muted: "#fdba74", cardBg: "rgba(249,115,22,0.06)" },
      royal: { bg: "#0f0a1a", accent: "#8b5cf6", accentLight: "#d946ef", accentGradient: "linear-gradient(135deg, #7c3aed, #d946ef)", text: "#f5f3ff", muted: "#c4b5fd", cardBg: "rgba(139,92,246,0.06)" },
      ocean: { bg: "#0a1628", accent: "#0ea5e9", accentLight: "#2dd4bf", accentGradient: "linear-gradient(135deg, #0369a1, #0ea5e9, #2dd4bf)", text: "#f0f9ff", muted: "#7dd3fc", cardBg: "rgba(14,165,233,0.06)" },
      emerald: { bg: "#0a0f0a", accent: "#10b981", accentLight: "#a3e635", accentGradient: "linear-gradient(135deg, #059669, #10b981, #a3e635)", text: "#f0fdf4", muted: "#6ee7b7", cardBg: "rgba(16,185,129,0.06)" },
      neutral: { bg: "#fafafa", accent: "#18181b", accentLight: "#6b7280", accentGradient: "linear-gradient(135deg, #18181b, #4b5563)", text: "#18181b", muted: "#71717a", cardBg: "rgba(0,0,0,0.03)" },
      rose: { bg: "#0f0a0c", accent: "#e11d48", accentLight: "#fb7185", accentGradient: "linear-gradient(135deg, #9f1239, #e11d48, #fb7185)", text: "#fff1f2", muted: "#fda4af", cardBg: "rgba(225,29,72,0.06)" },
      gold: { bg: "#0f0c05", accent: "#d97706", accentLight: "#fbbf24", accentGradient: "linear-gradient(135deg, #78350f, #d97706, #fbbf24)", text: "#fffbeb", muted: "#fcd34d", cardBg: "rgba(217,119,6,0.06)" },
      slate: { bg: "#0f172a", accent: "#475569", accentLight: "#94a3b8", accentGradient: "linear-gradient(135deg, #1e293b, #475569, #64748b)", text: "#f1f5f9", muted: "#94a3b8", cardBg: "rgba(71,85,105,0.06)" },
      lavender: { bg: "#0f0820", accent: "#7c3aed", accentLight: "#c4b5fd", accentGradient: "linear-gradient(135deg, #4c1d95, #7c3aed, #c4b5fd)", text: "#f5f3ff", muted: "#a78bfa", cardBg: "rgba(124,58,237,0.06)" },
      mint: { bg: "#0a0f0d", accent: "#059669", accentLight: "#6ee7b7", accentGradient: "linear-gradient(135deg, #064e3b, #059669, #6ee7b7)", text: "#ecfdf5", muted: "#6ee7b7", cardBg: "rgba(5,150,105,0.06)" },
      coral: { bg: "#0f0a08", accent: "#f97316", accentLight: "#fdba74", accentGradient: "linear-gradient(135deg, #c2410c, #f97316, #fdba74)", text: "#fff7ed", muted: "#fdba74", cardBg: "rgba(249,115,22,0.06)" },
    };

    const selectedPalette = palettes[colorPalette || "midnight"] || palettes.midnight;

    // Build image instructions
    let imageInstructions = "";

    if (logoUrl) {
      imageInstructions += `\nLOGO: Use esta URL para o logo da empresa: ${logoUrl}. Exiba no header com height: 40px e no footer.`;
    } else {
      imageInstructions += `\nLOGO: Crie um logo usando as iniciais do nome da empresa. Use um <span> com background: var(--accent-gradient), color: white, width: 44px, height: 44px, border-radius: 12px, display: inline-flex, align-items: center, justify-content: center, font-weight: 700. Ao lado, o nome da empresa.`;
    }

    if (bannerUrl) {
      imageInstructions += `\nBANNER HERO: Use esta imagem real como background do hero: ${bannerUrl}. Aplique um overlay escuro semi-transparente (background: linear-gradient(to bottom, rgba(0,0,0,0.6), var(--bg))) para manter legibilidade do texto. A imagem deve cobrir todo o hero com object-fit: cover.`;
    }

    if (galleryUrls && galleryUrls.length > 0) {
      imageInstructions += `\nFOTOS REAIS DO CLIENTE — Use estas URLs no lugar de placeholders:`;
      galleryUrls.forEach((url: string, i: number) => {
        imageInstructions += `\n  - Foto ${i + 1}: ${url}`;
      });
      imageInstructions += `\nDistribua estas fotos nas seções mais visuais (portfólio, sobre, galeria, depoimentos). Use object-fit: cover e border-radius.`;
      imageInstructions += `\nIMPORTANTE: Priorize SEMPRE as fotos reais do cliente. Só use https://placehold.co para imagens que faltarem.`;
    }

    // Build business info
    const businessInfo = [];
    if (slogan) businessInfo.push(`Slogan: "${slogan}" — use como subtítulo no hero ou tagline no header`);
    if (segment) businessInfo.push(`Segmento: ${segment} — adapte ícones, serviços e linguagem ao segmento`);
    if (description) businessInfo.push(`Sobre: ${description} — use na seção "Sobre" em vez de texto genérico`);
    if (cnpj) businessInfo.push(`CNPJ: ${cnpj} — exiba no footer junto ao copyright`);

    const systemPrompt = `Você é um MESTRE em web design e desenvolvimento front-end. Seus sites ganham prêmios no Awwwards e CSS Design Awards. Cada pixel importa. Cada detalhe é intencional.

MENTALIDADE: Você está criando uma PRÉVIA que vai fazer o cliente querer IMEDIATAMENTE contratar a agência. O site precisa ser tão bonito que o cliente pense "Eu PRECISO disso". Não economize em detalhes visuais.

REGRAS ABSOLUTAS:
- Retorne APENAS código HTML completo. NENHUM texto antes ou depois. NENHUM markdown. NENHUM \`\`\`.
- O HTML deve ser documento completo: <!DOCTYPE html>, <html lang="pt-BR">, <head> com meta viewport e charset, <body>.
- TODO o CSS inline dentro de <style> no <head>. NÃO use CSS externo exceto Google Fonts.
- 100% responsivo com @media queries (640px, 768px, 1024px, 1280px).
- Google Fonts CDN: Inter (300,400,500,600,700,800) corpo + Playfair Display (600,700,800,700italic) títulos.
- scroll-behavior: smooth no html.
- CSS custom properties para TODAS as cores.
- O HTML DEVE ser extenso e completo — CADA seção descrita deve existir. NÃO simplifique, NÃO corte.

PALETA DE CORES (:root CSS variables):
--bg: ${selectedPalette.bg};
--accent: ${selectedPalette.accent};
--accent-light: ${selectedPalette.accentLight};
--accent-gradient: ${selectedPalette.accentGradient};
--text: ${selectedPalette.text};
--muted: ${selectedPalette.muted};
--card-bg: ${selectedPalette.cardBg};

QUALIDADE VISUAL MANDATÓRIA:
- Espaçamento GENEROSO: seções padding clamp(4rem,8vw,8rem) 2rem. Gap 2rem+ nos grids.
- Tipografia expressiva: h1 clamp(3rem,7vw,6rem) weight 800 letter-spacing -0.03em, h2 clamp(2rem,5vw,3.5rem) weight 700, body 1rem/1.7
- Cards: padding 2.5rem+, border-radius 1.25rem, border 1px solid rgba(255,255,255,0.06), background var(--card-bg)
- Botões: padding 1rem 2.5rem+, border-radius 9999px, font-weight 600, transition 0.3s
- Sombras: 0 20px 60px rgba(0,0,0,0.2) cards, 0 0 40px rgba(accent,0.2) botões
- Hover em TUDO: translateY(-4px a -10px), border-color accent, shadow intensifica
- Gradient text: background var(--accent-gradient), -webkit-background-clip: text, -webkit-text-fill-color: transparent
- Badges: background rgba(accent,0.1), color accent, padding 0.5rem 1.5rem, border-radius 9999px, font-size 0.8rem, font-weight 600, letter-spacing 0.05em, text-transform uppercase
${imageInstructions}

BACKGROUND TEMÁTICO:
- Analise "${businessName}"${segment ? ` (segmento: ${segment})` : ""} e crie background SVG inline SUTIL do nicho (opacity 0.02-0.05).
- Orbs decorativos no hero (divs blur 100px+, accent gradient, opacity 0.05-0.1, position absolute).

ANIMAÇÕES CSS:
@keyframes fadeInUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-20px) } }

JavaScript obrigatório no final do body:
- IntersectionObserver: observa sections, adiciona class 'visible' com stagger
- Smooth scroll nos links âncora
- FAQ accordion toggle

PROIBIDO:
- Não use Lorem Ipsum. Crie textos realistas para o nicho "${segment || 'negócio'}".
- Não use placeholder genérico se o cliente enviou fotos reais.
- Não simplifique seções.

ÍCONES: SVG inline (viewBox="0 0 24 24", stroke="currentColor", stroke-width="1.5", fill="none").`;

    const userPrompt = `${planPrompt}

INFORMAÇÕES DO CLIENTE:
- Nome da empresa: ${businessName || "Minha Empresa"}
- Telefone/WhatsApp: ${phone || "(00) 00000-0000"}
${businessInfo.length ? businessInfo.map(i => `- ${i}`).join("\n") : ""}
- Plano: ${planKey}
- Paleta: ${colorPalette || "midnight"}

Gere o site HTML completo agora. APENAS código HTML puro, nada mais.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar prévia." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-site-preview error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
