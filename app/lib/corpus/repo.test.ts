import { describe, expect, test, beforeEach } from "vitest";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execa } from "execa";
import { createCorpus } from "./repo";
import { bundleDir } from "./paths";
import type { AtomicTruth } from "./truth";

const ORG = "org_test123";
const actor = { name: "Heath", email: "heath@runoil.ai" };

function makeTruth(over: Partial<AtomicTruth> = {}): AtomicTruth {
  return {
    id: "at_aaa111",
    type: "Process",
    statement: "Orders ship within 48h",
    status: "verified",
    confidence: "single-source",
    tags: [],
    timestamp: "2026-06-13T00:00:00.000Z",
    body: "Provenance notes.",
    ...over,
  };
}

async function commitCount(root: string): Promise<number> {
  const { stdout } = await execa("git", [
    "-C",
    bundleDir(root, ORG),
    "rev-list",
    "--count",
    "HEAD",
  ]);
  return Number(stdout.trim());
}

let root: string;
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "runoil-corpus-"));
});

describe("createCorpus — git-backed OKF bundle", () => {
  test("ensureRepo creates a git repo with an OKF bundle-root index.md", async () => {
    const corpus = createCorpus(root);
    await corpus.ensureRepo(ORG);

    const gitDir = await stat(path.join(bundleDir(root, ORG), ".git"));
    expect(gitDir.isDirectory()).toBe(true);

    const index = await readFile(
      path.join(bundleDir(root, ORG), "index.md"),
      "utf8",
    );
    expect(index).toContain('okf_version: "0.1"');
  });

  test("writeTruth then getTruth round-trips through disk", async () => {
    const corpus = createCorpus(root);
    const truth = makeTruth();
    await corpus.writeTruth(ORG, truth, actor);

    expect(await corpus.getTruth(ORG, truth.id)).toEqual(truth);
  });

  test("each writeTruth produces a git commit (audit trail)", async () => {
    const corpus = createCorpus(root);
    await corpus.writeTruth(ORG, makeTruth({ id: "at_1", statement: "One" }), actor);
    const after1 = await commitCount(root);
    await corpus.writeTruth(ORG, makeTruth({ id: "at_2", statement: "Two" }), actor);
    const after2 = await commitCount(root);

    expect(after2).toBe(after1 + 1);
  });

  test("listTruths can filter by status", async () => {
    const corpus = createCorpus(root);
    await corpus.writeTruth(ORG, makeTruth({ id: "at_p", statement: "Pub", status: "published" }), actor);
    await corpus.writeTruth(ORG, makeTruth({ id: "at_v", statement: "Ver", status: "verified" }), actor);

    const published = await corpus.listTruths(ORG, { status: "published" });
    expect(published.map((t) => t.id)).toEqual(["at_p"]);
  });

  test("writeTruth appends an entry to the OKF log.md", async () => {
    const corpus = createCorpus(root);
    await corpus.writeTruth(ORG, makeTruth({ id: "at_log", statement: "Logged thing" }), actor);

    const log = await readFile(path.join(bundleDir(root, ORG), "log.md"), "utf8");
    expect(log).toContain("at_log");
    expect(log).toContain("Heath");
  });

  test("rewriting a truth with a changed statement leaves no duplicate", async () => {
    const corpus = createCorpus(root);
    await corpus.writeTruth(ORG, makeTruth({ id: "at_dup", statement: "First name" }), actor);
    await corpus.writeTruth(ORG, makeTruth({ id: "at_dup", statement: "Renamed thing" }), actor);

    const matches = (await corpus.listTruths(ORG)).filter((t) => t.id === "at_dup");
    expect(matches).toHaveLength(1);
    expect(matches[0].statement).toBe("Renamed thing");
  });

  test("concurrent writes are serialized — both land, no git lock corruption", async () => {
    const corpus = createCorpus(root);
    await Promise.all([
      corpus.writeTruth(ORG, makeTruth({ id: "at_c1", statement: "C1" }), actor),
      corpus.writeTruth(ORG, makeTruth({ id: "at_c2", statement: "C2" }), actor),
    ]);

    const ids = (await corpus.listTruths(ORG)).map((t) => t.id).sort();
    expect(ids).toEqual(["at_c1", "at_c2"]);
  });
});
