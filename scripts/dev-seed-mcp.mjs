// Dev-only: seed one PUBLISHED truth + an MCP token for smoke-testing /mcp.
// Writes OKF files directly into the anchored .data dir (no auth/git needed).
// Run from the runoil/ project root: node scripts/dev-seed-mcp.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const APP = path.resolve(".");
const ORG = "org_3F5i9OUeQBiK3tBh3ITVmGM0aub"; // the "Run Oil" tenant
const corpusOrg = path.join(APP, ".data/corpus", ORG);

await mkdir(path.join(corpusOrg, "processes"), { recursive: true });
await writeFile(
  path.join(corpusOrg, "index.md"),
  `---\nokf_version: "0.1"\ntype: Corpus\ntitle: RunOil Corpus\n---\n`,
);
await writeFile(
  path.join(corpusOrg, "processes", "orders-ship-within-48-hours-of-payment.md"),
  `---
type: Process
title: Orders ship within 48 hours of payment
description: Order-to-cash fulfillment SLA
status: published
owner: Ops Lead
confidence: corroborated
reality_gap:
  stated: 48 hours
  actual: 3-5 days during peak season
  documented: SOP states 48 hours
  severity: high
tags:
  - order-to-cash
  - fulfillment
timestamp: 2026-06-13T00:00:00.000Z
runoil_id: at_seed0001
---
The fulfillment team commits to a 48-hour ship SLA. During peak season actual times slip to 3-5 days.
`,
);

const token = "rok_devsmoketest0123456789abcdef0123456789abcdef";
const tokenDir = path.join(APP, ".data/mcp-tokens");
await mkdir(tokenDir, { recursive: true });
await writeFile(
  path.join(tokenDir, `${ORG}.json`),
  JSON.stringify({ hash: createHash("sha256").update(token).digest("hex") }),
);

console.log(`SEEDED token=${token}`);
