# Build Surface Global Host Draft Inventory Plan

## Document Status

- **Document Type:** Architecture Planning + Draft Inventory
- **Status:** Draft (Docs-First Refactor Prep)
- **Purpose:** Define a provisional file inventory and naming alignment for normalizing Build Surface into a global host surface.
- **Scope:** Planning + naming alignment only (no `src/` implementation changes in this pass).
- **Related Docs:**
  - `doc/Architecture/BuildSurfaceGlobalHostSequencePlan.md`
  - `doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
  - `doc/ConventionRoutines/CSCS.md`
  - `doc/ConventionRoutines/General-NL-Skeletons.md`
  - `doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md`

## Purpose

This document is a bridge between architecture direction and practical refactor execution.

It captures:

1. a draft file inventory for separating stable global host shell responsibilities from tab-specific population seams, and
2. naming alignment guidance that stays within the existing canonical filename grammar (`<semantic-name>.<role>.<ext>`) and role registry.

This is intentionally provisional so implementation can proceed in reviewable slices without mass rename churn.

## Architecture Direction Summary

Build Surface is being normalized into a **global host surface** (header-like shell behavior) rather than remaining Build-tab-bound.

The architecture split is:

- **Global host shell (stable/tab-agnostic):** owns panel/canvas shell behavior and host-level orchestration.
- **Tab population seams (variable/tab-dependent):** primarily determine what the left panel inner panels show for each active tab.

This split is expected to reduce churn by keeping shell behavior stable while enabling tab/provider evolution independently.

## Responsibility Buckets

### 1) Global Host Bucket (stable / tab-agnostic)

- panel shell layout and orchestration
- panel resize/collapse interactions
- persistence contracts + persistence behavior
- host-level breakpoint logic and theme knowledge handling
- shared canvas shell behavior
- host-level wiring across left/canvas/right zones

### 2) Tab Population Bucket (variable / tab-dependent)

- left-panel inner panel content population
- tab-specific source catalogs/items/labels
- tab-targeted adapters/wiring that feed the global host

### 3) Shared Support Bucket (cross-bucket contracts/wiring)

- contracts that define tab-provider inputs/outputs for host consumption
- thin wiring modules coordinating host and tab-provider seams

## Draft File Inventory Table

| Semantic Target | Proposed Filename | Role | Responsibility Summary | Bucket | Parent Host / Scope | Replaces / Extracted From (Draft) | Status | Notes / Naming Rationale |
|---|---|---|---|---|---|---|---|---|
| Build Surface global host root | `buildsurface.host.tsx` | host | Own global host shell composition, panel frame, and host-level orchestration boundaries. | Global Host | Root global host surface | Extract shell composition concerns from `src/tabs/build/BuildSurface.build.tsx`. | planned | Keeps existing `buildsurface` semantic target while role becomes explicit host.
| Left panel shell host | `leftpanel.host.tsx` | host | Own left panel host frame, section slots, collapse affordances, anchor map for injected tab sections. | Global Host | `buildsurface.host.tsx` child | Extract generic left-panel shell regions from Build tab composition. | planned | Left panel shell should be tab-agnostic; tab content provided separately.
| Canvas shell host | `canvas.host.tsx` | host | Own center canvas shell frame, viewport wrappers, and shared shell-level canvas controls. | Global Host | `buildsurface.host.tsx` child | Extract canvas shell concerns from Build surface structure. | draft | `canvas` remains semantic target; no new role needed.
| Right panel shell host | `rightpanel.host.tsx` | host | Own right panel shell frame and inspector-slot orchestration independent of active tab source catalogs. | Global Host | `buildsurface.host.tsx` child | Extract generic right panel shell concerns from Build tab layout. | draft | Mirrors left/canvas host split for symmetry.
| Build surface persistence contract | `buildsurface-persistence.contracts.ts` | contracts | Define persistence payload contracts/versioning for host-level panel state. | Global Host | Host persistence support | Align from existing `src/tabs/build/buildSurfacePersistence.contracts.ts`. | planned | Canonical dot role form; same semantic scope.
| Build surface persistence logic | `buildsurface-persistence.logic.ts` | logic | Implement parse/serialize persistence behaviors for host shell state. | Global Host | Host persistence support | Align from existing `src/tabs/build/buildSurfacePersistence.ts`. | planned | Clarifies logic role; avoids overloaded legacy filename.
| Build surface breakpoint logic | `buildsurface-breakpoint.logic.ts` | logic | Encapsulate breakpoint/preview host behavior used by shell orchestration. | Global Host | Host responsiveness support | Extract from current Build surface logic modules as split proceeds. | draft | `breakpoint` is semantic-name descriptor (not role).
| Build surface theme knowledge | `buildsurface-theme.knowledge.ts` | knowledge | Host-level theme references/tokens/metadata consumed by host concerns. | Global Host | Host theming support | Extract from mixed host logic/style references where needed. | draft | `theme` stays semantic-name descriptor (not role).
| Global host wiring seam | `buildsurface-host.wiring.ts` | wiring | Coordinate host shell with tab-provider APIs and shared contracts. | Shared Support | Root host integration seam | New seam introduced during host/tab split. | draft | Uses existing `wiring` role for integration glue.
| Left panel tab-provider contracts | `leftpanel-tab-provider.contracts.ts` | contracts | Define shape of tab-provided left-panel sections/items for host consumption. | Shared Support | Left panel provider seam | New contract introduced for provider consistency. | planned | Keeps provider language in semantic-name; role remains canonical.
| Build tab left sources wiring | `leftpanel-build-sources.wiring.ts` | wiring | Map Build-tab sources into left-panel provider contract. | Tab Population | Build tab provider implementation | Extract Build-specific source mapping from Build tab logic/composition. | planned | Tab dependence localized to source wiring.
| Logic tab left sources wiring | `leftpanel-logic-sources.wiring.ts` | wiring | Map Logic-tab sources into left-panel provider contract. | Tab Population | Logic tab provider implementation | Future provider addition. | deferred | Deferred until logic-tab source scope is finalized.
| Knowledge tab left sources wiring | `leftpanel-knowledge-sources.wiring.ts` | wiring | Map Knowledge-tab sources into left-panel provider contract. | Tab Population | Knowledge tab provider implementation | Future provider addition. | deferred | Deferred while plugin shape remains draft.
| Results tab left sources wiring | `leftpanel-results-sources.wiring.ts` | wiring | Map Results-tab sources into left-panel provider contract. | Tab Population | Results tab provider implementation | Future provider addition. | deferred | Deferred to avoid premature provider sprawl.

## Naming Decisions / Conventions for This Refactor

1. **No role policy expansion in this pass.**
   - Use existing roles only: `host`, `wiring`, `contracts`, `build`, `build-style`, `logic`, `knowledge`, `results`, `results-style`.
   - This document adds examples and refactor-direction guidance only.

2. **`breakpoint` and `theme` remain semantic-name descriptors.**
   - Use forms such as `buildsurface-breakpoint.logic.ts` and `buildsurface-theme.knowledge.ts`.
   - Do not treat `breakpoint`/`theme` as roles unless later change control explicitly promotes them.

3. **Nested UI concepts stay in semantic-name segments.**
   - Use semantic segments like `leftpanel-*`, `buildsurface-*`, `canvas-*`, `rightpanel-*`.
   - Keep dot suffix reserved for canonical role placement.

4. **Host/tab seam naming guidance.**
   - Host shell files should use `*.host.*` when the module owns composition orchestration.
   - Tab population bridges should use `*.wiring.*` and/or `*.contracts.*` depending on responsibility.

5. **Incremental adoption stays active.**
   - Legacy filenames remain allowed until touched by refactor/split work.
   - Rename only where a real extraction/split is being performed.

## Deferred Decisions / Open Questions

1. **Global root semantic target finalization**
   - Keep `buildsurface` for this draft.
   - Potential future rename to a broader semantic target is deferred.

2. **Final tab-provider naming pattern**
   - Current draft uses `leftpanel-<tab>-sources.wiring.ts`.
   - Whether provider naming should converge on `leftpanel-<tab>-provider.*` is deferred.

3. **Future role promotion evaluation**
   - Repeated patterns around selectors/adapters may justify role promotion later.
   - This pass explicitly defers any role-registry expansion.

## Adoption / Implementation Guidance (Draft)

1. Start with docs-first planning (this inventory + naming examples), then apply implementation in small PR slices.
2. Rename/split only when corresponding refactor work lands; avoid mass canonicalization unrelated to active change scope.
3. Keep PRs reviewable by separating:
   - host extraction,
   - persistence extraction,
   - tab-provider wiring introduction,
   - optional follow-up tab-provider expansion.
4. During implementation, keep NL and CCPP alignment for any changed shell/config concern files.

## Repo-Reality Constraints (Observed in Current Tree)

- Current Build Surface files use mixed legacy/canonical naming forms, including PascalCase concern files and a persistence file without role suffix (`src/tabs/build/buildSurfacePersistence.ts`).
- Existing naming policy allows this as legacy state under incremental adoption.
- The draft inventory therefore favors **forward canonical targets** without requiring immediate rename of untouched files.
