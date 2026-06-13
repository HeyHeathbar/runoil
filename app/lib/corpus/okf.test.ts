import { describe, expect, test } from "vitest";
import { serializeTruth, parseTruth } from "./okf";
import type { AtomicTruth } from "./truth";

const sample: AtomicTruth = {
  id: "at_0f3a1b2c",
  type: "Process",
  statement: "Orders ship within 48h of payment",
  description: "Order-to-cash fulfillment SLA",
  status: "verified",
  owner: "Ops Lead",
  confidence: "single-source",
  realityGap: {
    stated: "48h",
    actual: "3-5 days during peak",
    documented: "SOP says 48h",
    severity: "high",
  },
  tags: ["order-to-cash", "fulfillment"],
  timestamp: "2026-06-13T00:00:00.000Z",
  body: "Full statement with provenance.\n\nRelated: [Decision](/decisions/sla-48h.md)",
};

describe("OKF serialize/parse", () => {
  test("round-trips an Atomic Truth through serialize then parse", () => {
    const markdown = serializeTruth(sample);
    expect(parseTruth(markdown)).toEqual(sample);
  });

  test("maps RunOil fields onto OKF frontmatter keys", () => {
    const markdown = serializeTruth(sample);
    expect(markdown).toContain("type: Process");
    expect(markdown).toContain("title: Orders ship within 48h of payment");
    expect(markdown).toContain("runoil_id: at_0f3a1b2c");
    expect(markdown).toContain("reality_gap:");
    // OKF body lives below the frontmatter, unmodified.
    expect(markdown).toContain("Related: [Decision](/decisions/sla-48h.md)");
  });

  test("round-trips provenance (source session + verbatim quote)", () => {
    const withProvenance: AtomicTruth = {
      ...sample,
      provenance: { sessionId: "ses_abc", quote: "we ship in 48 hours" },
    };
    const markdown = serializeTruth(withProvenance);
    expect(markdown).toContain("provenance:");
    expect(markdown).toContain("we ship in 48 hours");
    expect(parseTruth(markdown)).toEqual(withProvenance);
  });
});
