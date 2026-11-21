#!/usr/bin/env bash
# PreToolUse hook: WARN (does not block) when a fragile locator is written into a spec
# or page object — XPath, bare getByText('$'), position-based locator('div h1'), or
# .nth()/.first()/.last() used to disambiguate (guide anti-pattern "Alto5"). The real
# gate is automation-reviewer + /review-automation; this is a mechanical nudge.
# Always exits 0 (never blocks). Degrades gracefully if python3 is unavailable.
set -u
command -v python3 >/dev/null 2>&1 || exit 0
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
if not re.search(r"/(tests|pages)/", path) or not path.endswith((".js", ".ts", ".mjs", ".cjs")):
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
    (r"\.nth\s*\(", ".nth() index"),
    (r"\.first\s*\(", ".first()"),
    (r"\.last\s*\(", ".last()"),
    (r"getByText\(\s*[\x27\x22]\$", "bare getByText(\x27$\x27)"),
    (r"locator\(\s*[\x27\x22][^\x27\x22]*\b(div|span)\b\s+\w", "position-based CSS (e.g. \x27div h1\x27)"),
]
found = sorted({label for pat, label in checks if re.search(pat, blob, re.I)})
if found:
    sys.stderr.write(
        "[warning] Possible fragile locator(s) in " + path + ": " + ", ".join(found) + "\n"
        "Anti-pattern (Alto5): these describe DOM position/structure, not intent, and break on any\n"
        "layout change. Prefer getByRole/getByTestId scoped to a container; justify the choice.\n"
        "If position itself is under test, add a comment saying so. See locator-strategy.md.\n"
        "(Not blocking — automation-reviewer / /review-automation will verify.)\n")
sys.exit(0)
'
