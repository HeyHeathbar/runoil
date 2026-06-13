import { randomUUID } from "node:crypto";
import type { Route } from "./+types/sessions.$id";
import { Form, Link } from "react-router";
import { requireSession, resolveActor } from "~/lib/auth.server";
import { sessions } from "~/lib/sessions.server";
import { aiSettings } from "~/lib/ai/settings.server";
import { resolveModelProvider } from "~/lib/ai/model";
import { extractProposals } from "~/lib/ai/extraction";
import { corpus } from "~/lib/corpus.server";
import type { AtomicTruth } from "~/lib/corpus/truth";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export async function loader(args: Route.LoaderArgs) {
  const { orgId } = await requireSession(args);
  const session = await sessions.get(orgId, args.params.id);
  if (!session) throw new Response("Session not found", { status: 404 });
  return { session };
}

export async function action(args: Route.ActionArgs) {
  const { orgId, userId } = await requireSession(args);
  const session = await sessions.get(orgId, args.params.id);
  if (!session) throw new Response("Session not found", { status: 404 });

  const form = await args.request.formData();
  const intent = form.get("intent");

  if (intent === "extract") {
    try {
      const model = resolveModelProvider(await aiSettings.get(orgId));
      session.proposals = await extractProposals(session.transcript, model);
      await sessions.update(orgId, session);
      return { message: `Extracted ${session.proposals.length} proposals.` };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  const proposalId = String(form.get("proposalId") ?? "");
  const proposal = session.proposals.find((p) => p.id === proposalId);
  if (!proposal) throw new Response("Proposal not found", { status: 404 });

  if (intent === "reject") {
    proposal.status = "rejected";
    await sessions.update(orgId, session);
    return { message: "Rejected." };
  }

  if (intent === "accept") {
    const id = `at_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const truth: AtomicTruth = {
      id,
      type: proposal.type,
      statement: proposal.statement,
      ...(proposal.description ? { description: proposal.description } : {}),
      status: "proposed",
      ...(proposal.owner ? { owner: proposal.owner } : {}),
      confidence: proposal.confidence,
      provenance: {
        sessionId: session.id,
        ...(proposal.quote ? { quote: proposal.quote } : {}),
      },
      tags: [],
      timestamp: new Date().toISOString(),
      body: proposal.quote
        ? `> ${proposal.quote}\n\n— from session ${session.id}`
        : `From session ${session.id}`,
    };
    await corpus.writeTruth(orgId, truth, await resolveActor(args, userId));
    proposal.status = "accepted";
    proposal.truthId = id;
    await sessions.update(orgId, session);
    return { message: "Accepted into the Corpus as a proposed truth." };
  }

  throw new Response("Unknown intent", { status: 400 });
}

export default function SessionDetail({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { session } = loaderData;
  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link to="/sessions" className="text-sm text-muted-foreground">
        ← The Guide
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        {session.title}
      </h1>
      <p className="text-sm text-muted-foreground">
        {session.source} · {session.createdAt.slice(0, 10)}
      </p>

      {actionData?.message && (
        <p className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          {actionData.message}
        </p>
      )}
      {actionData?.error && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          {actionData.error}
        </p>
      )}

      <details className="mt-6 rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Transcript
        </summary>
        <pre className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
          {session.transcript}
        </pre>
      </details>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">Proposed truths</h2>
        <Form method="post">
          <input type="hidden" name="intent" value="extract" />
          <Button type="submit" variant="secondary" size="sm">
            {session.proposals.length ? "Re-extract" : "Extract"}
          </Button>
        </Form>
      </div>

      {session.proposals.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No proposals yet. Run extraction to propose Atomic Truths from the
          transcript.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {session.proposals.map((p) => (
            <li key={p.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge variant="secondary">{p.type}</Badge>
                  <p className="mt-1 font-medium">{p.statement}</p>
                  {p.quote && (
                    <p className="mt-1 border-l-2 pl-2 text-sm text-muted-foreground italic">
                      “{p.quote}”
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3">
                {p.status === "pending" && (
                  <div className="flex gap-2">
                    <Form method="post">
                      <input type="hidden" name="intent" value="accept" />
                      <input type="hidden" name="proposalId" value={p.id} />
                      <Button type="submit" size="sm">
                        Accept
                      </Button>
                    </Form>
                    <Form method="post">
                      <input type="hidden" name="intent" value="reject" />
                      <input type="hidden" name="proposalId" value={p.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        Reject
                      </Button>
                    </Form>
                  </div>
                )}
                {p.status === "accepted" && p.truthId && (
                  <Link
                    to={`/truths/${p.truthId}`}
                    className="text-sm font-medium text-accent-foreground"
                  >
                    ✓ Accepted → view truth
                  </Link>
                )}
                {p.status === "rejected" && (
                  <span className="text-sm text-muted-foreground">Rejected</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
