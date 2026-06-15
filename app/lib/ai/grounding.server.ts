import { corpus } from "../corpus.server";
import { resolveModelProvider } from "./model";
import { aiSettings } from "./settings.server";
import { answerFromCorpus, type GroundedAnswer } from "./grounding";

// Resolve the org's configured model + the shared corpus, then answer in Truth mode.
// Mirrors how routes resolve the model (see sessions.$id.tsx "extract" action).
export async function answerForOrg(
  orgId: string,
  question: string,
): Promise<GroundedAnswer> {
  const model = resolveModelProvider(await aiSettings.get(orgId));
  return answerFromCorpus(orgId, question, { corpus, model });
}
