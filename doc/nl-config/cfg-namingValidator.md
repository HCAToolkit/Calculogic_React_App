# cfg-namingValidator

> [!IMPORTANT]
> This file is **implementation notes / NL-config context** for this repository and is **not** the canonical validator contract source.
> Canonical validator-owned docs:
>
> - `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
> - `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
> - `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`

## 0.0 Version

Current implementation target: **V0.1.23** (naming runtime dependencies are wiring-provided; runtime no longer composes builtin registry defaults internally).

## 1.0 Purpose

Define a deterministic V0.1 filename naming validator that runs in report mode only and classifies repository filenames against the canonical naming contract.

## 2.0 Inputs and Implementation References

### 2.1 Naming authority

Summary only: naming rules are consumed from canonical docs. For normative role/grammar policy, see `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md` and `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`.

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
  - required `category` string, validated against `calculogic-validator/src/naming/registries/_builtin/categories.registry.json` `categories[].category`
  - required `status` from `active | deprecated`
  - optional `notes` string

Normalization and merge semantics for `naming.roles.add` are deterministic and additive-only:

- role values are trimmed before validation and storage
- duplicate role entries in config are dropped by first occurrence (input-order stable)
- entries whose role already exists in built-in role registry are treated as no-op at runtime

Runtime behavior in this slice resolves naming registries via registry-state logic:

- wiring resolves inputs through `resolveNamingRegistryInputs({ config })`
- resolver computes one effective built-in registry root per call (defaulting to `calculogic-validator/src/naming/registries/_builtin`)
- built-in roles are loaded from that effective root `roles.registry.json` (`rolesByCategory` flattened into `{ role, category, status, notes? }`)
- built-in reportable extensions are loaded from that effective root `reportable-extensions.registry.json` (`reportableExtensions`)
- built-in allowed categories for role validation are loaded from that same effective root `categories.registry.json`
- resolver returns normalized arrays for `reportableExtensions` and `roles`
- wiring converts arrays into runtime structures expected by naming runtime:
  - `reportableExtensions` → `Set`
  - `roles` → `{ roleMetadata: Map, activeRoles: Set, roleSuffixes: string[] }` where role suffixes are length-desc sorted
- duplicate roles remain first-wins during map conversion

Runtime output for host-wiring now includes additive registry metadata for observability:

- `registry.registryState` from registry-state selection (`builtin | custom`)
- `registry.registrySource` to indicate effective source (`builtin | custom | config`)
- `registry.registryDigests` with deterministic digest entries (`builtin`, `custom`, `resolved`)

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

### 2.8 Walk exclusions runtime source (V0.1.17)

Naming path discovery for repository walking is sourced from builtin registry JSON at:

- `calculogic-validator/src/naming/registries/_builtin/walk-exclusions.registry.json`

Runtime walk policy fields:

- `excludedDirectories`: directory basenames skipped during recursive walk.
- `skipDotDirectories`: when `true`, dot-directories are skipped.
- `allowDotFiles`: retained registry compatibility field (loaded at runtime) for explicit dot-file entries such as `.eslintrc`; it does **not** act as a deny-by-default switch for all other dot-files.

This slice preserves default builtin walk behavior (`.git`, `.vite`, `coverage`, `dist`, `node_modules`; skip dot-directories) while allowing reportable dot-files to flow through standard reportable-file checks.

### 2.9 Semantic-name case rules runtime source (V0.1.18)

Semantic-name case validation is sourced from builtin registry JSON at:

- `calculogic-validator/src/naming/registries/_builtin/case-rules.registry.json`

Runtime currently supports the builtin `semanticName.style` value `kebab-case` only for this slice. The runtime maps that style to the existing canonical kebab-case semantic-name predicate behavior.

### 2.10 Naming runtime input ownership boundary (V0.1.24)

Wiring owns registry/default/config composition and prepares runtime-ready dependencies before invoking runtime behavior.

Prepared runtime dependency source path:

- registry resolver: `calculogic-validator/src/naming/registries/registry-state.logic.mjs`
- converter module: `calculogic-validator/src/naming/naming-runtime-converters.logic.mjs`
- wiring composition entrypoint: `calculogic-validator/src/naming/naming-validator.wiring.mjs`
- runtime consumer: `calculogic-validator/src/naming/naming-validator.logic.mjs`

Prepared runtime dependency contract:

- `namingRolesRuntime` supplied by wiring (shape: `roleMetadata`, `activeRoles`, `roleSuffixes`)
- `reportableExtensions` supplied by wiring as runtime `Set`
- `walkExclusions` supplied by wiring (shape: `excludedDirectories`, `skipDotDirectories`, `allowDotFiles`)

Ownership and precedence requirements:

- runtime does not resolve registry state and does not build builtin runtime defaults at module scope.
- runtime does not import builtin walk-exclusions registry loaders and does not own builtin fallback seams.
- runtime behavior remains responsible for scanning, scope filtering, target filtering, classification, and summarization.
- host/wiring public behavior remains unchanged; config continues to override builtin defaults via resolver + converter flow before runtime execution.

## 3.0 Classification Contract

### 3.1 Canonical

Classify as canonical when filename parses as `<semantic-name>.<role>.<ext>` (including `.module.css`) with kebab-case semantic name and known role.

### 3.2 Allowed special case

Classify as allowed special case for reserved filenames and patterns including barrel files, framework-required names, test files (`*.test.<code-ext>` / `*.spec.<code-ext>`), ambient declaration files, and README convention docs.

Runtime source of truth for builtin special-case classification is `calculogic-validator/src/naming/registries/_builtin/special-cases.registry.json`, evaluated in stable first-match order with currently-supported match forms (`basenameEquals`, `suffixEquals`, `regex`).

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

Summary only (canonical policy is defined in `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md` and mirrored by `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`):
Report mode prints full JSON report payload to stdout in non-usage-error flows, then exits with deterministic CI-oriented status:

- default mode: exit `2` when any finding has `severity="warn"`.
- strict mode (`--strict`): exit `2` when any warning exists; otherwise exit `1` when any finding has `classification="legacy-exception"`.
- exit `0` when neither warning criteria nor strict legacy criteria are present.

Priority order is deterministic:

1. warnings (`severity="warn"`) dominate and force exit `2`.
2. strict legacy-exception enforcement produces exit `1` only when no warnings exist.
3. otherwise success is exit `0`.

Invalid CLI usage and argument parse errors remain exit `1`.

### 4.7 Canonical envelope aliases and source snapshot metadata (V0.1.16)

Naming CLI report output remains backward compatible and additive while exposing canonical envelope aliases:

- `validatorId = "naming"`
- `validatorVersion = toolVersion` (when tool version is available)
- `sourceSnapshot` for deterministic runtime source observability with at least:
  - `source = "fs"`
  - optional git metadata when available (`gitRef = "HEAD"`, `gitHeadSha`, and `diagnostics` containing `isDirty`, `changedCount`, `untrackedCount`)

When git is unavailable or repository git metadata cannot be resolved, report output still includes `sourceSnapshot.source = "fs"` and omits git-only fields.

## 5.0 Deferred Behavior

Deferred to later slices:

- soft-fail mode
- hard-fail mode
- changed-files mode
- auto-fix/rename workflows
- provenance consistency checks
- other validators
