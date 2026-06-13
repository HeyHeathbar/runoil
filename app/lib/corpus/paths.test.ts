import { describe, expect, test } from "vitest";
import { typeDir, slugify, bundleDir, truthFilePath } from "./paths";

const ROOT = "/data/corpus";

describe("typeDir", () => {
  test("maps each Atomic Truth type to its bundle directory", () => {
    expect(typeDir("Process")).toBe("processes");
    expect(typeDir("Decision")).toBe("decisions");
    expect(typeDir("Friction")).toBe("frictions");
    expect(typeDir("Open Loop")).toBe("open-loops");
    expect(typeDir("Ownership")).toBe("ownership");
    expect(typeDir("Definition-of-Done")).toBe("definitions-of-done");
  });
});

describe("slugify", () => {
  test("produces safe kebab-case from a statement", () => {
    expect(slugify("Orders ship within 48h of payment!")).toBe(
      "orders-ship-within-48h-of-payment",
    );
  });

  test("collapses separators and trims dashes", () => {
    expect(slugify("  A/B   testing -- v2  ")).toBe("a-b-testing-v2");
  });
});

describe("path resolution", () => {
  test("bundleDir is the org's directory under the corpus root", () => {
    expect(bundleDir(ROOT, "org_123")).toBe("/data/corpus/org_123");
  });

  test("truthFilePath nests by type directory and slug", () => {
    expect(truthFilePath(ROOT, "org_123", "Process", "orders-ship")).toBe(
      "/data/corpus/org_123/processes/orders-ship.md",
    );
  });
});

describe("traversal guards (tenant isolation)", () => {
  test("rejects a slug that tries to escape the bundle", () => {
    expect(() =>
      truthFilePath(ROOT, "org_123", "Process", "../../../etc/passwd"),
    ).toThrow();
  });

  test("rejects an orgId with path separators or dot-segments", () => {
    expect(() => bundleDir(ROOT, "../org_evil")).toThrow();
    expect(() => bundleDir(ROOT, "org/../../escape")).toThrow();
  });

  test("rejects an empty slug", () => {
    expect(() => truthFilePath(ROOT, "org_123", "Process", "")).toThrow();
  });
});
