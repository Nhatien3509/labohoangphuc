#!/usr/bin/env bash
# L2 · Skill reference script — bootstrap module mới bằng cách COPY module template.
# Template mặc định: `categories` (Danh mục phần mềm kết nối) — module chuẩn đang có.
# (FE-Convention-Master §11 nêu `dbaas` nhưng repo chưa có; KHÔNG copy module legacy.)
# Usage: ./scaffold.sh <module-name> [template]   (vd: ./scaffold.sh loai-du-lieu categories)
set -euo pipefail

MODULE="${1:?Cần tên module (kebab-case), vd: loai-du-lieu}"
TEMPLATE="${2:-categories}"

ROOT="$(git rev-parse --show-toplevel)"
DASH="$ROOT/src/web/portal-spa/src/app/[locale]/(dashboard)"

# Tìm module template ở cả root dashboard lẫn admin/.
SRC=""
for cand in "$DASH/$TEMPLATE" "$DASH/admin/$TEMPLATE"; do
  [ -d "$cand" ] && SRC="$cand" && break
done

if [ -z "$SRC" ]; then
  echo "❌ Không tìm thấy module template '$TEMPLATE'." >&2
  echo "   §11 yêu cầu copy module 'dbaas'. Copy thủ công module chuẩn rồi" >&2
  echo "   đổi tên thành '$MODULE', KHÔNG copy module legacy." >&2
  exit 1
fi

DEST="$(dirname "$SRC")/$MODULE"
[ -e "$DEST" ] && { echo "❌ '$MODULE' đã tồn tại tại $DEST" >&2; exit 1; }

cp -R "$SRC" "$DEST"
echo "✅ Đã copy '$TEMPLATE' → '$MODULE' tại: $DEST"
echo "   → Tiếp theo: đổi tên symbol/route, sửa _apis (server.ts, server.actions.ts,"
echo "     types.ts, urns.ts), _lib (const/schemas/validators), _components."
echo "   → Chạy: npx tsc --noEmit && npm run lint:fix"
