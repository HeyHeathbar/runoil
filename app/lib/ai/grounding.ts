import type { AtomicTruth, TruthStatus } from "../corpus/truth";
import type { ModelProvider } from "./model";

// Rank published truths by how many query terms they match. Pure + deterministic
// so Truth-mode retrieval is testable. Mirrors the keyword match in mcp-server's
// search_truths, but scored and sorted. Returns the top `limit` matches.
export function rankTruths(
  truths: AtomicTruth[],
  query: string,
  limit = 6,
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
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.t);
}
