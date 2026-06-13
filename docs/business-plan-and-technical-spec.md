---
title: RunOil — Business Plan & Technical Specification
version: 0.1.1
status: Working draft
date: 2026-06-13
owner: "[to be provided]"
tags: [runoil, business-plan, technical-spec, master]
companion_docs: [RunOil-Business-Spec, RunOil-Brand-Book, RunOil-Product-Overview]
---

# RunOil — Business Plan & Technical Specification

> The Atomic Truth Engine. AI that thinks like an executive.
> A complete plan for the business and the software, end to end.

## Document control

| Version | Date | Author | Summary of changes |
|---|---|---|---|
| 0.1.1 | 2026-06-13 | _[owner]_ | Corrected the frontend stack (B18): RunOil uses Tailwind + shadcn/ui (Shadcn Studio), not Polaris. Polaris is Shopify's admin design system; RunOil is a standalone, self-branded product. |
| 0.1 | 2026-06-05 | _[owner]_ | First complete edition: full business plan (Part A) and technical specification & feature set (Part B), with appendices. Supersedes the condensed Business Spec for depth; the Business Spec remains the canonical short-form reference. |

**How to read this.** Part A is the **business plan** — market, model, money, go-to-market, operations. Part B is the **technical specification & feature set** — architecture, data model, every subsystem, the stack, and the feature roadmap. Appendices hold the reference tables (data model, RBAC, lexicon, open decisions, assumptions, sources). Figures drawn from third-party market research are attributed inline and listed in Appendix F; all financial figures are **illustrative frameworks**, not forecasts — every assumption is registered in Appendix E.

---

## Contents

**Part A — Business plan**
A1 Executive summary · A2 Vision, mission & principles · A3 The problem & why now · A4 Market & opportunity · A5 Customer & buyer · A6 Competitive landscape · A7 Product (business view) · A8 Business model & revenue · A9 Pricing & packaging · A10 Go-to-market · A11 The partner program · A12 Operating model (company of one) · A13 Financial model & unit economics · A14 Funding & capital · A15 Business risks · A16 Legal, compliance & data governance · A17 KPIs · A18 Milestones

**Part B — Technical specification & feature set**
B1 Architecture · B2 Domain model · B3 Capture (the Guide) · B4 Session processing · B5 Document ingestion · B6 Reconciliation engine · B7 Synthesis & insight · B8 The Corpus · B9 Governance plane · B10 Publishing & consumption · B11 AI-usage governance · B12 Identity, access & multi-tenancy · B13 Security & compliance · B14 Partner platform · B15 Billing & metering · B16 The model layer · B17 Integrations & extensibility · B18 Stack & infrastructure · B19 Non-functional requirements · B20 Delivery & ops · B21 Feature set by phase · B22 Key data flows

**Appendices** — A Atomic Truth schema · B RBAC matrix · C Lexicon · D Open decisions · E Assumptions register · F Sources

---

# PART A — BUSINESS PLAN

## A1. Executive summary

RunOil is a high-value SaaS — the **Atomic Truth Engine** — that becomes a company's system of record for how it actually works, then publishes that governed truth into the AI tools the company already uses. The wedge is simple and urgent: companies have deployed AI faster than they have organized for it, so their assistants answer fluently and often wrongly about internal processes, policies, and decisions. RunOil captures the real operating truth through guided discovery, reconciles it against what is documented and what staff actually live, governs it, and serves it to Claude, ChatGPT, Grok, or any model through open standards.

The business is **partner-first**. Independent implementation partners are the front line — they find clients, run the discovery, and own the relationship; they set their own billing and keep 100% of it. RunOil sells and maintains the software, owns the subscription relationship and the data, pays partners a referral commission for introductions, and takes no cut of partner services. Partners are introducers and implementers, never resellers; the subscription, the renewal, and the Corpus stay with RunOil regardless of which partner is in the room.

Defensibility is modeled on ERP, not on features: data gravity (every AI tool pulls truth from the Corpus), accumulated and non-transferable configuration, an audit-grade governance record with a regulatory tailwind, and switching cost that compounds with versioned, temporal truth. The plumbing (open standards) is commodity; the moat is curation methodology, ongoing maintenance, and the truth itself.

It is built to run as a **company of one** — the founder as the accountable face for product, partnerships, and security, with AI agents performing the labor of marketing, content, support, research, and much of engineering, and partners carrying client delivery.

## A2. Vision, mission & operating principles

**Vision.** Every company runs its AI on its own verified truth — and finally understands how it actually works in the process.

**Mission.** Give mid-market companies a neutral, governed system of record for organizational truth that makes every AI tool trustworthy.

**Operating principles.**
- *Truth over retrieval.* We establish what is true; we do not merely find what is written.
- *Neutral by design.* We publish into every model and replace none.
- *Trust is the product.* In an over-hyped category, credibility is the moat. One off-brand or surveillance-adjacent move costs more than ten good ones earn.
- *Opinionated, then configurable.* Strong defaults that install in weeks; configuration within rails, never a blank canvas.
- *Partner-first.* Partners are the heroes of the story; the software makes them look like the experts they are.
- *Inspectable, not black-box.* Plain-text, versioned truth a human can read and audit.

## A3. The problem & why now

Mid-market companies adopted AI faster than they organized for it. The assistants they rolled out answer confidently and often incorrectly about their own processes, policies, and decisions, because no one curated the ground truth — and because what is documented rarely matches how the company actually runs.

The market data shows the pain is now acute, not theoretical:
- Roughly **95% of generative-AI pilots stall before production** (MIT *GenAI Divide* report, 2025), and **56% of CEOs report getting "nothing"** from their AI efforts (PwC 2026 Global CEO Survey). The bottleneck is increasingly not the model — it is the absence of trustworthy, company-specific ground truth for the model to reason over.
- Enterprises spent on the order of **$37B on generative AI in 2025**, up ~3.2x from ~$11.5B in 2024, with roughly $19B at the application layer (industry reporting, 2025–26). The money is committed; the return is missing.
- Roughly **80% of enterprises are expected to have deployed generative AI by 2026**, up from under 5% in 2023 (industry surveys, 2024–26). Adoption is no longer the differentiator — getting value from it is.
- Knowledge workers lose on the order of **1.8 hours per day** searching for information (industry reporting, 2026), and **shadow AI** — staff using unapproved tools — is now a board-level data-exfiltration and governance concern.

**Why now.** Three tailwinds converge. (1) Near-universal AI adoption means almost every mid-market company now owns the problem RunOil solves. (2) Open standards (MCP, Agent Skills) have made model-neutral context delivery cheap and credible — the build is feasible for a small team. (3) Regulation and board pressure (EU AI Act, the accountability gap) make a governed, auditable record of "what truth the AI was allowed to use" a budgeted need rather than a nice-to-have.

## A4. Market & opportunity

### A4.1 Market context (third-party estimates; see Appendix F)
- **Enterprise AI** is large and growing: roughly **$115B in 2026, projected to ~$273B by 2031 (~19% CAGR)** (Mordor Intelligence, 2026). Adjacent enterprise generative-AI estimates run from ~$18–30B (2024–25) growing at ~29–34% CAGR depending on the analyst.
- **AI governance** is small but among the fastest-growing software segments: estimates of the 2025–26 market range widely, roughly **$0.25–0.75B**, with CAGRs cited between **~25% and ~46%**, driven by the EU AI Act (penalties up to €35M or 7% of turnover). The wide spread reflects genuine analyst disagreement on scope; treat any single figure as directional.

RunOil sits at the intersection of three budgets — enterprise AI enablement, knowledge/operations, and AI governance — which is both an opportunity (multiple budget owners feel the pain) and a positioning task (we must define our own category rather than be filed under "AI search").

### A4.2 Sizing approach (framework — fill with your inputs)
A bottom-up SOM is more honest than a top-down TAM for a focused, partner-led play:

- **TAM (directional):** mid-market companies globally that have deployed AI internally. _[Insert count of target companies × estimated annual contract value.]_
- **SAM:** mid-market companies in the founder's reachable geographies/verticals that already use Claude/ChatGPT/Grok (the "has AI, hasn't fixed truth" segment).
- **SOM (3-year):** `(number of active partners) × (clients delivered per partner per year) × (average annual subscription)`. This is the number that actually matters for a company of one — it is gated by partner capacity, not by market size. Worked illustratively in A13.

### A4.3 Why the wedge is durable
The pain is recurring (truth drifts), the buyer is now near-universal, the standards are settling, and the governance tailwind is regulatory rather than discretionary. The risk is not demand; it is differentiation against well-funded retrieval incumbents (A6).

## A5. Customer & buyer

**Segment.** Mid-market. Deliberately chosen: SMB will not pay enough to sustain a high-value SaaS; enterprise will out-cycle a solo founder on procurement and security review. Mid-market is large enough to pay and fast enough to close.

**Qualifying signal.** "Has AI, hasn't fixed truth." The ideal customer has rolled out AI to staff but never curated its operating truth, so it is already getting confident, wrong answers.

**Primary buyer — the champion.** A technical or operations leader accountable for making the AI investment deliver (Head of AI/Transformation, COO, CTO at smaller mid-market firms, or an ops/RevOps leader). Pragmatic, time-poor, hype-skeptical, accountable for ROI, sensitive to trust and security.

**Influencers / co-signers.** Head of People (psychological-safety and staff-input concerns), Security/IT (data, SSO, DPA), Finance (cost of AI, governance).

**Secondary audience — the partner.** Independent AI consultants who deliver RunOil. The brand and product must make them proud to represent it and confident putting it in front of their clients. They are the distribution engine.

**Anti-personas.** Companies with no AI adoption (you'd be selling the AI journey itself — slower, wrong wedge); regulated enterprises demanding day-one SOC 2 + lengthy procurement (defer until the platform earns it); buyers who want employee-monitoring/surveillance (mission conflict — decline).

## A6. Competitive landscape

| Category | Examples | What they do | Where RunOil differs |
|---|---|---|---|
| Enterprise AI search / knowledge | Glean, Guru, GoSearch | Retrieve & synthesize what already exists in files | We capture truth that lives in no document and **reconcile** conflicting versions; we establish truth, not retrieve it |
| Ecosystem-native AI | Microsoft Copilot, Notion AI, Slack AI | Embed AI inside their own suite | We are **model-neutral**; they have a structural reason not to be |
| AI governance / GRC | OneTrust, Credo, IBM watsonx.gov | Policy, risk, compliance tooling | We govern the **truth that feeds the AI**, at the content layer, not just policy paperwork |
| Build-it-yourself | Internal RAG on a vector DB + MCP | DIY context plumbing | Commodity plumbing without the curation, reconciliation, reality-gap, or maintenance discipline |

**How RunOil wins.** Neutral + curated/governed + mid-market + fast to install, in a category (organizational truth) nobody owns. RunOil can sit *above* a Glean or Copilot — they surface candidates; RunOil decides what is correct and publishes it.

**Where RunOil is vulnerable (be honest).** The big platforms are colonizing "knowing the company." If "ground truth" gets absorbed into the model/suite layer, the defensible ground is exactly the non-commodity parts: reconciliation, the reality gap, governance/audit, neutrality across multi-model shops, and accumulated configuration. Compete there, never on "we connect your data."

## A7. Product (business view)

RunOil is sold as a SaaS subscription (the Atomic Truth Engine). The customer's outcome: their AI tools stop being confidently wrong; leadership gets a living map of how the company actually works, with the gaps between intention, reality, and documentation made explicit and owned. The full technical product is specified in Part B. Business-relevant capabilities:

- **Discovery & capture** (partner-delivered, software-guided) → proprietary truth.
- **Reality-gap reconciliation** → the signature, demonstrable output.
- **Governed publishing** to any AI tool → the recurring, sticky value.
- **AI-usage governance** (org/policy/cost level) → the board-facing, regulatory-tailwind value.

## A8. Business model & revenue

**Partner-first SaaS.** RunOil monetizes the software subscription; partners monetize their services. Two distinct relationships:

1. **The SaaS subscription** — the end company is the customer of record; it pays RunOil and owns its Corpus. This is RunOil's revenue.
2. **Partner services** — discovery, implementation, configuration, and ongoing adjudication, billed by the partner directly to the client. RunOil takes **no cut**.

**RunOil's revenue streams.**
- *Primary:* recurring SaaS subscription (hybrid base + usage; see A9).
- *Secondary (later):* an app-ecosystem revenue share (a cut of partner-built extensions), deferred until there is a platform and partner base.

**RunOil's largest variable cost on the revenue side:** the **referral commission** paid to introducing consultants (a recurring % of subscription). It is paid only on active paying clients and only on revenue RunOil would not have without the partner — a customer-acquisition cost, not a margin leak.

**Why partners participate despite RunOil owning the client:** they keep 100% of their (recurring) services revenue *and* earn a passive recurring referral commission, while RunOil carries the product, the hosting, the security posture, and the renewal relationship.

## A9. Pricing & packaging

**Direction:** usage-based ("dynamic by use"), hybrid, with exact numbers deferred. Principles (locked):
- **Meter on a value-aligned metric** the customer should do *more* of — e.g., Atomic Truths under management, governed sources connected, seats consuming truth, or discovery sessions. **Never** per-query/per-token, which would make customers ration the truth layer and throttle the data gravity that is the moat.
- **Hybrid, not pure consumption** — a base platform fee for budget predictability plus a usage component for expansion.
- **Build the meter from day one** — price can be deferred; instrumentation cannot.

**Illustrative packaging (placeholders — see Appendix E):**

| Plan | Who | Base (monthly) | Usage component | Notes |
|---|---|---|---|---|
| Starter | Single-department mid-market | _[$ base]_ | included quota of Atomic Truths / sources | Fast install, one Configure Group |
| Growth | Multi-department | _[$ base]_ | metered above quota | Most common; expansion path |
| Governed | Mid-market w/ governance needs | _[$ base]_ | metered + AI-usage governance add-on | Audit, residency, SSO, advanced RBAC |

**Partner economics:** referral commission _[e.g., 20%]_ of subscription, recurring while the client is active, attributed via partner-initiated provisioning ("client transfer"). Partner services pricing is the partner's own.

## A10. Go-to-market strategy

**Motion: partner-led, founder-seeded.**

1. **Founder as first partner (Phase 1).** The founder runs real discovery engagements on design-partner companies. This dogfoods the product, hardens the methodology and templates, produces reference customers and case studies, and proves unit economics before recruiting anyone.
2. **Recruit and certify partners (Phase 3).** Target independent AI consultants already doing "AI readiness/strategy" work for mid-market — they have the relationships and need a system to deliver on. Lead with their economics: keep 100% of services + recurring referral income + a credible governed platform to stand behind.
3. **Partner-sourced demand.** Partners bring clients; RunOil's direct marketing exists mainly to (a) recruit partners and (b) give partners air cover (content, proof, category education).
4. **Land and expand.** Land in one department (one Configure Group), expand to more departments and the governance plane as the Corpus proves its value.

**Demand generation (agent-operated):** category-defining content ("why your AI is confidently wrong"), the reality-gap demo as the hero artifact, partner-recruitment funnels, and founder-led design-partner outreach. No paid-acquisition dependency early; the channel is the growth engine.

**Sales motion:** partner runs the room; RunOil supports with security documentation, the platform demo, and pricing. RunOil owns the contract and renewal.

## A11. The partner program (detailed)

Two distinct systems (do not conflate them):

**1. Platform registry (RunOil's).** The partner program: apply → vet → approve → issue a partner workspace. Quality gate because partners touch sensitive truth and carry the methodology. Roadmap: simple approval first; certification and performance tiers later (modeled on mature partner programs that tier on sourced/co-sell revenue over rolling windows).

**2. Tenant access control (the client's).** Each client grants and revokes specific partners on its own instance (the collaborator model). Client-held control is load-bearing — it asserts client ownership and makes the partner safe to work with.

**Economics.** Recurring referral commission on the subscription (introduction reward) + partner keeps 100% of services. Removed-partner case: the partner keeps the lifetime referral commission but loses services revenue; the client and Corpus stay with RunOil.

**Enablement.** Discovery templates and question libraries (their reusable IP, built on RunOil's), a delivery playbook, certification curriculum (later), co-branded materials, and a partner portal (referrals, clients, earnings).

**Quality & conflict management.** Vetting; certification tiers; tenant isolation so a partner serving competing clients can never leak truth across tenants; audit of all partner actions; the data-ownership rule as the backstop.

## A12. Operating model — company of one

One human; every other role is an AI agent or AI-assisted workflow, with partners carrying client delivery.

| Function | Who runs it | Notes |
|---|---|---|
| Product & architecture | Founder + coding agents | Founder owns direction; agents do most implementation |
| Sales / client delivery | Partners | Founder is first partner in Phase 1 |
| Security, DPA, contracts | Founder (accountable) | Cannot be delegated to an agent |
| Marketing & content | Agents (founder edits) | Category content, partner recruitment, proof |
| Tier-1 support & docs | Agents | Escalation to founder for edge cases |
| Research & competitive intel | Agents | Ongoing market/competitor monitoring |
| Ops, finance admin, reporting | Agents + lightweight SaaS | Bookkeeping, metering reconciliation, payouts |

**What stays human:** founder is the accountable face for the client relationship, the security questionnaire/DPA, the partner relationships, and final product judgment. **The strain** is building the platform and running the partner program — work that compounds — not a client-delivery treadmill.

## A13. Financial model & unit economics

> All numbers below are an **illustrative framework**, not a forecast. Replace bracketed placeholders with your inputs; assumptions are registered in Appendix E.

**Revenue build.**
`MRR = Σ active clients × (base fee + usage)`. Client growth is partner-gated:
`new clients/quarter ≈ active partners × clients per partner per quarter`.

**Cost structure.**
- **COGS (variable per client):** model inference (the Engine's organizing/reconciliation work), transcription of sessions, hosting/storage/compute, third-party APIs. Target COGS as a % of subscription: _[e.g., 15–25%]_.
- **Channel cost (variable):** referral commission _[e.g., 20%]_ of subscription on partner-sourced clients.
- **OpEx (largely fixed, low):** founder draw, AI-agent and SaaS tooling, partner-program ops, security/compliance tooling, legal. The company-of-one model keeps fixed OpEx unusually low.

**Unit economics (per client).**
- **ARPA** = base + average usage = _[$/yr]_.
- **Gross margin** = 1 − (COGS% + referral%). Illustrative: 1 − (0.20 + 0.20) = **~60%** contribution after inference/infra and channel. _(Referral is technically CAC, not COGS; some models treat blended gross margin ex-referral at ~75–85%.)_
- **CAC** ≈ referral commission over payback window + marginal onboarding support. Partner-led CAC is low because partners fund the selling with their own services time.
- **LTV** = ARPA × gross margin × average client lifetime (years). Sticky data gravity → long lifetime → favorable LTV:CAC.
- **Payback:** short, because CAC is mostly a revenue-share rather than upfront spend.

**Company-of-one break-even.** With low fixed OpEx, break-even is a function of a modest number of active clients: `break-even clients ≈ fixed OpEx ÷ (ARPA × gross margin)`. Worked example (illustrative): if fixed OpEx = _[$X/yr]_, ARPA = _[$Y/yr]_, gross margin = 60%, break-even ≈ _[X ÷ (0.6Y)]_ clients. This is the single most important number to compute with real inputs — it tells you how many partner-sourced clients make the business sustainable for one person.

**Sensitivity levers (in priority order):** average subscription (pricing/packaging), inference cost per client (model-layer efficiency), client lifetime/retention (data gravity), partner productivity (clients per partner), referral rate.

## A14. Funding & capital strategy

**Default: bootstrap.** The company-of-one + partner-funded-delivery model is designed to be capital-light. Early revenue from founder-led design-partner engagements (services) can fund product build before SaaS revenue scales.

**Capital needs (if any):** primarily to (a) accelerate product to the configuration/governance plane, (b) stand up the partner program, and (c) fund security/compliance (SOC 2) ahead of demand. These are discrete, de-riskable milestones — better matched to a small angel/strategic round or revenue-based financing than to venture scale, unless the founder chooses to pursue a fundable-company path.

**De-risking milestones a raise would want to see:** 2–3 reference clients with measurable reality-gap outcomes; repeatable install in weeks; first non-founder partner delivering; net revenue retention signal; clear unit economics.

## A15. Business risks & mitigations

| Risk | Mitigation |
|---|---|
| Surveillance perception kills staff trust → bad data | Consent, purpose-limitation, staff aggregation/anonymity; governance strictly org/policy/cost level |
| Platform incumbents absorb "company truth" | Compete on reconciliation, reality-gap, governance/audit, neutrality, accumulated config — not on plumbing |
| Channel disintermediation by partners | Data-ownership rule + compounding switching cost; RunOil owns subscription/data/renewal |
| Solo-founder bandwidth / bus factor | AI-agent workforce; partner-delivered services; documented, inspectable Corpus; consider a key-person plan |
| Scope sprawl | Enforce sequence: capture → synthesize → govern; opinionated, bounded configuration |
| Commodity plumbing erodes value | Human-gated verification + curation methodology as the durable IP |
| Security incident on sensitive truth | Strong tenant isolation, encryption, audit, least-privilege, SOC 2 roadmap |
| Pricing mis-set (usage anxiety) | Hybrid base+usage; value-aligned metric; transparent metering |

## A16. Legal, compliance & data governance (business view)

- **Data ownership:** the client owns its Corpus; contracts make this explicit; export/portability guaranteed.
- **Consent & purpose-limitation:** discovery recordings and staff input require informed consent and bounded use; staff input is aggregated/source-protected by policy and by data design.
- **DPAs & residency:** offer a standard DPA; data-residency options on the roadmap for the Governed tier.
- **AI governance/regulatory:** position the audit trail (what truth was approved, surfaced, when, by whom) as compliance evidence aligned with emerging AI regulation.
- **IP:** partner methodology/templates are partner IP built on RunOil's framework; client Atomic Truths are client IP; RunOil owns the platform.
- **Open decisions:** SOC 2 timing, jurisdictions, consent flows, sub-processor list (Appendix D).

## A17. KPIs & success metrics

- **Truth/data gravity:** Atomic Truths under management; % verified; governed sources connected; Corpus growth per client.
- **Outcome:** reality gaps surfaced/closed; AI answer accuracy and trust (client-reported); open loops closed.
- **Commercial:** active clients; ARPA; net revenue retention; gross margin; partner-sourced revenue %; CAC payback.
- **Channel:** active partners; clients per partner; partner-sourced pipeline; partner retention.
- **Reliability/trust:** publish freshness, uptime, security incidents (target zero), audit completeness.

## A18. Milestones & timeline (indicative)

1. **MVP + first design partners** — the Guide, Atomic Truth model, Corpus, reality-gap reconciliation, single-model publish; founder delivers 2–3 engagements.
2. **Configuration & governance plane** — functional-user config, document ingestion, review queue; first repeatable install in weeks.
3. **Channel live** — partner registry, referral mechanics, first non-founder partner delivering; second model integration on demand.
4. **Scale** — AI-usage governance, analytics, certification/tiers, app ecosystem, SOC 2.

---

# PART B — TECHNICAL SPECIFICATION & FEATURE SET

## B1. Architecture overview

Two planes over three layers.

```
                 CONFIGURATION & GOVERNANCE PLANE  (write / govern)
   ┌───────────────────────────────────────────────────────────────┐
   │  Configure Group workbench · org-schema · authority · rules ·  │
   │  approval workflows · publishing policy · partner access       │
   └───────────────────────────────────────────────────────────────┘
        ▲ capture            ▲ reconcile             ▲ govern
   ┌──────────────┐   ┌────────────────────┐   ┌────────────────────┐
   │ B3 Capture   │ → │ B6 Reconciliation  │ → │ B8 Corpus (SoR)    │
   │ the Guide    │   │ reality-gap engine │   │ git-backed truth   │
   │ B4 Sessions  │   │ B7 Synthesis       │   │ B9 Governance      │
   │ B5 Documents │   │ (queries)          │   │ B10 Publishing     │
   └──────────────┘   └────────────────────┘   └─────────┬──────────┘
                                                          │ MCP + Agent Skills
                 CONSUMPTION PLANE  (read)                ▼
   ┌───────────────────────────────────────────────────────────────┐
   │     Claude   ·   ChatGPT   ·   Grok   ·   Copilot   ·  agents   │
   └───────────────────────────────────────────────────────────────┘
        (B11 AI-usage governance observes this plane at org/policy level)
```

**Layers:** Capture → Synthesize → Govern & publish.
**Planes:** Consumption (read, frictionless, model-side) and Configuration & Governance (write/govern, functional-user-operable).
**Cross-cutting:** identity & multi-tenancy (B12), security & audit (B13), the model layer (B16), metering (B15).

## B2. Core domain model

**Atomic Truth** — the verified unit (full schema in Appendix A). Types: Process, Decision, Friction, Open Loop, Ownership, Definition-of-Done (extensible: Policy/Rule, Metric). Each carries statement, status, provenance, owner, confidence, reality_gap, relationships, conflict/ethos flags, temporal fields, and access_class.

**Status lifecycle:** `proposed → verified → published → disputed → retired` (disputed is re-entrant — a later source can re-open a verified truth).

**Corpus** — the living, governed body of Atomic Truths; the system of record (B8).

**Relationships** form a graph: Open Loops point to the Decision that never closed; Frictions point to the Processes they block; Definitions-of-Done attach to Processes. Synthesis (B7) is graph/query traversal over this model, not separate detectors.

**Provenance model:** every Atomic Truth links to its sources (sessions, documents), the speaker role (attributed for decision-makers; protected cohort for staff), and quote/timestamp anchors.

## B3. Capture subsystem — the Guide

The coaching-oriented assistant that runs discovery sessions on the interviewer's screen.

**Features:**
- **Objective library:** sessions are organized by objective ("map order-to-cash," "find onboarding open loops"), not a linear script.
- **Question library + adaptive surfacing:** candidate questions tied to the objective and to what's already been said; the interviewer picks, skips, reorders, or types their own.
- **Coverage tracking:** which Atomic Truths an objective needs vs. which are still un-elicited; nothing important gets dropped.
- **Probes:** when an answer is incomplete for a clean Atomic Truth (e.g., a Process with no owner), the Guide surfaces a follow-up.
- **Live conflict flags:** an answer that contradicts an existing Atomic Truth is flagged in-session.
- **Role-based question sets:** decision-maker sets map the *intended* org (stated); staff sets map the *actual* (lived) — the asymmetry is what generates reality gaps.
- **Session types:** discovery, follow-up/clarification, governance review.
- **Recording & consent:** capture with explicit, logged consent; staff sessions flagged for aggregation/protection.
- **Phasing:** v1 is template-led with strong post-call processing and lightweight live coverage; real-time conflict-flagging/probes are a fast-follow.

**Design stance:** "a teleprompter for objectives, not a call-center script." Glanceable, non-intrusive; the interviewer sounds human.

## B4. Session processing pipeline

`record → transcribe → diarize → extract → link → score → queue`

- **Transcription & diarization:** speech-to-text with speaker separation (role tagged per consent rules).
- **Extraction:** the model proposes typed Atomic Truths from the transcript, each anchored to quote + timestamp.
- **Linking:** new proposals are linked to existing Atomic Truths and to the objective graph.
- **Confidence scoring:** single-source vs. corroborated; surfaced to the reviewer.
- **Review queue:** proposals land as `proposed`; the partner (verification gate, B6) promotes, edits, or rejects.

## B5. Document ingestion & reconciliation

- **Sources:** uploads; references the Guide detects in-session ("see the SOP") become tracked requests; connector-based pulls (Drive, Slack, ERP exports) where authorized.
- **Dual action per document:** propose *new* Atomic Truths and *test* existing ones.
- **Flag types:** Corroborates (↑confidence), Contradicts (opens reality_gap; status→disputed), Stale (past valid_through/superseded), Orphaned (process nobody mentioned — shadow process), Missing (referenced but absent → Open Loop / documentation gap).
- **Async re-opening:** documents arrive after sessions; a verified truth can drop to `disputed` later → standing review queue (recurring partner work).
- **Documentation-gap diagnostic:** auto-produced ("you reference 14 SOPs; 4 don't exist, 3 stale, 2 contradict staff").

## B6. Reconciliation & reality-gap engine

- **Three-way triangulation:** stated (decision-makers) × actual (staff) × documented (files).
- **Reality-gap computation:** per Atomic Truth, stores stated/actual/documented values and a severity rating; surfaces the delta.
- **Conflict detection:** contradictions across truths flagged for adjudication.
- **Ethos alignment:** truths checked against configured company principles (org-schema).
- **Verification gate (human-in-the-loop):** RunOil proposes; the partner adjudicates. Contradictions are never auto-resolved. This is the quality control, the governance checkpoint, and the partner's value loop.

## B7. Synthesis & insight queries

Not separate detectors — queries over the Corpus graph:
- **Open loops:** Decisions/threads with no closing event.
- **Bottlenecks:** Processes with convergent dependencies or single owners.
- **Friction map:** Frictions ranked by severity × linked-Process count.
- **Definition-of-Done gaps:** Processes lacking a clear/agreed DoD, or with stated-vs-actual DoD divergence.
- **Shadow processes:** Orphaned truths from documents/usage with no human-stated counterpart.

## B8. The Corpus — storage & versioning

- **Form:** plain-text/markdown, human-readable, **git-backed and versioned**. Inspectable, never a black box.
- **Structure:** typed Atomic Truth records + relationship links + org-schema; per-tenant repository.
- **Temporal truth:** full history of how a truth evolved — who changed it, when, prior state, resolved conflicts. Enables "what did we believe in Q1?" queries and is a core switching-cost asset.
- **Organization:** RunOil's model acts as **librarian** — it organizes, links, dedupes, and maintains the Corpus; it does not hide it.
- **Portability/export:** the client can export its Corpus (ownership guarantee).

## B9. Governance plane — configuration

The Configure Group's workbench (functional-user-operable, not engineer-only):
- **Org-schema:** departments, entities, taxonomy, ethos principles.
- **Source-authority hierarchy:** which sources win when they conflict (e.g., ERP > official memo > meeting note > submission).
- **Conflict rules & approval workflows:** how disputes are routed and who can promote `verified → published`.
- **Publishing policy:** what subset of the Corpus publishes to which model/tool, and to whom.
- **Access policy:** RBAC, staff protection, tenant rules.
- **Opinionated templates + bounded configuration:** strong industry defaults; adjust within rails, never a blank canvas → installs in weeks (anti-ERP-implementation-hell).

## B10. Publishing & consumption

- **MCP server:** RunOil exposes governed truth to any MCP-capable client (Claude, ChatGPT Business/Team/Enterprise, Grok, agents).
- **Agent Skills packaging:** procedures packaged to the open Agent Skills standard for cross-platform execution.
- **Per-model/per-audience targeting:** publishing policy controls which truths reach which tools and roles.
- **Read semantics:** only `published` truths are served; freshness/caching; scoped to tenant and permission.
- **Neutrality:** build behind one clean model interface; ship single-model first (recommended: Claude), add others on paying-customer demand; claim agnostic-capable from day one without maintaining three integrations.

## B11. AI-usage governance

Because RunOil is the context layer AI tools pull truth *through*, it has a governance vantage point **without surveillance**:
- Approved-tool enforcement; aggregate usage visibility; cost/token visibility; data-leak prevention at the context layer.
- **Strictly org/policy/cost level. Never individual monitoring.** This boundary is a product invariant — violating it poisons the trust the capture layer depends on.

## B12. Identity, access & multi-tenancy

- **Auth:** Clerk (or enterprise SSO/SAML/OIDC for the Governed tier).
- **Roles (RBAC — see Appendix B):** RunOil admin; Client champion (Configure Group lead); Client member; Staff contributor (protected); Partner (scoped, revocable); Read-only/auditor.
- **Multi-tenancy:** strict per-tenant isolation; a partner serving multiple (possibly competing) clients can never leak truth across tenants. Methodology/templates travel with the partner; client Atomic Truths never do.
- **Customer-of-record:** the end company owns the instance and Corpus; partner access is granted/revoked by the client (collaborator model).

## B13. Security & compliance (technical)

- Encryption in transit (TLS) and at rest; per-tenant key separation roadmap.
- **Audit logging:** every change to truth, every publish, every partner action — append-only, the backbone of the governance moat.
- Least-privilege access; secrets management; dependency and supply-chain hygiene.
- **Staff protection by design:** aggregation/anonymization of staff input enforced at the data layer via `access_class`.
- Backups, disaster recovery, defined RPO/RTO.
- Consent management for recordings and data use.
- Compliance roadmap: SOC 2 Type II, data-residency options, standard DPA, sub-processor transparency.

## B14. Partner platform (technical)

- **Platform registry:** application, vetting, approval, partner workspace; later certification + performance tiers.
- **Tenant access control:** client-initiated grant/revoke of named partners (collaborator requests).
- **Referral attribution:** partner-initiated provisioning/transfer ("client transfer") tags the partner for recurring commission; prevents self-referral/gaming.
- **Billing separation:** RunOil bills the subscription; partners bill services independently. RunOil is never the payment intermediary for partner services.
- **Partner portal:** referrals, client list (scoped), earnings, enablement assets.

## B15. Billing & metering

- **Usage meter:** instrumented from day one; captures the value-aligned metric(s) (Atomic Truths under management, governed sources, seats, sessions) transparently.
- **Billing:** hybrid base + usage subscription (e.g., Stripe). Referral-commission payout ledger to partners.
- **Separation:** subscription billing (RunOil↔client) is isolated from partner services billing (partner↔client).
- **Transparency:** customer-visible usage dashboards to avoid bill-shock and usage anxiety.

## B16. The model layer

- **Own model as librarian:** organizes, links, reconciles, and maintains the Corpus; proposes Atomic Truths; runs synthesis queries. Used to **organize and power the system**, not to replace the customer's chosen consumption-side model.
- **Model-agnostic interface:** all model calls behind one clean abstraction; swappable; single-model-first.
- **Agent/prompt design:** extraction agents, reconciliation agents, synthesis agents, the Guide's in-session assistant — each with bounded scope and the human verification gate downstream.
- **Quality/evals:** golden sets for extraction accuracy and reality-gap precision; regression evals before model swaps.
- **Cost control:** caching, batching, right-sizing models per task; inference cost is a primary unit-economics lever (A13).

## B17. Integrations & extensibility

- **Outbound (consumption):** MCP server + Agent Skills → any MCP/Skills-capable AI tool.
- **Inbound (sources):** connectors for Drive, Slack, email, ERP exports, wikis (read, with authorization) feeding document ingestion.
- **Identity:** SSO/SAML/OIDC.
- **Webhooks/API:** a public API for the Corpus (scoped, governed) for advanced clients.
- **App ecosystem (future):** partner-built extensions with a revenue share — deferred until platform + partner base exist.

## B18. Stack & infrastructure

- **Frontend:** React Router 7 (framework mode) + Tailwind + shadcn/ui (Shadcn Studio). RunOil is a standalone, self-branded product, so it uses its own design system rather than Shopify's Polaris.
- **Data:** Prisma + PostgreSQL (relational core); the Corpus persisted as versioned plain-text/markdown in git-backed per-tenant repositories; object storage for recordings/documents.
- **Auth:** Clerk (+ enterprise SSO).
- **Hosting/CI:** Fly.io; GitHub Flow for delivery.
- **Supporting services:** transcription/diarization service; background job queue (extraction, ingestion, reconciliation); optional vector store for retrieval-assist; observability/logging stack.
- **Model layer:** provider abstraction over the chosen LLM API (Claude first).

## B19. Non-functional requirements

- **Performance:** published-truth reads (MCP) low-latency; session processing async/background.
- **Scalability:** per-tenant isolation scales horizontally; partner/multi-client load.
- **Reliability:** target uptime SLA for the consumption (publish) path — it sits in the customer's AI workflow; graceful degradation.
- **Accessibility & i18n:** accessible config UI; internationalization roadmap.
- **Observability:** end-to-end tracing of the capture→publish pipeline; metering accuracy as a first-class concern.

## B20. Delivery & ops

- **GitHub Flow:** short-lived branches → PR → CI → deploy; trunk stays releasable.
- **CI/CD:** automated tests (incl. extraction/reconciliation evals), preview environments, staged deploys on Fly.io.
- **Environments:** dev / staging / prod; per-tenant data isolation preserved across all.
- **Monitoring & incident:** alerting on publish-path health, metering integrity, and security signals; solo-founder incident runbook; status communication.
- **Infra-as-code & secrets:** reproducible infra; managed secrets; least-privilege service accounts.

## B21. Feature set by phase

| Capability | P1 MVP | P2 Config/Gov | P3 Channel | P4 Scale |
|---|:--:|:--:|:--:|:--:|
| the Guide (templates + coverage) | ● | ＋ | | |
| the Guide (real-time probes/conflict) | | ● | ＋ | |
| Atomic Truth model + Corpus (git) | ● | ＋ | | |
| Reality-gap reconciliation | ● | ＋ | | |
| Single-model publish (MCP/Skills) | ● | | ＋ | |
| Second+ model integration | | | ● | ＋ |
| Document ingestion + flagging | | ● | ＋ | |
| Verification/review queue | ◐ | ● | | |
| Configuration & governance plane | | ● | ＋ | |
| Synthesis queries (friction/loops) | ◐ | ● | ＋ | |
| RBAC + multi-tenancy | ◐ | ● | ＋ | |
| Partner registry + tenant access | | | ● | ＋ |
| Referral attribution + payouts | | | ● | |
| Usage metering | ● | ＋ | ＋ | |
| AI-usage governance | | | ◐ | ● |
| Analytics / benchmarking | | | | ● |
| Certification & tiers | | | | ● |
| App ecosystem | | | | ● |
| SOC 2 / residency | | | ◐ | ● |

● core in phase · ＋ extended · ◐ partial/foundational

## B22. Key data flows

1. **Capture → truth:** session → transcribe → extract proposed Atomic Truths → review queue → partner verifies → `verified`.
2. **Reconcile:** new truth/document → reconciliation engine → reality_gap + conflict flags → review queue.
3. **Publish:** `verified` truth → governance policy → publish to MCP/Skills → consumption plane reads it.
4. **Async re-open:** later document contradicts a `published` truth → status `disputed` → review queue → re-adjudication.
5. **Govern usage:** consumption-plane access flows through RunOil's context layer → aggregate org/policy/cost telemetry (no individual monitoring).

---

# Appendices

## Appendix A — Atomic Truth schema

| Field | What it holds |
|---|---|
| id | Unique identifier. |
| type | Process · Decision · Friction · Open Loop · Ownership · Definition-of-Done (extensible: Policy/Rule, Metric). |
| statement | Canonical one-line expression of the truth. |
| status | proposed → verified → published → disputed → retired. |
| provenance | Source session(s)/document(s); speaker role (attributed vs protected cohort); quote + timestamp. |
| owner | Accountable real-world person or role. |
| confidence | Strength of evidence; single-source vs corroborated. |
| reality_gap | stated / actual / documented values + severity. The signature field. |
| relationships | Links to related Atomic Truths. |
| conflict & ethos flags | Contradictions with other truths or stated principles. |
| temporal | created, last_verified, valid_through (relevance horizon). |
| access_class | Visibility/permission; enforces staff protection and tenant isolation. |

## Appendix B — RBAC matrix (indicative)

| Capability | RunOil admin | Client champion | Client member | Staff (protected) | Partner (scoped) | Auditor |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Run discovery sessions | | ● | ● | (subject) | ● | |
| Propose Atomic Truths | ● | ● | ● | (via session) | ● | |
| Verify/publish truths | | ● | ◐ | | ◐* | |
| Configure org-schema/rules | | ● | | | ◐* | |
| Manage partner access | | ● | | | | |
| View attributed staff input | | ◐ | | | | |
| View aggregated staff input | | ● | ● | | ● | ● |
| Manage billing/subscription | ● | ● | | | | |
| View audit log | ● | ● | | | ◐ | ● |

● full · ◐ limited/contextual · *partner permissions are client-granted and revocable. Staff input visibility is aggregated/protected by default.

## Appendix C — Lexicon

| Term | Meaning |
|---|---|
| RunOil | The product and platform. |
| Atomic Truth Engine | How the RunOil SaaS is positioned — the high-value engine that captures, reconciles, governs, and publishes the Corpus. |
| Atomic Truth | The verified unit of organizational truth. |
| Corpus | The living, governed body of Atomic Truths; the system of record. Plain-text, versioned, AI-organized. |
| Reality Gap | The delta between what is stated (leadership), what is lived (staff), and what is documented. |
| the Guide | The coaching-oriented assistant that runs discovery sessions. |
| Discovery Session | A recorded, processed coaching call that captures truth into the Corpus. |
| Configure Group | The partner plus client champions who configure and govern an instance. |
| Consumption Plane | Where the company's AI tools read governed truth, via open standards. |
| Governance Plane | Where truth is defined, verified, governed, and published. |
| Partner | Independent consultant who delivers RunOil; introduces and implements, never resells. |
| Customer of Record | The company that pays for and owns its RunOil instance and Corpus. |
| MCP | Model Context Protocol — open standard for connecting AI tools to data/context. |
| Agent Skills | Open standard for packaging procedures an AI can execute. |

## Appendix D — Open decisions

- Final validation and stated origin of the name "RunOil."
- Subscription pricing: chosen usage metric, base fee, tier numbers.
- Referral commission percentage and exact terms.
- Which model powers v1 (recommended: Claude) and the trigger to add a second.
- Certification and tier structure, and its timing.
- Legal: SOC 2 timing, DPA, consent flows, data residency, sub-processor list.
- App-ecosystem revenue-share terms (deferred).

## Appendix E — Assumptions register

All financial figures in A9/A13 are illustrative placeholders pending the founder's inputs:
- ARPA (average annual subscription per client): _[TBD]_
- COGS as % of subscription (inference + transcription + infra): _[assumed 15–25%]_
- Referral commission %: _[assumed ~20%, Shopify anchor]_
- Average client lifetime / retention: _[TBD]_
- Fixed annual OpEx (company-of-one): _[TBD]_
- Clients per partner per quarter: _[TBD]_
- Usage metric and quotas per tier: _[TBD]_

## Appendix F — Sources (third-party market data, accessed June 2026)

Market figures are third-party estimates and vary by analyst; treat as directional.
- Enterprise AI market size/CAGR — Mordor Intelligence (2026); ResearchNester (2026); Valuates (2026).
- Enterprise generative-AI spend (~$37B in 2025, 3.2x YoY; ~$19B application layer) and ~80% GenAI deployment by 2026; ~1.8 hrs/day search time — industry reporting (GoSearch, 2026) and surveys cited therein.
- Pilot-failure (~95%) — MIT *GenAI Divide* (2025); CEO "nothing from AI" (~56%) — PwC 2026 Global CEO Survey (as reported, 2026).
- AI adoption rates (Fed FEDS Notes 2026; IDCA) — as reported by ResearchNester (2026).
- AI governance market size/CAGR (range ~$0.25–0.75B 2025–26; CAGR ~25–46%; EU AI Act penalties up to €35M/7%) — Coherent Market Insights, SkyQuest, Precedence, Fortune Business Insights, Research and Markets, Grand View, New Market Pitch (2025–26).
- Competitive context (Glean and category) — prior research, this engagement.

---

_End of document. Companion artifacts: RunOil Business Spec (short-form), RunOil Brand Book (Brand Bible), RunOil Product Overview (PDF)._
