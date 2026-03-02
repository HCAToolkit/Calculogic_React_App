# calculogic-validator

## 1) Overview

`calculogic-validator` is a repository-local, **modular, configurable, policy-driven validator suite** in `calculogic-validator/`, including CLI binaries, host scripts, schema, and tests for naming and full validation workflows. The suite is **report-first by default** and can escalate through policy modes when explicitly configured. Canonical suite contract and mode semantics are centralized in [`doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`](./doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md). In this repo, the recommended way to run it is from the **repo root** via npm scripts so command behavior, arguments, and report capture stay consistent with CI and team workflows.

## 2) Projected package layout (target)

This is the intended target structure for the validator suite as refactors continue.
Some folders and files shown below may not exist yet in the current state.
The naming reflects modular suite-core boundaries, slice roots (`naming/` now and `tree/` planned), configurable policy surfaces, and shared tools ownership.

```text
calculogic-validator/
├─ LICENSE
├─ README.md
├─ package.json
├─ doc/
│  ├─ ConventionRoutines/             # validator-operationalized conventions only
│  ├─ ValidatorSpecs/                 # specs that are package-owned (runner/tree advisor/etc.)
│  └─ Indexes/                        # optional: “where to find things” maps
├─ bin/                               # suite-level CLIs (entrypoints)
│  ├─ calculogic-validate.mjs
│  ├─ calculogic-validate-naming.mjs
│  └─ calculogic-validator-health.mjs
├─ scripts/                           # suite-level workflows (thin orchestration)
│  ├─ validate-all.mjs
│  ├─ validate-naming.mjs
│  ├─ validator-health-check.host.mjs
│  ├─ report-capture-verify.mjs
│  └─ report-capture-summarize.mjs
├─ src/                               # suite-core only (shared infra + compat boundary)
│  ├─ index.mjs
│  ├─ core/
│  │  ├─ repository-root.logic.mjs
│  │  ├─ npm-arg-forwarding-guard.logic.mjs
│  │  ├─ validator-exit-code.logic.mjs
│  │  ├─ validator-report.contracts.mjs
│  │  ├─ validator-report-meta.logic.mjs
│  │  ├─ validator-runner.logic.mjs
│  │  ├─ validator-registry.knowledge.mjs
│  │  ├─ validator-scopes.knowledge.mjs
│  │  ├─ validator-root-files.knowledge.mjs
│  │  └─ config/
│  │     ├─ validator-config.contracts.mjs
│  │     ├─ validator-config.logic.mjs
│  │     └─ validator-config.schema.json
│  └─ compat/                         # SHIMS ONLY (policy-bound)
│     └─ (temporary files only)        # e.g. old-path re-exports during refactor
├─ test/                              # suite-core tests + suite integration tests
│  ├─ core/                           # runner/config/report/scope tests
│  ├─ integration/                    # validate-all.targets.integration, etc.
│  ├─ fixtures/                       # suite-wide fixtures (only if truly shared)
│  └─ compat/                         # optional: tests that assert shims are tracked/overdue/etc.
├─ naming/                            # naming validator scope root (mini-scope)
│  ├─ README.md                       # optional (what lives here)
│  ├─ scripts/                        # optional (suite scripts can delegate here)
│  │  └─ validate-naming.mjs
│  ├─ src/
│  │  ├─ naming-validator.host.mjs
│  │  ├─ naming-validator.wiring.mjs
│  │  ├─ naming-validator.logic.mjs
│  │  ├─ naming-validator.contracts.mjs
│  │  ├─ registries/                  # *.knowledge.*
│  │  └─ rules/                       # *.logic.*
│  └─ test/
│     ├─ naming-validator.test.mjs
│     ├─ naming-validator-scope-contract.test.mjs
│     ├─ naming-missing-role.test.mjs
│     └─ fixtures/                    # naming-only fixtures (if any)
├─ tree/                              # future tree-advisor validator scope root
│  ├─ scripts/
│  ├─ src/
│  └─ test/
└─ tools/
   └─ report-capture/
      ├─ package.json
      └─ src/
         ├─ report-capture.host.mjs
         ├─ report-capture.logic.mjs
         ├─ report-capture.contracts.mjs
         └─ report-capture.knowledge.mjs
```

## 3) Quickstart (repo root)

```bash
npm ci
npm test
npm run validate:naming -- --scope=app
```

What this does:

- `npm ci`: installs exact lockfile dependencies.
- `npm test`: runs the project and validator tests.
- `npm run validate:naming -- --scope=app`: runs naming validation against app scope only.

> npm argument forwarding reminder:
>
> - ✅ Correct: `npm run validate:naming -- --scope=app`
> - ❌ Incorrect: `npm run validate:naming --scope=app`
>
> Use `--` before validator flags so npm forwards them to the script.

## 4) Root npm workflows (recommended)

Use these from the repository root.

### Core validation

```bash
npm run validate:naming
npm run validate:all
npm run health:validator
```

- `npm run validate:naming`: naming-only validation using repo defaults.
- `npm run validate:all`: full validator pass (all configured validators).
- `npm run health:validator`: validator environment/health diagnostics.

### Reports by scope and target

Naming report capture:

```bash
npm run report:naming:repo
npm run report:naming:app
npm run report:naming:docs
npm run report:naming:validator
npm run report:naming:system
```

Full-suite report capture:

```bash
npm run report:all:repo
npm run report:all:app
npm run report:all:docs
npm run report:all:validator
npm run report:all:system
```

Report utilities:

```bash
npm run report:verify
npm run report:summarize
```

- `report:naming:*`: capture naming validator output for a specific scope.
- `report:all:*`: capture full-suite output for a specific scope.
- `report:verify`: checks report-capture wiring/outputs.
- `report:summarize`: summarizes captured reports.

## 5) Validator binaries (direct invocation)

These binaries are defined in `calculogic-validator/package.json` and can be executed directly from repo root.

```bash
node calculogic-validator/bin/calculogic-validate.mjs
node calculogic-validator/bin/calculogic-validate-naming.mjs
node calculogic-validator/bin/calculogic-validator-health.mjs
```

What each binary does:

- `calculogic-validate.mjs`: full validator entrypoint.
- `calculogic-validate-naming.mjs`: naming-only validator entrypoint.
- `calculogic-validator-health.mjs`: validator health/diagnostic entrypoint.

## 6) Scopes and targets

Common scopes used in this repository:

- `repo`
- `app`
- `docs`
- `validator`
- `system`

Examples:

```bash
npm run validate:naming -- --scope=repo
npm run validate:naming -- --scope=app
npm run validate:naming -- --scope=docs
npm run validate:all -- --scope=validator
npm run validate:all -- --scope=system
```

Use scope-specific `report:*` commands when you want one-command capture per target/scope combination.

## 7) Strict config and schema

Validator config schema:

- `calculogic-validator/src/validator-config.schema.json`

Runtime behavior is strict and rejects unknown keys where the schema disallows them. Root-level `$schema` is allowed as an editor hint.

Example:

```json
{
  "$schema": "./calculogic-validator/src/validator-config.schema.json",
  "version": "0.1",
  "naming": {
    "roles": {
      "add": [
        {
          "role": "provider",
          "category": "architecture-support",
          "status": "active"
        }
      ]
    }
  }
}
```

## 8) Report capture notes

- Report scripts write JSON capture metadata to `./.reports` in this repository.
- Keep count/retention is handled by script-level `--keep` values.
- Use `npm run report:verify` after setup changes.
- Use `npm run report:summarize` for a concise overview of recent captures.


## 9) Report output (JSON)

Validator reports include stable metadata fields for report envelope identity and reproducibility:

- `validatorId`
- `validatorVersion`
- `sourceSnapshot`

Tiny `sourceSnapshot` example shape:

```json
{
  "sourceSnapshot": {
    "source": "fs",
    "gitRef": "HEAD",
    "gitHeadSha": "abc123def456",
    "diagnostics": {
      "isDirty": false,
      "changedCount": 0,
      "untrackedCount": 0
    }
  }
}
```

`gitRef`, `gitHeadSha`, and `diagnostics` are optional and may vary by environment and capture mode.

## 10) Compatibility note

Legacy imports from `src/validators/naming-validator.logic.mjs` remain supported via a thin re-export shim to the canonical naming validator host entrypoint.
