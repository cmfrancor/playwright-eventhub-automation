---
name: audit-repo
description: |
  Audit the Playwright repo against the automation conventions and the review-checklist. Produces a
  prioritized findings list (anti-pattern → senior pattern → file:line). Fire on "audit the repo",
  "review the automation", "what's wrong with my tests", or before the first improvement PR.
args: "[optional: a folder or glob to scope, e.g. pages/ or tests/logged-in]"
---

# /audit-repo

Read-only architectural audit. The output is the map for the first improvement PR — it does **not** change
code.

## Steps

### 1. Scan the repo
Read `playwright.config.js`, `pages/`, `tests/` (incl. `tests/fixtures.js`), `api/`, `helpers/`. Note the
layers that exist and how session/data are handled today.

### 2. Run the checklist across the code
Go through every group of `.claude/docs/review-checklist.md` against the real files. Grep for the usual
anti-patterns: `\.nth\(`/`\.first\(`/`\.last\(` (**not** a finding where position is the thing under test
and it's commented — `locator-strategy.md`), `waitForTimeout` and `new Promise(... setTimeout ...)`,
`test\.only`/`page\.pause`, XPath (`//`), CSS class/sibling selectors, bare `getByText(...)` as a selector,
manual read-then-compare assertions, `slowMo` in `playwright.config.js`, page objects `new`-ed in
`beforeEach`, UI login inside tests, duplicated selectors/methods across page objects.

### 3. Classify each finding
`blocker` / `should-fix` / `nit`. For each: **anti-pattern → senior pattern → `file:line`**, in plain
language (this is also teaching material).

### 4. Reuse & duplication pass
Explicitly look for duplication: the same selector or near-identical method in two page objects, data
generation inlined instead of using `helpers/randomHelper.js`, session not reusing `storageState`.

### 5. Report (ranked)
A prioritized table the user validates. Group by severity. End with a suggested **batching for the first
PR** (which fixes go together). Do not start fixing — that's the next skill, with the user's go-ahead.

## Delegation
For a deep pass, delegate the read to `automation-reviewer` (read-only) and synthesize its findings. Keep
the final ranking and the PR batching in the main session (judgment stays with the orchestrator + user).
