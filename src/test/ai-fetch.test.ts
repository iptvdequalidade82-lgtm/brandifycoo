import { afterEach, describe, expect, it, vi } from "vitest";
import { aiFetch, requireAIResponse } from "../../supabase/functions/_shared/ai-fetch";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe("resiliência da API", () => {
  it("recupera uma falha transitória 503", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockResolvedValueOnce(new Response("", {status:503})).mockResolvedValueOnce(new Response("ok"));
    vi.stubGlobal("fetch", fetch);
    const pending = aiFetch("https://example.invalid", {});
    await vi.runAllTimersAsync();
    expect((await pending).status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("não repete requisições que esgotaram a cota", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("", {status:429}));
    vi.stubGlobal("fetch", fetch);
    const response = await aiFetch("https://example.invalid", {});
    expect(fetch).toHaveBeenCalledTimes(1);
    await expect(requireAIResponse(response)).rejects.toMatchObject({status:429});
  });
  it("preserva o bloqueio de credenciais sem expor detalhes do provedor", async () => {
    await expect(requireAIResponse(new Response("secret", {status:401}))).rejects.toMatchObject({status:503});
  });
});
