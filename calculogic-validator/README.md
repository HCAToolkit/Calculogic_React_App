# calculogic-validator

## 1) Overview

`calculogic-validator` is a repository-local, **modular, configurable, policy-driven validator suite** in `calculogic-validator/`, including CLI binaries, host scripts, schema, and tests for naming and full validation workflows. The suite is **report-first by default** and can escalate through policy modes when explicitly configured. Canonical suite contract and mode semantics are centralized in [`doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`](./doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md). In this repo, the recommended way to run it is from the **repo root** via npm scripts so command behavior, arguments, and report capture stay consistent with CI and team workflows.

Registry expansion roadmap note: see [`doc/ConventionRoutines/Registry-Expansion-Candidates.audit.md`](./doc/ConventionRoutines/Registry-Expansion-Candidates.audit.md) for the current hardcoded-policy audit and prioritized extraction plan.

Canonical ownership boundary note: for loader → converter → runtime ownership and policy-data vs engine-mechanics separation, see [`doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md`](./doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md).

## 2) Projected package layout (target)

This is the intended target structure for the validator suite as refactors continue.
Some folders and files shown below may not exist yet in the current state.
Suite-core canonical modules are owned under `src/core/`; `src/` is reserved for suite-level infrastructure boundaries (for example `src/index.mjs`) rather than root-level shim forwarders.
The naming reflects modular suite-core boundaries, owned validator slice roots (`naming/` and `tree/`), and configurable policy surfaces.

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
├─ src/                               # suite-core only (suite-level infra + compat boundary)
│  ├─ index.mjs
│  ├─ core/
│  │  ├─ repository-root.logic.mjs
│  │  ├─ npm-arg-forwarding-guard.logic.mjs
│  │  ├─ validator-exit-code.logic.mjs
│  │  ├─ cli/
│  │  │  ├─ validator-cli-output.logic.mjs
│  │  │  ├─ validator-cli-scopes.logic.mjs
│  │  │  ├─ validator-cli-targets.logic.mjs
│  │  │  └─ validator-cli-usage.logic.mjs
│  │  ├─ validator-report.contracts.mjs
│  │  ├─ validator-report-meta.logic.mjs
│  │  ├─ validator-runner.logic.mjs
│  │  ├─ validator-registry.knowledge.mjs
│  │  ├─ validator-scopes.runtime.mjs
│  │  ├─ validator-root-files.knowledge.mjs
│  │  ├─ source-snapshot.logic.mjs
│  │  └─ config/
│  │     ├─ validator-config.contracts.mjs
│  │     ├─ validator-config.logic.mjs
│  │     └─ validator-config.schema.json
│  ├─ registries/
│  │  └─ _builtin/
│  │     └─ scope-profiles.registry.json
│  └─ compat/                         # SHIMS ONLY (policy-bound)
│     └─ (temporary files only)        # e.g. old-path re-exports during refactor
├─ test/                              # suite-core tests + suite integration tests
│  ├─ core/                           # runner/config/report/scope tests
│  ├─ integration/                    # validate-all.targets.integration, etc.
│  ├─ fixtures/                       # suite-wide fixtures (only if truly shared)
│  └─ compat/                         # optional: tests that assert shims are tracked/overdue/etc.
├─ tree/                              # tree validator scope root (mini-scope)
│  ├─ README.md                       # optional (what lives here)
│  ├─ scripts/                        # optional (suite scripts can delegate here)
│  ├─ src/
│  │  ├─ tree-structure-advisor.host.mjs
│  │  ├─ tree-structure-advisor.wiring.mjs
│  │  ├─ tree-structure-advisor.logic.mjs
│  │  ├─ tree-structure-advisor.contracts.mjs
│  │  └─ tree-shim-detection.logic.mjs
│  └─ test/                           # optional tree-only tests (if split from suite tests)
├─ naming/                            # naming validator scope root (mini-scope)
│  ├─ README.md                       # optional (what lives here)
│  ├─ scripts/                        # optional (suite scripts can delegate here)
│  │  └─ validate-naming.mjs
│  ├─ src/
│  │  ├─ naming-validator.host.mjs
│  │  ├─ naming-validator.wiring.mjs
│  │  ├─ naming-validator.logic.mjs
│  │  ├─ naming-validator.contracts.mjs
│  │  ├─ cli/
│  │  │  ├─ naming-cli-args.logic.mjs
│  │  │  ├─ naming-cli-runner.logic.mjs
│  │  │  ├─ naming-cli-usage.logic.mjs
│  │  │  └─ naming-report-builder.logic.mjs
│  │  ├─ health/
│  │  │  ├─ naming-health-check.logic.mjs
│  │  │  └─ naming-health-check.host.mjs
│  │  ├─ registries/                  # *.knowledge.*
│  │  │  └─ _builtin/
│  │  │     ├─ roles.registry.json
│  │  │     └─ reportable-extensions.registry.json
│  │  └─ rules/                       # *.logic.*
│  └─ test/
│     ├─ naming-validator.test.mjs
│     ├─ naming-validator-scope-contract.test.mjs
│     ├─ naming-missing-role.test.mjs
│     └─ fixtures/                    # naming-only fixtures (if any)
└─ tools/
   └─ report-capture/
      ├─ package.json
      └─ src/
         ├─ report-capture.host.mjs
         ├─ report-capture.logic.mjs
         ├─ report-capture.contracts.mjs
         └─ report-capture.knowledge.mjs
```

### Ownership boundaries (semantic areas)

- Suite-wide shared concerns belong in semantic suite-core areas under `src/core/<area>/`.
- Slice-owned shared concerns belong in semantic slice areas under `<slice>/src/<area>/`.
- Prefer semantic owner areas over generic catch-all `shared/` folders when a clearer owner exists.

#### Loader ownership boundary (registry-state vs direct builtin)

- Use a **registry-state owner** when a slice must compose multiple policy payloads (for example builtin + overlay/custom), enforce deterministic precedence/canonicalization, and maintain digest/cache state as a first-class contract.
- Use a **direct builtin loader** when policy vocabulary is intentionally local, bounded, and consumed by one slice path without needing a generic cross-slice state aggregator.
- Keep **suite-core surfaces** as local owners when they are composition/runtime mechanics (runner orchestration, scope/runtime contracts, slice registry composition) rather than slice policy payload normalization.
- Do not force every registry surface through one generic state layer: this creates ownership blur, over-couples independent slices, and encourages catch-all loader sprawl.

Current intentional pattern:

- Naming centralizes extracted registry-state ownership through `naming/src/registries/registry-state.logic.mjs`.
- Tree slice policy payloads remain under direct local builtin-loader ownership in tree-owned registry logic modules.
- Suite-core scope/runtime composition ownership remains local under `src/core/**` instead of acting as a universal registry-state host.

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
npm run validate:tree
npm run health:validator
```

- `npm run validate:naming`: naming-only validation using repo defaults.
- `npm run validate:all`: full validator pass (all configured validators).
- `npm run validate:tree`: tree-structure-advisor validation using repo defaults.
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

Tree report capture:

```bash
npm run report:tree:repo
npm run report:tree:app
npm run report:tree:docs
npm run report:tree:validator
npm run report:tree:system
```

Report utilities:

```bash
npm run report:verify
npm run report:summarize
```

- `report:naming:*`: capture naming validator output for a specific scope.
- `report:all:*`: capture full-suite output for a specific scope.
- `report:tree:*`: capture tree validator output for a specific scope.
- `report:verify`: checks report-capture wiring/outputs.
- `report:summarize`: summarizes captured reports.

## 5) Validator entrypoints and direct invocation

This section includes package-defined validator entrypoints plus direct script invocation where useful, all executable from repo root.

```bash
node calculogic-validator/bin/calculogic-validate.mjs
node calculogic-validator/bin/calculogic-validate-naming.mjs
node calculogic-validator/bin/calculogic-validator-health.mjs
node calculogic-validator/scripts/validate-tree.mjs --scope=repo
```

What each entrypoint does:

- `calculogic-validate.mjs`: full validator entrypoint.
- `calculogic-validate-naming.mjs`: naming-only validator entrypoint.
- `calculogic-validator-health.mjs`: validator health/diagnostic entrypoint.
- `scripts/validate-tree.mjs`: tree validator script (`--scope`, repeatable `--target`, `--config`, `--help`).

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
npm run validate:tree -- --scope=repo
npm run validate:tree -- --scope=validator
npm run validate:tree -- --scope=repo --target calculogic-validator
```

Use scope-specific `report:*` commands when you want one-command capture per target/scope combination.

## 7) Strict config and schema

Validator config schema:

- `calculogic-validator/src/validator-config.schema.json`

Runtime behavior is strict and rejects unknown keys where the schema disallows them. Root-level `$schema` is allowed as an editor hint.

**Report-first note (current CLI behavior):** Config affects report classification/metadata and can opt into existing strict exit semantics via `strictExit: true`. Detection behavior is unchanged and broader enforcement/fix modes are not implemented yet.

Use `--config=<path>` to pass a config file explicitly:

```bash
npm run validate:naming -- --scope=app --config=./.calculogic/validator/config.json
node calculogic-validator/bin/calculogic-validate-naming.mjs --scope=docs --config=./.calculogic/validator/config.json
```

Canonical config spec: `doc/ValidatorSpecs/validator-config-spec.md`.

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

Canonical report contracts:

- `doc/ConventionRoutines/ValidatorReportSchema-V0_1.md` (canonical schema for slice and runner envelopes)
- `doc/ConventionRoutines/ValidatorRuleIds-Contract.md` (canonical rule ID and `ruleRef` linkage contract)

There are two report envelopes:

- slice output (single-slice CLI, for example `validate:naming`)
- runner output (multi-slice CLI, for example `validate:all`)

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

Legacy root tree shim imports are retired. Use the canonical tree slice entrypoint `tree/src/tree-structure-advisor.host.mjs` (or package subpath `@calculogic/validator/tree`) and canonical logic module `tree/src/tree-structure-advisor.logic.mjs`.
