// Core domain model for an Atomic Truth (spec Appendix A), mapped onto an OKF
// document. The OKF bundle on disk is canonical; these types are the in-memory
// representation the app and MCP server work with.

export type TruthType =
  | "Process"
  | "Decision"
  | "Friction"
  | "Open Loop"
  | "Ownership"
  | "Definition-of-Done";

export const TRUTH_TYPES: TruthType[] = [
  "Process",
  "Decision",
  "Friction",
  "Open Loop",
  "Ownership",
  "Definition-of-Done",
];

export type TruthStatus =
  | "proposed"
  | "verified"
  | "published"
  | "disputed"
  | "retired";

export type Confidence = "single-source" | "corroborated";

export type Severity = "none" | "low" | "med" | "high";

// The signature field (spec B6): the delta between what's stated, lived, and documented.
export interface RealityGap {
  stated?: string;
  actual?: string;
  documented?: string;
  severity: Severity;
}

export interface AtomicTruth {
  id: string; // stable runoil_id, e.g. "at_0f3a1b2c"
  type: TruthType;
  statement: string; // canonical one-liner -> OKF `title`
  description?: string;
  status: TruthStatus;
  owner?: string;
  confidence: Confidence;
  realityGap?: RealityGap;
  tags: string[];
  timestamp: string; // ISO 8601, last change
  body: string; // markdown narrative: provenance, quotes, related links
}

// Two roles for slice 1: the champion/partner (admin) adjudicates the corpus;
// members author and edit proposals. (Full RBAC matrix is Appendix B, later.)
export type Role = "admin" | "member";

// Who performed a change — recorded as the git commit author (audit trail).
export interface Actor {
  name: string;
  email: string;
}

// Allowed status transitions. `disputed` is re-entrant: a later source can
// reopen a verified or published truth (spec B2/B6). `retired` is terminal.
const ALLOWED_TRANSITIONS: Record<TruthStatus, TruthStatus[]> = {
  proposed: ["verified", "retired"],
  verified: ["published", "disputed", "retired"],
  published: ["disputed", "retired"],
  disputed: ["verified", "retired"],
  retired: [],
};

// The verification gate (spec B6): only an admin/champion changes status.
// Members create proposals and edit content, but never adjudicate.
export function canTransition(
  from: TruthStatus,
  to: TruthStatus,
  role: Role,
): boolean {
  if (role !== "admin") return false;
  return ALLOWED_TRANSITIONS[from].includes(to);
}
