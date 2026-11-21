#!/usr/bin/env bash
# PreToolUse hook: refuse to write test.only / describe.only / page.pause into a
# spec or page-object file. These are dev-only leftovers that break CI (forbidOnly)
# or halt an unattended run (anti-pattern Bajo13). Covers Write/Edit/MultiEdit.
set -u
if ! command -v python3 >/dev/null 2>&1; then
  echo "[hook] block-focused-tests: python3 not found — focused-test guardrail is OFF." >&2
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
if re.search(r"\.only\s*\(", blob): hits.append("focused test (.only)")
if re.search(r"\bpage\.pause\s*\(", blob): hits.append("page.pause()")

if hits:
    sys.stderr.write(
        "Refusing to write a focused/paused test into " + path + "\n"
        "Found: " + ", ".join(hits) + "\n\n"
        "Anti-pattern (Bajo13): a stray .only makes CI run only a subset and forbidOnly fails the\n"
        "build; page.pause() stops an unattended run.\n"
        "Senior pattern: remove .only / page.pause before the code lands. Run the whole file, or\n"
        "slice the suite with `--grep @tag` instead of .only.\n")
    sys.exit(2)
sys.exit(0)
'
