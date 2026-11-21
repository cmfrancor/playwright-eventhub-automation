---
name: scaffold-page
description: |
  Create a new Page Object — or extend an existing one — with firm, justified locators and no duplication.
  Fire on "scaffold a page object", "add a page object for", "create the X page". Prefers extending what
  exists over creating new.
args: "{screen/page name or URL}"
---

# /scaffold-page

Produce a Page Object that follows `automation-conventions.md` and `locator-strategy.md`.

## Steps

### 0. Reuse scan (always first)
Search `pages/` for an existing page object for this screen or a shared component. **If one exists, extend
it — do not create a second.** Check for a shared `HeaderComponent`-style piece before copying selectors.

### 1. Discover locators against the app
Use `codegen` / Playwright MCP (`browser_navigate` + `browser_snapshot`) / Inspector Pick locator. Prefer
role/testid/label. Scope to containers.

### 2. Draft (delegated to `automation-engineer`)
Follow `automation-conventions.md` (POM: `page` once in the constructor, business-named actions, assertions
in the test, page object **preferably** delivered as a fixture via `tests/fixtures/`) and
`locator-strategy.md` (firm, scoped locators, **each justified** — what picked / rejected / why). Don't
restate the rules here — the docs own them.

### 3. Review → user checkpoint
`automation-reviewer` runs the checklist (reuse + locators + POM groups) → fixes by the same author → PASS →
user validates and approves.

### 4. Teaching Artifact (when locators are non-trivial)
Emit the explainer per `teaching-artifact.md`, focused on the **locator-decision table** and what each
property/action is for. Load `artifact-design` first.

## Report
Page object path, reused-vs-created, fixture wiring, reviewer verdict, Artifact URL (if produced).
