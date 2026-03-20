const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Provider = 'gemini' | 'chatgpt';
type ChatRole = 'system' | 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const PROVIDER_ALIASES: Record<string, Provider> = {
  gemini: 'gemini',
  google: 'gemini',
  chatgpt: 'chatgpt',
  openai: 'chatgpt',
  gpt: 'chatgpt',
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeProvider(raw: unknown): Provider | null {
  if (!isNonEmptyString(raw)) return null;
  const key = raw.trim().toLowerCase();
  return PROVIDER_ALIASES[key] ?? null;
}

function normalizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];

  const output: ChatMessage[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;

    const roleRaw = (item as Record<string, unknown>).role;
    const contentRaw = (item as Record<string, unknown>).content;

    if (!isNonEmptyString(roleRaw) || !isNonEmptyString(contentRaw)) continue;

    const role = roleRaw.trim().toLowerCase();
    if (role !== 'system' && role !== 'user' && role !== 'assistant') continue;

    output.push({
      role: role as ChatRole,
      content: contentRaw.trim(),
    });
  }

  return output;
}

function clampTemperature(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0.7;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function extractMessage(body: Record<string, unknown>, history: ChatMessage[]): string {
  const direct = [body.message, body.prompt, body.input].find(isNonEmptyString);
  if (direct) return direct.trim();

  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i].role === 'user' && history[i].content.trim()) {
      return history[i].content.trim();
    }
  }

  return '';
}

async function callChatGPT(params: {
  message: string;
  history: ChatMessage[];
  systemPrompt: string;
  model?: string;
  temperature: number;
}): Promise<{ text: string; model: string }> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('MISSING_KEY:OPENAI_API_KEY');
  }

  const model = isNonEmptyString(params.model) ? params.model : 'gpt-4o-mini';

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  if (isNonEmptyString(params.systemPrompt)) {
    messages.push({ role: 'system', content: params.systemPrompt.trim() });
  }

  for (const msg of params.history) {
    if (msg.role === 'system') continue;
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    });
  }

  const hasSameLastUserMessage =
    messages.length > 0 &&
    messages[messages.length - 1].role === 'user' &&
    messages[messages.length - 1].content.trim() === params.message.trim();

  if (!hasSameLastUserMessage) {
    messages.push({ role: 'user', content: params.message.trim() });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: params.temperature,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`UPSTREAM_OPENAI:${response.status}:${JSON.stringify(data).slice(0, 400)}`);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!isNonEmptyString(text)) {
    throw new Error('EMPTY_PROVIDER_RESPONSE:chatgpt');
  }

  return {
    text: text.trim(),
    model,
  };
}

async function callGemini(params: {
  message: string;
  history: ChatMessage[];
  systemPrompt: string;
  model?: string;
  temperature: number;
}): Promise<{ text: string; model: string }> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('MISSING_KEY:GEMINI_API_KEY');
  }

  const model = isNonEmptyString(params.model) ? params.model : 'gemini-1.5-flash';

  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of params.history) {
    if (msg.role === 'system') continue;
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  const last = contents[contents.length - 1];
  const isDuplicateLastUser =
    last?.role === 'user' &&
    Array.isArray(last.parts) &&
    last.parts[0]?.text?.trim?.() === params.message.trim();

  if (!isDuplicateLastUser) {
    contents.push({
      role: 'user',
      parts: [{ text: params.message.trim() }],
    });
  }

  const payload: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: params.temperature,
    },
  };

  if (isNonEmptyString(params.systemPrompt)) {
    payload.system_instruction = {
      parts: [{ text: params.systemPrompt.trim() }],
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`UPSTREAM_GEMINI:${response.status}:${JSON.stringify(data).slice(0, 400)}`);
  }

  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts
        .map((p: Record<string, unknown>) => (typeof p?.text === 'string' ? p.text : ''))
        .filter(Boolean)
        .join('\n')
        .trim()
    : '';

  if (!isNonEmptyString(text)) {
    throw new Error('EMPTY_PROVIDER_RESPONSE:gemini');
  }

  return {
    text,
    model,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Método não permitido.' }, 405);
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;

    const requestedProvider = body.provider ?? body.aiProvider ?? body.ai_provider;
    const normalizedRequestedProvider = normalizeProvider(requestedProvider);

    if (requestedProvider !== undefined && normalizedRequestedProvider === null) {
      return jsonResponse(
        {
          ok: false,
          error: 'Provider inválido. Use somente gemini ou chatgpt.',
          allowed_providers: ['gemini', 'chatgpt'],
        },
        400,
      );
    }

    const provider: Provider = normalizedRequestedProvider ?? 'gemini';
    const history = normalizeMessages(body.messages ?? body.history ?? body.conversation);
    const message = extractMessage(body, history);

    if (!isNonEmptyString(message)) {
      return jsonResponse({ ok: false, error: 'Mensagem vazia.' }, 400);
    }

    const systemPrompt = isNonEmptyString(body.systemPrompt)
      ? body.systemPrompt.trim()
      : 'Você é um assistente útil, objetivo e confiável. Responda em português do Brasil.';

    const temperature = clampTemperature(body.temperature);
    const model = isNonEmptyString(body.model) ? body.model.trim() : undefined;

    const result =
      provider === 'chatgpt'
        ? await callChatGPT({ message, history, systemPrompt, model, temperature })
        : await callGemini({ message, history, systemPrompt, model, temperature });

    return jsonResponse({
      ok: true,
      provider,
      model: result.model,
      reply: result.text,
      response: result.text,
      text: result.text,
      message: result.text,
      allowed_providers: ['gemini', 'chatgpt'],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado';

    if (message.startsWith('MISSING_KEY:')) {
      const missingKey = message.split(':')[1] || 'API_KEY';
      return jsonResponse(
        {
          ok: false,
          error: 'Chave de API não configurada no Supabase.',
          details: `Configure o secret ${missingKey}.`,
          allowed_providers: ['gemini', 'chatgpt'],
        },
        503,
      );
    }

    if (message.startsWith('UPSTREAM_OPENAI:') || message.startsWith('UPSTREAM_GEMINI:')) {
      return jsonResponse(
        {
          ok: false,
          error: 'Falha no provedor de IA.',
          details: message,
          allowed_providers: ['gemini', 'chatgpt'],
        },
        502,
      );
    }

    return jsonResponse(
      {
        ok: false,
        error: 'Falha ao processar solicitação de IA.',
        details: message,
        allowed_providers: ['gemini', 'chatgpt'],
      },
      500,
    );
  }
});
