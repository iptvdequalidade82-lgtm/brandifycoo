import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Curated product images by segment (direct Unsplash URLs, always available)
function getProductImages(segment: string): string[] {
  const s = (segment || "loja").toLowerCase().trim();

  const segmentImages: Record<string, string[]> = {
    moda: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cda3a00?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&h=600&fit=crop",
    ],
    joias: [
      "https://images.unsplash.com/photo-1515562141589-67f0d569b3f4?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=600&h=600&fit=crop",
    ],
    eletronicos: [
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=600&h=600&fit=crop",
    ],
    cosmeticos: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop",
    ],
    pet: [
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1592754862816-1a21a4ea2281?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&h=600&fit=crop",
    ],
    decoracao: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=600&fit=crop",
    ],
  };

  // Default product images
  const defaultImages = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&h=600&fit=crop",
  ];

  // Match by keyword
  const matchMap: Record<string, string> = {
    moda: "moda", roupa: "moda", "calçado": "moda", sapato: "moda", "tênis": "moda",
    joia: "joias", "acessório": "joias", bijuteria: "joias", prata: "joias", ouro: "joias",
    "eletrônico": "eletronicos", celular: "eletronicos", tech: "eletronicos", "informática": "eletronicos",
    "cosmético": "cosmeticos", beleza: "cosmeticos", maquiagem: "cosmeticos", skincare: "cosmeticos",
    pet: "pet", animal: "pet", "veterinár": "pet", "ração": "pet",
    "decoração": "decoracao", "móve": "decoracao", casa: "decoracao", jardim: "decoracao",
  };

  for (const [key, ref] of Object.entries(matchMap)) {
    if (s.includes(key) && segmentImages[ref]) return segmentImages[ref];
  }

  return defaultImages;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storeName, segment, phone, aiMode, products, colorScheme } = await req.json();

    // API key loaded at call time below

    const productImages = getProductImages(segment || "");

    const colorSchemes: Record<string, { primary: string; bg: string; text: string; accent: string; headerBg: string; navBg: string; cardBg: string; priceBg: string; footerBg: string; bannerOverlay: string }> = {
      modern: { primary: "#2563eb", bg: "#ffffff", text: "#1a1a1a", accent: "#059669", headerBg: "#ffffff", navBg: "#f8f9fa", cardBg: "#ffffff", priceBg: "#059669", footerBg: "#1a1a1a", bannerOverlay: "rgba(0,0,0,0.4)" },
      elegant: { primary: "#8b5cf6", bg: "#faf5ff", text: "#1a1a1a", accent: "#d946ef", headerBg: "#ffffff", navBg: "#f5f3ff", cardBg: "#ffffff", priceBg: "#8b5cf6", footerBg: "#1e1b4b", bannerOverlay: "rgba(30,27,75,0.5)" },
      warm: { primary: "#ea580c", bg: "#fffbeb", text: "#1a1a1a", accent: "#d97706", headerBg: "#ffffff", navBg: "#fff7ed", cardBg: "#ffffff", priceBg: "#ea580c", footerBg: "#431407", bannerOverlay: "rgba(67,20,7,0.5)" },
      dark: { primary: "#3b82f6", bg: "#0f172a", text: "#f1f5f9", accent: "#22d3ee", headerBg: "#1e293b", navBg: "#0f172a", cardBg: "#1e293b", priceBg: "#3b82f6", footerBg: "#020617", bannerOverlay: "rgba(2,6,23,0.6)" },
      pink: { primary: "#ec4899", bg: "#fdf2f8", text: "#1a1a1a", accent: "#f43f5e", headerBg: "#ffffff", navBg: "#fce7f3", cardBg: "#ffffff", priceBg: "#ec4899", footerBg: "#831843", bannerOverlay: "rgba(131,24,67,0.5)" },
      green: { primary: "#16a34a", bg: "#f0fdf4", text: "#1a1a1a", accent: "#059669", headerBg: "#ffffff", navBg: "#ecfdf5", cardBg: "#ffffff", priceBg: "#16a34a", footerBg: "#14532d", bannerOverlay: "rgba(20,83,45,0.5)" },
    };

    const colors = colorSchemes[colorScheme || "modern"] || colorSchemes.modern;

    // Build product list for manual mode
    let productsData = "";
    if (!aiMode && products && products.length > 0) {
      productsData = `\nPRODUTOS DO CLIENTE (use exatamente estes dados):`;
      products.forEach((p: any, i: number) => {
        productsData += `\n${i + 1}. Nome: "${p.name}", Preço: R$ ${p.price}${p.category ? `, Categoria: ${p.category}` : ""}${p.imageUrl ? `, Imagem: ${p.imageUrl}` : ""}`;
      });
      productsData += `\nDuplique os produtos se necessário para preencher a vitrine com pelo menos 8 itens.`;
    }

    const systemPrompt = `Você é um especialista em e-commerce que cria lojas com layout IDÊNTICO ao da plataforma Nuvemshop. Você estudou dezenas de lojas reais da Nuvemshop e conhece cada detalhe do layout padrão.

REGRAS ABSOLUTAS:
- Retorne APENAS código HTML completo. NENHUM texto antes ou depois. NENHUM markdown. NENHUM \`\`\`.
- O HTML deve ser documento completo: <!DOCTYPE html>, <html lang="pt-BR">, <head>, <body>.
- TODO o CSS inline dentro de <style> no <head>. NÃO use CSS externo exceto Google Fonts.
- 100% responsivo.
- Google Fonts: Inter (300,400,500,600,700) e opcionalmente uma display font para o logo.

LAYOUT EXATO DA NUVEMSHOP (COPIE FIELMENTE):

1. BARRA SUPERIOR (info bar):
   - Faixa fina (35px) com background: ${colors.primary}; color: white; font-size: 12px
   - Texto centralizado: "FRETE GRÁTIS acima de R$ 199" ou "DESCONTO de 10% na primeira compra" ou mensagem similar
   - Pode ter ícone de entrega SVG à esquerda do texto

2. HEADER:
   - background: ${colors.headerBg}; height: 70px; border-bottom: 1px solid rgba(0,0,0,0.08)
   - Layout: [Busca] [LOGO centro] [Conta + Carrinho]
   - Ícone de busca (lupa SVG) na esquerda
   - Logo CENTRALIZADO: nome da loja em fonte estilizada, font-size 1.5rem, font-weight 700
   - Direita: ícone de conta (person SVG) + ícone carrinho (bag SVG) com badge numérico "0"
   - Deve ser sticky/fixed no topo

3. NAVEGAÇÃO:
   - Abaixo do header, background: ${colors.navBg}; border-bottom: 1px solid rgba(0,0,0,0.06)
   - Links centralizados: Início · Produtos · [Categorias do segmento] · Promoções · Contato
   - font-size: 14px, font-weight: 500, gap: 2rem, text-transform: uppercase em mobile vira hamburger

4. BANNER HERO (slider):
   - Aspect ratio ~16:7 (fullwidth, height ~450px desktop / 250px mobile)
   - Imagem de fundo temática do segmento com overlay: ${colors.bannerOverlay}
   - Texto sobre o banner: frase promocional grande (font-size: clamp(1.5rem, 4vw, 2.8rem), font-weight 700, color white)
   - Subtexto: descrição curta da promoção/loja
   - Botão CTA: "VER COLEÇÃO" ou "COMPRAR AGORA" — bg white, color texto, border-radius 4px, padding 12px 32px, font-weight 600
   - Indicadores de slide (3 dots) no bottom center
   - Setas laterais (< >) simples

5. BARRA DE INFORMAÇÕES:
   - Background: ${colors.bg}; padding: 20px 0; border-bottom: 1px solid rgba(0,0,0,0.06)
   - 4 ícones em row com texto:
     • 🚚 Envio para todo Brasil
     • 💳 Parcele em até 12x
     • 🔒 Compra 100% segura
     • 📞 Atendimento via WhatsApp
   - Ícones SVG simples, 24px, cor: ${colors.primary}

6. SEÇÃO "OS MAIS PROCURADOS" / DESTAQUES:
   - Título: centralizado, font-size 1.5rem, font-weight 600, letter-spacing 0.05em, text-transform uppercase
   - Separador decorativo: linha horizontal 60px, 2px, cor ${colors.primary}, center
   - Grid 4 colunas (2 em mobile) com product cards

7. PRODUCT CARDS (estilo EXATO Nuvemshop):
   - background: ${colors.cardBg}; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; overflow: hidden
   - Imagem: aspect-ratio 1/1, object-fit: cover, width 100%
   - Se tiver desconto: badge "XX% OFF" — position absolute top-left da imagem, background: ${colors.priceBg}, color: white, font-size: 11px, font-weight 700, padding: 4px 10px, border-radius: 0 0 4px 0
   - Hover na imagem: scale(1.05), transition 0.3s
   - Abaixo da imagem:
     • Nome do produto: font-size: 13px, font-weight: 400, color: ${colors.text}, padding: 12px 12px 4px, line-clamp 2
     • Preço com desconto: font-size: 16px, font-weight: 700, color: ${colors.priceBg}
     • Preço original (riscado): font-size: 12px, text-decoration: line-through, color: #999, margin-left 6px
     • Parcelamento: font-size: 11px, color: #666, "ou 3x de R$ XX,XX"
   - Botão "COMPRAR": width 100%, background: ${colors.primary}, color: white, border: none, padding: 10px, font-size: 13px, font-weight: 600, text-transform: uppercase, border-radius: 0 0 8px 8px, cursor: pointer, hover: opacity 0.9

8. SEÇÃO DE CATEGORIAS (grid de imagens):
   - 3 cards grandes em row (1 col mobile), cada um:
   - Imagem fullwidth ~200px height, overlay escuro sutil
   - Texto centralizado sobre a imagem: nome da categoria, font-weight 600, color white
   - Botão "Ver mais" sutil

9. SEÇÃO "NOVIDADES" ou "MAIS VENDIDOS":
   - Mesmo estilo de grid de produtos que a seção 6, mas com 4-8 novos produtos

10. BANNER PROMOCIONAL (meio da página):
    - Fullwidth, height ~200px, background: gradiente ou imagem
    - Texto de promoção grande: "OUTLET até 50% OFF" ou "Lançamento da nova coleção"
    - Botão CTA

11. NEWSLETTER:
    - background: ${colors.primary}10 (10% opacity); padding: 40px; text-align: center
    - Título: "Receba ofertas exclusivas"
    - Input de e-mail + botão "Inscrever" na mesma linha
    - font-size: 14px

12. FOOTER (estilo Nuvemshop):
    - background: ${colors.footerBg}; color: white; padding: 40px 0
    - 4 colunas:
      • Sobre a loja (logo + texto curto)
      • Institucional (links: Sobre, Política de Privacidade, Trocas e Devoluções)
      • Atendimento (e-mail, telefone, horário)
      • Redes sociais (ícones SVG: Instagram, Facebook, WhatsApp)
    - Sub-footer: logos de meios de pagamento (Visa, Master, Pix, Boleto) + selo de segurança + "Powered by Nuvemshop"
    - Copyright: © 2025 + nome da loja

13. BOTÃO FLUTUANTE WHATSAPP:
    - position: fixed; bottom: 20px; right: 20px; z-index: 1000
    - Círculo 56px, background: #25D366, box-shadow
    - Ícone WhatsApp SVG branco dentro
    - Hover: scale(1.1)

INTERATIVIDADE JavaScript (no final do <body>):
- Carrinho lateral: ao clicar no ícone, abre sidebar direita (slide-in, 350px width) com lista de itens, subtotal e botão "Finalizar Compra". Simulação — ao clicar "COMPRAR" num produto, adiciona ao carrinho com animação.
- Busca: ao clicar na lupa, expande input de busca no header
- Slider do banner: auto-play 5s, botões de seta, dots indicators
- FAQ toggle se houver
- Scroll suave

RESPONSIVO:
- @media (max-width: 768px): nav vira hamburger, grid produtos 2 cols, footer 1 col
- @media (max-width: 480px): info bar oculta, header simplificado, 1 col em tudo

IMPORTANTE: O layout deve ser INDISTINGUÍVEL de uma loja real da Nuvemshop. Cada elemento, espaçamento, tipografia e interação deve parecer nativo da plataforma.

EXIGÊNCIAS DE DESIGN PREMIUM:
- O visual deve parecer uma loja PROFISSIONAL de verdade — não um template amador.
- Imagens de produto com aspect-ratio perfeito, hover zoom suave (scale 1.05), e sombras sutis.
- Cards de produto com espaçamento interno generoso, tipografia limpa e hierarquia visual clara.
- Botões com micro-interações: hover com lift (translateY -2px) + sombra intensificada + transition suave 0.3s.
- Banner hero CINEMATOGRÁFICO: overlay gradiente sofisticado, tipografia grande e impactante, CTA bem posicionado.
- Consistência de cores em TUDO: badges de desconto, botões, links, ícones — tudo na paleta escolhida.
- Footer completo e profissional com layout em colunas, ícones de pagamento e redes sociais.
- Responsividade PERFEITA: testar mentalmente cada breakpoint para garantir que nada quebre.
- Hover effects em TODOS os elementos interativos (produtos, botões, links, ícones).
- Sombras e bordas sutis nos cards para criar profundidade sem poluir.
- Tipografia variada: use font-weight 300 para textos longos, 500 para labels, 700 para títulos.
- PROIBIDO: design genérico sem personalidade, imagens cortadas, textos desalinhados, cores dissonantes.`;

    let userPrompt: string;

    if (aiMode) {
      userPrompt = `Crie uma loja virtual Nuvemshop completa para o segmento: "${segment || 'Moda'}".
${storeName ? `Nome sugerido: "${storeName}"` : "INVENTE um nome criativo e memorável para a loja."}
${phone ? `WhatsApp: ${phone}` : ""}

MODO IA — INVENTE TUDO:
- Nome da loja (se não fornecido): criativo, moderno, memorável
- 8-12 produtos REALISTAS com nomes, preços, categorias e descrições do segmento
- Preços entre R$ 29,90 e R$ 599,90, com alguns em promoção (preço original + preço com desconto)
- 3-4 categorias relevantes ao segmento
- Frases promocionais realistas para os banners
- Texto institucional (sobre a loja)
- Horário de atendimento
- Use as imagens temáticas de produtos: ${productImages.slice(0, 8).join(", ")}
- Use as imagens restantes para categorias e banners: ${productImages.slice(8).join(", ")}

Gere o HTML completo agora. APENAS código HTML.`;
    } else {
      userPrompt = `Crie uma loja virtual Nuvemshop para:
- Nome: "${storeName || 'Minha Loja'}"
- Segmento: "${segment || 'Moda'}"
${phone ? `- WhatsApp: ${phone}` : ""}
${productsData}

${!products || products.length === 0 ? `INVENTE 8-12 produtos realistas para o segmento "${segment || 'moda'}" com preços entre R$ 29,90 e R$ 599,90.` : ""}

Use as imagens temáticas: ${productImages.slice(0, 8).join(", ")}

Gere o HTML completo agora. APENAS código HTML.`;
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY não configurada." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let response: Response | null = null;
    const models = ["gemini-2.5-pro", "gemini-2.5-flash"];

    for (const model of models) {
      let succeeded = false;
      const maxRetries = 2;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          console.log(`Tentando modelo ${model} (tentativa ${attempt + 1}/${maxRetries})...`);
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${GEMINI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              stream: true,
            }),
          });

          if (response.ok) {
            console.log(`Sucesso com modelo ${model}`);
            succeeded = true;
            break;
          }

          if (response.status === 429 && attempt < maxRetries - 1) {
            console.warn(`Gemini API rate limited (429) com ${model}. Tentativa ${attempt + 1}/${maxRetries}. Aguardando...`);
            await new Promise(r => setTimeout(r, (attempt + 1) * 3000));
            continue;
          }

          break;
        } catch (err) {
          console.error(`Erro na chamada do Gemini ${model} (tentativa ${attempt + 1}):`, err);
          if (attempt < maxRetries - 1) {
            await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
            continue;
          }
        }
      }

      if (succeeded) break;
      console.warn(`Modelo ${model} falhou, tentando próximo...`);
    }

    if (!response || !response.ok) {
      const t = response ? await response.text() : "Sem resposta";
      console.error("Gemini API error:", response?.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar prévia. Tente novamente em alguns instantes." }), {
        status: response?.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
