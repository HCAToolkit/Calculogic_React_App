# Repository Health Review — 2026-02-14

## Scope and method
- Reviewed architecture/setup docs (`README.md`, `doc/README.md`, `doc/Architecture/ConfigurationArchitectureSummary.md`, `package.json`).
- Sampled representative runtime modules across app shell, header shell, build surface, content context/resolution, and doc-engine provider layers.
- Reviewed automated tests in `test/` and executed `npm test`, `npm run lint`, and `npm run build`.

---

## 1) Architecture map

### Major subsystems
1. **App shell composition**
   - Files: `src/main.tsx`, `src/App.tsx`, `src/App.logic.ts`.
   - Responsibility: app bootstrapping, top-level providers, theme toggle state.
2. **Global header shell**
   - Files: `src/components/GlobalHeaderShell/GlobalHeaderShell.build.tsx`, `GlobalHeaderShell.logic.ts`, `GlobalHeaderShell.knowledge.ts`, results/style peers.
   - Responsibility: concern tab UX, mode selection, responsive behavior, docs launch points.
3. **Build workspace surface**
   - Files: `src/tabs/BuildTab.tsx`, `src/tabs/build/BuildSurface.build.tsx`, `BuildSurface.logic.ts`, `BuildSurface.view.css`, `anchors.ts`.
   - Responsibility: left/center/right panel composition, resize/collapse interactions, persistence.
4. **Drawer state + rendering**
   - Files: `src/content/ContentContext.tsx`, `src/components/ContentDrawer/ContentDrawer.tsx`, `ContentDrawer.anchor.ts`.
   - Responsibility: active content orchestration and docs drawer rendering.
5. **Doc-engine resolver/provider layer**
   - Files: `src/doc-engine/registry.ts`, `providers/docs.provider.ts`, `catalogs/header-docs.catalog.ts`, `src/content/contentEngine.ts`, `src/content/contentResolutionAdapter.ts`.
   - Responsibility: namespace parsing, provider registration, docs catalog lookup, adapter mapping into drawer shape.

### Data/control flow (runtime)
`main.tsx` mounts `App` → `App` wraps shell content with `ContentProvider` → `GlobalHeaderShell.logic` emits open/close drawer intents via context → `ContentDrawer` resolves content and renders doc/missing states → build surface hooks independently manage resize/persist behavior.

### Key architecture observations (9)
1. Concern-based naming and layering are consistently applied across major features (`*.build.tsx`, `*.logic.ts`, `*.knowledge.ts`, `*.results.tsx`).
2. **Current compile path is broken** due contract mismatch between `resolveDrawerContent` output and `ContentDrawer` assumptions.
3. `BuildSurface.logic.ts` is a **god module** (~566 LOC) holding three independent interaction domains (sections, left panel, right panel).
4. LocalStorage IO and pointer listener orchestration are duplicated in multiple hooks.
5. The header logic hook is broad and contains most interaction policy for a complex shell in a single file.
6. The docs content catalog has strong typing, but it is tightly coupled to header semantics through naming/comments.
7. There is no obvious circular import cycle in sampled runtime modules; dependency direction is mostly top-down from app shell to feature logic.
8. Documentation surface is duplicated across `doc/` and `docs/` trees, increasing “source of truth” ambiguity.
9. `src/content-drawer/contentTypes.ts` appears effectively unused by runtime and tests, suggesting stale domain model drift.

---

## 2) Code health assessment

### Naming, cohesion, coupling, layering
- **Naming:** Mostly clear and domain-aligned (`useBuildSurfaceLogic`, `ContentProviderRegistry`, `resolveDrawerContent`).
- **Cohesion concerns:**
  - `useBuildSurfaceLogic` file owns multiple independent responsibilities that could be split with no API change.
  - `ContentDrawer.tsx` mixes rendering branches with resolution policy and anchor-scroll behavior.
- **Coupling concerns:**
  - Drawer rendering is coupled to resolver return contract details rather than a stable normalized view model.
  - Header logic reaches directly into content context API, which is acceptable, but further expansion risks a central orchestrator anti-pattern.
- **Layering:** CSCS-style separation is present, but some files are overgrown enough that boundary clarity is eroding.

### Code smell highlights
1. **Contract drift:** `resolveDrawerContent` returns `{kind: ...}` while `ContentDrawer` expects `{type: ...}` union.
2. **Silent failure pattern:** multiple `catch {}` blocks suppress storage failures in panel logic.
3. **Cast-heavy event listeners:** repeated `as unknown as EventListener` blocks reduce type safety confidence.
4. **Duplicated persistence patterns:** same parse/validate/write logic repeated for sections and side panels.
5. **Ambiguous docs ownership:** both `doc/` and `docs/` include standards packs with overlapping intent.
6. **Potential dead code:** `src/content-drawer/contentTypes.ts` is not referenced by runtime features.

---

## 3) Stability & correctness risk scan

### High-risk findings
1. **Build is currently failing (High).**
   - Where: `src/components/ContentDrawer/ContentDrawer.tsx`, `src/content/contentResolutionAdapter.ts`.
   - Why: incompatible types/properties (`kind` vs `type`, missing `contentProviderRegistry` export path).
2. **Silent persistence and recovery behavior (High).**
   - Where: `useSectionLogic`, `useLeftPanelLogic`, `useRightPanelLogic` in `src/tabs/build/BuildSurface.logic.ts`.
   - Why: swallowed errors hide malformed storage and user-specific breakage.
3. **Complex pointer listener lifecycle in one file (Med/High).**
   - Where: all drag hooks in `BuildSurface.logic.ts`.
   - Why: duplicated add/remove logic increases leak/regression risk when editing.

### Additional risk notes
- **Boundary handling:** parse guards are present for JSON and numeric bounds, which is good baseline safety.
- **Async/race profile:** most logic is synchronous UI state; primary risk is stale global listeners and mutable refs under drag interactions.
- **TODO/FIXME hotspots:** no significant TODO clusters found, which reduces hidden known-debt risk.

---

## 4) Test strategy and coverage gaps

### Current tested surface
- `clamp` utility boundaries.
- `toAnchorId` normalization behavior.
- Namespace parsing and registry provider resolution.

### Not currently tested (high value gaps)
- Drawer rendering branches (content/missing/null).
- Drawer anchor scrolling behavior.
- Build-surface keyboard and pointer resize interactions.
- Persistence recovery from malformed `localStorage` payloads.
- Header state transitions for tab/mode/hover interaction rules.

### Prioritized test backlog (12)
1. **[P0, unit]** `resolveDrawerContent` contract test: ensures returned discriminant/schema matches drawer consumer.
2. **[P0, unit]** `ContentDrawer` missing-state render for unresolved content IDs.
3. **[P0, unit]** `ContentDrawer` docs-state render for valid docs payload (title/sections/links).
4. **[P0, unit]** `contentEngine` singleton registration test (docs namespace is present exactly once).
5. **[P1, unit]** `useSectionLogic` malformed storage recovery (invalid JSON, wrong shape).
6. **[P1, unit]** `useLeftPanelLogic` clamp behavior for keyboard adjustments at min/max bounds.
7. **[P1, unit]** `useRightPanelLogic` collapse/restore behavior preserves previous width.
8. **[P1, integration]** Build surface drag start/stop registers and cleans global listeners.
9. **[P1, integration]** Header `selectTab` / `selectTabMode` transition invariants (hover reset, mode pinning).
10. **[P2, integration]** Header info button triggers `openContent` with expected namespaced doc IDs.
11. **[P2, integration]** Drawer anchor jump effect scrolls when anchor exists and no-ops when absent.
12. **[P2, contract]** Docs provider returns deterministic `not_found` shape and reason text.

---

## 5) Documentation & developer experience

### Strengths
- README clearly describes runtime stack and scripts.
- Convention routines are present and explicit, which helps consistency.

### Gaps
1. **No single “current architecture source of truth.”** `README.md`, `doc/Architecture/*`, and older health checks can diverge.
2. **No explicit troubleshooting section** for common failures (e.g., strict TS build break, env assumptions).
3. **No formal testing strategy doc** that maps test layers to subsystem risk.
4. **Doc tree duplication (`doc/` vs `docs/`)** raises onboarding confusion about canonical location.

---

## 6) Refactoring opportunities (incremental)

### A) Unify drawer resolution contract
- **Impact:** restores build stability and removes consumer/adapter drift.
- **Risk:** Low.
- **Effort:** 0.5 day.
- **Safe sequence:**
  1. Pick one discriminant (`type` _or_ `kind`) and enforce in adapter + consumer.
  2. Add unit test for both success and missing paths.
  3. Remove dead branches and casts in `ContentDrawer.tsx`.
- **API sketch**
  - Before: `resolveDrawerContent(contentId, anchorId?) => {kind:'doc'|'missing'} | null`
  - After: `resolveDrawerContent(request) => {type:'content'|'not_found', ...}` (or invert consumer to `kind`, but one union only).

### B) Extract persistence helpers from BuildSurface logic
- **Impact:** reduces duplication and clarifies error policy.
- **Risk:** Low.
- **Effort:** 1 day.
- **Safe sequence:**
  1. Add `readStoredState`/`writeStoredState` utility with optional logger hook.
  2. Migrate one hook at a time (section → left panel → right panel).
  3. Add targeted unit tests for malformed payload and clamp behavior.

### C) Split `BuildSurface.logic.ts` by concern
- **Impact:** improves readability/testability and lowers regression surface.
- **Risk:** Medium (wiring errors possible).
- **Effort:** 1–2 days.
- **Safe sequence:**
  1. Extract `useSectionLogic`, `useLeftPanelLogic`, `useRightPanelLogic` into separate files.
  2. Keep `useBuildSurfaceLogic` public return shape unchanged.
  3. Move shared constants (`min`, `max`, storage keys) into a small local constants module.

### D) Clarify docs ownership and archive stale types
- **Impact:** better onboarding and reduced cognitive load.
- **Risk:** Low.
- **Effort:** 0.5–1 day.
- **Safe sequence:**
  1. Declare canonical docs path in `doc/README.md`.
  2. Mark mirror docs directory as generated/legacy or remove duplication.
  3. Either wire `src/content-drawer/contentTypes.ts` into runtime contracts or delete after confirming no external dependency.

---

## 7) Top 10 issues (ranked)

1. **High — Type contract mismatch breaks production build**
   - Where: `src/components/ContentDrawer/ContentDrawer.tsx` (`ContentDrawer`), `src/content/contentResolutionAdapter.ts` (`resolveDrawerContent`).
   - Rationale: strict TypeScript compile currently fails.
2. **High — Broken import/export contract in content adapter**
   - Where: `src/content/contentResolutionAdapter.ts` importing `contentProviderRegistry` from `src/content/index.ts`.
   - Rationale: referenced symbol is not exported, causing build error.
3. **High — BuildSurface logic concentration (god module)**
   - Where: `src/tabs/build/BuildSurface.logic.ts`.
   - Rationale: high complexity and duplicated behavior in one file.
4. **Medium — Silent localStorage failure handling**
   - Where: `BuildSurface.logic.ts` `catch {}` blocks.
   - Rationale: hides root causes and degrades production debuggability.
5. **Medium — Duplicated listener lifecycle logic with cast shims**
   - Where: `BuildSurface.logic.ts` drag handlers.
   - Rationale: fragile and easy to regress.
6. **Medium — Content drawer mixes UI + orchestration responsibilities**
   - Where: `src/components/ContentDrawer/ContentDrawer.tsx`.
   - Rationale: harder to unit test and reason about branch behavior.
7. **Medium — Header logic module breadth is large**
   - Where: `src/components/GlobalHeaderShell/GlobalHeaderShell.logic.ts`.
   - Rationale: centralizes many policies that could be separated into smaller hooks/selectors.
8. **Low — Non-null root assertion in app entrypoint**
   - Where: `src/main.tsx`.
   - Rationale: brittle for alternate host/test environments.
9. **Low — Lint warnings about fast-refresh export pattern**
   - Where: `src/components/ContentDrawer/index.tsx`, `src/content/ContentContext.tsx`.
   - Rationale: non-blocking but indicates mixed module responsibilities.
10. **Low — Potentially stale/unused schema module**
    - Where: `src/content-drawer/contentTypes.ts`.
    - Rationale: appears disconnected from active resolver contracts.

---

## 8) Next steps roadmap

### Immediate (1–2 days)
1. Fix drawer/adapter type and import contract to restore `npm run build` health.
2. Add P0 tests for drawer resolution + missing/content rendering branches.
3. Introduce one shared persistence helper and migrate one panel hook as a template.
4. Record canonical documentation path in `doc/README.md`.

### Near-term (1–2 weeks)
1. Split `BuildSurface.logic.ts` into concern-focused hooks with unchanged public API.
2. Add integration tests for drag listener cleanup and keyboard resize behavior.
3. Add header interaction tests for tab/mode state transitions.
4. Resolve doc tree duplication strategy (`doc/` vs `docs/`) and archive stale files.

### Longer-term
1. Add CI quality gate requiring build + lint + tests.
2. Create a short ADR index for architectural pivots (resolver contracts, docs ownership, panel interaction model).
3. Expand contract tests for doc-engine providers as additional namespaces are added.

---

## 9) Quick wins (9)
1. Add `contentProviderRegistry` export from `src/content/index.ts` **or** import directly from `contentEngine.ts` to stop symbol drift.
2. Align `ContentDrawer` to one discriminated union shape (`kind` or `type`) and remove invalid property reads.
3. Import and use `HeaderDocDefinition` explicitly in `ContentDrawer.tsx` (or avoid cast by narrowing union).
4. Replace one `catch {}` with `catch (error)` + dev-only warning helper to improve diagnostics.
5. Hoist repeated min/max constants in build surface logic into named constants.
6. Extract drag listener registration into a small helper to avoid copy/paste lifecycle code.
7. Add a defensive root check helper in `main.tsx` with a clear thrown error message.
8. Move non-component exports out of component index/context files to remove fast-refresh warnings.
9. Add `doc/TestingStrategy.md` with risk-based test priorities mapped to subsystems.

---

## 10) Open questions
1. Should drawer consumers use a doc-engine-native response union (`type`) directly, or should UI-facing adapters keep a dedicated union (`kind`) boundary?
2. Is `docs/` intended to mirror `doc/` permanently, or is one directory legacy?
3. Should localStorage failures be user-silent in production, or surfaced via telemetry/logging hooks?
