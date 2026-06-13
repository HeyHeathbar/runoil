import type { Route } from "./+types/truths.new";
import { Form, Link, redirect } from "react-router";
import { requireSession, resolveActor } from "~/lib/auth.server";
import { corpus } from "~/lib/corpus.server";
import { truthFromForm } from "~/lib/truth-form";
import { TruthFields } from "~/components/truth-fields";
import { Button } from "~/components/ui/button";

export async function loader(args: Route.LoaderArgs) {
  await requireSession(args);
  return null;
}

export async function action(args: Route.ActionArgs) {
  const { orgId, userId } = await requireSession(args);
  const form = await args.request.formData();
  const id = `at_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  // New truths always enter the corpus as `proposed` — the verification gate
  // is the only way to promote them (spec B6).
  const truth = truthFromForm(form, { id, status: "proposed" });
  const actor = await resolveActor(args, userId);
  await corpus.writeTruth(orgId, truth, actor);
  return redirect(`/truths/${id}`);
}

export default function NewTruth() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <Link to="/truths" className="text-sm text-muted-foreground">
          ← Corpus
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          New Atomic Truth
        </h1>
        <p className="text-sm text-muted-foreground">
          Captured as <span className="font-medium">proposed</span> until an
          admin verifies it.
        </p>
      </div>
      <Form method="post" className="flex flex-col gap-6">
        <TruthFields />
        <div className="flex gap-3">
          <Button type="submit">Create truth</Button>
          <Button asChild variant="ghost">
            <Link to="/truths">Cancel</Link>
          </Button>
        </div>
      </Form>
    </div>
  );
}
