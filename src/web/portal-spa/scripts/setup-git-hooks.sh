#!/usr/bin/env sh
# Trỏ git về hook chung ở repo-root `.githooks` cho MỌI dev.
#
# Chạy tự động qua npm/pnpm `prepare` mỗi lần cài deps FE (xem package.json) →
# FE dev không phải set tay. Dev BE thuần dùng `scripts/install-hooks.sh` (cũng
# trỏ `.githooks`) — KHÔNG cần Node/FE. Cả 2 đường đều trỏ cùng 1 chỗ nên không
# còn xung đột core.hooksPath như khi hook nằm trong `.husky` của FE.
#
# `core.hooksPath` lưu đường dẫn TƯƠNG ĐỐI với repo root (git chạy hook từ gốc
# working tree nên giải đúng dù commit từ thư mục con).

HOOKS_PATH=".githooks"

# Bỏ qua êm nếu không phải git repo (vd cài deps trong Docker build không có .git).
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  exit 0
fi

# Idempotent + im lặng nếu đã cấu hình (để post-merge/post-checkout không spam).
if [ "$(git config core.hooksPath 2>/dev/null)" = "$HOOKS_PATH" ]; then
  exit 0
fi

git config core.hooksPath "$HOOKS_PATH"
echo "✅ git hooks: core.hooksPath=$HOOKS_PATH (pre-commit sẽ chặn vi phạm convention)"
