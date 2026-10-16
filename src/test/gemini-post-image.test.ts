import {afterEach, expect, it, vi} from "vitest";
import {generatePostImage} from "../../supabase/functions/_shared/gemini-post-image";
afterEach(() => vi.unstubAllGlobals());
it("exige chave e valida referência antes da chamada", async () => {
  const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
  await expect(generatePostImage({apiKey:"",prompt:"pizza",story:false})).rejects.toMatchObject({status:503});
  await expect(generatePostImage({apiKey:"test",prompt:"pizza",story:false,referenceImage:"https://example.invalid/x"})).rejects.toMatchObject({status:400});
  expect(fetch).not.toHaveBeenCalled();
});
it("encaminha referência e proporção e ignora imagens de raciocínio", async () => {
  const fetch = vi.fn().mockImplementation(async () => new Response(JSON.stringify({candidates:[{content:{parts:[
    {thought:true,inlineData:{mimeType:"image/png",data:"ignore"}},
    {inlineData:{mimeType:"image/png",data:"aW1hZ2U="}}
  ]}}]}))); vi.stubGlobal("fetch", fetch);
  for (const story of [false,true]) {
    expect(await generatePostImage({apiKey:"test",prompt:"pizza",story,referenceImage:"data:image/png;base64,aW1hZ2U="})).toBe("data:image/png;base64,aW1hZ2U=");
    const [url,request] = fetch.mock.calls.at(-1)!;
    expect(url).toBe("https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-image:generateContent");
    expect(request.headers["x-goog-api-key"]).toBe("test");
    const body=JSON.parse(request.body);
    expect(body.contents[0].parts[1].inlineData.data).toBe("aW1hZ2U=");
    expect(body.generationConfig.imageConfig).toEqual({aspectRatio:story?"9:16":"1:1",imageSize:"1K"});
  }
});
it("preserva erro de cota sem repetir ou chamar outro provedor", async () => {
  const fetch=vi.fn().mockResolvedValue(new Response("{}",{status:429})); vi.stubGlobal("fetch",fetch);
  await expect(generatePostImage({apiKey:"test",prompt:"pizza",story:false})).rejects.toMatchObject({status:429});
  expect(fetch).toHaveBeenCalledTimes(1);
});
it("distingue modelo indisponível e resposta sem imagem", async () => {
  const fetch=vi.fn().mockResolvedValueOnce(new Response("{}",{status:404})).mockResolvedValueOnce(new Response("{}")); vi.stubGlobal("fetch",fetch);
  await expect(generatePostImage({apiKey:"test",prompt:"pizza",story:false})).rejects.toMatchObject({status:503});
  await expect(generatePostImage({apiKey:"test",prompt:"pizza",story:false})).rejects.toMatchObject({status:422});
});

it("distingue chave inválida e parâmetros incompatíveis de problemas no conteúdo", async () => {
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({error:{message:"API key not valid"}}),{status:400}))
    .mockResolvedValueOnce(new Response(JSON.stringify({error:{message:'Invalid JSON payload received. Unknown name "responseFormat".'}}),{status:400}));
  vi.stubGlobal("fetch", fetch);
  await expect(generatePostImage({apiKey:"test",prompt:"pizza",story:false})).rejects.toMatchObject({status:503, message:expect.stringContaining("chave Gemini é inválida")});
  await expect(generatePostImage({apiKey:"test",prompt:"pizza",story:false})).rejects.toMatchObject({status:503, message:expect.stringContaining("parâmetros da integração")});
  expect(fetch).toHaveBeenCalledTimes(2);
});
