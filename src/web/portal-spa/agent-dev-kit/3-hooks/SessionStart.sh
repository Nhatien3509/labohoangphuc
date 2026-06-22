#!/usr/bin/env bash
# L3 · Guardrail — chạy khi BẮT ĐẦU session. In context hữu ích cho agent.
set -euo pipefail

echo "🚀 Session bắt đầu — Portal Kho Dữ liệu TTST"
echo "──────────────────────────────────────────"
echo "📍 Branch: $(git branch --show-current 2>/dev/null || echo '?')"
echo "📝 Thay đổi chưa commit:"
git status --short 2>/dev/null | head -10 || true
echo "──────────────────────────────────────────"
echo "💡 Nhắc: lint:fix + tsc --noEmit trước khi commit. Không --no-verify."
exit 0
