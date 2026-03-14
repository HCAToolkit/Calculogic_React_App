# cfg-treeStructureAdvisor

Status labeling for this NL/config note:

- **Current implementation target** = currently shipped/active runtime target for this slice.
- **Deferred Behavior** = future advisory direction, not shipped runtime behavior.
- Repo-shape examples are current-repo implementation reality, not universal published builtin requirements.

Navigation backlinks:

- Tree validator spec (runtime authority): [`calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md`](../tree-structure-advisor-validator-spec.md)
- Tree documentation map (navigation metadata): [`calculogic-validator/doc/ValidatorSpecs/tree-documentation-map-and-reorg-inventory.md`](../tree-documentation-map-and-reorg-inventory.md)
- Pointer stub at prior path: [`doc/nl-config/cfg-treeStructureAdvisor.md`](../../../../doc/nl-config/cfg-treeStructureAdvisor.md)

Canonical reading order for tree implementation work:

1. `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
2. `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md`
3. `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
4. `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md` (this document)

## 0.0 Version

Current implementation target: **V0.1.5** (shim evidence hardening with robust public-entrypoint barrel carveout coverage for `export *`, `export * as <name>`, and optional `export { ... } from` pass-through forms while preserving thin re-export shim detection).

## 1.0 Purpose

Add a conservative tree-structure advisor validator slice that proves validator-suite multi-slice execution while remaining report-only and non-destructive.

V0.1.1 converges this slice to a canonical owned boundary under `calculogic-validator/tree/src/` to match naming-slice boundary conventions.

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
   - Builtin known-root baseline remains bounded/deterministic and includes stable current peers: `bin`, `calculogic-doc-engine`, `calculogic-validator`, `doc`, `docs`, `public`, `scripts`, `src`, `test`, `tools`.
2. **Validator-owned-looking file outside validator tree**
   - Emit info advisory when filename/path signal strongly indicates validator ownership but file is outside `calculogic-validator/**`.

3. **Shim/compat surface advisory (hardened evidence precedence, V0.1.5)**
   - Collects deterministic shim evidence with staged evaluation (path/surface/token-first; content reads only for deterministic shim candidates) and bounded fields:
     - `artifactSurface` (`quality|docs|examples|fixtures|runtimeish`)
     - folder token signals, basename token signals
     - `thinReexportShim`, `canonicalTargetPath`, `reexportTargetCount`
     - `insideCompatSurface`
     - intentional pass-through markers (`isCanonicalHostPassThrough`, `isPublicEntryPointPassThrough`)
   - Thin re-export remains the strongest/high-confidence shim signal.
   - Token/path-only shim signals on non-runtime surfaces (`quality/docs/examples/fixtures`) are suppressed from shim-debt findings.
   - Intentional pass-through surfaces are excluded from shim debt:
     - canonical `*.host.* -> sibling *.wiring.*` forwarding inside owned slices
     - public package entrypoint barrel (`calculogic-validator/src/index.mjs`) including `export * from`, namespace re-export (`export * as <name> from`), and optional `export { ... } from` forms
   - Runtimeish token/path-only matches remain info-level observability (`TREE_SHIM_SURFACE_PRESENT`) and do not emit debt-style `TREE_SHIM_OUTSIDE_COMPAT` unless thin re-export evidence exists.


### 2.4 Input ownership split (V0.1.6)

V0.1.6 introduces a suite-core scoped snapshot/input helper boundary and migrates tree as the first consumer:

- suite-core helper owns scope profile read, includeRoots walk, includeRootFiles inclusion, normalized path collection, target filtering, and deterministic sort/dedupe
- tree wiring consumes the shared scoped snapshot input and still prepares tree-local top-level directory inventory
- tree runtime remains slice-owned for tree-core findings using prepared tree-core inputs only (`selectedPaths`, `topLevelDirectoryNames`, `targets`)
- tree-run default contributor selection is owned by a dedicated assembly/wiring module so tree wiring only prepares tree-core inputs
- shim/content-backed diagnostics are attached from a shim-owned contributor helper that prepares lazy content access (cache + selected-path guard) so tree-core runtime does not require file-content access
- naming stays on existing local collection/interpretation path in this increment (no naming behavior changes)

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
  - `calculogic-validator/tree/src/tree-structure-advisor.host.mjs`
  - `calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs`
  - `calculogic-validator/tree/src/tree-structure-advisor-contributors.assembly.wiring.mjs`
  - `calculogic-validator/tree/src/tree-structure-advisor.logic.mjs`
  - shim evidence/runtime helpers: `calculogic-validator/tree/src/tree-shim-detection.logic.mjs`
  - optional contracts surface: `calculogic-validator/tree/src/tree-structure-advisor.contracts.mjs`
- Registry/index/package exports target the canonical `tree/src/` host boundary.
- Flat legacy paths under `calculogic-validator/src/tree-structure-advisor.*.mjs` remain compatibility shims only (re-export wrappers) during migration.
- Default runner execution includes both `naming` and `tree-structure-advisor` in deterministic registry order.
- Dedicated `validate-tree` execution includes only `tree-structure-advisor` while preserving shared runner scope/target semantics.
- No fix mode, no move/rename behavior.

## 5.0 Deferred Behavior (future advisory direction; not current runtime behavior)

Deferred to later slices:

- docs/runtime/test co-location drift heuristics
- mixed concern folder smell heuristics
- structural recommendation planning and move proposals
- any mutating or fix-mode behavior
