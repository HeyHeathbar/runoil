import { mkdir, writeFile, appendFile, readFile, readdir, unlink, stat } from "node:fs/promises";
import path from "node:path";
import { execa } from "execa";
import { serializeTruth, parseTruth } from "./okf";
import { bundleDir, truthFilePath, typeDir, slugify } from "./paths";
import { TRUTH_TYPES, type Actor, type AtomicTruth, type TruthStatus } from "./truth";

export type { Actor };

export interface ListFilter {
  status?: TruthStatus;
}

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function git(dir: string, args: string[]): Promise<string> {
  const { stdout } = await execa("git", ["-C", dir, ...args]);
  return stdout;
}

async function commitAll(dir: string, actor: Actor, message: string): Promise<void> {
  await git(dir, ["add", "-A"]);
  await git(dir, [
    "-c",
    `user.name=${actor.name}`,
    "-c",
    `user.email=${actor.email}`,
    "commit",
    "-q",
    "--no-gpg-sign",
    "-m",
    message,
  ]);
}

// A per-tenant write queue: serializes mutations to one git repo so concurrent
// writers can't collide on the index lock. Reads don't take the lock.
export function createCorpus(root: string) {
  const locks = new Map<string, Promise<unknown>>();

  function withLock<T>(orgId: string, fn: () => Promise<T>): Promise<T> {
    const prev = locks.get(orgId) ?? Promise.resolve();
    const run = prev.then(fn, fn);
    locks.set(
      orgId,
      run.then(
        () => {},
        () => {},
      ),
    );
    return run;
  }

  const robotActor: Actor = { name: "RunOil", email: "system@runoil.ai" };

  async function ensureRepo(orgId: string): Promise<void> {
    const dir = bundleDir(root, orgId);
    if (await exists(path.join(dir, ".git"))) return;

    await mkdir(dir, { recursive: true });
    await git(dir, ["-c", "init.defaultBranch=main", "init", "-q"]);
    await writeFile(
      path.join(dir, "index.md"),
      `---\nokf_version: "0.1"\ntype: Corpus\ntitle: RunOil Corpus\n---\n\nThe governed body of Atomic Truths for this organization.\n`,
    );
    await writeFile(
      path.join(dir, "log.md"),
      `---\ntype: Log\ntitle: Change log\n---\n\n`,
    );
    await commitAll(dir, robotActor, "Initialize corpus");
  }

  async function writeTruth(
    orgId: string,
    truth: AtomicTruth,
    actor: Actor,
  ): Promise<void> {
    return withLock(orgId, async () => {
      await ensureRepo(orgId);
      const dir = bundleDir(root, orgId);
      const file = truthFilePath(root, orgId, truth.type, slugify(truth.statement));

      // A truth's identity is its runoil_id, not its path. If an edit moved the
      // file (new type or restated), remove the stale one so there's exactly
      // one file per id — the bundle stays the single source of record.
      const existing = (await readAll(orgId)).find((e) => e.truth.id === truth.id);

      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, serializeTruth(truth));
      if (existing && existing.path !== file) await unlink(existing.path);
      await appendFile(
        path.join(dir, "log.md"),
        `- ${truth.timestamp} · ${actor.name} · ${truth.status} · ${truth.id} · ${truth.statement}\n`,
      );
      await commitAll(
        dir,
        actor,
        `${truth.status}: ${truth.statement} (${truth.id})`,
      );
    });
  }

  // Read every truth in the bundle, paired with its file path.
  async function readAll(
    orgId: string,
  ): Promise<{ path: string; truth: AtomicTruth }[]> {
    const dir = bundleDir(root, orgId);
    const out: { path: string; truth: AtomicTruth }[] = [];
    for (const type of TRUTH_TYPES) {
      const typePath = path.join(dir, typeDir(type));
      let entries: string[];
      try {
        entries = await readdir(typePath);
      } catch {
        continue; // type dir not created yet
      }
      for (const entry of entries) {
        if (!entry.endsWith(".md") || entry === "index.md") continue;
        const p = path.join(typePath, entry);
        out.push({ path: p, truth: parseTruth(await readFile(p, "utf8")) });
      }
    }
    return out;
  }

  async function listTruths(
    orgId: string,
    filter: ListFilter = {},
  ): Promise<AtomicTruth[]> {
    const truths = (await readAll(orgId)).map((e) => e.truth);
    return filter.status
      ? truths.filter((t) => t.status === filter.status)
      : truths;
  }

  async function getTruth(
    orgId: string,
    id: string,
  ): Promise<AtomicTruth | null> {
    const all = await readAll(orgId);
    return all.find((e) => e.truth.id === id)?.truth ?? null;
  }

  return { ensureRepo, writeTruth, listTruths, getTruth };
}
