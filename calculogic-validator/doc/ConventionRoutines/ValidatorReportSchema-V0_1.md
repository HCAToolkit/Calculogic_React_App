# Validator Report Schema (V0.1)

## 1) Purpose and Scope (Canonical)

This document is the **canonical** reference for Calculogic Validator report JSON structure.

It explicitly defines both report envelopes used today:

- **Slice Report** (single-slice CLI output, for example `validate:naming`)
- **Runner Report** (multi-slice CLI output, for example `validate:all`)

Where implementation-specific naming currently differs, this schema records current emitted keys and notes canonical alignment.

## 2) Terms

- **Report Envelope**: the top-level JSON object emitted by a validator command.
- **Slice**: one validator domain/module (for example `naming`, later `tree`).
- **Runner**: orchestrator that executes one or more slices and emits a multi-slice report.
- **Finding**: one deterministic diagnostic record produced by a slice.
- **Summary**: deterministic aggregate counts and rollups for findings.
- **SourceSnapshot**: reproducibility metadata about the scanned source state.
- **Config Digest / Fingerprint**: stable digest/fingerprint of resolved config used for the run.

## 3) Canonical: Slice Report Envelope

The slice report envelope is the canonical shape for single-slice output. Current naming CLI output must include these fields:

### Required fields

- `mode` (string; currently `"report"`)
- `validatorId` (string; for naming slice: `"naming"`)
- `toolVersion` (string when tool version is resolved)
- `sourceSnapshot` (object)
- `startedAt` (ISO-8601 datetime string)
- `endedAt` (ISO-8601 datetime string)
- `durationMs` (number)
- `scope` (string)
- `totalFilesScanned` (number)
- `filters` (object)
- `counts` (object)
- `findings` (array of finding objects)

### Optional / transitional fields

- `validatorVersion` (string; currently emitted alongside `toolVersion` for compatibility)
- `configDigest` (string; present when config is supplied)
- `scopeSummary` (object; deterministic slice summary)
- `scopeContract` (object; deterministic scope metadata)
- `codeCounts` (object; naming transitional summary key)
- `specialCaseTypeCounts` (object; naming-specific summary key)
- `warningRoleStatusCounts` (object; naming-specific summary key)
- `warningRoleCategoryCounts` (object; naming-specific summary key)
- `registryState` (`"builtin" | "custom"`; optional registry-state metadata)
- `registrySource` (`"builtin" | "custom" | "config"`; optional resolved source metadata)
- `registryDigests` (object `{ builtin, custom, resolved }`; optional digest transparency metadata)

## 4) Canonical: Runner Report Envelope

The runner report envelope is the canonical shape for multi-slice output. Current runner output must include these fields:

### Required fields

- `version` (string; report contract version)
- `mode` (string; currently `"report"`)
- `validatorId` (string; `"runner"`)
- `sourceSnapshot` (object)
- `startedAt` (ISO-8601 datetime string)
- `endedAt` (ISO-8601 datetime string)
- `durationMs` (number)
- `validators` (array of runner validator entries)

### Optional fields

- `scope` (string; when a scoped run is requested)
- `toolVersion` (string)
- `validatorVersion` (string; currently emitted alongside `toolVersion` for compatibility)
- `configDigest` (string; when config is supplied)

## 5) Canonical: Runner `validators[]` Entry

Each `validators[]` entry must include:

- `id` (string; runner registry id)
- `validatorId` (string; slice id)
- `description` (string)
- `findings` (array; possibly empty)

Entry-level optional fields:

- `scope` (string)
- `totalFilesScanned` (number)
- `counts` (object)
- `meta` (object)
  - `meta.filters` (object; present when runner forwards active target filtering metadata)
  - `meta.registry` (object; present when slice exposes registry-state metadata, e.g. naming)

Pass-through summary keys are allowed (for example naming summary keys beyond `counts`), but they must be deterministic and documented by the corresponding slice spec.

## 6) Canonical: Finding Object Shape (Suite-wide baseline)

Suite-wide minimum finding shape:

- `ruleId` (string; canonical stable identifier, see `ValidatorRuleIds-Contract.md`)
- `severity` (`info` | `warn` | `error`)
- `path` (normalized repo-relative path using `/`)
- `message` (string)
- `details` (optional object)
- `ruleRef` (optional repo-local rule/spec pointer string)
- `suggestedFix` (optional object; plan-only where applicable)

Transitional note: naming currently emits `code`. Until migration is complete, treat `code` as the effective `ruleId`.

## 7) Determinism Rules (Canonical)

- Normalize all reported file paths to `/` separators.
- Sort findings by:
  1. `path` ascending,
  2. `ruleId` ascending (or transitional `code`),
  3. stable tie-breakers (for example deterministic message/details ordering).
- Sort `targets` input lists before persistence/emission.
- Keep count/summary object key order deterministic when serialized (stable stringify is recommended for digest/comparison workflows).
- Same inputs + same resolved config => identical report payload.

## 8) Examples (matching current implementation)

### 8.1 Slice report example (`validate:naming`)

```json
{
  "mode": "report",
  "validatorId": "naming",
  "toolVersion": "0.1.7",
  "validatorVersion": "0.1.7",
  "configDigest": "sha256:abc123",
  "sourceSnapshot": {
    "source": "fs",
    "gitRef": "HEAD"
  },
  "startedAt": "2026-01-10T12:00:00.000Z",
  "endedAt": "2026-01-10T12:00:00.120Z",
  "durationMs": 120,
  "scope": "app",
  "totalFilesScanned": 42,
  "filters": {
    "isFiltered": true,
    "targets": ["src/buildsurface", "src/shared"]
  },
  "scopeSummary": {
    "scope": "app",
    "reportableFilesInScope": 42,
    "findingsGenerated": 2
  },
  "scopeContract": {
    "description": "Application source files",
    "includeRoots": ["src"],
    "includeRootFiles": []
  },
  "counts": {
    "info": 1,
    "warn": 1,
    "total": 2
  },
  "codeCounts": {
    "NAMING_CANONICAL": 1,
    "NAMING_UNKNOWN_ROLE": 1
  },
  "specialCaseTypeCounts": {
    "barrel": 0
  },
  "warningRoleStatusCounts": {
    "active": 1
  },
  "warningRoleCategoryCounts": {
    "architecture-support": 1
  },
  "findings": [
    {
      "code": "NAMING_UNKNOWN_ROLE",
      "severity": "warn",
      "path": "src/shared/user-widget.thing.ts",
      "classification": "invalid-ambiguous",
      "message": "Unknown role token 'thing'.",
      "ruleRef": "calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md#finding--error-codes"
    }
  ]
}
```

### 8.2 Runner report example (`validate:all`)

```json
{
  "version": "0.1",
  "mode": "report",
  "scope": "repo",
  "validatorId": "runner",
  "toolVersion": "0.1.7",
  "validatorVersion": "0.1.7",
  "configDigest": "sha256:abc123",
  "sourceSnapshot": {
    "source": "fs",
    "gitRef": "HEAD"
  },
  "startedAt": "2026-01-10T12:00:00.000Z",
  "endedAt": "2026-01-10T12:00:00.300Z",
  "durationMs": 300,
  "validators": [
    {
      "id": "naming",
      "validatorId": "naming",
      "description": "Filename naming validator",
      "scope": "repo",
      "totalFilesScanned": 420,
      "counts": {
        "info": 410,
        "warn": 10,
        "total": 420
      },
      "codeCounts": {
        "NAMING_CANONICAL": 410,
        "NAMING_UNKNOWN_ROLE": 10
      },
      "findings": []
    }
  ]
}
```
