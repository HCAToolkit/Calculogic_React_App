# Barrel & Boundary Sanity Pass — 2026-02-20

## Scope
- Repo-wide audit of every `src/**/index.ts` and `src/**/index.tsx` barrel.
- Minimal code fixes applied only for truthful exports and canonical boundary import usage.

## 1) All barrels checked + classification

- `src/content/index.ts`
  - Classification: **boundary/public API barrel** for content-facing consumers.
  - Notes: Exposes provider and docs catalog contracts; intentionally does not re-export `contentProviderRegistry`.
- `src/doc-engine/index.ts`
  - Classification: **boundary/public API barrel** for doc engine contracts/utilities.
  - Notes: Re-exports registry/types only (content-agnostic).
- `src/components/ContentDrawer/index.tsx`
  - Classification: **feature-local convenience barrel**.
  - Notes: Exposes component default and `toAnchorId` helper for nearby consumers.
- `src/components/GlobalHeaderShell/index.tsx`
  - Classification: **feature-local convenience barrel**.
  - Notes: Composes build/results concerns + logic and re-exports header tab/mode types.
- `src/tabs/build/index.tsx`
  - Classification: **feature-local convenience barrel**.
  - Notes: Default build tab composer only.

## 2) Invalid/stale/misleading exports found

### Issue A — Missing docs-id exports from content public surface
- Problem: `src/content/index.ts` did not export docs-id helpers/types used by shell consumers.
- Why boundary-relevant: Consumers used deep imports into `src/content/packs/...` bypassing content boundary surface.
- Minimal fix:
  - Added `HEADER_DOC_IDS`, `isHeaderDocId`, `toDocsContentId`, and `HeaderDocId` exports to `src/content/index.ts`.

### Before/after API sketch (content barrel)
- Before:
  - `export { DOCS_PROVIDER, HEADER_DOC_DEFINITIONS, resolveHeaderDoc, ...types }`
- After:
  - `export { DOCS_PROVIDER, HEADER_DOC_DEFINITIONS, resolveHeaderDoc, HEADER_DOC_IDS, isHeaderDocId, toDocsContentId, ...types }`
  - `export type { HeaderDocId }`

## 3) Cross-boundary re-export issues

- No boundary-violating re-exports found in barrels (e.g., no `doc-engine` barrel re-exporting app/UI internals).
- Import chain observations (non-re-export):
  - `src/components/GlobalHeaderShell/*` previously imported docs-id symbols via deep path under `src/content/packs/...`.
  - This was a boundary-usage smell (not a hard ownership leak), corrected by routing imports through `src/content/index.ts`.

## 4) Import-direction guardrail audit

### Required guardrails
- `src/doc-engine/**` importing from `src/content/**`: **none found**.
- `src/doc-engine/**` importing from `src/components/**`: **none found**.

### Additional layering observations
- `src/content/**` imports from `src/doc-engine/index.ts` for engine contracts: expected direction.
- `src/components/**` imports from `src/content` for UI content resolution and docs metadata: expected direction.

## 5) Cycles (in-scope vs out-of-scope)

- In-scope cycles caused by barrel misuse in touched scope: **none detected** via import inspection.
- Out-of-scope: no broad cycle-elimination work attempted (per scope cap).

## 6) Convergence notes for duplicate public paths

- Canonical path selected for docs-id access from UI boundary:
  - `src/content/index.ts`.
- Transitional/deep path still present in repo:
  - `src/content/packs/header-docs/header-doc.ids.ts` (direct imports remain valid for pack-internal modules).
- Minimal convergence fix applied at UI boundary call sites:
  - `src/components/GlobalHeaderShell/GlobalHeaderShell.build.tsx`
  - `src/components/GlobalHeaderShell/GlobalHeaderShell.knowledge.ts`

## 7) Intentionally left unchanged

- `src/components/ContentDrawer/index.tsx` re-export of `toAnchorId` left unchanged.
  - Reason: feature-local convenience barrel is currently used and not crossing ownership boundaries.
- `src/tabs/build/index.tsx` left unchanged.
  - Reason: already truthful and boundary-neutral.
- No NL/CCPP doc updates.
  - Reason: no public ownership/responsibility contract changed; only truthful exports/import path convergence.

## 8) Recommended next cleanup targets

1. Add lint rule(s) for restricted deep imports so UI layers must consume content contracts through `src/content/index.ts`.
2. Evaluate whether `src/components/ContentDrawer/index.tsx` should split helper exports into a non-component module to silence fast-refresh warnings.
3. Consider formalizing barrel classifications in a short repo note to distinguish public API barrels from convenience barrels.
