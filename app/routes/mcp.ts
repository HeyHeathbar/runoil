import { randomUUID } from "node:crypto";
import type { Route } from "./+types/mcp";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { resolveOrgId } from "~/lib/mcp-tokens.server";
import { buildMcpServer } from "~/lib/mcp-server.server";

// Resource route (no default export) — the MCP endpoint. Each org connects with
// its own bearer token, which resolves to exactly one tenant's published truths.
//
// MCP Streamable HTTP is multi-request (initialize, then tools/list, tools/call
// as separate POSTs). We keep one transport per session id, bound to the org
// that opened it. Single-instance only for now (see plan risks).
const sessions = new Map<
  string,
  { transport: WebStandardStreamableHTTPServerTransport; orgId: string }
>();

function bearerToken(request: Request): string | null {
  const match = (request.headers.get("authorization") ?? "").match(
    /^Bearer\s+(.+)$/i,
  );
  return match ? match[1].trim() : null;
}

function unauthorized(): Response {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized: missing or invalid token" },
      id: null,
    }),
    {
      status: 401,
      headers: { "content-type": "application/json", "www-authenticate": "Bearer" },
    },
  );
}

async function handle(request: Request): Promise<Response> {
  const token = bearerToken(request);
  const orgId = token ? await resolveOrgId(token) : null;
  if (!orgId) return unauthorized();

  const sessionId = request.headers.get("mcp-session-id");
  if (sessionId) {
    const existing = sessions.get(sessionId);
    // Bind the session to its org; a token for a different org can't reuse it.
    if (!existing || existing.orgId !== orgId) return unauthorized();
    return existing.transport.handleRequest(request);
  }

  // No session id — an initialize request. Open a new org-scoped session.
  const server = buildMcpServer(orgId);
  const transport: WebStandardStreamableHTTPServerTransport =
    new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableJsonResponse: true,
      onsessioninitialized: (id) => {
        sessions.set(id, { transport, orgId });
      },
      onsessionclosed: (id) => {
        sessions.delete(id);
      },
    });
  await server.connect(transport);
  return transport.handleRequest(request);
}

export async function action({ request }: Route.ActionArgs) {
  return handle(request);
}

export async function loader({ request }: Route.LoaderArgs) {
  return handle(request);
}
