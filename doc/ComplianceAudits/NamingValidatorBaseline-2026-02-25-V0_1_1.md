# Naming Validator Baseline (V0.1.1 Report Mode)

## Scope

- Validator: filename naming validator V0.1.1 polish pass
- Mode: `report` only (no enforcement)
- Source authority: `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`

## Baseline Summary

- Total files scanned: **114**

### Classification counts

- `canonical`: **1**
- `allowed-special-case`: **22**
- `legacy-exception`: **76**
- `invalid-ambiguous`: **15**

### Warning code breakdown

- `NAMING_BAD_SEMANTIC_CASE`: **10**
- `NAMING_DEPRECATED_ROLE`: **1**
- `NAMING_UNKNOWN_ROLE`: **4**

### Special-case subtype breakdown

- `ambient-declaration`: **1**
- `barrel`: **5**
- `conventional-doc`: **5**
- `ecosystem-required`: **7**
- `test-convention`: **4**

### Warning role metadata breakdown

- Role status:
  - `active`: **10**
  - `deprecated`: **1**
- Role category:
  - `architecture-support`: **1**
  - `concern-core`: **9**
  - `deprecated`: **1**

## V0.1.1 Notes

1. Deprecated role awareness is explicit in V0.1.1: files using role segment `view` in canonical position now emit `NAMING_DEPRECATED_ROLE` and include deprecation metadata for manual migration planning.
2. README policy in V0.1.1 is explicit: `README.md` is treated as `allowed-special-case` with `specialCaseType: conventional-doc`.
3. Ecosystem/tooling/test/barrel/ambient files remain report-mode special cases and now include deterministic subtype metadata.
4. Report mode remains informational only (`exit 0`) with no soft-fail/hard-fail enforcement in this slice.

## Determinism Note

Repeated runs produced identical ordered output and identical summary counts.

## Enforcement Note

This baseline is informational only. V0.1.1 does **not** fail CI or block merges for naming findings.
