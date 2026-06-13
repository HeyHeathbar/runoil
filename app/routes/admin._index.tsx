import type { Route } from "./+types/admin._index";
import { clerkClient } from "@clerk/react-router/server";
import { requirePlatformAdmin } from "~/lib/auth.server";
import { corpus } from "~/lib/corpus.server";

export async function loader(args: Route.LoaderArgs) {
  await requirePlatformAdmin(args);

  const client = clerkClient(args);
  const { data: orgs } = await client.organizations.getOrganizationList({
    limit: 100,
  });

  const rows = await Promise.all(
    orgs.map(async (o) => {
      const all = await corpus.listTruths(o.id);
      return {
        id: o.id,
        name: o.name,
        slug: o.slug ?? "",
        createdAt: new Date(o.createdAt).toISOString().slice(0, 10),
        truths: all.length,
        published: all.filter((t) => t.status === "published").length,
      };
    }),
  );

  return { rows };
}

export default function AdminIndex({ loaderData }: Route.ComponentProps) {
  const { rows } = loaderData;
  const totals = rows.reduce(
    (acc, r) => ({
      truths: acc.truths + r.truths,
      published: acc.published + r.published,
    }),
    { truths: 0, published: 0 },
  );

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Platform admin</h1>
      <p className="mt-2 text-muted-foreground">
        Your super-admin view across every tenant — {rows.length} organizations,{" "}
        {totals.truths} truths ({totals.published} published).
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Organization</th>
              <th className="px-4 py-2 font-medium">Created</th>
              <th className="px-4 py-2 font-medium">Truths</th>
              <th className="px-4 py-2 font-medium">Published</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.slug}</div>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{r.createdAt}</td>
                <td className="px-4 py-2">{r.truths}</td>
                <td className="px-4 py-2">{r.published}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={4}>
                  No organizations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
