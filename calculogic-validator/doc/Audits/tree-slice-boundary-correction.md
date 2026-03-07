# Tree slice boundary correction audit

## 1. Purpose

This audit records the ownership-boundary correction that moved the canonical tree validator slice out of suite-core `calculogic-validator/src/` and into its own owned slice root.

## 2. Canonical path correction

- Previous canonical_source tree location: `calculogic-validator/src/tree/**`
- New canonical_source tree location: `calculogic-validator/tree/src/**`
- Suite-core `calculogic-validator/src/**` remains shared infra + compat boundary only.

## 3. Runtime/module updates applied

### 3.1 Tree module move

Moved canonical tree-owned implementation files from `calculogic-validator/src/tree/` to `calculogic-validator/tree/src/`:

- `tree-structure-advisor.host.mjs`
- `tree-structure-advisor.wiring.mjs`
- `tree-structure-advisor.logic.mjs`
- `tree-structure-advisor.contracts.mjs`
- `tree-shim-detection.logic.mjs`

### 3.2 Import and barrel/registry updates

Updated runtime imports and package boundary wiring to target the new canonical tree slice path:

- `calculogic-validator/src/index.mjs`
- `calculogic-validator/src/core/validator-registry.knowledge.mjs`
- Legacy tree shim re-exports:
  - `calculogic-validator/src/tree-structure-advisor.host.mjs`
  - `calculogic-validator/src/tree-structure-advisor.logic.mjs`
- Tree slice wiring relative imports in `calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs`

### 3.3 Shim detector canonical entrypoint carveout update

Updated public-entrypoint pass-through detection to accept canonical tree barrel targets after extraction (`../tree/src/...`) while preserving existing canonical patterns.

## 4. Package boundary and script updates

- Updated `package.json` export target for `./tree` from `./src/tree/tree-structure-advisor.host.mjs` to `./tree/src/tree-structure-advisor.host.mjs`.
- Updated `package.json` `files` to include `tree/**` for packaging.
- Updated tree validation script examples in `calculogic-validator/scripts/validate-tree.mjs` to point at `calculogic-validator/tree/src` target examples.

## 5. Docs/spec/NL updates

Updated canonical tree path references to align docs with the new ownership boundary:

- `calculogic-validator/README.md` projected layout and compatibility note
- `doc/nl-config/cfg-treeStructureAdvisor.md`
- `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md`
- shim cleanup planning/audit docs that referenced tree canonical ownership under `src/tree/**`

## 6. Deferred shim-removal decisions (intentional)

This boundary-correction pass intentionally does **not** remove remaining shim debt files.

Still intentionally preserved for later cleanup pass:

- `calculogic-validator/src/tree-structure-advisor.host.mjs`
- `calculogic-validator/src/tree-structure-advisor.logic.mjs`

Deferred decision scope after this move:

- Re-verify remaining shim debt against corrected canonical tree ownership path (`calculogic-validator/tree/src/**`).
- Execute final shim-removal pass separately.
