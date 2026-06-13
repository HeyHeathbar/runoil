# RunOil

**The Atomic Truth Engine. AI that thinks like an executive.**

RunOil is a high-value SaaS that becomes a company's system of record for how it actually
works, then publishes that governed truth into the AI tools the company already uses — Claude,
ChatGPT, Grok, or any model — through open standards. The wedge: companies deployed AI faster
than they organized for it, so their assistants answer fluently and often wrongly about internal
processes, policies, and decisions. RunOil captures the real operating truth through guided
discovery, reconciles it against what is documented and what staff actually live, governs it, and
serves it to whatever AI the company runs.

> **Status:** Pre-launch · founder-led · planning stage. This repository currently holds the
> planning, brand, and specification artifacts. Application code will follow the conventions in
> *Development conventions* below.

## What's in here

| Path | What it is |
|------|------------|
| `docs/business-plan-and-technical-spec.md` | **Master document** — full business plan (Part A) + technical specification & feature set (Part B), with appendices. |
| `docs/business-spec.md` | Condensed business specification (canonical short form). |
| `docs/product-plan.md` | The original product/architecture plan that seeded the project. |
| `docs/brand/brand-book.html` | **The Brand Bible** — identity system, palette, type, voice, lexicon, applications. |
| `docs/brand/brand-brief.docx` | Creative brief for the brand/identity engagement. |
| `pdf/product-overview.pdf` | Branded product explainer (PDF). |
| `pdf/business-plan-and-technical-spec.pdf` | Branded edition of the master document (PDF). |
| `docs/archive/` | Superseded document versions, kept for history. |

## The vocabulary (canonical)

- **Atomic Truth** — the verified unit of organizational truth (Process, Decision, Friction, Open Loop, Ownership, Definition-of-Done).
- **Corpus** — the living, governed body of Atomic Truths; the system of record. Plain-text, versioned, AI-organized.
- **Reality Gap** — the delta between what leadership states, what staff live, and what the documents claim.
- **the Guide** — the coaching-oriented assistant that runs discovery sessions.
- **Partner** — independent consultant who delivers RunOil; introduces and implements, never resells.

Full glossary in the master document (Appendix C).

## Document versioning

Each Markdown document carries its version in YAML front matter and a changelog table. Treat git
history as the source of truth for changes; superseded snapshots live in `docs/archive/`. Bump the
**minor** version for new sections or material changes and the **patch** version for edits, and
record every change in the document's own changelog.

## Development conventions (for when code lands)

Per the standing stack and workflow:

- **Stack:** TypeScript · React Router 7 (framework mode) · Tailwind + shadcn/ui (Shadcn Studio) · Prisma + PostgreSQL · Clerk (auth/RBAC) · Fly.io (hosting, region `dfw`).
- **Workflow:** GitHub Flow. `main` is always deployable; never commit directly to `main`. Branch per change (`feat/`, `fix/`, `chore/`, `docs/`) → PR → CI → merge → deploy.
- **Repos are private by default.** Never commit secrets; `.env` is local-only and gitignored. Use `fly secrets set` for production secrets.
- **Audit logging is always on** — authentication events and privileged actions, append-only, queryable.

## Confidentiality

These materials are confidential and pre-launch. The brand assets and business plan are not for
public distribution.
