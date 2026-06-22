---
name: page-gen
description: >-
  Creates or edits app/[locale] page.tsx: withPage for server-fetched screens, thin
  re-exports, or async server pages when withPage is wrong. Use for new routes, lists,
  details, or dashboard pages.
---

# Page generator

## When to use

Adding or refactoring **`page.tsx`** under `src/app/[locale]/`, or choosing how data loads.

## Patterns (pick one)

### 1. List / table / dashboard with server data → **`withPage`**

From `@common/components/layout/PageGenerator`:

- **`fetchData(query)`** → `Promise<FetchResult<T>>` (or named multi-call array — see `PageGenerator.tsx`).
- **`defaultParams`** — keys for route `params` + query defaults (`page`, `pageSize`, …).
- **`isSearchParams`** — default `true` (merge query + params). Use **`false`** for **detail** routes so query does not override ids.

**Modular:** `@domain/_apis`, `urns`, `checkProjectAllowedActions` + `ERROR_403` when needed — like `dbaas/instances/page.tsx`.  
**Legacy:** match neighbors using `@/api/...`.

Child component props match **`PageContentProps`** (`data`, `params`, `searchParams`, optional `errors`).

### 2. No extra logic in the route → **re-export**

```ts
export { default } from "@domain/.../_components/SomePage";
```

### 3. Redirect, strict param checks, or special server flow → **`async` page**

`export default async function …` when `withPage` is a poor fit. Copy error/layout habits from **sibling routes** in the same module.

### 4. Special routes (404 catch-all, etc.)

Copy the **closest** existing route in `src/app/[locale]/`.

## Rules

- **Layout** (sidebar, providers, breadcrumbs) stays in **`layout.tsx`**, not duplicated in the page.  
- UI in route **`_components/`**; Zod **`schemas.ts`** next to the form that uses it.  
- New modules: `_apis/`, `_lib/` — see `docs/content/architecture/module-anatomy.md` and `docs/content/guidelines/module-playbook.md`.  
- **Reference module:** `src/app/[locale]/dbaas/` — avoid legacy `_utils` as the template.

## Checklist

- [ ] Right pattern: `withPage` vs re-export vs async.  
- [ ] `withPage`: `defaultParams` + `isSearchParams` correct for list vs detail.  
- [ ] Permissions match sibling pages (`urns` / `allowed-actions`).  
- [ ] No duplicate app shell on the page.

## Code refs

- `src/common/components/layout/PageGenerator.tsx`  
- `src/app/[locale]/dbaas/instances/page.tsx`  
- `src/app/[locale]/cloud-server/management/[serverId]/details/page.tsx`
