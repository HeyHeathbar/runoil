import type { Route } from "./+types/cockpit";
import { Form, Link } from "react-router";
import { requireSession } from "~/lib/auth.server";
import { aiSettings } from "~/lib/ai/settings.server";
import { answerForOrg } from "~/lib/ai/grounding.server";
import { toReceiptView } from "~/lib/cockpit/receipt";
import { ReceiptCard } from "~/components/receipt-card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";

export async function loader(args: Route.LoaderArgs) {
  const { orgId } = await requireSession(args);
  const settings = await aiSettings.get(orgId);
  return { modelConfigured: Boolean(settings.languageModel) };
}

export async function action(args: Route.ActionArgs) {
  const { orgId } = await requireSession(args);
  const form = await args.request.formData();
  const question = String(form.get("question") ?? "").trim();
  if (!question) {
    return { error: "Ask a question to query your verified truth." };
  }
  try {
    const { answer, citations } = await answerForOrg(orgId, question);
    return { question, answer, receipts: citations.map(toReceiptView) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export default function Cockpit({ loaderData, actionData }: Route.ComponentProps) {
  const result = actionData && "answer" in actionData ? actionData : null;
  const errorMsg = actionData && "error" in actionData ? actionData.error : null;
  const lastQuestion = result?.question ?? "";

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-2 flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Cockpit</h1>
        <Badge variant="default">Truth mode</Badge>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Ask a question and get an answer grounded only in your organization&rsquo;s
        published, verified truth — with the receipts shown.
      </p>

      {!loaderData.modelConfigured && (
        <p className="mb-6 rounded-md border bg-muted/30 px-3 py-2 text-sm">
          No language model is configured.{" "}
          <Link to="/settings/ai" className="underline">
            Configure one in Settings → AI
          </Link>{" "}
          to use Truth mode.
        </p>
      )}

      <Form method="post" className="flex flex-col gap-3">
        <Textarea
          name="question"
          rows={3}
          placeholder="e.g. How does our onboarding actually work?"
          defaultValue={lastQuestion}
        />
        <div>
          <Button type="submit" disabled={!loaderData.modelConfigured}>
            Ask Truth mode
          </Button>
        </div>
      </Form>

      {errorMsg && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          {errorMsg}
        </p>
      )}

      {result && (
        <div className="mt-8">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm whitespace-pre-wrap">{result.answer}</p>
          </div>
          {(result.receipts ?? []).length > 0 ? (
            <div className="mt-4">
              <h2 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Receipts · {(result.receipts ?? []).length}
              </h2>
              <div className="flex flex-col gap-3">
                {(result.receipts ?? []).map((r) => (
                  <ReceiptCard key={r.id} receipt={r} />
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              No published truths matched — Truth mode won&rsquo;t guess.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
