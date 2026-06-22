#!/bin/sh
set -eu

# Portal-spa FE convention guard.
# Runs from repo root (auto-cd) and checks files changed in the current
# MR / branch against FE-Convention-Master.md. Blocks merge on violation.
#
# Usage in CI:
#   bash src/web/portal-spa/scripts/check-fe-conventions.sh
#
# Usage locally:
#   cd <repo-root> && sh src/web/portal-spa/scripts/check-fe-conventions.sh
#
# Convention doc: src/web/portal-spa/docs/content/FE-Convention-Master.md

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

PORTAL_PREFIX="src/web/portal-spa/"

fail=0
changed_files="$(mktemp)"
scan_files="$(mktemp)"
component_scope="$(mktemp)"
style_files="$(mktemp)"

cleanup() {
  rm -f "$changed_files" "$scan_files" "$component_scope" "$style_files"
}
trap cleanup EXIT

log_blocking() {
  fail=1
  printf '\n[BLOCKING] %s\n' "$1"
  printf 'Vấn đề: %s\n' "$2"
  printf 'Rủi ro: %s\n' "$3"
  printf 'Hướng sửa: %s\n' "$4"
  if [ -n "${5:-}" ]; then
    printf '%s\n' "$5"
  fi
}

# Resolve changed files (repo-root-relative paths).
resolve_changed_files() {
  if [ -n "${CI_MERGE_REQUEST_DIFF_BASE_SHA:-}" ] \
    && git cat-file -e "$CI_MERGE_REQUEST_DIFF_BASE_SHA^{commit}" 2>/dev/null; then
    git diff --name-only "$CI_MERGE_REQUEST_DIFF_BASE_SHA"...HEAD
    return
  fi

  if [ -n "${CI_MERGE_REQUEST_TARGET_BRANCH_NAME:-}" ]; then
    git fetch origin "$CI_MERGE_REQUEST_TARGET_BRANCH_NAME" --depth=100 >/dev/null 2>&1 || true
    base="$(git merge-base HEAD "origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME" 2>/dev/null || true)"
    if [ -n "$base" ]; then
      git diff --name-only "$base"...HEAD
      return
    fi
  fi

  if git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
    git diff --name-only HEAD~1...HEAD
    return
  fi

  git ls-files
}

# Filter to portal-spa source files only.
resolve_changed_files | while IFS= read -r file; do
  case "$file" in
    "${PORTAL_PREFIX}src/"*) ;;
    *) continue ;;
  esac
  # Bỏ qua file đã xoá. Dùng `if` thay vì `&&` để không trả mã != 0
  # (sẽ làm `set -e` kết thúc script sớm khi diff có file bị xoá).
  if [ -f "$file" ]; then
    printf '%s\n' "$file"
  fi
done > "$changed_files"

# Code files for general checks (ts/tsx/js/jsx).
grep -E "^${PORTAL_PREFIX}src/.*\\.(ts|tsx|js|jsx)$" "$changed_files" > "$scan_files" || true

# Style files (css/scss) for style-specific checks.
grep -E "^${PORTAL_PREFIX}src/.*\\.(css|scss)$" "$changed_files" > "$style_files" || true

# Component-scope: files where direct API calls are forbidden.
# - Module client components: src/app/**/_components/**
# - Shared UI components:     src/common/components/**
grep -E "^${PORTAL_PREFIX}src/(app/.*/_components/.*|common/components/.*)\\.(ts|tsx|js|jsx)$" \
  "$changed_files" > "$component_scope" || true

# === BLOCKING CHECKS ===

# 1. Direct API calls (axios/fetch) in component files.
if [ -s "$component_scope" ]; then
  if xargs grep -nE "(from ['\"]axios['\"]|require\(['\"]axios['\"]\)|(^|[^A-Za-z0-9_])axios\.|(^|[^A-Za-z0-9_])fetch[[:space:]]*\()" \
       < "$component_scope" 2>/dev/null; then
    log_blocking \
      "Gọi API trực tiếp trong component" \
      "Component đang gọi axios/fetch trực tiếp." \
      "API logic bị rải trong UI, khó test, khó tái sử dụng; vi phạm pattern Server-first của Next.js 14 (RSC fetch + server action)." \
      "Chuyển API call vào _apis/server.ts (RSC read) hoặc _apis/server.actions.ts (mutation). Component chỉ nhận props từ RSC hoặc gọi server action. Xem docs/content/guidelines/api-integration.md." \
      ""
  fi
fi

# 2. Ant Design Form (project dùng react-hook-form + zod).
if [ -s "$scan_files" ]; then
  if xargs grep -nE "(Form\\.useForm([^A-Za-z0-9_]|$)|from ['\"]antd['\"][^;]*([^A-Za-z0-9_]|^)Form([^A-Za-z0-9_]|,|$))" \
       < "$scan_files" 2>/dev/null; then
    log_blocking \
      "Dùng Ant Design Form thay vì react-hook-form" \
      "Code đang dùng Form.useForm, import Form từ antd hoặc render <Form/>." \
      "Form flow lệch pattern portal-spa (react-hook-form + zod); khó tích hợp validation chung; không khớp FE-Convention-Master.md mục 5." \
      "Dùng react-hook-form (useForm/Controller) + zod schema. Xem docs/content/guidelines/form-and-validation.md." \
      ""
  fi
fi

# 3. TypeScript `any` / `as any` / `<any>` / `Record<..., any>`.
if [ -s "$scan_files" ]; then
  if xargs grep -nE "(:[[:space:]]*any([^A-Za-z0-9_]|$)|([^A-Za-z0-9_]|^)as[[:space:]]+any([^A-Za-z0-9_]|$)|<any([^A-Za-z0-9_]|$)|Record<[^>]*,[[:space:]]*any>)" \
       < "$scan_files" 2>/dev/null; then
    log_blocking \
      "Dùng any/as any trong TypeScript" \
      "Code mới có any hoặc as any." \
      "Mất type safety, dễ gây lỗi runtime và che khuất lỗi contract dữ liệu API/form/business logic." \
      "Khai báo type/interface rõ ràng cho payload, response, form value. Nếu bắt buộc dùng unknown rồi narrow type trước khi sử dụng. Xem FE-Convention-Master.md mục 2.2." \
      ""
  fi
fi

# 4. Selector AntD dev-only trong CSS/SCSS.
if [ -s "$style_files" ]; then
  if xargs grep -n "css-dev-only-do-not-override-" < "$style_files" 2>/dev/null; then
    log_blocking \
      "Dùng selector AntD dev-only" \
      "SCSS/CSS target selector css-dev-only-do-not-override-* của AntD." \
      "Selector này không ổn định giữa dev/prod và có thể vỡ style sau khi build hoặc nâng cấp antd." \
      "Override qua class scope của component hoặc wrapper UI trong @common/components/ui/." \
      ""
  fi
fi

# === FINAL ===

if [ "$fail" -ne 0 ]; then
  printf '\n❌ Kiểm tra convention FE thất bại.\n'
  printf 'Sửa các lỗi [BLOCKING] trước khi merge.\n'
  printf 'Convention master: src/web/portal-spa/docs/content/FE-Convention-Master.md\n'
  exit 1
fi

printf '✅ Kiểm tra convention FE thành công.\n'
