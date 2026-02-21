# Repository Health Review — 2026-02-21

## Scope and method
- Reviewed architecture, representative runtime modules, tests, and docs across app frame, global header shell, build surface, content drawer, and doc-engine resolver paths.
- Validated current stability baseline by running `npm run test`, `npm run lint`, and `npm run build`.

---

## 1) Architecture map

### High-level subsystem map
- **App shell composition** (`src/App.tsx`, `src/App.logic.ts`, `src/main.tsx`)
  - Responsibility: top-level mounting, theme state, and shell composition.
  - Flow: `App` wraps runtime in `ContentProvider`, renders `GlobalHeaderShell`, `BuildTab`, `ContentDrawer`.
- **Global header shell (CSCS-separated concerns)** (`src/components/GlobalHeaderShell/*.tsx|*.ts|*.css`)
  - Responsibility: tab/mode UI, publish action, viewport breakpoint state, debug results panel.
  - Flow: build/results structure consumes bindings from `useGlobalHeaderShellLogic`; knowledge defines catalog defaults.
- **Build surface workspace** (`src/tabs/build/BuildSurface.build.tsx`, `BuildSurface.logic.ts`, `buildSurfacePersistence*.ts`)
  - Responsibility: panel layout, section collapse/resize, left/right panel persistence.
  - Flow: logic computes bindings -> build renders anchored structure -> persistence contracts/storage adapters serialize/hydrate local state.
- **Content drawer + state context** (`src/content/ContentContext.tsx`, `src/components/ContentDrawer/*`, `src/content/contentResolutionAdapter.ts`)
  - Responsibility: open/close content, resolve and render docs payloads, section anchor jumps.
  - Flow: header actions call context `openContent` -> drawer adapter resolves via provider registry -> drawer renders by resolution type.
- **Doc-engine registry and providers** (`src/doc-engine/*`, `src/content/contentEngine.ts`, `src/content/providers/docs.provider.ts`)
  - Responsibility: namespace-based content provider registration and resolution contracts.
  - Flow: singleton registry registers docs provider; parser splits `namespace:id`; provider returns typed union result.
- **Shared interaction primitives** (`src/shared/interaction/pointerDrag.ts`, `usePointerDrag.ts`)
  - Responsibility: pointer drag event lifecycle and selection suppression utility used by resize logic.

### 8 key architecture observations
1. **Concern layering is mostly disciplined** in UI modules (Build/Logic/Knowledge/Results split), especially in `GlobalHeaderShell` and `BuildSurface` files.
2. **God-module pressure is concentrated in `BuildSurface.logic.ts`** (resizing, keyboard controls, storage hydration, serialization, ARIA props, and state transitions in one file).
3. **Secondary god-module pressure exists in `GlobalHeaderShell.logic.ts`** (breakpoint subscription + tab/mode state machine + drawer integration + debug binding assembly).
4. **Dependency direction is mostly healthy** (UI concerns consume `content`/`doc-engine` abstractions rather than the reverse).
5. **A transitional boundary leak is explicitly acknowledged** in docs (`README` roadmap notes adapter convergence still pending).
6. **No circular imports were observed** in sampled runtime paths; current module graph appears acyclic at subsystem level.
7. **Duplication risk exists in fallback rendering branches** inside `ContentDrawer.tsx` (similar shell/header blocks repeated for invalid/missing/unsupported outcomes).
8. **Barrel discipline is intentional but unevenly enforced** (`src/content/index.ts` avoids exporting registry singleton, but some modules still import directly from concrete adapter locations).

---

## 2) Code health assessment

### Naming, cohesion, coupling, layering
- **Strong:** explicit naming and typed contracts in resolver/persistence code (`ContentProviderRegistry`, `parseContentRef`, `parseSectionStatePayload`, `serialize*`).
- **Mixed:** view-model hooks expose large binding shapes (high convenience, lower discoverability), especially in `useGlobalHeaderShellLogic` and `useBuildSurfaceLogic`.
- **Coupling hotspots:**
  - `BuildSurface.logic.ts` couples UI semantics (ARIA labels/titles), persistence keys, drag behavior, and section domain constants.
  - `ContentDrawer.tsx` couples resolution-state branching, in-drawer navigation, and docs payload rendering in one component.
- **Layering:** generally follows CSCS direction, but there is still **adapter glue** in `src/content/contentResolutionAdapter.ts` doing policy conversion that may belong in a dedicated resolver domain module.

### Code-smell scan (representative)
- **Overly broad modules:** `BuildSurface.logic.ts`, `GlobalHeaderShell.logic.ts`.
- **Hidden side-effect patterns:** controlled `try/catch` without surfaced diagnostics in low-level pointer/persistence helpers (intentional in places, but weak for production observability).
- **Duplicated rendering pattern:** repeated drawer shell/header markup across non-happy-path branches in `ContentDrawer.tsx`.
- **Inconsistent convention pressure:** some files remain highly annotated per CCPP, while smaller glue files rely on terse inline notes only.

---

## 3) Stability & correctness risk scan

### Primary risks
1. **Browser-only assumptions in theme initialization** (`useInitialDarkPreference` uses `window.matchMedia` directly): safe in current CSR runtime but fragile for future SSR/test environments.
2. **Large interactive state machines without focused tests** in header/build logic increase regression risk for keyboard/drag/breakpoint edge cases.
3. **Persistence fallback is resilient but not externally observable** by default (errors are swallowed/reported only via callback wiring), making production diagnosis harder.
4. **Anchor navigation assumptions** in drawer (`data-content-anchor` + generated ids) are deterministic but only lightly tested (`toAnchorId` unit tests cover small cases).
5. **Unsupported namespace handling is duplicated conceptually** (`no_provider` -> `unsupported_namespace` mapping) and may drift from resolver contract intent.

### Boundary-handling notes
- Good: parser contracts in `doc-engine/registry.ts` handle malformed `contentId` robustly.
- Good: persistence contract parsers apply versioned fallback defaults.
- Gap: interactive UI branches (collapse/drag keyboard handling, content drawer scroll-to-anchor behavior) lack direct integration tests.

### Silent-failure patterns
- `catch {}` in pointer capture flows (`usePointerDrag.ts`) is defensible for browser quirks but should include optional diagnostics hook in dev mode.
- Storage read/write wrappers are safer than raw calls, but runtime telemetry is optional and not standardized app-wide.

---

## 4) Test strategy and coverage gaps

### Current state
- Existing unit tests cover:
  - build-surface clamp + persistence adapters/contracts (`test/build-surface-utils.test.mjs`)
  - provider registry parse/resolve behavior (`test/content-provider-registry.test.mjs`)
  - anchor normalization helper (`test/content-drawer-anchor.test.mjs`)
- Missing:
  - component interaction tests (header tab/mode behavior, drawer open/close UX, resize keyboard/pointer lifecycle)
  - integration tests across context + resolver + drawer rendering
  - negative-path tests for browser API variance (pointer capture failure, storage disabled, matchMedia unavailability)

### Prioritized test backlog (12 items)
1. **[High][Integration]** `App` + `ContentProvider` + `GlobalHeaderShell`: clicking tab info icon opens drawer with docs payload.
2. **[High][Integration]** `ContentDrawer`: invalid ref (`abc`) renders invalid-content state and close action resets context.
3. **[High][Integration]** `ContentDrawer`: `unsupported_namespace` mapping from adapter renders deterministic unsupported state.
4. **[High][Unit]** `useBuildSurfaceLogic` keyboard resize handlers clamp correctly at min/max boundaries.
5. **[High][Unit]** `useBuildSurfaceLogic` section collapse/expand preserves previous height restore behavior.
6. **[Med][Unit]** `useGlobalHeaderShellLogic` breakpoint updates are idempotent when resize remains in same bucket.
7. **[Med][Unit]** `useGlobalHeaderShellLogic` mode menu visibility transitions on tab switch/hover are deterministic.
8. **[Med][Contract]** docs provider contract: every `HeaderDocId` resolves to `found` with required fields.
9. **[Med][Unit]** `toAnchorId` edge cases: non-Latin input, repeated punctuation, empty headings.
10. **[Med][Integration]** drawer anchor deep-link behavior: `anchorId` scroll target found/not-found branches.
11. **[Low][Unit]** `useAppFrameLogic` fallback when `matchMedia` is unavailable.
12. **[Low][Integration]** verify lint warning hotspots do not break fast-refresh expectations after future refactors.

---

## 5) Documentation & developer experience

### What is good
- README is clear on scripts and structure.
- Convention docs are explicit (CSCS/CCPP/NL-first), which reduces ambiguity for contributors.
- Historical health-check docs exist and provide continuity.

### Gaps
1. **No single “source of truth” runtime architecture doc** showing actual current module boundaries and ownership (there are multiple partial docs).
2. **Onboarding lacks “first debugging path”** (where to start for header/build/drawer bugs).
3. **Testing strategy doc is missing** (what to unit test vs integration test, and which tools are approved next).
4. **Lint warning policy is unclear** (warnings currently tolerated; no threshold/gating guidance).

---

## 6) Refactoring opportunities (incremental, low-churn)

### Refactor A — Split `BuildSurface.logic.ts` into focused hooks
- **Impact:** high maintainability gain; easier targeted tests.
- **Risk:** medium (behavioral drift in resize/collapse interactions).
- **Effort:** 2–4 days.
- **Safe sequence:**
  1. Extract pure helpers (`sectionTitle`, clamps, key-step constants) into `BuildSurface.logic.helpers.ts`.
  2. Extract `useSectionLogic` into `BuildSurface.logic.sections.ts` with unchanged public binding type.
  3. Extract panel-level hooks (`useLeftPanelLogic`, `useRightPanelLogic`) and keep `useBuildSurfaceLogic` as façade.
  4. Add unit tests per extracted hook before any behavior changes.
- **API sketch:**
  - Before: `useBuildSurfaceLogic(): BuildSurfaceBindings`
  - After (internal only):
    - `useSectionBindings(opts): SectionLogicBinding`
    - `usePanelBindings(opts): { leftPanel, rightPanel }`
    - `useBuildSurfaceLogic()` remains stable.

### Refactor B — Introduce `DrawerShell` presentational component
- **Impact:** medium clarity gain; removes duplicated non-happy-path markup.
- **Risk:** low.
- **Effort:** 0.5–1 day.
- **Safe sequence:**
  1. Add `DrawerShell({title, summary, children})` in `components/ContentDrawer`.
  2. Migrate invalid/missing/unsupported branches first.
  3. Migrate found/docs branch last with snapshot/integration check.
- **API sketch:**
  - Before: repeated `<aside><div className="content-drawer__header">...</div>...</aside>`.
  - After: `<DrawerShell title="..." summary="...">...</DrawerShell>`.

### Refactor C — Standardize recoverable error reporting hook
- **Impact:** medium stability/diagnostic gain.
- **Risk:** low.
- **Effort:** 1 day.
- **Safe sequence:**
  1. Add `reportRecoverableUiError(scope, error, meta)` utility (dev-only console + optional callback).
  2. Wire in `buildSurfacePersistence.ts` and `usePointerDrag.ts` catch blocks.
  3. Keep behavior non-throwing; tests assert reporter invocation.

---

## 7) Top 10 issues (ranked)

1. **[High] Build-surface logic concentration** — `src/tabs/build/BuildSurface.logic.ts` (`useBuildSurfaceLogic`, `useSectionLogic`): too many responsibilities in one module.
2. **[High] Limited interaction/integration tests for critical UI flows** — header/drawer/resize workflows mostly untested beyond pure utilities.
3. **[High] Header logic complexity** — `src/components/GlobalHeaderShell/GlobalHeaderShell.logic.ts` (`useGlobalHeaderShellLogic`) combines multiple domains.
4. **[Med] Drawer branch duplication** — `src/components/ContentDrawer/ContentDrawer.tsx` repeats shell/header structures.
5. **[Med] Recoverable error observability is inconsistent** — `src/shared/interaction/usePointerDrag.ts`, `src/tabs/build/buildSurfacePersistence.ts`.
6. **[Med] Transitional adapter policy location is unclear** — `src/content/contentResolutionAdapter.ts` owns namespace support policy.
7. **[Med] Lint warnings remain unresolved** — `src/components/ContentDrawer/index.tsx`, `src/content/ContentContext.tsx` (`react-refresh/only-export-components`).
8. **[Low] SSR/test-environment brittleness risk** — `src/App.logic.ts` `window.matchMedia` assumption.
9. **[Low] Architecture docs are fragmented** — multiple docs, no concise up-to-date runtime ownership map.
10. **[Low] Missing explicit engineering conventions for testing levels** — no local test strategy source-of-truth doc.

---

## 8) Next steps roadmap

### Immediate (1–2 days)
1. Add focused integration tests for header info-icon → drawer open and drawer close flows.
2. Resolve current lint warnings by moving non-component exports out of component files.
3. Extract a tiny `DrawerShell` to remove duplicated error-state markup.
4. Add a short `doc/Architecture/Runtime-Ownership-Map.md` describing current subsystem ownership.

### Near-term (1–2 weeks)
1. Incrementally split `BuildSurface.logic.ts` into section/panel helper hooks.
2. Add unit tests around build-surface keyboard and collapse restoration behavior.
3. Add unit tests around `useGlobalHeaderShellLogic` breakpoint and mode-menu transitions.
4. Introduce standardized recoverable error reporter in persistence + pointer drag layers.

### Longer-term
1. Add React component test stack (e.g., Testing Library + Vitest/Jest) for interaction-heavy concerns.
2. Consider feature-sliced folders for header/build drawer logic if module count grows.
3. Add CI gates with fail-on-warning policy decision (or explicit warning allowlist).

---

## 9) Quick wins (small, high-clarity)
1. Move any non-component exports out of `ContentContext.tsx`/`ContentDrawer/index.tsx` to clear react-refresh warnings.
2. Add JSDoc/TSDoc summaries for exported hooks in `GlobalHeaderShell.logic.ts` and `BuildSurface.logic.ts`.
3. Create shared drawer status copy map (invalid/missing/unsupported) to centralize message wording.
4. Add one integration test for `resolveDrawerContent('docs:...')` through rendered drawer UI.
5. Add `matchMedia` fallback guard in `useInitialDarkPreference`.
6. Add `data-testid` hooks for drawer header/title to stabilize integration tests.
7. Co-locate storage key constants in one file for build-surface persistence.
8. Add a one-page test strategy doc in `doc/Testing/Strategy.md`.

---

## 10) Open questions
1. Is the current tolerance for lint warnings intentional, or should warnings be treated as failing quality gates?
2. Should non-`docs` namespaces eventually render in the same drawer, or route to namespace-specific surfaces?
3. Is SSR a planned target for this app shell, or should browser-only assumptions remain acceptable?
4. Is `BuildSurface` expected to become plugin-extensible (which would favor earlier extraction of section/panel domain APIs)?
