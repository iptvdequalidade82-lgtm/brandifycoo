import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const planPrompts: Record<string, string> = {
  essencial: `Crie um site de 6 páginas (Home, Sobre, Serviços, Galeria, Contato, FAQ). 
Design limpo e responsivo. Use as cores e informações fornecidas pelo cliente.
Inclua seções básicas: hero com título, sobre a empresa, lista de serviços, formulário de contato.`,

  profissional: `Crie um site de 10 páginas (Home, Sobre, Serviços, Portfólio, Blog, Depoimentos, Equipe, Preços, Contato, FAQ).
Design premium e personalizado com animações suaves. Use as cores e informações fornecidas.
Inclua: hero impactante, seção sobre com timeline, galeria de portfólio, depoimentos em carrossel, blog preview, formulário avançado.`,

  premium: `Crie um site completo e exclusivo com páginas ilimitadas (Home, Sobre, Serviços, Portfólio, Blog, Depoimentos, Equipe, Preços, Contato, FAQ, Área do Cliente, Integrações).
Design exclusivo do zero com animações sofisticadas, efeitos parallax e microinterações.
Inclua: hero cinematográfico, seções interativas, painel administrativo simulado, integrações visuais, blog completo, área de membros.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan, businessName, phone, logoUrl } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const planKey = (plan || "essencial").toLowerCase();
    const planPrompt = planPrompts[planKey] || planPrompts.essencial;

    const systemPrompt = `Você é um gerador de sites HTML. Retorne APENAS código HTML completo (com CSS inline e responsivo) sem explicações, sem markdown, sem blocos de código. 
O HTML deve ser um documento completo com <!DOCTYPE html>, <html>, <head> com meta viewport, e <body>.
Use um design moderno, escuro (fundo #0a0a0a), com detalhes em azul (#2563eb) e branco.
Use Google Fonts (Inter para corpo, Playfair Display para títulos) via CDN.
Todas as imagens devem usar https://placehold.co com tamanhos apropriados.
O site deve ser totalmente responsivo e visualmente impressionante.
${logoUrl ? `Se o cliente enviou um logo, use esta URL para o logo: ${logoUrl}` : 'Crie um logo usando as iniciais do nome da empresa em um círculo estilizado com CSS.'}
Inclua animações CSS (fade-in, slide-up) usando @keyframes.
Use ícones via Lucide CDN ou crie com CSS/SVG inline.`;

    const userPrompt = `${planPrompt}

Informações do cliente:
- Nome da empresa: ${businessName || "Minha Empresa"}
- Telefone/WhatsApp: ${phone || "Não informado"}
- Plano escolhido: ${planKey}

Gere o site HTML completo agora. Lembre-se: retorne APENAS o código HTML, sem nenhum texto antes ou depois.`;

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
