import { describe, expect, test } from "vitest";
import { rankTruths } from "./grounding";
import type { AtomicTruth } from "../corpus/truth";

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
});
