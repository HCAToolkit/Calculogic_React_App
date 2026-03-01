# cfg-namingValidator

## 0.0 Version
Current implementation target: **V0.1.15** (optional --target path/folder filtering within scope).

## 1.0 Purpose
Define a deterministic V0.1 filename naming validator that runs in report mode only and classifies repository filenames against the canonical naming contract.

## 2.0 Inputs and Source of Truth
### 2.1 Naming authority
The validator reads rules from `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md` as authoritative naming guidance.

### 2.2 Scope mode (V0.1.11)
### 2.2.1 Target filter mode (V0.1.15)
V0.1.15 adds optional repeatable `--target` inputs for developer-convenience focused runs while preserving canonical scope semantics:
- `--target <path>` and `--target=<path>` are both accepted and can be repeated
- target may resolve to a file (exact-match) or directory (recursive prefix-match)
- target paths can be repository-relative or absolute, with deterministic normalization to repository-relative `/` form for reporting
- filtering applies after canonical scope discovery (`repo|app|docs|validator|system` remain authoritative)

Deterministic validation and safety requirements:
- each target is resolved via realpath and must remain within repository root
- nonexistent targets are deterministic CLI usage/runtime errors with non-zero exit
- target unions are deduplicated and sorted deterministically
- when target filtering is active, report metadata includes:
  - `filters.isFiltered = true`
  - `filters.targets = [sorted repo-relative targets]`
- when target filtering is inactive, metadata includes `filters.isFiltered = false` and omits `filters.targets`

V0.1.11 supports deterministic scope profiles selected via CLI and applied before filename classification using explicit scope path predicates:
- default/no `--scope` input resolves to `repo`
- `repo`: repository-wide reportable files.
- `app`: application-focused files (`src/` and `test/` only).
- `docs`: docs-focused files (`doc/`, `docs/`, and selected root conventional docs currently limited to `README.md`).
- `validator`: validator implementation files (`calculogic-validator/` only).
- `system`: root tooling files only (`package.json`, `package-lock.json`, `tsconfig*.json`, `eslint.config.*`, `vite.config.*`).

Scope predicates are evaluated on normalized repository-relative paths before report findings are generated. Invalid scope inputs are treated as CLI usage errors.

### 2.3 Role registry metadata (V0.1.1)
The validator uses a structured role registry with metadata fields:
- `role`
- `category` (`concern-core`, `architecture-support`, `documentation`, `deprecated`)
- `status` (`active`, `deprecated`)
- optional `notes`

Active roles:
- host
- wiring
- contracts
- build
- build-style
- logic
- knowledge
- results
- results-style
- spec
- policy
- workflow
- plan
- audit
- healthcheck

Deprecated historical roles:
- view

### 2.4 Repository layout contract (V0.1.8)
Validator implementation assets live under top-level `calculogic-validator/`:
- canonical module layout: `calculogic-validator/src/naming/{naming-validator.host.mjs,naming-validator.wiring.mjs,naming-validator.logic.mjs,naming-validator.contracts.mjs}`
- extension-point folders: `calculogic-validator/src/naming/registries/` and `calculogic-validator/src/naming/rules/`
- package export barrel: `calculogic-validator/src/index.mjs`
- stable repository-root resolver shared by CLIs: `calculogic-validator/src/repository-root.logic.mjs`
- temporary compatibility shim (legacy imports): `calculogic-validator/src/validators/naming-validator.logic.mjs`
- repo-local script entrypoints remain supported: `calculogic-validator/scripts/{validate-naming.mjs,validate-all.mjs,validator-health-check.host.mjs}`
- stable installable bin entrypoints: `calculogic-validator/bin/{calculogic-validate.mjs,calculogic-validate-naming.mjs,calculogic-validator-health.mjs}`
- validator tests: `calculogic-validator/test/*.test.mjs`

Root `package.json` scripts remain the canonical invocation interface (`npm run validate:naming`, `npm run validate:all`, `npm run health:validator`, `npm test`) while local package bins are testable via `npm exec` through the file dependency `@calculogic/validator`.

### 2.5 Health-check contract (V0.1.11)
Health-check entrypoint lives at `calculogic-validator/scripts/validator-health-check.host.mjs` and is exposed via root script `npm run health:validator`.
Stable installable health bin entrypoint lives at `calculogic-validator/bin/calculogic-validator-health.mjs`.

The health-check performs deterministic, CI-friendly assertions for scope profiles `repo`, `app`, `docs`, `validator`, and `system`:
- required scope profiles must resolve via host API
- repeated in-process runs per scope must keep stable summary-level outputs (`totalFilesScanned`, `counts`, `codeCounts`, `specialCaseTypeCounts`, `warningRoleStatusCounts`, `warningRoleCategoryCounts`)
- docs contract checks ensure scope documentation continues to state app/docs/validator/system split behavior

Health-check behavior is fail-fast semantics: any contract violation returns non-zero exit status.

### 2.6 Validator config contract (V0.1)
Naming validator supports optional runtime config input with deterministic JSON contract:
- `version` must equal `"0.1"`
- optional `naming.reportableExtensions.add` array
- each extension entry must be a string starting with `.`
- optional `naming.roles.add` array of role metadata objects:
  - required `role` string
  - required `category` from `concern-core | architecture-support | documentation | deprecated`
  - required `status` from `active | deprecated`
  - optional `notes` string

Normalization and merge semantics for `naming.roles.add` are deterministic and additive-only:
- role values are trimmed before validation and storage
- duplicate role entries in config are dropped by first occurrence (input-order stable)
- entries whose role already exists in default role registry are treated as no-op at runtime

Runtime behavior in this slice is additive-only for reportable extension collection:
- derived reportable extensions = default registry union `config.naming.reportableExtensions.add`
- defaults remain unchanged when config is omitted

Runtime behavior for role additions:
- runtime role metadata map = default metadata map + config role additions (add-only)
- runtime active role set = roles with `status=active` from runtime role metadata
- runtime role suffix list = runtime role keys sorted by descending length for hyphen-role ambiguity detection
- filename classification uses the runtime role structures when supplied, and default registries when omitted

Validator config contract includes a publishable JSON Schema for editor/tool integration:
- schema path: `calculogic-validator/src/validator-config.schema.json`
- schema `properties.version.const` must match runtime `VALIDATOR_CONFIG_VERSION`

Runtime and schema strictness are intentionally aligned. Unknown keys are rejected at the following levels:
- root object (except optional `$schema` editor-hint key, ignored by runtime normalization)
- `naming`
- `naming.reportableExtensions`
- `naming.roles`
- each `naming.roles.add[]` entry object


### 2.7 Report metadata contract (V0.1.12)
Naming report JSON includes deterministic metadata fields for CI/debug sharing while preserving all prior fields:
- `toolVersion`: loaded from `calculogic-validator/package.json` `version`.
- `configDigest`: `sha256(stableStringify(config))` when `--config` is supplied.
- `startedAt`, `endedAt`, `durationMs`: execution timing for each naming report invocation.

`stableStringify` sorts object keys recursively and preserves array order to keep digest generation deterministic across runs.

## 3.0 Classification Contract
### 3.1 Canonical
Classify as canonical when filename parses as `<semantic-name>.<role>.<ext>` (including `.module.css`) with kebab-case semantic name and known role.

### 3.2 Allowed special case
Classify as allowed special case for reserved filenames and patterns including barrel files, framework-required names, test files (`*.test.<code-ext>` / `*.spec.<code-ext>`), ambient declaration files, and README convention docs.

Allowed special-case findings include `details.specialCaseType` values:
- `ecosystem-required`
- `barrel`
- `test-convention`
- `ambient-declaration`
- `conventional-doc`

### 3.3 Legacy exception
Classify as legacy exception when file is in-scope but does not claim canonical structure and is tolerated by incremental adoption.

### 3.4 Invalid or ambiguous
Classify as invalid or ambiguous when filename appears to claim canonical intent but violates deterministic parse rules (unknown role, deprecated role, bad semantic casing, or hyphen-appended role ambiguity).

## 4.0 Findings and Reporting
### 4.1 Stable finding schema
Each finding includes code, severity, path, classification, message, ruleRef, and optional suggestedFix/details.

### 4.2 Deterministic ordering
Findings and summary output sort by normalized relative path.

### 4.3 Summary breakdowns (V0.1.2)
Report output includes deterministic summary breakdowns for:
- classification counts
- finding code counts
- special-case subtype counts
- warning role status/category counts (when metadata is present)

### 4.4 Scope-aware reporting metadata (V0.1.2)
Report output includes selected scope metadata and deterministic file-count/findings summaries within that scope.

### 4.5 Scope observability metadata (V0.1.4)
Report output includes additive scope observability metadata:
- `scopeSummary.scope`
- `scopeSummary.reportableFilesInScope`
- `scopeSummary.findingsGenerated`

This metadata is additive and does not alter legacy report-mode findings behavior.

### 4.6 Exit behavior (report mode, V0.1.13)
Report mode always prints full JSON report payload to stdout in non-usage-error flows, then exits with deterministic CI-oriented status:
- default mode: exit `2` when any finding has `severity="warn"`.
- strict mode (`--strict`): exit `2` when any warning exists; otherwise exit `1` when any finding has `classification="legacy-exception"`.
- exit `0` when neither warning criteria nor strict legacy criteria are present.

Priority order is deterministic:
1. warnings (`severity="warn"`) dominate and force exit `2`.
2. strict legacy-exception enforcement produces exit `1` only when no warnings exist.
3. otherwise success is exit `0`.

Invalid CLI usage and argument parse errors remain exit `1`.

## 5.0 Deferred Behavior
Deferred to later slices:
- soft-fail mode
- hard-fail mode
- changed-files mode
- auto-fix/rename workflows
- provenance consistency checks
- other validators
