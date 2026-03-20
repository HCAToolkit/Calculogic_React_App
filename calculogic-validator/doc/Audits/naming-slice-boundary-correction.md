# Naming slice boundary correction audit

## 1. Purpose

This audit records the ownership-boundary correction that moved the canonical naming validator slice out of suite-core `calculogic-validator/src/` and into its own owned slice root.

## 2. Canonical path correction

- Previous canonical_source naming location: `calculogic-validator/src/naming/**`
- New canonical_source naming location: `calculogic-validator/naming/src/**`
- Suite-core `calculogic-validator/src/**` remains shared infra + compat boundary only.

## 3. Runtime/module updates applied

### 3.1 Naming module move

Moved canonical naming-owned implementation files from `calculogic-validator/src/naming/` to `calculogic-validator/naming/src/`, including:

- `naming-validator.host.mjs`
- `naming-validator.wiring.mjs`
- `naming-validator.logic.mjs`
- `naming-validator.contracts.mjs`
- `naming-runtime-converters.logic.mjs`
- `registries/**`
- `rules/**`

### 3.2 Import and runtime wiring updates

Updated runtime import targets to the new canonical naming slice path:

- `calculogic-validator/src/index.mjs`
- `calculogic-validator/src/core/validator-registry.knowledge.mjs`
- `calculogic-validator/scripts/validate-naming.host.mjs`
- `calculogic-validator/scripts/validator-health-check.host.mjs`
- `calculogic-validator/bin/calculogic-validate-naming.host.mjs`
- `calculogic-validator/bin/calculogic-validator-health.host.mjs`

## 4. Package boundary and script updates

- Updated `package.json` export target for `./naming` from `./src/naming/naming-validator.host.mjs` to `./naming/src/naming-validator.host.mjs`.
- Updated `package.json` `files` to include `naming/**` for packaging.

## 5. Naming-owned tests boundary updates

Moved naming-owned tests from suite-level `calculogic-validator/test/` into naming slice-owned `calculogic-validator/naming/test/`, and repointed test imports/assertions to `calculogic-validator/naming/src/**`.

## 6. Docs/NL and audit path updates

Updated canonical naming path references to align docs with the new ownership boundary:

- `doc/nl-config/cfg-namingValidator.md`
- relevant validator audit/docs that previously cited canonical naming ownership under `src/naming/**`

## 7. Shim policy result

This boundary-correction pass was completed **without creating new naming compatibility shims**.
