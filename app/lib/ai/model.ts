import type { AiSettings, LanguageModelConfig } from "./settings";

// One clean interface for every language model (spec B16). Implementations are
// resolved per-org from settings; callers never know the provider.
export interface ModelProvider {
  complete(prompt: string): Promise<string>;
}

type FetchFn = typeof fetch;

// xAI Grok via its OpenAI-compatible chat completions endpoint.
export function xaiModelProvider(
  config: LanguageModelConfig,
  fetchImpl: FetchFn = fetch,
): ModelProvider {
  return {
    async complete(prompt: string): Promise<string> {
      const res = await fetchImpl("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        throw new Error(`xAI chat error ${res.status}: ${await res.text()}`);
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return data.choices?.[0]?.message?.content ?? "";
    },
  };
}

export function resolveModelProvider(
  settings: AiSettings,
  fetchImpl?: FetchFn,
): ModelProvider {
  const lm = settings.languageModel;
  if (!lm) {
    throw new Error(
      "No language model is configured for this organization. Set one in Settings → AI.",
    );
  }
  switch (lm.provider) {
    case "xai":
      return xaiModelProvider(lm, fetchImpl);
    default:
      throw new Error(`Language provider "${lm.provider}" is not implemented yet.`);
  }
}
