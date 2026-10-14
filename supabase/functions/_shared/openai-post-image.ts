export class PostImageError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

type Options = { apiKey: string; prompt: string; story: boolean; referenceImage?: string; model?: string };

/** One paid request only; never silently retry or fall back to another provider. */
export async function generatePostImage(options: Options): Promise<string> {
  if (!options.apiKey) throw new PostImageError(503, "A geração de posts com OpenAI ainda não foi configurada. O administrador precisa configurar a chave da API no servidor.");
  const model = options.model || "gpt-image-2.5-sunburst";
  const size = options.story ? "1152x2048" : "1024x1024";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 105000);
  try {
    const headers: Record<string, string> = { Authorization: `Bearer ${options.apiKey}` };
    let body: BodyInit;
    let endpoint = "generations";
    if (options.referenceImage) {
      const match = options.referenceImage.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match || match[2].length > 14 * 1024 * 1024) {
        throw new PostImageError(400, "Envie uma referência PNG, JPEG ou WebP de até 10 MB.");
      }
      let bytes: Uint8Array;
      try { bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0)); }
      catch { throw new PostImageError(400, "A imagem de referência está inválida. Envie o arquivo novamente."); }
      if (bytes.length > 10 * 1024 * 1024) throw new PostImageError(400, "A referência deve ter até 10 MB.");
      const form = new FormData();
      form.set("model", model);
      form.set("prompt", options.prompt);
      form.set("n", "1");
      form.set("size", size);
      form.set("quality", "medium");
      form.set("output_format", "jpeg");
      const imageBuffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(imageBuffer).set(bytes);
      form.set("image", new Blob([imageBuffer], {type: match[1]}), `reference.${match[1].split("/")[1]}`);
      body = form;
      endpoint = "edits";
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({ model, prompt: options.prompt, n: 1, size, quality: "medium", output_format: "jpeg" });
    }
    const response = await fetch(`https://api.openai.com/v1/images/${endpoint}`, { method: "POST", headers, body, signal: controller.signal });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const code = data?.error?.code;
      if (code === "insufficient_quota" || code === "billing_hard_limit_reached") throw new PostImageError(402, "O saldo ou limite de gastos da API OpenAI foi atingido. O administrador precisa revisar o faturamento da API.");
      if (response.status === 429) throw new PostImageError(429, "A geração de imagens está temporariamente limitada pela OpenAI. Aguarde antes de tentar novamente.");
      if ([401, 403].includes(response.status)) throw new PostImageError(503, "A chave da OpenAI ou o acesso ao modelo de imagens precisa ser revisado pelo administrador.");
      if (code === "moderation_blocked" || code === "content_policy_violation") throw new PostImageError(400, "Não foi possível gerar essa imagem. Revise a descrição ou a referência e tente novamente.");
      throw new PostImageError(502, "Não foi possível concluir a geração com a OpenAI. Tente novamente mais tarde.");
    }
    const base64 = data?.data?.[0]?.b64_json;
    if (typeof base64 !== "string" || !base64) throw new PostImageError(502, "A OpenAI não retornou uma imagem. Tente novamente.");
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    if (error instanceof PostImageError) throw error;
    if (controller.signal.aborted) throw new PostImageError(504, "A geração demorou além do esperado. Aguarde antes de tentar novamente; a solicitação anterior pode ter sido processada.");
    throw new PostImageError(502, "Falha de conexão com a geração de imagens. Aguarde antes de tentar novamente.");
  } finally { clearTimeout(timer); }
}
