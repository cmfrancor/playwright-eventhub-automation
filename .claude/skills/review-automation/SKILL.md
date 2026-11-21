---
name: review-automation
description: |
  Run the review-checklist over the current working diff (or a given path) and report findings mapped to
  each checklist item — so the QA can validate AI-generated automation. Fire on "review my automation",
  "run the checklist", "check this test before I commit".
args: "[optional: a path/glob; defaults to the current git diff]"
---

# /review-automation

The explicit validation pass. Read-only. Maps every finding to a `review-checklist.md` item so the user
practices verifying AI output.

## Steps

### 1. Scope the diff
Default to the uncommitted changes (`git diff` + untracked specs/pages). If a path is given, scope to it.

### 2. Delegate to `automation-reviewer`
Spawn it with the diff and `review-checklist.md` as rubric. It returns a verdict (PASS / CHANGES) with each
finding as **anti-pattern → senior pattern → `file:line`**, severity-ranked, plus a reuse/duplication pass.

### 3. Present for the human to validate
Show the checklist group by group with ✅/❌ and the findings. For each ❌, state the senior pattern so the
fix is unambiguous. **Explicitly invite the user to confirm each call** — this is the learning loop: you
report, the user decides.

### 4. Fix (optional, on request)
If the user approves fixes, hand them to `automation-engineer` and re-review until PASS.

## Report
Verdict, the resolved checklist, and (if fixes applied) before/after per finding.
