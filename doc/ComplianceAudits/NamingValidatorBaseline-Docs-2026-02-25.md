# Naming Validator Baseline (V0.1.2 Report Mode, Docs Scope)

## Scope

- Validator: filename naming validator V0.1.2
- Mode: `report` only (no enforcement)
- Scope profile: `docs`
- Command: `npm run validate:naming -- --scope=docs`
- Source authority: `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`

## Baseline Summary

- Total files scanned: **66**

### Classification counts

- `canonical`: **0**
- `allowed-special-case`: **5**
- `legacy-exception`: **61**
- `invalid-ambiguous`: **0**

### Counts by finding code

- `NAMING_ALLOWED_SPECIAL_CASE`: **5**
- `NAMING_LEGACY_EXCEPTION`: **61**

### Counts by specialCaseType

- `conventional-doc`: **5**

## Interpretation Note

Docs scope is expected to show many legacy exceptions due to historical document naming patterns; this provides a targeted docs-only baseline.

## Determinism Note

Repeated runs for the same scope/repo state produced identical ordering and counts.
