#!/usr/bin/env python3
"""Filter convention-scan output against a baseline.

Reads convention-scan output from stdin, removes violations whose
(severity, file, rule) signature already exists in the baseline file.
Prints only NEW violations to stdout.

Exit codes:
  0 — no new violations
  1 — new WARNING only (commit allowed)
  2 — new CRITICAL violations (commit blocked)
"""
import re
import sys
from pathlib import Path

BASELINE_DEFAULT = ".convention-scan-baseline.txt"


def load_baseline(path: str) -> set[str]:
    p = Path(path)
    if not p.exists():
        return set()
    return {ln.strip() for ln in p.read_text().splitlines() if ln.strip()}


def parse_violations(text: str):
    """Yield (severity, file, line_num, func, rule, hint) per violation block."""
    severity = None
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if "[CRITICAL" in line:
            severity = "CRITICAL"
        elif "[WARNING]" in line:
            severity = "WARNING"
        elif severity:
            m = re.match(r"^    (\S+):(\d+)\s+(.*)$", line)
            if m and i + 2 < len(lines):
                file_path, line_num, func = m.group(1), m.group(2), m.group(3).strip()
                rule_m = re.match(r"^      → (.+)$", lines[i + 1])
                if rule_m:
                    rule = rule_m.group(1)
                    hint = lines[i + 2].strip() if i + 2 < len(lines) else ""
                    yield (severity, file_path, line_num, func, rule, hint)
                    i += 3
                    continue
        i += 1


def main() -> int:
    baseline_path = sys.argv[1] if len(sys.argv) > 1 else BASELINE_DEFAULT
    baseline = load_baseline(baseline_path)
    text = sys.stdin.read()

    new_critical = []
    new_warning = []
    for sev, fp, ln, fn, rule, hint in parse_violations(text):
        key = f"{sev}|{fp}|{rule}"
        if key in baseline:
            continue
        (new_critical if sev == "CRITICAL" else new_warning).append(
            (fp, ln, fn, rule, hint)
        )

    if not new_critical and not new_warning:
        print("✅ convention-scan: no new violations vs baseline.")
        return 0

    if new_critical:
        print("\n🆕 NEW CRITICAL violations (not in baseline):")
        for fp, ln, fn, rule, hint in new_critical:
            print(f"  {fp}:{ln}  {fn}")
            print(f"    → {rule}")
            if hint:
                print(f"    {hint}")

    if new_warning:
        print("\n🆕 NEW WARNING (not in baseline):")
        for fp, ln, fn, rule, hint in new_warning:
            print(f"  {fp}:{ln}  {fn}")
            print(f"    → {rule}")

    if new_critical:
        print(
            f"\n❌ {len(new_critical)} new CRITICAL — commit blocked. "
            f"Fix or add to baseline."
        )
        return 2
    print(f"\n⚠️  {len(new_warning)} new WARNING — commit allowed.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
