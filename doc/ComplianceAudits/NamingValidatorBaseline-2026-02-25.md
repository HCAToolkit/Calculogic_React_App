# Naming Validator Baseline (V0.1 Report Mode)

## Scope

- Validator: filename naming validator V0.1
- Mode: `report` only (no enforcement)
- Source authority: `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`

## Baseline Summary

- Total files scanned: **114**
- `canonical`: **1**
- `allowed-special-case`: **17**
- `legacy-exception`: **81**
- `invalid-ambiguous`: **15**

## Invalid/Ambiguous Findings

- Invalid/ambiguous findings count: **15**
- Breakdown by finding code:
  - `NAMING_BAD_SEMANTIC_CASE`: 10
  - `NAMING_UNKNOWN_ROLE`: 5

## Notable Patterns Observed

1. Most non-canonical files currently classify as `legacy-exception`, consistent with incremental adoption.
2. Most invalid findings are semantic-name casing violations on filenames that otherwise resemble canonical role placement.
3. A smaller set of invalid findings use role-like dot segments that are outside the current active role registry.
4. Framework/tool/test/barrel patterns classify as `allowed-special-case` and are not flagged for migration in V0.1.

## Determinism Note

Repeated runs produced identical ordered output and identical classification counts for this baseline.

## Enforcement Note

This baseline is informational only. V0.1 does **not** fail CI or block merges for naming findings.
