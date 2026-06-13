import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomBytes } from "node:crypto";

// Per-org MCP bearer tokens. Stored as a SHA-256 hash (never plaintext) in a
// dir OUTSIDE the git-backed Corpus bundles, so tokens are never committed.
// Default anchored to the app dir (cwd is unreliable under the dev server).
const here = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_ROOT =
  process.env.MCP_TOKEN_ROOT ?? path.resolve(here, "../../.data/mcp-tokens");
const SAFE_ORG = /^[A-Za-z0-9_-]+$/;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

function tokenFile(orgId: string): string {
  if (!SAFE_ORG.test(orgId)) throw new Error(`Unsafe orgId: ${orgId}`);
  return path.join(TOKEN_ROOT, `${orgId}.json`);
}

// Generate (or rotate) the org's token. Returns the plaintext ONCE — only the
// hash is persisted, so it can never be shown again.
export async function generateToken(orgId: string): Promise<string> {
  const token = `rok_${randomBytes(24).toString("hex")}`;
  await mkdir(TOKEN_ROOT, { recursive: true });
  await writeFile(tokenFile(orgId), JSON.stringify({ hash: sha256(token) }));
  return token;
}

export async function hasToken(orgId: string): Promise<boolean> {
  try {
    await readFile(tokenFile(orgId), "utf8");
    return true;
  } catch {
    return false;
  }
}

// Resolve a presented bearer token to its org (constant work per org file).
export async function resolveOrgId(token: string): Promise<string | null> {
  const h = sha256(token);
  let files: string[];
  try {
    files = await readdir(TOKEN_ROOT);
  } catch {
    return null;
  }
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      const data = JSON.parse(await readFile(path.join(TOKEN_ROOT, f), "utf8"));
      if (data.hash === h) return f.replace(/\.json$/, "");
    } catch {
      // skip unreadable token file
    }
  }
  return null;
}
