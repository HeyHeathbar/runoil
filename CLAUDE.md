# RunOil — Agent Instructions

## Governance

This repository is developed under an agent-first governance model. Read this before anything else — it frames every other instruction in this file.

- **Every line of code is agent-written.** Direct human edits are the exception, not the norm. Humans focus on high-level architecture, business-need alignment, and standard-setting; the code is a product of that governance. Humans *may* still touch code directly when judgment or speed demands it — an emergency hotfix, a security patch, or fixing the agent harness itself — but the default path is agent-implemented against a spec.
- **Specs and plans are the primary artifact — for *intent*.** Because no human hand-reviews every line, the feature specs under [docs/features/](docs/features/), the implementation plans under [docs/superpowers/plans/](docs/superpowers/plans/), and the ADRs under [docs/architecture/adr/](docs/architecture/adr/) are the durable, authoritative record of *intent*. Keep them accurate and current; treat them as the deliverable and the code as their rendering. **But the rendering is what ships and where bugs live: tests are the authoritative record of *behavior*, and a feature isn't done until its tests prove the code matches the spec.** Reconcile a spec's `Status` / acceptance-criteria checkboxes when its feature ships — **the shipping PR is the gate**, and CI enforces it (see Gate 4).
- **Agent-to-agent review is a backstop — not the only one.** Since there is no human line-level review, rigorous automated review (e.g. two-stage spec + code-quality review when executing plans) protects correctness. But agent review shares correlated blind spots, so it does **not** stand alone: executable verification (the gates below) is the primary backstop, and a defined set of high-risk surfaces still requires one human read. Do not weaken any of these.

### The four quality gates

Every change must pass all four before merge. CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs them on every PR to `main`; a pre-commit hook runs Gate 4 locally. Do not weaken or skip them.

1. **Types** — `npm run typecheck` (`react-router typegen && tsc`). Structure is sound and the types compile.
2. **Behavior** — `npm test` (Vitest). Tests prove the code matches the spec. New features and bugfixes land with tests; this is the gate that makes "code is a rendering of the spec" actually true.
3. **Build** — `npm run build`. It compiles and is shippable.
4. **Governance** — `npm run governance`. Specs and plans are reconciled: every feature spec carries a valid `Status`, and a feature marked **Shipped** has every acceptance-criteria box checked. This is the machine-checkable form of "reconcile status when the feature ships."

### High-risk surfaces — require one human line-level review

Agent review is the default, but these surfaces are where a correlated agent miss is catastrophic and hard to reverse. A change touching any of them must get one human read before merge, called out in the PR description:

- Authentication, authorization, and tenant-isolation boundaries (Clerk wiring, RBAC, per-org scoping).
- Secrets and credential handling (provider API keys, encrypted settings store, anything that must never reach the Corpus, logs, or the client).
- Data migrations and anything that deletes or irreversibly rewrites stored truth.
- Billing / metering and the publish path (`verified → published`).

If a change does **not** touch these, agent review + the four gates are sufficient.

## Development conventions

- **Stack:** React Router 7 (framework mode), TypeScript, Vitest, Tailwind v4, Clerk auth, deployed on Fly.io. See [README.md](README.md).
- **Specs:** add a feature spec in [docs/features/](docs/features/) from the template before building. Statuses: `Proposed` → `In progress` → `Shipped`.
- **Plans:** implementation plans live in [docs/superpowers/plans/](docs/superpowers/plans/) and are executed task-by-task with the superpowers plan-execution skills. Plans may declare a `**Status:**` line; a plan marked `Shipped` must have no unchecked task steps.
- **ADRs:** record durable architecture/governance decisions in [docs/architecture/adr/](docs/architecture/adr/) (see the README there).
- **Tests mirror source:** `foo.ts` ↔ `foo.test.ts`, pure dependency-injected functions, stub providers (see `app/lib/ai/extraction.ts` + `extraction.test.ts`).
