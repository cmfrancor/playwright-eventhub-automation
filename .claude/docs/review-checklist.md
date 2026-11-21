# Review Checklist — what the QA verifies in AI output

This is the heart of the system. It's what **you (the human) check** before approving any automation, and
what the `automation-reviewer` agent runs adversarially first. Each item maps to a named anti-pattern code
(Alto/Medio/Bajo) defined in `.claude/docs/anti-pattern-glossary.md`, so you learn the senior pattern, not
just a pass/fail.

How to use it: for every generated/changed test or page object, go group by group. An item is ✅ only if
you can point at the line that satisfies it. Anything ❌ goes back to the author before merge.

---

## 0. Reuse & scalability  *(checked FIRST)*
- [ ] **Scanned for existing code before writing.** No new page object/helper/fixture duplicates one that
      already exists (`pages/`, `helpers/`, fixtures).
- [ ] **No duplicated logic.** A near-identical method/selector wasn't copy-pasted — it was reused or
      generalized into one place.
- [ ] If something new was created, the output **says so and why** (couldn't reuse X because …).

## 1. Locators & actionability  *(Alto5, Medio9)*
- [ ] Uses `getByRole` / `getByTestId` (or label/placeholder) — not CSS class, not XPath, not `div h1`.
- [ ] **No `.nth()` / `.first()` / `.last()`** to disambiguate (allowed only when position *is* the thing
      under test, and commented).
- [ ] Locator is **scoped** to a container, not a global `getByText('$')`.
- [ ] **No `force: true`** to bypass actionability.
- [ ] Each non-trivial locator is **justified** (why this, not that) — see the teaching Artifact.

## 2. Waiting  *(Alto1–4)*
- [ ] **No missing `await`** on actions/assertions.
- [ ] Assertions are **web-first** (`await expect(locator)…`), not a manual read-then-compare.
- [ ] **No `page.waitForTimeout(<number>)`** / fixed sleeps.
- [ ] Any `waitForResponse`/`route` is set up **before** the action that triggers it.

## 3. Isolation & data  *(Alto6, Medio8)*
- [ ] Test is **independent** — sets its own `Given`, doesn't rely on another test or on order.
- [ ] Data is **unique per run** (reuses `helpers/randomHelper.js`), not a shared fixed record.
- [ ] State is seeded by **API** where possible (hybrid API+UI); UI drives only what's under test.
      *(EventHub: note if no seed API exists and the UI fallback is intentional.)*
- [ ] Teardown/cleanup **runs always** (even on failure) when a record was created.

## 4. Session  *(Alto7, Bajo15)*
- [ ] Logged-in flows reuse the `setup` project + `storageState` — **no UI login inside the test**.
- [ ] `storageState` / credentials stay **out of git** and out of the code (env vars).

## 5. Architecture / POM  *(Medio12)*
- [ ] `page` is received **once in the constructor**; methods don't take `page` each call.
- [ ] Page object is delivered as a **fixture** (preferred) rather than `new`-ed in every `beforeEach`.
- [ ] **Business assertions in the test**; only "page reached usable state" assertions may sit in the PO,
      and it's consistent with the rest of the repo.
- [ ] Actions are named by **business intent**; locators are readable properties.

## 6. Repo hygiene  *(Bajo13–14)*
- [ ] **No `test.only` / `describe.only` / `page.pause()`** left behind (a hook blocks these; CI
      `forbidOnly` would fail anyway).
- [ ] Trace config is `on-first-retry` (not `'on'`) for CI cost.
- [ ] No global `slowMo` left on for CI in `playwright.config.js` (it's a fixed per-action delay — debug
      only; relates to Alto3).
- [ ] Spec file ends cleanly (newline), imports used, no dead code.

## 7. Tags & execution
- [ ] Test title carries tags for `--grep` (`@Smoke`, `@TICKET-NN`, section) so suites can be sliced.
- [ ] Smoke vs regression split is respected (smoke = fast, must-pass).

## 8. Mocking  *(Medio10–11 — only when the test uses `page.route`)*
- [ ] Mocks honor the real contract (same shape/status the backend returns).
- [ ] No over-mocking — real integration is still covered; mocks only for hard-to-trigger cases / third parties.
- [ ] **N/A** if the test uses no mocks (say so, so coverage is explicit).

---

### Verdict
- **PASS** — every applicable item ✅ (note any N/A with a reason).
- **CHANGES** — list each ❌ as *anti-pattern → senior pattern → file:line*, so the fix is unambiguous.

The author never self-certifies: the reviewer agent returns the verdict, then **you** make the final call.
