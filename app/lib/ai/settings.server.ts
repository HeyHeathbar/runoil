import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AiSettings } from "./settings";

const SAFE_ORG = /^[A-Za-z0-9_-]+$/;

// Per-org AI provider config + keys. Stored on the encrypted Fly volume,
// OUTSIDE the git Corpus (never committed). Injectable root for tests.
export function createAiSettingsStore(root: string) {
  function file(orgId: string): string {
    if (!SAFE_ORG.test(orgId)) throw new Error(`Unsafe orgId: ${orgId}`);
    return path.join(root, `${orgId}.json`);
  }

  async function get(orgId: string): Promise<AiSettings> {
    try {
      return JSON.parse(await readFile(file(orgId), "utf8")) as AiSettings;
    } catch {
      return {};
    }
  }

  async function save(orgId: string, settings: AiSettings): Promise<void> {
    await mkdir(root, { recursive: true });
    await writeFile(file(orgId), JSON.stringify(settings, null, 2));
  }

  return { get, save };
}

// Default singleton. Dev default anchored to the app dir (cwd is unreliable
// under the dev server); prod sets AI_SETTINGS_ROOT to the volume.
const here = path.dirname(fileURLToPath(import.meta.url));
const AI_SETTINGS_ROOT =
  process.env.AI_SETTINGS_ROOT ??
  path.resolve(here, "../../../.data/ai-settings");

export const aiSettings = createAiSettingsStore(AI_SETTINGS_ROOT);
