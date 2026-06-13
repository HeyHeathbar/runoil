import type { AiSettings, TranscriptionConfig } from "./settings";

// One clean interface for every speech-to-text provider. Resolved per-org.
export interface TranscriptionProvider {
  transcribe(audio: Blob, filename: string): Promise<string>;
}

type FetchFn = typeof fetch;

// xAI Grok STT. NOTE: xAI advertises OpenAI-compatible APIs; the exact STT
// contract (model param, response keys) is validated against the live API when
// the audio capture path (Slice 2B) is wired. Isolated here so any tweak is
// one place.
const XAI_STT_URL = "https://api.x.ai/v1/stt";

export function xaiTranscriptionProvider(
  config: TranscriptionConfig,
  fetchImpl: FetchFn = fetch,
): TranscriptionProvider {
  return {
    async transcribe(audio: Blob, filename: string): Promise<string> {
      const form = new FormData();
      form.append("file", audio, filename);
      const res = await fetchImpl(XAI_STT_URL, {
        method: "POST",
        headers: { authorization: `Bearer ${config.apiKey}` },
        body: form,
      });
      if (!res.ok) {
        throw new Error(`xAI STT error ${res.status}: ${await res.text()}`);
      }
      const data = (await res.json()) as { text?: string };
      return data.text ?? "";
    },
  };
}

export function resolveTranscriptionProvider(
  settings: AiSettings,
  fetchImpl?: FetchFn,
): TranscriptionProvider {
  const t = settings.transcription;
  if (!t) {
    throw new Error(
      "No transcription provider is configured for this organization. Set one in Settings → AI.",
    );
  }
  switch (t.provider) {
    case "xai":
      return xaiTranscriptionProvider(t, fetchImpl);
    default:
      throw new Error(`Transcription provider "${t.provider}" is not implemented yet.`);
  }
}
