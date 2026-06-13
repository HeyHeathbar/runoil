import { describe, expect, test, vi } from "vitest";
import {
  xaiTranscriptionProvider,
  resolveTranscriptionProvider,
} from "./transcription";

describe("xaiTranscriptionProvider", () => {
  test("posts multipart audio to the xAI STT endpoint and returns the text", async () => {
    const fakeFetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ text: "hello world" }),
    })) as unknown as typeof fetch;

    const provider = xaiTranscriptionProvider(
      { provider: "xai", apiKey: "xai-key" },
      fakeFetch,
    );
    const out = await provider.transcribe(
      new Blob([new Uint8Array([1, 2, 3])], { type: "audio/mpeg" }),
      "meeting.mp3",
    );

    expect(out).toBe("hello world");
    const [url, init] = (fakeFetch as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe("https://api.x.ai/v1/stt");
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer xai-key");
    const body = (init as RequestInit).body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("file")).toBeInstanceOf(Blob);
  });

  test("throws on a non-ok response", async () => {
    const fakeFetch = vi.fn(async () => ({
      ok: false,
      status: 401,
      text: async () => "bad key",
    })) as unknown as typeof fetch;
    const provider = xaiTranscriptionProvider(
      { provider: "xai", apiKey: "x" },
      fakeFetch,
    );
    await expect(
      provider.transcribe(new Blob(["x"]), "a.mp3"),
    ).rejects.toThrow(/401/);
  });
});

describe("resolveTranscriptionProvider", () => {
  test("throws when transcription is not configured", () => {
    expect(() => resolveTranscriptionProvider({})).toThrow(/configured/i);
  });

  test("returns an xAI provider when configured for xai", () => {
    const provider = resolveTranscriptionProvider({
      transcription: { provider: "xai", apiKey: "k" },
    });
    expect(typeof provider.transcribe).toBe("function");
  });
});
