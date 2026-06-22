#!/usr/bin/env bash
# L3 · Guardrail — chạy TRƯỚC mỗi tool call (Bash). Deterministic, không phải AI.
# Nhận JSON qua stdin; exit code != 0 => chặn tool, in lý do ra stderr.
set -euo pipefail

INPUT="$(cat)"
CMD="$(printf '%s' "$INPUT" | grep -oE '"command"[[:space:]]*:[[:space:]]*"[^"]*"' || true)"

# Chặn lệnh xoá nguy hiểm.
if printf '%s' "$CMD" | grep -qE 'rm[[:space:]]+(-[a-zA-Z]*r[a-zA-Z]*|-rf|-fr)'; then
  echo "⛔ Chặn: lệnh rm đệ quy bị cấm bởi guardrail." >&2
  exit 2
fi

# Chặn bypass pre-commit hook.
if printf '%s' "$CMD" | grep -qE '\-\-no-verify'; then
  echo "⛔ Chặn: không được dùng --no-verify (xem CLAUDE.md commit rules)." >&2
  exit 2
fi

# Chặn force push lên nhánh chính.
if printf '%s' "$CMD" | grep -qE 'push.*(-f|--force).*(main|master)'; then
  echo "⛔ Chặn: force push vào main/master bị cấm." >&2
  exit 2
fi

exit 0
