import type { Confidence, TruthType } from "~/lib/corpus/truth";

// A captured conversation the Guide processes (spec B3/B4). Sessions are
// provenance sources, kept separate from the governed Corpus.
export type SessionSource = "paste" | "audio";

export type ProposalStatus = "pending" | "accepted" | "rejected";

// A model-proposed Atomic Truth awaiting human review (the verification gate).
export interface Proposal {
  id: string;
  type: TruthType;
  statement: string;
  description?: string;
  owner?: string;
  confidence: Confidence;
  quote?: string; // verbatim supporting quote from the transcript
  status: ProposalStatus;
  truthId?: string; // runoil_id once accepted into the Corpus
}

export interface Session {
  id: string;
  title: string;
  source: SessionSource;
  transcript: string;
  createdAt: string; // ISO 8601
  proposals: Proposal[];
}
