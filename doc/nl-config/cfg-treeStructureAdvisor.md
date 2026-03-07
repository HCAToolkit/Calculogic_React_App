# cfg-treeStructureAdvisor

## 0.0 Version

Current implementation target: **V0.1.4** (shim evidence hardening: bounded artifact surface context + intentional pass-through carveouts while preserving thin re-export shim detection).

## 1.0 Purpose

Add a conservative tree-structure advisor validator slice that proves validator-suite multi-slice execution while remaining report-only and non-destructive.

V0.1.1 converges this slice to a canonical owned boundary under `calculogic-validator/src/tree/` to match naming-slice boundary conventions.

## 2.0 Inputs and Source of Truth

### 2.1 Scope and targets

- Uses validator suite scope resolution (`repo|app|docs|validator|system`).
- Supports optional runner-forwarded `targets` when selected through `validate-all` with deterministic validation and selection parity to suite target semantics.
- Supports the same optional repeatable target filtering when selected through dedicated `validate-tree` CLI (`--target <path>` and `--target=<path>`).
- Default scope remains `repo` via existing runner behavior.

### 2.5 Dedicated CLI surface (`validate-tree`) (V0.1.3)

`validate-tree` is a thin report-mode CLI wrapper over the validator runner with a fixed validator set containing only `tree-structure-advisor`.

Contract:

- accepts `--help`
- accepts optional `--scope=<repo|app|docs|validator|system>`
- accepts optional repeatable targets via `--target <path>` and `--target=<path>`
- preserves npm argument-forwarding guard behavior used by validator script surfaces
- emits JSON report envelope aligned with runner report conventions
- remains report-only (no fix/mutate behavior)

### 2.2 Repository signals

V0.1.x uses deterministic path-based signals only:

- top-level directory names in repository root
- repository-relative file paths
- filename basename patterns that strongly indicate validator ownership

### 2.3 Initial advisory heuristics (narrow slice)

1. **Top-level unexpected-folder advisory**
   - Emit info advisory for clearly unusual non-hidden top-level folders outside known repo shape.
2. **Validator-owned-looking file outside validator tree**
   - Emit info advisory when filename/path signal strongly indicates validator ownership but file is outside `calculogic-validator/**`.

3. **Shim/compat surface advisory (hardened evidence precedence, V0.1.4)**
   - Collects deterministic shim evidence per file with bounded fields:
     - `artifactSurface` (`quality|docs|examples|fixtures|runtimeish`)
     - folder token signals, basename token signals
     - `thinReexportShim`, `canonicalTargetPath`, `reexportTargetCount`
     - `insideCompatSurface`
     - intentional pass-through markers (`isCanonicalHostPassThrough`, `isPublicEntryPointPassThrough`)
   - Thin re-export remains the strongest/high-confidence shim signal.
   - Token/path-only shim signals on non-runtime surfaces (`quality/docs/examples/fixtures`) are suppressed from shim-debt findings.
   - Intentional pass-through surfaces are excluded from shim debt:
     - canonical `*.host.* -> sibling *.wiring.*` forwarding inside owned slices
     - public package entrypoint barrel (`calculogic-validator/src/index.mjs`)
   - Runtimeish token/path-only matches remain info-level observability (`TREE_SHIM_SURFACE_PRESENT`) and do not emit debt-style `TREE_SHIM_OUTSIDE_COMPAT` unless thin re-export evidence exists.


### 2.4 Input ownership split (V0.1.2)

V0.1.2 aligns tree with naming input ownership discipline:

- wiring resolves scope profile and validates target paths
- wiring prepares scoped path inventory and target-filtered selected paths
- wiring prepares top-level directory inventory used by repo-scope top-level advisory checks
- runtime consumes prepared inputs only and emits deterministic findings/summary-compatible output

Target behaviors in V0.1.2:

- no targets: analyze all scoped selected paths
- file/directory targets: analyze only selected in-scope paths under target union
- invalid/nonexistent/escaping targets: deterministic failures aligned with suite target contract

## 3.0 Output Contract

### 3.1 Report shape alignment

Findings flow through the existing suite validator entry shape:

- `id = tree-structure-advisor`
- `summary.counts`
- `findings[]`

### 3.2 Finding shape (advisory-only)

Each finding follows existing report conventions:

- `code`
- `severity` (`info` only in this slice)
- `path`
- `classification = advisory-structure`
- `message`
- optional `details`
- optional `ruleRef`

### 3.3 Determinism requirements

- normalize separators to `/`
- stable sorting by `path` then `code`
- deterministic message text and codes

## 4.0 Registration, Boundary, and Execution

- Canonical tree slice boundary lives at:
  - `calculogic-validator/src/tree/tree-structure-advisor.host.mjs`
  - `calculogic-validator/src/tree/tree-structure-advisor.wiring.mjs`
  - `calculogic-validator/src/tree/tree-structure-advisor.logic.mjs`
  - optional contracts surface: `calculogic-validator/src/tree/tree-structure-advisor.contracts.mjs`
- Registry/index/package exports target the canonical `src/tree/` host boundary.
- Flat legacy paths under `calculogic-validator/src/tree-structure-advisor.*.mjs` remain compatibility shims only (re-export wrappers) during migration.
- Default runner execution includes both `naming` and `tree-structure-advisor` in deterministic registry order.
- Dedicated `validate-tree` execution includes only `tree-structure-advisor` while preserving shared runner scope/target semantics.
- No fix mode, no move/rename behavior.

## 5.0 Deferred Behavior

Deferred to later slices:

- docs/runtime/test co-location drift heuristics
- mixed concern folder smell heuristics
- structural recommendation planning and move proposals
- any mutating or fix-mode behavior
