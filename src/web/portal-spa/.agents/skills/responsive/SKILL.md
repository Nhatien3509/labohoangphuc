---
name: responsive
description: >-
  Builds main feature UI so it survives narrow viewports without breaking: flexible
  flex/grid, overflow-safe tables, Tailwind breakpoints — pragmatic “no broken layout”
  until design kit covers every breakpoint. Use for page content, forms, toolbars,
  and tables when implementing or reviewing layout.
---

# Responsive (pragmatic)

## Context

The product **does not** yet target pixel-perfect layouts per breakpoint everywhere. The bar is **responsive cover**: UI stays **usable and unbroken** (no clipped-only-by-zoom, no overflow blowing the shell). **Main content** should be coded **flexibly** so it can stretch, stack, and scroll sensibly as the viewport changes.

When Figma/spec is missing for a breakpoint, **prefer safe, boring patterns** below over fixed desktop-only widths.

## Principles

1. **Mobile-first** — start from a narrow column; add `sm:` / `md:` / `lg:` / `xl:` only when layout really needs to change. See `docs/content/guidelines/module-playbook.md` (Responsive).
2. **Main content is fluid** — avoid locking the primary column to a hard `width` / `min-w` that cannot shrink. Prefer **`flex-1` + `min-w-0`** on children inside flex rows so text and tables can shrink and ellipsis/scroll instead of pushing the page sideways.
3. **Stack then split** — common pattern: `flex flex-col gap-4 lg:flex-row` (or `grid` with responsive columns) so filters, actions, and body reorder naturally on small screens.
4. **Tables** — **horizontal scroll** inside a wrapper (`overflow-x-auto`, `min-w-0` on the chain) and/or **hide non-essential columns** at smaller breakpoints when the module already does — **do not** rely on shrinking font alone as the only fix (`module-playbook.md`).
5. **Tokens still matter** — Tailwind + semantic classes (`bg-background`, spacing scale). Avoid arbitrary sizes unless agreed; see `docs/content/guidelines/ui-components.md`.

## Practical patterns

- **Page body:** outer content area often needs `min-w-0` if it sits beside a sidebar in a flex parent.
- **Toolbars:** wrap action groups so they **wrap** (`flex-wrap`, `gap-2`) or move secondary actions behind a menu on small screens when crowded.
- **Forms:** full-width inputs on small viewports; multi-column grids become **one column** below `md` unless spec says otherwise.
- **Dialogs/drawers:** respect viewport height (`max-h`, scroll **inside** the dialog body, not the whole app).
- **Tables in this codebase:** reuse **`DataTable` / `CommonTable` / `ServerCommonTable`** and **`useResponsiveColumns`** when columns need responsive width/shadow behavior — see `docs/content/handbook/component-usage.md` (Table stack).

## What not to do

- **Fixed “desktop” widths** on wrappers that hold dynamic text or wide tables (`w-[1200px]`-style) without an overflow story.
- **Only** scaling down `text-xs` to fit — fix structure (wrap, stack, scroll, hide column).
- **Assuming** a single breakpoint matches Figma when kit is incomplete — still test **~375px width** and a **mid tablet** width mentally or in the browser.

## Checklist

- [ ] Main column can shrink: **`min-w-0`** / **`flex-1`** where flex siblings fight for space.  
- [ ] Wide content (table, code, long toolbar) has **`overflow-x-auto`** or column strategy — not raw viewport overflow.  
- [ ] Layout **stacks** on small screens when it would otherwise crush.  
- [ ] **Tailwind breakpoints** used for real layout shifts, not random one-offs.  
- [ ] Reused **table/layout primitives** from `@common/` when they already solve responsive behavior.

## Docs

- `docs/content/guidelines/module-playbook.md` — Responsive one-liner + playbook link.  
- `docs/content/guidelines/ui-components.md` — Tailwind / tokens.  
- `docs/content/handbook/component-usage.md` — layout + table hooks.
