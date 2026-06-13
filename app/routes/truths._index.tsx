import type { Route } from "./+types/truths._index";
import { Link, Form } from "react-router";
import { requireSession } from "~/lib/auth.server";
import { corpus } from "~/lib/corpus.server";
import { TRUTH_TYPES, type TruthStatus } from "~/lib/corpus/truth";
import { Button } from "~/components/ui/button";
import { StatusBadge } from "~/components/status-badge";

const STATUSES: TruthStatus[] = [
  "proposed",
  "verified",
  "published",
  "disputed",
  "retired",
];
const selectClass =
  "border-input bg-transparent h-9 rounded-md border px-3 text-sm";

export async function loader(args: Route.LoaderArgs) {
  const { orgId } = await requireSession(args);
  const url = new URL(args.request.url);
  const status = url.searchParams.get("status") ?? "";
  const type = url.searchParams.get("type") ?? "";

  let truths = await corpus.listTruths(
    orgId,
    status ? { status: status as TruthStatus } : {},
  );
  if (type) truths = truths.filter((t) => t.type === type);
  truths.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return { truths, status, type };
}

export default function TruthsIndex({ loaderData }: Route.ComponentProps) {
  const { truths, status, type } = loaderData;
  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Corpus</h1>
        <Button asChild>
          <Link to="/truths/new">New truth</Link>
        </Button>
      </div>

      <Form method="get" className="mb-6 flex items-end gap-3">
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground" htmlFor="type">
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={type}
            className={selectClass}
          >
            <option value="">All types</option>
            {TRUTH_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className={selectClass}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </Form>

      {truths.length === 0 ? (
        <p className="text-muted-foreground">
          No truths yet. Create the first one to start the Corpus.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {truths.map((t) => (
            <li key={t.id}>
              <Link
                to={`/truths/${t.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.statement}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.type}
                    {t.owner ? ` · ${t.owner}` : ""}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
