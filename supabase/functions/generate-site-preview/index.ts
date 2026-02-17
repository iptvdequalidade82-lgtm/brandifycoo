import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Curated Unsplash image URLs by segment (direct links, always available)
function getSegmentImages(segment: string, businessName: string): { hero: string; about: string; gallery: string[]; team: string; cta: string } {
  const s = (segment || businessName || "business").toLowerCase().trim();

  // Curated photo sets per segment using stable Unsplash direct URLs
  const segmentPhotos: Record<string, { hero: string; about: string; gallery: string[]; team: string; cta: string }> = {
    barbearia: {
      hero: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&h=1080&fit=crop",
      about: "https://images.unsplash.com/photo-1521590832167-7228f6faa6d2?w=800&h=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1585747860019-8e4b67e3614d?w=600&h=400&fit=crop",
      ],
      team: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
      cta: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1920&h=600&fit=crop",
    },
    restaurante: {
      hero: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop",
      about: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop",
      ],
      team: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=600&fit=crop",
      cta: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&h=600&fit=crop",
    },
    pizzaria: {
      hero: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&h=1080&fit=crop",
      about: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop",
      ],
      team: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=600&fit=crop",
      cta: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1920&h=600&fit=crop",
    },
    hamburgueria: {
      hero: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1920&h=1080&fit=crop",
      about: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&h=400&fit=crop",
      ],
      team: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=600&fit=crop",
      cta: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1920&h=600&fit=crop",
    },
    academia: {
      hero: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop",
      about: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop",
      ],
      team: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&h=600&fit=crop",
      cta: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1920&h=600&fit=crop",
    },
    "pet shop": {
      hero: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&h=1080&fit=crop",
      about: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=400&fit=crop",
      ],
      team: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop",
      cta: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&h=600&fit=crop",
    },
    advocacia: {
      hero: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&h=1080&fit=crop",
      about: "https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&h=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop",
      ],
      team: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop",
      cta: "https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=1920&h=600&fit=crop",
    },
    moda: {
      hero: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop",
      about: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop",
      ],
      team: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop",
      cta: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=600&fit=crop",
    },
    "salão de beleza": {
      hero: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&h=1080&fit=crop",
      about: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=400&fit=crop",
      ],
      team: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=600&fit=crop",
      cta: "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=1920&h=600&fit=crop",
    },
    arquitetura: {
      hero: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1920&h=1080&fit=crop",
      about: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop",
      ],
      team: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop",
      cta: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&h=600&fit=crop",
    },
    fotografia: {
      hero: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&h=1080&fit=crop",
      about: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=600&h=400&fit=crop",
      ],
      team: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop",
      cta: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&h=600&fit=crop",
    },
    tecnologia: {
      hero: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=1080&fit=crop",
      about: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
      ],
      team: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
      cta: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=600&fit=crop",
    },
  };

  // Default fallback set
  const defaultPhotos = {
    hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop",
    about: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
    ],
    team: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop",
    cta: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&h=600&fit=crop",
  };

  // Find best match
  for (const [key, photos] of Object.entries(segmentPhotos)) {
    if (s.includes(key)) return photos;
  }

  // Check partial matches for broader terms
  const broadMatch: Record<string, string> = {
    "clínica": "advocacia", "odonto": "advocacia", "dentist": "advocacia",
    "loja": "moda", "roupa": "moda", "boutique": "moda",
    "café": "restaurante", "padaria": "restaurante", "cafeteria": "restaurante",
    "burger": "hamburgueria", "hambur": "hamburgueria",
    "pizza": "pizzaria",
    "pet": "pet shop", "veterinár": "pet shop",
    "advogad": "advocacia",
    "beleza": "salão de beleza", "estética": "salão de beleza",
    "mecânica": "tecnologia", "auto center": "tecnologia",
    "marketing": "tecnologia", "consultoria": "tecnologia",
    "construção": "arquitetura", "imobiliár": "arquitetura",
    "hotel": "arquitetura", "pousada": "arquitetura",
    "educação": "tecnologia", "escola": "tecnologia",
    "floricultura": "salão de beleza", "joalheria": "moda",
    "fitness": "academia", "gym": "academia", "crossfit": "academia",
    "foto": "fotografia",
    "barber": "barbearia", "barba": "barbearia",
  };

  for (const [key, ref] of Object.entries(broadMatch)) {
    if (s.includes(key) && segmentPhotos[ref]) return segmentPhotos[ref];
  }

  return defaultPhotos;
}

const planPrompts: Record<string, string> = {
  essencial: `Crie um site ONE-PAGE IMPRESSIONANTE com 5-6 seções. Este site precisa parecer que foi feito por uma agência que cobra R$5.000+.

HERO (100vh):
- Background: gradiente radial enorme (radial-gradient(ellipse 80% 60% at 50% 40%, rgba(accent,0.15), transparent))
- Se houver imagem hero fornecida, use como background com overlay escuro (background: linear-gradient(180deg, rgba(bg,0.3) 0%, rgba(bg,0.85) 60%, var(--bg) 100%)), position: center, background-size: cover
- Título GRANDE: font-size: clamp(2rem, 5vw, 3.5rem), font-weight 800, letter-spacing -0.03em
- Uma palavra do título com background: var(--accent-gradient), -webkit-background-clip: text, color: transparent
- Subtítulo em --muted, max-width 500px, font-size 1.15rem, line-height 1.7
- UM botão CTA grande: padding 1.25rem 3rem, background var(--accent-gradient), border-radius 9999px, box-shadow 0 0 30px rgba(accent,0.3), hover scale(1.05)
- Abaixo do CTA: uma fila de 3 mini-stats (ex: "100+ Clientes", "5★ Avaliação", "Desde 2020") com ícones SVG, separados por dividers verticais
- Scroll indicator animado no bottom (bouncing chevron)

SOBRE:
- Layout 2 colunas assimétrico (60/40). Coluna esquerda: título h2 com uma palavra em accent, parágrafo conciso, 3 bullet points com ícone SVG accent + texto
- Coluna direita: USAR IMAGEM REAL do segmento (da URL fornecida nos dados de imagem) com border-radius 1.5rem, box-shadow 0 25px 60px rgba(0,0,0,0.3), rotação leve (transform: rotate(2deg)), borda sutil 1px rgba(accent,0.2)

SERVIÇOS:
- Título centralizado com badge "Nossos Serviços" acima (background rgba(accent,0.1), color accent, padding 0.5rem 1.5rem, border-radius 9999px, font-size 0.85rem, font-weight 600, text-transform uppercase, letter-spacing 0.1em)
- Grid 3 colunas. Cards com: padding 2.5rem, background var(--card-bg), border 1px solid rgba(255,255,255,0.06), border-radius 1rem
- Cada card: ícone SVG 48px dentro de div com background var(--accent-gradient) opacity 0.1, border-radius 1rem, padding 1rem + título h3 bold + descrição 2 linhas em --muted
- Hover: border-color var(--accent), box-shadow 0 0 30px rgba(accent,0.1), transform translateY(-4px)
- IMPORTANTE: Crie serviços REALISTAS e ESPECÍFICOS para o segmento do cliente. Não invente serviços genéricos.

CONTATO:
- Layout 2 colunas. Esquerda: título, parágrafo, 3 itens de contato (email, telefone, localização) com ícone SVG accent
- Direita: formulário com inputs (background rgba(255,255,255,0.05), border 1px solid rgba(255,255,255,0.1), border-radius 0.75rem, padding 1rem 1.25rem, font-size 1rem). Focus: border-color var(--accent), box-shadow 0 0 0 3px rgba(accent,0.15)
- Botão submit fullwidth com gradient

FAQ:
- 4 perguntas RELEVANTES ao segmento (não genéricas). Cada item: border-bottom 1px solid rgba(255,255,255,0.08), padding 1.5rem 0
- Pergunta: font-weight 600, cursor pointer, display flex justify-content space-between, com ícone + SVG que rota no open
- Resposta: max-height 0 overflow hidden transition, color --muted

HEADER: position fixed, backdrop-filter blur(20px), background rgba(bg,0.8), border-bottom 1px solid rgba(255,255,255,0.06). Logo + 4 nav links (hover: color accent) + botão CTA pequeno com gradient.
FOOTER: background rgba(255,255,255,0.02), border-top 1px solid rgba(255,255,255,0.06). Logo + links + redes sociais (ícones SVG em circles hover accent). Copyright com CNPJ se fornecido.

CRIATIVIDADE OBRIGATÓRIA:
- Adapte TODA a linguagem, ícones e serviços ao segmento específico do negócio
- Use termos do nicho do cliente (ex: para barbearia use "corte", "barba", "degradê"; para clínica use "consulta", "tratamento", "cuidado")
- Os depoimentos devem parecer reais e mencionar serviços específicos do negócio
- O FAQ deve responder dúvidas REAIS que clientes desse segmento teriam`,

  profissional: `Crie um site ONE-PAGE de ALTÍSSIMO NÍVEL com 7-8 seções. O objetivo é que o cliente veja e QUEIRA IMEDIATAMENTE contratar. Padrão Awwwards / Dribbble / sites de agências de R$15.000+.

HERO (100vh):
- Background multi-camada: gradiente radial grande + padrão SVG sutil do nicho (opacity 0.03) + orb flutuante decorativo (div com blur enorme, position absolute, background accent, opacity 0.08, border-radius 50%, width 400px, height 400px, top -100px, right -100px, animation float 8s ease-in-out infinite)
- Se houver imagem hero, use como background com overlay cinematográfico: background: linear-gradient(180deg, rgba(bg,0.2) 0%, rgba(bg,0.6) 40%, rgba(bg,0.95) 80%, var(--bg) 100%)
- Badge no topo: "🚀 Presença Digital Premium" — background rgba(accent,0.1), padding 0.6rem 1.5rem, border-radius 9999px, border 1px solid rgba(accent,0.2), font-size 0.85rem
- Título MONUMENTAL: font-size: clamp(2.2rem, 5vw, 4rem), font-weight 800, letter-spacing -0.04em, line-height 1.1. DUAS palavras-chave com gradient text
- Subtítulo: max-width 550px, font-size 1.2rem, line-height 1.8, color --muted
- 2 botões: Primário (gradient, glow shadow, hover scale) + Secundário (border 1px solid rgba(accent,0.3), background transparent, hover background rgba(accent,0.1))
- Stats bar abaixo dos botões: 4 stats em row com dividers (números grandes font-size 1.5rem bold accent, labels pequenos muted)
- Scroll indicator com animação bounce

MARQUEE:
- Faixa com scroll infinito CSS (@keyframes scroll: translateX(0) → translateX(-50%))
- Textos ou parceiros em grayscale, opacity 0.4, gap 4rem
- Divisores top/bottom com border 1px solid rgba(255,255,255,0.05)

SOBRE:
- Grid 2 colunas assimétrico. Esquerda: badge "Sobre Nós", título h2 impactante com palavra accent, 2 parágrafos curtos, 4 features em grid 2x2 (ícone accent + texto curto)
- Direita: IMAGEM REAL DO SEGMENTO com moldura complexa (border-radius 1.5rem, sombra dramática, borda accent sutil, e um elemento decorativo floating atrás — div com gradient, blur, position absolute, z-index -1)
- Incluir bloco "Missão e Valores" — 3 cards pequenos com ícone + título + texto curto (Ex: Excelência, Confiança, Inovação) adaptados ao segmento

SERVIÇOS:
- Badge centralizado + título + subtítulo muted
- Grid 3 colunas. Cards PREMIUM: padding 3rem, background var(--card-bg), border 1px solid rgba(255,255,255,0.06), border-radius 1.25rem
- Ícone dentro de circle gradient (width 64px, height 64px, border-radius 1rem, background var(--accent-gradient), display flex align-items center justify-content center)
- Título h3 + descrição + link "Saiba mais →" em accent
- Hover: translateY(-8px), border-color accent, box-shadow 0 20px 60px rgba(accent,0.15)
- SERVIÇOS 100% PERSONALIZADOS ao segmento. Se for barbearia: Corte Degradê, Barba Completa, etc. Se for clínica: Consulta, Exames, etc.

PORTFÓLIO / GALERIA:
- Badge + título
- Grid 2x2 com aspect-ratio 16/10. USAR IMAGENS REAIS fornecidas ou do segmento
- Sobre o overlay: título do projeto + 2-3 tags (background rgba(accent,0.2), color accent-light, padding 0.3rem 0.8rem, border-radius 9999px, font-size 0.75rem)
- Hover: overlay sobe, scale(1.05) na imagem, aparece botão "Ver Mais"

DEPOIMENTOS:
- Background section diferenciado (rgba(accent,0.03))
- 1 depoimento DESTAQUE grande centralizado: citação com aspas decorativas SVG, texto em itálico font-size 1.25rem, foto circular + nome + cargo abaixo
- 3 cards menores abaixo em grid: foto circular 48px + estrelas douradas (#FFD700) + texto + nome/cargo
- DEPOIMENTOS REALISTAS mencionando serviços específicos do negócio e experiências do dia a dia

CONTATO:
- Grid 2 colunas. Esquerda: título, subtítulo, 4 itens info (ícone accent em circle rgba(accent,0.1) + label + valor). WhatsApp com link direto.
- Direita: form com floating labels. Inputs estilizados premium. Botão gradient fullwidth com ícone →

FAQ:
- 5 perguntas accordion ESPECÍFICAS DO SEGMENTO. Design premium: cards separados com background card-bg, border-radius 1rem, margin-bottom 0.75rem

HEADER: fixed, height 70px, backdrop-filter blur(25px), background rgba(bg,0.85), border-bottom 1px solid rgba(255,255,255,0.06). Logo + nav links com underline accent + CTA button gradient
FOOTER: 4 colunas (brand+desc, links, serviços, contato). Social icons em circles. Copyright bar separada.

EFEITOS CSS OBRIGATÓRIOS:
- @keyframes fadeInUp, float, scroll (marquee)
- IntersectionObserver que adiciona class visible quando seção entra na viewport
- Smooth scroll nos links de navegação
- Hover transitions em TODOS os elementos interativos (0.3s ease)

CRIATIVIDADE OBRIGATÓRIA:
- O site INTEIRO deve respirar o segmento do cliente. Um site de barbearia deve ter vibe masculina e estilosa. Um site de clínica deve transmitir confiança e limpeza. Um site de restaurante deve dar água na boca.
- Use terminologia do nicho em TUDO: títulos, descrições, FAQs, depoimentos
- Cada depoimento deve mencionar um serviço real e uma experiência crível`,

  premium: `Crie um site ONE-PAGE CINEMATOGRÁFICO e ESPETACULAR com 9+ seções. Este é o nível mais alto — deve parecer um site de R$30.000+ feito por agência internacional. O cliente precisa ficar DE QUEIXO CAÍDO.

HERO (100vh):
- Background ÉPICO multi-camada:
  1. Se houver imagem hero: usar como fullscreen background com overlay cinematográfico complexo: background: linear-gradient(180deg, rgba(bg,0.1) 0%, rgba(bg,0.4) 30%, rgba(bg,0.8) 60%, var(--bg) 100%), com vignette radial adicional
  2. Gradiente radial (radial-gradient(ellipse 90% 70% at 50% 30%, rgba(accent,0.2), transparent 70%))
  3. Orbs decorativos flutuantes (2-3 divs com blur 120px+, accent gradient, opacity 0.08-0.12, position absolute, animation float com delays diferentes)
  4. Grid pattern sutil (background-image radial-gradient(rgba(accent,0.1) 1px, transparent 1px), background-size 30px 30px, opacity 0.3)
- Badge animado: ícone ✨ + "Site Premium" — border accent, background rgba(accent,0.08), animação pulse sutil
- Título ÉPICO: font-size: clamp(2.5rem, 5vw, 4rem), font-weight 900, letter-spacing -0.04em, line-height 1.1. MÚLTIPLAS palavras com gradient text. Pode ter <br> para quebra dramática
- Subtítulo sofisticado: font-size 1.3rem, line-height 1.8, max-width 600px, font-weight 300
- 2 botões PREMIUM: Primário (gradient, padding 1.5rem 3.5rem, border-radius 9999px, box-shadow 0 0 40px rgba(accent,0.4), hover glow intensifica + scale(1.05)) + Ghost (border accent, backdrop-filter blur)
- Stats impressionantes: 4 stats grandes em row
- Mouse scroll indicator com animation bounce + pulse

MARQUEE DE PARCEIROS/TECH:
- Faixa fullwidth com @keyframes marquee (translateX(0) → translateX(-50%)), 20s linear infinite
- Ícones/logos em grayscale filter, opacity 0.4, hover: grayscale(0) opacity(1)
- Duplicar conteúdo para loop seamless

SOBRE (com WOW factor):
- Badge + título épico com accent word
- Layout offset: texto esquerda (55%), imagem direita com composição complexa:
  - IMAGEM REAL DO SEGMENTO com border-radius 2rem, box-shadow dramática
  - Floating badge SOBRE a imagem (position absolute, bottom -20px, left -20px): número destaque + label (ex: "8+ Anos de Experiência")
  - Elemento decorativo pontilhado atrás
- Bloco "Nossa Essência": Missão, Visão e Valores em 3 cards elegantes com ícones temáticos do segmento
- 4 features em lista com ícones accent checks

SERVIÇOS (grid impactante):
- Grid 2x3 cards com hover PREMIUM
- Número do serviço: "01", "02"... em accent, font-size 3rem, opacity 0.1, position absolute top-right
- HOVER: translateY(-10px), background gradient sutil, border-color accent, shadow dramática
- SERVIÇOS ULTRA-ESPECÍFICOS ao segmento com descrições detalhadas e benefícios

PORTFÓLIO / GALERIA (showcase premium):
- Layout alternado: projetos pares (imagem esquerda, texto direita) e ímpares (inverso)
- USAR TODAS AS IMAGENS REAIS disponíveis. Se não houver, usar imagens temáticas do segmento
- Cada projeto: imagem com border-radius 1.5rem, tag de categoria, título h3, descrição curta, botão "Ver Projeto"

NÚMEROS/RESULTADOS:
- Background diferenciado com gradiente accent sutil
- Grid 4 colunas com números IMPACTANTES e RELEVANTES ao segmento
- Números grandes accent gradient text + label muted + ícone SVG

DEPOIMENTOS (social proof premium):
- Quote destaque GRANDE com aspas decorativas SVG gigantes
- 3 cards secundários em row abaixo
- DEPOIMENTOS ULTRA-REALISTAS com nomes brasileiros, mencionando serviços ESPECÍFICOS, e sentimentos reais

CTA SECTION (antes do contato):
- Background: gradiente accent intenso ou imagem com overlay
- Título grande branco, subtítulo com urgência sutil e elegante, botão CTA ENORME
- Frase de impacto que conecte com o segmento (ex: para barbearia: "Seu estilo merece o melhor")

CONTATO (premium):
- Grid 2 colunas. Esquerda: título épico, subtítulo, 4 info cards com ícone + label + valor
- WhatsApp com link direto e destaque visual
- Direita: form PREMIUM com floating labels, inputs com focus ring accent, botão gradient com ícone

FAQ:
- 6 perguntas em cards individuais — PERGUNTAS REAIS do segmento
- Click toggle com animação suave

HEADER: fixed, height 72px, backdrop-filter blur(30px) saturate(1.5), background rgba(bg,0.8), border-bottom rgba(255,255,255,0.05). Logo + nav links + CTA gradient pill.
FOOTER ÉPICO: 4 colunas. Newsletter. Social icons. Copyright bar com CNPJ.

EFEITOS OBRIGATÓRIOS:
- @keyframes fadeInUp, fadeIn, float, pulse, marquee
- IntersectionObserver com stagger delays
- Smooth scroll
- Parallax sutil no hero
- Cursor glow sutil (div 200px blur seguindo o mouse)
- Hover effects em TODOS os elementos interativos
- Prefers-reduced-motion: desabilitar animações

CRIATIVIDADE PREMIUM OBRIGATÓRIA:
- O site deve contar uma HISTÓRIA sobre o negócio, não apenas listar informações
- A linguagem deve transmitir autoridade e confiança absolutas
- Cada seção deve ter uma transição visual elegante para a próxima
- Use metáforas e copy sofisticada do nicho
- Depoimentos com histórias mini-narrativas (ex: "Cheguei sem saber o que queria e saí com o melhor corte da minha vida")
- O CTA final deve criar desejo, não pressão`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan, businessName, phone, slogan, cnpj, segment, description, logoUrl, bannerUrl, galleryUrls, colorPalette, aiMode } = await req.json();

    // API key loaded at call time below

    const planKey = (plan || "essencial").toLowerCase();
    const planPrompt = planPrompts[planKey] || planPrompts.essencial;

    // Color palette mapping
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
      // New modern palettes
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

    const selectedPalette = palettes[colorPalette || "midnight"] || palettes.midnight;

    // Get segment-based stock images
    const segmentImages = getSegmentImages(segment || "", businessName || "");

    // Build image instructions
    let imageInstructions = "";

    if (logoUrl) {
      imageInstructions += `\nLOGO: Use esta URL para o logo da empresa: ${logoUrl}. Exiba no header com height: 40px e no footer.`;
    } else {
      imageInstructions += `\nLOGO: Crie um logo usando as iniciais do nome da empresa. Use um <span> com background: var(--accent-gradient), color: white, width: 44px, height: 44px, border-radius: 12px, display: inline-flex, align-items: center, justify-content: center, font-weight: 700. Ao lado, o nome da empresa.`;
    }

    if (bannerUrl) {
      imageInstructions += `\nBANNER HERO: Use esta imagem real como background do hero: ${bannerUrl}. Aplique um overlay escuro semi-transparente (background: linear-gradient(to bottom, rgba(0,0,0,0.6), var(--bg))) para manter legibilidade do texto. A imagem deve cobrir todo o hero com object-fit: cover.`;
    } else {
      imageInstructions += `\nIMAGEM HERO SUGERIDA: Use esta URL como imagem de fundo do hero com overlay escuro: ${segmentImages.hero}. Aplique overlay: background: linear-gradient(180deg, rgba(bg,0.3) 0%, rgba(bg,0.7) 50%, var(--bg) 100%). Se a imagem não carregar, use gradientes puros.`;
    }

    if (galleryUrls && galleryUrls.length > 0) {
      imageInstructions += `\nFOTOS REAIS DO CLIENTE — Use estas URLs no lugar de placeholders:`;
      galleryUrls.forEach((url: string, i: number) => {
        imageInstructions += `\n  - Foto ${i + 1}: ${url}`;
      });
      imageInstructions += `\nDistribua estas fotos nas seções mais visuais (portfólio, sobre, galeria, depoimentos). Use object-fit: cover e border-radius.`;
      imageInstructions += `\nIMPORTANTE: Priorize SEMPRE as fotos reais do cliente. Só use imagens temáticas para imagens que faltarem.`;
    } else {
      imageInstructions += `\nIMAGENS TEMÁTICAS DO SEGMENTO — Use estas URLs de imagens profissionais para enriquecer o site:`;
      imageInstructions += `\n  - Seção Sobre: ${segmentImages.about}`;
      segmentImages.gallery.forEach((url, i) => {
        imageInstructions += `\n  - Galeria/Portfólio ${i + 1}: ${url}`;
      });
      imageInstructions += `\n  - CTA/Background: ${segmentImages.cta}`;
      imageInstructions += `\nUse object-fit: cover, border-radius, e overlays quando necessário. Se alguma imagem não carregar, use https://placehold.co como fallback com dimensões adequadas.`;
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
- 100% responsivo com @media queries (max-width: 768px) e (max-width: 480px).
- Google Fonts CDN: Inter (300,400,500,600,700,800) corpo + Playfair Display (600,700,800,700italic) títulos.
- scroll-behavior: smooth no html.
- CSS custom properties para TODAS as cores.
- O HTML DEVE ser extenso e completo — CADA seção descrita deve existir. NÃO simplifique, NÃO corte.

CSS RESET OBRIGATÓRIO NO INÍCIO DO <style> (COPIE EXATAMENTE):
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; overflow-x: hidden; }
body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; width: 100%; max-width: 100vw; -webkit-font-smoothing: antialiased; }
img { max-width: 100%; height: auto; display: block; }

REGRAS DE LAYOUT CRÍTICAS (NÃO IGNORE):
- O HEADER fixo DEVE ter z-index: 1000 e height definida (ex: 70px).
- O HERO DEVE ter padding-top de pelo menos 100px (para não ficar atrás do header fixo).
- TODOS os containers devem ter max-width: 1280px, margin: 0 auto, padding: 0 1.5rem.
- NUNCA use width fixo em pixels em textos ou containers — use max-width + width: 100%.
- Títulos: use clamp() para responsividade MAS com limites SEGUROS:
  h1: font-size: clamp(2rem, 5vw, 4rem) — NUNCA mais que 4rem no h1!
  h2: font-size: clamp(1.5rem, 3.5vw, 2.5rem)
  h3: font-size: clamp(1.1rem, 2vw, 1.5rem)
- No @media (max-width: 768px): grids viram 1 coluna, padding reduz, font-sizes diminuem.
- No @media (max-width: 480px): h1 max 1.8rem, h2 max 1.4rem, seções padding 2rem 1rem.
- Imagens de background: SEMPRE use background-size: cover e background-position: center.
- Flexbox/Grid com gap em vez de margin para espaçamento entre items.
- TODAS as seções: width: 100%, overflow: hidden (para evitar scroll horizontal).

PROIBIÇÕES DE LAYOUT:
- NUNCA use font-size maior que 4rem em NENHUM elemento.
- NUNCA use position: absolute em textos grandes sem container com position: relative e overflow: hidden.
- NUNCA use vw para font-size sem clamp() com min e max seguros.
- NUNCA deixe imagens sem max-width: 100%.
- NUNCA use float. Use flexbox ou grid.
- NUNCA coloque SVG icons decorativos sem width e height explícitos.

PALETA DE CORES (:root CSS variables) — VOCÊ DEVE USAR TODAS ESTAS CORES:
--bg: ${selectedPalette.bg};
--accent: ${selectedPalette.accent};          /* COR 1 — Use em: headers de seção, ícones, bordas hover, backgrounds de badges */
--accent-light: ${selectedPalette.accentLight}; /* COR 2 — Use em: gradient text, botões secundários, highlights, underlines */
--accent-gradient: ${selectedPalette.accentGradient}; /* GRADIENTE DAS 3 CORES — Use em: botões CTA, títulos gradient, orbs, backgrounds decorativos */
--text: ${selectedPalette.text};
--muted: ${selectedPalette.muted};
--card-bg: ${selectedPalette.cardBg};

USO OBRIGATÓRIO DAS 3 CORES DA PALETA (CRÍTICO — NÃO IGNORE):
O cliente escolheu esta paleta com 3 cores específicas. As 3 DEVEM aparecer visualmente no site:
1. COR ESCURA (--accent: ${selectedPalette.accent}): backgrounds de cards hover, bordas ativas, ícones de seção, fundos de badges, footer background sutil
2. COR MÉDIA (extraída do gradiente): botões secundários, underlines decorativos, ícones de serviço, separadores, números de contagem
3. COR CLARA (--accent-light: ${selectedPalette.accentLight}): gradient text nos títulos, hover de links, glow de botões, highlights de stats, bordas de inputs focus
4. GRADIENTE COMPLETO (--accent-gradient): botões CTA principais, títulos hero em gradient text, orbs decorativos, badges de destaque, progress bars, botões de formulário
NÃO use cores genéricas como azul (#2563eb) ou branco puro se a paleta é diferente. RESPEITE a paleta 100%.
Cada seção do site deve ter pelo menos 2 das 3 cores da paleta visíveis.

QUALIDADE VISUAL MANDATÓRIA:
- Espaçamento GENEROSO: seções padding clamp(3rem,5vw,5rem) 1.5rem. Gap 1.5rem+ nos grids.
- Tipografia expressiva: h1 clamp(2rem,5vw,3.5rem) weight 800 letter-spacing -0.03em, h2 clamp(1.5rem,3.5vw,2.5rem) weight 700, body 1rem/1.7
- Cards: padding 2rem, border-radius 1rem, border 1px solid rgba(255,255,255,0.06), background var(--card-bg)
- Botões: padding 0.875rem 2rem, border-radius 9999px, font-weight 600, transition 0.3s
- Sombras: 0 15px 40px rgba(0,0,0,0.2) cards, 0 0 30px rgba(accent,0.2) botões
- Hover em TUDO: translateY(-4px), border-color var(--accent), shadow intensifica
- Gradient text: background var(--accent-gradient), -webkit-background-clip: text, -webkit-text-fill-color: transparent
- Badges: background rgba(accent,0.1), color var(--accent-light), padding 0.5rem 1.5rem, border-radius 9999px, font-size 0.8rem, font-weight 600, letter-spacing 0.05em, text-transform uppercase
${imageInstructions}

BACKGROUND TEMÁTICO:
- Analise "${businessName}"${segment ? ` (segmento: ${segment})` : ""} e crie background SVG inline SUTIL do nicho (opacity 0.02-0.05).
- Orbs decorativos no hero (divs blur 100px+, accent gradient, opacity 0.05-0.1, position absolute).

ANIMAÇÕES CSS:
@keyframes fadeInUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-20px) } }

JavaScript obrigatório no final do body (dentro de <script>):
- IntersectionObserver: observa .animate-on-scroll, adiciona class 'visible'. 
- IMPORTANTE: No início do script, verifique todos .animate-on-scroll e se o rect.top < window.innerHeight, adicione 'visible' IMEDIATAMENTE para que o hero e o topo da página não fiquem invisíveis.
- Smooth scroll nos links âncora.
- FAQ accordion toggle.
- Cursor glow sutil (se plano premium).
- Parallax sutil no hero (se plano premium).

PROIBIDO:
- Não use Lorem Ipsum. Crie textos realistas para o nicho "${segment || 'negócio'}".
- Não use placeholder genérico se o cliente enviou fotos reais.
- Não simplifique seções.

ÍCONES: SVG inline (viewBox="0 0 24 24", stroke="currentColor", stroke-width="1.5", fill="none").`;

    let userPrompt: string;

    if (aiMode) {
      // AI MODE: Generate everything from just the segment
      userPrompt = `${planPrompt}

MODO IA AUTOMÁTICO — CRIE TUDO DO ZERO:
O cliente informou APENAS o segmento/ramo do negócio: "${segment || 'Empresa'}".
${businessName ? `Nome sugerido (opcional, pode criar outro melhor): ${businessName}` : ""}
${phone ? `Telefone: ${phone}` : ""}

VOCÊ DEVE INVENTAR TUDO com criatividade profissional:
- Nome fictício criativo e realista para o segmento (brasileiro, memorável, elegante)
- Slogan marcante e profissional
- Descrição completa da empresa (história, valores, diferenciais)
- 4-6 serviços REAIS e ESPECÍFICOS do segmento com descrições detalhadas
- 3-4 depoimentos ULTRA-REALISTAS com nomes brasileiros, mencionando serviços específicos
- Perguntas FAQ relevantes ao segmento
- Dados de contato fictícios mas realistas (endereço em cidade brasileira, email profissional, telefone)
- Horários de funcionamento realistas para o segmento
- Textos de copy persuasivos e profissionais

IMPORTANTE: O resultado deve parecer um site REAL de uma empresa REAL. O cliente deve olhar e pensar "uau, é exatamente assim que meu site deve ser". Não use textos genéricos — mergulhe no universo do segmento "${segment}".

- Plano: ${planKey}
- Paleta: ${colorPalette || "midnight"}

Gere o site HTML completo agora. APENAS código HTML puro, nada mais.`;
    } else {
      // MANUAL MODE: Use client-provided data
      userPrompt = `${planPrompt}

INFORMAÇÕES DO CLIENTE:
- Nome da empresa: ${businessName || "Minha Empresa"}
- Telefone/WhatsApp: ${phone || "(00) 00000-0000"}
${businessInfo.length ? businessInfo.map(i => `- ${i}`).join("\n") : ""}
- Plano: ${planKey}
- Paleta: ${colorPalette || "midnight"}

Gere o site HTML completo agora. APENAS código HTML puro, nada mais.`;
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    let response;
    let usedFallback = false;

    // 1. Tentar com Gemini (sua chave)
    if (GEMINI_API_KEY) {
      const geminiModel = planKey === "essencial" ? "gemini-2.5-flash" : "gemini-2.5-pro";
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GEMINI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: geminiModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            stream: true,
          }),
        });

        if (!response.ok && (response.status === 429 || response.status >= 500)) {
          console.warn(`Gemini API falhou (${response.status}). Tentando fallback para Lovable Cloud AI...`);
          usedFallback = true;
        }
      } catch (err) {
        console.error("Erro na chamada do Gemini:", err);
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }

    // 2. Fallback para Lovable Cloud AI
    if (usedFallback || !response || !response.ok) {
      const lovableModel = planKey === "essencial" ? "google/gemini-2.5-flash" : "google/gemini-2.5-pro";
      response = await fetch(`https://ai.gateway.lovable.dev/v1/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: lovableModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: true,
        }),
      });
    }

    if (!response.ok) {
      const t = await response.text();
      console.error("AI Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar prévia (todos os provedores falharam)." }), {
        status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
