import type { Route } from "./+types/truths.$id";
import { Form, Link, redirect } from "react-router";
import { requireSession, resolveActor } from "~/lib/auth.server";
import { corpus } from "~/lib/corpus.server";
import { truthFromForm } from "~/lib/truth-form";
import { canTransition, type TruthStatus } from "~/lib/corpus/truth";
import { TruthFields } from "~/components/truth-fields";
import { StatusBadge } from "~/components/status-badge";
import { Button } from "~/components/ui/button";

const STATUSES: TruthStatus[] = [
  "proposed",
  "verified",
  "published",
  "disputed",
  "retired",
];

export async function loader(args: Route.LoaderArgs) {
  const { orgId, role } = await requireSession(args);
  const truth = await corpus.getTruth(orgId, args.params.id);
  if (!truth) throw new Response("Truth not found", { status: 404 });

  const targets = STATUSES.filter((s) => canTransition(truth.status, s, role));
  const canEdit = role === "admin" || truth.status === "proposed";
  return { truth, role, targets, canEdit };
}

export async function action(args: Route.ActionArgs) {
  const { orgId, userId, role } = await requireSession(args);
  const current = await corpus.getTruth(orgId, args.params.id);
  if (!current) throw new Response("Truth not found", { status: 404 });

  const form = await args.request.formData();
  const intent = form.get("intent");
  const actor = await resolveActor(args, userId);

  if (intent === "transition") {
    const to = String(form.get("to")) as TruthStatus;
    if (!canTransition(current.status, to, role)) {
      throw new Response("Forbidden", { status: 403 });
    }
    await corpus.writeTruth(
      orgId,
      { ...current, status: to, timestamp: new Date().toISOString() },
      actor,
    );
    return redirect(`/truths/${current.id}`);
  }

  if (intent === "edit") {
    if (role !== "admin" && current.status !== "proposed") {
      throw new Response("Forbidden", { status: 403 });
    }
    const updated = truthFromForm(form, {
      id: current.id,
      status: current.status,
    });
    await corpus.writeTruth(orgId, updated, actor);
    return redirect(`/truths/${current.id}`);
  }

  throw new Response("Unknown intent", { status: 400 });
}

export default function TruthDetail({ loaderData }: Route.ComponentProps) {
  const { truth, targets, canEdit } = loaderData;
  const gap = truth.realityGap;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <Link to="/truths" className="text-sm text-muted-foreground">
          ← Corpus
        </Link>
        <div className="mt-1 flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            {truth.statement}
          </h1>
          <StatusBadge status={truth.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {truth.type} · {truth.confidence}
          {truth.owner ? ` · ${truth.owner}` : ""}
        </p>
      </div>

      {/* Governance: lifecycle transitions allowed for this user + status. */}
      {targets.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-4">
          {targets.map((to) => (
            <Form method="post" key={to}>
              <input type="hidden" name="intent" value="transition" />
              <input type="hidden" name="to" value={to} />
              <Button
                type="submit"
                size="sm"
                variant={to === "retired" ? "outline" : "default"}
              >
                Move to {to}
              </Button>
            </Form>
          ))}
        </div>
      )}

      {gap && (
        <dl className="mb-6 grid gap-2 rounded-lg border p-4 text-sm">
          <div className="font-medium">Reality gap · severity {gap.severity}</div>
          {gap.stated && (
            <div>
              <dt className="text-muted-foreground">Stated</dt>
              <dd>{gap.stated}</dd>
            </div>
          )}
          {gap.actual && (
            <div>
              <dt className="text-muted-foreground">Actual</dt>
              <dd>{gap.actual}</dd>
            </div>
          )}
          {gap.documented && (
            <div>
              <dt className="text-muted-foreground">Documented</dt>
              <dd>{gap.documented}</dd>
            </div>
          )}
        </dl>
      )}

      {truth.body && (
        <div className="mb-8">
          <h2 className="mb-1 text-sm font-medium text-muted-foreground">
            Notes &amp; provenance
          </h2>
          <pre className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
            {truth.body}
          </pre>
        </div>
      )}

      {canEdit && (
        <details className="rounded-lg border p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Edit truth
          </summary>
          <Form method="post" className="mt-4 flex flex-col gap-6">
            <input type="hidden" name="intent" value="edit" />
            <TruthFields truth={truth} />
            <div>
              <Button type="submit">Save changes</Button>
            </div>
          </Form>
        </details>
      )}
    </div>
  );
}
