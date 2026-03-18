# Validator Report Schema (V0.1)

## 1) Purpose and Scope (Canonical)

This document is the **canonical current contract** for Calculogic Validator report JSON structure.

It defines both envelopes emitted in current runtime:

- **Slice Report** (single-slice CLI output, currently `validate:naming`)
- **Runner Report** (runner/composed output, currently `validate:all` and `validate:tree`)

## 2) Terms

- **Report Envelope**: top-level JSON object emitted by a validator command.
- **Slice**: one validator domain/module (for example `naming`, `tree-structure-advisor`).
- **Runner**: orchestrator that executes one or more slices and emits a multi-slice report.
- **Finding**: one deterministic diagnostic record produced by a slice.
- **Summary**: deterministic aggregate counts and rollups for findings.
- **SourceSnapshot**: reproducibility metadata about scanned source state.
- **Config Digest**: stable digest of resolved config used for the run.

## 3) Canonical current contract: Slice Report Envelope

Current naming CLI output includes:

### Required fields (current implementation)

- `mode` (string; current value: `"report"`)
- `validatorId` (string; naming value: `"naming"`)
- `toolVersion` (string)
- `sourceSnapshot` (object)
- `startedAt` (ISO-8601 datetime string)
- `endedAt` (ISO-8601 datetime string)
- `durationMs` (number)
- `scope` (string)
- `totalFilesScanned` (number)
- `filters` (object)
- `scopeSummary` (object)
- `scopeContract` (object)
- `counts` (object; classification-bucket counts)
- `codeCounts` (object)
- `specialCaseTypeCounts` (object)
- `warningRoleStatusCounts` (object)
- `warningRoleCategoryCounts` (object)
- `findings` (array)

### Optional / transitional fields

- `validatorVersion` (string; currently emitted alongside `toolVersion`)
- `configDigest` (string; emitted when config is supplied)
- `registryState` (`"builtin" | "custom"`)
- `registrySource` (`"builtin" | "custom" | "config"`)
- `registryDigests` (object `{ builtin, custom, resolved }`)

Slice-specific future-facing note (bounded, non-claiming):

- Some slices may later document additional optional report surfaces before they become part of the canonical emitted contract.
- For naming specifically, semantic-family-derived per-file details and aggregate observations (for example `familyRootCounts`, `familySubgroupCounts`, `semanticFamilyCounts`) remain slice-specific optional/future-facing surfaces until runtime emission is actually shipped.
- Observed aggregate fields, if/when emitted by a slice, are report observations rather than automatic registry/policy declarations.

## 4) Canonical current contract: Runner Report Envelope

Current runner output includes:

### Required fields

- `version` (string; current value from `CALCULOGIC_VALIDATOR_REPORT_VERSION`, currently `"0.1.0"`)
- `mode` (string; current value: `"report"`)
- `validatorId` (string; `"runner"`)
- `sourceSnapshot` (object)
- `startedAt` (ISO-8601 datetime string)
- `endedAt` (ISO-8601 datetime string)
- `durationMs` (number)
- `validators` (array of runner validator entries)

### Optional fields

- `scope` (string; emitted when scope is provided)
- `toolVersion` (string)
- `validatorVersion` (string; transitional/current compatibility field)
- `configDigest` (string)

## 5) Canonical current contract: Runner `validators[]` Entry

Each entry includes:

- `id` (string; registry id)
- `validatorId` (string; slice id)
- `description` (string)
- `scope` (string)
- `totalFilesScanned` (number)
- `findings` (array)

Entry-level optional fields:

- `counts` (object)
- `meta` (object)
  - `meta.filters` (object; present when target filtering is active)
  - `meta.registry` (object; present when slice exposes registry metadata)

Runner currently passes through deterministic slice summary fields in addition to `counts` (for example naming `codeCounts` and tree `codeCounts`).

## 6) Canonical current contract: Finding Object Baseline

Suite-wide minimum finding baseline in current runtime:

- `severity` (`info` | `warn`)
- `path` (normalized repo-relative path with `/` separators)
- `message` (string)
- `classification` (string)
- `ruleRef` (string)

Current/transitional identifier mapping:

- Naming and tree currently emit `code` as the stable finding identifier.
- Canonical suite rule-id authority remains `ValidatorRuleIds-Contract.md`.
- `ruleId` is deferred/planning for report payload migration; until then `code` is the current emitted identifier.

Optional fields currently emitted by slices:

- `details` (object)
- `suggestedFix` (string; naming policy metadata)

## 7) Determinism Rules (Canonical)

- Normalize reported file paths to `/` separators.
- Keep selected path sets deterministic via sort/dedupe before classification.
- Sort finding arrays deterministically in slice runtime output.
- Sort aggregate summary object keys deterministically where runtime emits sorted breakdowns.
- Same inputs + same resolved config => identical report payload.

## 8) Transitional/current mapping notes

- `validatorVersion` is a compatibility alias currently emitted alongside `toolVersion`.
- Runner and slice reports use `configDigest`; any `configFingerprint` wording is deferred/planning only.
- Fix-plan output fields (`suggestedFix[]`, `appliedFix[]` at envelope level) are deferred/planning only and are not part of the current emitted envelope.

## 9) Current generated examples (illustrative)

Classification: **Illustrative**

Current-runtime report examples are generated from live validator entrypoints and checked in at:

- `calculogic-validator/test/fixtures/report-examples/validate-naming.system.report.example.json`
- `calculogic-validator/test/fixtures/report-examples/validate-all.system.naming.report.example.json`

Refresh workflow:

```bash
node --experimental-strip-types calculogic-validator/scripts/generate-validator-report-examples.mjs
```

Normalization policy for these examples is intentionally bounded for deterministic repo artifacts:

- normalize `startedAt`, `endedAt`, and `durationMs`
- normalize `sourceSnapshot.gitHeadSha`
- normalize `sourceSnapshot.diagnostics` dirty/changed counters

Contract-significant fields remain runtime-faithful (for example `mode`, `validatorId`, `toolVersion`/`validatorVersion`, summary and findings structures).
