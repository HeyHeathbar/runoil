import { describe, expect, test } from "vitest";
import { canTransition } from "./truth";

describe("status transitions (governance gate, spec B6)", () => {
  test("admin promotes proposed → verified", () => {
    expect(canTransition("proposed", "verified", "admin")).toBe(true);
  });

  test("admin publishes verified → published", () => {
    expect(canTransition("verified", "published", "admin")).toBe(true);
  });

  test("members cannot change status — only admins adjudicate", () => {
    expect(canTransition("proposed", "verified", "member")).toBe(false);
    expect(canTransition("verified", "published", "member")).toBe(false);
  });

  test("cannot skip verification: proposed → published is rejected", () => {
    expect(canTransition("proposed", "published", "admin")).toBe(false);
  });

  test("a later contradiction can reopen a published truth: published → disputed", () => {
    expect(canTransition("published", "disputed", "admin")).toBe(true);
  });

  test("disputed can be re-adjudicated back to verified", () => {
    expect(canTransition("disputed", "verified", "admin")).toBe(true);
  });

  test("retired is terminal: cannot move retired → published", () => {
    expect(canTransition("retired", "published", "admin")).toBe(false);
  });

  test("anything live can be retired by an admin", () => {
    expect(canTransition("verified", "retired", "admin")).toBe(true);
    expect(canTransition("published", "retired", "admin")).toBe(true);
  });
});
