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

    const imagePrompt = `Crie uma arte de design gráfico profissional para Instagram ${type === "story" ? "no formato story vertical (9:16)" : "no formato feed quadrado (1:1)"} para a agência Brandify (@brandifycoo).

ESTILO VISUAL OBRIGATÓRIO (baseado no feed real da Brandify):
- Fundo: predominantemente PRETO (#0a0a0a) ou gradiente escuro
- Tipografia: fonte sans-serif bold/black moderna, texto grande e impactante em BRANCO, com palavras-chave destacadas em AZUL (#2563eb) ou com efeito de destaque
- Layout: estilo template profissional do Canva Pro, limpo e organizado
- Elementos: mockups de telas de celular/notebook mostrando sites, ícones minimalistas brancos, setas direcionais, linhas geométricas sutis, gradientes escuros
- Marca: incluir @brandifycoo discretamente no canto inferior
- TODO texto DEVE ser em PORTUGUÊS DO BRASIL, sem nenhuma palavra em inglês
- NÃO incluir rostos humanos realistas, mãos, dedos ou fotos de pessoas
- Usar silhuetas, ícones ou formas abstratas no lugar de pessoas
- A arte deve parecer feita por um designer profissional no Canva, NÃO parecer gerada por IA
- Tipografia precisa ser LEGÍVEL, sem distorções ou letras embaralhadas
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
