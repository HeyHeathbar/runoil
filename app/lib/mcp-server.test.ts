import { describe, expect, test, beforeEach } from "vitest";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createCorpus } from "./corpus/repo";
import { buildMcpServer } from "./mcp-server.server";
import type { AtomicTruth } from "./corpus/truth";

const ORG = "org_mcptest";
const actor = { name: "Tester", email: "t@runoil.ai" };

function makeTruth(over: Partial<AtomicTruth>): AtomicTruth {
  return {
    id: "at_x",
    type: "Process",
    statement: "A truth",
    status: "published",
    confidence: "single-source",
    tags: [],
    timestamp: "2026-06-13T00:00:00.000Z",
    body: "",
    ...over,
  };
}

// Connect a real MCP client to the server over an in-memory transport pair,
// exactly as a remote client would over the wire (initialize + tools/call).
async function connectClient(corpus: ReturnType<typeof createCorpus>) {
  const server = buildMcpServer(ORG, corpus);
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "test", version: "0" });
  await client.connect(clientTransport);
  return client;
}

let root: string;
let corpus: ReturnType<typeof createCorpus>;
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "runoil-mcp-"));
  corpus = createCorpus(root);
});

describe("MCP server — consumption plane", () => {
  test("search_truths returns only PUBLISHED truths", async () => {
    await corpus.writeTruth(
      ORG,
      makeTruth({ id: "at_pub", statement: "Orders ship in 48h", status: "published" }),
      actor,
    );
    await corpus.writeTruth(
      ORG,
      makeTruth({ id: "at_draft", statement: "Draft policy", status: "verified" }),
      actor,
    );

    const client = await connectClient(corpus);
    const res = await client.callTool({
      name: "search_truths",
      arguments: { query: "" },
    });
    const payload = JSON.parse((res.content as { text: string }[])[0].text);

    expect(payload.results.map((r: { id: string }) => r.id)).toEqual(["at_pub"]);
  });

  test("search_truths matches on keywords", async () => {
    await corpus.writeTruth(
      ORG,
      makeTruth({ id: "at_a", statement: "Refund window is 30 days", status: "published" }),
      actor,
    );
    await corpus.writeTruth(
      ORG,
      makeTruth({ id: "at_b", statement: "Orders ship in 48h", status: "published" }),
      actor,
    );

    const client = await connectClient(corpus);
    const res = await client.callTool({
      name: "search_truths",
      arguments: { query: "refund" },
    });
    const payload = JSON.parse((res.content as { text: string }[])[0].text);

    expect(payload.results.map((r: { id: string }) => r.id)).toEqual(["at_a"]);
  });

  test("get_truth returns a published truth, refuses an unpublished one", async () => {
    await corpus.writeTruth(
      ORG,
      makeTruth({ id: "at_pub", statement: "Published thing", status: "published" }),
      actor,
    );
    await corpus.writeTruth(
      ORG,
      makeTruth({ id: "at_draft", statement: "Unpublished thing", status: "proposed" }),
      actor,
    );

    const client = await connectClient(corpus);

    const ok = await client.callTool({
      name: "get_truth",
      arguments: { id: "at_pub" },
    });
    expect((ok.content as { text: string }[])[0].text).toContain("Published thing");
    expect(ok.isError).toBeFalsy();

    const denied = await client.callTool({
      name: "get_truth",
      arguments: { id: "at_draft" },
    });
    expect(denied.isError).toBe(true);
  });
});
