# RunOil Project Plan

## Project Overview
RunOil is an **Organizational Intelligence Layer** — a living, self-updating enterprise knowledge and truth platform. It combines Karpathy-style LLM Wiki with advanced reality capture, protected feedback, and continuous improvement mechanisms.

**Tagline:** "Where companies finally learn how they actually work."

**Core Value:** Single source of truth + protected ground-truth employee insights + automated conflict & ethos detection.

## Goals
- LLM-agnostic (works with Claude Enterprise, ChatGPT Enterprise, Grok, etc.)
- Highly configurable for different organization types and sizes
- Strong privacy, anonymity, and psychological safety
- Production-ready for small, mid-market, and enterprise deployments

## High-Level Architecture
```
runoil/
├── raw/                  # Immutable source documents (PDFs, CSVs, exports)
├── wiki/                 # Agent-maintained Markdown knowledge base
├── config/
│   ├── org-schema.md     # Company-specific config (departments, ethos, rules)
│   └── templates/        # Page templates
├── agents/               # LLM agent scripts / configurations
├── logs/
│   └── audit.log
├── improvements/         # Anonymous ideas, reality gaps, frustration logs
└── dashboard/            # Optional web UI for conflict & improvement views
```

## Tech Stack (Recommended for Flexibility)
- **Storage:** Local filesystem + Git for versioning (or S3 + Git)
- **Agents:** Python scripts using LangChain/LlamaIndex or custom tool-calling with chosen LLM API (Anthropic, OpenAI, xAI)
- **Frontend (optional):** React/Next.js dashboard for leadership views
- **Auth & Permissions:** Clerk or enterprise SSO + RBAC defined in org-schema
- **Hosting:** Fly.io / Vercel / Self-hosted Docker
- **Search:** Built-in Markdown indexing + optional vector store for large scale
- **Anonymity:** Strip metadata, use temporary IDs, aggregate only

## File Templates

### 1. org-schema.md (Master Configuration)
```markdown
# Organization Schema

**Organization Type:** Tech / Manufacturing / etc.
**Departments:** #Engineering #Sales #Finance #HR
**Ethos Principles:**
- Customer First
- Radical Transparency
- etc.

**Source Authority Hierarchy:**
1. ERP/System of Record
2. Official Memos
3. Meeting Notes
4. Employee Submissions

**Conflict Rules:** ...
```

### 2. Wiki Page Template (enterprise version)
```markdown
**Title:** [Entity/Topic]

**Department:** Engineering
**Classification:** Internal

**Last Updated:** YYYY-MM-DD
**Updated By:** Agent-X

**Tags:** #feature #process

**Relevance:** 5/5
**Relevance Horizon:** Evergreen / Through 2028

**Key Points:**
- ...

**Reality Gap:**
- Documented: ...
- Actual: ...

**Strategic / Business Implications:**
- ...

**Source Credibility:** High
**Motive Check:** None
**Skepticism Notes:** ...

**Conflict Detection:** None / Flagged: Conflicts with Q2 policy
**Ethos Alignment:** Strong / Partial / Conflict

**Emotional Trigger / Memory Anchors / Action Potential:** (Personal use)

**Sources:** 
- [../raw/doc.pdf]

**See Also:**
```

## Core Workflows

### 1. Ingestion & Maintenance
1. Drop file in `raw/`
2. Agent scans → updates relevant wiki pages
3. Runs conflict/ethos checks
4. Logs changes + notifies stakeholders

### 2. Reality Gap & Anonymous Feedback
- Employees submit via secure form/Slack bot (identity stripped)
- Agent aggregates and creates/updates pages in `improvements/`
- Routes high-impact ideas bypassing hierarchy

### 3. Querying
- User asks question in preferred LLM interface
- Agent reads relevant wiki pages + org-schema
- Responds with citations and confidence

### 4. Continuous Improvement
- Weekly/Monthly linter agent scans for orphans, contradictions, stale info
- Generates improvement suggestions based on friction patterns

## Key Features by Tier

**Small Business:**
- Single wiki + basic anonymous box

**Mid-Market:**
- Multi-department + basic analytics

**Enterprise:**
- Full RBAC, audit trails, API integrations, psychological safety scoring, ROI estimators, benchmarking

## Advanced Capabilities
- Shadow process detection (via email/Slack/calendar patterns)
- Implementation tracking with before/after metrics
- Leadership Courage & Psychological Safety scoring
- Industry benchmarking (anonymized)

## Implementation Phases

### Phase 1: MVP (Personal → Small Team)
- Basic Karpathy-style wiki
- Templates + ingestion agent
- Git versioning

### Phase 2: Enterprise Core
- org-schema + multi-agent system
- Conflict detection
- Access controls

### Phase 3: Human Layer
- Anonymous submissions
- Reality gap tracking
- Improvement engine

### Phase 4: Polish & Scale
- Dashboard UI
- Advanced analytics
- Integrations (Slack, email, ERP exports)

## Security & Compliance
- Full audit logs
- Data residency options
- Anonymity guarantees
- SOC2 / ISO27001 ready design

## Success Metrics
- Reduction in documented vs actual process gaps
- Increase in implemented employee ideas
- Decrease in cross-department conflicts
- High employee trust scores in submissions

## Next Steps for Coding
1. Set up repo structure
2. Implement base agent with file I/O tools
3. Create ingestion pipeline
4. Build template enforcement + linter
5. Add org-schema parser

---

This plan is ready for development. Let me know if you want any section expanded or code stubs added.