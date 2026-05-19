# tree-known-roots retirement — registry alignment blockers and staging (Slice 3)

Refs #516  
Refs #521

## 1) Status and scope

This document is a docs/spec-only slice under #516 for registry-alignment planning around known-roots retirement.

This slice records **current runtime truth**, **current implementation reality**, and a **staged implementation path** for blocker resolution. It does not change:

- runtime behavior
- registry payloads
- Tree advisor output
- Structural Addressing logic
- Naming integration
- validation commands
- known-roots runtime dependencies

## 2) Source context

Slice 1 and Slice 2 establish the following:

- known-roots currently backs unexpected top-level folder policy through `knownTopLevelDirectories`.
- known-roots currently backs occurrence classification through `topRoots[].kind`.
- known-roots must not become permanent architecture.
- target replacement requires Tree-owned structural-home, semantic-home, folder-kind, and advisor-policy lanes.
- registry alignment must avoid competing policy truth.

Confirmed runtime dependency paths that remain active in current implementation reality:

1. `knownTopLevelDirectories` → unexpected top-level folder advisor policy
2. `topRoots[].kind` → occurrence-derived structural/semantic classification

## 3) Current registry reality

### 3.1 `tree-known-roots.registry.json`

- **Current location:** `calculogic-validator/tree/src/registries/_builtin/tree-known-roots.registry.json`
- **Ownership status in current implementation reality:** Tree-local builtin registry consumed by Tree runtime loaders/advisor/classifier.
- **Current role:** transitional compatibility vocabulary for top roots (`topRoots`) and compatibility allow-list projection (`knownTopLevelDirectories`).
- **Relationship to known-roots retirement:** this is the compatibility source that must eventually be retired after replacement evidence/interpretation lanes exist.
- **Must not be assumed yet:** canonical structural-home registry, canonical semantic-home registry, or final folder-kind policy truth.

### 3.2 `folder-kinds.registry.json`

- **Current location:** `calculogic-validator/tree/src/registries/_builtin/folder-kinds.registry.json`
- **Ownership status in current implementation reality:** Tree-local builtin registry.
- **Current role:** provides folder-kind vocabulary data for Tree-owned modeling surfaces.
- **Relationship to known-roots retirement:** expected long-term contributor to Tree folder-kind interpretation lane.
- **Must not be assumed yet:** by itself, sufficient runtime replacement for either `knownTopLevelDirectories` policy behavior or `topRoots[].kind` classification behavior.

### 3.3 `structural-homes.registry.json`

- **Current location:** `calculogic-validator/tree/src/registries/_builtin/structural-homes.registry.json`
- **Ownership status in current implementation reality:** Tree-local builtin registry.
- **Current role:** structural-home identity vocabulary and bounded definitions.
- **Relationship to known-roots retirement:** candidate source for Tree structural-home interpretation evidence lane.
- **Must not be assumed yet:** direct drop-in replacement for known-roots classification inputs until explicit interpretation and runtime wiring are defined and test-covered.

### 3.4 `surface-structural-home-perspective.registry.json`

- **Current location:** `calculogic-validator/tree/src/registries/_builtin/surface-structural-home-perspective.registry.json`
- **Ownership status in current implementation reality:** Tree-local builtin perspective registry.
- **Current role:** perspective mapping data between surface-oriented labels and structural-home references.
- **Relationship to known-roots retirement:** contextual support for future evidence preparation and perspective modeling boundaries.
- **Must not be assumed yet:** final placement authority or replacement for Tree structural-home / semantic-home interpretation.

### 3.5 Standalone shared `surfaces.registry.json` status

- **Current location status:** no standalone shared `surfaces.registry.json` was found in inspected runtime paths for this slice.
- **Ownership status in current implementation reality:** not established as an active shared runtime registry in this slice.
- **Current role:** none confirmed for immediate known-roots dependency replacement.
- **Relationship to known-roots retirement:** no confirmed direct runtime blocker for the two known-roots dependency paths.
- **Must not be assumed yet:** existing shared cross-cutting runtime source or required immediate prerequisite for the next behavior-preserving replacement slice.

## 4) Alignment questions and staging decisions

### 4.1 test / tests alignment

- **Classification:** Required before runtime replacement.
- **Current state:** current known-roots behavior preserves literal `test`; `tests` is not auto-normalized.
- **Why it matters:** both advisor allow-list behavior and occurrence-derived classification could drift if replacement introduces implicit aliasing.
- **Recommended staging decision:** require explicit policy decision and test contract before replacing either known-roots runtime path.
- **What must not change yet:** do not normalize `test` / `tests` in this slice.
- **Recommended follow-up slice:** behavior-preserving replacement contract slice for top-level policy/classification literal handling.

### 4.2 Tree-local vs shared registry ownership

- **Classification:** Needs separate parent/slice.
- **Current state:** inspected runtime registries are Tree-local for this scope.
- **Why it matters:** long-term extraction and cross-cutting ownership boundaries need explicit governance.
- **Recommended staging decision:** treat as separate architecture/registry-governance slice; do not block immediate behavior-preserving replacements if Tree-local lanes can be explicit and deterministic.
- **What must not change yet:** no ownership migration in this slice.
- **Recommended follow-up slice:** cross-cutting registry ownership alignment slice.

### 4.3 standalone shared surfaces.registry.json status

- **Classification:** Can be deferred.
- **Current state:** standalone shared registry not found as active current runtime truth for these dependencies.
- **Why it matters:** affects future shared model architecture, but does not currently gate replacement of the two confirmed known-roots runtime paths.
- **Recommended staging decision:** defer introduction/migration unless a future slice explicitly scopes it.
- **What must not change yet:** do not introduce shared `surfaces.registry.json` in this parent by side effect.
- **Recommended follow-up slice:** optional shared-surface registry parent/slice, if explicitly adopted.

### 4.4 surface-to-structural-home perspective expectations

- **Classification:** Can be deferred.
- **Current state:** perspective registry exists, but no confirmed direct known-roots runtime dependency path for immediate replacement.
- **Why it matters:** can influence future evidence shaping and placement interpretation semantics.
- **Recommended staging decision:** defer until Tree structural-home evidence lane is explicitly prepared and consumed.
- **What must not change yet:** do not treat perspective entries as final placement authority.
- **Recommended follow-up slice:** structural-home evidence preparation slice.

### 4.5 structural-homes registry relationship to Tree structural-home interpretation

- **Classification:** Required before runtime replacement.
- **Current state:** structural-homes registry exists, but direct replacement interpretation path is not yet the current runtime truth.
- **Why it matters:** replacing `topRoots[].kind` requires explicit Tree-owned interpretation logic from addressed occurrence evidence.
- **Recommended staging decision:** define explicit Tree structural-home interpretation contract and wiring before replacing classification dependency.
- **What must not change yet:** do not assume registry presence alone replaces known-roots behavior.
- **Recommended follow-up slice:** Tree structural-home evidence preparation and classifier bridge slice.

### 4.6 folder-kinds registry relationship to occurrence classification

- **Classification:** Required before runtime replacement.
- **Current state:** folder-kinds registry exists; replacement classifier contract is not yet runtime-wired for known-roots parity.
- **Why it matters:** occurrence-derived classification and advisor policy both need Tree folder-kind interpretation that preserves current behavior.
- **Recommended staging decision:** define explicit folder-kind interpretation contract and tests prior to removing known-roots classifier/policy dependencies.
- **What must not change yet:** no implicit substitution from registry presence.
- **Recommended follow-up slice:** Tree folder-kind interpretation path slice.

### 4.7 semantic-home evidence model

- **Classification:** Required before runtime replacement.
- **Current state:** target model expects semantic-home interpretation lane; replacement runtime contract is not complete.
- **Why it matters:** `topRoots[].kind = semantic` currently contributes to occurrence classification; removal without semantic-home replacement would regress semantics.
- **Recommended staging decision:** require explicit semantic-home evidence preparation plan before replacing known-roots classification dependency.
- **What must not change yet:** no semantic interpretation shift into Structural Addressing.
- **Recommended follow-up slice:** Tree semantic-home evidence preparation slice.

### 4.8 Naming semantic-family bridge evidence boundary

- **Classification:** Can be deferred (with boundary lock).
- **Current state:** Naming-prepared bridge boundary is acknowledged, but no requirement that immediate structural-home-first replacement must fully implement Naming bridge runtime behavior.
- **Why it matters:** semantic-home maturity likely benefits from Naming-prepared semantic-family evidence; however immediate replacement may proceed in bounded steps if behavior parity is preserved.
- **Recommended staging decision:** keep explicit boundary now, schedule bridge expansion in a dedicated semantic-home-focused slice.
- **What must not change yet:** Tree must not reimplement Naming semantic-family interpretation.
- **Recommended follow-up slice:** Naming bridge evidence integration slice aligned to semantic-home replacement.

### 4.9 known-roots compatibility adapter retirement timing

- **Classification:** No current action needed.
- **Current state:** adapter/prepared dependency is transitional scaffolding supporting current behavior-preserving staging.
- **Why it matters:** premature removal would break staging and coverage before consumers are migrated.
- **Recommended staging decision:** retire only after both runtime dependency paths have behavior-preserving replacements and no consumer remains.
- **What must not change yet:** do not remove adapter in this slice.
- **Recommended follow-up slice:** adapter retirement cleanup slice after dependency-zero verification.

## 5) Required-before-replacement decisions

The following decisions are required before replacing known-roots runtime dependency paths:

1. **Explicit `test` / `tests` policy contract with parity tests**  
   - Affects: **both runtime paths** (unexpected top-level folder policy and occurrence-derived classification).
2. **Tree structural-home interpretation contract over addressed occurrences**  
   - Affects: **only occurrence-derived classification** (`topRoots[].kind` replacement path, plus future cleanup leverage).
3. **Tree folder-kind interpretation contract with advisor-policy inputs**  
   - Affects: **both runtime paths** (classification and top-level folder policy migration consistency).
4. **Tree semantic-home evidence preparation contract (bounded, behavior-preserving)**  
   - Affects: **only occurrence-derived classification** (semantic root interpretation parity).
5. **Behavior-preserving advisor-policy replacement contract for current allow-list behavior**  
   - Affects: **only unexpected top-level folder policy** (`knownTopLevelDirectories` replacement path).

Items that are **not immediate blockers** but are future cleanup/architecture concerns:

- Tree-local vs shared registry ownership migration (future cleanup / extraction alignment).
- shared `surfaces.registry.json` introduction (future cleanup / cross-cutting architecture).
- compatibility adapter removal timing (future cleanup once dependency-zero is proven).

## 6) Deferred decisions

The following can remain deferred without blocking the next bounded implementation slice, based on current implementation reality and dependency evidence:

- introduction of standalone shared `surfaces.registry.json`
- Tree-local vs shared ownership migration for these registries
- full Naming bridge runtime expansion, if next runtime slice first replaces structural-home/folder-kind lanes with behavior parity
- compatibility adapter removal until no consumer remains

Deferred here means these are **not current runtime truth blockers** for first behavior-preserving replacement increments, provided ownership boundaries remain explicit and no competing policy truth is introduced.

## 7) Anti-drift registry guardrails

- Do not make `tree-known-roots` the canonical structural-home registry.
- Do not make `tree-known-roots` the canonical semantic-home registry.
- Do not make surface-to-structural-home perspective data final placement authority.
- Do not make Structural Addressing responsible for interpreting registry meaning.
- Do not make Tree reimplement Naming semantic-family interpretation.
- Do not normalize `test` / `tests` without a dedicated migration decision.
- Do not introduce shared `surfaces.registry.json` as a side effect of this parent unless separately scoped.
- Do not treat compatibility adapter scaffolding as target architecture.

## 8) Recommended next slices

1. Define addressed occurrence evidence contract for repo-top / scope-top classification inputs.
2. Add Tree-owned structural-home evidence preparation over addressed occurrences.
3. Add Tree-owned semantic-home evidence preparation, consuming Naming-prepared evidence where available through an explicit bridge.
4. Add Tree folder-kind interpretation path and bounded advisor-policy inputs.
5. Replace occurrence classification known-roots dependency in behavior-preserving slices.
6. Replace unexpected top-level folder known-roots dependency in behavior-preserving slices.
7. Retire compatibility adapter/prepared dependency after no consumer needs it.
8. Archive/remove known-roots registry, loader, and tests after no runtime dependency remains.

## 9) Ownership authority summary for this slice

- **Runtime authority used:** Tree known-roots retirement audit/target/bridge specs and inspected Tree runtime registry/logic files.
- **Navigation-only authority used:** tree documentation map/inventory for discovery ordering context.
- **Task-scoped supporting context used:** this slice request’s registry-alignment question set and required sectioning.

