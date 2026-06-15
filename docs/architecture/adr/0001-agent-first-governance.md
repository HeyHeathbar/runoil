# ADR-0001: Agent-first governance model

- **Status:** Accepted
- **Date:** 2026-06-13
- **Deciders:** heathbar

## Context

RunOil is developed almost entirely by agents. With no human reviewing every line, two failure modes threaten correctness: (1) the durable record of *what we meant to build* drifts from the code, and (2) the only thing catching agent mistakes is more agents — which share correlated blind spots (same model family, same spec ambiguity propagated downstream, same susceptibility to a poisoned input). Relying on agent-to-agent review alone removes the one independent error channel a human team normally has.

## Decision

Adopt an agent-first governance model with these load-bearing rules:

1. **Specs are authoritative for intent; tests are authoritative for behavior.** Feature specs ([docs/features/](../../features/)), plans ([docs/superpowers/plans/](../../superpowers/plans/)), and ADRs are the durable record of intent and are treated as the deliverable. But the code is what ships and where bugs live, so executable tests — not prose — are the proof that the code matches the spec. A feature is not done until its tests pass.

2. **Executable verification is the primary backstop, not agent review.** Four quality gates run on every change — Types, Behavior (tests), Build, and Governance (spec reconciliation). These don't share the cognitive blind spots that "ask another agent" does. Agent-to-agent review is retained as an additional layer, not the sole guard.

3. **A defined set of high-risk surfaces still requires one human line-level review** — auth / tenant isolation, secrets, destructive data migrations, and the billing / publish path. Everywhere else, agent review plus the four gates suffice.

4. **The shipping PR is the reconciliation gate.** A feature spec marked `Shipped` must have every acceptance-criteria box checked; the Governance gate (`npm run governance`) enforces this in CI and in a local pre-commit hook.

## Consequences

- Specs and tests cannot silently rot: the Governance gate fails the build if a `Shipped` spec has unmet criteria, and the Behavior gate fails if tests don't pass.
- Two sources of truth (specs for intent, tests for behavior) are reconciled by the gates rather than by manual diligence.
- High-risk changes are slower by design — they wait on a human read. This is an accepted cost.
- "Code is a rendering of the spec" is bounded: it never means "skip code-level verification," because the Behavior gate owns correctness.

This ADR is itself the governance record; [CLAUDE.md](../../../CLAUDE.md) is its operational rendering.
