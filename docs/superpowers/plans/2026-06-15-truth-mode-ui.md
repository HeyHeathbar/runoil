# Truth-Mode Chat UI Implementation Plan

- **Status:** In progress — all tasks implemented & verified (four gates green); reconciled 2026-06-23, pending merge to main.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first usable surface of the Consultant Cockpit — a `/cockpit` route where a signed-in user asks a question and gets a Truth-mode answer grounded in their org's published Corpus, with the cited truths rendered as receipt cards (statement, type/status, reality-gap, provenance, conflict flag).

**Architecture:** A React Router 7 route (`routes/cockpit.tsx`) whose `action` calls the already-built `answerForOrg` (Plan 1), maps each cited `AtomicTruth` through a new pure `toReceiptView`, and renders dumb `ReceiptCard`s. The view-model mapping is the unit-tested core; the route and card are thin and verified by typecheck + build (the repo's Vitest runs in a `node` environment with no DOM, so presentational components are not unit-tested — they consume the tested view-model).

**Tech Stack:** React Router 7 (loader/action/component), shadcn/Tailwind components (`Card`, `Badge`, `Textarea`, `Button`), Clerk auth (`requireSession`), Vitest. Reuses `answerForOrg` (`app/lib/ai/grounding.server.ts`) and follows the `sessions.new.tsx` route idiom.

**Gates:** Every commit must pass the four gates (CLAUDE.md): `npm run governance`, `npm run typecheck`, `npm test`, `npm run build`. This route is **not** a high-risk surface (it reads the caller's own published truths via existing per-org scoping; no auth/RBAC/secrets/billing/publish changes), so agent review + the gates suffice.

---

## File Structure

- **Create** `app/lib/cockpit/receipt.ts` — `ReceiptView` type + pure `toReceiptView(truth)`. The display contract for a receipt; the one unit-tested unit.
- **Create** `app/lib/cockpit/receipt.test.ts` — tests for `toReceiptView`.
- **Create** `app/components/receipt-card.tsx` — presentational card rendering a `ReceiptView`.
- **Create** `app/routes/cockpit.tsx` — loader (model-configured check), action (validate → `answerForOrg` → receipts), component (ask form + answer + receipts).
- **Modify** `app/routes.ts` — register the `cockpit` route.
- **Modify** `app/components/app-header.tsx` — add a "Cockpit" nav link for signed-in users.
- **Modify** `docs/features/consultant-cockpit.md` — bump `Status: Proposed → In progress` (work has started; governance gate accepts "In progress").

Reuse, do not fork: `toReceiptView` reads the real `AtomicTruth`/`RealityGap` types from `app/lib/corpus/truth.ts`; the route mirrors `sessions.new.tsx`; the reality-gap markup mirrors `truths.$id.tsx`.

---

### Task 1: `toReceiptView` — the receipt display contract

**Files:**
- Create: `app/lib/cockpit/receipt.ts`
- Test: `app/lib/cockpit/receipt.test.ts`

- [x] **Step 1: Write the failing test**

```ts
// app/lib/cockpit/receipt.test.ts
import { describe, expect, test } from "vitest";
import { toReceiptView } from "./receipt";
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

describe("toReceiptView", () => {
  test("maps core fields and builds the Corpus href", () => {
    const r = toReceiptView(truth({ id: "at_3", statement: "Onboarding has no owner", type: "Friction", owner: "People Ops" }));
    expect(r).toMatchObject({
      id: "at_3",
      statement: "Onboarding has no owner",
      type: "Friction",
      status: "published",
      owner: "People Ops",
      href: "/truths/at_3",
    });
  });

  test("flags conflict only when the truth is disputed", () => {
    expect(toReceiptView(truth({ id: "a", statement: "x", status: "disputed" })).conflict).toBe(true);
    expect(toReceiptView(truth({ id: "b", statement: "x", status: "published" })).conflict).toBe(false);
  });

  test("includes the reality gap only when present", () => {
    const withGap = toReceiptView(truth({ id: "a", statement: "x", realityGap: { stated: "5d", actual: "3w", severity: "high" } }));
    expect(withGap.gap).toEqual({ stated: "5d", actual: "3w", severity: "high" });
    expect(toReceiptView(truth({ id: "b", statement: "x" })).gap).toBeUndefined();
  });

  test("surfaces a provenance quote when present, omits owner when absent", () => {
    const r = toReceiptView(truth({ id: "a", statement: "x", provenance: { quote: "nobody owns it past day one" } }));
    expect(r.quote).toBe("nobody owns it past day one");
    expect(r.owner).toBeUndefined();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/lib/cockpit/receipt.test.ts`
Expected: FAIL — cannot find module `./receipt`.

- [x] **Step 3: Write minimal implementation**

```ts
// app/lib/cockpit/receipt.ts
import type { AtomicTruth, RealityGap } from "../corpus/truth";

// The view-model the cockpit's receipt card renders for one cited Atomic Truth.
// Derived here so the card stays presentational and this mapping is unit-testable —
// the receipts are the product, so their display contract is worth locking down.
export interface ReceiptView {
  id: string;
  statement: string;
  type: string;
  status: string;
  owner?: string;
  conflict: boolean; // a disputed truth — the Truth-mode conflict flag
  gap?: RealityGap; // only when the truth carries a reality gap
  quote?: string; // a supporting provenance quote, when present
  href: string; // link into the Corpus
}

export function toReceiptView(truth: AtomicTruth): ReceiptView {
  return {
    id: truth.id,
    statement: truth.statement,
    type: truth.type,
    status: truth.status,
    ...(truth.owner ? { owner: truth.owner } : {}),
    conflict: truth.status === "disputed",
    ...(truth.realityGap ? { gap: truth.realityGap } : {}),
    ...(truth.provenance?.quote ? { quote: truth.provenance.quote } : {}),
    href: `/truths/${truth.id}`,
  };
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/lib/cockpit/receipt.test.ts`
Expected: PASS (4 tests).

- [x] **Step 5: Commit**

```bash
git add app/lib/cockpit/receipt.ts app/lib/cockpit/receipt.test.ts
git commit -m "feat(cockpit): toReceiptView — display contract for a Truth-mode receipt"
```

---

### Task 2: `ReceiptCard` — presentational receipt

**Files:**
- Create: `app/components/receipt-card.tsx`

> No unit test: the repo's Vitest runs in a `node` environment with no DOM/React-render setup, so presentational components are verified by typecheck + build. Its logic lives in `toReceiptView` (Task 1, tested).

- [x] **Step 1: Write the component**

```tsx
// app/components/receipt-card.tsx
import { Link } from "react-router";
import type { ReceiptView } from "~/lib/cockpit/receipt";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

// A single Truth-mode "receipt": the governed Atomic Truth an answer was grounded
// in, with its reality gap and provenance shown. Presentational — see toReceiptView.
export function ReceiptCard({ receipt }: { receipt: ReceiptView }) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{receipt.statement}</CardTitle>
          <div className="flex shrink-0 gap-1.5">
            {receipt.conflict && <Badge variant="destructive">conflict</Badge>}
            <Badge variant="secondary">{receipt.type}</Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {receipt.status}
          {receipt.owner ? ` · owner: ${receipt.owner}` : ""}
        </p>
      </CardHeader>

      {receipt.gap && (
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-3 text-xs">
            <div className="mb-1.5 font-medium">
              Reality gap · severity {receipt.gap.severity}
            </div>
            <dl className="grid gap-1.5">
              {receipt.gap.stated && (
                <div>
                  <dt className="text-muted-foreground">Stated</dt>
                  <dd>{receipt.gap.stated}</dd>
                </div>
              )}
              {receipt.gap.actual && (
                <div>
                  <dt className="text-muted-foreground">Actual</dt>
                  <dd>{receipt.gap.actual}</dd>
                </div>
              )}
              {receipt.gap.documented && (
                <div>
                  <dt className="text-muted-foreground">Documented</dt>
                  <dd>{receipt.gap.documented}</dd>
                </div>
              )}
            </dl>
          </div>
        </CardContent>
      )}

      {receipt.quote && (
        <CardContent>
          <blockquote className="border-l-2 pl-3 text-xs text-muted-foreground italic">
            &ldquo;{receipt.quote}&rdquo;
          </blockquote>
        </CardContent>
      )}

      <CardContent>
        <Link to={receipt.href} className="text-xs text-accent-foreground hover:underline">
          Open in Corpus →
        </Link>
      </CardContent>
    </Card>
  );
}
```

- [x] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean. (If `Badge` does not accept `variant="secondary"`/`"destructive"`, check `app/components/ui/badge.tsx` for the real variant names and use those — `StatusBadge` already uses `secondary`/`destructive`/`default`/`outline`, so they exist.)

- [x] **Step 3: Commit**

```bash
git add app/components/receipt-card.tsx
git commit -m "feat(cockpit): ReceiptCard — render a Truth-mode receipt"
```

---

### Task 3: `/cockpit` route + nav + spec status

**Files:**
- Create: `app/routes/cockpit.tsx`
- Modify: `app/routes.ts`
- Modify: `app/components/app-header.tsx`
- Modify: `docs/features/consultant-cockpit.md`

- [x] **Step 1: Create the route**

```tsx
// app/routes/cockpit.tsx
import type { Route } from "./+types/cockpit";
import { Form, Link } from "react-router";
import { requireSession } from "~/lib/auth.server";
import { aiSettings } from "~/lib/ai/settings.server";
import { answerForOrg } from "~/lib/ai/grounding.server";
import { toReceiptView } from "~/lib/cockpit/receipt";
import { ReceiptCard } from "~/components/receipt-card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";

export async function loader(args: Route.LoaderArgs) {
  const { orgId } = await requireSession(args);
  const settings = await aiSettings.get(orgId);
  return { modelConfigured: Boolean(settings.languageModel) };
}

export async function action(args: Route.ActionArgs) {
  const { orgId } = await requireSession(args);
  const form = await args.request.formData();
  const question = String(form.get("question") ?? "").trim();
  if (!question) {
    return { error: "Ask a question to query your verified truth." as const };
  }
  try {
    const { answer, citations } = await answerForOrg(orgId, question);
    return { question, answer, receipts: citations.map(toReceiptView) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export default function Cockpit({ loaderData, actionData }: Route.ComponentProps) {
  const result = actionData && "answer" in actionData ? actionData : null;
  const errorMsg = actionData && "error" in actionData ? actionData.error : null;
  const lastQuestion = result?.question ?? "";

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-2 flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Cockpit</h1>
        <Badge variant="default">Truth mode</Badge>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Ask a question and get an answer grounded only in your organization&rsquo;s
        published, verified truth — with the receipts shown.
      </p>

      {!loaderData.modelConfigured && (
        <p className="mb-6 rounded-md border bg-muted/30 px-3 py-2 text-sm">
          No language model is configured.{" "}
          <Link to="/settings/ai" className="underline">
            Configure one in Settings → AI
          </Link>{" "}
          to use Truth mode.
        </p>
      )}

      <Form method="post" className="flex flex-col gap-3">
        <Textarea
          name="question"
          rows={3}
          placeholder="e.g. How does our onboarding actually work?"
          defaultValue={lastQuestion}
        />
        <div>
          <Button type="submit" disabled={!loaderData.modelConfigured}>
            Ask Truth mode
          </Button>
        </div>
      </Form>

      {errorMsg && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          {errorMsg}
        </p>
      )}

      {result && (
        <div className="mt-8">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm whitespace-pre-wrap">{result.answer}</p>
          </div>
          {result.receipts.length > 0 ? (
            <div className="mt-4">
              <h2 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Receipts · {result.receipts.length}
              </h2>
              <div className="flex flex-col gap-3">
                {result.receipts.map((r) => (
                  <ReceiptCard key={r.id} receipt={r} />
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              No published truths matched — Truth mode won&rsquo;t guess.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [x] **Step 2: Register the route** in `app/routes.ts` — add this line after the `truths/:id` route (line with `route("truths/:id", ...)`):

```ts
  route("cockpit", "routes/cockpit.tsx"),
```

- [x] **Step 3: Add the nav link** in `app/components/app-header.tsx`. Inside `<Show when="signed-in">`, immediately after the `isPlatformAdmin && (...)` Admin link block and before the `Guide` link, add:

```tsx
          <Link
            to="/cockpit"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Cockpit
          </Link>
```

- [x] **Step 4: Bump the spec status** in `docs/features/consultant-cockpit.md`. Change the line:

```
- **Status:** Proposed
```
to:
```
- **Status:** In progress
```

- [x] **Step 5: Run all four gates**

```bash
npm run typecheck
npm test
npm run build
npm run governance
```
Expected: typecheck clean; tests pass (the 59 existing + 4 new `toReceiptView` = 63); build succeeds; governance passes (consultant-cockpit.md now "In progress", still valid). If typecheck flags the `actionData` union narrowing, adjust the `"answer" in actionData` / `"error" in actionData` guards until clean — do not weaken the gate.

- [x] **Step 6: Commit**

```bash
git add app/routes/cockpit.tsx app/routes.ts app/components/app-header.tsx docs/features/consultant-cockpit.md
git commit -m "feat(cockpit): /cockpit Truth-mode route + nav; spec In progress"
```

---

## Self-Review

**Spec coverage (against `docs/features/consultant-cockpit.md` → Chat tab, Truth mode):**
- "Chat tab … Truth mode … grounded in the client's governed Corpus" → `/cockpit` action calls `answerForOrg` (published-only). ✓
- "answer-led insight … reality-gap card … provenance … conflict flags" → `ReceiptCard` renders statement, type/status, reality-gap (stated/actual/documented + severity), provenance quote, and a `conflict` badge for disputed truths. ✓
- "strict, Corpus-only" → empty-receipts branch shows "Truth mode won't guess." ✓
- Out of scope (later plans): the cockpit shell (client rail / tabs / inspector), Open mode, model picker, voice, the Consultant role. This route is the Chat-tab/Truth-mode slice only. ✓
- BYO-keys reality: the route shows a "configure a model" empty-state and disables submit when the org has no `languageModel` — consistent with "only the chat needs the org's keys." ✓

**Placeholder scan:** No TBD/TODO; all code complete.

**Type consistency:** `ReceiptView` defined in Task 1 and consumed in Tasks 2–3; `toReceiptView` signature stable; route imports `answerForOrg` (Plan 1) and `aiSettings`/`requireSession` by their real names (verified in `sessions.new.tsx`). `Badge` variants (`default`/`secondary`/`destructive`) match `status-badge.tsx` usage.

**Verification note:** The route is gated behind Clerk auth and needs a configured model + published truths to exercise end-to-end, so a full preview screenshot of a grounded answer isn't feasible headless. Confidence comes from: the tested `toReceiptView`, the tested `answerForOrg` engine (Plan 1), typecheck, and build. A signed-in manual check is the final confirmation.
