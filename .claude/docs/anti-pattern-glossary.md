# Anti-pattern glossary — "Errores vs. senior"

The codes the `review-checklist` and the reviewer use (`Alto` = high, `Medio` = medium, `Bajo` = low
impact). Each line is the junior mistake → the senior pattern. This is the vocabulary you're learning to
apply when you verify AI output.

## Alto (high impact)
- **Alto1 — Missing `await`.** An un-awaited action/assertion. Senior: await every action and every
  `expect`. Symptom: "Target page/context/browser has been closed", or passes local / fails CI.
- **Alto2 — Manual assertions instead of web-first.** Reading a value into a variable and comparing it.
  Senior: `await expect(locator).toHaveText(...)` — it retries; a manual snapshot doesn't.
- **Alto3 — `waitForTimeout` as a wait.** A fixed sleep bets on a number. Senior: wait for an observable
  condition (an assertion, a response).
- **Alto4 — Awaiting the response after the action.** Racing the network. Senior: set up
  `waitForResponse`/`route` **before** the action that triggers it.
- **Alto5 — Design-coupled locators / `.first()`.** Position/style-based selectors (XPath, `div h1`,
  indexing). Senior: `getByRole`/`getByTestId` scoped to a container; justify the choice.
- **Alto6 — Tests that depend on a previous one.** Shared order/data/session. Senior: each test sets its
  own `Given`; independence unlocks parallelism.
- **Alto7 — UI login in every test.** Slow and fragile. Senior: build the session without the UI (here: a
  worker fixture registers a user via API and injects its token via `storageState`) so tests start
  authenticated; test the login form once, in its own test.

## Medio (medium impact)
- **Medio8 — Data shared between workers.** A fixed record two parallel tests touch. Senior: unique data
  per run (`helpers/randomHelper.js`).
- **Medio9 — `force: true` to silence actionability.** Hides a real bug (covered/disabled/animating).
  Senior: find out why the element isn't actionable.
- **Medio10 — A mock that doesn't honor the contract.** Green while the real contract broke. Senior: mock
  the real shape/status; don't over-mock.
- **Medio11 — Depending on third parties you don't control.** Flaky/paid externals. Senior: isolate with a
  contract-honoring mock for that boundary.
- **Medio12 — Page objects that receive `page` every method.** Senior: `page` once in the constructor;
  better, deliver the page object as a fixture.

## Bajo (low impact)
- **Bajo13 — `test.only` / `page.pause()` left in the repo.** `forbidOnly` fails CI; pause halts an
  unattended run. Senior: remove before it lands (a hook blocks these).
- **Bajo14 — `trace: 'on'` in CI.** Expensive. Senior: `trace: 'on-first-retry'`.
- **Bajo15 — Credentials / `storageState` in git.** Session cookies and passwords leak. Senior:
  `storageState` under gitignored `playwright/.auth/`, secrets in env vars.

> Source: distilled from the "Ruta Playwright" study guide ("03 Errores vs. senior") and the senior
> automation Q&A bank. We refine these as we practice.
