# Folder Organization Health Check (Doc-Engine Extraction Prep)

## Scope
Repository: `HCAToolkit/Calculogic_React_App`
Goal: assess folder boundaries for future doc-engine split with minimal churn.

## A) Current structure map (short)

### `src/` major folders
- `src/doc-engine/` — staged doc-engine runtime boundary (types, registry, providers, catalogs, package-style exports).
- `src/content/` — app composition + adapter layer (registry singleton wiring, drawer-specific resolver adapter, context provider/barrel).
- `src/components/GlobalHeaderShell/` — app shell UI and shell knowledge/logic/results composition.
- `src/components/ContentDrawer/` — drawer UI adapter/presenter + anchor helper + styles.
- `src/tabs/` — tab-level app UI features (currently Build tab).
- `src/content-drawer/` — legacy/shared content type constants.
- `src/assets/` — static assets.

### `doc/` major folders
- `doc/ConventionRoutines/` — binding conventions (CCPP/CSCS/NL-first templates/workflow).
- `doc/doc-engine/` and `doc/DocEngine/` — architecture/contracts/MVP docs for doc-engine.
- `doc/nl-doc-engine/` — NL skeletons for doc-engine configs.
- `doc/nl-config/` and `doc/nl-shell/` — app configuration/shell NL skeletons.
- `doc/Architecture/` — extraction plan and architecture summaries.
- `doc/HealthChecks/` — periodic repository health review docs.

## B) Extraction grouping recommendation

| Path | Category | Notes |
|---|---|---|
| `src/doc-engine/types.ts` | Engine Core | Canonical content contracts should be package-owned. |
| `src/doc-engine/registry.ts` | Engine Core | Namespace parsing + provider registry orchestration are reusable core runtime primitives. |
| `src/doc-engine/index.ts` | Engine Core (boundary candidate) | Public API surface for future package extraction. |
| `src/doc-engine/providers/docs.provider.ts` | Provider (app-specific today) | Provider implementations are not required to live in engine core; this one is tied to header docs content and is a candidate to move app-side. |
| `src/doc-engine/catalogs/header-docs.catalog.ts` | Content Pack (currently coupled) | App/header-specific docs payload; should not remain in long-term engine core. |
| `src/content/contentEngine.ts` | App Composition | Correct host-owned provider registration singleton location. |
| `src/content/contentResolutionAdapter.ts` | UI Adapter (app layer) | Drawer-specific narrowing and mapping to docs payload should remain app-side. |
| `src/content/ContentContext.tsx` | App Composition | UI state orchestration for drawer open/close belongs to app shell. |
| `src/components/ContentDrawer/*` | UI Adapter | Rendering/styling and anchor behavior are app/UI concerns. |
| `src/components/GlobalHeaderShell/*` | UI Adapter + App Feature | Header UI and shell knowledge remain app feature scope. |
| `doc/doc-engine/*`, `doc/nl-doc-engine/*`, `doc/Architecture/DocEngineExtractionPlan.md` | Docs | Design/contract docs; keep synchronized but not in runtime package unless copied for package docs. |

## C) Top folder-organization issues (ranked)

1. **High — content pack co-located in `src/doc-engine/catalogs/`**  
   - Paths: `src/doc-engine/catalogs/header-docs.catalog.ts`, `src/doc-engine/providers/docs.provider.ts`  
   - Risk: app/header-specific docs are packaged with core boundary, encouraging accidental coupling and making core extraction include content payloads by default.

2. **Medium — app barrel re-exports engine internals under `src/content/`**  
   - Path: `src/content/index.ts`  
   - Risk: mixed import entrypoints (`../doc-engine` vs `../content`) can blur ownership over time and increase import churn during package cutover.

3. **Medium — shell knowledge still leaks doc/content identifiers into UI feature layer**  
   - Paths: `src/components/GlobalHeaderShell/GlobalHeaderShell.knowledge.ts`, `src/components/GlobalHeaderShell/index.tsx`  
   - Risk: keeping doc-id semantics in header knowledge is fine short term, but it tangles future reusable content packs with a specific UI shell vocabulary.

4. **Low — duplicate doc-engine documentation roots (`doc/DocEngine` and `doc/doc-engine`)**  
   - Paths: `doc/DocEngine/`, `doc/doc-engine/`  
   - Risk: convention drift and confusion about canonical docs location during extraction handoff.

## D) Minimal incremental re-org plan

### Change 1 — carve out a content-pack staging folder inside app layer
- **Before → After**
  - `src/doc-engine/catalogs/header-docs.catalog.ts`
  - → `src/content/packs/header-docs/header-docs.catalog.ts`
- **Import updates**
  - `src/doc-engine/index.ts` stops exporting catalog types/data.
  - After this change, `src/doc-engine/index.ts` should export only core contracts + registry + helpers; packs/providers are app-owned exports.
  - Preferred: move `docs.provider.ts` to app layer in the same increment (or immediately after) so provider imports pack content from `src/content/providers/*` rather than creating an `src/doc-engine -> src/content` dependency.
  - Transitional fallback (short-lived only): allow `src/doc-engine/providers/docs.provider.ts` to import from `src/content/packs/...` until Change 2 lands.
  - `src/content/contentResolutionAdapter.ts` imports payload type from new pack path if needed.
- **Risks**
  - Type export breakage from `src/doc-engine/index.ts` consumers.
  - Mitigation: keep temporary compatibility re-exports in `src/content/index.ts` during migration.

- **Temporary import-direction guardrail**
  - Allowed: app composition/provider layers (`src/content/**`) importing app content packs (`src/content/packs/**`).
  - Avoid where possible (and keep extremely short-lived if used): `src/doc-engine/**` importing `src/content/**`.

### Change 2 — relocate only app-specific providers out of core boundary
- **Before → After**
  - `src/doc-engine/providers/docs.provider.ts`
  - → `src/content/providers/docs.provider.ts`
- **Import updates**
  - `src/content/contentEngine.ts` imports `DOCS_PROVIDER` from `src/content/providers/docs.provider`.
  - `src/doc-engine/index.ts` no longer exports `DOCS_PROVIDER`.
- **Risks**
  - Existing imports from `../doc-engine` fail.
  - Mitigation: short-lived shim export from old path with deprecation comment, remove in next increment.

> Clarification: this move applies to **this specific provider** because it is coupled to app-owned header docs content. Long-term platform direction can still include reusable providers in separate provider packages (or in a doc-engine-adjacent layer) while keeping core extractable as contracts + registry + helpers.

### Change 3 — narrow engine public surface to contracts/orchestrator only
- **Before → After**
  - `src/doc-engine/index.ts` (mixed exports)
  - → `src/doc-engine/index.ts` (only `types.ts`, `registry.ts`, helper exports)
- **Import updates**
  - `src/content/index.ts` no longer re-exports pack/provider artifacts from engine path.
- **Risks**
  - Downstream callers using engine barrel for app-only concerns.
  - Mitigation: add explicit app entrypoints under `src/content/` and codemod imports in one commit.

### Change 4 — optional docs consolidation (non-blocking)
- **Before → After**
  - `doc/DocEngine/*` + `doc/doc-engine/*`
  - → canonical single directory (prefer lowercase `doc/doc-engine/`)
- **Import updates**
  - update links in `doc/README.md` and extraction plan references.
- **Risks**
  - Broken relative links in markdown.
  - Mitigation: run link check or targeted `rg` for stale paths.

## E) Safe migration sequence (minimal churn)

1. **Prep aliases (no moves yet)**
   - Add temporary exports in `src/content/` for provider + pack interfaces.
   - Keep existing call sites untouched.

2. **Move content pack first**
   - Move `header-docs.catalog.ts` to `src/content/packs/header-docs/`.
   - Update only provider import + direct type imports.

3. **Move provider second**
   - Move `docs.provider.ts` to `src/content/providers/`.
   - Update `contentEngine.ts` to import provider from app layer.

4. **Constrict engine barrel**
   - Remove provider/catalog exports from `src/doc-engine/index.ts`.
   - Keep only core contracts + registry.

5. **Codemod imports and remove shims**
   - Rewrite app imports to explicit `src/content/*` or `src/doc-engine/*` ownership.
   - Delete temporary compatibility exports once green.

6. **Package extraction rehearsal**
   - Copy `src/doc-engine/{types,registry,index}` into package prototype.
   - Verify app still composes providers externally.

## Verification checks captured in this audit
- `rg "src/doc-engine.*src/components" src` → 0 matches.
- `rg "GlobalHeaderShell\.knowledge" src/content src/doc-engine src/content-drawer test` → 0 matches (resolver plumbing scope).
- `rg "GlobalHeaderShell\.knowledge" src/components/GlobalHeaderShell` → allowed local shell usage (2 matches in shell files).
- `npm test -- --runInBand` → pass.
- `npm run build` → pass.

## Notes
- This health check intentionally avoids implementing folder moves.
- Plan favors boundary hardening and extraction readiness with minimal rename churn.
