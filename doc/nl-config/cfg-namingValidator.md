# cfg-namingValidator

## 0.0 Version
Current implementation target: **V0.1.2** (report-mode scope-profile polish pass).

## 1.0 Purpose
Define a deterministic V0.1 filename naming validator that runs in report mode only and classifies repository filenames against the canonical naming contract.

## 2.0 Inputs and Source of Truth
### 2.1 Naming authority
The validator reads rules from `doc/ConventionRoutines/FileNamingMasterList-V1_1.md` as authoritative naming guidance.

### 2.2 Scope mode (V0.1.2)
V0.1.2 supports deterministic scope profiles selected via CLI and applied before filename classification:
- `repo` (default): repository-wide reportable files.
- `app`: app-focused files (`src/`, `test/`, `scripts/`, and explicit root tooling files).
- `docs`: docs-focused files (`doc/`, `docs/`, and root `README.md`).

All scope profile inclusions are explicit and deterministic. Invalid scope inputs are treated as CLI usage errors.

### 2.3 Role registry metadata (V0.1.1)
The validator uses a structured role registry with metadata fields:
- `role`
- `category` (`concern-core`, `architecture-support`, `deprecated`)
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

Deprecated historical roles:
- view

## 3.0 Classification Contract
### 3.1 Canonical
Classify as canonical when filename parses as `<semantic-name>.<role>.<ext>` (including `.module.css`) with kebab-case semantic name and known role.

### 3.2 Allowed special case
Classify as allowed special case for reserved filenames and patterns including barrel files, framework-required names, test files, ambient declaration files, and README convention docs.

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

### 4.5 Exit behavior (report mode)
Report mode always exits with status code 0 and prints counts by classification.

## 5.0 Deferred Behavior
Deferred to later slices:
- soft-fail mode
- hard-fail mode
- changed-files mode
- auto-fix/rename workflows
- provenance consistency checks
- other validators
