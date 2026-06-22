# portal-spa — Claude Code Instructions

> **📖 ĐỌC TRƯỚC KHI CODE**: [docs/content/FE-Convention-Master.md](docs/content/FE-Convention-Master.md) — convention tổng hợp (đặt tên, coding, hooks, state, API, UI/UX, performance, testing, tooling). File này là source-of-truth; CLAUDE.md chỉ là tóm tắt rule cứng. Mọi PR cần đối chiếu với convention master trước khi commit.

## Project overview

Next.js 14 App Router frontend for the Vietnamese government data integration portal (Hệ thống tích hợp, chia sẻ dữ liệu). Uses Tailwind CSS, Zustand, and Feature Slice architecture.

## Architecture

- **Route groups**: `(app)` for auth pages, `(dashboard)` for main portal
- **Feature Slice**: each module under `src/app/[locale]/(dashboard)/{module}/` owns its `_apis/`, `_lib/`, `_hooks/`, `_stores/`, and route subfolders with `_components/`
- **Path aliases**: `@/*` → `src/`, `@common/*` → `src/common/`, `@{module}/*` → module root
## Key conventions

- Server Components fetch data; Client Components render UI and own URL-based state
- URL searchParams (not `useState`) for filter/pagination state
- Page files are thin shells — UI lives in `_components/`
- No cross-module imports; use the module's own path alias
- Dark mode classes (`dark:*`) must accompany every `bg-*`/`text-*` colour class

## Think before coding

**Before starting any implementation, always do this first:**

- State your assumptions explicitly. If unsure about intent, ask — don't guess.
- If there are multiple valid interpretations of a request, list all of them. Never silently pick one.
- If a simpler approach exists, say so before proceeding with the complex one.
- If anything is unclear or ambiguous, stop and point it out. One clarifying question now saves a full rewrite later.

## Prefer simple and minimal

Write the least code needed to solve the problem.

- No features beyond what was asked.
- No abstractions for code used only once.
- No error handling for impossible cases.
- If you wrote 200 lines and a 50-line version exists, write the 50-line version.

## Check common layer before writing new code

**Before implementing any UI change, component, or utility, always check `src/common/` first.**

If a suitable primitive already exists, use it — do not rewrite it. Building duplicates is not allowed.

### Lookup checklist

| Need | Where to look first |
|---|---|
| Table with sort / filter / pagination | `@common/components/containers/tables/CommonTable.tsx` or `DataTable.tsx` |
| Sortable column header | `@common/components/containers/tables/SortableFilterHeader.tsx` |
| Pagination footer | `@common/components/containers/tables/TablePagination.tsx` |
| Search input with debounce | `@common/components/containers/inputs/DebounceInput.tsx` |
| Dropdown / select | `@common/components/containers/selects/SelectContainer.tsx` |
| URL query-param state (filter, page, sort) | `@common/hooks/useQueryParams.tsx` |
| Row selection state | `@common/hooks/useRowSelection.tsx` |
| Button, Input, Badge, Avatar, Dialog… | `@common/components/ui/{component}.tsx` |
| Date / number / string formatting | `@common/lib/helpers/{datetime,numbers,str}.ts` |
| Table-specific helpers | `@common/lib/helpers/table.ts` |

### Table rule — mandatory for any data table

Before building a table from scratch:
1. Check if `CommonTable` or `DataTable` (TanStack Table wrapper) covers the use case.
2. Reuse `SortableFilterHeader` for sortable columns, `TablePagination` for the footer.
3. If the common table is unsuitable (e.g., design diverges significantly), build with the low-level `@common/components/ui/table.tsx` primitives (`Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`) — never plain `<table>` HTML.

## Commit rules

**NEVER create a git commit without running lint first.**

### Pre-commit hook (auto-enforced)

This repo has a single pre-commit hook at `.githooks/pre-commit` (repo root, shared by FE + BE) that runs, on the relevant staged files: `npm run lint:staged` (eslint --fix + prettier) for portal-spa; `golangci-lint run --new-from-rev=HEAD` per affected Go module (only NEW issues block); and a baseline-filtered `convention-scan` for Go/Dockerfile. Each section is gated by file type, so FE and BE checks are independent. It blocks the commit if any fails.

> **BE devs:** committing `.go` files requires `golangci-lint` installed locally — the hook blocks with install instructions if it's missing (`go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest` or `brew install golangci-lint`).

**Auto-enabled for every dev — no manual setup.** The hook files live in `.githooks/` (committed to the repo). Both install paths point Git there with `core.hooksPath=.githooks`, so they never conflict: FE devs get it via the `prepare` script (`sh scripts/setup-git-hooks.sh`) on every `npm`/`pnpm install` in `src/web/portal-spa`; BE-only devs run `scripts/install-hooks.sh` (no Node needed). After setup once, every `git commit` runs the checks relevant to the staged files; commits that touch neither portal-spa nor Go files are unaffected.

Caveats: the local hook is bypassable with `git commit --no-verify`, and the Go convention-scan skips when Docker/python3 aren't available. For guarantees that apply to everyone regardless of local state, enforce the same checks in server-side CI (GitLab pipeline + protected branches), since `--no-verify` only skips local hooks.

### Manual checks before pushing

Even with the hook, before pushing run:

1. `npm run lint:fix` — auto-fix ESLint + Prettier across whole project
2. `npx tsc --noEmit` — confirm zero TypeScript errors

If anything fails, **stop and fix all issues before committing**. Do not use `--no-verify` or any flag that bypasses the pre-commit hook.

Skipping or reordering these steps is not allowed.
