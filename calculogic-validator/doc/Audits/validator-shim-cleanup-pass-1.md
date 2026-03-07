# Validator shim cleanup — pass 1 (internal import canonicalization)

## Scope

This pass canonicalizes **in-repo** usage of confirmed validator compatibility shim-debt files without deleting or moving shim files.

- Date: 2026-03-07
- Basis: `final-state-validator-shim-verification-audit.md`
- Safety rule: preserve shim files as compatibility forwarders

## What changed

Internal references were rewritten from shim-debt paths to canonical owned modules (`src/core/**`, `src/core/config/**`, `naming/src/**`) across:

- installable bins under `calculogic-validator/bin/`
- naming-related validator tests under `calculogic-validator/test/`
- NL/config/spec docs that still pointed to shim-debt paths as canonical

### Rewrite count

- **22** in-repo shim-path references rewritten in this pass.

## Shim status after pass 1

### Effectively compat-only internally (no remaining internal import usage detected)

1. `src/npm-arg-forwarding-guard.logic.mjs`
2. `src/repository-root.logic.mjs`
3. `src/source-snapshot.logic.mjs`
4. `src/validator-config.contracts.mjs`
5. `src/validator-config.logic.mjs`
6. `src/validator-exit-code.logic.mjs`
7. `src/validator-report-meta.logic.mjs`
8. `src/validator-report.contracts.mjs`
9. `src/validator-root-files.knowledge.mjs`
10. `src/validators/naming-validator.logic.mjs`

### Still intentionally referenced internally

1. `src/validator-runner.logic.mjs`
2. `src/validator-registry.knowledge.mjs`
3. `src/validator-scopes.runtime.mjs`
4. `src/tree-structure-advisor.host.mjs`
5. `src/tree-structure-advisor.logic.mjs`

Reason in this pass: these remaining references are in `calculogic-validator/test/core-compat-shims.test.mjs`, where shim imports are intentional to verify shim parity against canonical modules.

## Notes and boundaries preserved

- No shim files were deleted, moved, or renamed.
- Intentional boundary entrypoints were left in place.
- This is import/usage cleanup only; no public compat surface removal was attempted.
