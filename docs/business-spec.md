---
title: RunOil — Business Specification
version: 0.2.2
status: Working draft
date: 2026-06-13
owner: "[to be provided]"
tags: [runoil, business-spec, brand-bible]
---

# RunOil — Business Specification

> The product, the moat, the business model, and the canonical lexicon — written to fold into the Brand Bible.

## Document control

| Version | Date | Author | Summary of changes |
|---|---|---|---|
| 0.2.2 | 2026-06-13 | _[owner]_ | Corrected the frontend stack: Tailwind + shadcn/ui (Shadcn Studio), not Polaris — RunOil is a standalone, self-branded product, not a Shopify-admin app. |
| 0.2.1 | 2026-06-05 | _[owner]_ | Locked customer-of-record: partners are introducers/implementers, **not resellers** — the end client subscribes to RunOil directly. Removed the corresponding open decision and the hedge in §13. |
| 0.2 | 2026-06-05 | _[owner]_ | Business model reframed to **Partner First**. Software positioned as a high-value SaaS — the **Atomic Truth Engine**. Implementation partners are the front line, set their own billing, and keep 100% of their billables; RunOil pays a referral commission to consultants who introduce the software and takes **no cut of partner services**. Added Atomic Truth Engine to the lexicon and a customer-of-record confirmation to open decisions. |
| 0.1 | 2026-06-05 | _[owner]_ | Initial working spec: positioning, problem, market, competition, core concepts, architecture, data model, Corpus/governance, technical foundation, moat, business model, operating model, roadmap, risks, metrics, lexicon, open decisions. |

_Versioning: bump the **minor** number for new sections or material changes, the **patch** number for edits and corrections. Record every change in the table above._

## At a glance

| | |
|---|---|
| **Product** | RunOil — the Atomic Truth Engine: a high-value SaaS for the AI era |
| **Category** | Organizational truth & AI-governance layer (a new category, not enterprise search) |
| **Core promise** | Make every AI tool a company already uses trustworthy by giving it the company's real, governed operating truth |
| **Target market** | Mid-market companies already using AI (Claude, ChatGPT, Grok) |
| **Go-to-market** | **Partner-first**: implementation partners are the front line, set their own billing, and keep 100% of services; RunOil provides the SaaS, owns the software relationship, and pays a referral commission (Shopify model) |
| **Defensibility** | ERP-style: data gravity, accumulated configuration, audit/governance, switching cost |
| **Operating model** | Company of one — founder plus AI agents; partners do client delivery |
| **Status** | Pre-launch; founder-led; design partners identified |

## Contents

1. [Executive summary](#1-executive-summary)
2. [Positioning & category](#2-positioning--category)
3. [The problem](#3-the-problem)
4. [Target market & ideal customer](#4-target-market--ideal-customer)
5. [Competitive landscape & differentiation](#5-competitive-landscape--differentiation)
6. [Core concepts & vocabulary](#6-core-concepts--vocabulary)
7. [Product architecture](#7-product-architecture)
8. [The capture engine](#8-the-capture-engine)
9. [The Atomic Truth data model](#9-the-atomic-truth-data-model)
10. [The Corpus, governance & publishing](#10-the-corpus-governance--publishing)
11. [Technical foundation](#11-technical-foundation)
12. [The moat](#12-the-moat)
13. [Business model](#13-business-model)
14. [Company-of-one operating model](#14-company-of-one-operating-model)
15. [Roadmap](#15-roadmap)
16. [Risks & guardrails](#16-risks--guardrails)
17. [Success metrics](#17-success-metrics)
18. [Lexicon](#18-lexicon)
19. [Open decisions](#19-open-decisions)

---

## 1. Executive summary

RunOil is the system of record for how a company actually works. As organizations adopt AI assistants — Claude, ChatGPT, Grok — those tools are only as good as the truth they are given, and most companies have never captured that truth in a usable, governed form. RunOil captures it through guided discovery, reconciles it against what is documented and what staff actually live, governs it, and publishes it into the AI tools the company already uses. The result: the company's AI stops being confidently wrong about the company's own business.

The model is **partner-first**: independent implementation partners are the front line — they sell, deliver, and set their own billing, keeping 100% of their services revenue — while RunOil provides the SaaS (the Atomic Truth Engine), owns the software relationship and the data, and pays partners a referral commission for introductions without taking any cut of their billables. Defensibility is ERP-style — data gravity, accumulated configuration, audit and governance, and compounding switching cost — not features. It runs as a company of one: the founder plus AI agents, with partners carrying the client delivery.

## 2. Positioning & category

**Positioning statement (draft).** For mid-market organizations adopting AI, RunOil is the neutral system of record for organizational truth that makes every AI tool trustworthy — because it captures, reconciles, and governs how the company actually works. Where enterprise search and AI assistants retrieve what is already written, RunOil establishes what is true.

**Category.** RunOil deliberately sits outside the crowded "AI search / knowledge assistant" category. It is a governance and truth layer, not a retrieval engine. It does not replace any existing tool; it makes the company's chosen AI tools trustworthy. This distinction must hold across product, brand, and sales.

**The one-line promise.** Stop your AI from being confidently wrong about your own business.

## 3. The problem

Mid-market companies have adopted AI faster than they have organized for it. Their assistants answer fluently — and often incorrectly — about internal processes, policies, and decisions, because no one has curated the ground truth, and because what is written down frequently does not match what actually happens. That gap between the documented and the real is where trust in AI quietly breaks. RunOil exists to close it.

## 4. Target market & ideal customer

**Segment: mid-market.** Chosen deliberately. Small business will not pay enough to sustain the product; enterprise will out-cycle a solo founder on procurement and security review. Mid-market is large enough to pay and fast enough to close.

**Qualifying signal: "has AI, hasn't fixed truth."** The ideal customer has already rolled out AI to staff but has not curated its operating truth — so the AI is already producing confident, wrong answers. That live pain is the opening.

**Primary buyer.** A technical or operations leader (the AI champion) accountable for making the company's AI investment deliver. Pragmatic, time-poor, skeptical of hype, sensitive to trust and security.

**Secondary audience.** The independent AI consultants who deliver RunOil and act as the channel; the brand and product must make them proud to represent it.

## 5. Competitive landscape & differentiation

The lane is crowded and well-funded — Glean (a multi-billion-dollar enterprise knowledge-graph search company), plus Notion AI, Slack AI, Microsoft Copilot, Guru, GoSearch and others. Entering as "another AI knowledge tool" would fail. The gaps are structural:

- **They retrieve; RunOil reconciles.** Incumbents surface what already exists in documents. RunOil captures truth that lives in no document and reconciles conflicting versions of it.
- **They are often locked to an ecosystem; RunOil is neutral.** Notion, Slack and Copilot embed AI in their own tool. RunOil is model-neutral by design and sits above whichever tools a company chooses.
- **They are enterprise and index-heavy; RunOil is mid-market and fast.** Incumbents are known for slow, expensive deployments. RunOil ships opinionated and installs in weeks.

RunOil can even sit above a Glean or a Copilot: they surface candidate information; RunOil is the governed source that decides what is actually correct and publishes it to every model.

## 6. Core concepts & vocabulary

These terms are canonical and shared with the Brand Bible. Consistent language across product, sales, and brand is itself a trust signal.

### Atomic Truth
The verified unit of organizational truth — a single typed, sourced, owned fact about how the company works. Types: Process, Decision, Friction, Open Loop, Ownership, Definition-of-Done. (Full schema in section 9.)

### Corpus
The living, governed body of Atomic Truths — the system of record. Kept as plain-text, human-readable, versioned files; organized and maintained by RunOil's own model acting as librarian, never as a black box. In the Software 2.0 sense, the Corpus is the program: the company's real operating truth is what drives its AI, not hand-written rules.

### Reality Gap
The delta between three views of the truth — what leadership believes (stated), what staff actually live (actual), and what the documents claim (documented). Surfacing and owning every gap is RunOil's signature output and the thing retrieval tools cannot produce.

### the Guide
The coaching-oriented assistant that runs discovery sessions on the interviewer's screen — an objective-driven question library, not a linear script. It tracks coverage, suggests probes when an Atomic Truth is incomplete, and flags live contradictions. "A teleprompter for objectives, not a call-center script."

### Configure Group
The consultant plus client champions who configure and govern an instance — the people who shape the schema, authority rules, and what publishes where. Where the moat accumulates.

## 7. Product architecture

### Three layers

1. **Capture.** The Guide, recorded discovery sessions, and follow-up document ingestion. The wedge and the proprietary data moat — truth elicited from people, not scraped from files.
2. **Synthesize.** Friction, bottlenecks, open loops, and definition-of-done gaps. These are not separate detectors — they are queries over the Corpus (e.g., open loops = Decisions with no closing event; bottlenecks = Processes with convergent dependencies).
3. **Govern & publish.** The Corpus as a governed system of record that publishes verified truth to the company's AI tools via open standards.

### Two planes

- **Consumption plane (read).** Employees' Claude / ChatGPT / Grok pull governed truth via MCP and Agent Skills. Invisible and frictionless.
- **Configuration & governance plane (write/govern).** The Configure Group defines schema, authority hierarchy, conflict rules, publishing targets, approval workflows, and reality-gap intake. Usable by a functional group, not only engineers — the line between a software product and a bespoke build.

### Design principle: opinionated framework, bounded configuration

ERP's curse is infinite configurability and multi-quarter implementations. RunOil ships strong, opinionated defaults — industry templates, sane authority hierarchies, pre-built reality-gap workflows — and lets the Configure Group adjust within rails. This keeps deployment to weeks and is itself a wedge against slow incumbents.

## 8. The capture engine

### Discovery sessions
Recorded, AI-processed coaching calls. The Guide surfaces questions tied to the session's objective and to what has already been said; the interviewer picks, skips, reorders, or improvises. Role asymmetry is deliberate: decision-maker sessions map the intended organization (stated); staff sessions map the actual (lived). Triangulating the two generates the Reality Gap automatically.

### Follow-up documents
The Guide listens for document references and turns each into a tracked request; a referenced document that never arrives is itself an Atomic Truth of type Open Loop. When a document arrives, RunOil both proposes new Atomic Truths from it and tests existing ones, flagging each for review as:

- **Corroborates** (raises confidence)
- **Contradicts** (opens a reality gap; status → disputed)
- **Stale** (past valid_through or superseded)
- **Orphaned** (a process nobody mentioned — a shadow process)
- **Missing** (referenced but does not exist)

Documents arrive after calls, so the Corpus is living: a truth verified Monday can drop to disputed by a document uploaded Thursday. This creates a standing review queue — and therefore recurring consultant work and recurring revenue. A documentation-gap diagnostic ("you reference fourteen SOPs; four don't exist, three are stale, two contradict staff") falls out for free.

### Verification gate
RunOil proposes; the consultant adjudicates. The human gate keeps the Corpus clean, keeps the consultant in the value loop, and serves as the governance checkpoint before anything publishes. Contradictions are never auto-resolved.

### Trust by design
Decision-maker input is attributed; staff input is aggregated and source-protected. Consent and purpose-limitation are not compliance box-ticking — they are what keeps staff input honest enough to be worth capturing. A session or governance feature that reads as surveillance would poison the data the product depends on.

## 9. The Atomic Truth data model

The atomic unit, and the spine everything hangs off. It maps directly to a relational schema (Prisma / PostgreSQL).

| Field | What it holds |
|---|---|
| `id` | Unique identifier. |
| `type` | Process · Decision · Friction · Open Loop · Ownership · Definition-of-Done (extensible: Policy/Rule, Metric). |
| `statement` | The canonical one-line expression of the truth. |
| `status` | proposed → verified → published → disputed → retired. |
| `provenance` | Source session(s) and/or document(s); speaker role (attributed for decision-makers, protected cohort for staff); quote and timestamp. |
| `owner` | The accountable real-world person or role. |
| `confidence` | Strength of evidence; single-source vs. corroborated across sources. |
| `reality_gap` | stated / actual / documented values, plus a severity rating. The signature field. |
| `relationships` | Links to related Atomic Truths (e.g., an Open Loop to the Decision that never closed). |
| `conflict & ethos flags` | Contradictions with other truths, or with stated company principles. |
| `temporal` | created, last_verified, valid_through (relevance horizon). |
| `access_class` | Visibility/permission level; enforces staff protection and tenant isolation at the data layer. |

## 10. The Corpus, governance & publishing

**Form.** Plain-text, markdown, git-versioned, human-readable and inspectable. The model organizes and maintains it; it does not hide it. Transparency here is both a philosophical stance and a trust feature.

**Publishing.** Verified Atomic Truths are published to the company's AI tools through two open standards — MCP for data/context access and Agent Skills for packaged procedures — so every assistant works from the same governed reality, regardless of vendor.

**AI-usage governance.** Because RunOil is the context layer that AI tools pull truth through, it has a natural governance vantage point — approved-tool enforcement, aggregate usage, data-leak prevention, and cost/token visibility — without ever reading an individual's screen. This stays strictly at the org / policy / cost level. It is never individual monitoring.

## 11. Technical foundation

- **Model-agnostic by standard, not by integration count.** Build all model calls behind one clean interface; ship on a single model first (recommended: Claude), and add a second only when a paying customer's contract requires it. Claim agnostic-capable from day one without maintaining three integrations.
- **Open standards.** MCP (now stewarded under a neutral foundation and adopted across Claude, ChatGPT Business/Team/Enterprise, and Grok) and Agent Skills (an open, cross-platform standard). The plumbing is commodity — which is why the moat must live elsewhere.
- **Stack.** React Router 7 with Tailwind and shadcn/ui (Shadcn Studio) on the front end; Prisma + PostgreSQL for data; Clerk for auth and RBAC; Fly.io for hosting; GitHub Flow for delivery. The usage meter is built into the architecture from day one.

## 12. The moat

Modeled on why ERP is defensible — not its code, but four compounding assets. RunOil has an analog for each:

1. **System of record / data gravity.** As every AI tool pulls truth from the Corpus, leaving becomes organ failure. The core moat; everything else serves it.
2. **Accumulated configuration.** Schema, authority hierarchy, conflict rules, and the history of resolved reality gaps — company-specific and non-transferable.
3. **Embedded process + audit.** An AI-governance system of record: what truth was approved, surfaced to which model, by whom, when. A compliance moat with a regulatory tailwind.
4. **Compounding switching cost.** Git-backed temporal truth — not just current truth but how it evolved. The longer it runs, the more irreplaceable.

**Honest caveat.** The plumbing (MCP, Skills) is commodity open standards; exposing data to an LLM is not the moat. Defensibility is the curation methodology, ongoing maintenance, the Reality Gap, and accumulated configuration plus data gravity. The certified-consultant ecosystem is the fifth, distribution-side moat.

## 13. Business model

**Partner First.** The business is partner-first by design. Independent implementation partners are the front line — they find the clients, run the discovery, deliver the engagement, and own the client conversation. RunOil's job is to make the product so good that partners build their practice on it. The software earns its keep; the partners earn the relationship.

### Product vs. service
- **RunOil (the SaaS).** A high-value subscription product — the **Atomic Truth Engine**: it captures, reconciles, governs, and publishes the Corpus. This is what RunOil builds, sells, and maintains.
- **The engagement (the service).** Discovery sessions, implementation, configuration, and ongoing adjudication — delivered by the partner, not by RunOil.

### Who delivers, who pays
- **Partners are the front line.** They sell and deliver; RunOil stays out of the room except to support the partner.
- **Partners set their own billing and keep 100% of it.** They price their services however they like; RunOil takes **no cut of partner billables**, ever.
- **RunOil owns the SaaS relationship.** The end company is the customer of record for the software subscription and owns its Corpus. **Partners are not resellers** — they introduce and implement; they do not buy or resell the subscription. The subscription, renewal, and Corpus stay with RunOil regardless of which partner is in the room, which is what makes the partner impossible to disintermediate around.
- **RunOil pays a referral commission** to consultants who introduce the software — a recurring percentage of the subscription (20% is the Shopify anchor), paid on active paying clients. It rewards the introduction without ever touching the partner's services revenue.

### The data-ownership rule (non-negotiable)
The system of record belongs to the client company; the consultant gets revocable, scoped, audited access — never ownership. Consequences: removing a consultant leaves the Corpus intact (the client keeps paying RunOil; the consultant keeps the lifetime referral commission but loses services revenue); a consultant's methodology and templates travel across their clients, but a client's Atomic Truths never cross tenants. Strict isolation, always.

### Consultant registry (two systems)
- **Platform registry.** RunOil's partner program — apply, vet, approve; certification and performance tiers later. The "directory of consultants who use the software."
- **Tenant access control.** Each client grants and revokes specific consultants on its own instance (the Shopify collaborator model). Client-held control is load-bearing — it is what asserts client ownership.

### Pricing
Direction: usage-based ("dynamic by use"); exact numbers deferred. Principles locked now:

- **Meter on a value-aligned metric** you want the customer to do more of (Atomic Truths under management, governed sources, seats consuming truth, sessions run) — never per-query or per-token, which would throttle the data gravity that is the moat.
- **Hybrid, not pure consumption** — a base platform fee for mid-market budget predictability plus a usage component for expansion.
- **Build the meter in from day one** — price can be deferred; instrumentation cannot.

**App ecosystem.** A Shopify App Store analog (a cut of partner-built apps) is a credible third revenue stream — deferred until there is a platform and partner base to support it.

## 14. Company-of-one operating model

"Company of one" means one human; every other role is an AI agent or AI-assisted workflow. AI agents and Cowork collapse the labor of marketing, content, tier-1 support, research, operations, and much of engineering — letting one person run what once needed several. The founder remains the accountable face for sales, security and data agreements, and the client relationship. Client delivery touch is carried by the partner channel. Early on, the founder is the first partner: running real discovery sessions on design-partner companies both dogfoods the product and hardens the methodology and templates before anyone else touches them.

## 15. Roadmap

1. **Phase 1 — Wedge / MVP.** The Guide (template-led, strong post-call processing, lightweight live coverage tracking — not real-time wizardry first), the Atomic Truth model, the Corpus (plain-text, versioned), Reality Gap reconciliation, and single-model publishing via MCP/Skills. Founder runs sessions on design partners.
2. **Phase 2 — Configuration & governance plane.** Functional-user configuration with opinionated templates and bounded config; document ingestion and flagging; the verification/review queue.
3. **Phase 3 — Channel.** Consultant registry (platform + tenant access control), referral/commission mechanics, partner onboarding; a second model integration when a paying client requires it.
4. **Phase 4 — Scale.** AI-usage governance, analytics, certification and tiers, and the app ecosystem.

## 16. Risks & guardrails

- **Surveillance perception.** If sessions or usage governance feel like employee monitoring, staff stop being honest and the data dies. Consent, purpose-limitation, staff aggregation; governance at org/policy level only.
- **Scope sprawl.** A solo founder cannot build the whole list in parallel. Hold the sequence: capture → synthesize → govern.
- **Commodity plumbing.** Keep verification human-gated and the Corpus accumulating; the moat is methodology and data gravity, not features.
- **Configurability hell.** Stay opinionated; protect fast deployment.
- **Channel disintermediation.** Mitigated by the data-ownership rule and compounding switching cost — the consultant can never hold a client hostage.

## 17. Success metrics

- Reduction in documented-vs-actual gaps (Reality Gaps closed).
- AI answer accuracy and user trust in AI outputs.
- Corpus growth and data gravity — Atomic Truths under management, percentage verified.
- Employee ideas surfaced and implemented; open loops closed.
- Partner-sourced revenue and net revenue retention.

## 18. Lexicon

The canonical terms, for direct reuse in the Brand Bible.

| Term | Meaning |
|---|---|
| **RunOil** | The product and platform. |
| **Atomic Truth Engine** | How the RunOil SaaS is positioned — the high-value engine that captures, reconciles, governs, and publishes the Corpus. The product partners build their practice on. |
| **Atomic Truth** | The verified unit of organizational truth. |
| **Corpus** | The living, governed body of Atomic Truths; the system of record. Plain-text, versioned, AI-organized. |
| **Reality Gap** | The delta between what is stated (leadership), what is lived (staff), and what is documented. |
| **the Guide** | The coaching-oriented assistant that runs discovery sessions on the interviewer's screen. |
| **Discovery Session** | A recorded, processed coaching call that captures truth into the Corpus. |
| **Configure Group** | The consultant plus client champions who configure and govern an instance. |
| **Consumption Plane** | Where the company's AI tools read governed truth, via open standards. |
| **Governance Plane** | Where truth is defined, verified, governed, and published. |
| **Partner** | Independent consultant who delivers RunOil engagements; RunOil's distribution channel. |
| **Customer of Record** | The company that pays for and owns its RunOil instance and its Corpus. |
| **MCP** | Model Context Protocol — open standard for connecting AI tools to data and context. |
| **Agent Skills** | Open standard for packaging procedures an AI can execute. |

## 19. Open decisions

- Final validation and stated origin of the name "RunOil."
- Subscription pricing: usage metric, base fee, and numbers.
- Referral commission percentage and terms.
- Which model powers v1 (recommended: Claude) and the trigger to add a second.
- Certification and tier structure, and its timing.
- Legal: data-processing agreements, consent flows, data residency.
