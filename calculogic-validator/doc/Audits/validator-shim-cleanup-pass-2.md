# Validator shim cleanup — pass 2 (compat-only shim file removals)

## Scope

This pass removes only validator shim-debt files that had no remaining internal in-repo usage at current main state verification time.

- Date: 2026-03-07
- Basis: `final-state-validator-shim-verification.audit.md` and `validator-shim-cleanup-pass-1.md`
- Safety rule: preserve intentional canonical/public boundaries and preserve still-test-referenced shim-debt files for later passes

## Verification before deletion

Each target shim path was re-checked in current main state for internal repo usage.

- Result: no remaining internal runtime import usage was found for the 10 targeted shim files.
- Residual references were documentation/audit mentions only, plus one NL config note and one README compatibility note that were updated in this pass.

## Removed compat-only shim files (10)

1. `calculogic-validator/src/npm-arg-forwarding-guard.logic.mjs`
2. `calculogic-validator/src/repository-root.logic.mjs`
3. `calculogic-validator/src/source-snapshot.logic.mjs`
4. `calculogic-validator/src/validator-config.contracts.mjs`
5. `calculogic-validator/src/validator-config.logic.mjs`
6. `calculogic-validator/src/validator-exit-code.logic.mjs`
7. `calculogic-validator/src/validator-report-meta.logic.mjs`
8. `calculogic-validator/src/validator-report.contracts.mjs`
9. `calculogic-validator/src/validator-root-files.knowledge.mjs`
10. `calculogic-validator/src/validators/naming-validator.logic.mjs`

## Direct residue cleanup performed

Only direct residue from the removals was updated:

- Removed obsolete naming-validator shim compatibility note from `calculogic-validator/README.md`.
- Removed obsolete temporary naming-validator shim path bullet from `doc/nl-config/cfg-namingValidator.md` repository layout contract.

No broader refactor or compat-surface redesign was performed.

## Preserved boundaries and deferred shim-debt files

### Intentional non-debt boundaries preserved (unchanged)

1. `calculogic-validator/src/index.mjs`
2. `calculogic-validator/naming/src/naming-validator.host.mjs`
3. `calculogic-validator/tree/src/tree-structure-advisor.host.mjs`

### Still-test-referenced shim-debt files left for later passes (unchanged)

1. `calculogic-validator/src/validator-runner.logic.mjs`
2. `calculogic-validator/src/validator-registry.knowledge.mjs`
3. `calculogic-validator/src/validator-scopes.runtime.mjs`
4. `calculogic-validator/src/tree-structure-advisor.host.mjs`
5. `calculogic-validator/src/tree-structure-advisor.logic.mjs`

Reason: these remain intentionally referenced by `calculogic-validator/test/core-compat-shims.test.mjs` for shim parity verification in this stage.
