---
name: api-integration
description: >-
  Server-first API usage: reads in server/RSC, mutations in server actions; map calls
  to permission URNs; handle loading and errors; avoid Promise.all unless several
  independent calls are really needed. Use when adding _apis, wiring fetches, or
  reviewing permissions and error handling.
---

# API integration

**Applies to new code and any file you change.** Old code may differ; improve it when you touch it.

## 1. Server-first

- **Reads:** `*_apis/server.ts` from **`withPage`** or an `async` Server Component. Avoid moving initial list/detail load into client `useEffect` without a good reason.  
- **Writes:** `server.actions.ts` with `"use server"`; call from client handlers.  
- **Split:** HTTP + cache tags stay in `_apis/` — see `docs/content/guidelines/api-integration.md`.

## 2. One call per UI job; parallel only when it pays off

- Prefer **one request per clear UI slice** (table, section, card).  
- **Sequence** when call B needs output or permission outcome from call A.  
- **`Promise.all`** only if several **unrelated** calls are **all** needed for the same view and parallel saves real time — not as a default habit.

**Example (sequence + URN):** `dbaas/instances/[instanceId]/users/page.tsx`.

## 3. URNs

- Define strings in **`_apis/urns.ts`** and/or **`_actions/allowed-actions.ts`** — no scattered literals.  
- **Before** server-driven API calls: **`checkProjectAllowedActions`** with the URNs the backend enforces; on deny return **`ERROR_403`**.  
- **Buttons/menus:** `allowedActions.has(…)` / `AllowedActionButton` — see `docs/content/handbook/global-impact-modules.md`.  
- New endpoint → **URN listed** + **check** at the right layer (server for page data, client for actions).

## 4. Loading

- **`withPage`:** Suspense + default loading UI in `PageGenerator`.  
- **Mutations:** show pending state on the control.  
- **Heavy subsection:** optional nested Suspense if design needs progressive load.

## 5. Errors

- Always check **`FetchResult`** (`success`, `status`, `error`).  
- **`withPage`:** failures use **`handlePageError`** (403 / 404 / server error patterns).  
- **Client mutations:** toast or inline error; **403** with a clear message when API allows.  
- **Detail sections:** show a **fallback** for forbidden/failed subsection — not empty silence. See `global-impact-modules.md`.

## Checklist

- [ ] Reads server-side; mutations via **`server.actions.ts`**.  
- [ ] URNs from **`urns` / allowed-actions**.  
- [ ] **`checkProjectAllowedActions`** matches the API you call.  
- [ ] No extra **`Promise.all`**; dependent calls ordered.  
- [ ] Loading visible where users wait.  
- [ ] Errors handled end-to-end.

## Docs

- `docs/content/guidelines/api-integration.md`  
- `docs/content/handbook/global-impact-modules.md`  
- `docs/content/guidelines/common-patterns.md`

## Code refs

- `src/app/[locale]/dbaas/instances/page.tsx`  
- `src/app/[locale]/dbaas/instances/[instanceId]/users/page.tsx`  
- `src/app/[locale]/dbaas/_apis/urns.ts`  
- `src/common/components/layout/PageGenerator.tsx`  
- `src/api/types.ts` (`FetchResult`, `GETResponse`)
