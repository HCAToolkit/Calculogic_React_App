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

- tree runtime now supports a bounded naming→tree prepared-input bridge for contributor-backed semantic-family advisory consumption
- consumed bridge payload is naming-owned evidence projection only (not raw naming runtime internals)
- shipped semantic-family tree advisories remain report-first and deterministic
- tree findings continue to be driven by deterministic path/basename/scope/target/shim/occurrence signals plus naming bridge evidence staged by the shared runner when tree executes through normal runner paths
- tree heuristics that need semantic-family or role information must consume naming-derived signals rather than re-implement naming interpretation locally

Bounded consumable naming bridge surfaces include:

- `path`
- `semanticName`
- `familyRoot`
- `semanticFamily`
- optional `familySubgroup`
- optional `ambiguityFlags[]`
- optional `splitFamilyFlags[]`

Tree advisor does **not** re-own naming validity judgments. Naming validity remains owned by naming conventions/specs and the naming validator slice.

### Naming-bridge placement model (Status: Bounded modeling note)

Classification: Informative

Tree now carries a bounded, explicit placement model when consuming naming-bridge observations so structural and semantic placement can be interpreted side-by-side without collapsing them into one field.

At minimum, the placement model distinguishes:

- `structuralRoot`
- `structuralSurface`
- `structuralHome`
- `localStructuralHome`
- `semanticContainerIdentity`
- `semanticHome`
- `semanticSubhome`

On top of those placement fields, tree also records a bounded local placement-coherence classification so the local relationship between structural and semantic placement is explicit and inspectable.

Bounded local placement-coherence values in this tranche:

- `aligned-local-home`
- `structural-home-only`
- `semantic-home-only`
- `divergent-local-placement`
- `no-semantic-home`

Ownership and interpretation guardrails for this tranche:

- naming still owns `familyRoot`, `semanticFamily`, and optional `familySubgroup`
- tree consumes those naming-owned signals plus path structure to interpret semantic placement
- this tranche adds bounded placement modeling plus local structural-vs-semantic coherence classification only
- this tranche does not broaden finding behavior (no new finding families/codes and no intentional threshold/count/severity broadening)
- semantic placement values in this tranche are folder/subfolder-derived interpretations
  - `semanticContainerIdentity` resolves to a folder/subfolder home, not a filename path
  - `semanticHome` resolves to a folder/subfolder home, not a filename path
  - `semanticSubhome`, when present, resolves to a folder/subfolder home, not a filename path
  - filename-level semantic token hits may remain visible in alignment/explanation details, but do not become semantic home/container values

Examples of naming validity judgments that tree advisor must not duplicate:

- bad semantic case
- missing role
- deprecated role
- hyphen-role ambiguity

When usable naming-shaped metadata is unavailable, incomplete, or not yet wired into tree runtime in a bounded context, tree advisor should reduce confidence and/or recommend running naming validation rather than inventing naming-invalid findings inside tree output.

Bridge shape (prepared-input contract):

- `namingSemanticFamilyBridge.observations[]`
  - `path`
  - `semanticName`
  - `familyRoot`
  - `semanticFamily`
  - optional `familySubgroup`
  - optional `ambiguityFlags[]`
  - optional `splitFamilyFlags[]`

Tree consumes this normalized bridge payload only. Tree runtime must not parse filenames to recreate these fields.

### Family-scatter structural gating (Status: Current runtime behavior, bounded)

`TREE_FAMILY_SCATTERED` now applies a bounded tree-owned structural interpretation layer before emitting broader scatter:

- tree classifies each family observation by structural root/surface and naming-aligned semantic-container placement,
- semantic-container recognition is based on path alignment with naming-owned bridge evidence (`familyRoot`, `semanticFamily`, optional `familySubgroup`), not a hardcoded semantic-folder allowlist,
- tree evaluates family interpretation in explicit local-first order:
  1. structural placement,
  2. semantic placement,
  3. local placement coherence,
  4. local-first family interpretation lane selection,
  5. bounded broader-spread interpretation for families that survive local-first review,
  6. broad scatter eligibility only when both local and broader interpretation remain unresolved,
- family presence confined to one valid naming-aligned semantic container is treated as expected/container-local density/subgroup opportunity first (not immediate broad scatter),
- bounded allowed cross-container pairings are exempt from broad scatter by default (for example canonical docs authority lane with aligned owned runtime container pairing),
- broad scatter remains for family spread across unrelated structural homes/containers when no allowed pairing covers the spread.

Current bounded local-first family interpretation outcomes used for this gate:

- `expected-local-presence`
- `local-density-first`
- `local-subgroup-first`
- `local-divergence-needs-broader-review`
- `no-local-semantic-explanation`

Behavior boundary for this slice:

- no new findings/codes are introduced,
- this slice only refines when existing broad-scatter eligibility (`TREE_FAMILY_SCATTERED`) is allowed after local-first interpretation.

### Bounded broader-spread interpretation layer (Status: Current runtime behavior, bounded)

Classification: Normative

After local-first interpretation, tree now applies a bounded broader-spread interpretation layer before final `TREE_FAMILY_SCATTERED` escalation.

Bounded scope for this layer:

- runs only when local-first interpretation is one of:
  - `local-divergence-needs-broader-review`
  - `no-local-semantic-explanation`
- reuses already-shipped bounded explainable spread rules (for example: same semantic container, allowed structural-root pairing, canonical docs authority/runtime pairing)
- remains deterministic and inspectable; no fuzzy or open-ended policy expansion

Bounded broader-spread interpretation outcomes:

- `allowed-broader-spread`
- `docs-runtime-paired-spread`
- `cross-concern-but-explainable`
- `unresolved-broader-spread`

Escalation intent:

- local-first local lanes remain the shared decision spine for local family outcomes,
- broader-spread interpretation is only a review layer for families that survive local-first checks,
- `TREE_FAMILY_SCATTERED` represents unresolved spread after both local and broader interpretation do not sufficiently explain placement.

### Shared local-first family interpretation spine for family outcomes (Status: Current runtime behavior, bounded)

Classification: Normative

Current family-level tree outcomes now share one bounded local-first interpretation authority (`interpretFamilyLocalFirst`) before emitting family findings.

The shared local-first interpretation spine routes existing family findings as follows:

- `expected-local-presence`
  - suppresses broad scatter (`TREE_FAMILY_SCATTERED`)
  - does not force local debt-style cluster/subgroup signaling
- `local-density-first`
  - enables cluster-first local signaling (`TREE_OBSERVED_FAMILY_CLUSTER`) using existing bounded thresholds/details
  - suppresses broad scatter-first routing
- `local-subgroup-first`
  - enables subgroup-opportunity-first local signaling (`TREE_FAMILY_SUBGROUP_OPPORTUNITY`) using existing bounded thresholds/details
  - suppresses broad scatter-first routing
- `local-divergence-needs-broader-review`
  - routes to bounded broader-spread interpretation review first
  - keeps broad scatter (`TREE_FAMILY_SCATTERED`) eligible only when broader-spread interpretation remains unresolved
- `no-local-semantic-explanation`
  - routes to bounded broader-spread interpretation review first
  - keeps broad scatter (`TREE_FAMILY_SCATTERED`) eligible only when broader-spread interpretation remains unresolved

Boundary notes for this consolidation slice:

- no new finding codes are introduced,
- no new family/advisory families are introduced,
- routing is consolidated so existing family findings derive from one bounded local-first interpretation model,
- naming ownership remains unchanged (`familyRoot`, `semanticFamily`, optional `familySubgroup` stay naming-owned).

### Shared-root lane spread routing inside the shared family interpretation spine (Status: Current runtime behavior, bounded)

Classification: Normative

`TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES` remains an existing bounded code, and its emission is now decision-routed by the same shared family interpretation spine used by other family outcomes.

Routing and meaning in this slice:

- shared-root lane spread is no longer treated as a separate family-reasoning island,
- eligibility is evaluated from shared family analysis grouped by naming-owned `semanticFamily`,
- shared-root lane counts/partitions remain bounded decision inputs, but they are no longer a standalone threshold collector that emits first and only carries shared-spine context afterward,
- local-first and broader-spread outcomes from the shared spine now gate whether shared-root lane spread is the selected outcome,
- emission occurs only when bounded shared-spine interpretation resolves to shared-root lane spread (rather than from lane thresholds alone),
- this consolidation adds no new finding family and does not alter naming ownership boundaries.

Bounded intent:

- preserve the existing finding code (`TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES`),
- keep shared-root lane spread as a bounded, explicit, deterministic, inspectable outcome within the existing local-first → broader-spread family reasoning flow,
- avoid introducing new policy surfaces beyond this routing consolidation slice.

### Family subgroup opportunity inside one semantic container (Status: Current runtime behavior, bounded)

`TREE_FAMILY_SUBGROUP_OPPORTUNITY` is a bounded, info-level, advisory-only signal for lower-level family grouping opportunity *inside one naming-aligned semantic container*.

Current runtime trigger posture:

- observations must be singular naming evidence (`ambiguityFlags[]` absent),
- observations for the family must all classify to one valid naming-aligned semantic container identity,
- density must meet explicit thresholds (`minFilesInContainer`, `minDistinctContainerLocalHomes`),
- lower-level grouping signal must be present (currently from naming-owned `familySubgroup` or `semanticFamily` alignment with `familyRoot`),
- this signal is container-local guidance and does not replace broad cross-container scatter behavior.

Boundary note:

- broad cross-container spread remains represented by `TREE_FAMILY_SCATTERED`,
- container-local high-count observability remains represented by `TREE_OBSERVED_FAMILY_CLUSTER`,
- subgroup opportunity is the bounded “between” signal for dense/cohesive lower-level grouping in one semantic container.

Ownership boundary remains unchanged:

- naming owns semantic-family derivation and validity semantics,
- tree owns structural interpretation/gating decisions that consume naming bridge evidence.

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

### 5) Structural-root vs semantic-container modeling clarification (bounded; non-runtime)

Classification: Informative

This bounded modeling note preserves ownership and interpretation direction for future tree hardening without claiming shipped behavior changes.

- **Structural folders/nodes** are tree-owned structural surfaces and are the most direct candidates for eventual registry-backed tree-node modeling.
- **Semantic folders** should generally be interpreted through alignment with naming-owned semantic-family signals (for example `semanticFamily`, `familyRoot`, optional `familySubgroup`) rather than as an independent flat truth source owned by tree.
- **Top-level semantic folders** (repo-shape dependent examples can include `tree/` and `naming/`) may function as semantic-family containers, not only as generic folder roots.
- Inside one such top-level semantic container, lower-level family distribution should be evaluated first as:
  1. expected family presence / healthy family density,
  2. lower-level family subfolder opportunity,
  3. and only secondarily as broader scatter.
- **Cross-container family presence** should count as meaningful scatter only when no allowed structural or cross-concern rule explains that placement.
- Tree organization and tree addressing stay distinct from file-level structural addressing concerns; tree addressing remains tree-owned report/organization metadata and does not re-own naming derivation.

Ownership boundary restatement:

- naming slice owns semantic-family derivation (`semanticFamily`, `familyRoot`, `familySubgroup`)
- tree slice owns folder/node interpretation and may consume naming-owned derivation as bounded evidence
- tree must not re-derive or re-own naming validity semantics

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

This section is a deferred heuristic menu, not a statement of currently emitted tree behavior, except where explicitly noted as shipped below. Current runtime only ships the bounded findings listed later under **Current Runtime Boundary and Shipped Findings**.

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

### 3) Shared-root semantic-first grouping (advisory-only; partially shipped)

Intent:

- At shared-root level (default example: `src/shared/`), prefer semantic-first grouping.
- Preferred target: `src/shared/<semantic-family>/...`
- Avoid recommending: `src/shared/<lane>/...` as the target structure.

Detect (deterministic):

- A shared root is one of a configured set (V0.0.1 default example: `src/shared`).
- The shared root contains lane-first partitions as immediate child folders (examples):
  - `logic`, `knowledge`, `results`, `build`, `build-style`, `results-style`, `tests`, `docs`
- A semantic family output supplied by naming (derived from parsed `<semantic-name>`) appears under >= 2 distinct lane-first partitions within that shared root.
- Guardrail: only recommend when the family has >= configured minimum files (reduces churn/noise).

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

- `TREE_OBSERVED_FAMILY_CLUSTER` (`info`) — implemented via naming bridge contributor (bounded thresholded cluster observability, aggregated deterministically at semanticFamily level or semanticFamily-in-container when all family observations are naming-aligned to semantic containers)
- `TREE_FAMILY_SCATTERED` (`info`) — implemented via naming bridge contributor (bounded family scatter advisory)
- `TREE_LANE_MIX_HIGH_ENTROPY`
- `TREE_MISSING_NAMESPACE_ROOT`
- `TREE_SUBSYSTEM_SCAFFOLD_ASYMMETRY`
- `TREE_TOOL_SURFACE_MIX`
- `TREE_SHIM_SCATTERED` (`warn`/`info`)
- `TREE_SHARED_LANE_FIRST_PARTITION_PRESENT` (`info`)
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
- Current tree runtime does **not** emit tree addresses or move proposals. Naming bridge payload is consumed as contributor input and is not re-emitted as a raw payload surface.

### Composition ownership

- Tree wiring prepares tree-core inputs and calls tree contributor assembly for default contributors.
- Default contributor selection is owned by `tree-structure-advisor-contributors-assembly.wiring.mjs`, not by tree core.
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

Attached naming-bridge contributor currently ships during normal tree runs:

- `TREE_FAMILY_SCATTERED`
- `TREE_OBSERVED_FAMILY_CLUSTER`
- `TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES` (bounded shared-root lane-first spread outcome emitted from the shared family interpretation spine under supported shared roots, using naming-owned bridge observations only)

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
