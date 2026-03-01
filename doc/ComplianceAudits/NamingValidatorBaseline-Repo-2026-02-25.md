# Naming Validator Baseline (V0.1.2 Report Mode, Repo Scope)

## Scope

- Validator: filename naming validator V0.1.2
- Mode: `report` only (no enforcement)
- Scope profile: `repo`
- Command: `npm run validate:naming -- --scope=repo`
- Source authority: `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`

## Baseline Summary

- Total files scanned: **118**

### Classification counts

- `canonical`: **1**
- `allowed-special-case`: **22**
- `legacy-exception`: **80**
- `invalid-ambiguous`: **15**

### Counts by finding code

- `NAMING_ALLOWED_SPECIAL_CASE`: **22**
- `NAMING_BAD_SEMANTIC_CASE`: **10**
- `NAMING_CANONICAL`: **1**
- `NAMING_DEPRECATED_ROLE`: **1**
- `NAMING_LEGACY_EXCEPTION`: **80**
- `NAMING_UNKNOWN_ROLE`: **4**

### Counts by specialCaseType

- `ambient-declaration`: **1**
- `barrel`: **5**
- `conventional-doc`: **5**
- `ecosystem-required`: **7**
- `test-convention`: **4**

## Interpretation Note

Repo scope remains the full migration baseline and intentionally includes docs-heavy legacy exceptions.

## Determinism Note

Repeated runs for the same scope/repo state produced identical ordering and counts.
