# Feature: Consultant Cockpit

- **Status:** Proposed
- **Branch:** `feat/consultant-cockpit`
- **Owner:** heathbar
- **Date:** 2026-06-13

## Why

RunOil deliberately stayed out of the consumption layer — it publishes governed truth into the AI tools a company already uses (Claude, ChatGPT, etc.) and "replaces none." But the people who actually deliver RunOil — the consultants/partners — have no native surface to *work in*. They run discovery, manage a review queue, and demo the reality-gap across multiple clients, and today that means stitching together separate tools (and keeping a generic AI chat app like TypingMind open in another tab for everyday work).

The pain: the consultant's signature moment — *"this isn't the AI guessing, this is your verified reality, here's the source, here's the gap between what your execs said and what your staff actually do"* — has no home. The cockpit gives it one, and brings the consumption-layer features (chat, model picker, voice) in-house, grounded in governed truth in a way a generic chat tool structurally cannot match.

## What

A consultant-first, multi-client chat cockpit inside RunOil: one workspace for a consultant's entire book of business, unifying chat, the review queue, synthesis, and the Corpus per client — with a Chat tab whose answers are grounded in each client's reconciled truth and show their receipts.

The consultant's own practice is itself a **first-class RunOil tenant** — they use RunOil the way a client company does: their own Corpus/context, their own enabled modules, and their own model-provider API keys (bring-your-own-keys). The cockpit's "partner workspace" layer *is* this consultant tenant, and it appears in the client rail alongside the clients who have granted them access.

## Scope

- **In scope:**
  - Unified cockpit shell: persistent client rail · work-area tabs (**Chat / Queue / Synthesis / Corpus**) · context inspector.
  - **Multi-client command center** — the consultant switches between every client who has granted them access; cross-client portfolio view (review counts, alerts, open loops).
  - **Chat tab** with two modes:
    - **Truth mode** — strict, Corpus-grounded answers with receipts shown: answer-led insight, the reality-gap card (stated / actual / documented + severity), provenance chips, conflict flags, and the underlying Atomic Truth in the inspector.
    - **Open mode** — general AI (any model, voice) silently grounded in the client's verified truth so it never contradicts published facts.
  - Model picker + voice (in/out) available in both modes.
  - The **Consultant role** formalized as two layers (partner workspace + per-client scoped grant), default authority **propose-only**.
  - **Consultant as a first-class tenant** — their practice has its own Corpus/context (methodology, question libraries, their practice's operating truth) and its own enabled modules; it appears in the client rail as a tenant they own.
  - **Bring-your-own-keys (BYO keys)** — every tenant configures its own model-provider API keys; RunOil's model-agnostic provider layer routes a tenant's chat to that tenant's keys. The consultant working *inside a client* runs on **that client's keys**.
  - **Per-tenant modules** — a tenant's enabled feature set is configurable; consultant tenants and client tenants light up different modules.
- **Out of scope (for this slice):**
  - Employee-facing workspace deploy mode — *available as an optional per-client deploy later, never required*. Not built in this slice.
  - Presenter "reveal" control for the reality-gap (collapse-until-click). Default is inline; reveal is a fast-follow.
  - The Queue / Synthesis / Corpus tabs themselves are existing/planned subsystems surfaced here — their internals are not redesigned by this feature, only embedded in the cockpit shell.

## Affected layer(s)

- **Capture (the Guide)** — discovery is run from inside the cockpit.
- **Synthesize** — open loops / frictions / bottlenecks surfaced in the Synthesis tab and inline in Truth-mode answers.
- **Govern & publish** — Chat reads only published truth (Open mode) / queries the Corpus (Truth mode); propose-only authority feeds the existing verification gate.
- **Configuration plane** — consultant configures org-schema/rules where client-granted; per-tenant module enablement.
- **Partner platform** — the cockpit *is* the partner workspace surface; cross-tenant identity + per-tenant scoped grant; the consultant's own practice is a tenant.
- **Model layer** — the model-agnostic provider layer must resolve and use the **active tenant's** BYO keys per request.
- **Billing/metering** — BYO keys mean the tenant pays its own provider directly for consumption chat; metering must attribute model usage to the correct tenant.

## Data model impact

No new Atomic Truth **types** required. The cockpit reads existing fields heavily and must surface them well:

- `reality_gap` (stated / actual / documented + severity) — rendered as the Truth-mode reality-gap card.
- `provenance` (sessions/documents, speaker role with protected-cohort enforcement, quote/timestamp) — rendered as provenance chips; **staff input must render aggregated/protected only**, never attributed, via `access_class`.
- `conflict & ethos flags`, `status` (published / disputed), `owner`, `confidence` — rendered in chips and the inspector.

**RBAC / identity:** formalizes the existing "Partner (scoped)" role into two layers:
1. **Partner workspace identity** — cross-tenant; lives in the platform registry; spans granted tenants; hard-blocked from cross-tenant data co-mingling.
2. **Per-client scoped grant** — client-granted, revocable; permissions per the matrix below.

No Corpus schema migration anticipated; possible new view/index to power the cross-client portfolio (read-only aggregation of per-tenant review-queue counts for the authenticated partner, respecting isolation).

**Tenancy & keys** *(grounded in the actual architecture — file-based, Clerk-org tenancy; no Prisma/relational core):*
- A **tenant is a Clerk Org** (`orgId`); per-tenant data is path-isolated on disk (git-backed Corpus + per-org JSON stores). The cockpit's client rail maps onto Clerk's `OrganizationSwitcher` (already in the header).
- **Tenant kind** — a per-org config gains a `kind` (`client` | `consultant`/practice). A consultant tenant is a normal org with a different default module set; it owns its own Corpus/context like any tenant.
- **Per-tenant provider keys already exist** — `app/lib/ai/settings.server.ts` already stores per-org provider keys as JSON on an encrypted volume (`$AI_SETTINGS_ROOT/<orgId>.json`), redacted before reaching the client, never git-committed. The new work is **splitting that single key config into two roles**: an *engine* model (RunOil-managed default) and the org's *consumption/chat* BYO keys. Keys are never in the Corpus, never logged, never resolvable from another org's context.
- **Per-tenant module flags** — the per-org config carries enabled-module flags (e.g. `discovery`, `governance`, `publishing`, `cockpit_chat`, `methodology_library`), stored alongside the other per-org JSON. Drives which work-area tabs/features render.

## How it works

**Cockpit shell.** A unified three-region layout: left client rail (the consultant's granted clients, with review-queue badges), a center work-area that toggles Chat / Queue / Synthesis / Corpus for the *selected* client, and a right context inspector. Everything is scoped to one selected client at a time; the only cross-client surface is the portfolio overview, which shows counts/alerts but never co-mingles truth.

**Chat tab — Truth mode.** A natural-language query against the selected client's Corpus. The answer leads with the insight, then attaches receipts derived from the matched Atomic Truth(s): the reality-gap card, provenance chips (staff sources shown aggregated/protected), confidence, and conflict flags. The inspector shows the underlying Atomic Truth (type, status, owner, linked open loop) with a link into the Corpus tab. This is the demo/trust surface — the feature TypingMind cannot ship because it has no reconciled Corpus to be strict against.

**Chat tab — Open mode.** Behaves like a familiar general AI chat (any model via the existing model-agnostic provider layer, voice in/out) but every turn is grounded in the client's published truth under the hood so it never contradicts verified facts. Same composer; a Truth | Open toggle sets "how loud the receipts are."

**Consultant role & authority.** Default authority is **propose-only**: the consultant proposes Atomic Truths and interrogates the Corpus, but promotion `verified → published` stays with the client champion — consistent with the B6 invariant that contradictions are never auto-resolved. "Can verify & publish" remains a client-grantable elevation, not the default.

**Model split — BYO chat, RunOil-managed engine (decided).** Two distinct model responsibilities:
- **Consumption chat** (Truth/Open mode, model picker, voice) → **BYO keys**: runs on the active tenant's configured provider keys; user-initiated, so the tenant's model choice and bill are intuitive. *(Reconciliation note: today the single per-org `AiSettings` key powers the engine; this split makes the engine RunOil-managed by default and repurposes the org's keys for consumption chat — a deliberate behavior change, sequenced in the implementation plans.)*
- **Engine work** (extraction, reconciliation, synthesis, the Guide's in-session assistant) → **RunOil-managed model**: pinned centrally so B16 golden-set/regression evals stay valid, structured Atomic-Truth output stays reliable, async background reconciliation never surprise-bills a tenant's key, and the curation methodology (the moat) stays centrally controlled. The engine is not exposed to the tenant's model picker.
- **Residency escape hatch (Governed tier):** for clients who contractually require all data to flow through their own provider account, engine calls may be routed in-account while RunOil still pins model+prompts. This is a **separate feature** — see [enterprise-data-control.md](./enterprise-data-control.md) (Rung 1). Out of scope for the cockpit itself.

**Consultant as a tenant, BYO keys.** The consultant's practice is provisioned as its own tenant with its own Corpus (methodology, question libraries, the practice's operating truth) and its own enabled modules. It renders in the client rail as a tenant the consultant owns, alongside the clients who have granted them access. Every tenant — consultant or client — configures its own model-provider API keys; RunOil's model-agnostic provider layer resolves keys from the **active tenant** on each request. When the consultant works inside Acme's cockpit, chat runs on **Acme's keys** against **Acme's Corpus**; when they work in their own practice tenant, it runs on their keys against their Corpus. Keys are stored in the per-org settings store (encrypted volume, never git-committed, redacted before reaching the client — the existing `AiSettings` pattern), never written to a Corpus and never logged, and are never reachable from another tenant's context (consistent with strict tenant isolation). A tenant's enabled-module flags drive which work-area tabs and features render, so a consultant tenant and a client tenant can present different surfaces.

**Reuse.** This feature is a *surface* over existing subsystems (the Guide, Corpus, synthesis queries, review queue, publishing, the model-agnostic provider layer). It must not fork parallel logic — it embeds and composes what's already built/planned. BYO keys extend the existing model-agnostic provider layer (which already abstracts providers) with per-tenant key resolution rather than a new model path.

### Per-client permission matrix (default)

| Capability | Consultant default |
| --- | --- |
| Run discovery sessions (the Guide) | ● yes |
| Propose Atomic Truths · Chat the Corpus (Truth + Open) | ● yes |
| View staff input | ◐ aggregated / protected only — never attributed |
| Configure org-schema / source-authority / rules | ◐ client-granted |
| Verify & publish truths | ○ no by default (client-grantable elevation) |
| View audit log | ◐ scoped to own actions |
| Manage billing / subscription | ○ never |
| See two clients' data at once | ○ hard-blocked (tenant isolation) |

## Acceptance criteria

- [ ] A consultant sees only clients who have granted them access, in one cockpit, with per-client review-queue badges.
- [ ] Selecting a client scopes the entire work-area (Chat / Queue / Synthesis / Corpus) and inspector to that client.
- [ ] The cross-client portfolio view shows counts/alerts without exposing any client's truth content to another client's context.
- [ ] Chat tab supports a Truth | Open mode toggle, a model picker, and voice in/out in both modes.
- [ ] In Truth mode, an answer renders: the insight, the reality-gap card (stated/actual/documented + severity), provenance chips, conflict flags, and the underlying Atomic Truth in the inspector.
- [ ] Staff-sourced provenance is rendered aggregated/protected only; no path exposes attributed staff input to the consultant.
- [ ] In Open mode, answers are grounded in the client's published truth and do not contradict published Atomic Truths.
- [ ] The Consultant role enforces propose-only by default; `verified → published` is blocked unless the client grants the elevation; all consultant actions are audit-logged.
- [ ] Tenant isolation holds: no query or view returns data from a client the consultant is not currently scoped to.
- [ ] The consultant's own practice is provisioned as a tenant with its own Corpus and a consultant-default module set, and appears in their client rail.
- [ ] Each tenant configures its own model-provider API keys; chat in a given tenant's cockpit runs on that tenant's keys; a tenant's keys are never resolvable from another tenant's context.
- [ ] API keys are stored in the per-org settings store (encrypted volume, never git-committed), redacted before reaching the client, never persisted to the Corpus, and never written to logs.
- [ ] Enabled-module flags drive which work-area tabs/features render; disabling a module hides its surface for that tenant.

## Open questions

- **Reality-gap reveal:** default inline (approved) vs. an optional presenter "reveal" (collapse-until-click) for the dramatic in-client moment — ship inline now, reveal as fast-follow?
- **Open-mode grounding depth:** does Open mode always inject published truth, or only when the query appears company-specific? (Cost/latency vs. always-grounded guarantee.)
- **Model picker scope:** does the client's publishing/governance policy constrain *which* models the consultant may pick in a given client's cockpit, or is the picker purely consultant-side?
- **Portfolio aggregation:** is the cross-client overview computed live per request, or via a maintained per-partner index? (Isolation must hold either way.)
- **Voice transcripts:** are Chat voice interactions subject to the same consent/recording rules as discovery sessions, or treated as ephemeral?
- **Key fallback / onboarding:** if a tenant hasn't configured keys yet, does consumption chat hard-block, or is there a RunOil-managed trial/default? (BYO is decided; this is just the empty-state behavior.)
- *(Engine in-account routing moved to its own feature — see [enterprise-data-control.md](./enterprise-data-control.md).)*
- **Module catalog:** what is the canonical list of modules, and who can toggle them — RunOil admin only, or the tenant's champion within rails?
- **Consultant-practice modules:** which modules are on by default for a consultant tenant vs. a client tenant?
