# Grounded Query Service (Truth-Mode Engine) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the backend service that answers a natural-language question grounded **only** in an org's published Atomic Truths, returning the answer plus the cited truths as receipts — the engine behind the cockpit's Truth mode.

**Architecture:** Pure, dependency-injected functions in `app/lib/ai/grounding.ts` (rank → prompt → answer), composed over the existing `corpus.listTruths(orgId, { status: "published" })` retrieval and the `ModelProvider.complete()` interface. A thin `grounding.server.ts` wires the real corpus + per-org model. No new storage, no streaming, no UI — those come in later plans. Hard invariant carried from the MCP server: **published-only**.

**Tech Stack:** TypeScript, Vitest (`vitest run`), React Router 7 app conventions. Mirrors the existing `app/lib/ai/extraction.ts` + `extraction.test.ts` patterns (stub `ModelProvider`, pure parse/build functions).

---

## File Structure

- **Create** `app/lib/ai/grounding.ts` — pure functions: `rankTruths`, `buildGroundedPrompt`, `answerFromCorpus`, and the `GroundedAnswer` / `CorpusReader` types. One responsibility: turn a question + an org's published truths into a grounded answer with receipts.
- **Create** `app/lib/ai/grounding.test.ts` — unit tests for all three functions using stub deps (no fs, no network).
- **Create** `app/lib/ai/grounding.server.ts` — thin glue: `answerForOrg(orgId, question)` resolving the shared `corpus` and the per-org `resolveModelProvider`. Not unit-tested (composition of server singletons); verified by typecheck.

Reuse, do not fork: the keyword-match logic mirrors `app/lib/mcp-server.server.ts` `search_truths`; the model-call + stub-test pattern mirrors `app/lib/ai/extraction.ts`.

---

### Task 1: `rankTruths` — published-truth retrieval

**Files:**
- Create: `app/lib/ai/grounding.ts`
- Test: `app/lib/ai/grounding.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/lib/ai/grounding.test.ts
import { describe, expect, test } from "vitest";
import { rankTruths } from "./grounding";
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

describe("rankTruths", () => {
  test("returns only truths matching a query term, most matches first", () => {
    const truths = [
      truth({ id: "at_1", statement: "Onboarding takes three weeks", tags: ["onboarding"] }),
      truth({ id: "at_2", statement: "Orders ship in 48 hours" }),
      truth({ id: "at_3", statement: "Onboarding has no owner", owner: "onboarding lead" }),
    ];
    const out = rankTruths(truths, "onboarding owner");
    expect(out.map((t) => t.id)).toEqual(["at_3", "at_1"]);
  });

  test("returns [] for an empty or whitespace query", () => {
    const truths = [truth({ id: "at_1", statement: "anything" })];
    expect(rankTruths(truths, "   ")).toEqual([]);
  });

  test("respects the limit", () => {
    const truths = Array.from({ length: 10 }, (_, i) =>
      truth({ id: `at_${i}`, statement: "shipping policy" }),
    );
    expect(rankTruths(truths, "shipping", 3)).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/lib/ai/grounding.test.ts`
Expected: FAIL — `rankTruths` is not exported / module not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// app/lib/ai/grounding.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/lib/ai/grounding.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/lib/ai/grounding.ts app/lib/ai/grounding.test.ts
git commit -m "feat(ai): rankTruths — published-truth retrieval for Truth mode"
```

---

### Task 2: `buildGroundedPrompt` — strict Truth-mode prompt

**Files:**
- Modify: `app/lib/ai/grounding.ts`
- Test: `app/lib/ai/grounding.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// append to app/lib/ai/grounding.test.ts
import { buildGroundedPrompt } from "./grounding";

describe("buildGroundedPrompt", () => {
  test("lists each truth's id, type and statement, and instructs citing ids", () => {
    const prompt = buildGroundedPrompt("How does onboarding work?", [
      truth({ id: "at_3", type: "Friction", statement: "Onboarding has no owner" }),
    ]);
    expect(prompt).toContain("at_3");
    expect(prompt).toContain("Onboarding has no owner");
    expect(prompt).toContain("Truth mode");
    expect(prompt).toMatch(/cite/i);
    expect(prompt).toContain("How does onboarding work?");
  });

  test("surfaces the reality gap when present", () => {
    const prompt = buildGroundedPrompt("onboarding?", [
      truth({
        id: "at_3",
        statement: "Onboarding",
        realityGap: { stated: "5 days", actual: "3 weeks", documented: "3 days", severity: "high" },
      }),
    ]);
    expect(prompt).toContain("5 days");
    expect(prompt).toContain("3 weeks");
    expect(prompt).toContain("high");
  });

  test("with no truths, instructs the model to admit the corpus does not cover it", () => {
    const prompt = buildGroundedPrompt("anything?", []);
    expect(prompt).toMatch(/do not guess|does not cover/i);
    expect(prompt).toContain("anything?");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/lib/ai/grounding.test.ts`
Expected: FAIL — `buildGroundedPrompt` is not exported.

- [ ] **Step 3: Write minimal implementation**

```ts
// append to app/lib/ai/grounding.ts

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/lib/ai/grounding.test.ts`
Expected: PASS (6 tests total).

- [ ] **Step 5: Commit**

```bash
git add app/lib/ai/grounding.ts app/lib/ai/grounding.test.ts
git commit -m "feat(ai): buildGroundedPrompt — strict Truth-mode prompt with receipts"
```

---

### Task 3: `answerFromCorpus` — compose retrieval + grounding + model

**Files:**
- Modify: `app/lib/ai/grounding.ts`
- Test: `app/lib/ai/grounding.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// append to app/lib/ai/grounding.test.ts
import { answerFromCorpus, type CorpusReader } from "./grounding";
import type { ModelProvider } from "./model";

describe("answerFromCorpus", () => {
  test("retrieves published truths, grounds an answer, returns answer + citations", async () => {
    const published = [
      truth({ id: "at_3", type: "Friction", statement: "Onboarding has no owner" }),
      truth({ id: "at_9", statement: "Unrelated shipping policy" }),
    ];
    let listedFilter: unknown;
    const corpus: CorpusReader = {
      listTruths: async (_orgId, filter) => {
        listedFilter = filter;
        return published;
      },
    };
    let seenPrompt = "";
    const model: ModelProvider = {
      complete: async (p) => {
        seenPrompt = p;
        return "Onboarding has no owner. (at_3)";
      },
    };

    // query terms must match by substring (rankTruths is punctuation-sensitive in v1):
    // "onboarding"+"owner" both hit at_3's haystack; "shipping" truth scores 0.
    const result = await answerFromCorpus("org_1", "onboarding owner", { corpus, model });

    expect(listedFilter).toEqual({ status: "published" }); // published-only invariant
    expect(seenPrompt).toContain("at_3"); // grounded in the matched truth
    expect(result.answer).toBe("Onboarding has no owner. (at_3)");
    expect(result.citations.map((t) => t.id)).toEqual(["at_3"]); // only the matched truth is a receipt
  });

  test("with no matching truths, still answers (model told the corpus is empty)", async () => {
    const corpus: CorpusReader = { listTruths: async () => [] };
    const model: ModelProvider = { complete: async () => "The verified truth layer does not cover this yet." };
    const result = await answerFromCorpus("org_1", "anything?", { corpus, model });
    expect(result.citations).toEqual([]);
    expect(result.answer).toMatch(/does not cover/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/lib/ai/grounding.test.ts`
Expected: FAIL — `answerFromCorpus` / `CorpusReader` not exported.

- [ ] **Step 3: Write minimal implementation**

```ts
// append to app/lib/ai/grounding.ts

// Receipts for a Truth-mode answer: the published Atomic Truths it was grounded in.
export interface GroundedAnswer {
  answer: string;
  citations: AtomicTruth[];
}

// The slice of the corpus this engine needs. Matches corpus.listTruths in
// app/lib/corpus/repo.ts; injectable so the engine is testable without fs/git.
export interface CorpusReader {
  listTruths(
    orgId: string,
    filter?: { status?: TruthStatus },
  ): Promise<AtomicTruth[]>;
}

// The Truth-mode engine: retrieve the org's PUBLISHED truths, rank them against the
// question, ground an answer in them, and return the answer plus the ranked truths
// as receipts. Hard invariant (carried from the MCP server): published-only.
export async function answerFromCorpus(
  orgId: string,
  question: string,
  deps: { corpus: CorpusReader; model: ModelProvider; limit?: number },
): Promise<GroundedAnswer> {
  const published = await deps.corpus.listTruths(orgId, { status: "published" });
  const citations = rankTruths(published, question, deps.limit ?? 6);
  const answer = await deps.model.complete(buildGroundedPrompt(question, citations));
  return { answer, citations };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/lib/ai/grounding.test.ts`
Expected: PASS (8 tests total).

- [ ] **Step 5: Commit**

```bash
git add app/lib/ai/grounding.ts app/lib/ai/grounding.test.ts
git commit -m "feat(ai): answerFromCorpus — Truth-mode engine (published-only)"
```

---

### Task 4: `answerForOrg` — server glue over real corpus + per-org model

**Files:**
- Create: `app/lib/ai/grounding.server.ts`

> No unit test: this is thin composition of server singletons (`corpus`, `aiSettings`) that touch fs/git/Clerk. The tested core is Tasks 1–3. Verified by typecheck. Confirm the exact export names by reading the imports below before writing.

- [ ] **Step 1: Confirm the singletons exist**

Run: `grep -n "export const corpus" app/lib/corpus.server.ts && grep -nE "export (const|function) aiSettings|export const aiSettings" app/lib/ai/settings.server.ts`
Expected: prints the `corpus` export and the `aiSettings` store export. If the settings store is named differently (e.g. a factory result), use that name in Step 2.

- [ ] **Step 2: Write the glue**

```ts
// app/lib/ai/grounding.server.ts
import { corpus } from "../corpus.server";
import { resolveModelProvider } from "./model";
import { aiSettings } from "./settings.server";
import { answerFromCorpus, type GroundedAnswer } from "./grounding";

// Resolve the org's configured model + the shared corpus, then answer in Truth mode.
// Mirrors how routes resolve the model (see sessions.$id.tsx "extract" action).
export async function answerForOrg(
  orgId: string,
  question: string,
): Promise<GroundedAnswer> {
  const model = resolveModelProvider(await aiSettings.get(orgId));
  return answerFromCorpus(orgId, question, { corpus, model });
}
```

- [ ] **Step 3: Typecheck the whole app**

Run: `npm run typecheck`
Expected: PASS, no errors. (If `aiSettings.get` or `corpus` names differ, fix the imports to match Step 1's output, then re-run.)

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS — the 8 new grounding tests plus all existing tests, no regressions.

- [ ] **Step 5: Commit**

```bash
git add app/lib/ai/grounding.server.ts
git commit -m "feat(ai): answerForOrg — wire Truth-mode engine to corpus + per-org model"
```

---

## Self-Review

**Spec coverage (against `docs/features/consultant-cockpit.md` → Chat tab, Truth mode):**
- "grounded in the client's governed Corpus" → `answerFromCorpus` retrieves `{ status: "published" }` only. ✓
- "answer-led insight … reality-gap … provenance … conflict flags shown" → the *data* for receipts is returned via `citations` (full `AtomicTruth`, incl. `realityGap`, `provenance`); the prompt instructs insight-first + gap surfacing. Rendering the cards is **Plan 2 (Truth-mode UI)**, not this plan. ✓ (engine side complete)
- "Truth mode … strict, sourced, Corpus-only" → empty-corpus branch forbids guessing/outside knowledge. ✓
- Open mode, model picker, voice, streaming → explicitly **out of scope** here (Plan 3). ✓

**Placeholder scan:** No TBD/TODO; every code step is complete. ✓

**Type consistency:** `AtomicTruth`, `TruthStatus`, `ModelProvider` imported from their real modules (`../corpus/truth`, `./model`). `CorpusReader.listTruths` signature matches the `corpus.listTruths(orgId, { status })` call shape used in `mcp-server.server.ts`. `GroundedAnswer` used consistently in Tasks 3–4. ✓

**Note for the executor:** `npx vitest run <file>` runs a single test file fast during TDD; `npm test` (`vitest run`) runs everything before the final commit.
