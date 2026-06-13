import { Badge } from "~/components/ui/badge";
import type { TruthStatus } from "~/lib/corpus/truth";

const VARIANTS: Record<
  TruthStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  proposed: "secondary",
  verified: "default",
  published: "default",
  disputed: "destructive",
  retired: "outline",
};

export function StatusBadge({ status }: { status: TruthStatus }) {
  return <Badge variant={VARIANTS[status]}>{status}</Badge>;
}
