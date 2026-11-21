# Test Isolation, Waiting & Data

Three things that make the difference between a suite you trust and a flaky one. A senior gets these right
by default.

## Isolation — every test stands alone

- **Each test runs in its own fresh browser context** (Playwright does this per test). Don't fight it.
- **A test never depends on another test** having run first — not for data, not for session, not for order
  (anti-pattern Alto6). If test B needs the end state of test A, test B sets that state in its **own**
  `Given` (via API or storageState), it does not rely on A.
- **Independence is what unlocks parallelism**, which is half the reason to use Playwright. A dependent test
  breaks `fullyParallel` and sharding.
- **Unique data per run** (anti-pattern Medio8 — data shared between workers): generate unique values with
  `helpers/randomHelper.js` (`randomEmail()`), never reuse a fixed shared record across parallel workers.

## Session — log in once, reuse it

- **Log in once per suite** via the `setup` project and `storageState`
  (`tests/auth.setup.js` → `playwright/.auth/user.json`), already wired in `playwright.config.js`. Logged-in
  tests start already authenticated.
- **Never log in through the UI inside a test** (anti-pattern Alto7): slow, and a form change fails the
  whole suite. The login form is tested **once**; everyone else enters with the saved session.
- **`storageState` and credentials never touch git** (anti-pattern Bajo15). `playwright/.auth/` and `.env`
  are already gitignored — keep it that way; passwords live in env vars.

## Waiting — trust auto-wait, assert web-first

- **Auto-waiting**: before an action Playwright waits for the element to be visible, stable, enabled and
  able to receive events. Let it. (Missing an `await` is the #1 error — Alto1 — and shows up as "Target
  page/context/browser has been closed" or "passes local, fails CI".)
- **Web-first assertions**: use `await expect(locator).toHaveText(...)` / `toBeVisible()` — they **retry**
  until true or timeout. Don't read a value into a variable and compare it manually (anti-pattern Alto2);
  that snapshot doesn't retry and goes flaky.
- **No fixed sleeps** (anti-pattern Alto3): `await page.waitForTimeout(3000)` is a bet on a number — wastes
  time when the app is fast, still fails when it's slow. A hook blocks it. The real fix is to wait for an
  observable condition (an assertion, a response).
- **Wait for the response *before* the action, not after** (anti-pattern Alto4):
  ```js
  const resp = page.waitForResponse('**/api/booking');  // set up first
  await confirmButton.click();                            // then act
  await resp;
  ```
  Setting the wait up after the click races the network and drops events.

## Test data — prefer the API

- **Seed via API whenever possible** (not through the UI you're not testing right now): faster, more
  stable, and it isolates blame — if the API seed fails, you know the problem isn't your UI test.
- **Hybrid API + UI** is the senior default for anything beyond the flow under test: prepare state by API
  (create the user, pre-load an event), then drive **only** the part you actually want to validate visually
  through the UI. Order is **API first (state), UI after (experience)**.
- **Teardown runs always** (even on failure): a cleanup hook that deletes the unique record by API, using
  the same unique id you generated at the start — not depending on the test outcome.
- **EventHub caveat**: it's a third-party practice app and may not expose a seed/cleanup API. Where there's
  no API, fall back to unique-data-by-UI + `storageState`, and mark it as a real limitation (not a
  shortcut). Teach the API pattern anyway so it transfers to a real product.

## Mocking (`page.route`) — sparingly, honor the contract

- Good uses: force hard-to-trigger backend errors (500/timeout), drive empty/zero-result UI states, isolate
  from a paid/unstable third party (anti-pattern Medio11).
- **A mock must respect the real contract** (anti-pattern Medio10): same shape/status the backend really
  returns. A mock that lies lets the suite stay green while the real contract broke.
- **Don't over-mock**: if you mock everything, you stop testing the real integration. Mocking is for
  specific hard cases, not a replacement for real coverage.
