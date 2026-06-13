import { describe, expect, test } from "vitest";
import { parseProposals, extractProposals } from "./extraction";
import type { ModelProvider } from "./model";

describe("parseProposals", () => {
  test("parses a fenced JSON array into pending proposals with ids", () => {
    const out = parseProposals(
      'Here are the truths:\n```json\n[{"type":"Process","statement":"Orders ship in 48h","owner":"Ops","confidence":"corroborated","quote":"we ship in 48 hours"}]\n```',
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      type: "Process",
      statement: "Orders ship in 48h",
      owner: "Ops",
      confidence: "corroborated",
      quote: "we ship in 48 hours",
      status: "pending",
    });
    expect(out[0].id).toBeTruthy();
  });

  test("skips items with an invalid type or missing statement", () => {
    const out = parseProposals(
      '[{"type":"Nonsense","statement":"x"},{"type":"Decision"},{"type":"Friction","statement":"Onboarding is slow"}]',
    );
    expect(out.map((p) => p.statement)).toEqual(["Onboarding is slow"]);
  });

  test("defaults confidence to single-source", () => {
    const out = parseProposals('[{"type":"Ownership","statement":"Jane owns billing"}]');
    expect(out[0].confidence).toBe("single-source");
  });

  test("returns [] on unparseable output (no crash)", () => {
    expect(parseProposals("the model said no")).toEqual([]);
  });
});

describe("extractProposals", () => {
  test("runs the transcript through the model and parses the result", async () => {
    const stub: ModelProvider = {
      complete: async () =>
        '[{"type":"Decision","statement":"We chose Fly.io","quote":"we went with Fly"}]',
    };
    const out = await extractProposals("…transcript…", stub);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe("Decision");
    expect(out[0].status).toBe("pending");
  });
});
