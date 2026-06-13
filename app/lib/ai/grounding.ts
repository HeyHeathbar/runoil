import type { AtomicTruth, TruthStatus } from "../corpus/truth";
import type { ModelProvider } from "./model";

// Default number of truths to ground an answer in (a small, reviewable set of receipts).
const DEFAULT_TRUTH_LIMIT = 6;

// Rank a set of truths by how many query terms they match, most matches first.
// Pure + deterministic — ties break by most-recently-changed (timestamp desc).
// This is a ranking utility only: the published-only invariant is enforced by the
// caller (answerFromCorpus), not here. Mirrors the keyword match in mcp-server's
// search_truths, but scored and sorted.
export function rankTruths(
  truths: AtomicTruth[],
  query: string,
  limit = DEFAULT_TRUTH_LIMIT,
): AtomicTruth[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return truths
    .map((t) => {
      const haystack = [t.statement, t.description, t.body, t.tags.join(" "), t.owner, t.type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const score = terms.reduce((n, term) => (haystack.includes(term) ? n + 1 : n), 0);
      return { t, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.t.timestamp.localeCompare(a.t.timestamp))
    .slice(0, limit)
    .map((s) => s.t);
}
