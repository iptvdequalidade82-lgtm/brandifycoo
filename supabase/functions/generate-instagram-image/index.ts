import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, type } = await req.json(); // type: "feed" | "story"

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aspectRatio = type === "story" ? "9:16" : "1:1";
    const dimensions = type === "story" ? "1080x1920" : "1080x1080";

    // Randomize layout style for variety
    const layoutStyles = [
      "layout com mockup de site em tela de notebook centralizado, texto acima e abaixo do mockup",
      "layout minimalista com frase de impacto gigante ocupando 70% da arte, ícone pequeno abaixo",
      "layout dividido em dois blocos: texto à esquerda, mockup de celular à direita",
      "layout com fundo de gradiente escuro sutil (preto para azul marinho #1E3A8A muito escuro), texto centralizado com destaque em azul",
      "layout tipo cartão escuro com borda fina azul (#2563eb), texto centralizado, ícone no topo",
      "layout com mockup de celular mostrando um site, sobreposto sobre fundo preto com linhas geométricas sutis",
      "layout estilo slide de apresentação: título bold no topo, subtexto menor embaixo, separados por linha azul fina",
      "layout assimétrico: texto grande alinhado à esquerda, elementos gráficos abstratos (setas, círculos) à direita em azul",
    ];
    const randomLayout = layoutStyles[Math.floor(Math.random() * layoutStyles.length)];

    const imagePrompt = `Crie uma arte de design gráfico profissional para Instagram ${type === "story" ? "no formato story vertical (9:16)" : "no formato feed quadrado (1:1)"} para a agência Brandify.

PALETA DE CORES ESTRITA — USE APENAS ESTAS CORES:
- Fundo: PRETO PURO (#000000) ou preto muito escuro (#0a0a0a)
- Texto principal: BRANCO puro (#FFFFFF)
- Cor de destaque/acento: AZUL ROYAL (#2563EB) — usar em palavras-chave, ícones de destaque, linhas decorativas
- Cor secundária (opcional, sutil): azul marinho escuro (#1E3A8A) — apenas para gradientes sutis ou sombras
- PROIBIDO usar: vermelho, verde, amarelo, laranja, rosa, roxo, ou qualquer cor vibrante fora do azul
- O resultado final deve ser predominantemente PRETO com detalhes em BRANCO e AZUL, visual sóbrio e premium

LOGO DA BRANDIFY — INCLUIR OBRIGATORIAMENTE:
- No canto superior direito OU inferior direito da arte
- A logo é composta por: o símbolo ">>" (duas setas/chevrons) em azul (#2563eb) seguido do texto "brandify" em branco, fonte sans-serif moderna
- Tamanho pequeno/discreto mas legível
- Abaixo ou ao lado da logo, incluir "@brandifycoo" em texto branco/cinza pequeno

LAYOUT DESTA ARTE: ${randomLayout}

REGRAS DE QUALIDADE:
- Estilo: template profissional do Canva Pro, NÃO parecer gerado por IA
- Tipografia: fonte sans-serif bold/black, texto LEGÍVEL sem distorções
- TODO texto em PORTUGUÊS DO BRASIL, zero palavras em inglês
- NÃO incluir rostos humanos, mãos, dedos ou fotos de pessoas — use silhuetas, ícones ou formas abstratas
- Elementos gráficos: mockups de telas, ícones minimalistas, setas, linhas geométricas
- Resolução: ${dimensions}

CONTEÚDO DA ARTE: ${prompt}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [{ role: "user", content: imagePrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Image generation error:", response.status, t);
      throw new Error("Erro ao gerar imagem");
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("Nenhuma imagem foi gerada");
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
