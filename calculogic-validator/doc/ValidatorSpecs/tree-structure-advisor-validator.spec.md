# Tree Structure Advisor Validator Spec (Report-Only Advisory, V0.1.7)

## Purpose and Scope (Status: Current runtime behavior)

This document defines a **Tree Structure Advisor** validator slice whose output is **advisory**:

- it analyzes repository **folder structure** using prepared tree-core inputs
- it emits **advisory findings** for currently implemented structural and shim-compat checks
- contributor-backed diagnostics are optional and attached outside tree core
- it never renames or moves files
- it is report-only in the non-mutating/report-first sense, not in the sense of guaranteed exit `0`

This slice exists to reduce “tree drift” as additional validators beyond naming are added. Current exit behavior still follows the shared suite policy after report emission, so warning-level tree findings can still produce exit `2`.

### Suite-core vs owned-slice boundary principle

Tree advisor structural reasoning also includes an ownership-boundary principle aligned with current repo architecture:

- `calculogic-validator/src/**` is suite-core/shared infrastructure and compat-boundary surface
- validator-owned slices with their own internal growth path belong in slice roots outside suite-core `src/` (for example `calculogic-validator/naming/src/**`, `calculogic-validator/tree/src/**`)
- continued owned-slice growth inside suite-core `src/` is structural drift because it predicts avoidable future extraction/shim/refactor debt

This principle is advisory and architecture-oriented; it does not mean one universal folder layout is required for every repo.

## Tree Implementation Canonical Reading Path (Status: Current implementation guidance)

Read these first before tree implementation work (runtime, wiring, or contracts):

1. Suite contract and scope boundary: [`ValidatorSuite-Contracts-And-Modes.md`](../ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md)
2. Tree validator spec (this document): runtime behavior + bounded modeling notes
3. Naming boundary context: [`NamingValidatorSpec.md`](../ConventionRoutines/NamingValidatorSpec.md)
4. Tree NL/config implementation note: [`calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md`](./nl-config/cfg-treeStructureAdvisor.md)
5. Tree documentation map (navigation metadata): [`tree-documentation-map-and-reorg-inventory.md`](./tree-owned/tree-documentation-map-and-reorg-inventory.md)

Status interpretation used in this document:

- **Current runtime behavior**: implemented or currently enforced report behavior.
- **Bounded modeling note**: current architecture interpretation guidance that intentionally does not claim new runtime behavior.
- **Future advisory direction**: planned or deferred direction, not shipped behavior.
- **Dogfooding/current-repo reality**: currently observed repo-specific shape that should not be overgeneralized into package-wide builtin truth.

## Suite Contract Alignment (Status: Current runtime behavior)

This slice follows the shared suite contract in [`ValidatorSuite-Contracts-And-Modes.md`](../ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md): the validator suite is modular, configurable, policy-driven, and report-first by default. Tree advisor V0.1.7 remains report-only even though additional policy modes exist suite-wide.

### In scope (V0.1.7 hardened subset)

- Tree-core structural checks over prepared `selectedPaths` + `topLevelDirectoryNames` + `targets`
- Optional contributor composition through `findingContributors[]` prepared by wiring/assembly
- Shim/compat diagnostics attached through the tree contributor assembly default (`tree-shim-diagnostics`)
- Report-only output with deterministic sorting and no filesystem mutation

### Out of scope (V0.1.7)

- Applying any filesystem changes (no auto-move, no auto-fix)
- Enforcing a single “correct tree” (recommendations are heuristic + explainable)
- Import graph analysis (deferred; optional future enhancement)
- Structural addressing validation of NL/code atoms (not this slice)
- Semantic correctness of code behavior (not this slice)

---

## Source-of-Truth References

- Deterministic address grammar + concern slot semantics:
  - `calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md`
- Canonical filename grammar + role registry categories/status:
  - `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
- Naming validator conventions (classification shape, determinism expectations):
  - `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`

---

## Conceptual Model (Status: Current architectural/modeling guidance)

This validator treats **folders as scope roots** (host-like boundaries), and filenames as potential **lane signals**:

- **Scope roots** (host-like boundaries):
  - `bin/`, `scripts/`, `src/`, `test/`, `tools/<tool>/...` (example surfaces)
- **Current shipped heuristic substrate**:
  - deterministic path/basename signals
  - scope + target filtering from the shared suite boundary
  - occurrence-derived structural records when available
- **Lanes / semantic families**:
  - remain valid modeling concepts for tree work
  - should be treated as partially deferred concepts until explicit runtime consumption is documented below

Goal: surface emergent patterns and recommend a structure that makes those patterns obvious without overstating what current runtime already emits.

### Naming-signal consumption boundary (Status: Current runtime boundary)

Tree advisor consumes naming-shaped metadata only across an explicit slice boundary; it does **not** derive naming semantics independently.

**Current shipped runtime posture:**

- current tree findings do **not** yet ingest parsed naming-validator outputs or semantic-family clustering data
- current shipped tree findings are driven by deterministic path, basename, scope, target, shim-evidence, and occurrence-derived structural signals
- the naming boundary still matters now because any later tree heuristic that needs semantic-family or role information must consume naming-derived signals rather than re-implement naming interpretation locally

When naming-derived signal input is explicitly wired in later, intended consumable surfaces include:

- `semanticName`
- semantic family/group outputs derived by naming from `semanticName`
- naming-owned aggregate observations such as `familyRootCounts`, `familySubgroupCounts`, and `semanticFamilyCounts` when/if naming later emits them
- `role`
- role category/status metadata

Tree advisor does **not** re-own naming validity judgments. Naming validity remains owned by naming conventions/specs and the naming validator slice.

Examples of naming validity judgments that tree advisor must not duplicate:

- bad semantic case
- missing role
- deprecated role
- hyphen-role ambiguity

When usable naming-shaped metadata is unavailable, incomplete, or not yet wired into tree runtime, tree advisor should reduce confidence and/or recommend running naming validation rather than inventing naming-invalid findings inside tree output. Naming-owned aggregate observations are downstream evidence only and do not let tree declare registry truth on its own.

Boundary note (canonical_target for this slice): tree validator ownership is under `calculogic-validator/tree/src/**`. Legacy flat suite-core paths such as `calculogic-validator/src/tree-structure-advisor.*.mjs` are compatibility wrappers only, not canonical ownership.

## Top-Root Registry Classes and Ownership Boundary (Status: Bounded modeling note)

Classification: Informative

This section clarifies modeling intent for tree root registries without changing current runtime behavior.

### 1) Top-root classes

- **Structural top roots**:
  - generic surface-like roots such as `src`, `test`, `doc`, `docs`, `scripts`, `tools`, `public`, `bin`
  - these are interpreted by tree as structural folder surfaces
- **Semantic/custom-style top roots**:
  - top roots that encode semantic/package identity or repo-local ownership style
  - examples can include package-style roots used by a specific repository architecture

### 2) Builtin vs custom ownership

- Generic structural roots are appropriate builtin tree-owned defaults.
- Semantic/custom-style roots may be valid and high-value, but are not automatically universal builtin truth.
- Repo-specific roots used for dogfooding or implementation convenience may exist in current policy (**dogfooding/current-repo reality**), but they should not automatically become permanent published-package builtins.

### 3) Case/style distinction

- Semantic/custom-style roots may follow naming-like style conventions.
- This style signal does not make them filename roles.
- Tree remains the owner of structural interpretation for folder roots.

### 4) Future registry direction (modeling only; Status: Future advisory direction)

Future tree root registries may require metadata richer than a flat string list, for example:

- root kind (`structural` vs `semantic`)
- ownership/source (`builtin` vs `custom`)
- style classification (`generic-builtin`, `custom-style`, or similar)

This is a modeling direction note only, not an implementation claim for this version.

---

## Tree Addressing (Report-Only, Status: Future advisory direction)

This slice assigns **Tree Addresses** for reporting and internal clustering.
They are not canonical persistent IDs and must not be embedded into filenames.

### Grammar

Tree Address uses the same token style as the Deterministic Structural Addressing spec:

`<HostLetter>.<HostLocalIndex>.<LaneIndex>[.<NodeIndex>...]`

Rules:

- dot-separated tokens
- host token is a single uppercase letter
- numeric tokens are positive integers (no leading zeros)
- numeric compare is numeric, not lexical

### Interpretation

- `HostLetter` = scope-root namespace token for this report run
- `HostLocalIndex` = deterministic index of a top-level surface inside that host (e.g., `src` subtree roots, tool roots)
- `LaneIndex` = deterministic lane classification index (see below)
- `NodeIndex...` = deeper nested nodes used only when needed to represent:
  - (a) folder depth in a suggested target tree, and/or
  - (b) stable cluster subdivision (e.g., domain → subdomain → family)

### Host token binding (important)

Host tokens are **context-bound** (per the addressing spec’s “local meaning” concept).
The report MUST also include explicit host bindings:

- `addressing.hostBindings[]` items:
  - `host: "A" | "B" | ...`
  - `scopeRootPath: "<repo-relative path>"`
  - `notes: "<optional>"`

This prevents confusing “A” with anything global.

### Lane index mapping (V0.0.1)

This slice must preserve the existing concern slot semantics where applicable while allowing non-CCS lanes.

**Concern-aligned lanes (match existing concern indices):**

- `3` Build
- `4` BuildStyle
- `5` Logic
- `6` Knowledge
- `7` Results
- `8` ResultsStyle

**Non-concern lanes (tree advisor only; not CCS concerns):**

- `2` ArchitectureSupport (roles like `host`, `wiring`, `contracts`)
- `10` Tests (test-only surfaces and fixtures clusters)
- `11` ToolingSurface (bin/scripts/tool wrappers; report-only lane)
- `12` DocumentationSurface (docs-only roots; report-only lane)

Notes:

- This lane extension is permitted only because these Tree Addresses are report-only.
- When a filename role’s category is concern-core or concern-style, it MUST map to its concern index (3–8).
- When a filename role is architecture-support, it MUST map to lane `2`.

---

## Tree Snapshot Inputs (TreeManifest / TreeSnapshot, Status: Bounded modeling note)

Tree advisor analysis input is a deterministic **TreeSnapshot** (also called a TreeManifest): a stable list of repo-relative paths selected for analysis.

### Snapshot sources

TreeSnapshot may come from one of two sources:

- `fs` snapshot (always available): filesystem walk results after scope + target filtering
- `git` snapshot (optional): committed tree listing for a selected git ref when `.git` is present

Typical `git` usage is `gitRef=HEAD`.

Important metadata clarifications:

- `HEAD` is a git ref / snapshot selector, not a filename role
- `git status --porcelain` is optional diagnostics metadata (for dirty/untracked visibility) and is not required for basic tree-advisor operation

### Determinism rules (snapshot-specific)

- normalize all paths to `/`
- stably sort snapshot entries
- same snapshot inputs and same options => same report output

### Recommended shape-level schema (doc-only; Status: Bounded modeling note)

- `sourceSnapshot.source`: `fs | git`
- `sourceSnapshot.gitRef`: optional string (for example `HEAD`)
- `sourceSnapshot.diagnostics`: optional object (dirty/untracked counts or booleans)
- `entries[]`:
  - `path`
  - `kind`: `file | dir` (optional)
  - `parsed`: optional naming metadata
    - `semanticName`
    - `role`

---

## Input Scope Profiles (Status: Current runtime behavior)

Tree advisor scope selection follows the suite-owned scope boundary contract in [`ValidatorSuite-Contracts-And-Modes.md`](../ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md#6-suite-owned-scope-boundary-contract-canonical): suite owns canonical scope vocabulary and scoped input selection, and tree advisor applies tree-local interpretation after that shared boundary.

Tree advisor scope selection should reuse the existing validator scope discovery model (repo/app/docs/validator/system), plus optional target filtering.

- Default scope: `repo`
- Supports: `--scope=<scopeName>`
- Supports: `--target <path>` (repeatable; union)

Target filtering applies after scope discovery and before analysis.

Scope discovery for all profiles (including `repo`) must consume both scope-profile surfaces exposed by the shared runtime contract:

- `includeRoots`: directory roots to walk recursively
- `includeRootFiles`: explicit repository-root files to include when present

Runtime collection should consume the suite-core shared scoped snapshot/input helper boundary (scope profile read + includeRoots/includeRootFiles collection + normalization + target filtering + deterministic sort/dedupe) before tree-local interpretation.

Runtime collection must ignore missing declared root files, normalize collected root-file paths the same way as walked paths, then merge + deduplicate before target filtering.

---

## Analysis Heuristics (Deterministic, Status: Future advisory direction)

This section is a deferred heuristic menu, not a statement of currently emitted tree behavior. Current runtime only ships the bounded findings listed later under **Current Runtime Boundary and Shipped Findings**. In particular, semantic-family/lane heuristics below remain future-facing until explicit runtime + conformance coverage lands.

### 1) Semantic family cohesion

Detect when a naming-derived semantic family signal is scattered across too many unrelated folders.

Example family keys:

- exact semantic name: `validator-config`
- configured family-prefix rule when enabled: `naming-rule-*` → family `naming-rule`

### 2) Lane purity / entropy

Detect when a folder contains a high-entropy mix of lanes that predict navigation pain as the subsystem grows.

### 3) Subsystem scaffold normalization

Detect when one validator subsystem has a rich internal namespace (`rules/`, `registries/`) while other validator subsystems are flat/scattered, and recommend adopting a common scaffold.

### 4) “Tool-as-subpackage” separation

Detect when subpackages (e.g., `tools/report-capture`) contain mixed surfaces that should remain isolated from library code.

### 5) Owned-slice boundary drift

Detect when validator-owned subsystem growth is accumulating under suite-core `calculogic-validator/src/**` instead of an owned slice root.

Signals may include subsystem-local host/wiring/logic files, registries, tests, docs, scripts, and scaffolds that indicate package-like internal growth.

Advisory intent:

- prefer earlier extraction to an owned slice root before additional files and shims accumulate
- preserve suite-core as shared infra/compat boundary rather than long-term home for owned validator internals

All scoring thresholds MUST be explicit constants in code and reported in `details`.

### Explicit thresholds (V0.0.1 defaults)

- `MIN_LANE_PARTITIONS_FOR_SCATTER = 2`
- `MIN_FILES_IN_FAMILY_FOR_RECOMMENDATION = 2`
- `LANE_FIRST_FOLDER_SIGNAL_SET = { build, build-style, logic, knowledge, results, results-style, tests, docs }`

## Recommendation Patterns (Advisory Only, Status: Future advisory direction)

The following outputs are advisory recommendation patterns only. They are not mandatory rules and are **not currently emitted** by shipped tree runtime. Treat them as deterministic future-design guidance for later `suggested-reorg` findings, not as current contract behavior.

### 1) Semantic-family folder recommendation

When one semantic family is scattered across unrelated folders beyond configured thresholds, recommend consolidation under a family root such as:

- `<semantic-name>/...`
- `<semantic-family>/...`

This is recommendation output (`suggested-reorg`) and not an enforcement requirement.

### 2) Concern subfolder recommendation under a family

When a semantic family has multi-file and multi-lane presence and is not already cleanly scoped by a higher family folder, recommend concern subfolders such as:

- `<semantic-family>/build/...`
- `<semantic-family>/logic/...`
- `<semantic-family>/knowledge/...`

This recommendation should trigger only when it reduces lane entropy or improves navigation, and remains advisory-only.

Constraint (shared-root):

- Do not recommend creating or expanding lane-first folders directly under a shared root (for example, `src/shared/logic/`).
- Lane/role subfolders are only recommended inside a semantic family folder (for example, `src/shared/<semantic-family>/logic/...`).

Naming metadata reuse note:

- Treat parsed naming metadata (`<semantic-name>.<role>.<ext>`) as a primary lane signal.

### 3) Shared-root semantic-first grouping (advisory-only)

Intent:

- At shared-root level (default example: `src/shared/`), prefer semantic-first grouping.
- Preferred target: `src/shared/<semantic-family>/...`
- Avoid recommending: `src/shared/<lane>/...` as the target structure.

Detect (deterministic):

- A shared root is one of a configured set (V0.0.1 default example: `src/shared`).
- The shared root contains lane-first partitions as immediate child folders (examples):
  - `logic`, `knowledge`, `results`, `build`, `build-style`, `results-style`, `tests`, `docs`
- A semantic family output supplied by naming (derived from parsed `<semantic-name>`) appears under >= 2 distinct lane-first partitions within that shared root.
- Guardrail: only recommend when the family has >= 2 files (reduces churn/noise).

Recommend (advisory):

- Consolidate to: `src/shared/<semantic-family>/...`
- Within `src/shared/<semantic-family>/`, lane/role subfolders are allowed only when needed to reduce clutter/entropy:
  - `src/shared/<semantic-family>/logic/...`
  - `src/shared/<semantic-family>/knowledge/...`
  - etc.

No-inference constraint (V0.0.1):

- The advisor must not require or assume folder-name case transforms (no kebab↔Pascal conversion).
- Use the derived `familyKey` as-is for suggested target paths.

Example:

- Before:
  - `src/shared/logic/selection.logic.ts`
  - `src/shared/knowledge/selection.knowledge.ts`
- Suggested target:
  - `src/shared/selection/selection.logic.ts`
  - `src/shared/selection/selection.knowledge.ts`

### 4) Owned slice extraction recommendation (advisory-only)

Intent:

- when a validator subsystem is growing like an owned slice inside suite-core `src/**`, recommend extraction to a dedicated slice root
- keep recommendations report-first and bounded to structural/ownership guidance

Pattern examples (conceptual):

- from: `calculogic-validator/src/<subsystem>/**`
- to: `calculogic-validator/<subsystem>/src/**`

Current architecture alignment examples:

- canonical naming slice root: `calculogic-validator/naming/src/**`
- canonical tree slice root: `calculogic-validator/tree/src/**`

Non-claim boundary:

- this spec section defines advisory direction and recommendation shape
- it does not claim current runtime fully enforces deterministic owned-slice boundary detection yet

## Compat / Shim Health Signals (Advisory Diagnostics)

Shim/compat detection is a tree-health diagnostic layer in report-first mode.

V0.1.4 hardened subset:

- infer bounded artifact surface from path/basename only:
  - `quality`, `docs`, `examples`, `fixtures`, `runtimeish`
- collect structured evidence fields (do not flatten to `isShimLike` early):
  - `artifactSurface`
  - `matchedShimSignals.folderSignals`
  - `matchedShimSignals.nameTokenSignals`
  - `matchedShimSignals.thinReexportShim`
  - `insideCompatSurface`
  - `canonicalTargetPath`
  - `reexportTargetCount`
  - intentional pass-through booleans (canonical host pass-through / public entrypoint pass-through)
- thin flat re-export files (`export * from ...` / `export { ... } from ...` only) remain the strongest/high-confidence shim signal
- intentional pass-through entrypoints are excluded from shim debt findings:
  - canonical `*.host.* -> sibling *.wiring.*` pass-through in owned slices
  - `calculogic-validator/src/index.mjs` package/public entrypoint barrel
- weak token/path-only shim signals on non-runtime surfaces (`quality/docs/examples/fixtures`) are suppressed from shim-debt output
- runtimeish token/path-only shim signals remain info-only observability

Implemented codes:

- `TREE_SHIM_SURFACE_PRESENT` (`info`):
  - emitted for thin re-export shim evidence
  - emitted for runtimeish token/path-only signals as low-confidence observability
- `TREE_SHIM_OUTSIDE_COMPAT` (`warn`): emitted only when thin re-export shim evidence exists and the path is outside a compat/shims surface
- `TREE_SHIM_SCATTERED`: reserved for a later deterministic slice

Constraints:

- do not require creation of empty `compat/` folders
- report findings are advisory diagnostics only (not pass/fail by default)

---

## Classification Outputs (Status: Current runtime behavior)

Current tree-runtime and attached shim contributor findings use:

- `classification`: `advisory-structure`
- `severity`: `info` and `warn` only (report-mode, no tree finding errors)

---

## Finding Schema (Status: Current runtime behavior)

Each finding uses the same stable envelope shape used by existing validators:

- `code` (string)
- `severity` (`info` | `warn`)
- `path` (normalized relative path; when folder-scoped, path is the folder root)
- `classification` (enum)
- `message` (short human-readable summary)
- `ruleRef` (spec reference pointer, e.g. `tree-structure-advisor-validator.spec.md#...`)
- `suggestedFix` (optional, advisory-only; e.g., proposed move set)
- `details` (object, deterministic)

### Tree-Advisor details fields (recommended; Status: Current architectural/modeling guidance)

- `addressing.treeAddress` (string; report-only)
- `addressing.host` (string)
- `addressing.laneIndex` (number)
- `signals`
  - `parsed.semanticName` (string|null)
  - `parsed.role` (string|null)
  - `parsed.roleCategory` (string|null)
  - `familyKey` (string|null)
  - `sharedRoot` (string|null)
  - `isSharedRootContext` (boolean)
  - `isLaneFirstPartition` (boolean)
  - `laneFirstFolderName` (string|null)
  - `semanticFamilyKey` (string|null; `familyKey` when in shared-root context)
- `metrics`
  - `familyScatterCount` (number)
  - `laneEntropy` (number)
  - `clusterSize` (number)
- `proposal` (optional)
  - `proposedMoves[]`:
    - `from` (path)
    - `to` (path)
    - `reason` (string; deterministic template text)

---

## Finding / Code Set (Draft; Status: Mixed current runtime behavior + future advisory direction)

### Current shipped codes (current runtime behavior)

- `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` (`info`)
- `TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE` (`info`)
- `TREE_OWNED_SLICE_BOUNDARY_DRIFT` (`info`)
- `TREE_SHIM_SURFACE_PRESENT` (`info`) — implemented (thin-reexport high-confidence + runtimeish token-only observability)
- `TREE_SHIM_OUTSIDE_COMPAT` (`warn`) — implemented (thin re-export evidence only)

### Deferred/planning code candidates (future advisory direction)

- `TREE_OBSERVED_FAMILY_CLUSTER`
- `TREE_FAMILY_SCATTERED`
- `TREE_LANE_MIX_HIGH_ENTROPY`
- `TREE_MISSING_NAMESPACE_ROOT`
- `TREE_SUBSYSTEM_SCAFFOLD_ASYMMETRY`
- `TREE_TOOL_SURFACE_MIX`
- `TREE_SHIM_SCATTERED` (`warn`/`info`)
- `TREE_SHARED_LANE_FIRST_PARTITION_PRESENT` (`info`)
- `TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES` (`warn`/`info`)
- `TREE_SHARED_SEMANTIC_ROOT_RECOMMENDED` (`warn`/`info`)
- `TREE_OWNED_SLICE_EXTRACTION_RECOMMENDED` (`warn`/`info`)

Deferred candidates above are a documentation menu only. They are not current runtime claims and should not be treated as conformance expectations until shipped below the current-runtime boundary.

---

## Current Runtime Boundary and Shipped Findings (Status: Current runtime behavior)

### Runtime boundary

- Tree core consumes **prepared tree-core inputs only** and fails closed when that contract is bypassed.
- Tree core consumes occurrence-derived file records from `occurrenceSnapshot.occurrenceRecords` when available for bounded structural helpers (`TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE`, `TREE_OWNED_SLICE_BOUNDARY_DRIFT`) while keeping findings path output on resolved paths.
- Occurrence-derived records are enriched with a bounded structural class interpretation layer (`structuralClass`, `structuralKind`, `isKnownTopRoot`, `isSemanticRoot`, `isStructuralRoot`, `isSubtreePartitionCandidate`, `isRepoTopOccurrence`, `isScopedRootOccurrence`) for tree-local reasoning substrate use; findings envelopes remain unchanged.
- If occurrence snapshot is missing or malformed, tree core deterministically falls back to prepared `selectedPaths` for file-path reasoning.
- Required prepared tree-core fields:
  - `selectedPaths` (array)
  - `topLevelDirectoryNames` (array)
  - `targets` (array)
- Optional composition field:
  - `findingContributors` (array of contributor callbacks)
- Tree core does **not** require `getFileContent(relativePath)`.
- Current tree runtime does **not** consume tree-specific config surfaces. The dedicated CLI may accept `--config=<path>` through shared suite runner plumbing, but current tree behavior only validates/normalizes the shared config shape and exposes `configDigest` at the runner envelope when config is supplied.
- Current tree runtime does **not** emit tree addresses, move proposals, semantic-family clustering payloads, or naming-derived parsed metadata in findings/report payloads.

### Composition ownership

- Tree wiring prepares tree-core inputs and calls tree contributor assembly for default contributors.
- Default contributor selection is owned by `tree-structure-advisor-contributors.assembly.wiring.mjs`, not by tree core.
- Shim diagnostics are attached as a contributor (`tree-shim-diagnostics`) during normal tree runs.
- Shim/content reads are owned by the shim contributor attachment boundary and are guarded to selected paths.

### Current shipped finding codes

Tree core currently ships:

- `TREE_UNEXPECTED_TOP_LEVEL_FOLDER`
- `TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE`
- `TREE_OWNED_SLICE_BOUNDARY_DRIFT`

Attached shim contributor currently ships during normal tree runs:

- `TREE_SHIM_SURFACE_PRESENT`
- `TREE_SHIM_OUTSIDE_COMPAT`

### Current report payload from tree runtime

The tree runtime result includes:

- `findings[]` (deterministically sorted)
- `totalFilesScanned`
- `scope`
- `filters` with `isFiltered` and optional `targets`

When tree runs through the shared validator runner / CLI surfaces, the composed validator entry additionally includes summary counts and optional `meta.filters`, and the runner envelope may include `configDigest` when `--config` is supplied. No tree-specific config payload is emitted today.

---

## Determinism Requirements (Status: Current runtime behavior)

- Normalize path separators to `/`
- Use explicit include/exclude sets per scope
- Parse filename metadata deterministically (no inference beyond registry rules)
- All clustering keys must be deterministic:
  - stable string keys derived from path + parsed name components
- Findings sorted by:
  1. `path` asc
  2. `code` asc
  3. stable secondary keys in `details` (if needed)
- Identical repo state + same CLI inputs => identical report ordering and counts

---

## Rollout Modes (Status: Current runtime behavior + future advisory direction)

Mode semantics are centralized in [`ValidatorSuite-Contracts-And-Modes.md`](../ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md).

Tree advisor V0.0.1 implementation status:

- `report` only
  - no fix/mutate behavior is implemented
  - report JSON is emitted before exit handling
  - warning-level tree findings may still yield exit `2` under the shared suite exit policy
  - invalid CLI usage / invalid config / nonexistent target still fail with exit `1`

Suite policy options (`soft-fail`, `hard-fail`, `correct`, `replace`) are contract-level modes and are deferred for this slice (**future advisory direction**).

---

## CLI Usage (Status: Current runtime behavior)

Current script usage:

- `npm run validate:tree -- --scope=validator` runs tree-structure-advisor only for validator scope.
- `--target` is repeatable (`--target <path>` and `--target=<path>`) and filters analysis to the union of selected in-scope targets.
- `--config=<path>` is accepted through shared suite CLI plumbing for config validation + runner-envelope `configDigest`; current tree runtime does not apply tree-local config semantics yet.
- The command remains report-only in the non-mutating/report-first sense. Exit status still follows the shared suite exit contract after report emission, so warning-level advisory findings can currently yield exit `2`.

Npm forwarding requirement remains: pass flags after `--` (for example `npm run validate:tree -- --scope=validator --target calculogic-validator/tree/src`).

---

## Non-Goals (Restated, Status: Current runtime boundary)

- This slice is not a “tree linter that blocks PRs” yet.
- It does not define a single canonical folder layout.
- It does not introduce filename numbering or address stamping into paths.
- It does not validate NL↔code atom parity or provenance token correctness.
