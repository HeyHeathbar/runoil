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

## Scope

- **In scope:**
  - Unified cockpit shell: persistent client rail · work-area tabs (**Chat / Queue / Synthesis / Corpus**) · context inspector.
  - **Multi-client command center** — the consultant switches between every client who has granted them access; cross-client portfolio view (review counts, alerts, open loops).
  - **Chat tab** with two modes:
    - **Truth mode** — strict, Corpus-grounded answers with receipts shown: answer-led insight, the reality-gap card (stated / actual / documented + severity), provenance chips, conflict flags, and the underlying Atomic Truth in the inspector.
    - **Open mode** — general AI (any model, voice) silently grounded in the client's verified truth so it never contradicts published facts.
  - Model picker + voice (in/out) available in both modes.
  - The **Consultant role** formalized as two layers (partner workspace + per-client scoped grant), default authority **propose-only**.
- **Out of scope (for this slice):**
  - Employee-facing workspace deploy mode — *available as an optional per-client deploy later, never required*. Not built in this slice.
  - Presenter "reveal" control for the reality-gap (collapse-until-click). Default is inline; reveal is a fast-follow.
  - The Queue / Synthesis / Corpus tabs themselves are existing/planned subsystems surfaced here — their internals are not redesigned by this feature, only embedded in the cockpit shell.

## Affected layer(s)

- **Capture (the Guide)** — discovery is run from inside the cockpit.
- **Synthesize** — open loops / frictions / bottlenecks surfaced in the Synthesis tab and inline in Truth-mode answers.
- **Govern & publish** — Chat reads only published truth (Open mode) / queries the Corpus (Truth mode); propose-only authority feeds the existing verification gate.
- **Configuration plane** — consultant configures org-schema/rules where client-granted.
- **Partner platform** — the cockpit *is* the partner workspace surface; cross-tenant identity + per-tenant scoped grant.

## Data model impact

No new Atomic Truth **types** required. The cockpit reads existing fields heavily and must surface them well:

- `reality_gap` (stated / actual / documented + severity) — rendered as the Truth-mode reality-gap card.
- `provenance` (sessions/documents, speaker role with protected-cohort enforcement, quote/timestamp) — rendered as provenance chips; **staff input must render aggregated/protected only**, never attributed, via `access_class`.
- `conflict & ethos flags`, `status` (published / disputed), `owner`, `confidence` — rendered in chips and the inspector.

**RBAC / identity:** formalizes the existing "Partner (scoped)" role into two layers:
1. **Partner workspace identity** — cross-tenant; lives in the platform registry; spans granted tenants; hard-blocked from cross-tenant data co-mingling.
2. **Per-client scoped grant** — client-granted, revocable; permissions per the matrix below.

No Corpus schema migration anticipated; possible new view/index to power the cross-client portfolio (read-only aggregation of per-tenant review-queue counts for the authenticated partner, respecting isolation).

## How it works

**Cockpit shell.** A unified three-region layout: left client rail (the consultant's granted clients, with review-queue badges), a center work-area that toggles Chat / Queue / Synthesis / Corpus for the *selected* client, and a right context inspector. Everything is scoped to one selected client at a time; the only cross-client surface is the portfolio overview, which shows counts/alerts but never co-mingles truth.

**Chat tab — Truth mode.** A natural-language query against the selected client's Corpus. The answer leads with the insight, then attaches receipts derived from the matched Atomic Truth(s): the reality-gap card, provenance chips (staff sources shown aggregated/protected), confidence, and conflict flags. The inspector shows the underlying Atomic Truth (type, status, owner, linked open loop) with a link into the Corpus tab. This is the demo/trust surface — the feature TypingMind cannot ship because it has no reconciled Corpus to be strict against.

**Chat tab — Open mode.** Behaves like a familiar general AI chat (any model via the existing model-agnostic provider layer, voice in/out) but every turn is grounded in the client's published truth under the hood so it never contradicts verified facts. Same composer; a Truth | Open toggle sets "how loud the receipts are."

**Consultant role & authority.** Default authority is **propose-only**: the consultant proposes Atomic Truths and interrogates the Corpus, but promotion `verified → published` stays with the client champion — consistent with the B6 invariant that contradictions are never auto-resolved. "Can verify & publish" remains a client-grantable elevation, not the default.

**Reuse.** This feature is a *surface* over existing subsystems (the Guide, Corpus, synthesis queries, review queue, publishing, the model-agnostic provider layer). It must not fork parallel logic — it embeds and composes what's already built/planned.

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

## Open questions

- **Reality-gap reveal:** default inline (approved) vs. an optional presenter "reveal" (collapse-until-click) for the dramatic in-client moment — ship inline now, reveal as fast-follow?
- **Open-mode grounding depth:** does Open mode always inject published truth, or only when the query appears company-specific? (Cost/latency vs. always-grounded guarantee.)
- **Model picker scope:** does the client's publishing/governance policy constrain *which* models the consultant may pick in a given client's cockpit, or is the picker purely consultant-side?
- **Portfolio aggregation:** is the cross-client overview computed live per request, or via a maintained per-partner index? (Isolation must hold either way.)
- **Voice transcripts:** are Chat voice interactions subject to the same consent/recording rules as discovery sessions, or treated as ephemeral?
