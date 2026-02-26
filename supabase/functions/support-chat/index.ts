import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o assistente de suporte da Brandify, uma agência de criação de sites e marketing digital.

REGRAS:
- Responda SEMPRE em português brasileiro, de forma amigável e profissional.
- Seja conciso (máximo 3 parágrafos).
- Se não souber a resposta, diga que vai encaminhar para a equipe humana.
- NUNCA invente informações sobre preços ou funcionalidades que não estejam listadas abaixo.

INFORMAÇÕES DA BRANDIFY:

**Planos de Sites:**
- Essencial: R$497 (landing page simples, responsivo, formulário de contato)
- Profissional: R$997 (até 5 páginas, SEO otimizado, integração WhatsApp, formulários)
- Premium: R$1.997 (site completo, painel admin, blog, chat ao vivo, analytics)

**IA Studio (ferramenta de posts para Instagram):**
- Gratuito: 5 criações por dia (copy + imagem)
- Plano Pro: R$39,90/mês (criações ilimitadas, todos os modelos de IA, sem marca d'água)
- O IA Studio gera textos e imagens profissionais para Instagram usando inteligência artificial

**Dúvidas Frequentes:**
- "Só tenho 5 chances grátis?" → Sim, o plano gratuito oferece 5 criações/dia. Para uso ilimitado, assine o Plano Pro por R$39,90/mês.
- "Tem desconto?" → Os preços já são competitivos, mas para pacotes especiais ou projetos maiores, fale com nossa equipe pelo WhatsApp (43) 99106-5129.
- "Posso cancelar?" → Sim, o Plano Pro pode ser cancelado a qualquer momento sem multa.
- "Como funciona a geração de imagem?" → Você descreve o que quer, a IA cria o texto e a imagem profissional. Pode escolher formato Feed (1080x1080) ou Stories (1080x1920).
- "Aceita Pix?" → Sim! Aceitamos Pix, cartão de crédito e boleto.
- "Quanto tempo pra fazer um site?" → Em média 5-15 dias úteis dependendo do plano e complexidade.
- "Posso ver uma prévia antes?" → Sim! Geramos uma prévia gratuita do seu site antes de contratar.

**Contato:**
- WhatsApp: (43) 99106-5129
- Email: contato@brandifyco.com

Se o usuário tiver um problema técnico (bug, erro, funcionalidade não funcionando), peça detalhes sobre o que aconteceu e ofereça para criar um ticket de suporte.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { messages } = await req.json();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...(messages || []).slice(-10),
        ],
        stream: true,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Muitas solicitações. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Serviço temporariamente indisponível." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("Support chat error:", response.status, t.slice(0, 300));
      throw new Error("Erro no serviço de IA");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("support-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
