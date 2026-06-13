import { describe, expect, test } from "vitest";
import { isPlatformAdmin } from "./rbac";

describe("isPlatformAdmin", () => {
  test("true only when publicMetadata.platformAdmin is strictly true", () => {
    expect(isPlatformAdmin({ platformAdmin: true })).toBe(true);
  });

  test("false for missing, falsey, or non-boolean flags", () => {
    expect(isPlatformAdmin({})).toBe(false);
    expect(isPlatformAdmin(undefined)).toBe(false);
    expect(isPlatformAdmin(null)).toBe(false);
    expect(isPlatformAdmin({ platformAdmin: "yes" })).toBe(false);
    expect(isPlatformAdmin({ platformAdmin: false })).toBe(false);
  });
});
