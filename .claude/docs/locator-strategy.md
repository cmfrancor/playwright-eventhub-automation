# Locator Strategy — picking locators that don't go flaky

A locator is a **recipe**, not an element (Playwright re-resolves it each time). A senior picks the recipe
that survives UI refactors and expresses **intent**, not DOM position. Every locator we write must be
**justifiable** — and in the teaching Artifact we say *why this one is the best choice here*.

## Hierarchy — most to least stable

1. **`getByRole(role, { name })`** — default. Stable, and it doubles as an accessibility check. Use the
   accessible name the user actually perceives.
2. **`getByTestId('…')`** — when there is a `data-testid` (built for tests, doesn't move with styles).
   EventHub exposes several (`event-card`, `user-email-display`, `customer-email`) — prefer these.
3. **`getByLabel` / `getByPlaceholder`** — for form fields with a visible label/placeholder.
4. **`getByText`** — for asserting copy the user reads. Fragile as a *selector* (breaks with i18n/copy
   changes); fine for assertions on literal text.
5. **`id`** — acceptable if not dynamically generated.
6. **CSS class** — avoid; changes with any style refactor.
7. **XPath, absolute paths, `div h1`, `:nth`** — **last resort, needs an explicit justification.** They
   describe a *position* in the DOM, not an intention; any layout change breaks them even though the
   logical element is unchanged.

## Hard rules

- **No `.nth(n)` / `.first()` / `.last()` to disambiguate a non-deterministic match.** If a locator matches
  many elements, make the locator specific (scope it to a card, add the role + name), don't index into the
  list. Indexing is allowed only when the *position itself is the thing under test* (e.g. "the first result"),
  and then it's commented as such.
  - Repo examples to fix (`pages/EventPage.js`, **not exhaustive — grep the file**): `getByText('$').nth(1)`,
    `locator('div h1')`, `locator('span.booking-ref')`, `span:has-text(...) + span`, and bare
    `getByText('View My Bookings')` used as a selector — all position/style-based, will break on any layout
    change. Replace with card-scoped role/testid locators.
- **No XPath** unless there is genuinely no other hook — and then leave a comment explaining why and a TODO
  to ask dev for a `data-testid`.
- **Scope, don't globalize.** Find the container first (`getByTestId('event-card')`), then the element
  inside it (`card.getByRole('heading')`). This is both stable and readable.
- **Respect strictness.** Playwright throws if a locator resolves to multiple elements for an action. That
  error is a feature — fix the locator, don't silence it with an index.
- **Never `force: true`** to get past actionability (anti-pattern Medio9). If an element isn't clickable,
  find out why (covered, disabled, animating); forcing hides a real bug.

## Discovering locators

When the right locator isn't obvious, discover it against the running app before guessing:
`npx playwright codegen <url>` or the Playwright MCP (`browser_navigate` + `browser_snapshot`), or the
**Pick locator** tool in the Inspector. Prefer what the snapshot shows as role/name/testid.

## Justification (goes in the teaching Artifact)

For each non-trivial locator, record one line: *what we picked, what we rejected, why.* Example:

> `card.getByRole('heading', { level: 3 })` — scoped to the chosen event card, matches the title the user
> sees. Rejected `locator('div h1')` (position-based, breaks on layout change) and `getByText(name)`
> (name is dynamic per run, would couple the locator to data).
