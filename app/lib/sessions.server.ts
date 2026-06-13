import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import type { Session, SessionSource } from "./sessions";

const SAFE = /^[A-Za-z0-9_-]+$/;

export interface NewSession {
  title: string;
  source: SessionSource;
  transcript: string;
}

// Per-org session store on the encrypted volume (separate from the git Corpus).
export function createSessionsStore(root: string) {
  function dir(orgId: string): string {
    if (!SAFE.test(orgId)) throw new Error(`Unsafe orgId: ${orgId}`);
    return path.join(root, orgId);
  }
  function file(orgId: string, id: string): string {
    if (!SAFE.test(id)) throw new Error(`Unsafe session id: ${id}`);
    return path.join(dir(orgId), `${id}.json`);
  }

  async function create(orgId: string, input: NewSession): Promise<Session> {
    const session: Session = {
      id: `ses_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      title: input.title,
      source: input.source,
      transcript: input.transcript,
      createdAt: new Date().toISOString(),
      proposals: [],
    };
    await mkdir(dir(orgId), { recursive: true });
    await writeFile(file(orgId, session.id), JSON.stringify(session, null, 2));
    return session;
  }

  async function get(orgId: string, id: string): Promise<Session | null> {
    try {
      return JSON.parse(await readFile(file(orgId, id), "utf8")) as Session;
    } catch {
      return null;
    }
  }

  async function update(orgId: string, session: Session): Promise<void> {
    await mkdir(dir(orgId), { recursive: true });
    await writeFile(file(orgId, session.id), JSON.stringify(session, null, 2));
  }

  async function list(orgId: string): Promise<Session[]> {
    let entries: string[];
    try {
      entries = await readdir(dir(orgId));
    } catch {
      return [];
    }
    const sessions: Session[] = [];
    for (const entry of entries) {
      if (!entry.endsWith(".json")) continue;
      try {
        sessions.push(
          JSON.parse(await readFile(path.join(dir(orgId), entry), "utf8")),
        );
      } catch {
        // skip unreadable session
      }
    }
    return sessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return { create, get, update, list };
}

// Default singleton, anchored to the app dir (cwd unreliable under dev server);
// prod sets SESSIONS_ROOT to the volume.
const here = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_ROOT =
  process.env.SESSIONS_ROOT ?? path.resolve(here, "../../.data/sessions");

export const sessions = createSessionsStore(SESSIONS_ROOT);
