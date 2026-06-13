// Per-org AI provider configuration (the model-agnostic layer, spec B16/B9).
// Every agent API is org-configurable — no global provider keys.

export type LanguageProvider = "xai" | "anthropic" | "openai";
export type TranscriptionProviderId = "xai" | "openai" | "deepgram";

export interface LanguageModelConfig {
  provider: LanguageProvider;
  apiKey: string;
  model: string; // e.g. "grok-4"
}

export interface TranscriptionConfig {
  provider: TranscriptionProviderId;
  apiKey: string;
}

export interface AiSettings {
  languageModel?: LanguageModelConfig;
  transcription?: TranscriptionConfig;
}

// Client-safe view: never includes API keys, just whether each is configured
// and the non-secret choices.
export interface RedactedAiSettings {
  languageModel?: { provider: LanguageProvider; model: string; configured: true };
  transcription?: { provider: TranscriptionProviderId; configured: true };
}

export function redactAiSettings(settings: AiSettings): RedactedAiSettings {
  const out: RedactedAiSettings = {};
  if (settings.languageModel) {
    out.languageModel = {
      provider: settings.languageModel.provider,
      model: settings.languageModel.model,
      configured: true,
    };
  }
  if (settings.transcription) {
    out.transcription = {
      provider: settings.transcription.provider,
      configured: true,
    };
  }
  return out;
}

// Default provider choices for a new org (Grok-first).
export const DEFAULT_LANGUAGE_MODEL = "grok-4";
export const DEFAULT_LANGUAGE_PROVIDER: LanguageProvider = "xai";
export const DEFAULT_TRANSCRIPTION_PROVIDER: TranscriptionProviderId = "xai";
