import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const palettes: Record<string, { bg: string; accent: string; accentLight: string; accentGradient: string; text: string; muted: string; cardBg: string }> = {
  midnight: { bg: "#0a0a1a", accent: "#1e3a8a", accentLight: "#2563eb", accentGradient: "linear-gradient(135deg, #1e3a8a, #2563eb)", text: "#f8fafc", muted: "#94a3b8", cardBg: "rgba(30,58,138,0.08)" },
  aurora: { bg: "#0f0720", accent: "#6366f1", accentLight: "#a78bfa", accentGradient: "linear-gradient(135deg, #6366f1, #06b6d4, #a78bfa)", text: "#f0f0ff", muted: "#a5b4fc", cardBg: "rgba(99,102,241,0.06)" },
  neon: { bg: "#030712", accent: "#f43f5e", accentLight: "#a855f7", accentGradient: "linear-gradient(135deg, #f43f5e, #ec4899, #a855f7)", text: "#fdf2f8", muted: "#f9a8d4", cardBg: "rgba(244,63,94,0.06)" },
  cyber: { bg: "#0a0a0f", accent: "#00ff88", accentLight: "#22d3ee", accentGradient: "linear-gradient(135deg, #00ff88, #0ea5e9, #22d3ee)", text: "#ecfdf5", muted: "#6ee7b7", cardBg: "rgba(0,255,136,0.05)" },
  sunset: { bg: "#0f0a0a", accent: "#ef4444", accentLight: "#eab308", accentGradient: "linear-gradient(135deg, #ef4444, #f97316, #eab308)", text: "#fff7ed", muted: "#fdba74", cardBg: "rgba(249,115,22,0.06)" },
  royal: { bg: "#0f0a1a", accent: "#7c3aed", accentLight: "#f0abfc", accentGradient: "linear-gradient(135deg, #7c3aed, #d946ef, #f0abfc)", text: "#f5f3ff", muted: "#c4b5fd", cardBg: "rgba(139,92,246,0.06)" },
  ocean: { bg: "#0a1628", accent: "#0369a1", accentLight: "#2dd4bf", accentGradient: "linear-gradient(135deg, #0369a1, #0ea5e9, #2dd4bf)", text: "#f0f9ff", muted: "#7dd3fc", cardBg: "rgba(14,165,233,0.06)" },
  emerald: { bg: "#0a0f0a", accent: "#059669", accentLight: "#a3e635", accentGradient: "linear-gradient(135deg, #059669, #10b981, #a3e635)", text: "#f0fdf4", muted: "#6ee7b7", cardBg: "rgba(16,185,129,0.06)" },
  neutral: { bg: "#fafafa", accent: "#18181b", accentLight: "#6b7280", accentGradient: "linear-gradient(135deg, #18181b, #4b5563, #6b7280)", text: "#18181b", muted: "#71717a", cardBg: "rgba(0,0,0,0.03)" },
  rose: { bg: "#0f0a0c", accent: "#9f1239", accentLight: "#fb7185", accentGradient: "linear-gradient(135deg, #9f1239, #e11d48, #fb7185)", text: "#fff1f2", muted: "#fda4af", cardBg: "rgba(225,29,72,0.06)" },
  gold: { bg: "#0f0c05", accent: "#78350f", accentLight: "#fbbf24", accentGradient: "linear-gradient(135deg, #78350f, #d97706, #fbbf24)", text: "#fffbeb", muted: "#fcd34d", cardBg: "rgba(217,119,6,0.06)" },
  slate: { bg: "#0f172a", accent: "#1e293b", accentLight: "#64748b", accentGradient: "linear-gradient(135deg, #1e293b, #475569, #64748b)", text: "#f1f5f9", muted: "#94a3b8", cardBg: "rgba(71,85,105,0.06)" },
  lavender: { bg: "#0f0820", accent: "#4c1d95", accentLight: "#c4b5fd", accentGradient: "linear-gradient(135deg, #4c1d95, #7c3aed, #c4b5fd)", text: "#f5f3ff", muted: "#a78bfa", cardBg: "rgba(124,58,237,0.06)" },
  mint: { bg: "#0a0f0d", accent: "#064e3b", accentLight: "#6ee7b7", accentGradient: "linear-gradient(135deg, #064e3b, #059669, #6ee7b7)", text: "#ecfdf5", muted: "#6ee7b7", cardBg: "rgba(5,150,105,0.06)" },
  coral: { bg: "#0f0a08", accent: "#c2410c", accentLight: "#fdba74", accentGradient: "linear-gradient(135deg, #c2410c, #f97316, #fdba74)", text: "#fff7ed", muted: "#fdba74", cardBg: "rgba(249,115,22,0.06)" },
  arctic: { bg: "#0c1929", accent: "#0c4a6e", accentLight: "#e0f2fe", accentGradient: "linear-gradient(135deg, #0c4a6e, #38bdf8, #e0f2fe)", text: "#f0f9ff", muted: "#7dd3fc", cardBg: "rgba(56,189,248,0.06)" },
  cherry: { bg: "#0f0508", accent: "#881337", accentLight: "#fda4af", accentGradient: "linear-gradient(135deg, #881337, #e11d48, #fda4af)", text: "#fff1f2", muted: "#fb7185", cardBg: "rgba(225,29,72,0.06)" },
  bronze: { bg: "#0f0a03", accent: "#451a03", accentLight: "#fcd34d", accentGradient: "linear-gradient(135deg, #451a03, #b45309, #fcd34d)", text: "#fffbeb", muted: "#f59e0b", cardBg: "rgba(180,83,9,0.06)" },
  forest: { bg: "#0a0f0a", accent: "#14532d", accentLight: "#bbf7d0", accentGradient: "linear-gradient(135deg, #14532d, #16a34a, #bbf7d0)", text: "#f0fdf4", muted: "#4ade80", cardBg: "rgba(22,163,74,0.06)" },
  electric: { bg: "#0a0a1f", accent: "#1e1b4b", accentLight: "#c7d2fe", accentGradient: "linear-gradient(135deg, #1e1b4b, #4f46e5, #c7d2fe)", text: "#eef2ff", muted: "#818cf8", cardBg: "rgba(79,70,229,0.06)" },
  magma: { bg: "#0f0805", accent: "#7c2d12", accentLight: "#fde68a", accentGradient: "linear-gradient(135deg, #7c2d12, #ea580c, #fde68a)", text: "#fff7ed", muted: "#fb923c", cardBg: "rgba(234,88,12,0.06)" },
  grape: { bg: "#0a0520", accent: "#3b0764", accentLight: "#e9d5ff", accentGradient: "linear-gradient(135deg, #3b0764, #9333ea, #e9d5ff)", text: "#faf5ff", muted: "#c084fc", cardBg: "rgba(147,51,234,0.06)" },
  steel: { bg: "#0f0e0d", accent: "#1c1917", accentLight: "#d6d3d1", accentGradient: "linear-gradient(135deg, #1c1917, #57534e, #d6d3d1)", text: "#fafaf9", muted: "#a8a29e", cardBg: "rgba(87,83,78,0.06)" },
  tropical: { bg: "#0a0f0e", accent: "#134e4a", accentLight: "#fde047", accentGradient: "linear-gradient(135deg, #134e4a, #14b8a6, #fde047)", text: "#f0fdfa", muted: "#5eead4", cardBg: "rgba(20,184,166,0.06)" },
  blush: { bg: "#0f0510", accent: "#831843", accentLight: "#fce7f3", accentGradient: "linear-gradient(135deg, #831843, #ec4899, #fce7f3)", text: "#fdf2f8", muted: "#f472b6", cardBg: "rgba(236,72,153,0.06)" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storeName, phone, slogan, cnpj, segment, logoUrl, bannerUrl, products, colorPalette, shipping } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const selectedPalette = palettes[colorPalette || "midnight"] || palettes.midnight;

    // Build products list for prompt
    const productsList = (products || []).map((p: any, i: number) => {
      let desc = `Produto ${i + 1}: "${p.name}" — R$ ${p.price}`;
      if (p.category) desc += ` — Categoria: ${p.category}`;
      if (p.imageUrl) desc += ` — Imagem: ${p.imageUrl}`;
      else desc += ` — Sem imagem (use placeholder temático do segmento via https://placehold.co/400x400/1a1a2e/ffffff?text=${encodeURIComponent(p.name)})`;
      return desc;
    }).join("\n");

    // Build shipping info
    let shippingInfo = "";
    if (shipping) {
      shippingInfo = `\nFRETE SIMULADO:
- CEP base: ${shipping.cep || "86000-000"}
- Valor fixo: R$ ${shipping.value || "15,90"}
- Frete grátis acima de: R$ ${shipping.freeAbove || "199,90"}
Implemente um campo de CEP no carrinho que, ao digitar qualquer CEP, mostra o valor do frete configurado. Se o subtotal for >= ao valor de frete grátis, mostre "FRETE GRÁTIS" em verde.`;
    } else {
      shippingInfo = `\nFRETE: Adicione um campo de CEP no carrinho com frete fixo simulado de R$ 15,90 e frete grátis acima de R$ 199,90.`;
    }

    let imageInstructions = "";
    if (logoUrl) {
      imageInstructions += `\nLOGO: Use esta URL: ${logoUrl}. height: 40px no header e footer.`;
    } else {
      imageInstructions += `\nLOGO: Crie com iniciais do nome em <span> com background: var(--accent-gradient), color: white, width: 44px, height: 44px, border-radius: 12px.`;
    }
    if (bannerUrl) {
      imageInstructions += `\nBANNER: Use ${bannerUrl} como hero com overlay escuro.`;
    }

    const systemPrompt = `Você é um MESTRE em desenvolvimento de lojas virtuais e e-commerce. Você cria lojas que parecem profissionais, com funcionalidade de carrinho, produtos e frete — tudo em HTML/CSS/JS puro.

REGRAS ABSOLUTAS:
- Retorne APENAS código HTML completo. NENHUM texto antes ou depois. NENHUM markdown. NENHUM \`\`\`.
- HTML completo: <!DOCTYPE html>, <html lang="pt-BR">, <head>, <body>.
- TODO CSS inline em <style>. TODO JS em <script> no final do body.
- 100% responsivo com @media queries.
- Google Fonts: Inter (400,500,600,700,800) + Playfair Display (600,700,800,700italic).
- scroll-behavior: smooth.

CSS RESET OBRIGATÓRIO:
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; overflow-x: hidden; }
body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; width: 100%; max-width: 100vw; -webkit-font-smoothing: antialiased; }
img { max-width: 100%; height: auto; display: block; }

REGRAS DE LAYOUT:
- Header fixo z-index 1000, height 70px.
- Hero padding-top 100px+.
- Containers max-width 1280px, margin 0 auto, padding 0 1.5rem.
- Títulos com clamp(): h1 max 4rem, h2 max 2.5rem, h3 max 1.5rem.
- Grids viram 1 coluna no mobile.
- NUNCA font-size > 4rem. NUNCA float. Use flexbox/grid.

PALETA DE CORES (:root):
--bg: ${selectedPalette.bg};
--accent: ${selectedPalette.accent};
--accent-light: ${selectedPalette.accentLight};
--accent-gradient: ${selectedPalette.accentGradient};
--text: ${selectedPalette.text};
--muted: ${selectedPalette.muted};
--card-bg: ${selectedPalette.cardBg};

USE TODAS AS 3 CORES DA PALETA obrigatoriamente: --accent em headers/ícones, --accent-light em highlights/gradient text, --accent-gradient em botões/CTAs.

${imageInstructions}

PRODUTOS DA LOJA:
${productsList}

${shippingInfo}`;

    const userPrompt = `Crie uma LOJA VIRTUAL ONE-PAGE PROFISSIONAL estilo Nuvemshop/Shopify com estas seções:

HEADER:
- Fixo, backdrop-filter blur(25px), background rgba(bg,0.85)
- Logo + nav links (Início, Produtos, Sobre, Contato) + ícone carrinho com badge (número de itens)
- Ao clicar no ícone do carrinho, abre sidebar lateral direita

HERO BANNER:
- ${bannerUrl ? "Usar imagem de banner fornecida com overlay escuro" : "Gradiente épico com orbs decorativos e pattern sutil"}
- Título grande: "${storeName}"${slogan ? ` + subtítulo "${slogan}"` : ""}
- Botão CTA "Ver Produtos" com gradient accent
- Badge "Frete Grátis acima de R$ ${shipping?.freeAbove || "199,90"}" se aplicável

VITRINE DE PRODUTOS:
- Badge "Nossos Produtos" + título h2 accent
- Grid 2x2 (4 colunas no desktop, 2 no mobile)
- Cada card de produto:
  - Imagem com aspect-ratio 1/1, object-fit cover, border-radius 1rem
  - Badge de categoria se houver (accent gradient pill)
  - Nome do produto h3
  - Preço em destaque: font-size 1.5rem, font-weight 800, color accent-light
  - Preço antigo riscado (invente um ~20% maior) em muted, font-size 0.9rem
  - Botão "Adicionar ao Carrinho" com gradient, border-radius 9999px
  - Hover: translateY(-8px), sombra dramática, border accent
- IMPORTANTE: use os produtos REAIS fornecidos com os preços corretos

PÁGINA DE PRODUTO (modal/overlay):
- Ao clicar em um produto, abre um overlay/modal fullscreen
- Layout 2 colunas: imagem grande esquerda + detalhes direita
- Nome, preço, descrição gerada automaticamente (3-4 linhas criativas sobre o produto)
- Seletor de quantidade (- 1 +)
- Botão "Comprar Agora" grande com gradient
- Botão X para fechar modal
- No mobile: layout empilhado

CARRINHO LATERAL (sidebar):
- Sidebar direita com width 400px (100% no mobile)
- Background var(--bg), border-left 1px solid rgba(255,255,255,0.1)
- Overlay escuro atrás
- Header: "Seu Carrinho" + botão fechar X
- Lista de produtos adicionados: imagem mini + nome + preço + quantidade + botão remover
- Subtotal em destaque
- Campo de CEP: input + botão "Calcular"
  - Ao calcular: mostra valor do frete ou "FRETE GRÁTIS" se acima do limite
- Total (subtotal + frete)
- Botão "Finalizar Compra" gradient fullwidth
- Se carrinho vazio: mensagem "Seu carrinho está vazio" + botão "Ver Produtos"

SOBRE A LOJA:
- Seção com texto gerado sobre a loja "${storeName}" no segmento "${segment || "varejo"}"
- Layout 2 colunas com features/diferenciais (Entrega rápida, Qualidade, Atendimento, etc.)

FOOTER:
- 3-4 colunas: brand, links, contato, redes sociais
- Copyright${cnpj ? ` com CNPJ: ${cnpj}` : ""}
- WhatsApp: ${phone || "(00) 00000-0000"}

JAVASCRIPT OBRIGATÓRIO:
1. Carrinho funcional: array de itens, addToCart(), removeFromCart(), updateQuantity()
2. Badge do carrinho atualiza em tempo real
3. Sidebar abre/fecha com animação (transform translateX)
4. Modal de produto abre/fecha
5. Cálculo de frete simulado
6. IntersectionObserver para animações de entrada
7. Smooth scroll nos links de navegação
8. No início do script: elementos .animate-on-scroll que já estão visíveis recebem class 'visible' imediatamente

INFORMAÇÕES DA LOJA:
- Nome: ${storeName}
${slogan ? `- Slogan: ${slogan}` : ""}
${segment ? `- Segmento: ${segment}` : ""}
${cnpj ? `- CNPJ: ${cnpj}` : ""}
- WhatsApp: ${phone || "(00) 00000-0000"}

QUALIDADE VISUAL:
- Design nível Awwwards: espaçamento generoso, tipografia expressiva, sombras elegantes
- Cards com hover premium (translateY, border accent, shadow)
- Badges com background rgba(accent,0.1)
- Gradient text nos títulos
- Animações suaves em TUDO (0.3s ease)
- Prefers-reduced-motion: desabilitar animações

Gere o HTML completo agora. APENAS código HTML puro.`;

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
      return new Response(JSON.stringify({ error: "Erro ao gerar prévia da loja." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-store-preview error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
