#!/usr/bin/env bash
# PreToolUse hook: refuse a fixed sleep in a spec or page-object file — either
# waitForTimeout with a numeric literal, or a hand-rolled new Promise(r => setTimeout(r, N)).
# Fixed sleeps are a bet on a number (anti-pattern Alto3). Covers Write/Edit/MultiEdit.
set -u
if ! command -v python3 >/dev/null 2>&1; then
  echo "[hook] block-fixed-sleeps: python3 not found — fixed-sleep guardrail is OFF." >&2
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

hits = []
if re.search(r"waitForTimeout\s*\(\s*\d", blob):
    hits.append("waitForTimeout(<number>)")
# hand-rolled sleep: new Promise(...) wrapping setTimeout
if re.search(r"new\s+Promise\s*\([^;]*setTimeout", blob, re.S) or \
   re.search(r"setTimeout\s*\(\s*\w+\s*,\s*\d", blob):
    hits.append("new Promise(r => setTimeout(r, <number>)) style sleep")

if hits:
    sys.stderr.write(
        "Refusing to write a fixed sleep into " + path + "\n"
        "Found: " + "; ".join(hits) + "\n\n"
        "Anti-pattern (Alto3): a hard sleep wastes time when the app is fast and still fails when\n"
        "it is slow. It does not fix flakiness, it hides it.\n"
        "Senior pattern: wait for an observable condition instead —\n"
        "  await expect(locator).toBeVisible();            // web-first assertion, retries\n"
        "  const r = page.waitForResponse(URL); await act; await r;  // set up before the action\n")
    sys.exit(2)
sys.exit(0)
'
