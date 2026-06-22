#!/usr/bin/env bash
# L3 · Guardrail — chạy SAU mỗi tool call (Write/Edit). Auto-lint + thông báo.
# Nhận JSON qua stdin chứa file_path vừa được sửa.
set -euo pipefail

INPUT="$(cat)"
FILE="$(printf '%s' "$INPUT" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/' || true)"

[ -z "$FILE" ] && exit 0

# Chỉ lint file trong portal-spa.
case "$FILE" in
  *src/web/portal-spa/*.ts|*src/web/portal-spa/*.tsx)
    cd src/web/portal-spa 2>/dev/null || exit 0
    if command -v npx >/dev/null 2>&1; then
      npx eslint --fix "$FILE" >/dev/null 2>&1 || echo "⚠️ ESLint còn cảnh báo ở $FILE" >&2
    fi
    ;;
esac

# Ví dụ ping Slack (đặt SLACK_WEBHOOK_URL để bật).
if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
  curl -s -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"✏️ Đã sửa: $FILE\"}" "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || true
fi

exit 0
