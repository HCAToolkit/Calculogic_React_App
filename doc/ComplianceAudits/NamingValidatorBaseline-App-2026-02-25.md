# Naming Validator Baseline (V0.1.2 Report Mode, App Scope)

## Scope

- Validator: filename naming validator V0.1.2
- Mode: `report` only (no enforcement)
- Scope profile: `app`
- Command: `npm run validate:naming -- --scope=app`
- Source authority: `doc/ConventionRoutines/FileNamingMasterList-V1_1.md`

## Baseline Summary

- Total files scanned: **52**

### Classification counts

- `canonical`: **1**
- `allowed-special-case`: **17**
- `legacy-exception`: **19**
- `invalid-ambiguous`: **15**

### Counts by finding code

- `NAMING_ALLOWED_SPECIAL_CASE`: **17**
- `NAMING_BAD_SEMANTIC_CASE`: **10**
- `NAMING_CANONICAL`: **1**
- `NAMING_DEPRECATED_ROLE`: **1**
- `NAMING_LEGACY_EXCEPTION`: **19**
- `NAMING_UNKNOWN_ROLE`: **4**

### Counts by specialCaseType

- `ambient-declaration`: **1**
- `barrel`: **5**
- `ecosystem-required`: **7**
- `test-convention`: **4**

## Interpretation Note

App scope significantly reduces docs-driven legacy-exception noise while preserving app/tooling migration visibility.

## Determinism Note

Repeated runs for the same scope/repo state produced identical ordering and counts.
