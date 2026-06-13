import { describe, expect, test, beforeEach } from "vitest";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { redactAiSettings } from "./settings";
import { createAiSettingsStore } from "./settings.server";

const ORG = "org_ai";

let root: string;
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "runoil-ai-"));
});

describe("redactAiSettings", () => {
  test("drops API keys, keeps non-secret choices + configured flags", () => {
    const redacted = redactAiSettings({
      languageModel: { provider: "xai", apiKey: "xai-secret", model: "grok-4" },
      transcription: { provider: "xai", apiKey: "xai-secret" },
    });
    expect(redacted).toEqual({
      languageModel: { provider: "xai", model: "grok-4", configured: true },
      transcription: { provider: "xai", configured: true },
    });
    expect(JSON.stringify(redacted)).not.toContain("xai-secret");
  });
});

describe("createAiSettingsStore", () => {
  test("returns empty settings for an unconfigured org", async () => {
    const store = createAiSettingsStore(root);
    expect(await store.get(ORG)).toEqual({});
  });

  test("round-trips provider config (including keys) through disk", async () => {
    const store = createAiSettingsStore(root);
    const settings = {
      languageModel: { provider: "xai" as const, apiKey: "k1", model: "grok-4" },
      transcription: { provider: "xai" as const, apiKey: "k2" },
    };
    await store.save(ORG, settings);
    expect(await store.get(ORG)).toEqual(settings);
  });

  test("keeps each org's settings isolated", async () => {
    const store = createAiSettingsStore(root);
    await store.save("org_a", {
      languageModel: { provider: "xai", apiKey: "ka", model: "grok-4" },
    });
    expect(await store.get("org_b")).toEqual({});
  });
});
