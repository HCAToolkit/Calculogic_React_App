# calculogic-validator

This folder contains the Calculogic naming validator tooling extracted from the builder app tree.

- Canonical validator module now lives in `src/naming/` (`naming-validator.host.mjs` / `naming-validator.wiring.mjs` / `naming-validator.logic.mjs` / `naming-validator.contracts.mjs`).
- CLI entrypoint lives in `scripts/validate-naming.mjs`.
- Validator tests live in `test/`.
- Run from repository root with `npm run validate:naming`.
- Canonical naming contract docs remain in `doc/ConventionRoutines/`.


## Compatibility shim

Legacy imports from `src/validators/naming-validator.logic.mjs` remain supported via a thin re-export shim to the canonical host entrypoint.
