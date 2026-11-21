#!/usr/bin/env bash
# PreToolUse hook: WARN (does not block) when a fragile locator is written into a spec
# or page object — XPath, position-based CSS (`div h1`), CSS class or child/sibling
# combinators, or bare getByText('$') used as a selector (anti-pattern Alto5).
# NOTE: .nth()/.first()/.last() are intentionally NOT flagged here — they are legitimate
# when position is the thing under test, and the hook can't see that intent. The reviewer
# (review-checklist §1 + automation-reviewer) judges those in context.
# Known gap: a combinator hidden behind nested quotes (`:has-text("x") + span`) can slip
# past the regex; the reviewer covers that case.
# Always exits 0 (never blocks).
set -u
if ! command -v python3 >/dev/null 2>&1; then
  echo "[hook] warn-fragile-locators: python3 not found — fragile-locator warning is OFF." >&2
  exit 0
fi
payload=$(cat 2>/dev/null || true)
[ -z "$payload" ] && exit 0

printf '%s' "$payload" | python3 -c '
import sys, json, re
try:
    p = json.load(sys.stdin)
except Exception:
    sys.exit(0)
ti = p.get("tool_input", {}) or {}
path = ti.get("file_path", "") or ""
if not re.search(r"/(tests|pages|api|helpers)/", path) or not path.endswith((".js", ".ts", ".mjs", ".cjs")):
    sys.exit(0)

parts = []
if isinstance(ti.get("content"), str): parts.append(ti["content"])
if isinstance(ti.get("new_string"), str): parts.append(ti["new_string"])
for e in (ti.get("edits") or []):
    if isinstance(e, dict) and isinstance(e.get("new_string"), str):
        parts.append(e["new_string"])
blob = "\n".join(parts)

checks = [
    (r"xpath\s*=|locator\(\s*[\x27\x22]\s*//", "XPath locator"),
    (r"getByText\(\s*[\x27\x22]\$", "bare getByText(\x27$\x27) as a selector"),
    (r"locator\(\s*[\x27\x22][^\x27\x22]*\b(?:div|span)\b\s+\w", "position-based CSS (e.g. \x27div h1\x27)"),
    (r"locator\(\s*[\x27\x22][^\x27\x22]*\.[A-Za-z][\w-]*", "CSS class selector (e.g. \x27span.booking-ref\x27)"),
    (r"locator\(\s*[\x27\x22][^\x27\x22]*[>+~]", "CSS child/sibling combinator (e.g. \x27span + span\x27)"),
]
found = sorted({label for pat, label in checks if re.search(pat, blob, re.I)})
if found:
    sys.stderr.write(
        "[warning] Possible fragile locator(s) in " + path + ": " + ", ".join(found) + "\n"
        "Anti-pattern (Alto5): these describe DOM position/structure, not intent, and break on any\n"
        "layout change. Prefer getByRole/getByTestId scoped to a container; justify the choice.\n"
        "See locator-strategy.md. (Not blocking — automation-reviewer / /review-automation verifies.)\n")
sys.exit(0)
'
