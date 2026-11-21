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
   the merge condition.** (Reused from the qa-agentico publish checkpoint.)
4. **Teach every change.** Created/changed automation ships a plain-language **teaching Artifact**
   (`.claude/docs/teaching-artifact.md`): what each part does and *why this locator is the best choice*.
5. **Guardrails are hooks, not vibes** (`.claude/hooks/`): no `test.only`/`page.pause`, no fixed
   `waitForTimeout`, fragile-locator warnings — enforced mechanically on Write/Edit.
6. **Locators express intent, not DOM position** (`locator-strategy.md`). Tests are **independent**, data
   is **unique and API-seeded where possible**, session comes from **storageState** (`test-isolation-and-data.md`).

## Source of truth (docs — do not re-encode rules elsewhere)

- `.claude/docs/automation-conventions.md` — layers, POM, reuse-first, naming, definition of done.
- `.claude/docs/locator-strategy.md` — locator hierarchy, hard rules, justification.
- `.claude/docs/test-isolation-and-data.md` — isolation, waiting, session, API/hybrid data, mocking.
- `.claude/docs/review-checklist.md` — **what the QA verifies in AI output** (the central rubric).
- `.claude/docs/teaching-artifact.md` — the explainer standard.

## Agents & skills

- Agents: `.claude/agents/automation-engineer.md` (author), `.claude/agents/automation-reviewer.md` (reviewer).
- Skills: `.claude/skills/{audit-repo,automate-flow,scaffold-page,harden-locators,review-automation,open-pr}/SKILL.md`.

## This repo (context the system assumes)

- Layers: `pages/` (EventPage, HomePage, LoginPage, RegisterPage), `tests/` (`logged-in/`, `unlogged-in/`),
  `helpers/randomHelper.js` (`randomEmail`, `randomNumber`), `tests/auth.setup.js` (builds `storageState`).
- `playwright.config.js`: `setup` project + `storageState: playwright/.auth/user.json`; reporter `html`;
  trace `on-first-retry`. `.env`, `playwright/.auth/`, reports are gitignored.
- **Known anti-patterns to fix in the first PR** (found in the audit): fragile locators in
  `pages/EventPage.js` (`getByText('$').nth(1)`, `locator('div h1')`); page objects `new`-ed in
  `beforeEach` instead of delivered as fixtures; customer data from env only (no API seed); business
  assertions living inside the page object. The first improvement PR fixes these, explaining for each the
  anti-pattern and the senior pattern.

## Structure

```
.claude/
  agents/{automation-engineer,automation-reviewer}.md
  docs/{automation-conventions,locator-strategy,test-isolation-and-data,review-checklist,teaching-artifact}.md
  hooks/pre-tool-use/{block-focused-tests,block-fixed-sleeps,warn-fragile-locators}.sh
  skills/{audit-repo,automate-flow,scaffold-page,harden-locators,review-automation,open-pr}/SKILL.md
  settings.json
CLAUDE.md
```

## Guardrails to add later (optional, covers human-written code too)
ESLint `eslint-plugin-playwright` (`no-focused-test`, `no-page-pause`) — the PreToolUse hooks only cover
what the AI writes; ESLint + the existing `forbidOnly` in CI cover what a person writes.
