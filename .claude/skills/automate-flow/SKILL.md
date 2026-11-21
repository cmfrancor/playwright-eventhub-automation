---
name: automate-flow
description: |
  Turn a scenario/user flow into an executable Playwright E2E test using the repo's POM, fixtures and
  data strategy — reusing what exists, never duplicating. Author → reviewer → user approves, then publish
  the teaching Artifact. Fire on "automate this flow", "write a test for", "automate the purchase flow".
args: "{a scenario description, a Gherkin block, or a ticket/flow name}"
---

# /automate-flow

Convert one flow into a senior-grade test. The orchestrator runs the loop; drafting is delegated.

## Steps

### 0. Reuse scan (always first)
Before anything: search `pages/`, `helpers/`, fixtures, `storageState` for what already covers parts of
this flow. Decide what you **reuse/extend**. Only create new code where nothing fits — and say why.

### 1. Understand the flow
Restate it as Given/When/Then (one behaviour, one `When`). Identify preconditions that should be set by
**API/storageState** (state) vs what the **UI** actually validates (experience). Order: API first, UI after.

### 2. Draft (delegated to `automation-engineer`)
Don't draft inline. Spawn `automation-engineer` with: the flow, the reuse-scan result, and the instruction
to read this skill + the docs and produce the test + any page-object/fixture changes, following
`locator-strategy.md` and `test-isolation-and-data.md`, then self-check against `review-checklist.md`.
**Keep the agent's id** — revisions go back to the same author via SendMessage.

Requirements for the draft (the rules live in the docs — follow them, don't restate them):
- POM + fixtures → `automation-conventions.md` (`page` once in the constructor; page object **preferably**
  delivered as a fixture; business assertions in the test).
- Locators → `locator-strategy.md` (scoped, role/testid, **each justified**).
- Waiting, isolation, session, data → `test-isolation-and-data.md` (web-first assertions, no fixed sleeps,
  `waitForResponse` before the action, unique data via `helpers/randomHelper.js`, session via `storageState`).
- Tags in the title for `--grep`; the reviewer checks everything against `review-checklist.md`.

### 3. Adversarial review (delegated to `automation-reviewer`)
Spawn `automation-reviewer` with the diff + the checklist as rubric. Hand every blocker/should-fix back to
the **same author**. Re-review after substantive changes until **PASS**. This runs **before** the user sees it.

### 4. User checkpoint (the final gate)
Present to the user: the test, what was **reused vs created**, the reviewer verdict (PASS + rounds), and the
checklist resolved. The user validates and approves — nothing is "done" without it.

### 5. Run it (optional, on request)
Run via `npx playwright test --grep ...` or the Playwright MCP; report passed/failed and fix with the author.

### 6. Teaching Artifact (required)
Produce the explainer per `.claude/docs/teaching-artifact.md` (what we did, what each part does, the
**locator-decision table**, why it's senior, reused-vs-created, how to run, what to verify). Load the
`artifact-design` skill first. Private by default; stable title per feature.

## Report
Final summary: test path, reused-vs-created, reviewer verdict, run result (if any), Artifact URL.
