import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { corpus as defaultCorpus } from "./corpus.server";
import { serializeTruth } from "./corpus/okf";

// An MCP server scoped to ONE org, exposing only that org's PUBLISHED truths.
// This is RunOil's consumption plane (spec B10): governed truth served to any
// MCP-capable AI tool. Hard invariant: published-only, single tenant.
// `corpus` is injectable for testing.
export function buildMcpServer(
  orgId: string,
  corpus: { listTruths: typeof defaultCorpus.listTruths; getTruth: typeof defaultCorpus.getTruth } = defaultCorpus,
): McpServer {
  const server = new McpServer({ name: "runoil", version: "0.1.0" });

  server.registerTool(
    "search_truths",
    {
      title: "Search governed organizational truths",
      description:
        "Search this organization's published Atomic Truths — its governed system of record for how the company actually works. Use this to answer questions about internal processes, decisions, ownership, and policies with verified truth instead of guesses. Returns matching truths with id, type, statement, owner, and a snippet.",
      inputSchema: {
        query: z
          .string()
          .describe(
            "Keywords to match across statements, descriptions, tags, owners, and notes. Empty string returns all published truths.",
          ),
      },
    },
    async ({ query }) => {
      const all = await corpus.listTruths(orgId, { status: "published" });
      const q = query.toLowerCase().trim();
      const matches = all.filter((t) =>
        [t.statement, t.description, t.body, t.tags.join(" "), t.owner, t.type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
      const results = matches.map((t) => ({
        id: t.id,
        type: t.type,
        statement: t.statement,
        owner: t.owner ?? null,
        snippet: (t.description || t.body || "").slice(0, 200),
      }));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: results.length, results }, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_truth",
    {
      title: "Get a governed truth by id",
      description:
        "Fetch a single published Atomic Truth by its id, including its full provenance, reality gap (stated vs. actual vs. documented), and notes. Returns the governed OKF record.",
      inputSchema: {
        id: z.string().describe("The runoil_id, e.g. at_0f3a1b2c"),
      },
    },
    async ({ id }) => {
      const truth = await corpus.getTruth(orgId, id);
      if (!truth || truth.status !== "published") {
        return {
          content: [
            { type: "text", text: `No published truth with id "${id}".` },
          ],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: serializeTruth(truth) }] };
    },
  );

  return server;
}
