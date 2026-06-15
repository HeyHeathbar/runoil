// Governance gate — the machine-checkable backstop for agent-first development.
//
// Because no human hand-reviews every line, specs are the durable record and
// the *shipping PR is the reconciliation gate*. This script enforces that:
//
//   1. Every feature spec under docs/features/ carries a valid Status
//      (Proposed | In progress | Shipped).
//   2. A spec marked `Status: Shipped` must have EVERY box under its
//      `## Acceptance criteria` checked — you cannot ship a feature while it
//      still has unmet, unchecked criteria.
//   3. Plans under docs/superpowers/plans/ that declare `Status: Shipped`
//      must have no unchecked task boxes left.
//
// Run: node scripts/check-governance.mjs   (also: npm run governance)
// Exits non-zero on any violation so CI and the pre-commit hook can block.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(".");
const VALID = ["proposed", "in progress", "shipped"];

/** Pull the single Status value, or null if absent / a template placeholder. */
function readStatus(body) {
  const m = body.match(/^\s*-\s*\*\*Status:\*\*\s*(.+?)\s*$/im);
  if (!m) return null;
  const raw = m[1].trim();
  // The template lists all options separated by "·" — not a real status.
  if (raw.includes("·")) return null;
  return raw;
}

/** Count unchecked `- [ ]` boxes within a `## <heading>` section. */
function uncheckedInSection(body, heading) {
  const lines = body.split("\n");
  const start = lines.findIndex((l) =>
    new RegExp(`^##\\s+${heading}\\s*$`, "i").test(l),
  );
  if (start === -1) return null; // section absent
  let count = 0;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) break; // next section
    if (/^\s*-\s*\[\s\]/.test(lines[i])) count++;
  }
  return count;
}

/** Count every unchecked box in the whole document. */
function uncheckedTotal(body) {
  return (body.match(/^\s*-\s*\[\s\]/gim) || []).length;
}

async function mdFiles(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return []; // dir may not exist yet
  }
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .filter((e) => !/template/i.test(e.name))
    .map((e) => path.join(dir, e.name));
}

export async function runGovernanceCheck() {
  const violations = [];
  const summary = [];

  // --- Feature specs -------------------------------------------------------
  for (const file of await mdFiles(path.join(ROOT, "docs/features"))) {
    const rel = path.relative(ROOT, file);
    const body = await readFile(file, "utf8");
    const status = readStatus(body);

    if (status === null) {
      violations.push(`${rel}: missing a "**Status:**" line (Proposed | In progress | Shipped).`);
      continue;
    }
    if (!VALID.includes(status.toLowerCase())) {
      violations.push(`${rel}: invalid Status "${status}" — expected Proposed | In progress | Shipped.`);
      continue;
    }
    summary.push(`${rel} — ${status}`);

    if (status.toLowerCase() === "shipped") {
      const unmet = uncheckedInSection(body, "Acceptance criteria");
      if (unmet === null) {
        violations.push(`${rel}: Status is Shipped but has no "## Acceptance criteria" section to reconcile against.`);
      } else if (unmet > 0) {
        violations.push(`${rel}: Status is Shipped but ${unmet} acceptance criteria are still unchecked. Reconcile them or move Status back.`);
      }
    }
  }

  // --- Implementation plans (opt-in via a Status marker) -------------------
  for (const file of await mdFiles(path.join(ROOT, "docs/superpowers/plans"))) {
    const rel = path.relative(ROOT, file);
    const body = await readFile(file, "utf8");
    const status = readStatus(body);
    if (status === null) continue; // plans without a Status marker aren't gated
    summary.push(`${rel} — ${status}`);
    if (status.toLowerCase() === "shipped") {
      const left = uncheckedTotal(body);
      if (left > 0) {
        violations.push(`${rel}: plan Status is Shipped but ${left} task step(s) remain unchecked.`);
      }
    }
  }

  return { ok: violations.length === 0, violations, summary };
}

// CLI entry — only when run directly, not when imported by the hook.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { ok, violations, summary } = await runGovernanceCheck();
  if (summary.length) {
    console.log("Governance — tracked specs & plans:");
    for (const s of summary) console.log(`  • ${s}`);
  }
  if (!ok) {
    console.error("\n✗ Governance gate failed:");
    for (const v of violations) console.error(`  - ${v}`);
    console.error("\nSee CLAUDE.md › Governance and docs/architecture/adr/0001-agent-first-governance.md.");
    process.exit(1);
  }
  console.log("\n✓ Governance gate passed.");
}
