import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const planPrompts: Record<string, string> = {
  essencial: `Crie um site ONE-PAGE premium com 6 seções distintas simulando páginas (Home/Hero, Sobre, Serviços, Galeria, Contato, FAQ).

ESTRUTURA OBRIGATÓRIA:
1. **HERO** — Tela cheia (100vh). Título gigante (clamp(2.5rem, 6vw, 5rem)) com a palavra principal em destaque usando a cor accent. Subtítulo elegante. Um botão CTA grande e arredondado com hover suave. Background com gradiente radial sutil.
2. **SOBRE** — Layout 2 colunas no desktop (texto + imagem placeholder). Texto curto e impactante sobre a empresa. Imagem placeholder com border-radius: 1.5rem e sombra.
3. **SERVIÇOS** — Grid 3 colunas (2 no tablet, 1 no mobile). Cada card com ícone SVG inline, título e descrição curta. Cards com background semi-transparente, border sutil e hover com elevação.
4. **GALERIA** — Grid masonry ou 3 colunas com imagens placeholder (https://placehold.co/600x400). Hover com zoom suave (transform: scale(1.05)) e overlay escuro com texto.
5. **CONTATO** — Formulário com campos estilizados (nome, email, mensagem). Inputs com fundo transparente, border-bottom e focus com cor accent. Botão de envio estilizado.
6. **FAQ** — Accordion com 5 perguntas frequentes genéricas para o segmento. Estilo clean com transição de abertura suave.

NAVEGAÇÃO: Header fixo com backdrop-filter: blur(20px), logo (iniciais ou fornecido), links de navegação com scroll suave, botão CTA no header.
FOOTER: Compacto com copyright, links de redes sociais (ícones SVG) e telefone.`,

  profissional: `Crie um site ONE-PAGE sofisticado com 10 seções distintas simulando páginas (Home/Hero, Sobre, Serviços, Portfólio, Números/Estatísticas, Depoimentos, Blog Preview, Equipe, Contato, FAQ).

ESTRUTURA OBRIGATÓRIA:
1. **HERO** — Tela cheia (100vh) com efeito de partículas CSS (dots animados via @keyframes). Título grandioso (clamp(3rem, 7vw, 6rem)) com gradiente de texto na palavra destaque. Dois botões CTA (primário preenchido + secundário outline). Badge animado "✨ Profissional" no topo.
2. **SOBRE** — Layout assimétrico. Lado esquerdo: texto com timeline vertical estilizada (3 marcos da empresa). Lado direito: imagem grande com moldura decorativa CSS.
3. **SERVIÇOS** — Grid 3 colunas com cards glassmorphism (backdrop-filter: blur(16px), background rgba branco/5%). Cada card com ícone grande em SVG, título, descrição, e um link "Saiba mais →". Hover: borda brilha na cor accent.
4. **PORTFÓLIO** — Grid 2x3 com projetos. Cada item: imagem placeholder, overlay gradient no hover com título do projeto e categoria. Filtro de categorias no topo (botões estilizados).
5. **NÚMEROS** — Seção com 4 contadores animados (ex: +150 Clientes, 98% Satisfação, 5 Anos, 24h Atendimento). Layout horizontal com divisores. Background com gradiente sutil.
6. **DEPOIMENTOS** — Carrossel CSS (overflow-x: auto, scroll-snap) com 4 depoimentos. Cada card: foto circular placeholder, nome, cargo, texto em itálico, 5 estrelas douradas. 
7. **BLOG PREVIEW** — 3 cards de artigos com imagem, data, categoria tag, título e excerpt. Hover com elevação. Link "Ver todos os artigos →".
8. **EQUIPE** — Grid 3 colunas. Cada membro: foto circular placeholder, nome, cargo. Hover: redes sociais aparecem com transição.
9. **CONTATO** — Layout 2 colunas: formulário completo (nome, email, telefone, assunto, mensagem) + informações de contato com ícones (endereço, telefone, email, horário). Mapa placeholder.
10. **FAQ** — 6 perguntas em accordion elegante com ícone de + que rotaciona para ×.

NAVEGAÇÃO: Header fixo premium com backdrop-filter: blur(24px) saturate(180%). Logo + links + botão CTA com gradiente. Menu hambúrguer estilizado no mobile com menu fullscreen.
FOOTER: Grande, 4 colunas (sobre, links, serviços, newsletter com input). Copyright bar separada.`,

  premium: `Crie um site ONE-PAGE ultra-premium e cinematográfico com 12+ seções (Home/Hero, Sobre, Serviços, Portfólio, Processo de Trabalho, Números, Depoimentos, Blog, Equipe, Pricing, Contato, FAQ) e efeitos visuais avançados.

ESTRUTURA OBRIGATÓRIA:
1. **HERO** — Tela cheia com background de gradiente animado (CSS @keyframes gradient-shift, 3 cores que se movem). Título épico (clamp(3.5rem, 8vw, 7rem)) com efeito de texto gradient animado. Subtítulo com typing animation (CSS @keyframes). Dois botões CTA com efeito de glow/pulse. Scroll indicator animado no bottom.
2. **MARQUEE** — Faixa horizontal com logos de tecnologias/parceiros em scroll infinito CSS (animation: marquee 20s linear infinite). Fundo sutil diferenciado.
3. **SOBRE** — Layout cinematográfico. Imagem grande com parallax CSS (background-attachment: fixed ou transform). Texto em overlay com reveal animation. Stats inline (fundação, projetos, clientes).
4. **SERVIÇOS** — Cards grandes em grid 2x3. Cada card: glassmorphism extremo, ícone com background gradient, título, descrição detalhada, lista de sub-itens, botão "Contratar". Hover: card inteiro se eleva com sombra dramática.
5. **PROCESSO** — Timeline horizontal no desktop, vertical no mobile. 5 etapas com ícones, títulos e descrições. Linha conectora animada com gradient. Números grandes estilizados.
6. **PORTFÓLIO** — Showcase premium com cards grandes alternando layout (imagem esquerda/direita). Cada projeto: imagem fullwidth, título, descrição, tags de tecnologia, link "Ver projeto →". Hover com overlay sofisticado.
7. **NÚMEROS** — Background escuro diferenciado. 6 contadores grandes com ícones. Layout 3x2 com animação de contagem CSS.
8. **DEPOIMENTOS** — Seção com quote grande centralizado + carrossel de 5 depoimentos menores. Foto, nome, cargo, empresa, rating com estrelas. Background com gradiente radial sutil.
9. **BLOG** — 4 artigos em grid assimétrico (1 grande + 3 menores). Tags coloridas, data, autor com avatar, título, excerpt. Hover premium com image zoom.
10. **EQUIPE** — Cards com foto grande, nome, cargo, bio curta. Hover: flip card revelando redes sociais e bio completa. Grid 4 colunas desktop.
11. **PRICING** — 3 planos em cards. Card central destacado (scale 1.05, borda accent). Cada card: nome, preço, lista de features com checks, botão CTA. Badge "Popular" no central.
12. **CONTATO** — Seção dividida. Esquerda: formulário grande com campos flutuantes (floating labels CSS). Direita: mapa estilizado placeholder + info cards empilhados (telefone, email, endereço). Background com gradiente.
13. **FAQ** — 8 perguntas em accordion premium com animações suaves. Ícone rotativo. Hover nos items.

NAVEGAÇÃO: Header ultra-premium. Logo animado. Links com underline animado (::after com scaleX transition). Mega dropdown suave no hover. Botão CTA com gradient e glow. No mobile: hambúrguer menu fullscreen com animação staggered dos links.
FOOTER: Footer monumental. Background diferenciado. 5 colunas (brand com descrição, navegação, serviços, recursos, newsletter). CTA grande "Comece seu projeto". Social links com hover colorido. Copyright bar final com links legais.

EFEITOS GLOBAIS OBRIGATÓRIOS:
- Scroll-triggered animations em TODAS as seções (Intersection Observer via CSS ou inline script simples)
- Smooth scroll com scroll-behavior: smooth
- Cursor customizado CSS (opcional mas desejável)
- Gradientes animados em backgrounds
- Glassmorphism nos cards (backdrop-filter: blur)
- Sombras dramáticas com cores (box-shadow com a cor accent em baixa opacidade)
- Micro-interações em todos os botões (scale, glow, color shift)
- Loading skeleton placeholder nos cards`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan, businessName, phone, logoUrl, colorPalette } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const planKey = (plan || "essencial").toLowerCase();
    const planPrompt = planPrompts[planKey] || planPrompts.essencial;

    // Color palette mapping
    const palettes: Record<string, { bg: string; accent: string; accentLight: string; text: string; muted: string; cardBg: string }> = {
      midnight: { bg: "#0a0a0f", accent: "#2563eb", accentLight: "#3b82f6", text: "#f8fafc", muted: "#94a3b8", cardBg: "rgba(255,255,255,0.04)" },
      ocean: { bg: "#0a1628", accent: "#0ea5e9", accentLight: "#38bdf8", text: "#f0f9ff", muted: "#7dd3fc", cardBg: "rgba(14,165,233,0.06)" },
      emerald: { bg: "#0a0f0a", accent: "#10b981", accentLight: "#34d399", text: "#f0fdf4", muted: "#6ee7b7", cardBg: "rgba(16,185,129,0.06)" },
      sunset: { bg: "#0f0a0a", accent: "#f97316", accentLight: "#fb923c", text: "#fff7ed", muted: "#fdba74", cardBg: "rgba(249,115,22,0.06)" },
      royal: { bg: "#0f0a1a", accent: "#8b5cf6", accentLight: "#a78bfa", text: "#f5f3ff", muted: "#c4b5fd", cardBg: "rgba(139,92,246,0.06)" },
      rose: { bg: "#0f0a0c", accent: "#e11d48", accentLight: "#fb7185", text: "#fff1f2", muted: "#fda4af", cardBg: "rgba(225,29,72,0.06)" },
      neutral: { bg: "#fafafa", accent: "#18181b", accentLight: "#3f3f46", text: "#18181b", muted: "#71717a", cardBg: "rgba(0,0,0,0.03)" },
    };

    const selectedPalette = palettes[colorPalette || "midnight"] || palettes.midnight;

    const systemPrompt = `Você é um desenvolvedor web senior e designer UI/UX de elite. Seu trabalho é gerar sites HTML extraordinários que parecem ter sido feitos por uma agência top do mercado.

REGRAS ABSOLUTAS:
- Retorne APENAS código HTML completo. NENHUM texto antes ou depois. NENHUM markdown. NENHUM bloco de código.
- O HTML deve ser um documento completo: <!DOCTYPE html>, <html lang="pt-BR">, <head> com meta viewport e charset, <body>.
- TODO o CSS deve ser inline dentro de uma tag <style> no <head>. NÃO use CSS externo exceto Google Fonts.
- O site deve ser 100% responsivo usando @media queries (breakpoints: 768px, 1024px, 1280px).
- Use Google Fonts via CDN: Inter (400,500,600,700) para corpo e Playfair Display (700,700italic) para títulos.
- Todas as imagens devem usar https://placehold.co com dimensões apropriadas e cores que combinem com a paleta.
- Inclua scroll-behavior: smooth no html.
- Use CSS custom properties (variáveis) para todas as cores da paleta.

PALETA DE CORES OBRIGATÓRIA:
--bg: ${selectedPalette.bg}
--accent: ${selectedPalette.accent}
--accent-light: ${selectedPalette.accentLight}
--text: ${selectedPalette.text}
--muted: ${selectedPalette.muted}
--card-bg: ${selectedPalette.cardBg}

Use estas variáveis CSS em TODO o site. O fundo principal é --bg, textos em --text, textos secundários em --muted, destaques e CTAs em --accent.

ESTILO DE DESIGN:
- Espaçamento generoso (padding: 6rem 2rem nas seções, gap: 2rem nos grids)
- Border-radius consistente (0.75rem para cards, 0.5rem para botões, 9999px para badges)
- Transições suaves em tudo (transition: all 0.3s ease)
- Sombras com cor accent (box-shadow: 0 0 40px rgba(accent, 0.15))
- Cards com borda sutil (border: 1px solid rgba(255,255,255,0.08))
- Tipografia com hierarchy clara: h1 clamp(2.5rem,5vw,4.5rem), h2 clamp(2rem,4vw,3rem), h3 1.5rem, body 1rem
- Botões com padding generoso (1rem 2.5rem), font-weight 600
- Links com underline animada via ::after pseudo-element

${logoUrl ? `LOGO: Use esta URL para o logo da empresa: ${logoUrl}. Exiba com height: 40px no header.` : 'LOGO: Crie um logo sofisticado usando as iniciais do nome da empresa. Use um <span> com background: var(--accent), color: white, width: 44px, height: 44px, border-radius: 12px, display: inline-flex, align-items: center, justify-content: center, font-weight: 700, font-size: 1.1rem. Ao lado, o nome da empresa em font-weight: 700.'}

ANIMAÇÕES CSS OBRIGATÓRIAS:
- @keyframes fadeInUp: de opacity:0 translateY(30px) para opacity:1 translateY(0)
- @keyframes fadeIn: de opacity:0 para opacity:1
- @keyframes slideInLeft/slideInRight para alternância
- Aplique animation-delay escalonado nos elementos (0.1s, 0.2s, 0.3s...)
- Use animation-fill-mode: both

ÍCONES: Use SVG inline para ícones. Crie ícones simples e elegantes com <svg> inline (viewBox="0 0 24 24", stroke="currentColor", stroke-width="2", fill="none").`;

    const userPrompt = `${planPrompt}

INFORMAÇÕES DO CLIENTE:
- Nome da empresa: ${businessName || "Minha Empresa"}
- Telefone/WhatsApp: ${phone || "(00) 00000-0000"}
- Plano: ${planKey}
- Paleta: ${colorPalette || "midnight"}

Gere o site HTML completo agora. Lembre-se: APENAS código HTML puro, nada mais.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
