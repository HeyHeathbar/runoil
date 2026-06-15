# Architecture Decision Records

Durable, append-only record of significant architecture and governance decisions. Under agent-first governance these are part of the *primary artifact* (see [CLAUDE.md › Governance](../../../CLAUDE.md)): the code renders these decisions.

- One file per decision: `NNNN-short-title.md` (zero-padded, sequential).
- Never edit a decided ADR's substance. To change a decision, add a new ADR that **supersedes** the old one and update the old one's Status to `Superseded by ADR-NNNN`.
- Statuses: `Proposed` · `Accepted` · `Superseded by ADR-NNNN` · `Deprecated`.

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-agent-first-governance.md) | Agent-first governance model | Accepted |
