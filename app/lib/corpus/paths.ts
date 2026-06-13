import path from "node:path";
import type { TruthType } from "./truth";

// Fixed type → directory map. The bundle root holds one directory per Atomic
// Truth type, each an OKF "collection" of concept documents.
const TYPE_DIRS: Record<TruthType, string> = {
  Process: "processes",
  Decision: "decisions",
  Friction: "frictions",
  "Open Loop": "open-loops",
  Ownership: "ownership",
  "Definition-of-Done": "definitions-of-done",
};

export function typeDir(type: TruthType): string {
  return TYPE_DIRS[type];
}

// Lowercase kebab-case, stripped of anything that isn't a path-safe character.
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// A path segment supplied by (or derived from) untrusted input — an orgId or a
// slug — must be a single, simple name: no separators, no dot-segments, never
// empty. This is the multitenancy isolation boundary.
const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/;

function assertSafeSegment(segment: string, label: string): void {
  if (!SAFE_SEGMENT.test(segment)) {
    throw new Error(`Unsafe ${label} path segment: ${JSON.stringify(segment)}`);
  }
}

export function bundleDir(root: string, orgId: string): string {
  assertSafeSegment(orgId, "orgId");
  return path.join(root, orgId);
}

export function truthFilePath(
  root: string,
  orgId: string,
  type: TruthType,
  slug: string,
): string {
  assertSafeSegment(orgId, "orgId");
  assertSafeSegment(slug, "slug");
  const filePath = path.join(bundleDir(root, orgId), typeDir(type), `${slug}.md`);
  // Defense in depth: the resolved path must stay inside the org's bundle.
  const bundle = path.resolve(bundleDir(root, orgId));
  if (!path.resolve(filePath).startsWith(bundle + path.sep)) {
    throw new Error("Resolved path escapes the tenant bundle");
  }
  return filePath;
}
