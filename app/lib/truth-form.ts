import {
  TRUTH_TYPES,
  type AtomicTruth,
  type Confidence,
  type Severity,
  type TruthStatus,
  type TruthType,
} from "~/lib/corpus/truth";

export const CONFIDENCES: Confidence[] = ["single-source", "corroborated"];
export const SEVERITIES: Severity[] = ["none", "low", "med", "high"];

// Build an AtomicTruth from submitted form fields. Identity (id) and lifecycle
// (status) are supplied by the caller, never trusted from the form.
export function truthFromForm(
  form: FormData,
  base: { id: string; status: TruthStatus },
): AtomicTruth {
  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v.trim() : "";
  };

  const statement = str("statement");
  if (!statement) throw new Response("A statement is required", { status: 400 });

  const type = (TRUTH_TYPES as string[]).includes(str("type"))
    ? (str("type") as TruthType)
    : "Process";
  const confidence = (CONFIDENCES as string[]).includes(str("confidence"))
    ? (str("confidence") as Confidence)
    : "single-source";
  const severity = (SEVERITIES as string[]).includes(str("severity"))
    ? (str("severity") as Severity)
    : "none";

  const stated = str("stated");
  const actual = str("actual");
  const documented = str("documented");
  const hasGap = Boolean(stated || actual || documented) || severity !== "none";

  const description = str("description");
  const owner = str("owner");
  const tags = str("tags")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    id: base.id,
    type,
    statement,
    ...(description ? { description } : {}),
    status: base.status,
    ...(owner ? { owner } : {}),
    confidence,
    ...(hasGap
      ? {
          realityGap: {
            ...(stated ? { stated } : {}),
            ...(actual ? { actual } : {}),
            ...(documented ? { documented } : {}),
            severity,
          },
        }
      : {}),
    tags,
    timestamp: new Date().toISOString(),
    body: str("body"),
  };
}
