import type { AtomicTruth, RealityGap } from "../corpus/truth";

// The view-model the cockpit's receipt card renders for one cited Atomic Truth.
// Derived here so the card stays presentational and this mapping is unit-testable —
// the receipts are the product, so their display contract is worth locking down.
export interface ReceiptView {
  id: string;
  statement: string;
  type: string;
  status: string;
  owner?: string;
  conflict: boolean; // a disputed truth — the Truth-mode conflict flag
  gap?: RealityGap; // only when the truth carries a reality gap
  quote?: string; // a supporting provenance quote, when present
  href: string; // link into the Corpus
}

export function toReceiptView(truth: AtomicTruth): ReceiptView {
  return {
    id: truth.id,
    statement: truth.statement,
    type: truth.type,
    status: truth.status,
    ...(truth.owner ? { owner: truth.owner } : {}),
    conflict: truth.status === "disputed",
    ...(truth.realityGap ? { gap: truth.realityGap } : {}),
    ...(truth.provenance?.quote ? { quote: truth.provenance.quote } : {}),
    href: `/truths/${truth.id}`,
  };
}
