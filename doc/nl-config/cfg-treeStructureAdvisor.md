# cfg-treeStructureAdvisor

## 0.0 Version

Current implementation target: **V0.1.2** (wiring-owned scoped/target input preparation and runtime prepared-input consumption).

## 1.0 Purpose

Add a conservative tree-structure advisor validator slice that proves validator-suite multi-slice execution while remaining report-only and non-destructive.

V0.1.1 converges this slice to a canonical owned boundary under `calculogic-validator/src/tree/` to match naming-slice boundary conventions.

## 2.0 Inputs and Source of Truth

### 2.1 Scope and targets

- Uses validator suite scope resolution (`repo|app|docs|validator|system`).
- Supports optional runner-forwarded `targets` when selected through `validate-all` with deterministic validation and selection parity to suite target semantics.
- Default scope remains `repo` via existing runner behavior.

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
- No fix mode, no move/rename behavior.

## 5.0 Deferred Behavior

Deferred to later slices:

- docs/runtime/test co-location drift heuristics
- mixed concern folder smell heuristics
- structural recommendation planning and move proposals
- any mutating or fix-mode behavior
