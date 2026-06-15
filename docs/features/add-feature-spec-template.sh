#!/usr/bin/env bash
# add-feature-spec-template.sh
# Run this from inside your runoil repo:  bash add-feature-spec-template.sh
# It creates a branch, adds the feature-spec template, and commits it.
# It does NOT push — that step is yours (it authenticates as you).
set -euo pipefail

echo "→ Switching to main and getting the latest…"
git checkout main
git pull --ff-only || echo "  (skipped pull — no upstream yet, that's fine)"

BRANCH="docs/feature-spec-template"
echo "→ Creating branch: $BRANCH"
git checkout -b "$BRANCH"

echo "→ Writing docs/features/feature-spec-template.md"
mkdir -p docs/features
cat > docs/features/feature-spec-template.md <<'EOF'
# Feature: <name>

- **Status:** Proposed · In progress · Shipped
- **Branch:** `feat/<short-name>`
- **Owner:** <you>
- **Date:** YYYY-MM-DD

## Why
The problem this solves and who feels it. One short paragraph — lead with the pain, not the solution.

## What
The change in one or two sentences.

## Scope
- **In scope:** …
- **Out of scope:** …

## Affected layer(s)
Tick what this touches: Capture (the Guide) · Synthesize · Govern & publish · Configuration plane · Partner platform · Billing/metering

## Data model impact
New or changed Atomic Truth types or fields? Corpus/schema changes? Migration needed?

## How it works
Brief design — the approach, key decisions, and anything intentionally deferred.

## Acceptance criteria
- [ ] …
- [ ] …

## Open questions
- …
EOF

echo "→ Committing"
git add docs/features/feature-spec-template.md
git commit -m "docs(features): add feature spec template"

cat <<'NEXT'

✓ Done — the change is committed on branch docs/feature-spec-template.

Next, push it and open a pull request (this part runs as you):
  git push -u origin docs/feature-spec-template
  # then open the PR on GitHub, or:
  gh pr create --base main --fill

After it's merged, clean up:
  git checkout main && git pull
  git branch -d docs/feature-spec-template
NEXT
