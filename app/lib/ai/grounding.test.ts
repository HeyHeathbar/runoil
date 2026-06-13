import { describe, expect, test } from "vitest";
import { rankTruths, buildGroundedPrompt, answerFromCorpus, type CorpusReader } from "./grounding";
import type { AtomicTruth } from "../corpus/truth";
import type { ModelProvider } from "./model";

function truth(partial: Partial<AtomicTruth> & { id: string; statement: string }): AtomicTruth {
  return {
    type: "Process",
    status: "published",
    confidence: "single-source",
    tags: [],
    timestamp: "2026-01-01T00:00:00.000Z",
    body: "",
    ...partial,
  };
}

describe("rankTruths", () => {
  test("returns only truths matching a query term, most matches first", () => {
    const truths = [
      truth({ id: "at_1", statement: "Onboarding takes three weeks", tags: ["onboarding"] }),
      truth({ id: "at_2", statement: "Orders ship in 48 hours" }),
      truth({ id: "at_3", statement: "Onboarding has no owner", owner: "onboarding lead" }),
    ];
    const out = rankTruths(truths, "onboarding owner");
    expect(out.map((t) => t.id)).toEqual(["at_3", "at_1"]);
  });

  test("returns [] for an empty or whitespace query", () => {
    const truths = [truth({ id: "at_1", statement: "anything" })];
    expect(rankTruths(truths, "   ")).toEqual([]);
  });

  test("respects the limit", () => {
    const truths = Array.from({ length: 10 }, (_, i) =>
      truth({ id: `at_${i}`, statement: "shipping policy" }),
    );
    expect(rankTruths(truths, "shipping", 3)).toHaveLength(3);
  });

  test("matches case-insensitively", () => {
    const truths = [truth({ id: "at_1", statement: "Onboarding is slow" })];
    expect(rankTruths(truths, "ONBOARDING").map((t) => t.id)).toEqual(["at_1"]);
  });
});

describe("buildGroundedPrompt", () => {
  test("lists each truth's id, type and statement, and instructs citing ids", () => {
    const prompt = buildGroundedPrompt("How does onboarding work?", [
      truth({ id: "at_3", type: "Friction", statement: "Onboarding has no owner" }),
    ]);
    expect(prompt).toContain("at_3");
    expect(prompt).toContain("Onboarding has no owner");
    expect(prompt).toContain("Truth mode");
    expect(prompt).toMatch(/cite/i);
    expect(prompt).toContain("How does onboarding work?");
  });

  test("surfaces the reality gap when present", () => {
    const prompt = buildGroundedPrompt("onboarding?", [
      truth({
        id: "at_3",
        statement: "Onboarding",
        realityGap: { stated: "5 days", actual: "3 weeks", documented: "3 days", severity: "high" },
      }),
    ]);
    expect(prompt).toContain("5 days");
    expect(prompt).toContain("3 weeks");
    expect(prompt).toContain("high");
  });

  test("with no truths, instructs the model to admit the corpus does not cover it", () => {
    const prompt = buildGroundedPrompt("anything?", []);
    expect(prompt).toMatch(/do not guess|does not cover/i);
    expect(prompt).toContain("anything?");
  });
});

describe("answerFromCorpus", () => {
  test("retrieves published truths, grounds an answer, returns answer + citations", async () => {
    const published = [
      truth({ id: "at_3", type: "Friction", statement: "Onboarding has no owner" }),
      truth({ id: "at_9", statement: "Unrelated shipping policy" }),
    ];
    let listedFilter: unknown;
    const corpus: CorpusReader = {
      listTruths: async (_orgId, filter) => {
        listedFilter = filter;
        return published;
      },
    };
    let seenPrompt = "";
    const model: ModelProvider = {
      complete: async (p) => {
        seenPrompt = p;
        return "Onboarding has no owner. (at_3)";
      },
    };

    // query terms must match by substring (rankTruths is punctuation-sensitive in v1):
    // "onboarding"+"owner" both hit at_3's haystack; "shipping" truth scores 0.
    const result = await answerFromCorpus("org_1", "onboarding owner", { corpus, model });

    expect(listedFilter).toEqual({ status: "published" }); // published-only invariant
    expect(seenPrompt).toContain("at_3"); // grounded in the matched truth
    expect(seenPrompt).not.toContain("at_9"); // the unrelated truth was filtered out before grounding
    expect(result.answer).toBe("Onboarding has no owner. (at_3)");
    expect(result.citations.map((t) => t.id)).toEqual(["at_3"]); // only the matched truth is a receipt
  });

  test("with no matching truths, still answers (model told the corpus is empty)", async () => {
    const corpus: CorpusReader = { listTruths: async () => [] };
    const model: ModelProvider = { complete: async () => "The verified truth layer does not cover this yet." };
    const result = await answerFromCorpus("org_1", "anything?", { corpus, model });
    expect(result.citations).toEqual([]);
    expect(result.answer).toMatch(/does not cover/i);
  });
});
