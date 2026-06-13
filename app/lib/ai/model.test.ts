import { describe, expect, test, vi } from "vitest";
import { xaiModelProvider, resolveModelProvider } from "./model";

describe("xaiModelProvider", () => {
  test("posts an OpenAI-compatible chat request to the xAI base URL", async () => {
    const fakeFetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "pong" } }] }),
    })) as unknown as typeof fetch;

    const provider = xaiModelProvider(
      { provider: "xai", apiKey: "xai-key", model: "grok-4" },
      fakeFetch,
    );
    const out = await provider.complete("ping");

    expect(out).toBe("pong");
    const [url, init] = (fakeFetch as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe("https://api.x.ai/v1/chat/completions");
    expect((init as RequestInit).method).toBe("POST");
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer xai-key");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.model).toBe("grok-4");
    expect(body.messages).toEqual([{ role: "user", content: "ping" }]);
  });

  test("throws on a non-ok response", async () => {
    const fakeFetch = vi.fn(async () => ({
      ok: false,
      status: 401,
      text: async () => "bad key",
    })) as unknown as typeof fetch;
    const provider = xaiModelProvider(
      { provider: "xai", apiKey: "x", model: "grok-4" },
      fakeFetch,
    );
    await expect(provider.complete("hi")).rejects.toThrow(/401/);
  });
});

describe("resolveModelProvider", () => {
  test("throws when no language model is configured", () => {
    expect(() => resolveModelProvider({})).toThrow(/configured/i);
  });

  test("returns an xAI provider when configured for xai", async () => {
    const provider = resolveModelProvider({
      languageModel: { provider: "xai", apiKey: "k", model: "grok-4" },
    });
    expect(typeof provider.complete).toBe("function");
  });

  test("rejects a not-yet-implemented provider", () => {
    expect(() =>
      resolveModelProvider({
        languageModel: { provider: "anthropic", apiKey: "k", model: "x" },
      }),
    ).toThrow(/not implemented/i);
  });
});
