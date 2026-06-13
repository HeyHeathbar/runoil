import matter from "gray-matter";
import type { AtomicTruth } from "./truth";

// Maps an AtomicTruth to/from an Open Knowledge Format (OKF v0.1) document.
// OKF-standard frontmatter keys: type, title, description, tags, timestamp.
// RunOil custom keys (OKF permits and consumers preserve them): status, owner,
// confidence, reality_gap, runoil_id.

export function serializeTruth(truth: AtomicTruth): string {
  const data: Record<string, unknown> = {
    type: truth.type,
    title: truth.statement,
    ...(truth.description !== undefined
      ? { description: truth.description }
      : {}),
    status: truth.status,
    ...(truth.owner !== undefined ? { owner: truth.owner } : {}),
    confidence: truth.confidence,
    ...(truth.realityGap ? { reality_gap: truth.realityGap } : {}),
    ...(truth.provenance ? { provenance: truth.provenance } : {}),
    tags: truth.tags,
    timestamp: truth.timestamp,
    runoil_id: truth.id,
  };
  return matter.stringify(truth.body, data);
}

export function parseTruth(markdown: string): AtomicTruth {
  const { data, content } = matter(markdown);
  // js-yaml parses ISO datetimes into Date; normalize back to a string.
  const timestamp =
    data.timestamp instanceof Date
      ? data.timestamp.toISOString()
      : data.timestamp;
  return {
    id: data.runoil_id,
    type: data.type,
    statement: data.title,
    ...(data.description !== undefined
      ? { description: data.description }
      : {}),
    status: data.status,
    ...(data.owner !== undefined ? { owner: data.owner } : {}),
    confidence: data.confidence,
    ...(data.reality_gap ? { realityGap: data.reality_gap } : {}),
    ...(data.provenance ? { provenance: data.provenance } : {}),
    tags: data.tags ?? [],
    timestamp,
    // gray-matter.stringify appends a trailing newline; strip it so the body
    // round-trips to exactly what was authored.
    body: content.replace(/\n$/, ""),
  };
}
