# Repository Health Review — 2026-02-11

## Scope and method
- Reviewed project-level setup and architecture docs: `README.md`, `package.json`, and representative standards docs under `docs/doc-engine/standards/`.
- Sampled representative runtime modules across app frame, global header shell, build surface, content drawer, and content resolver subsystems.
- Reviewed existing tests under `test/` and ran lint/build/test checks.

---

## 1) Architecture map

### Subsystems and responsibilities
1. **Application shell / composition root**
   - Files: `src/main.tsx`, `src/App.tsx`, `src/App.logic.ts`.
   - Responsibility: mount the React app, provide top-level frame, theme toggle logic, and root-level providers.
2. **Global header shell**
   - Files: `src/components/GlobalHeaderShell/*`.
   - Responsibility: tab navigation, mode switching, hover/info actions, docs trigger points, responsive behavior, optional debug diagnostics.
3. **Build surface (editor workspace)**
   - Files: `src/tabs/build/*`, `src/tabs/BuildTab.tsx`.
   - Responsibility: primary builder workspace layout, left/center/right panels, drag/resize/collapse interactions, local persistence.
4. **Content drawer + content state**
   - Files: `src/components/ContentDrawer/*`, `src/content/ContentContext.tsx`.
   - Responsibility: global drawer open/close state and rendering of resolved docs content.
5. **Content resolution layer(s)**
   - Files: `src/content/contentProviders.ts`, `src/content/ContentProviderRegistry.ts`, `src/content-drawer/providers/docsProvider.ts`.
   - Responsibility: map namespaced content IDs to payloads.
6. **Knowledge catalogs / static metadata**
   - Files: `src/components/GlobalHeaderShell/GlobalHeaderShell.knowledge.ts`, `src/tabs/build/anchors.ts`, `src/content-drawer/contentTypes.ts`.
   - Responsibility: static tab/mode metadata, docs corpus, anchor contracts, and content schemas.

### Data and control flow (current)
1. `main.tsx` mounts `<App />`.
2. `App` renders `GlobalHeaderShell`, `BuildTab`, and `ContentDrawer` inside `ContentProvider`.
3. `GlobalHeaderShell.logic` controls tab/mode/breakpoint state and can call `openContent(...)` from `ContentContext`.
4. `ContentDrawer` reacts to active content state and resolves payload via `resolveContent(...)` from `contentProviders.ts`.
5. Build workspace logic in `BuildSurface.logic.ts` manages drag/collapse state and persists view state to `localStorage`.

### Key architecture observations (8)
1. **Strong concern-driven decomposition exists at file naming level** (`*.build.tsx`, `*.logic.ts`, `*.knowledge.ts`) and is applied consistently in core modules.
2. **A resolver split-brain exists**: UI currently uses `contentProviders.ts` while a richer registry implementation exists in `ContentProviderRegistry.ts`; this duplicates contracts and parsing logic.
3. **GlobalHeader knowledge module is becoming a mixed “catalog + corpus + schema” hub**, increasing blast radius of changes.
4. **BuildSurface logic is a “god hook”** with section, left-panel, and right-panel mechanics in one file; complexity is concentrated rather than isolated.
5. **Boundary between drawer rendering and resolution is blurry**: `ContentDrawer.tsx` contains both view branching and resolver pipeline invocation.
6. **No circular dependency observed** in sampled runtime code, but upward dependency pressure exists from drawer/content modules into header knowledge constants.
7. **Adapter transition state is visible** (`contentProviders.ts` and `ContentProviderRegistry.ts` both present), indicating architecture migration in-flight.
8. **Conventions and provenance discipline are unusually strong** for an early-stage app, improving maintainability despite module size hotspots.

---

## 2) Code health assessment

### Naming, cohesion, coupling, layering
- **Naming quality: good overall**, especially concern and config labels that map to NL docs.
- **Cohesion concerns:**
  - `GlobalHeaderShell.build.tsx` combines multiple UI primitives and menu variants in a single large file.
  - `BuildSurface.logic.ts` combines independent drag/persist concerns that could be smaller hooks.
- **Coupling concerns:**
  - Drawer and content resolution rely directly on `GlobalHeaderShell.knowledge.ts` docs catalog, coupling feature rendering to header module internals.
- **Layering direction is mostly good** (build components consume logic bindings), but content resolution currently bypasses the canonical registry API.

### Code smell findings
1. **Duplicated resolver patterns** (`resolveContent` adapter vs `ContentProviderRegistry.resolveContent`).
2. **Hidden side effects without diagnostics**: repeated `localStorage` parse/write `try/catch {}` blocks suppress root-cause context.
3. **Overly large “knowledge” surface** in header module (types + constants + full docs content).
4. **Type coercion smell**: repeated `(onMove as unknown as EventListener)` cast patterns.
5. **Inconsistent not-found contracts** (`null`, `kind: 'missing'`, and `type: 'not_found'` all coexist).
6. **Feature placeholders embedded in build structure** (section placeholder catalogs) without an explicit extension seam.

---

## 3) Stability & correctness risk scan

### High-probability/impact risks
1. **Silent persistence failures**
   - Multiple persistence points ignore parse/write failures; corrupted payloads can reset state with no diagnostics.
   - Affected symbols: `useSectionLogic`, `useLeftPanelLogic`, `useRightPanelLogic` in `BuildSurface.logic.ts`.
2. **Event listener typing/cast fragility**
   - Listener add/remove paths rely on repeated cast shims; hard to audit and error-prone during refactors.
   - Affected symbols: `startDrag` / `stopDrag` variants across section/left/right panel logic.
3. **Resolver contract divergence risk**
   - Two resolver APIs with different return contracts can drift and create UI bugs during migration.
   - Affected symbols: `resolveContent(...)` in `contentProviders.ts`, `ContentProviderRegistry.resolveContent(...)`.

### Additional boundary/error-handling notes
- `useInitialDarkPreference` uses `window.matchMedia` with no availability guard in the helper (works in browser runtime, but brittle in non-browser test harnesses).
- `main.tsx` uses non-null assertion on root element; acceptable for Vite default shell but still a hard assumption.
- Drawer anchor scroll logic has no fallback when selector misses target (safe, but silent).

---

## 4) Test strategy and coverage gaps

### Current tested surface
- `splitNamespace` and registry docs resolution basics.
- `clamp` utility behavior.
- `toAnchorId` normalization behavior.

### Highest-risk coverage gaps
- No tests for drag/resize keyboard + pointer flows.
- No tests for localStorage corruption recovery behavior.
- No tests for content drawer branch rendering behavior.
- No tests for header mode/tab state transitions or accessibility announcements.

### Prioritized test backlog (12 items)
1. **Unit:** `useSectionLogic` state restore with malformed JSON + fallback defaults.
2. **Unit:** left panel width clamping against viewport min/max boundaries.
3. **Unit:** right panel collapse/restore remembers previous width correctly.
4. **Unit:** section keyboard resize increments/decrements and collapse threshold behavior.
5. **Integration:** drag lifecycle attaches and detaches global listeners exactly once.
6. **Integration:** content drawer renders unavailable shell when resolver returns `null`.
7. **Integration:** content drawer renders missing shell when provider returns `kind: 'missing'`.
8. **Integration:** content drawer anchor jump executes when valid `activeContentAnchorId` exists.
9. **Unit:** global header tab select/hover/mode select state machine transitions.
10. **Integration:** global header info icon opens docs payload via `openContent` with expected id.
11. **Contract:** parity tests to assert adapter (`contentProviders.ts`) and registry resolve identical docs ids.
12. **Contract:** not-found reason consistency across resolver implementations.

---

## 5) Documentation & developer experience

### Strengths
- README explains stack, scripts, and structure clearly.
- CSCS/CCPP/NL-first conventions are documented and visibly enforced in source comments.

### Gaps
1. **Missing “single source of truth” migration status doc** for resolver architecture (adapter vs registry).
2. **No explicit contribution/testing strategy doc** in root for when to write unit vs integration tests.
3. **No architecture decision log (ADR) index** for key design choices (e.g., why docs content currently lives in header knowledge).
4. **Lint warnings are tolerated but not codified** (there is no policy for warnings-as-errors or accepted warning classes).

---

## 6) Refactoring opportunities (incremental only)

### Refactor A — Converge content resolution on registry
- **Impact:** reduces duplicated contracts and clarifies dependency direction.
- **Risk:** low/medium (API adaptation touchpoints in drawer).
- **Effort:** 0.5–1 day.
- **Safe sequence:**
  1. Add adapter wrapper that calls `contentProviderRegistry.resolveContent` and maps to existing drawer shape.
  2. Switch `ContentDrawer.tsx` to wrapper.
  3. Add parity tests for old/new behavior.
  4. Remove deprecated adapter once callers are migrated.
- **Before API sketch:**
  - `resolveContent(contentId: string): ContentResolution | null`
- **After API sketch:**
  - `resolveDrawerContent({ contentId, anchorId }): DrawerResolution` (internally delegates to registry).

### Refactor B — Extract persistence utilities from BuildSurface.logic
- **Impact:** removes repeated parse/write/catch blocks; improves observability.
- **Risk:** low.
- **Effort:** 1 day.
- **Safe sequence:**
  1. Introduce `safeReadJson` / `safeWriteJson` utility with optional diagnostic callback.
  2. Replace section/left/right storage blocks one by one.
  3. Add unit tests for malformed payload handling.

### Refactor C — Split large hooks by concern
- **Impact:** improves readability and testability.
- **Risk:** medium (binding wiring changes).
- **Effort:** 1–2 days.
- **Safe sequence:**
  1. Move `useSectionLogic` into dedicated module.
  2. Move left/right panel hooks into separate files.
  3. Keep public `useBuildSurfaceLogic` return contract unchanged.

### Refactor D — Isolate docs corpus from header knowledge module
- **Impact:** clearer boundaries and smaller module churn.
- **Risk:** medium.
- **Effort:** 1–2 days.
- **Safe sequence:**
  1. Create `src/content/docs/headerDocs.catalog.ts`.
  2. Re-export existing names from old module for compatibility.
  3. Update imports incrementally.

---

## 7) Top 10 issues (ranked)

1. **High — Resolver duplication and drift risk**
   - Where: `src/content/contentProviders.ts` (`resolveContent`), `src/content/ContentProviderRegistry.ts` (`ContentProviderRegistry.resolveContent`).
   - Rationale: two contracts for same domain increase bug likelihood during extension.
2. **High — BuildSurface logic concentration (“god module”)**
   - Where: `src/tabs/build/BuildSurface.logic.ts` (`useSectionLogic`, `useLeftPanelLogic`, `useRightPanelLogic`, `useBuildSurfaceLogic`).
   - Rationale: high complexity, hard to test in isolation.
3. **High — Silent localStorage error handling**
   - Where: multiple `catch {}` blocks in `BuildSurface.logic.ts`.
   - Rationale: production debugging blind spots and hidden data corruption.
4. **Medium — Listener cast fragility with `unknown as EventListener`**
   - Where: drag handler setup/teardown in `BuildSurface.logic.ts`.
   - Rationale: brittle typing pattern invites regressions.
5. **Medium — Mixed concerns in header knowledge file**
   - Where: `src/components/GlobalHeaderShell/GlobalHeaderShell.knowledge.ts`.
   - Rationale: schema/constants and large docs corpus bundled together.
6. **Medium — Drawer render logic and resolver logic coupled**
   - Where: `src/components/ContentDrawer/ContentDrawer.tsx`.
   - Rationale: component handles both orchestration and rendering branches.
7. **Medium — Inconsistent not-found semantics across content APIs**
   - Where: `null`, `kind: 'missing'`, `type: 'not_found'` across content modules.
   - Rationale: increases caller branching and ambiguity.
8. **Low — Root element non-null assumption**
   - Where: `src/main.tsx` (`document.getElementById('root')!`).
   - Rationale: hard assumption can break nonstandard hosts/tests.
9. **Low — Fast refresh warnings in lint output**
   - Where: `src/components/ContentDrawer/index.tsx`, `src/content/ContentContext.tsx`.
   - Rationale: not blocking, but indicates mixed export patterns.
10. **Low — Placeholder-heavy sections lack explicit extension contracts**
    - Where: `src/tabs/build/BuildSurface.build.tsx` (`SECTION_CONTENT`).
    - Rationale: future implementation may drift without formal interface boundaries.

---

## 8) Roadmap (prioritized)

### Immediate (1–2 days)
1. Add diagnostics-capable persistence helper and replace silent catches in BuildSurface logic.
2. Add contract tests for resolver parity and not-found behavior consistency.
3. Add focused unit tests for right/left panel clamp and restore logic.
4. Document resolver migration target (single source-of-truth) in `doc/`.

### Near-term (1–2 weeks)
1. Converge drawer resolution path onto registry-backed wrapper.
2. Split `BuildSurface.logic.ts` into concern-scoped hook files without API churn.
3. Extract docs corpus to dedicated content catalog module and re-export for compatibility.
4. Add component/integration tests for content drawer branch rendering and anchor jump behavior.

### Longer-term
1. Introduce lightweight ADR index for architecture decisions.
2. Establish CI policy for warning budget and quality gates.
3. Expand integration tests for full header→drawer→content interaction loop.

---

## 9) Quick wins (8)
1. Add `safeReadJson` helper and replace one `catch {}` block as template.
2. Normalize resolver not-found shape with a shared type alias.
3. Add JSDoc note in `contentProviders.ts` marking adapter as transitional.
4. Add explicit `anchorId` passthrough in drawer resolver calls for future-proofing.
5. Extract repeated min/max constants in BuildSurface logic into named constants.
6. Add a tiny `assertRootElement` helper for `main.tsx` to remove `!` assertion.
7. Move non-component exports out of `src/components/ContentDrawer/index.tsx` to clear refresh warning.
8. Add a one-page `doc/TestingStrategy.md` with test pyramid and priorities.

---

## 10) Open questions
1. Is `contentProviders.ts` intended as temporary compatibility shim, or is dual-path resolution a deliberate long-term design?
2. Should docs content live with header knowledge permanently, or should it be owned by a dedicated doc-engine/content domain module?
3. Should lint warnings become build-blocking in CI, or remain informational during current phase?
