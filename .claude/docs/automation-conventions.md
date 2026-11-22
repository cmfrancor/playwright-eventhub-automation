# Automation Conventions — Playwright (EventHub)

How this repo is structured and the rules a **senior QA Automation engineer** follows. These conventions
are the **source of truth**; skills and agents read them, they don't re-encode them. If code and this doc
disagree, this doc wins (or we update it on purpose).

> Companion docs: `locator-strategy.md`, `test-isolation-and-data.md`, `review-checklist.md` (what the
> human verifies), `anti-pattern-glossary.md` (the Alto/Medio/Bajo codes), `teaching-artifact.md` (the
> explainer we publish with each automation).

## Reuse first — the non-negotiable rule

**Before writing any new code, scan for what already exists and reuse it. Never duplicate.** This is what
makes the suite scale. Every skill starts with a **Reuse scan** (Step 0):

- **Page objects** (`pages/`) — is there already a page object (or a method) for this screen/flow?
  Extend it; don't make a second one. Method you need almost-exists? Generalize it, keep one.
- **Session/auth** — logged-in flows reuse the per-worker API `account` + `authenticated` option in
  `tests/fixtures.js` (token injected as `storageState`). Never re-login through the UI inside a
  test (see `test-isolation-and-data.md`).
- **Data generation** — unique values come from `helpers/randomHelper.js` (`randomEmail()`, `randomNumber()`).
  Need another generator? Add it there; don't inline `Date.now()` in a spec.
- **Fixtures** — shared setup (a page object instance, a logged-in page, pre-seeded data) is a fixture, not
  copy-pasted `beforeEach`.

If you cannot reuse and must create, say so explicitly and say why (at the checkpoint and in the teaching
Artifact). "I didn't find X so I added it to `helpers/`" is a good line; silently duplicating is a defect.

## Layers

| Layer | Folder | Holds |
|---|---|---|
| Specs | `tests/` (`logged-in/`, `unlogged-in/`) | The tests: Given/When/Then intent + **business assertions**. |
| Page objects | `pages/` | Selectors (locators) + **actions** for one screen. One class per real page/component. |
| Fixtures | `tests/fixtures.js` | `test.extend` — page objects, the per-worker API `account`, session (`authenticated` → `storageState`), `api`, seeded data (`event`). Specs import `{ test, expect }` from here, not from `@playwright/test`. Declare the fixture types with JSDoc so `// @ts-check` sees them. Split into a folder only when it outgrows one file. |
| API clients | `api/` (`EventHubApi.js`) | Thin request helpers for seeding/teardown/backend checks via API. No assertions. |
| Helpers | `helpers/` | Pure utilities: data generators, formatting. No page/DOM logic. |
| Config | `playwright.config.js` | Projects (`authenticated: true` for logged-in), reporter, trace. |

When the UI changes you fix **one** place (the page object), not 30 specs. That is the whole point of the
layering — protect it.

## Page Object Model

- **`page` is received once, in the constructor**, and locators are stored as properties. A method must
  **not** take `page` as a parameter every call (anti-pattern Medio12). Better still, deliver the page
  object as a **fixture** so the test asks for it ready-made instead of `new`-ing it in every `beforeEach`.
- **Locators as readable properties** in the constructor (`this.confirmBookingButton = ...`). Follow
  `locator-strategy.md` for which locator to pick.
- **Actions live in the page object**, named by business intent: `purchaseEvent(...)`,
  `login(...)` — the test reads like a user story, not a selector soup. Journey tests reach a screen the way
  a user does (`homePage.openEvent(title)`); `goto(id)` deep links are for focused tests whose subject isn't
  navigation (see `test-isolation-and-data.md`).
- **Business assertions live in the test**, so a failure report points at the test, not at a helper reused
  in ten places. The grey zone: an assertion that only means *"the page reached a usable state"* — a
  `waitForLoaded()` checking URL + a landmark — may live in the page object as part of "arriving at the page".
  It must **not** check data the test cares about (e.g. the logged-in user's email after registering is the
  test's *outcome*, so it belongs in the test). Name it `waitForLoaded`, not `is…Visible`, so it doesn't read
  like a boolean that hides an assertion.
- **One class per real page/component.** A page object that mixes two screens, or grows business logic
  (price math), is the anti-pattern — split by real page, or extract a shared component
  (`HeaderComponent`) that each page object composes instead of copying its selectors.

## Comments

Comment only the **compromises and exceptions** a reader might "fix" by mistake: a locator that isn't the
ideal one (e.g. a CSS class with a TODO to ask dev for a `data-testid`), a structural hop like
`.locator('..')`, or a legitimate `.nth()` where position is what's under test. Don't narrate obvious
locators — the per-locator justification lives in the teaching Artifact, not in the code.

## Naming

- Page object class: `PascalCase` + `Page`/`Component` (`EventPage`, `HeaderComponent`).
- Locator property: what it **is**, business-first (`confirmBookingButton`, `eventPriceLabel`), not
  `btn2`/`div3`.
- Action method: verb + intent (`purchaseEvent`, `openEvent`). Query method: `is…Visible` / `get…`.
- Spec file: `{feature}.spec.js`; test title carries tags for `--grep` (see `review-checklist.md` → Tags).

## Definition of "done" for an automation

Not "it compiled and went green once." Done = passes the **review checklist**, reuses what existed, and
ships with its **teaching Artifact**. The human validates before we call it done.
