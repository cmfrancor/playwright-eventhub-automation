# EventHub Automation — Agentic QA (automation track)

AI-assisted Playwright automation done the way a **senior QA Automation engineer** does it. The AI drafts,
runs and explains; **the human validates** and keeps the judgment. The goal is as much to produce good
tests as to grow the QA's eye for *what to verify in AI output*.

## Flow (per automation)

```
0. Reuse scan        Before anything: what in pages/ helpers/ fixtures/ storageState can we reuse? Never duplicate.
1. /audit-repo       Map the repo against the conventions + checklist (read-only). Used before the first PR.
2. /scaffold-page    Create/extend a Page Object with firm, justified locators.
3. /automate-flow    A flow -> E2E test (POM + fixtures + API/hybrid data). Author -> reviewer -> you approve.
4. /harden-locators  Replace fragile locators (nth/xpath/position) with stable, justified ones.
5. /review-automation Run the checklist over the diff; map every finding to a checklist item. You validate.
6. /open-pr          Merge gate: adversarial review round(s) polish the diff to PASS, hygiene gate, then
                     you approve before merge. Nothing merges without your go-ahead.
                     -> Each created/changed automation ships a teaching Artifact (the explainer).
```

## Operating principles

1. **Reuse first, never duplicate.** Every skill starts with a Reuse scan. A duplicated page object,
   helper, selector or session is a defect, not a shortcut. This is what makes the suite scale.
2. **The human is the final validator.** Nothing is "done" without your approval — not a merge, not a
   commit. The system exists to make your verification faster and sharper, not to replace it.
3. **Author ≠ reviewer.** Drafting is delegated to `automation-engineer` (strong model); adversarial
   verification to `automation-reviewer` (cheap, read-only). The author never self-certifies. Review runs
   **before** you see the result.
4. **Every PR passes the merge gate** (`/open-pr`): one or more adversarial review rounds polish the diff
   to PASS, then a human checkpoint. A reviewer PASS is necessary but not sufficient — **your approval is
   the merge condition.**
5. **Teach every change.** Created/changed automation ships a teaching Artifact built per
   `.claude/docs/teaching-artifact.md`: what each part does and *why this locator is the best choice*.
6. **Guardrails are hooks, not vibes** (`.claude/hooks/`): no `test.only`/`page.pause`, no fixed
   `waitForTimeout`, fragile-locator warnings — enforced mechanically on Write/Edit (and they print a notice
   if `python3` is missing, so you know when enforcement is off).
7. **The docs are the single source of truth.** The actual rules (locators, isolation, waiting, data, POM)
   live in `.claude/docs/` and are **referenced, not restated**, by agents and skills — so a rule changes in
   one place, never five.

## Source of truth (docs — do not re-encode rules elsewhere)

- `.claude/docs/automation-conventions.md` — layers, POM, reuse-first, naming, definition of done.
- `.claude/docs/locator-strategy.md` — locator hierarchy, hard rules, justification.
- `.claude/docs/test-isolation-and-data.md` — isolation, waiting, session, API/hybrid data, mocking.
- `.claude/docs/review-checklist.md` — **what the QA verifies in AI output** (the central rubric).
- `.claude/docs/anti-pattern-glossary.md` — the Alto/Medio/Bajo codes the checklist and reviewer cite.
- `.claude/docs/teaching-artifact.md` — the explainer standard.

## Agents & skills

- Agents: `.claude/agents/automation-engineer.md` (author), `.claude/agents/automation-reviewer.md` (reviewer).
- Skills: `.claude/skills/{audit-repo,automate-flow,scaffold-page,harden-locators,review-automation,open-pr}/SKILL.md`.

## This repo (context the system assumes)

- Layers: `pages/` (EventPage, HomePage, LoginPage, RegisterPage), `tests/` (`logged-in/`, `unlogged-in/`),
  `tests/fixtures.js` (page objects as fixtures — specs import `{ test, expect }` from here),
  `helpers/randomHelper.js` (`randomEmail`, `randomNumber`), `tests/auth.setup.js` (builds `storageState`).
- Page objects hold locators, actions, `goto()` and `waitForLoaded()` only; **every outcome assertion lives in
  the test**. Label/value rows are read through `EventPage.confirmationValue(label)` (one place owns the
  row-structure assumption).
- `playwright.config.js`: `setup` project + `storageState: playwright/.auth/user.json`; `baseURL` from
  `BASE_URL` (default EventHub); reporter `html`; trace `on-first-retry`; `slowMo` off by default
  (`SLOWMO=500` to watch a run). `.env`, `playwright/.auth/`, `.playwright-mcp/`, reports are gitignored.
- `npm test` runs the suite; `npm run typecheck` runs `tsc` over `// @ts-check` files (needs `npm install`).
- **Still open** (see the PR history): bookings consume real seats that nothing releases — the purchase test
  only picks events with seats left (interim); the real fix is Phase 3 (API seeding + teardown via the
  EventHub Swagger API). The `setup` depends on a fixed account in `.env` that the sandbox can expire. No
  test tags (`@Smoke`) yet; `randomEmail()` is shared across the registration tests.
- History: PR #7 hardened the locators; PR #8 moved to fixtures + assertions in tests. Each PR description
  links its teaching Artifact.

## Structure

```
.claude/
  agents/{automation-engineer,automation-reviewer}.md
  docs/{automation-conventions,locator-strategy,test-isolation-and-data,review-checklist,anti-pattern-glossary,teaching-artifact}.md
  hooks/pre-tool-use/{block-focused-tests,block-fixed-sleeps,warn-fragile-locators}.sh
  skills/{audit-repo,automate-flow,scaffold-page,harden-locators,review-automation,open-pr}/SKILL.md
  settings.json
CLAUDE.md
```

## Guardrails to add later (optional, covers human-written code too)
ESLint `eslint-plugin-playwright` (`no-focused-test`, `no-page-pause`) — the PreToolUse hooks only cover
what the AI writes; ESLint + the existing `forbidOnly` in CI cover what a person writes.
