#!/usr/bin/env bash
# PreToolUse hook: refuse a fixed sleep (waitForTimeout with a numeric literal) in a
# spec or page-object file. Fixed sleeps are a bet on a number — slow when the app is
# fast, still flaky when it's slow (guide anti-pattern "Alto3"). Covers Write/Edit/MultiEdit.
# Degrades gracefully (exit 0) if python3 is unavailable.
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

# numeric literal only: waitForTimeout(3000). A computed/var timeout is not matched.
if re.search(r"waitForTimeout\s*\(\s*\d", blob):
    sys.stderr.write(
        "Refusing to write a fixed sleep into " + path + "\n"
        "Found: waitForTimeout(<number>)\n\n"
        "Anti-pattern (Alto3): a hard sleep wastes time when the app is fast and still fails when\n"
        "it is slow. It does not fix flakiness, it hides it.\n"
        "Senior pattern: wait for an observable condition instead —\n"
        "  await expect(locator).toBeVisible();            // web-first assertion, retries\n"
        "  const r = page.waitForResponse(URL); await act; await r;  // set up before the action\n")
    sys.exit(2)
sys.exit(0)
'
