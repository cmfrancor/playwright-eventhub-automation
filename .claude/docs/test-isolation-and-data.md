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

- **Log in once per worker, via the API**: the worker-scoped `account` fixture (`tests/fixtures.js`)
  registers a fresh user through the API, and the `authenticated` option (set by the logged-in project in
  `playwright.config.js`) injects its token as `storageState` (localStorage `eventhub_token`). Logged-in
  tests start already authenticated; no `setup` project, no fixed account in `.env`.
- **Never log in through the UI inside a test** (anti-pattern Alto7): slow, and a form change fails the
  whole suite. The login form is tested **once** (`tests/unlogged-in/login.spec.js`); everyone else enters
  with the injected session.
- **`storageState` and credentials never touch git** (anti-pattern Bajo15). `playwright/.auth/` and `.env`
  are already gitignored — keep it that way; real passwords live in env vars. (The per-worker user's
  password in `tests/fixtures.js` is a throwaway for an account created that run — not a secret.)

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
- **EventHub has an API, and the data layer is implemented** — Swagger at
  `https://api.eventhub.rahulshettyacademy.com/api/docs/` (every call needs `Authorization: Bearer <token>`,
  even where the spec doesn't mark it). `api/EventHubApi.js` is the thin client; `tests/fixtures.js` exposes
  `api` (bound to the worker's token) and `event` (the test's own event, created via API and **always
  deleted in teardown**, which also deletes its bookings). Each user's created data is sandboxed, but the 3
  featured events are **shared by every user of the practice app** (their seats move with other people's
  activity) — never book them in a test; seed your own.
- **E2E journey tests navigate through the UI like a user** (home → card → event → My Bookings); deep links
  (`goto(id)`) are for focused tests whose subject isn't navigation (e.g. booking-form validations).
- **API prepares state and verifies only what the UI can't show; what the user sees is asserted in the UI**
  (e.g. the booking appears in My Bookings with its title, tickets and status). The API check reads the
  record by the id the UI displayed (the booking ref) and asserts the stored fields the UI doesn't expose,
  with `toMatchObject`.

## Mocking (`page.route`) — sparingly, honor the contract

- Good uses: force hard-to-trigger backend errors (500/timeout), drive empty/zero-result UI states, isolate
  from a paid/unstable third party (anti-pattern Medio11).
- **A mock must respect the real contract** (anti-pattern Medio10): same shape/status the backend really
  returns. A mock that lies lets the suite stay green while the real contract broke.
- **Don't over-mock**: if you mock everything, you stop testing the real integration. Mocking is for
  specific hard cases, not a replacement for real coverage.
