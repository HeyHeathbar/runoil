import { describe, expect, test } from "vitest";
import { toReceiptView } from "./receipt";
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

describe("toReceiptView", () => {
  test("maps core fields and builds the Corpus href", () => {
    const r = toReceiptView(truth({ id: "at_3", statement: "Onboarding has no owner", type: "Friction", owner: "People Ops" }));
    expect(r).toMatchObject({
      id: "at_3",
      statement: "Onboarding has no owner",
      type: "Friction",
      status: "published",
      owner: "People Ops",
      href: "/truths/at_3",
    });
  });

  test("flags conflict only when the truth is disputed", () => {
    expect(toReceiptView(truth({ id: "a", statement: "x", status: "disputed" })).conflict).toBe(true);
    expect(toReceiptView(truth({ id: "b", statement: "x", status: "published" })).conflict).toBe(false);
  });

  test("includes the reality gap only when present", () => {
    const withGap = toReceiptView(truth({ id: "a", statement: "x", realityGap: { stated: "5d", actual: "3w", severity: "high" } }));
    expect(withGap.gap).toEqual({ stated: "5d", actual: "3w", severity: "high" });
    expect(toReceiptView(truth({ id: "b", statement: "x" })).gap).toBeUndefined();
  });

  test("surfaces a provenance quote when present, omits owner when absent", () => {
    const r = toReceiptView(truth({ id: "a", statement: "x", provenance: { quote: "nobody owns it past day one" } }));
    expect(r.quote).toBe("nobody owns it past day one");
    expect(r.owner).toBeUndefined();
  });
});
