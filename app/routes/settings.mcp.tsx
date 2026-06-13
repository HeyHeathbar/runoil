import type { Route } from "./+types/settings.mcp";
import { Form, Link } from "react-router";
import { requireSession } from "~/lib/auth.server";
import { generateToken, hasToken } from "~/lib/mcp-tokens.server";
import { Button } from "~/components/ui/button";

export async function loader(args: Route.LoaderArgs) {
  const { orgId } = await requireSession(args);
  const mcpUrl = new URL("/mcp", args.request.url).toString();
  return { mcpUrl, configured: await hasToken(orgId) };
}

export async function action(args: Route.ActionArgs) {
  const { orgId } = await requireSession(args);
  const token = await generateToken(orgId);
  return { token };
}

export default function McpSettings({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { mcpUrl, configured } = loaderData;
  const token = actionData?.token;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link to="/truths" className="text-sm text-muted-foreground">
        ← Corpus
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        Connect your AI tools
      </h1>
      <p className="mt-2 text-muted-foreground">
        RunOil publishes your organization's governed truth over the Model
        Context Protocol. Connect Claude (or any MCP client) with the endpoint
        and a token below. Only <span className="font-medium">published</span>{" "}
        truths are served.
      </p>

      <div className="mt-6 grid gap-2">
        <span className="text-sm font-medium">Endpoint</span>
        <code className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm">
          {mcpUrl}
        </code>
      </div>

      <Form method="post" className="mt-6">
        <Button type="submit">
          {configured ? "Rotate token" : "Generate token"}
        </Button>
        {configured && !token && (
          <p className="mt-2 text-sm text-muted-foreground">
            A token already exists. Rotating creates a new one and invalidates
            the old.
          </p>
        )}
      </Form>

      {token && (
        <div className="mt-6 rounded-lg border border-accent-foreground/30 bg-accent p-4">
          <p className="text-sm font-medium text-accent-foreground">
            Your token — copy it now. It won't be shown again.
          </p>
          <code className="mt-2 block overflow-x-auto rounded-md border bg-background px-3 py-2 font-mono text-sm">
            {token}
          </code>
          <p className="mt-4 text-sm font-medium">Add to Claude Code:</p>
          <code className="mt-1 block overflow-x-auto rounded-md border bg-background px-3 py-2 font-mono text-xs">
            {`claude mcp add --transport http runoil ${mcpUrl} --header "Authorization: Bearer ${token}"`}
          </code>
        </div>
      )}
    </div>
  );
}
