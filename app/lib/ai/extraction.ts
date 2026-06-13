import { TRUTH_TYPES, type TruthType } from "../corpus/truth";
import type { Proposal } from "../sessions";
import type { ModelProvider } from "./model";

// Instruction for the model to propose typed Atomic Truths from a transcript.
export function buildExtractionPrompt(transcript: string): string {
  return `You are RunOil's extraction agent. From the conversation transcript below, extract discrete "Atomic Truths" about how the organization actually works.

Each Atomic Truth has one of these types:
- Process: how something gets done
- Decision: a choice that was made
- Friction: something that blocks or slows work
- Open Loop: a decision or thread left unresolved
- Ownership: who is accountable for something
- Definition-of-Done: the agreed bar for "complete"

Return ONLY a JSON array (no prose). Each element:
{
  "type": "<one of the types above>",
  "statement": "<one concise sentence>",
  "description": "<optional short summary>",
  "owner": "<optional accountable person/role>",
  "confidence": "single-source" | "corroborated",
  "quote": "<a short verbatim quote from the transcript supporting this>"
}

Only include truths actually supported by the transcript. If none, return [].

TRANSCRIPT:
${transcript}`;
}

function extractJsonArray(text: string): unknown[] | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const parsed = JSON.parse(candidate.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// Parse a model response into reviewable proposals. Tolerant of prose/fences
// and skips anything malformed — bad output yields fewer proposals, never a crash.
export function parseProposals(output: string): Proposal[] {
  const items = extractJsonArray(output);
  if (!items) return [];

  const proposals: Proposal[] = [];
  items.forEach((raw, i) => {
    if (typeof raw !== "object" || raw === null) return;
    const r = raw as Record<string, unknown>;
    const statement = typeof r.statement === "string" ? r.statement.trim() : "";
    if (!statement) return;
    if (!(TRUTH_TYPES as string[]).includes(String(r.type))) return;

    const str = (v: unknown) =>
      typeof v === "string" && v.trim() ? v.trim() : undefined;
    proposals.push({
      id: `p${i}`,
      type: r.type as TruthType,
      statement,
      ...(str(r.description) ? { description: str(r.description) } : {}),
      ...(str(r.owner) ? { owner: str(r.owner) } : {}),
      confidence: r.confidence === "corroborated" ? "corroborated" : "single-source",
      ...(str(r.quote) ? { quote: str(r.quote) } : {}),
      status: "pending",
    });
  });
  return proposals;
}

export async function extractProposals(
  transcript: string,
  model: ModelProvider,
): Promise<Proposal[]> {
  const output = await model.complete(buildExtractionPrompt(transcript));
  return parseProposals(output);
}
