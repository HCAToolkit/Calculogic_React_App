# Validator shim cleanup pass 3 (final removal)

## 1. Purpose

This pass completes validator shim-debt removal for the final five root shim-debt files after the tree and naming slice boundary corrections established canonical ownership under `tree/src/**` and `naming/src/**`.

## 2. Readiness re-verification

Before deletion, the remaining five shim-debt files were re-verified as thin re-export forwarders with no canonical implementation ownership:

1. `calculogic-validator/src/validator-runner.logic.mjs` → `./core/validator-runner.logic.mjs`
2. `calculogic-validator/src/validator-registry.knowledge.mjs` → `./core/validator-registry.knowledge.mjs`
3. `calculogic-validator/src/validator-scopes.runtime.mjs` → `./core/validator-scopes.runtime.mjs`
4. `calculogic-validator/src/tree-structure-advisor.host.mjs` → `../tree/src/tree-structure-advisor.host.mjs`
5. `calculogic-validator/src/tree-structure-advisor.logic.mjs` → `../tree/src/tree-structure-advisor.logic.mjs`

The remaining live contracts preserving these files were package export targets for core subpaths and the shim-parity test surface in `calculogic-validator/test/core-compat-shims.test.mjs`.

## 3. Package export retargeting

Updated package subpath export targets to canonical core ownership modules:

- `exports["./runner"]`: `./src/validator-runner.logic.mjs` → `./src/core/validator-runner.logic.mjs`
- `exports["./registry"]`: `./src/validator-registry.knowledge.mjs` → `./src/core/validator-registry.knowledge.mjs`
- `exports["./scopes"]`: `./src/validator-scopes.runtime.mjs` → `./src/core/validator-scopes.runtime.mjs`

Public subpath contracts are preserved:

- `@calculogic/validator/runner`
- `@calculogic/validator/registry`
- `@calculogic/validator/scopes`

Only the target files changed from root shims to canonical core modules.

## 4. Tree temporary root-shim compatibility end

Ended temporary root tree shim compatibility for:

- `calculogic-validator/src/tree-structure-advisor.host.mjs`
- `calculogic-validator/src/tree-structure-advisor.logic.mjs`

Canonical tree ownership remains unchanged at `calculogic-validator/tree/src/**`, including intentional public/canonical host boundary at `calculogic-validator/tree/src/tree-structure-advisor.host.mjs`.

## 5. Compat test transition

Retired shim-parity preservation test:

- removed: `calculogic-validator/test/core-compat-shims.test.mjs`

Replaced with a canonical entrypoint contract test:

- added: `calculogic-validator/test/core-entrypoints-contract.test.mjs`

The replacement validates:

- canonical export target mapping in `package.json`
- canonical runtime contracts for core runner/registry/scopes modules
- canonical slice host availability (`tree/src/**`, `naming/src/**`) and root index surface wiring

This removes test pressure that previously preserved deleted shim paths.

## 6. Final five shim-debt files removed

Deleted from `calculogic-validator/src/**`:

1. `validator-runner.logic.mjs`
2. `validator-registry.knowledge.mjs`
3. `validator-scopes.runtime.mjs`
4. `tree-structure-advisor.host.mjs`
5. `tree-structure-advisor.logic.mjs`

## 7. Direct residue cleanup

- Updated README wording to remove temporary root tree shim support language and align ownership notes to canonical `src/core/**`, `naming/src/**`, and `tree/src/**` boundaries.

## 8. Boundary confirmation

This pass preserves intentional boundaries:

- kept: `calculogic-validator/src/index.mjs`
- kept: `calculogic-validator/naming/src/naming-validator.host.mjs`
- kept: `calculogic-validator/tree/src/tree-structure-advisor.host.mjs`

No new shims were added.

## 9. Outcome

Pass 3 completes final validator shim-debt removal for the previously deferred five files while preserving public subpath contracts and canonical owned slice roots.
