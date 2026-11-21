---
name: open-pr
description: |
  Prepare a branch for merge: an adversarial review round that polishes the diff against the
  review-checklist until PASS, a pre-merge hygiene gate, then a HUMAN approval checkpoint — nothing merges
  without your go-ahead. Fire on "open a PR", "prepare the PR", "ready to merge", "review before merging".
args: "[optional: base branch, default main]"
---

# /open-pr — the merge gate

The last gate before anything lands. The author never self-certifies; a separate adversarial reviewer
polishes the diff, and **you** make the final call to merge.

## Steps

### 1. Collect the diff
`git diff {base}...HEAD` + untracked specs/pages. Summarize what changed (files, new tests, new/changed
page objects/fixtures/helpers) and restate **what was reused vs created** (scalability check).

### 2. Adversarial review round(s) — polish until PASS
Spawn `automation-reviewer` (read-only) with the full diff + `.claude/docs/review-checklist.md` as rubric.
It returns a verdict with each finding as **anti-pattern → senior pattern → `file:line`**, severity-ranked,
plus a duplication pass. Hand every `blocker`/`should-fix` back to the **same `automation-engineer`** (via
SendMessage — the orchestrator decides *what* changes, the author writes it). **Re-spawn the reviewer after
substantive changes until it returns PASS.** This is the polishing loop; it runs before you see the result.

### 3. Pre-merge hygiene gate
Confirm mechanically: suite (or at least `--grep @Smoke`) is green; no `test.only`/`page.pause`
(hooks + `forbidOnly`); no fixed sleeps; no `storageState`/secrets/`.env` staged; lint clean if ESLint is
present; branch is up to date with `{base}` (rebase if behind).

### 4. Human checkpoint — ASK before merging  (the gate)
Present ONE checkpoint:
- the diff summary + reused-vs-created,
- the **resolved review-checklist** (so you can verify, not just trust),
- the reviewer verdict (**PASS** + number of rounds),
- the test result,
- the proposed **PR title + body**,
- the linked **teaching Artifact** (if the change added/changed automation).

Then **wait for your explicit approval.** Nothing is pushed or merged before it.

### 5. On approval — open/merge
Per your choice: `gh pr create` (title/body, the PR-body footer), or merge. Follow the repo git rules
(branch off main if needed, co-author trailer on commits). Report the PR URL / merge result.

## Principle
The review loop catches what a tired author misses; the human checkpoint keeps the judgment with you. A PASS
from the reviewer is necessary but **not** sufficient — your approval is the merge condition.
