---
name: react-composition
description: >-
  Splits UI into Server vs Client components, shapes props and state boundaries, and
  places side effects deliberately. Use when refactoring components, designing new
  screens, or reviewing where data and interactivity should live in the App Router stack.
---

# React composition & UI state

This is **heuristic**, not a proof system. Prefer **clear boundaries** and **one source of truth** per concern. Detailed tables for state types and the Server/Client tree live in **`docs/content/guidelines/state-management.md`** — read that file for specifics; this skill adds **component-splitting and effect discipline**.

## Defaults (this repo)

- **Server Components by default.** Add **`"use client"`** only for events, `useState`/`useRef`, browser APIs, Zustand, or libraries that require the client.
- **Initial data** for pages: **RSC / `withPage`** patterns — do not default to `useEffect` + fetch for first paint (see `.agents/skills/api-integration/SKILL.md` and `.agents/skills/page-gen/SKILL.md`).

## When to split into another component

Split when **one** of these is true:

- **Different Client boundary** — one side is static/server-only, the other needs interactivity (keep the client subtree small).
- **Reuse** — the same UI appears in two routes or two dialogs with the same contract.
- **Readability** — the file mixes heavy data shaping, many hooks, and large JSX; extract **presentational** pieces or **hooks** (`_components/`, colocated `useX.ts` if the team already does).
- **Isolation of re-renders** — a frequently updating subtree (e.g. live filter) should not sit under unnecessary parent client state.

**Keep together** when the chunk is only used once, tightly coupled, and splitting would only add navigation cost without a boundary above.

## Props

- Prefer **named, typed props** — data objects + a few **action** callbacks (`onSubmit`, `onDelete`) over many loosely related setters.
- **Avoid deep drilling** — if three+ layers only pass data through: consider **module store** (`_stores/`), **URL/searchParams**, or **composition** (`children`) per `state-management.md` / `philosophy.md`.
- **Don’t encode every variant as a boolean** — if `isX` / `isY` multiply, consider a single `mode` / `variant` or smaller subcomponents.

## Where state should live (order of preference)

1. **URL (`searchParams`)** — pagination, filters, tab when shareable/bookmarkable.  
2. **Server** — fetched in RSC / `fetchData` for `withPage`.  
3. **React Hook Form** — create/edit flows (`docs/content/guidelines/form-and-validation.md`).  
4. **Module Zustand** (`_stores/`) — shared across a module subtree (instance across tabs).  
5. **`@common/stores/`** — true app-wide (theme, layout, allowed actions, billing context).

See the **type table** in `state-management.md`.

## Side effects (`useEffect` and friends)

- **Not** the default way to load data for a route — use server fetch patterns first.
- **Good fits:** subscriptions, syncing to `window`/storage where needed, focusing a field, analytics, or reacting to **client-only** prop changes that have no server equivalent.
- **Dependencies:** keep dependency arrays honest; if “fixing” warnings by empty `[]` or suppressions, reconsider whether the logic belongs on the server or in an event handler.
- **Mutations:** trigger from user events → **server actions** + handle `FetchResult` / toasts like sibling features (`api-integration` skill).

## Anti-patterns (red flags)

- One **mega component** doing fetch + permission + table + dialogs + form.  
- **Client** wrapper around the whole page “just in case.”  
- **Duplicated server state** in `useState` (e.g. list copy that could be props from RSC).  
- **Global store** for UI that only one dialog uses.  
- **Effects** that only mirror props into state without a clear need.

## Self-review checklist

- [ ] **Server vs client** boundary is minimal; `"use client"` only where required.  
- [ ] **State type** matches the table in `state-management.md` (URL vs server vs RHF vs store).  
- [ ] **Props** are readable without opening many files; drilling addressed.  
- [ ] **`useEffect`** has a stated reason that is not “load on mount” for data the server could supply.  
- [ ] **Loading/error** UX consistent with neighbors (skeletons, messages — `philosophy.md`).

## SSOT docs

- `docs/content/guidelines/state-management.md` — Server/Client tree, Zustand, URL.  
- `docs/content/handbook/philosophy.md` — splitting, global vs local, loading/error.  
- `docs/content/guidelines/common-patterns.md` — tables, forms, state pointers.  
- `docs/content/guidelines/form-and-validation.md` — RHF + Zod.  
- `docs/content/handbook/component-usage.md` — layout/table/dialog building blocks.

## Related skills

- `.agents/skills/api-integration/SKILL.md`  
- `.agents/skills/page-gen/SKILL.md`
