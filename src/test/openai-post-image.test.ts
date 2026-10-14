import { afterEach, describe, expect, it, vi } from "vitest";
import { generatePostImage } from "../../supabase/functions/_shared/openai-post-image";
afterEach(() => vi.unstubAllGlobals());
describe("gerador de posts OpenAI", () => {
  it("exige chave no servidor e não chama provedor sem configuração", async () => {
    const mocked = vi.fn(); vi.stubGlobal("fetch", mocked);
    await expect(generatePostImage({apiKey:"",prompt:"pizza",story:false})).rejects.toMatchObject({status:503});
    expect(mocked).not.toHaveBeenCalled();
  });
  it("gera feed e story mantendo a resposta imageUrl compatível", async () => {
    const mocked = vi.fn().mockResolvedValue(new Response(JSON.stringify({data:[{b64_json:"aW1hZ2U="}]}))); vi.stubGlobal("fetch", mocked);
    expect(await generatePostImage({apiKey:"test-key",prompt:"pizza",story:false})).toBe("data:image/jpeg;base64,aW1hZ2U=");
    expect(mocked.mock.calls[0][0]).toBe("https://api.openai.com/v1/images/generations");
    expect(JSON.parse(mocked.mock.calls[0][1].body)).toMatchObject({n:1,size:"1024x1024",quality:"medium"});
    mocked.mockResolvedValue(new Response(JSON.stringify({data:[{b64_json:"aW1hZ2U="}]})));
    await generatePostImage({apiKey:"test-key",prompt:"pizza",story:true});
    expect(JSON.parse(mocked.mock.calls[1][1].body).size).toBe("1152x2048");
  });
  it("encaminha referências para edição sem buscar URLs externas", async () => {
    const mocked=vi.fn().mockResolvedValue(new Response(JSON.stringify({data:[{b64_json:"aW1hZ2U="}]}))); vi.stubGlobal("fetch",mocked);
    await generatePostImage({apiKey:"test-key",prompt:"editar",story:false,referenceImage:"data:image/png;base64,aW1hZ2U="});
    expect(mocked.mock.calls[0][0]).toBe("https://api.openai.com/v1/images/edits");
    expect(mocked.mock.calls[0][1].body.get("image")).toBeTruthy();
    await expect(generatePostImage({apiKey:"test-key",prompt:"editar",story:false,referenceImage:"https://example.invalid/test.png"})).rejects.toMatchObject({status:400});
    expect(mocked).toHaveBeenCalledTimes(1);
  });
  it("não repete cobranças nem usa Gemini quando a cota acaba", async () => {
    const mocked=vi.fn().mockResolvedValue(new Response(JSON.stringify({error:{code:"insufficient_quota"}}),{status:429})); vi.stubGlobal("fetch",mocked);
    await expect(generatePostImage({apiKey:"test-key",prompt:"pizza",story:false})).rejects.toMatchObject({status:402});
    expect(mocked).toHaveBeenCalledTimes(1);
  });
});
