# Convergence & Contracts Health Check — 2026-02-20

## 1) Single canonical resolver path

Command run: `rg "resolveContent\\(" src`

Call sites and path:

- `src/content/contentResolutionAdapter.ts` → calls `contentProviderRegistry.resolveContent(...)` and narrows outcomes for drawer usage.
- `src/doc-engine/registry.ts` → internal provider dispatch (`provider.resolveContent(...)`) inside `ContentProviderRegistry.resolveContent`.

Assessment:

- UI boundary path is singular: `resolveDrawerContent` in `src/content/contentResolutionAdapter.ts` is the canonical app-facing resolver entrypoint.
- No direct UI call sites to `ContentProviderRegistry.resolveContent` were found outside the adapter path.

## 2) Import-direction audit (extraction guardrail)

Commands run:

- `rg "^import .*from" src/doc-engine -n`
- `rg "from '../content|from './content|from '../components|from './components|from '../../content|from '../../components' src/doc-engine -n`

Assessment:

- `src/doc-engine/**` imports are internal-only (`./registry.ts`, `./types.ts`).
- No imports from `src/content/**` or `src/components/**` were found.

## 3) Barrel sanity

Command run: `rg --files src | rg 'index\\.tsx?$'`

Barrels reviewed:

- `src/doc-engine/index.ts`
- `src/content/index.ts`
- `src/components/ContentDrawer/index.tsx`
- `src/components/GlobalHeaderShell/index.tsx`
- `src/tabs/build/index.tsx`

Assessment:

- Each barrel exports concrete local symbols from same-scope modules.
- `src/content/index.ts` explicitly avoids re-exporting `contentProviderRegistry`, preserving ownership boundary through `contentEngine`.
- No cross-boundary re-export violations were identified in the current index files.

## 4) Persistence contract stability

Storage keys and payloads:

- `section-configurations-state` → JSON object `{ version: 1, height: number, collapsed: boolean }` (legacy unversioned shape accepted on read).
- `section-atomic-components-state` → JSON object `{ version: 1, height: number, collapsed: boolean }` (legacy accepted).
- `section-search-configurations-state` → JSON object `{ version: 1, height: number, collapsed: boolean }` (legacy accepted).
- `left-panel-width` → numeric string (legacy contract retained as-is).
- `right-panel-state` → JSON object `{ version: 1, width: number, collapsed: boolean }` (legacy unversioned shape accepted on read).

Assessment:

- Version field added to JSON object payloads written by section and right-panel state contracts.
- Read paths are backward-compatible for pre-version payloads.

## 5) Minimal tests baseline

Commands run:

- `npm test`

Contract-lock tests in place:

- Namespace/id parsing:
  - `parseContentRef` valid + invalid ref tests.
  - `splitNamespace` backward-compatible shape test.
- Resolver hit/miss behavior:
  - resolver `found` outcome (`docs:doc-build`), `missing_content`, and `no_provider` tests.
- Malformed storage payload fallback:
  - `parseSectionStatePayload` malformed payload fallback test.
  - `readBuildSurfaceStorage` non-throwing fallback + reporter test.

Status: baseline satisfied (>= 3 tests spanning required contract categories).
