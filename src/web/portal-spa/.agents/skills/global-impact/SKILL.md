---
name: global-impact
description: >-
  Plans or reviews new services against CMP cross-cutting concerns: permission URNs
  (allowed actions), billing context and flags, and cost estimate flows. Use when
  scoping a new domain module, adding paid resources, or auditing MRs for missing
  guards; SSOT is docs/content/handbook/global-impact-modules.md.
---

# Global impact (CMP-aware services)

Console features are governed by **CMP-style platform concerns** (permissions, billing, cost). New services rarely stop at “one API + one page.” Use this skill to **decide what you must implement** and to **review** work before merge.

**Authoritative write-up:** `docs/content/handbook/global-impact-modules.md` — read it when details matter; this file is the **decision checklist**.

## 1. Permissions (URN / allowed actions)

**Ask for every screen and CTA:**

- Which **backend actions** does this API enforce? Map them in **`_apis/urns.ts`** (and consume via **`_actions/allowed-actions.ts`** — no raw URN strings in JSX).
- **Server:** `checkProjectAllowedActions` before loading data for **list / detail / edit** as in the doc table (list → `list`; edit → `get` + `update`; sections → URN of that section’s API).
- **Client:** `allowedActions.has(urn)` or **`AllowedActionButton`** for popups and destructive/primary actions; redirects stay unchecked at source, guarded at destination.

**MR sanity:** every new CTA has a URN; list/detail/edit rules satisfied; popups disabled + tooltip when denied; 403 from API still explained to the user when possible.

**Code pointers:** `src/common/lib/core/server-side.ts`, `src/common/components/containers/buttons/AllowedActionButton.tsx`, `useLayoutStore` for `allowedActions`.

## 2. Billing

**Ask:**

- Does this feature assume an **active billing / project plan** or a **specific product entitlement**?
- Should the **module layout** mirror siblings: e.g. `checkBillingPlan()` + **`BillingAccessGuard`**, or `checkServiceAccessibility` + feature flags — see `cloud-server`, `network`, `backup`, `kms` **layout.tsx** patterns.
- Any **`billing.*` feature flag** in `src/common/lib/feature-flags/config.ts`? Gate server routes or UI when product requires it (`getFeatureFlags` — example in `global-impact-modules.md`).

**MR sanity:** billing dependency called out; flags + layout store / guard aligned with similar services; if using `src/api/billing/`, copy patterns from an existing billing-related screen.

## 3. Cost estimate

**Ask:**

- Does **create / resize / change SKU** need a **running cost preview**?

If yes: reuse **`CostEstimateCard`**, **`PreviewResourceButtons`** (see `containers/buttons/`), and the **debounced estimate API** pattern — reference **`dbaas/instances/create/_components/CreateDBInstance.tsx`**. Align types with the shared **cost estimate** API/types used elsewhere (verify imports in that file).

**MR sanity:** no one-off estimate card that drifts from design; loading/error states for estimate calls.

## 4. Quick scoping worksheet (new service)

Answer briefly before coding; if “yes,” plan the implementation.

| Question | If yes → typical work |
|----------|------------------------|
| User can **list** resources? | Server URN check + `list` (or `all`) + client guards on row actions |
| User can **open detail / tabs**? | Per-tab or per-section URN + fallback UI if forbidden |
| User can **create / update / delete**? | `create` / `update` / `delete` URNs; edit needs **get + update** |
| Feature is **paid / plan-gated**? | Layout guard + flags + possibly billing APIs |
| **Create flow** shows price? | `CostEstimateCard` + estimate endpoint + debounce pattern |
| **Redirect-only** entry points? | Document that destination owns permission check |

## 5. Related skills & docs

- **API + URN depth:** `.agents/skills/api-integration/SKILL.md` and `docs/content/guidelines/api-integration.md`
- **Architecture:** `docs/content/architecture/module-anatomy.md` (`urns.ts`, `_actions`)
- **Code review:** `docs/content/workflow/code-review.md` (allowed actions row)
- **Philosophy / layout state:** `docs/content/handbook/philosophy.md` (shared layout, flags)

## 6. Merge checklist (copy into MR when relevant)

- [ ] **URNs** for every new API-backed action; server + client guards per `global-impact-modules.md` table  
- [ ] **Billing / plan / service accessibility** if applicable (layout + flags)  
- [ ] **Cost estimate** reused if create/resize shows price  
- [ ] **403 UX** not silent when backend returns permission errors  
- [ ] **Doc link** in MR if product chose an exception (e.g. no estimate yet)
