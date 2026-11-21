---
name: harden-locators
description: |
  Find fragile locators across the repo and replace them with stable, justified ones, without changing test
  behaviour. Fire on "harden the locators", "fix the fragile selectors", "replace the nth/xpath locators".
args: "[optional: a file or glob, e.g. pages/EventPage.js]"
---

# /harden-locators

Replace position/style-based locators with role/testid-scoped ones. Behaviour stays identical; only the
locators get firmer.

## Steps

### 0. Reuse scan
Check whether a stable locator for the same element already exists in another page object — reuse the
pattern, keep one definition.

### 1. Find the offenders
Grep the target file(s) — don't work from a fixed list: `\.nth\(`, `\.first\(`, `\.last\(` (skip the
commented position-under-test cases, `locator-strategy.md`), XPath (`//`), bare `getByText('$')`,
`locator('div h1')`, CSS class/sibling selectors (`span.booking-ref`, `span:has-text(...) + span`),
`getByText(...)` used as a selector. List each with `file:line` and why it's fragile. (EventHub's
`pages/EventPage.js` has several — grep it, there are more than the two usually cited.)

### 2. Discover the firm replacement
Against the running app (codegen / MCP / Inspector), find the role/testid/scoped locator. Confirm it
resolves to exactly one element (respect strictness — no indexing to silence it).

### 3. Replace (delegated to `automation-engineer`) — one locator at a time
For each: show **before → after**, the justification (what rejected, why the new one is robust), and confirm
the affected test still passes. Don't batch blindly.

### 4. Review → user checkpoint
`automation-reviewer` confirms each replacement against `locator-strategy.md`; user approves.

### 5. Teaching note / Artifact
For a non-trivial batch, emit the locator-decision table per `teaching-artifact.md` so the user learns to
spot the pattern next time.

## Report
Table of before → after → why, files touched, tests re-run, reviewer verdict.
