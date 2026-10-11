/** Retry transient failures without multiplying requests after a quota failure. */
export async function aiFetch(url: string, init: RequestInit, timeoutMs = 25000): Promise<Response> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    init.signal?.addEventListener("abort", abort, { once: true });
    if (init.signal?.aborted) controller.abort();
    const timer = setTimeout(abort, timeoutMs);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if ([500, 502, 503, 504].includes(response.status) && attempt === 0) {
        await response.body?.cancel();
      } else {
        return response;
      }
    } catch (error) {
      if (init.signal?.aborted || attempt === 1) throw error;
    } finally {
      clearTimeout(timer);
      init.signal?.removeEventListener("abort", abort);
    }
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  throw new Error("Serviço de IA indisponível. Tente novamente mais tarde.");
}

export class AIServiceError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function requireAIResponse(response: Response): Promise<void> {
  if (response.ok) return;
  if (response.status === 429) throw new AIServiceError(429, "O provedor de IA atingiu seu limite de uso. Tente novamente mais tarde. Se persistir, é necessário revisar a cota e o faturamento da API.");
  if ([401, 403].includes(response.status)) throw new AIServiceError(503, "A integração de IA precisa de revisão de credenciais ou permissões pelo administrador.");
  throw new AIServiceError(503, "O serviço de IA está temporariamente indisponível. Tente novamente mais tarde.");
}
