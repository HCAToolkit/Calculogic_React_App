# cfg-treeStructureAdvisor

## 0.0 Version

Current implementation target: **V0.1.0** (first real advisory-only validator slice).

## 1.0 Purpose

Add a conservative tree-structure advisor validator slice that proves validator-suite multi-slice execution while remaining report-only and non-destructive.

## 2.0 Inputs and Source of Truth

### 2.1 Scope and targets

- Uses validator suite scope resolution (`repo|app|docs|validator|system`).
- Supports optional runner-forwarded `targets` when selected through `validate-all`.
- Default scope remains `repo` via existing runner behavior.

### 2.2 Repository signals

V0.1.0 uses deterministic path-based signals only:

- top-level directory names in repository root
- repository-relative file paths
- filename basename patterns that strongly indicate validator ownership

### 2.3 Initial advisory heuristics (narrow slice)

1. **Top-level unexpected-folder advisory**
   - Emit info advisory for clearly unusual non-hidden top-level folders outside known repo shape.
2. **Validator-owned-looking file outside validator tree**
   - Emit info advisory when filename/path signal strongly indicates validator ownership but file is outside `calculogic-validator/**`.

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

## 4.0 Registration and Execution

- Registered in validator registry alongside naming validator.
- Default runner execution includes both `naming` and `tree-structure-advisor` in deterministic registry order.
- No fix mode, no move/rename behavior.

## 5.0 Deferred Behavior

Deferred to later slices:

- docs/runtime/test co-location drift heuristics
- mixed concern folder smell heuristics
- structural recommendation planning and move proposals
- any mutating or fix-mode behavior
