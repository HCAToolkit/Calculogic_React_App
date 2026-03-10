# Tree Structure Advisor Validator Spec (Report-Only Advisory, V0.1.5)

## Purpose and Scope

This document defines a **Tree Structure Advisor** validator slice whose output is **advisory**:

- it analyzes repository **folder structure + filename semantics**
- it assigns **report-only tree addresses** (derived from the Deterministic Structural Addressing grammar)
- it emits **reorganization suggestions** that make patterns more explicit and future additions easier to navigate
- it never renames or moves files

This slice exists to reduce “tree drift” as additional validators beyond naming are added.

### Suite-core vs owned-slice boundary principle

Tree advisor structural reasoning also includes an ownership-boundary principle aligned with current repo architecture:

- `calculogic-validator/src/**` is suite-core/shared infrastructure and compat-boundary surface
- validator-owned slices with their own internal growth path belong in slice roots outside suite-core `src/` (for example `calculogic-validator/naming/src/**`, `calculogic-validator/tree/src/**`)
- continued owned-slice growth inside suite-core `src/` is structural drift because it predicts avoidable future extraction/shim/refactor debt

This principle is advisory and architecture-oriented; it does not mean one universal folder layout is required for every repo.

## Suite Contract Alignment

This slice follows the shared suite contract in [`ValidatorSuite-Contracts-And-Modes.md`](../ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md): the validator suite is modular, configurable, policy-driven, and report-first by default. Tree advisor V0.1.5 remains report-only even though additional policy modes exist suite-wide.

### In scope (V0.1.5 hardened subset)

- Parse `<semantic-name>.<role>.<ext>` metadata when applicable
- Use role registry metadata (role category/status) as structured signal
- Analyze _where_ semantic families and lanes (roles/categories) cluster or scatter
- Emit findings that recommend:
  - new namespace folders (domain roots)
  - consolidation of scattered semantic families
  - separation of mixed lanes where mixing predicts growth pain
  - normalization of repeated validator-subtree scaffolds (for future validators)
- Shim/compat advisory hardening with bounded evidence precedence and intentional pass-through carveouts, including package/public barrel pass-through (`calculogic-validator/src/index.mjs`) with `export * from`, `export * as <name> from`, and optional `export { ... } from` forms
- Weak token/path-only shim observability may suppress detector-implementation modules inside `calculogic-validator/tree/src/` when `shim` appears only as part of the detector semantic name (for example `*shim-detection*`) and no thin re-export evidence exists

### Out of scope (V0.1.5)

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

## Conceptual Model

This validator treats **folders as scope roots** (host-like boundaries), and filenames as **lane signals**:

- **Scope roots** (host-like boundaries):
  - `bin/`, `scripts/`, `src/`, `test/`, `tools/<tool>/...` (example surfaces)
- **Lanes**:
  - derived from `<role>` and role category/status (concern-core vs architecture-support vs documentation, etc.)
- **Semantic families**:
  - derived from `<semantic-name>` grouping (e.g., `validator-config.*`, `naming-rule-*`, `report-capture.*`)

Goal: surface emergent patterns and recommend a structure that makes those patterns obvious.

Boundary note (canonical_target for this slice): tree validator ownership is under `calculogic-validator/tree/src/**`. Legacy flat suite-core paths such as `calculogic-validator/src/tree-structure-advisor.*.mjs` are compatibility wrappers only, not canonical ownership.

---

## Tree Addressing (Report-Only)

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

## Tree Snapshot Inputs (TreeManifest / TreeSnapshot)

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

### Recommended shape-level schema (doc-only)

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

## Input Scope Profiles

Tree advisor scope selection should reuse the existing validator scope discovery model (repo/app/docs/validator/system), plus optional target filtering.

- Default scope: `repo`
- Supports: `--scope=<scopeName>`
- Supports: `--target <path>` (repeatable; union)

Target filtering applies after scope discovery and before analysis.

---

## Analysis Heuristics (Deterministic)

V0.0.1 uses deterministic heuristics that are explainable in findings.

### 1) Semantic family cohesion

Detect when a semantic family (shared `<semantic-name>` prefix) is scattered across too many unrelated folders.

Example family keys:

- exact semantic name: `validator-config`
- configured “family prefix rule” (optional): `naming-rule-*` → family `naming-rule`

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

## Recommendation Patterns (Advisory Only)

The following outputs are advisory recommendation patterns only. They are not mandatory rules and should be emitted as explainable `suggested-reorg` findings.

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
- A semantic family (derived from parsed `<semantic-name>`) appears under >= 2 distinct lane-first partitions within that shared root.
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

## Classification Outputs

Stable classifications (suggested V0.0.1):

- `observed-structure` (info): a pattern recognized and recorded (useful for mapping)
- `suggested-reorg` (warn/info): an actionable recommendation
- `non-actionable` (info): recognized but intentionally not recommended (to avoid churn)

Severity:

- `info` or `warn` (no error in report mode)

---

## Finding Schema

Each finding uses the same stable envelope shape used by existing validators:

- `code` (string)
- `severity` (`info` | `warn`)
- `path` (normalized relative path; when folder-scoped, path is the folder root)
- `classification` (enum)
- `message` (short human-readable summary)
- `ruleRef` (spec reference pointer, e.g. `tree-structure-advisor-validator-spec.md#...`)
- `suggestedFix` (optional, advisory-only; e.g., proposed move set)
- `details` (object, deterministic)

### Tree-Advisor details fields (recommended)

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

## Finding / Code Set (Draft)

Suggested codes (V0.0.1):

- `TREE_OBSERVED_FAMILY_CLUSTER`
- `TREE_FAMILY_SCATTERED`
- `TREE_LANE_MIX_HIGH_ENTROPY`
- `TREE_MISSING_NAMESPACE_ROOT`
- `TREE_SUBSYSTEM_SCAFFOLD_ASYMMETRY`
- `TREE_TOOL_SURFACE_MIX`
- `TREE_SHIM_SURFACE_PRESENT` (`info`) — implemented (thin-reexport high-confidence + runtimeish token-only info)
- `TREE_SHIM_SCATTERED` (`warn`/`info`) — planned
- `TREE_SHIM_OUTSIDE_COMPAT` (`warn`) — implemented (thin re-export evidence only)
- `TREE_SHARED_LANE_FIRST_PARTITION_PRESENT` (`info`)
- `TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES` (`warn`/`info`)
- `TREE_SHARED_SEMANTIC_ROOT_RECOMMENDED` (`warn`/`info`)
- `TREE_OWNED_SLICE_BOUNDARY_DRIFT` (`warn`/`info`) — future advisory direction
- `TREE_OWNED_SLICE_EXTRACTION_RECOMMENDED` (`warn`/`info`) — future advisory direction

---

## Report Object Additions

Report object SHOULD include:

- `mode` (always `report` in V0.0.1)
- `scope`
- `totalFilesScanned`
- `summary` counts by classification + by lane index
- `addressing.hostBindings[]` (required)
- `findings[]` (sorted deterministically)

### Prepared runtime input contract (wiring/runtime boundary)

The runtime entrypoint expects prepared inputs from wiring/runtime adapters and must fail clearly when the contract is bypassed.

Required prepared fields:

- `selectedPaths` (array)
- `topLevelDirectoryNames` (array)
- `targets` (array)
- `getFileContent(relativePath)` (function)

Runtime must treat file content access as lazy and callable on demand by path, instead of requiring an eagerly materialized full-file map.

---

## Determinism Requirements

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

## Rollout Modes

Mode semantics are centralized in [`ValidatorSuite-Contracts-And-Modes.md`](../ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md).

Tree advisor V0.0.1 implementation status:

- `report` only
  - never fails due to tree findings
  - fails only on invalid CLI usage (unknown scope, nonexistent target)

Suite policy options (`soft-fail`, `hard-fail`, `correct`, `replace`) are contract-level modes and are deferred for this slice.

---

## CLI Usage (Draft)

Suggested entrypoints (aligning to existing patterns):

- `npm run validate:tree` (defaults to `--scope=repo`)
- `npm run validate:tree -- --scope=app`
- `npm run validate:tree -- --scope=validator`
- `npm run validate:tree -- --scope=app --target calculogic-validator/tree/src`

Npm forwarding requirement remains: flags must be passed after `--`.

---

## Non-Goals (Restated)

- This slice is not a “tree linter that blocks PRs” yet.
- It does not define a single canonical folder layout.
- It does not introduce filename numbering or address stamping into paths.
- It does not validate NL↔code atom parity or provenance token correctness.
