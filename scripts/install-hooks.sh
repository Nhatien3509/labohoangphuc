#!/usr/bin/env bash
# install-hooks.sh — one-time setup after cloning.
#
# Activates .githooks/ as the repo's hooks path and builds the convention scanner.
# Re-run safely; idempotent.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${REPO_ROOT}" ]]; then
    echo "✗ Not inside a Git repository." >&2
    exit 1
fi

cd "${REPO_ROOT}"

# 1) Point Git to .githooks/
current="$(git config --get core.hooksPath || true)"
if [[ "${current}" != ".githooks" ]]; then
    git config core.hooksPath .githooks
    echo "→ git config core.hooksPath = .githooks"
else
    echo "✓ git config core.hooksPath already = .githooks"
fi

# 2) Ensure hook is executable (Linux/Mac — Windows ignores POSIX mode)
chmod +x .githooks/* 2>/dev/null || true

# 3) Pre-build the scanner so the first commit doesn't pay the build cost.
if command -v go >/dev/null 2>&1; then
    echo "→ Building convention-scan…"
    SCANNER_DIR="${REPO_ROOT}/tools/convention-scan"
    BIN_DIR="${SCANNER_DIR}/bin"
    BIN="${BIN_DIR}/convention-scan"
    [[ "${OS:-}" == "Windows_NT" ]] && BIN="${BIN_DIR}/convention-scan.exe"
    mkdir -p "${BIN_DIR}"
    (cd "${SCANNER_DIR}" && go build -o "${BIN}" .)
    echo "✓ Scanner built: ${BIN}"
else
    echo "⚠ Go not found in PATH — scanner will build on first commit (needs Go >= 1.26)." >&2
fi

cat <<'EOF'

✓ Git hooks installed.

Từ giờ, mỗi `git commit` sẽ chạy convention-scan trên file staged:
  - CRITICAL → commit bị block (fat handler, hardcoded secret, panic, ...)
  - WARNING  → in ra cho biết nhưng vẫn cho commit (gin.H{}, function dài, ...)

Bypass (tránh dùng — CI cũng sẽ block):
  git commit --no-verify
EOF
