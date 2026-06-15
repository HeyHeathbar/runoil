// Claude Code PreToolUse hook — runs the governance gate locally before any
// `git commit`, so spec/code drift is caught at commit time, not just in CI.
//
// Wired from .claude/settings.json (PreToolUse matcher: "Bash"). Reads the
// tool-call payload on stdin; if it's a git commit and the governance gate
// fails, it exits 2 to BLOCK the commit and surfaces the violations to the
// agent. Any non-commit Bash call passes straight through (exit 0).
import { runGovernanceCheck } from "../check-governance.mjs";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
    // If nothing is piped, don't hang.
    setTimeout(() => resolve(data), 200);
  });
}

const raw = await readStdin();
let command = "";
try {
  command = JSON.parse(raw || "{}")?.tool_input?.command ?? "";
} catch {
  command = "";
}

// Only gate actual commits. Let everything else (including `git commit --help`)
// pass through untouched.
const isCommit = /\bgit\b[^\n]*\bcommit\b/.test(command) && !/--help|-h\b/.test(command);
if (!isCommit) process.exit(0);

const { ok, violations } = await runGovernanceCheck();
if (ok) process.exit(0);

console.error("Governance gate blocked this commit — reconcile specs first:");
for (const v of violations) console.error(`  - ${v}`);
console.error("Fix the spec Status / acceptance criteria, then re-commit. (CLAUDE.md › Governance)");
process.exit(2); // exit 2 = block the tool call and show stderr to the agent
