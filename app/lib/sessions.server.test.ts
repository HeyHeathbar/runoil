import { describe, expect, test, beforeEach } from "vitest";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createSessionsStore } from "./sessions.server";

const ORG = "org_guide";

let root: string;
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "runoil-sessions-"));
});

describe("createSessionsStore", () => {
  test("create then get round-trips, with an id and empty proposals", async () => {
    const store = createSessionsStore(root);
    const created = await store.create(ORG, {
      title: "Ops interview",
      source: "paste",
      transcript: "We ship orders in 48 hours.",
    });

    expect(created.id).toMatch(/^ses_/);
    expect(created.proposals).toEqual([]);
    expect(await store.get(ORG, created.id)).toEqual(created);
  });

  test("list returns created sessions; orgs are isolated", async () => {
    const store = createSessionsStore(root);
    await store.create(ORG, { title: "A", source: "paste", transcript: "x" });
    expect((await store.list(ORG)).length).toBe(1);
    expect(await store.list("org_other")).toEqual([]);
  });

  test("update persists proposals", async () => {
    const store = createSessionsStore(root);
    const s = await store.create(ORG, {
      title: "B",
      source: "paste",
      transcript: "y",
    });
    s.proposals = [
      {
        id: "p1",
        type: "Process",
        statement: "Ship in 48h",
        confidence: "single-source",
        quote: "we ship in 48 hours",
        status: "pending",
      },
    ];
    await store.update(ORG, s);

    expect((await store.get(ORG, s.id))?.proposals[0].statement).toBe(
      "Ship in 48h",
    );
  });
});
