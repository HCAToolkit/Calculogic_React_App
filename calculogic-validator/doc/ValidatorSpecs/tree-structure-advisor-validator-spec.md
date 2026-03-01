# Tree Structure Advisor Validator Spec (Draft V0.0.1)

## Purpose and Scope

This document defines a **Tree Structure Advisor** validator slice whose output is **advisory**:
- it analyzes repository **folder structure + filename semantics**
- it assigns **report-only tree addresses** (derived from the Deterministic Structural Addressing grammar)
- it emits **reorganization suggestions** that make patterns more explicit and future additions easier to navigate
- it never renames or moves files

This slice exists to reduce “tree drift” as additional validators beyond naming are added.

### In scope (V0.0.1)
- Parse `<semantic-name>.<role>.<ext>` metadata when applicable
- Use role registry metadata (role category/status) as structured signal
- Analyze *where* semantic families and lanes (roles/categories) cluster or scatter
- Emit findings that recommend:
  - new namespace folders (domain roots)
  - consolidation of scattered semantic families
  - separation of mixed lanes where mixing predicts growth pain
  - normalization of repeated validator-subtree scaffolds (for future validators)

### Out of scope (V0.0.1)
- Applying any filesystem changes (no auto-move, no auto-fix)
- Enforcing a single “correct tree” (recommendations are heuristic + explainable)
- Import graph analysis (deferred; optional future enhancement)
- Structural addressing validation of NL/code atoms (not this slice)
- Semantic correctness of code behavior (not this slice)

---

## Source-of-Truth References

- Deterministic address grammar + concern slot semantics:
  - `doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md`
- Canonical filename grammar + role registry categories/status:
  - `doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
- Naming validator conventions (classification shape, determinism expectations):
  - `doc/ConventionRoutines/NamingValidatorSpec.md`

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

This slice must preserve the existing concern slot semantics where applicable while allowing non-CSCS lanes.

**Concern-aligned lanes (match existing concern indices):**
- `3` Build
- `4` BuildStyle
- `5` Logic
- `6` Knowledge
- `7` Results
- `8` ResultsStyle

**Non-concern lanes (tree advisor only; not CSCS concerns):**
- `2` ArchitectureSupport (roles like `host`, `wiring`, `contracts`)
- `10` Tests (test-only surfaces and fixtures clusters)
- `11` ToolingSurface (bin/scripts/tool wrappers; report-only lane)
- `12` DocumentationSurface (docs-only roots; report-only lane)

Notes:
- This lane extension is permitted only because these Tree Addresses are report-only.
- When a filename role is concern-core, it MUST map to its concern index (3–8).
- When a filename role is architecture-support, it MUST map to lane `2`.

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

All scoring thresholds MUST be explicit constants in code and reported in `details`.

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

---

## Report Object Additions

Report object SHOULD include:
- `mode` (always `report` in V0.0.1)
- `scope`
- `totalFilesScanned`
- `summary` counts by classification + by lane index
- `addressing.hostBindings[]` (required)
- `findings[]` (sorted deterministically)

---

## Determinism Requirements

- Normalize path separators to `/`
- Use explicit include/exclude sets per scope
- Parse filename metadata deterministically (no inference beyond registry rules)
- All clustering keys must be deterministic:
  - stable string keys derived from path + parsed name components
- Findings sorted by:
  1) `path` asc
  2) `code` asc
  3) stable secondary keys in `details` (if needed)
- Identical repo state + same CLI inputs => identical report ordering and counts

---

## Rollout Modes

V0.0.1:
- `report` only
  - never fails due to tree findings
  - fails only on invalid CLI usage (unknown scope, nonexistent target)

Deferred:
- `soft-fail` / `hard-fail` modes for structural guidance (only after long stabilization)

---

## CLI Usage (Draft)

Suggested entrypoints (aligning to existing patterns):
- `npm run validate:tree` (defaults to `--scope=repo`)
- `npm run validate:tree -- --scope=app`
- `npm run validate:tree -- --scope=validator`
- `npm run validate:tree -- --scope=app --target calculogic-validator/src`

Npm forwarding requirement remains: flags must be passed after `--`.

---

## Non-Goals (Restated)

- This slice is not a “tree linter that blocks PRs” yet.
- It does not define a single canonical folder layout.
- It does not introduce filename numbering or address stamping into paths.
- It does not validate NL↔code atom parity or provenance token correctness.
