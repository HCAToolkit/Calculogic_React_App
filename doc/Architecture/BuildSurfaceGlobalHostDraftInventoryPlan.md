# Build Surface Global Host Draft Inventory Plan

## Document Status
> Terminology note: in this architecture/playbook context, `host` refers to the `ui_host_surface` concept (UI composition shell) and `host_owner` boundary assignments where stated, not the `address_host` namespace token semantics used by structural addressing grammar. See `doc/ConventionRoutines/TerminologyScoping-Conventions-V1.md`.


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
  - `doc/ConventionRoutines/StatusVocabularyRegistry-V1.md`

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

## Current-State Build Surface Snapshot (Observed)

This snapshot is an observational planning aid for reconciliation; it may lag repo reality if this section is not refreshed after major extraction slices land.

- **Snapshot Basis Commit/PR:** Post-Phase-1 baseline (PR #108)
- **Snapshot Freshness:** observational (stale-allowed)
- **Use For:** planning/reconciliation, not canonical repo truth

Repo reality may diverge after the snapshot basis and should be rechecked before using this inventory as current-state evidence.

> Post-Phase-1 status note (PR #108): current repo reality includes preview breakpoint controls/header chrome in `BuildSurface.build.tsx`, preview breakpoint state/bindings in `BuildSurface.logic.ts`, and dark-theme parity selectors across host-surface regions in `BuildSurface.view.css`; this was a host-stability behavior pass, not a host/global extraction slice.

| Current File / Surface | Current Role / Shape | Current Responsibility (Observed) | Likely Draft Inventory Target(s) | Notes |
|---|---|---|---|---|
| `src/tabs/build/BuildSurface.build.tsx` | Legacy-heavy / mixed host+tab composition | Owns structural shell composition for left catalog, canvas, and right inspector zones plus section panel framing. | `buildsurface.host.tsx`, `leftpanel.host.tsx`, `canvas.host.tsx`, `rightpanel.host.tsx` | Currently overloaded as a single Build-tab composition surface; expected to drain into global host shell + seams. |
| `src/tabs/build/BuildSurface.logic.ts` | Mixed canonical concern file with both shell and tab coupling | Owns Build surface orchestration bindings, section ordering/state, resize/collapse interaction behavior, and anchor-facing bindings. | `buildsurface.host.tsx`, `buildsurface-breakpoint.logic.ts`, `buildsurface-host.wiring.ts`, `leftpanel-build-sources.wiring.ts` | Likely split by semantic-slice extraction to isolate tab-agnostic host behavior from tab population seam behavior. |
| `src/tabs/build/buildSurfacePersistence.ts` | Legacy filename (no role suffix) | Implements parse/serialize and migration helpers for persisted panel/section/right-panel state. | `buildsurface-persistence.logic.ts` | Canonicalization target already identified; naming alignment remains incremental. |
| `src/tabs/build/buildSurfacePersistence.contracts.ts` | Near-canonical contracts module | Defines persistence payload contracts, versioning constants, and parse-result types. | `buildsurface-persistence.contracts.ts` | Primarily naming normalization + ownership alignment into host persistence support bucket. |
| `src/tabs/build/index.tsx` and `src/tabs/BuildTab.tsx` | Transitional forwarding surfaces | Provide Build-tab entry forwarding into the current Build surface composition path. | `buildsurface-host.wiring.ts` (integration seam), retained forwarders as needed during transition | Forwarders are useful during repoint phases; may remain temporarily while host root adoption converges. |
| `src/App.tsx` (Build mount within app frame) | App host integration touchpoint | Mounts `BuildTab` inside app frame and therefore currently anchors Build-surface entry into app runtime composition. | `buildsurface-host.wiring.ts` (repoint touchpoint) | Not a Build-surface concern file itself, but an important reconciliation waypoint when host entry wiring shifts. |

## Draft File Inventory Table

## NL Co-Migration Inventory Scaffold (Slice-Level Planning Aid)

Use this scaffold alongside the draft file inventory so each semantic slice tracks both code targets and NL migration state.

| Semantic Slice Target | Code Target(s) (Planned/Actual) | Canonical Split NL Target (Planned/Actual) | Legacy NL Source Section(s) in `cfg-buildSurface.md` | Naming Alignment Check | Numbering / Provenance Status | Lifecycle Status | Notes |
|---|---|---|---|---|---|---|---|
| Host shell extraction slice (example) | `buildsurface.host.tsx`, `buildsurface-host.wiring.ts` | `doc/nl-config/cfg-buildSurface.host-surface.md` *(placeholder example)* | `[3.x]` host shell structure + `[5.x]` host orchestration sections | planned | pre-validation pending | planned | Replace placeholder path with adopted canonical NL target when finalized. |
| Persistence contract slice (example) | `buildsurface-persistence.logic.ts`, `buildsurface-persistence.contracts.ts` | `doc/nl-config/cfg-buildSurface.persistence.md` *(placeholder example)* | `[5.2.4]`, `[5.2.7]` and related persistence references | in-progress | in-review | in-progress | Keep legacy monolith references annotated until repointed. |
| Tab population seam slice (example) | `leftpanel-build-sources.wiring.ts` | `doc/nl-config/cfg-buildSurface.tab-sources.md` *(placeholder example)* | Build-tab source composition sections in legacy monolith | planned | pre-validation pending | planned | Canonical NL split target should become authoritative once slice lands. |

Notes:
- The NL target filenames above are **illustrative placeholders** to support planning vocabulary; adopt concrete paths only when slice work is approved.
- Final NL split filename/pattern authority for placeholders belongs to `doc/ConventionRoutines/FileNamingMasterList-V1_1.md` and `doc/ConventionRoutines/NL-SplitMigrationAndNumberingPolicy.md`; this inventory is guidance, not naming law.
- Lifecycle values can use the same migration vocabulary as code inventory tracking (`planned`, `in-progress`, `extracted`, `repointed`, `legacy-wrapper`, `retired`, `deferred`) with NL-aware interpretation.
- This scaffold is intentionally additive and low-churn; expand per-slice rows as work is scheduled, not as a full up-front enumeration requirement.

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

## Legacy-to-Planned Mapping Aid (Draft Reconciliation View)

`Legacy-to-planned mapping` is a lightweight planning/reconciliation aid that links current legacy sources to intended canonical destinations for semantic-slice extraction. These mappings are draft guides (not strict implementation law) and may evolve as extraction order or boundary details are refined.

| Legacy Source | Planned Canonical Target(s) | Slice Type | Migration Notes | Mapping Confidence |
|---|---|---|---|---|
| `src/tabs/build/BuildSurface.build.tsx` | `buildsurface.host.tsx`; `leftpanel.host.tsx`; `canvas.host.tsx`; `rightpanel.host.tsx` | host | One-to-many drain expected; extract shell frame primitives first, then repoint zone composition incrementally. | high |
| `src/tabs/build/BuildSurface.logic.ts` | `buildsurface-breakpoint.logic.ts`; `buildsurface-host.wiring.ts`; `leftpanel-build-sources.wiring.ts`; (host orchestration portions co-located with `buildsurface.host.tsx` as needed) | logic + wiring + host | Separate tab-agnostic shell orchestration from tab-population behaviors before broader cleanup. | medium |
| `src/tabs/build/buildSurfacePersistence.ts` | `buildsurface-persistence.logic.ts` | persistence | Primarily naming/role normalization with behavior-preserving extraction. | high |
| `src/tabs/build/buildSurfacePersistence.contracts.ts` | `buildsurface-persistence.contracts.ts` | contracts | Keep version/payload contract authority stable while repointing imports. | high |
| `src/tabs/build/index.tsx`; `src/tabs/BuildTab.tsx`; `src/App.tsx` Build mount path | `buildsurface-host.wiring.ts` (integration seam), with temporary forwarders as needed | wiring | Treat as repoint path tracking to show where host-entry adoption crosses tab/app boundaries. | draft |

### Snapshot & Mapping Maintenance Guidance

- Treat snapshot and mapping rows as lightweight migration traceability aids, not a mandatory implementation checklist.
- Refresh this section when major semantic-slice extraction milestones land (especially host root, persistence, or provider seam moves).
- Preserve one-to-many mapping visibility so reconciliation can show how overloaded legacy files were drained across canonical targets.
- Avoid mass editorial churn: for unrelated docs-only edits, update snapshot/mapping only when stale details would mislead implementation planning.

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

### Temporary Rule (Current React App Scope)

For current React app inventory/refactor planning, `buildsurface` is the **canonical draft semantic root** unless superseded by an approved naming/architecture decision.

Ambiguity note: final global semantic root naming remains intentionally deferred due to potential confusion between Build concern/tab naming and BuildSurface architectural surface/root naming.

1. **Global root semantic target finalization**
   - Keep `buildsurface` for this draft.
   - Potential future rename to a broader semantic target is deferred.

2. **Final tab-provider naming pattern**
   - Current draft uses `leftpanel-<tab>-sources.wiring.ts`.
   - Whether provider naming should converge on `leftpanel-<tab>-provider.*` is deferred.

3. **Future role promotion evaluation**
   - Repeated patterns around selectors/adapters may justify role promotion later.
   - This pass explicitly defers any role-registry expansion.

## Incremental Refactor Migration Method (Draft)

Implementation should execute as **semantic-slice extraction** rather than broad file rewrites.

- Extract one semantic slice at a time from legacy source into its planned canonical target.
- Prefer behavior-preserving moves first; do not combine extraction with broad behavior redesign in the same slice.
- Drain legacy files incrementally as responsibilities move out.
- A legacy file may remain temporarily as a thin delegator/wrapper ("legacy wrapper") only when needed for transition stability.
- Legacy wrappers are transitional only and should be removed once repointing is stable.

Recommended extraction rhythm per slice:

1. **Extract**
   - Move a bounded responsibility into the destination canonical file from this inventory.
2. **Repoint**
   - Update imports/references/call sites to consume the new destination.
3. **Cleanup / Normalize**
   - Align local names/comments/NL references, remove dead code, and normalize remaining seams.
4. **Retire Legacy**
   - Delete drained legacy files, or temporarily reduce to a thin wrapper until safe removal.

## Rule-Class Split (v1)

This inventory distinguishes **Normative Requirements** (deterministic/checkable expectations) from **Heuristic Guidance (Non-Normative)** (human-judgment recommendations). Heuristic guidance is intentionally non-normative and should not be interpreted as strict compliance criteria.

## Adoption / Implementation Guidance (Draft)

### Normative Requirements

1. Start with docs-first planning (this inventory + naming examples), then apply implementation in small PR slices.
2. Rename/split only when corresponding refactor work lands; avoid mass canonicalization unrelated to active change scope.
3. Keep PRs reviewable by separating:
   - host extraction,
   - persistence extraction,
   - tab-provider wiring introduction,
   - optional follow-up tab-provider expansion.
4. Execute in semantic-slice order, extracting one bounded responsibility at a time and keeping host-shell vs tab-population boundaries explicit.
5. Avoid mixing refactor + optimization + behavior changes in one pass unless a safety fix requires coupling.
6. During implementation, keep NL and CCPP alignment for any changed shell/config concern files.

### Heuristic Guidance (Non-Normative)

1. Separate extraction churn from cleanup churn when practical (for example: extraction/repoint first, naming/comment normalization second).
2. Keep PRs boundary-focused and reviewable; each slice should state the boundary being migrated and the legacy surface being drained.

### NL Migration State + Pre-Validation Guidance

Track NL migration state in parallel with code migration state for each active semantic slice:

- record canonical split NL target status (planned/actual) when a slice is opened
- record legacy monolith NL status as forwarded / partial / retained for touched sections
- confirm naming alignment for touched code and NL filenames before marking slice done
- perform numbering/provenance pre-validation for touched atoms/sections before slice closure

This inventory support is intended to surface numbering/provenance inconsistencies early during migration, while keeping final numbering-policy authority in convention documents.

### Draft Inventory Status Tracking Guidance (Migration Lifecycle)

The `Status` column may be used as a migration-lifecycle trace, not only planning intent.

Recommended status progression vocabulary (from `doc/ConventionRoutines/StatusVocabularyRegistry-V1.md`):

- `draft`
- `planned`
- `in-progress`
- `extracted`
- `repointed`
- `legacy-wrapper` *(optional, temporary transitional state)*
- `retired`
- `deferred`

#### Heuristic Guidance (Non-Normative)

- Not every inventory item must pass through every status.
- `legacy-wrapper` is optional and should be short-lived.
- Statuses are for migration traceability/reconciliation, not rigid process law.

### Incremental Extraction Safety Notes

- Avoid introducing circular imports while extracting slices from legacy files.
- Keep ownership obvious after each extraction; do not leave misleading names/comments that imply old ownership.
- Validate React hook/state boundary safety during logic extraction (hook order, closure capture, effects coupling).
- Prefer behavior-preserving extraction before optimization.

## Repo-Reality Constraints (Observed in Current Tree)

- Current Build Surface files use mixed legacy/canonical naming forms, including PascalCase concern files and a persistence file without role suffix (`src/tabs/build/buildSurfacePersistence.ts`).
- Existing naming policy allows this as legacy state under incremental adoption.
- The draft inventory therefore favors **forward canonical targets** without requiring immediate rename of untouched files.
