# Feature: Enterprise Data Control — In-Account Engine Routing (Rung 1)

- **Status:** Proposed
- **Branch:** `feat/enterprise-data-control`
- **Owner:** heathbar
- **Date:** 2026-06-13

## Why

Compliance-strict buyers (regulated mid-market, EU AI Act exposure, security-led procurement) will not let their operating truth be processed through a vendor's model account. For them, "your data never leaves your boundary" is a budgeted requirement, not a nice-to-have — and today RunOil's managed engine (which processes every transcript and document) is a hard blocker for those deals.

This feature is the first rung of a **data-control ladder** that turns that blocker into a competitive differentiator: let the client keep RunOil's engine quality while routing the actual model calls through *their own* provider account.

## What

For an opted-in tenant, RunOil's **engine** work (extraction, reconciliation, synthesis, the Guide's in-session assistant) is routed through the **client's own model-provider account** — while RunOil still pins the **model version and prompts**. Only the billing/account path changes; the model and logic do not, so quality and evals are unchanged.

## The data-control ladder (context — only Rung 1 is in scope here)

| Rung | Client controls | Where it runs | Status |
| --- | --- | --- | --- |
| 0 · Managed (default) | nothing extra | RunOil cloud | shipped/standard |
| **1 · In-account engine** | **model calls flow through their provider account; RunOil pins model+prompts** | **RunOil cloud** | **this spec** |
| 2 · Dedicated / single-tenant | isolated instance + region (US/EU) | RunOil cloud, isolated | **roadmap — different architecture, separate spec** |
| 3 · On-premise / customer VPC | whole system inside their boundary | their infrastructure | north-star |

> **Rung 2 reminder:** dedicated/single-tenant is not an extension of Rung 1 — it changes provisioning, isolation, and infra topology. Do **not** fold it into this spec. Revisit as its own design pass after Rung 1 ships.

## Scope

- **In scope (Rung 1):**
  - Per-tenant **engine routing mode**: `managed` (default) | `in_account`.
  - Secure storage of the client's provider-account credentials and the model/deployment mapping for the **pinned** model.
  - The model-agnostic provider layer resolves engine-call credentials from the tenant's in-account config when enabled — using RunOil's pinned model id + prompt templates unchanged.
  - Preflight check that the client's account exposes the required pinned model/version; clear failure if not.
  - Audit-log entries recording that an engine call was routed in-account (without leaking credentials).
- **Out of scope:**
  - Rung 2 (dedicated/single-tenant) and Rung 3 (on-prem) — separate specs.
  - Consumption-side chat keys (already covered by the cockpit's BYO-keys — this feature is *engine-side only*).
  - Letting the client choose/override the engine **model** — RunOil still pins it; in-account changes only whose account the call rides on.

## Affected layer(s)

- **Model layer** — per-tenant credential resolution + routing for engine calls; pinned model/prompt enforcement.
- **Security & compliance** — credential storage, audit trail, the "data flows through your account" guarantee.
- **Configuration plane** — enabling the tier and entering provider-account config (Governed-tier gated).
- **Billing/metering** — in-account model spend is the client's (paid to their provider); RunOil meters the engine *work* but not the inference cost for these tenants.

## Data model impact

- **Tenant engine-routing config:** `engine_routing_mode` (`managed` | `in_account`); when `in_account`: provider kind (e.g. Azure OpenAI / Bedrock / Anthropic direct), the account credentials reference (encrypted secret handle, **never** the raw secret in the relational core or Corpus), and the model/deployment name that maps to RunOil's pinned model.
- **Pinned-model registry:** RunOil's canonical engine model id + version that an in-account deployment must satisfy (so evals stay valid).
- No Atomic Truth schema change. Credentials live in secrets management, never in the Corpus, never logged.

## How it works

When an engine task runs (extraction/reconciliation/synthesis/Guide assist) for an `in_account` tenant, the provider layer loads that tenant's provider-account credentials and target deployment, then issues the call with **RunOil's pinned model id and prompt templates**. Because model + prompts are identical to the managed path, outputs are equivalent and B16 golden-set/regression evals remain valid — the only change is which account the request bills to and flows through.

A **preflight** verifies the client's account can serve the pinned model/version before the tier is marked active; if a later pinned-model bump isn't yet available in the client's account, engine tasks for that tenant surface a clear "pinned model unavailable in your account" state rather than silently degrading to a different model. Routing decisions are written to the audit log (which mode, which account reference — never the secret).

Consumption-side chat is unaffected here; it already uses the tenant's BYO keys per the cockpit spec. This feature is strictly the engine-side counterpart for clients who need *all* processing — including background reconciliation — inside their own account.

## Acceptance criteria

- [ ] A tenant can be set to `in_account` engine routing (Governed-tier gated) and supply provider-account credentials + the pinned-model deployment mapping.
- [ ] Engine calls for that tenant run on the client's account using RunOil's pinned model id and prompts — verified by output parity against the managed path on the golden set.
- [ ] Credentials are stored encrypted in secrets management; they never appear in the relational core, the Corpus, or any log.
- [ ] Preflight blocks activation if the client's account cannot serve the pinned model/version, with a clear message.
- [ ] A pinned-model bump that the client's account lacks surfaces an explicit error state, never a silent model substitution.
- [ ] Audit log records routing mode for engine calls without exposing credentials.
- [ ] `managed` tenants are completely unaffected (default path unchanged).

## Open questions

- **Provider coverage v1:** which provider accounts to support first — Azure OpenAI, Amazon Bedrock, Anthropic direct? (Pick by where the pinned engine model is actually deployable.)
- **Pinned-model version policy:** how much lead time/notice on a pinned-model bump so in-account clients can provision the new version before RunOil cuts over.
- **Contract trigger:** what contractually enables this (Governed tier add-on? specific DPA clause?) and who flips the switch (RunOil admin vs. client champion).
- **Failure posture:** if the client's account is down/over-quota, do engine tasks queue-and-retry or hard-fail for that tenant?
