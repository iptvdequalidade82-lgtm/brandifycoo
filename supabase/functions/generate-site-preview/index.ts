import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const planPrompts: Record<string, string> = {
  essencial: `Crie um site ONE-PAGE limpo e moderno com 5 seções bem espaçadas (Hero, Sobre, Serviços, Contato, FAQ).

PRINCÍPIOS DE DESIGN — Inspire-se em sites de agências digitais premium:
- MUITO espaço em branco entre seções (padding: 8rem 2rem mínimo)
- Poucos elementos por seção — cada seção tem UM propósito claro
- Tipografia grande e impactante, sem excesso de texto
- Layout limpo, respirado, sem acúmulo de informações

ESTRUTURA:
1. **HERO** — 100vh. Título enorme (clamp(3rem, 7vw, 5.5rem)) com apenas 1 linha de destaque. Subtítulo curto (máximo 15 palavras). UM único botão CTA. Fundo com gradiente radial sutil.
2. **SOBRE** — Texto breve (máximo 3 frases) + uma imagem placeholder grande. Layout simples, 2 colunas no desktop.
3. **SERVIÇOS** — Grid 3 colunas. Cards minimalistas: ícone SVG + título + 1 frase. Sem excesso de informação.
4. **CONTATO** — Formulário simples (nome, email, mensagem). Design clean com inputs underline.
5. **FAQ** — 4 perguntas no máximo. Accordion simples.

NAVEGAÇÃO: Header fixo glassmorphism, logo + 4 links + CTA. Sem excessos.
FOOTER: Mínimo — copyright + telefone + redes sociais.`,

  profissional: `Crie um site ONE-PAGE sofisticado com 7 seções espaçadas e bem organizadas (Hero, Sobre, Serviços, Portfólio, Depoimentos, Contato, FAQ).

PRINCÍPIOS DE DESIGN — Inspire-se em sites premiados de agências digitais como Brandify, Awwwards winners:
- Espaçamento GENEROSO entre seções (padding: 8rem 2rem mínimo, gap amplo)
- Cada seção respira — poucos elementos, muita presença visual
- Tipografia expressiva: títulos grandes, subtítulos discretos
- Cards com bastante padding interno, borders sutis, glassmorphism leve
- NÃO acumule muitos elementos — qualidade > quantidade

ESTRUTURA:
1. **HERO** — 100vh. Título grandioso (clamp(3rem, 8vw, 6rem)) com gradiente de texto na palavra-chave. Subtítulo curto. Dois botões (primário + outline). Badge sutil no topo.
2. **SOBRE** — Layout 2 colunas assimétrico. Texto conciso (máx 4 frases) com 3 stats inline (ex: "5+ Anos", "200 Clientes", "98% Satisfação"). Imagem com border-radius.
3. **SERVIÇOS** — Grid 3 colunas com cards glassmorphism. Cada card: ícone SVG + título + descrição curta (2 linhas máx). Hover com borda accent.
4. **PORTFÓLIO** — Grid 2x2 com projetos. Imagem + overlay no hover com título. Simples e elegante.
5. **DEPOIMENTOS** — 3 cards de depoimentos. Foto circular, nome, cargo, texto curto em itálico. Estrelas douradas.
6. **CONTATO** — Layout 2 colunas: formulário clean + informações de contato com ícones.
7. **FAQ** — 5 perguntas em accordion com transição suave.

NAVEGAÇÃO: Header fixo com backdrop-blur, logo + links com underline animado + botão CTA gradient. Menu mobile clean.
FOOTER: 3 colunas (brand, links, contato). Copyright bar separada.`,

  premium: `Crie um site ONE-PAGE cinematográfico com 9 seções (Hero, Marquee, Sobre, Serviços, Portfólio, Números, Depoimentos, Contato, FAQ) e efeitos visuais premium.

PRINCÍPIOS DE DESIGN — Sites de agência digital de alto nível, estilo Brandify/Awwwards:
- Espaçamento MUITO generoso — cada seção é quase uma página inteira
- Poucos elementos por seção, mas cada um com máxima presença visual
- Tipografia cinematográfica: títulos enormes, textos curtos e poderosos
- Efeitos CSS sofisticados mas não excessivos
- EQUILÍBRIO — cada seção deve ter no máximo 3-4 elementos principais

ESTRUTURA:
1. **HERO** — 100vh com gradiente animado (@keyframes). Título épico (clamp(3.5rem, 8vw, 7rem)) com gradient text. Subtítulo curto. Dois botões CTA com glow. Scroll indicator no bottom.
2. **MARQUEE** — Faixa de scroll infinito com nomes de parceiros/tecnologias. Estilo minimalista.
3. **SOBRE** — Texto impactante (máx 3 frases) + stats grandes inline. Uma imagem hero com parallax.
4. **SERVIÇOS** — Grid 2x3 cards glassmorphism. Ícone gradient + título + descrição curta. Hover com elevação.
5. **PORTFÓLIO** — 4 projetos em cards grandes alternando (imagem esq/dir). Título + tags. Hover sofisticado.
6. **NÚMEROS** — 4 métricas grandes com ícones. Layout horizontal. Background diferenciado.
7. **DEPOIMENTOS** — Quote grande centralizado + 3 cards menores de depoimentos. Clean e elegante.
8. **CONTATO** — Formulário premium com floating labels + info cards ao lado.
9. **FAQ** — 6 perguntas em accordion premium.

NAVEGAÇÃO: Header ultra-premium com blur, links com underline ::after, CTA com glow. Mobile: fullscreen menu staggered.
FOOTER: 4 colunas (brand, nav, serviços, contato). CTA "Comece seu projeto". Social links. Copyright bar.

EFEITOS GLOBAIS:
- Scroll animations (IntersectionObserver simples via script)
- Glassmorphism nos cards
- Gradientes animados sutis
- Hover micro-interações (scale, glow)`,
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

    const systemPrompt = `Você é um desenvolvedor web senior e designer UI/UX de elite. Seu trabalho é gerar sites HTML extraordinários que parecem ter sido feitos por uma agência top do mercado.

REGRAS ABSOLUTAS:
- Retorne APENAS código HTML completo. NENHUM texto antes ou depois. NENHUM markdown. NENHUM bloco de código.
- O HTML deve ser um documento completo: <!DOCTYPE html>, <html lang="pt-BR">, <head> com meta viewport e charset, <body>.
- TODO o CSS deve ser inline dentro de uma tag <style> no <head>. NÃO use CSS externo exceto Google Fonts.
- O site deve ser 100% responsivo usando @media queries (breakpoints: 768px, 1024px, 1280px).
- Use Google Fonts via CDN: Inter (400,500,600,700) para corpo e Playfair Display (700,700italic) para títulos.
- Inclua scroll-behavior: smooth no html.
- Use CSS custom properties (variáveis) para todas as cores da paleta.

PALETA DE CORES OBRIGATÓRIA:
--bg: ${selectedPalette.bg}
--accent: ${selectedPalette.accent}
--accent-light: ${selectedPalette.accentLight}
--accent-gradient: ${selectedPalette.accentGradient}
--text: ${selectedPalette.text}
--muted: ${selectedPalette.muted}
--card-bg: ${selectedPalette.cardBg}

Use estas variáveis CSS em TODO o site. Fundo principal: --bg, textos: --text, secundários: --muted.
Para CTAs, botões e destaques: background: var(--accent-gradient).
Para bordas e hovers: var(--accent).

ESTILO DE DESIGN:
- Espaçamento generoso (padding: 6rem 2rem nas seções, gap: 2rem nos grids)
- Border-radius consistente (0.75rem cards, 0.5rem botões, 9999px badges)
- Transições suaves (transition: all 0.3s ease)
- Sombras accent (box-shadow: 0 0 40px rgba(accent, 0.15))
- Cards com borda sutil (border: 1px solid rgba(255,255,255,0.08))
- Tipografia clara: h1 clamp(2.5rem,5vw,4.5rem), h2 clamp(2rem,4vw,3rem), h3 1.5rem, body 1rem
- Botões com padding generoso (1rem 2.5rem), font-weight 600
${imageInstructions}

BACKGROUND TEMÁTICO OBRIGATÓRIO:
- Analise o nome "${businessName}"${segment ? ` (segmento: ${segment})` : ""} e crie um background SVG inline sutil que remeta ao nicho.
- Exemplos: Barbearia → tesouras sutis; Clínica → ondas suaves; Tech → hexágonos; Restaurante → talheres abstratos; Genérico → formas geométricas.
- Opacidade entre 0.03 e 0.06, usando a cor accent. Quase imperceptível.
- Aplique como background-image via SVG data URI no body.
- Adicione gradiente radial sutil no hero.

ANIMAÇÕES CSS:
- @keyframes fadeInUp: opacity:0 translateY(30px) → opacity:1 translateY(0)
- @keyframes fadeIn: opacity:0 → opacity:1
- animation-delay escalonado (0.1s, 0.2s, 0.3s...)
- animation-fill-mode: both

ÍCONES: SVG inline (viewBox="0 0 24 24", stroke="currentColor", stroke-width="2", fill="none").`;

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
        model: "google/gemini-2.5-flash",
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
