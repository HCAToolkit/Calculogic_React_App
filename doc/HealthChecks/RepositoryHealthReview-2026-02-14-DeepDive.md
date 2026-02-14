# Repository Health Review — 2026-02-14 (Deep Dive)

## Scope and method
- Reviewed repository-level setup and conventions: `README.md`, `doc/README.md`, `package.json`, and convention routine docs under `doc/ConventionRoutines/`.
- Sampled representative runtime modules across shell composition, header shell, build surface, content drawer state/rendering, and doc-engine resolver/provider layers.
- Reviewed current tests in `test/` and validated runtime health with `npm test`, `npm run lint`, and `npm run build`.

---

## 1) Architecture map

### Major subsystems and responsibilities
1. **SPA host + app frame composition**
   - Files: `src/main.tsx`, `src/App.tsx`, `src/App.logic.ts`
   - Responsibilities: root mount, app-level composition, dark mode preference state.
2. **Global Header Shell (CSCS split)**
   - Files: `src/components/GlobalHeaderShell/GlobalHeaderShell.build.tsx`, `GlobalHeaderShell.logic.ts`, `GlobalHeaderShell.knowledge.ts`, `GlobalHeaderShell.results.tsx`, plus style peers.
   - Responsibilities: tab/mode UI, responsive breakpoint behavior, content-open triggers, and debug state projection.
3. **Build workspace surface**
   - Files: `src/tabs/build/BuildSurface.build.tsx`, `BuildSurface.logic.ts`, `buildSurfacePersistence.ts`, `anchors.ts`.
   - Responsibilities: three-pane layout composition, section collapse/resize mechanics, and persisted dimensions.
4. **Content Drawer orchestration + rendering**
   - Files: `src/content/ContentContext.tsx`, `src/components/ContentDrawer/ContentDrawer.tsx`, `ContentDrawer.anchor.ts`.
   - Responsibilities: open/close state management and rendering resolved docs payloads.
5. **Doc-engine provider + adapter layer**
   - Files: `src/doc-engine/registry.ts`, `src/doc-engine/providers/docs.provider.ts`, `src/content/contentEngine.ts`, `src/content/contentResolutionAdapter.ts`, `src/doc-engine/catalogs/header-docs.catalog.ts`.
   - Responsibilities: namespace parsing, provider resolution, docs catalog lookup, and UI-facing adapter narrowing.

### Data/control flow
`src/main.tsx` mounts `<App />` → `src/App.tsx` provides `ContentProvider` + shell components → header shell logic opens/closes drawer via context API → content drawer requests payload through `resolveDrawerContent` → adapter delegates to singleton provider registry backed by docs provider/catalog.

### Key architecture observations (9)
1. Concern layering is explicit and generally consistent (Build/Logic/Knowledge/Results files are clearly separated by naming and comments).
2. Dependency direction is mostly healthy: UI components consume logic hooks and knowledge catalogs; resolver logic stays behind adapters.
3. `BuildSurface.logic.ts` is currently the largest concentration of mutable UI mechanics (section resize + side panel resize + persistence), creating a practical “god module” risk.
4. Drag listener lifecycle is duplicated across section/left/right panel hooks, increasing maintenance cost and bug surface.
5. Persistence/parsing code shape is repeated in multiple hooks despite having a shared safety wrapper (`readBuildSurfaceStorage`/`writeBuildSurfaceStorage`).
6. Header shell logic is coherent but broad; it includes breakpoint subscription, tab/mode state machine, and content-context wiring in one file.
7. There are no obvious circular dependency cycles in sampled runtime modules.
8. Documentation has multiple plausible “source of truth” locations (`doc/DocEngine`, `doc/doc-engine`, `docs/doc-engine/standards`) that can confuse onboarding.
9. `src/content-drawer/contentTypes.ts` appears disconnected from active resolver contracts and runtime rendering paths.

---

## 2) Code health assessment

### Naming, cohesion, coupling, layering
- **Naming quality:** generally good and domain-aligned (`useGlobalHeaderShellLogic`, `ContentProviderRegistry`, `resolveDrawerContent`, `toAnchorId`).
- **Cohesion issues:**
  - `useBuildSurfaceLogic` concern file aggregates several independent responsibilities and would benefit from extraction into per-domain hooks.
  - `ContentDrawer.tsx` combines data-resolution branching, anchor scrolling behavior, and large render branches in one component.
- **Coupling issues:**
  - Drawer UI is coupled directly to docs-provider payload shape instead of a local view model contract.
  - Header shell logic directly imports content context actions/state and feature constants, increasing fan-in to one orchestrator.
- **Layering quality:** conventions are followed, but long concern files blur boundaries and make the layering harder to reason about during edits.

### Code smell findings
1. Large hook file with repeated patterns (`BuildSurface.logic.ts`) rather than composable hook units.
2. Repeated listener registration/removal blocks with cast-heavy event typing (`as unknown as EventListener`).
3. Repeated localStorage parse/validate/fallback snippets across section and panel states.
4. Mixed responsibilities in `ContentDrawer.tsx` (resolution policy + rendering + navigation effect).
5. Duplicate/overlapping docs directories (`doc/DocEngine`, `doc/doc-engine`, `docs/doc-engine/standards`).
6. Likely stale type surface (`src/content-drawer/contentTypes.ts`) that does not appear in runtime import paths.

---

## 3) Stability & correctness risk scan

### Highest-risk hotspots
1. **Global event listener lifecycle fragility (High)**
   - Where: `useSectionLogic`, `useLeftPanelLogic`, `useRightPanelLogic` in `src/tabs/build/BuildSurface.logic.ts`.
   - Risk: subtle leaks or stuck dragging states if future edits miss one remove path.
2. **State persistence drift across three implementations (Medium/High)**
   - Where: same file/hook set as above, each with custom parse/fallback logic.
   - Risk: inconsistent recovery behavior and increased odds of one path diverging from expected bounds/shape.
3. **UI branch complexity in content drawer (Medium)**
   - Where: `src/components/ContentDrawer/ContentDrawer.tsx`.
   - Risk: regression-prone when extending new content namespaces/types.

### Boundary handling notes
- Positive: storage reads validate numeric/boolean fields before accepting persisted data.
- Positive: `splitNamespace` enforces namespaced IDs and returns deterministic not_found results when invalid.
- Gap: a few internals depend on window/document assumptions and are only partially guarded (breakpoint logic is SSR-aware; build surface interactions are browser-only but not explicitly isolated).

### Silent failure patterns
- Local storage errors are routed through reporter hooks, which is better than catch-and-ignore, but there is no user-facing degradation strategy beyond fallback values.

### TODO/FIXME scan
- No active `TODO`/`FIXME` hotspots were found in sampled runtime files; debt is structural rather than explicitly tracked.

---

## 4) Test strategy and coverage gaps

### Current test footprint
- Existing unit tests cover:
  - `clamp` and storage helper reporting (`test/build-surface-utils.test.mjs`)
  - namespace parsing and provider registry behavior (`test/content-provider-registry.test.mjs`)
  - anchor-id normalization (`test/content-drawer-anchor.test.mjs`)
- Missing coverage:
  - Header shell interaction state transitions.
  - Drawer rendering branches (not found vs docs content).
  - Drag lifecycle cleanup behavior and keyboard resize semantics.

### Prioritized test backlog (12 items)
1. **P0 unit:** `resolveDrawerContent` returns `null` for unsupported namespace and preserves discriminants for docs.
2. **P0 integration (component):** `ContentDrawer` renders “not found” path for missing docs IDs.
3. **P0 integration (component):** `ContentDrawer` renders sections/workflows/links for valid docs payload.
4. **P0 integration:** `openContent` + `closeContent` context flow updates drawer visibility atomically.
5. **P1 unit:** `useGlobalHeaderShellLogic` `selectTab` behavior resets mode only when expected.
6. **P1 unit:** `useGlobalHeaderShellLogic` `hoverTab` visibility rules for mode menus.
7. **P1 unit/integration:** publish trigger delegates to callback when present and falls back safely when absent.
8. **P1 integration:** build surface keyboard resizing clamps at min/max bounds for left and right panels.
9. **P1 integration:** drag stop always removes mouse/touch listeners when unmounting during drag.
10. **P2 unit:** section state persistence round-trip for valid JSON and malformed payload fallback.
11. **P2 contract test:** docs provider returns deterministic `not_found` contract for unknown IDs.
12. **P2 snapshot/regression:** global header build concern emits stable anchor and ARIA attributes for key controls.

---

## 5) Documentation & developer experience

### What works
- Top-level `README.md` contains clear setup/scripts and architectural intent.
- `package.json` scripts are straightforward and healthy (dev/build/lint/test).
- Convention routine docs are present and explicit.

### Gaps and friction
1. `doc/README.md` links multiple doc-engine directories without declaring canonical ownership.
2. No single testing strategy doc maps high-risk modules to expected test types.
3. No ADR index capturing architecture decisions already encoded in comments/conventions.
4. Root mount in `src/main.tsx` uses non-null assertion without explicit fallback error messaging for alternate hosts.

---

## 6) Refactoring opportunities (incremental, low-churn)

### Refactor A — Extract build-surface drag mechanics into reusable helper hooks
- **Impact:** reduces duplication and listener lifecycle risk.
- **Risk:** Medium.
- **Effort:** 1–2 days.
- **Safe sequence:**
  1. Extract shared drag registration/cleanup helper (`usePointerDrag`).
  2. Migrate one hook (`useLeftPanelLogic`) first behind unchanged return contract.
  3. Migrate section/right panel hooks after tests pass.

### Refactor B — Normalize drawer view model at adapter boundary
- **Impact:** decouples `ContentDrawer.tsx` from provider internals and simplifies rendering branches.
- **Risk:** Low/Medium.
- **Effort:** 1 day.
- **Safe sequence:**
  1. Introduce `DrawerViewModel` union in `contentResolutionAdapter.ts`.
  2. Map docs `content/not_found` to explicit VM variants.
  3. Update `ContentDrawer.tsx` to render against VM only.

#### Before API sketch
```ts
export function resolveDrawerContent(contentId: string, anchorId?: string): DrawerContentResolution | null
```

#### After API sketch
```ts
type DrawerViewModel =
  | { kind: 'hidden' }
  | { kind: 'not_found'; label: string; reason: string }
  | { kind: 'doc'; doc: HeaderDocDefinition; anchorId?: string };

export function resolveDrawerViewModel(contentId: string, anchorId?: string): DrawerViewModel
```

### Refactor C — Split header logic selectors from mutation handlers
- **Impact:** makes `GlobalHeaderShell.logic.ts` easier to evolve/test.
- **Risk:** Low.
- **Effort:** 1–2 days.
- **Safe sequence:**
  1. Extract pure selector helpers (`deriveViewportFlags`, `deriveTabOrder`).
  2. Keep existing hook API unchanged.
  3. Add focused tests for extracted pure selectors first.

### Refactor D — Consolidate docs ownership
- **Impact:** improves onboarding and reduces stale-doc drift.
- **Risk:** Low.
- **Effort:** 0.5–1 day.
- **Safe sequence:**
  1. Declare canonical docs path in `doc/README.md`.
  2. Mark secondary directories as mirror/legacy.
  3. Remove duplication only after link audits.

---

## 7) Top 10 issues (ranked)

1. **High — Build surface logic concentration (god module)**
   - Where: `src/tabs/build/BuildSurface.logic.ts` (`useBuildSurfaceLogic`, `useSectionLogic`, `useLeftPanelLogic`, `useRightPanelLogic`).
   - Rationale: high complexity and duplicated mutable interaction code.
2. **High — Duplicated global listener management in drag flows**
   - Where: same file/hooks.
   - Rationale: multiple manual add/remove paths are fragile under future edits.
3. **Medium/High — Persistence/parsing logic repeated across hooks**
   - Where: same file/hooks and `buildSurfacePersistence.ts` callsites.
   - Rationale: inconsistent behavior risk and maintenance overhead.
4. **Medium — Content drawer has mixed UI/orchestration responsibilities**
   - Where: `src/components/ContentDrawer/ContentDrawer.tsx` (`ContentDrawer`).
   - Rationale: harder to extend to new namespaces/types safely.
5. **Medium — Header logic hook has broad responsibility surface**
   - Where: `src/components/GlobalHeaderShell/GlobalHeaderShell.logic.ts` (`useGlobalHeaderShellLogic`).
   - Rationale: one module owns many policies and external dependencies.
6. **Medium — Critical interaction states under-tested**
   - Where: build surface drag/keyboard flows and header tab/mode transitions.
   - Rationale: highest user-facing behavior has sparse automated checks.
7. **Low/Medium — Canonical doc source is ambiguous**
   - Where: `doc/README.md` links both `doc/DocEngine`, `doc/doc-engine`, and `docs/doc-engine/standards`.
   - Rationale: onboarding and maintenance confusion.
8. **Low — Potential stale type module**
   - Where: `src/content-drawer/contentTypes.ts`.
   - Rationale: not obviously used by runtime contracts.
9. **Low — Root mount uses non-null assertion**
   - Where: `src/main.tsx` (`createRoot(document.getElementById('root')!)`).
   - Rationale: brittle under alternate test/host contexts.
10. **Low — Component barrel exports can trigger fast-refresh caution patterns**
   - Where: `src/components/ContentDrawer/index.tsx`, `src/content/index.ts`.
   - Rationale: minor DX warning potential when mixing component and non-component exports.

---

## 8) Next steps roadmap

### Immediate (1–2 days)
1. Add P0 tests for content drawer rendering and adapter contracts.
2. Extract one shared drag/listener helper and migrate a single panel hook as proof point.
3. Document canonical docs ownership in `doc/README.md`.
4. Add a root-anchor guard utility in `src/main.tsx` (small defensive hardening).

### Near-term (1–2 weeks)
1. Split `BuildSurface.logic.ts` into concern-specific hooks while preserving public API.
2. Introduce drawer view model adapter to reduce UI coupling.
3. Add header logic state-transition unit tests.
4. Add integration tests for drag cleanup and keyboard resizing.

### Longer-term
1. Add CI gate that enforces lint/build/test per PR.
2. Decide fate of `src/content-drawer/contentTypes.ts` (adopt or remove).
3. Add ADR index for resolver contracts, docs ownership, and interaction model decisions.

---

## 9) Quick wins (8)
1. Add a one-line canonical docs declaration in `doc/README.md`.
2. Add `resolveDrawerContent` unit tests for unsupported namespaces and anchor passthrough.
3. Pull repeated min/max numbers in `BuildSurface.logic.ts` into named constants.
4. Introduce a tiny `assertRootElement` helper for `src/main.tsx`.
5. Extract `sectionTitle` tests to lock user-visible labels.
6. Add dev-only warning report when persistence recovery fallback path is used.
7. Introduce `type DragAxis = 'x' | 'y'` for drag helper readability.
8. Add a “high-risk paths” checklist section in `README.md` for contributor focus.

---

## 10) Open questions (short)
1. Should `src/content-drawer/contentTypes.ts` become the canonical drawer payload contract, or should it be removed?
2. Which doc-engine directory is canonical for active engineering work: `doc/DocEngine` or `doc/doc-engine`?
3. Are header mode-menu behaviors expected to be keyboard-navigable beyond current click/hover semantics?
