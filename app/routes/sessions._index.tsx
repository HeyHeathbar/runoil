import type { Route } from "./+types/sessions._index";
import { Link } from "react-router";
import { requireSession } from "~/lib/auth.server";
import { sessions } from "~/lib/sessions.server";
import { Button } from "~/components/ui/button";

export async function loader(args: Route.LoaderArgs) {
  const { orgId } = await requireSession(args);
  return { list: await sessions.list(orgId) };
}

export default function SessionsIndex({ loaderData }: Route.ComponentProps) {
  const { list } = loaderData;
  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">The Guide</h1>
          <p className="text-sm text-muted-foreground">
            Capture a conversation, extract proposed truths, review them into the
            Corpus.
          </p>
        </div>
        <Button asChild>
          <Link to="/sessions/new">New session</Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <p className="text-muted-foreground">
          No sessions yet. Start one from a transcript or an audio recording.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {list.map((s) => {
            const pending = s.proposals.filter((p) => p.status === "pending").length;
            return (
              <li key={s.id}>
                <Link
                  to={`/sessions/${s.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.source} · {s.proposals.length} proposals
                      {pending ? ` · ${pending} pending` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {s.createdAt.slice(0, 10)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
