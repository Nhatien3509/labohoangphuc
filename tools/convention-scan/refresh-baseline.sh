#!/usr/bin/env bash
# Refresh .convention-scan-baseline.txt từ scan toàn project.
# Chạy mỗi khi đã fix bớt violation và muốn cập nhật snapshot.
set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ docker không có sẵn." >&2
  exit 1
fi
if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 không có sẵn." >&2
  exit 1
fi

echo "🔍 Quét toàn bộ Go/Dockerfile..."
find . -type f \( -name "*.go" -o -name "Dockerfile*" \) \
  ! -path "./src/web/*" ! -path "./node_modules/*" ! -path "./.git/*" \
  ! -path "*/vendor/*" 2>/dev/null | sed 's|^\./||' | sort > .convention-scan.all.txt

LOG="$(mktemp)"
docker run --rm -v "$(pwd):/workspace" -w /workspace golang:1.26-alpine sh -c '
  set -e
  cd tools/convention-scan
  go build -o /tmp/cs . >/dev/null
  cd /workspace
  cat .convention-scan.all.txt | /tmp/cs --paths-from - --no-color
' > "$LOG" 2>&1 || true

rm -f .convention-scan.all.txt

python3 - "$LOG" <<'PY'
import re, sys, pathlib
log_path = sys.argv[1]
text = pathlib.Path(log_path).read_text()
lines = text.splitlines()
severity = None
keys = set()
i = 0
while i < len(lines):
    line = lines[i]
    if "[CRITICAL" in line:
        severity = "CRITICAL"
    elif "[WARNING]" in line:
        severity = "WARNING"
    elif severity:
        m = re.match(r"^    (\S+):(\d+)\s", line)
        if m and i + 1 < len(lines):
            file = m.group(1)
            mm = re.match(r"^      → (.+)$", lines[i + 1])
            if mm:
                keys.add(f"{severity}|{file}|{mm.group(1)}")
                i += 2
                continue
    i += 1

with open(".convention-scan-baseline.txt", "w") as f:
    for k in sorted(keys):
        f.write(k + "\n")
print(f"✅ Baseline refreshed: {len(keys)} unique violations.")
PY

rm -f "$LOG"
