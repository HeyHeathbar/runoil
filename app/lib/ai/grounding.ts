import type { AtomicTruth, TruthStatus } from "../corpus/truth";
import type { ModelProvider } from "./model";

// Default number of truths to ground an answer in (a small, reviewable set of receipts).
const DEFAULT_TRUTH_LIMIT = 6;

// Truth mode (spec B7/B10): the model answers ONLY from these governed truths,
// surfaces reality gaps, cites the ids it used, and admits when the corpus does
// not cover the question — never guesses, never uses outside knowledge.
export function buildGroundedPrompt(question: string, truths: AtomicTruth[]): string {
  if (truths.length === 0) {
    return `You are RunOil in Truth mode. The organization's governed truth layer has NO published truths matching the question. In one sentence, say the verified truth layer does not cover this yet. Do not guess and do not use outside knowledge.

QUESTION: ${question}`;
  }
  const facts = truths
    .map((t) => {
      const gap = t.realityGap
        ? ` [reality gap — stated: ${t.realityGap.stated ?? "—"}; actual: ${t.realityGap.actual ?? "—"}; documented: ${t.realityGap.documented ?? "—"}; severity: ${t.realityGap.severity}]`
        : "";
      const owner = t.owner ? ` — owner: ${t.owner}` : "";
      return `- (${t.id}) [${t.type}] ${t.statement}${owner}${gap}`;
    })
    .join("\n");
  return `You are RunOil in Truth mode. Answer the question using ONLY the organization's governed Atomic Truths below. Do not use outside knowledge. Lead with the insight. When a truth has a reality gap, surface it. Cite the truth ids you used in parentheses, e.g. (at_0f3a1b2c). If the truths do not answer the question, say so plainly.

GOVERNED TRUTHS:
${facts}

QUESTION: ${question}`;
}

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
