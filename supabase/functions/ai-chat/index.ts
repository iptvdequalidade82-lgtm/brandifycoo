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

function normalizeContentText(content: unknown): string {
  if (isNonEmptyString(content)) return content.trim();
  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (!part || typeof part !== 'object') return '';
        const p = part as Record<string, unknown>;
        if (p.type === 'text' && isNonEmptyString(p.text)) return p.text.trim();
        return '';
      })
      .filter(Boolean)
      .join('\n')
      .trim();
    return text;
  }
  return '';
}

function normalizeProvider(raw: unknown): Provider | null {
  if (!isNonEmptyString(raw)) return null;
  const key = raw.trim().toLowerCase();
  return PROVIDER_ALIASES[key] ?? null;
}

function normalizeModel(raw: unknown): string | undefined {
  if (!isNonEmptyString(raw)) return undefined;
  const trimmed = raw.trim();
  const lowered = trimmed.toLowerCase();

  if (
    lowered === 'auto' ||
    lowered === 'default' ||
    lowered === 'gemini' ||
    lowered === 'gpt' ||
    lowered === 'chatgpt' ||
    lowered === 'openai'
  ) {
    return undefined;
  }

  if (lowered.startsWith('google/')) return trimmed.slice(7);
  if (lowered.startsWith('openai/')) return trimmed.slice(7);

  return trimmed;
}

function normalizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];

  const output: ChatMessage[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;

    const roleRaw = (item as Record<string, unknown>).role;
    const contentRaw = (item as Record<string, unknown>).content;
    const normalizedContent = normalizeContentText(contentRaw);

    if (!isNonEmptyString(roleRaw) || !isNonEmptyString(normalizedContent)) continue;

    const role = roleRaw.trim().toLowerCase();
    if (role !== 'system' && role !== 'user' && role !== 'assistant') continue;

    output.push({
      role: role as ChatRole,
      content: normalizedContent,
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

function extractMessage(
  body: Record<string, unknown>,
  history: ChatMessage[],
  rawMessages?: unknown,
): string {
  const direct = [body.message, body.prompt, body.input].find(isNonEmptyString);
  if (direct) return direct.trim();

  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i].role === 'user' && history[i].content.trim()) {
      return history[i].content.trim();
    }
  }

  if (Array.isArray(rawMessages)) {
    for (let i = rawMessages.length - 1; i >= 0; i -= 1) {
      const item = rawMessages[i] as Record<string, unknown> | undefined;
      if (!item || typeof item !== 'object') continue;
      const roleRaw = item.role;
      if (!isNonEmptyString(roleRaw) || roleRaw.trim().toLowerCase() !== 'user') continue;
      const contentText = normalizeContentText(item.content);
      if (contentText.trim()) return contentText.trim();
    }
  }

  return '';
}

function extractReferenceImage(body: Record<string, unknown>, rawMessages?: unknown): string | undefined {
  const direct = [body.referenceImage, body.image, body.imageUrl].find(isNonEmptyString);
  if (direct) return direct.trim();

  if (Array.isArray(rawMessages)) {
    for (let i = rawMessages.length - 1; i >= 0; i -= 1) {
      const item = rawMessages[i] as Record<string, unknown> | undefined;
      if (!item || typeof item !== 'object') continue;
      const roleRaw = item.role;
      if (!isNonEmptyString(roleRaw) || roleRaw.trim().toLowerCase() !== 'user') continue;
      const content = item.content;
      if (!Array.isArray(content)) continue;
      for (const part of content) {
        if (!part || typeof part !== 'object') continue;
        const p = part as Record<string, unknown>;
        if (p.type !== 'image_url') continue;
        const imageUrl = (p.image_url as Record<string, unknown> | undefined)?.url;
        if (isNonEmptyString(imageUrl)) return imageUrl.trim();
      }
    }
  }

  return undefined;
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

async function streamChatGPT(params: {
  message: string;
  history: ChatMessage[];
  systemPrompt: string;
  model?: string;
  temperature: number;
}): Promise<Response> {
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
      stream: true,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(`UPSTREAM_OPENAI:${response.status}:${JSON.stringify(data).slice(0, 400)}`);
  }

  return new Response(response.body, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'X-Model-Used': model,
    },
  });
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

async function streamGemini(params: {
  message: string;
  history: ChatMessage[];
  systemPrompt: string;
  model?: string;
  temperature: number;
}): Promise<Response> {
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

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(`UPSTREAM_GEMINI:${response.status}:${JSON.stringify(data).slice(0, 400)}`);
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') continue;
          try {
            const parsed = JSON.parse(json);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const chunk = JSON.stringify({ choices: [{ delta: { content: text } }] });
              await writer.write(encoder.encode(`data: ${chunk}\n\n`));
            }
          } catch {
            // ignore partial json
          }
        }
      }
      await writer.write(encoder.encode('data: [DONE]\n\n'));
    } catch (err) {
      console.error('Gemini stream transform error:', err);
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'X-Model-Used': model,
    },
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateGeminiImage(params: {
  prompt: string;
  referenceImage?: string;
}): Promise<{ imageUrl: string; model: string }> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('MISSING_KEY:GEMINI_API_KEY');
  }

  const models = ['gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview', 'gemini-2.5-flash-image'];
  const parts: Array<Record<string, unknown>> = [{ text: params.prompt.trim() }];

  if (isNonEmptyString(params.referenceImage)) {
    const match = params.referenceImage.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
  }

  let sawRateLimit = false;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
          }),
        });

        if (response.status === 429) {
          sawRateLimit = true;
          if (attempt < 2) {
            await sleep(1200 * attempt);
            continue;
          }
          break;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Gemini image error:', response.status, errorText.slice(0, 300));
          break;
        }

        const data = await response.json();
        const responseParts = data.candidates?.[0]?.content?.parts;
        if (Array.isArray(responseParts)) {
          for (const part of responseParts) {
            if (part?.inlineData?.mimeType?.startsWith('image/')) {
              return {
                imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                model,
              };
            }
          }
        }
      } catch (err) {
        console.error('Gemini image exception:', err);
        if (attempt < 2) {
          await sleep(1200 * attempt);
          continue;
        }
      }
    }
  }

  if (sawRateLimit) {
    throw new Error('UPSTREAM_GEMINI:429:Rate limit');
  }

  throw new Error('EMPTY_PROVIDER_RESPONSE:gemini-image');
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

    const model = normalizeModel(body.model);
    const modelAliasProvider = normalizeProvider(body.model);
    const inferredProvider: Provider = model?.toLowerCase().startsWith('gpt') ? 'chatgpt' : 'gemini';
    const provider: Provider = normalizedRequestedProvider ?? modelAliasProvider ?? inferredProvider;
    const rawMessages = body.messages ?? body.history ?? body.conversation;
    const history = normalizeMessages(rawMessages);
    const wantsImage = Boolean(body.generateImage || body.imageMode);
    let message = extractMessage(body, history, rawMessages);
    if (wantsImage && !isNonEmptyString(message)) {
      message = 'Edite a imagem de forma profissional, mantendo a identidade visual e melhorando a qualidade.';
    }

    if (!isNonEmptyString(message)) {
      return jsonResponse({ ok: false, error: 'Mensagem vazia.' }, 400);
    }

    const systemPrompt = isNonEmptyString(body.systemPrompt)
      ? body.systemPrompt.trim()
      : 'Você é um assistente útil, objetivo e confiável. Responda em português do Brasil.';

    const temperature = clampTemperature(body.temperature);

    if (wantsImage) {
      const referenceImage = extractReferenceImage(body, rawMessages);
      const imageResult = await generateGeminiImage({
        prompt: message,
        referenceImage,
      });

      return jsonResponse({
        ok: true,
        provider: 'gemini',
        model: imageResult.model,
        imageUrl: imageResult.imageUrl,
        content: 'Imagem gerada com sucesso.',
        allowed_providers: ['gemini', 'chatgpt'],
      });
    }

    const useStream = body.stream !== false;

    if (!useStream) {
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
    }

    return provider === 'chatgpt'
      ? await streamChatGPT({ message, history, systemPrompt, model, temperature })
      : await streamGemini({ message, history, systemPrompt, model, temperature });
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
