export class PostImageError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
type Options = { apiKey: string; prompt: string; story: boolean; referenceImage?: string; model?: string };
export async function generatePostImage(options: Options): Promise<string> {
  if (!options.apiKey) throw new PostImageError(503, "Configure GEMINI_API_KEY nos segredos do Supabase para gerar imagens.");
  const parts: Array<{text: string} | {inlineData: {mimeType: string; data: string}}> = [{text: options.prompt}];
  if (options.referenceImage) {
    const match = options.referenceImage.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match || match[2].length > 14 * 1024 * 1024) throw new PostImageError(400, "Envie uma referência PNG, JPEG ou WebP de até 10 MB.");
    try {
      if (atob(match[2]).length > 10 * 1024 * 1024) throw new Error();
    } catch { throw new PostImageError(400, "A referência está inválida ou excede 10 MB."); }
    parts.push({inlineData: {mimeType: match[1], data: match[2]}});
  }
  const model = options.model || "gemini-3.1-flash-image";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 80000);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {"Content-Type": "application/json", "x-goog-api-key": options.apiKey},
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{role: "user", parts}],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {aspectRatio: options.story ? "9:16" : "1:1", imageSize: "1K"},
        },
      }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 429) throw new PostImageError(429, "A cota da API Gemini foi atingida. Revise os limites e o faturamento do projeto no Google AI Studio.");
      if ([401, 403].includes(response.status)) throw new PostImageError(503, "Revise a chave Gemini, as permissões e o faturamento do projeto.");
      if (response.status === 404) throw new PostImageError(503, "O modelo Gemini configurado não está disponível. Revise GEMINI_POST_IMAGE_MODEL.");
      if (response.status === 400) {
        const message = typeof data?.error?.message === "string" ? data.error.message : "";
        const reasons = Array.isArray(data?.error?.details) ? data.error.details.map((detail: {reason?: string}) => detail.reason) : [];
        if (reasons.includes("API_KEY_INVALID") || /api key not valid|invalid api key/i.test(message)) {
          throw new PostImageError(503, "A chave Gemini é inválida. Atualize GEMINI_API_KEY nos segredos do ambiente que hospeda esta função.");
        }
        if (/unknown name|invalid json payload|invalid value at|not supported|unsupported/i.test(message)) {
          throw new PostImageError(503, "O Gemini rejeitou os parâmetros da integração. O administrador precisa revisar o modelo e atualizar a função.");
        }
        throw new PostImageError(400, "O Gemini recusou a solicitação (HTTP 400). Isso pode envolver a configuração da API ou os dados enviados.");
      }
      throw new PostImageError(502, "O Gemini está indisponível. Aguarde antes de tentar novamente.");
    }
    const image = data?.candidates?.[0]?.content?.parts?.find(
      (part: {thought?: boolean; inlineData?: {mimeType?: string; data?: string}}) =>
        !part.thought && part.inlineData?.mimeType?.startsWith("image/") && part.inlineData.data
    )?.inlineData;
    if (!image) throw new PostImageError(422, "O Gemini não retornou uma imagem. Reformule o pedido e tente novamente.");
    return `data:${image.mimeType};base64,${image.data}`;
  } catch (error) {
    if (error instanceof PostImageError) throw error;
    if (controller.signal.aborted) throw new PostImageError(504, "O Gemini demorou para responder. A solicitação pode ter sido processada; aguarde antes de tentar novamente.");
    throw new PostImageError(502, "Falha ao conectar com o Gemini. Aguarde antes de tentar novamente.");
  } finally { clearTimeout(timer); }
}
