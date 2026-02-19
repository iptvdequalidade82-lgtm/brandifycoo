import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, type } = await req.json(); // type: "feed" | "story"

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!GEMINI_API_KEY && !LOVABLE_API_KEY) throw new Error("No API key configured");

    const aspectRatio = type === "story" ? "9:16" : "1:1";
    const dimensions = type === "story" ? "1080x1920" : "1080x1080";

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

    let imageUrl: string | undefined;

    // Provider 1: Gemini native API with image generation
    if (GEMINI_API_KEY && !imageUrl) {
      // Try multiple model names for image generation
      const modelCandidates = [
        "gemini-2.5-flash-preview-image-generation",
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash-preview-image-generation",
      ];
      for (const modelName of modelCandidates) {
        if (imageUrl) break;
        try {
          console.log(`Trying Gemini model: ${modelName}`);
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
          const res = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: imagePrompt }] }],
              generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
            }),
          });
          if (res.status === 429) {
            return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (res.ok) {
            const data = await res.json();
            const parts = data.candidates?.[0]?.content?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.mimeType?.startsWith("image/")) {
                  imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                  console.log(`Model ${modelName} succeeded`);
                  break;
                }
              }
            }
            if (imageUrl) break;
          } else {
            const t = await res.text();
            console.error(`Model ${modelName} failed:`, res.status, t.slice(0, 200));
          }
        } catch (e) {
          console.error(`Model ${modelName} threw:`, e);
        }
      }
    }

    // Provider 2: Lovable AI Gateway (fallback) - try multiple models
    const gatewayModels = ["google/gemini-2.5-flash-image", "google/gemini-3-pro-image-preview"];
    if (LOVABLE_API_KEY && !imageUrl) {
      for (const gwModel of gatewayModels) {
        if (imageUrl) break;
        try {
          console.log(`Trying Lovable gateway model: ${gwModel}`);
          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: gwModel,
              messages: [{ role: "user", content: imagePrompt }],
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
          if (imageUrl) { console.log(`Gateway model ${gwModel} succeeded`); break; }
          else console.error(`Gateway model ${gwModel} returned no image`);
        } else {
          const t = await res.text();
          console.error(`Gateway model ${gwModel} failed:`, res.status, t.slice(0, 200));
        }
        } catch (e) {
          console.error(`Gateway model ${gwModel} threw:`, e);
        }
      }
    }

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
