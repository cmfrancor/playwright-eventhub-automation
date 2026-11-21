# Teaching Artifact — the explainer we publish with each automation

Every time we create or meaningfully change automated tests, we also publish a **teaching Artifact**: a
plain-language page that explains *what we did and why*, so the QA grows the senior judgment to review AI
output — not just accept it. This is a first-class deliverable, not an afterthought.

> Build it as an HTML Artifact (see the `artifact-design` skill first). Private by default. Keep a stable
> title per feature (e.g. "EventHub automation — Purchase flow") and redeploy the same file to update it.

## Audience & tone
- Written for **a QA who is learning automation** — simple language, no unexplained jargon. When a term is
  unavoidable (locator, fixture, auto-wait), define it in one line the first time.
- Explain the **why**, not just the what. The reader should finish able to *review* similar code.

## Required sections

1. **What we automated** — the flow/scenario in one short paragraph, user-story style.
2. **What each part of the code does** — walk the test and the page object in reading order, a sentence or
   two per block (setup/fixtures → the `When` action → the assertions). Link to `file:line`.
3. **Locator decisions** *(the part the user asked for explicitly)* — a small table: for each non-trivial
   locator, **what we picked**, **what we rejected**, and **why ours is the most robust** here. Reference
   `locator-strategy.md`. This is where the reader learns to spot a fragile locator.
4. **Why it's senior** — map the choices to the patterns: reuse (what we reused instead of duplicating),
   isolation, web-first waiting, session via `storageState`, API-first data. Name the anti-pattern each
   choice avoids (ties to `review-checklist.md`).
5. **What we reused vs created** — explicit: reused `randomHelper.randomEmail`, extended `EventPage`, etc.
   If we created something new, why we couldn't reuse.
6. **How to run it** — the exact commands (`--grep @Smoke`, the project, `--ui` to watch).
7. **What to verify yourself (QA checklist)** — the relevant rows of `review-checklist.md` as checkboxes, so
   the reader practices the verification on this very example.
8. **Open questions / limitations** — e.g. "no seed API on EventHub, so data is UI-created"; anything we'd
   ask a developer for (a missing `data-testid`).

## Readable without opening the code

The reader must understand every decision **from the Artifact alone**:
- **Show the real HTML** each locator targets (a trimmed snippet from the live DOM), marking the **anchor**
  (what we find first) and the **target** (what we assert).
- **Explain non-obvious syntax in plain words** the first time it appears: `.locator('..')` = "go up to the
  parent element" (it is not an ellipsis), `{ exact: true }`, regexes, scoping chains.
- **Define every name** you use as shorthand (e.g. `confirmation` = the confirmation block, and its real
  property name in the code).
- For chained locators, give a **step-by-step** reading ("find the label → go up to its row → assert the value").
- Avoid wide tables that hide columns behind horizontal scroll; prefer one card per locator.

## Traceable to the code

Every explanation must lead the reader to the exact code it describes:
- **Start with a change map**: file → method/property → line range, each a link.
- **Link every change** with a `file:line · method` chip pointing to a GitHub **permalink pinned to the PR
  commit SHA** (`/blob/<sha>/path#L10-L12`), so line numbers don't drift when the branch moves.
- **Snippets use the real names from the code** (`this.eventConfirmationTicketsNumber`), never invented
  shorthands like `ticketsRow`. If a shorthand helps, define it and give the real name next to it.
- **Label every "before"**: is it what was on `main`, or an intermediate draft the reviewer caught? Say which.
- Close the change map with a link to the PR's "Files changed" tab.
- **The "what to verify" checklist follows the same rule**: each item names its checklist group in words
  (not `§1`), spells out the anti-pattern code with its meaning ("Alto5 · locators tied to layout/position"),
  and links to the exact lines where the reviewer can check it. Persist the checkbox state per viewer.

## Style
- Short paragraphs, one idea per line. Tables for locator decisions and the checklist.
- Show the actual locator strings and say, in words, what would break the rejected ones.
- Theme-aware, self-contained (the `artifact-design` and Artifact rules).

## Definition of done
The Artifact is part of "done" for an automation: the code passes the `review-checklist`, and this explainer
ships alongside it so the QA can learn *and* verify.
