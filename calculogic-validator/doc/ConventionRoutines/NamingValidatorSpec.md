# Naming Validator Spec (V0.1.7)

## Purpose and Scope

This document defines the V0.1.7 filename naming validator slice for deterministic automation.

## Suite Contract Alignment

This naming slice follows the shared suite contract in [`ValidatorSuite-Contracts-And-Modes.md`](./ValidatorSuite-Contracts-And-Modes.md): Calculogic Validator is modular, configurable, policy-driven, and report-first by default. Mode policy changes exit behavior and optional fix execution, not detection.

Naming scope handling explicitly inherits the suite-owned scope boundary contract from [`ValidatorSuite-Contracts-And-Modes.md`](./ValidatorSuite-Contracts-And-Modes.md): suite scope profiles select which paths are in play, then naming applies naming-local interpretation to those in-scope paths.

V0.1.7 scope is intentionally narrow:

- filename validation only
- report mode only
- deterministic findings output
- deterministic scope profiles for migration planning
- no rename enforcement

Out of scope for V0.1.7:

- structural addressing validation
- NL↔Code numbering/parity validation
- provenance token consistency checks
- auto-fix or rename execution
- broad migration/cleanup enforcement

## Version labeling note

Subsection version tags (for example `(V0.1.2)`) reflect the last material change for that subsection; the document version reflects the overall spec revision.

## Source-of-Truth References

Primary naming authority:

- `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
- Role categories, role status values, role semantics, provisional-role policy, and category↔surface governance policy are authoritative in the `Role Registry Master List V1` section of `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`.

Supporting workflow alignment:

- `doc/ConventionRoutines/NL-First-Workflow.md`
- `calculogic-validator/doc/ConventionRoutines/CCS.md`
- `calculogic-validator/doc/ConventionRoutines/CCPP.md`

## Canonical Filename Contract (V0.1.2)

Canonical grammar:

- `<semantic-name>.<role>.<ext>`

Recognized compound format suffixes in V0.1.2:

- `module.css`

Filename grammar is unchanged from V0.1.1.

## Role Registry Metadata (V0.1.2)

V0.1.2 uses a structured role registry with metadata:
The role registry source-of-truth is `FileNamingMasterList-V1_1.md`.

- `role`
- `category` (runtime-bounded: `concern-core` | `architecture-support` | `documentation` | `deprecated`)
- `status` (runtime-bounded: `active` | `deprecated`)
- `notes` (optional)

Default runtime registry roles in the naming slice:

- `host` (`architecture-support`, `active`)
- `wiring` (`architecture-support`, `active`)
- `contracts` (`architecture-support`, `active`)
- `build` (`concern-core`, `active`)
- `build-style` (`concern-core`, `active`)
- `logic` (`concern-core`, `active`)
- `knowledge` (`concern-core`, `active`)
- `results` (`concern-core`, `active`)
- `results-style` (`concern-core`, `active`)
- `spec` (`documentation`, `active`)
- `policy` (`documentation`, `active`)
- `workflow` (`documentation`, `active`)
- `plan` (`documentation`, `active`)
- `audit` (`documentation`, `active`)
- `healthcheck` (`documentation`, `active`)

Registry vocabulary vs config additions:

- The default role registry is the runtime baseline used by naming validation.
- Config can add roles (add-only).
- `FileNamingMasterList-V1_1.md` remains the source-of-truth taxonomy, while the naming slice currently uses a bounded category vocabulary for deterministic checks.
- If runtime-supported category values expand beyond the bounded set listed here, update this section and the master-list compatibility note accordingly.

Governance taxonomy vs runtime subset (explicit boundary):

- The master list includes additional governance categories (for example `concern-style`, `surface-system`, `indexing-registry`, `integration-adapter`, and other planned categories) plus category↔surface allowance policy.
- V0.1.7 runtime does **not** enforce category↔surface validity yet and does not require/support the full governance category vocabulary in this slice.
- Governance status vocabulary includes `provisional`; runtime role classification in this slice remains bounded to active/deprecated handling for deterministic report behavior.
- Runtime currently keeps `build-style` and `results-style` under `concern-core` as an implementation taxonomy constraint for deterministic checks; this is not a governance semantic redefinition.

Deprecated historical roles:

- `view` (`deprecated`, `deprecated`) — historical pre-current concern split term.

Semantic-name rules:

- kebab-case only for canonical filenames
- semantic name is everything before role segment

Parsing assumptions:

- role is the segment immediately before extension/format segment
- for `module.css`, role is the segment before `module`
- role suffix must be dot-separated (not hyphen-appended)

## Input Scope Profiles (V0.1.2)

V0.1.2 implements deterministic scope profiles selected by CLI, using suite-owned scope-profile runtime data.

Scope profile ownership model for this slice:

- suite-owned: scope vocabulary and shared path-selection boundary
- naming-owned: interpretation semantics for selected in-scope paths during naming analysis

This section documents naming consumption of shared suite scope profiles; it does not redefine suite scope semantics.

### Default scope

- default scope is `repo`

### `repo` scope

- repository-wide behavior
- includes all reportable files under repository root, excluding explicit walk exclusions (`.git`, `node_modules`, `dist`, `coverage`, `.vite`)

### `app` scope

- includes application-focused roots:
  - `src/`
  - `test/`
- excludes docs, validator, and system-only roots by profile definition

### `docs` scope

- includes docs-focused roots:
  - `doc/`
  - `docs/`
- includes selected root conventional docs currently limited to `README.md`

### `validator` scope

- includes validator implementation root:
  - `calculogic-validator/`

### `system` scope

- includes root tooling/system files:
  - `package.json`
  - `package-lock.json`
  - `tsconfig*.json`
  - `eslint.config.*`
  - `vite.config.*`

### Invalid scope behavior

- invalid scope values are treated as deterministic CLI usage errors
- CLI prints usage/help text and exits non-zero

## Scope Contract (V0.1.3)

Scope contract ownership model:

- suite-owned: canonical scope names and base input-selection boundary
- naming-owned: how selected paths are interpreted for naming findings/reporting

Supported scopes:

- `repo`
- `app`
- `docs`
- `validator`
- `system`

Default behavior:

- No `--scope` input is equivalent to `--scope=repo`.

Inclusion/exclusion summary:

- `repo`: all reportable files under repository root (minus explicit walker exclusions).
- `app`: includes `src/**` and `test/**`; excludes docs, validator, and system-only roots by profile definition.
- `docs`: includes `doc/**`, `docs/**`, and selected root conventional docs currently limited to `README.md`.
- `validator`: includes `calculogic-validator/**`.
- `system`: includes root tooling files (`package.json`, `package-lock.json`, `tsconfig*.json`, `eslint.config.*`, `vite.config.*`).

Invalid scope behavior:

- Unknown scope values are usage errors with non-zero exit and valid-scope usage text.

Guardrail:

- Scope profile behavior documented here is not a naming-specific reinvention of scope semantics.
- Naming documents slice-local interpretation after the shared suite scope boundary has selected paths.

## Validator Config Input (Report-only, V0.1.7)

Config reference: [`validator-config.spec.md`](../ValidatorSpecs/validator-config.spec.md).

Current naming behavior remains report-first in implementation. Passing `--config=<path>` does **not** enable fix execution or broader enforcement modes, but config may enable strict-exit semantics via `strictExit`.

When provided, config only affects naming report inputs for:

- reportable extension set (defaults ∪ additions)
- naming role registry runtime (defaults + add-only role additions)
- missing-role pattern policy runtime (builtin normalized schema for legacy exception detection)
- finding-policy runtime (builtin outcome→finding metadata mapping for stable decision outcomes)
- overlay capability contract runtime (`overlay-capabilities.registry.json`) that bounds supported config overlay surfaces to `naming.reportableExtensions.add`, `naming.roles.add`, and bounded whole-surface `naming.caseRules` set/replace semantics

In current behavior, these config effects are limited to classification/runtime registries only for report generation.

Config does not change detection mode/scope semantics and does not introduce enforcement/fix execution. Current exit policy remains policy-driven as documented in this spec.

## CLI Usage (V0.1.8)

- `npm run validate:naming` (defaults to `--scope=repo`)
- `npm run validate:naming -- --scope=repo`
- `npm run validate:naming -- --scope=app`
- `npm run validate:naming -- --scope=docs`
- `npm run validate:naming -- --scope=validator`
- `npm run validate:naming -- --scope=system`
- `npm run validate:naming -- --scope=app --target src/buildsurface`
- `npm run validate:naming -- --scope=app --target src/buildsurface --target src/shared`
- `npm run validate:naming -- --scope=app --config=./path/to/validator-config.json`
- `npm run validate:naming:validator:entry`
- `npm run validate:naming:validator:naming`
- `npm run validate:naming:validator:tree`
- `npm run validate:naming:validator:doc`
- `node calculogic-validator/bin/calculogic-validate-naming.host.mjs --scope=app --config=./path/to/validator-config.json`

npm argument forwarding note:

- npm requires a separator `--` to forward CLI flags to scripts.
- Wrong (now deterministic usage error): `npm run validate:naming --scope=app`, `npm run validate:all --scope=app`
- Right: `npm run validate:naming -- --scope=app`, `npm run validate:all -- --scope=app`
- The validator scripts fail fast with guidance when supported flags are detected in npm invocation metadata but not forwarded to script argv.

Validator-internal preset boundary (V0.1.8):

- validator-internal convenience scripts use `--scope=validator` plus explicit repeatable `--target` filters.
- these presets improve validator-internal workflow granularity without introducing additional built-in scope taxonomy.
- built-in scope vocabulary remains suite-owned and unchanged: `repo`, `app`, `docs`, `validator`, `system`.

## Targeted runs (developer convenience, V0.1.6)

Optional CLI filter flag:

- `--target <path>`
- `--target=<path>`
- repeatable; union semantics when provided multiple times

Path handling:

- accepts repo-relative or absolute paths
- target may be a file (exact path match) or directory (recursive descendants)
- normalization stores report metadata in repo-relative `/`-separated form

Filtering contract:

- target filtering is applied after canonical scope discovery
- selected scope remains authoritative and report `scope` remains unchanged
- non-existent target path is deterministic non-zero error
- existing targets that produce zero in-scope files produce valid empty report output

Report metadata additions:

- `filters.isFiltered` (boolean)
- `filters.targets` (sorted normalized target list, only when filtering is active)

## Classification Outputs

Stable classifications used by V0.1.2:

- `canonical`
- `allowed-special-case`
- `legacy-exception`
- `invalid-ambiguous`

Classification semantics are unchanged from V0.1.1. Scope profiles only change selected input paths.

Internal decision normalization (runtime implementation boundary):

- code-owned branching resolves stable outcome IDs (for example `canonical`, `unknown-role`, `deprecated-role`, `missing-role`)
- registry-owned finding policy maps each outcome ID to finding metadata vocabulary (`code`, `severity`, `classification`, `message`, `ruleRef`, optional `suggestedFix`)
- runtime behavior remains deterministic and output-equivalent while separating branch mechanics from policy metadata defaults

## Finding Schema

Each finding uses a stable object shape:

- `code` (string)
- `severity` (`info` | `warn`)
- `path` (normalized relative path)
- `classification` (classification enum)
- `message` (human-readable summary)
- `ruleRef` (spec/master-list rule reference)
- `suggestedFix` (optional)
- `details` (optional object)

Rule ID note (canonical linkage):

- naming currently emits `code` values (`NAMING_*`) as the stable finding identifiers
- map `code` to canonical `ruleId` for suite-wide contracts and future slice alignment
- canonical contract reference: [`ValidatorRuleIds-Contract.md`](./ValidatorRuleIds-Contract.md)

Report object includes (canonical current contract for naming slice output):

- `mode`
- `validatorId`
- `toolVersion` (plus transitional `validatorVersion` alias)
- `sourceSnapshot`
- `startedAt` / `endedAt` / `durationMs`
- `scope`
- `totalFilesScanned`
- `filters`
- `scopeSummary`
- `scopeContract`
- summary count objects (`counts`, `codeCounts`, `specialCaseTypeCounts`, `warningRoleStatusCounts`, `warningRoleCategoryCounts`, `familyRootCounts`, `familySubgroupCounts`, `semanticFamilyCounts`)
- `findings`

When `--config=<path>` is supplied, report metadata may include:

- `configDigest`
- `registryState`
- `registrySource`
- `registryDigests`

### Semantic-family report surfaces (current emitted behavior)

Current naming runtime now emits bounded naming-owned semantic-family report surfaces in two layers:

- per-file derived details in `finding.details` when the semantic-name shape supports deterministic semantic-family interpretation, currently including `semanticTokens`, `semanticFamily`, `familyRoot`, `familySubgroup`, optional `ambiguityFlags`, optional `splitFamilyFlags`, and run-scoped `relatedSemanticNames` when another same-family peer is observed in the run
- run-level aggregate naming observations in the report envelope: `familyRootCounts`, `familySubgroupCounts`, and `semanticFamilyCounts`

Aggregate inclusion rule (explicit current runtime behavior):

- `familyRootCounts` uses canonical root evidence only: findings must be classified as `canonical` and carry naming-derived `semanticName` plus `familyRoot`
- `familySubgroupCounts`, `semanticFamilyCounts`, `relatedSemanticNames`, and split-family observation markers require singular family evidence: findings must be `canonical`, carry `semanticName` + `semanticFamily` + `familyRoot`, and must not carry the non-singular boundary marker `ambiguityFlags: ["family-boundary-heuristic"]`
- invalid, deprecated, missing-role, special-case, or other non-canonical findings never contribute semantic-family aggregates even if a caller manually injects similar-looking fields into `details`
- this keeps family-root observation available while preventing heuristic/non-singular family assignments from inflating family/subgroup peer evidence

Marker semantics (bounded, observational, non-policy):

- `ambiguityFlags` mark bounded cases where current deterministic interpretation required a heuristic family boundary choice; current runtime emits `family-boundary-heuristic` for connector-free semantic names with four or more tokens
- `splitFamilyFlags` mark bounded run-scoped divergence where one observed `familyRoot` maps to multiple observed `semanticFamily` values; current runtime emits `family-root-observed-multiple-families`
- `relatedSemanticNames` is retained and now means same-`semanticFamily` peer semantic names observed in the current run's singular canonical evidence set, sorted deterministically; it is not a registry declaration or a generic semantic-relatedness engine

Boundary clarifications:

- these are naming-owned observed report surfaces, not shared registry declarations
- aggregate counts represent what a naming run observed after canonical-evidence inclusion; they are not policy truth by themselves
- current runtime only emits these derived details when the semantic-name shape supports bounded deterministic interpretation; it does not force every filename to have family outputs
- tree may consume these naming-owned emitted surfaces through a bounded prepared-input bridge and must not re-derive semantic-family semantics from filenames locally
- later custom-registry work may review recurring observations as candidate evidence for additions, overlays, or pinning, but registry truth must still be declared through a separate policy/customization lane

### Naming→Tree semantic-family bridge contract (bounded cross-slice consumption)

Naming remains the sole owner of semantic-family derivation and validity interpretation. Tree may consume naming-emitted semantic-family evidence only through a bounded prepared-input projection, not by reading arbitrary naming runtime internals.

Canonical ownership split:

- naming owns semantic interpretation (`semanticName`, `familyRoot`, `semanticFamily`, optional `familySubgroup`, optional ambiguity/split markers) and naming-validity judgments
- tree owns structural advisories and recommendations derived from prepared structural + naming-owned evidence
- tree must not re-parse semantic names, infer family roots, or reproduce naming validity checks (`missing role`, `bad semantic case`, `deprecated role`, `role-hyphen ambiguity`)

Prepared bridge projection (small explicit surface):

- `path` (normalized repo-relative path)
- `semanticName`
- `familyRoot`
- `semanticFamily`
- optional `familySubgroup`
- optional `ambiguityFlags`
- optional `splitFamilyFlags`

This bridge is an intentionally narrow projection for advisory consumption. It is not a generic "pass the full naming report to tree" contract.

Current runner production path (shipped behavior):

- the shared suite runner stages naming before tree whenever tree is selected in the run
- naming-owned projection is prepared from naming findings through a dedicated naming-owned bridge projection helper
- tree receives only `namingSemanticFamilyBridge.observations[]` through tree wiring; tree never receives raw naming runtime internals from runner staging
- `validate:naming` remains naming-only output
- `validate:tree` and `validate:all` now automatically include naming-produced bridge evidence for tree advisories through the shared runner path

### Special-case subtype metadata

V0.1.2 keeps top-level classification `allowed-special-case` and includes deterministic subtype metadata in `details.specialCaseType`:

- `ecosystem-required`: `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.*`, `eslint.config.*`
- `barrel`: `index.ts`, `index.tsx`
- `test-convention`: `*.test.*`, `*.spec.*`
- `ambient-declaration`: `*.d.ts`
- `conventional-doc`: `README.md`

### Deprecated role metadata

When a canonical-like parse resolves to a known deprecated role (currently `view`):

- classification remains `invalid-ambiguous`
- code is `NAMING_DEPRECATED_ROLE`
- `details` includes parsed filename metadata plus:
  - `roleStatus: "deprecated"`
  - `roleCategory: "deprecated"`
  - optional `deprecationNote`
- validator does not auto-map deprecated role to modern roles (manual migration required)

## Finding / Error Codes (V0.1.2 current runtime set)

- `NAMING_CANONICAL`
- `NAMING_ALLOWED_SPECIAL_CASE`
- `NAMING_LEGACY_EXCEPTION`
- `NAMING_MISSING_ROLE`
- `NAMING_UNKNOWN_ROLE`
- `NAMING_DEPRECATED_ROLE`
- `NAMING_BAD_SEMANTIC_CASE`
- `NAMING_ROLE_HYPHEN_AMBIGUITY`

## Rollout Modes

Mode semantics are centralized in the suite-wide matrix in [`ValidatorSuite-Contracts-And-Modes.md`](./ValidatorSuite-Contracts-And-Modes.md).

Naming V0.1.7 currently implements:

- `report` only (slice behavior)
  - emits findings and summary deterministically before any enforcement/fix behavior
  - exit code is policy-driven in current implementation:
    - exit `2` when any finding has `severity="warn"`
    - when no warnings exist, `--strict` exits `1` when any finding has `classification="legacy-exception"`
    - otherwise exit `0`
  - invalid CLI usage (e.g., unknown `--scope`) exits `1`

`--strict` in this naming slice is an exit-policy modifier, not a separate detection mode. See [`ValidatorSuite-Contracts-And-Modes.md`](./ValidatorSuite-Contracts-And-Modes.md) for canonical policy framing.
When both CLI and config are present, CLI `--strict` has precedence for strict-exit resolution. Config-only strict exit is currently `strictExit=true` with no CLI `--strict` required.

Suite policy options are shared contracts but deferred for naming implementation:

- `soft-fail`
- `hard-fail`
- `correct`
- `replace`

## Allowed Special-Case Handling Rules

V0.1.2 recognizes these special cases:

- barrel files: `index.ts`, `index.tsx`
- framework/tool required names:
  - `package.json`
  - `package-lock.json`
  - `tsconfig*.json`
  - `vite.config.*`
  - `eslint.config.*`
- test files: `*.test.*`, `*.spec.*`
- ambient declarations: `*.d.ts`
- conventional docs: `README.md`

## Legacy Exception Handling Rules

For incremental adoption, V0.1.2 classifies non-canonical in-scope files as `legacy-exception` when they do not clearly claim canonical syntax.

A file is `invalid-ambiguous` instead of `legacy-exception` when it presents canonical intent but violates contract deterministically, including:

- missing-role candidate detection is bounded by normalized registry-backed patterns:
  - two-dot-segment form: `<semantic>.<ext>`
  - compound extension form: `<semantic>.module.css` (reported extension remains `module.css`)
- unknown role segment in canonical position
- deprecated role segment in canonical position
- semantic-name casing violation in canonical position
- hyphen-appended role ambiguity

## Determinism Requirements

- normalize path separators to `/`
- scope profile include sets are explicit
- deduplicate overlapping inclusions before classification
- sort findings by normalized path ascending
- stable classification and code assignment per filename
- deterministic summary breakdown ordering
- same scope + same repository state => identical counts and ordering

## Summary / Reporting Expectations by Scope

- `repo`: full baseline for complete repository migration visibility
- `app`: app-focused baseline to reduce non-app noise
- `docs`: docs-focused baseline for documentation naming profile visibility
- `validator`: validator-focused baseline for validator package and scripts
- `system`: root-tooling baseline for system-level configuration files

## Non-Goals (V0.1.2)

- changed-files mode (deferred)
- no automatic rename suggestions beyond optional textual hints
- no repository-wide rename migration
- no automatic suppression generation
- no cross-file semantic validation
- no role taxonomy expansion for `provider`/`catalog`/`ids`/`anchor` in this slice
- no surface-aware role validity enforcement yet (category↔surface matrix remains governance-only in this slice)
