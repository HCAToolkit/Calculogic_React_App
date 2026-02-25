# Naming Validator Spec (V0.1)

## Purpose and Scope

This document defines the V0.1 filename naming validator slice for deterministic automation.

V0.1 scope is intentionally narrow:
- filename validation only
- report mode only
- deterministic findings output
- no rename enforcement

Out of scope for V0.1:
- structural addressing validation
- NL↔Code numbering/parity validation
- provenance token consistency checks
- auto-fix or rename execution
- broad migration/cleanup enforcement

## Source-of-Truth References

Primary naming authority:
- `doc/ConventionRoutines/FileNamingMasterList-V1_1.md`

Supporting workflow alignment:
- `doc/ConventionRoutines/NL-First-Workflow.md`
- `doc/ConventionRoutines/CSCS.md`
- `doc/ConventionRoutines/CCPP.md`

## Canonical Filename Contract (V0.1)

Canonical grammar:
- `<semantic-name>.<role>.<ext>`

Recognized compound format suffixes in V0.1:
- `module.css`

V0.1 active role registry:
- `host`
- `wiring`
- `contracts`
- `build`
- `build-style`
- `logic`
- `knowledge`
- `results`
- `results-style`

Semantic-name rules:
- kebab-case only for canonical filenames
- semantic name is everything before role segment

Parsing assumptions:
- role is the segment immediately before extension/format segment
- for `module.css`, role is the segment before `module`
- role suffix must be dot-separated (not hyphen-appended)

## Input Scope Modes

V0.1 defines these modes:

1. `all-files` (implemented)
   - scans repository files with deterministic sorting
2. `folder-targeted` (placeholder in spec)
   - planned: scan only selected folder prefixes
3. `changed-files` (placeholder in spec)
   - planned: scan files from VCS diff set

## Classification Outputs

Stable classifications used by V0.1:
- `canonical`
- `allowed-special-case`
- `legacy-exception`
- `invalid-ambiguous`

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

## Finding / Error Codes (V0.1)

- `NAMING_CANONICAL`
- `NAMING_ALLOWED_SPECIAL_CASE`
- `NAMING_LEGACY_EXCEPTION`
- `NAMING_INVALID_PATTERN`
- `NAMING_UNKNOWN_ROLE`
- `NAMING_BAD_SEMANTIC_CASE`
- `NAMING_ROLE_HYPHEN_AMBIGUITY`

## Rollout Modes

- `report` (V0.1 behavior)
  - always emits findings and summary
  - never fails build in V0.1
- `soft-fail` (deferred)
  - planned targeted enforcement by folders or changed files
- `hard-fail` (deferred)
  - planned full enforcement with explicit exceptions

## Exit Code Behavior

V0.1 report mode exit behavior:
- process exits `0`
- invalid findings are reported but do not fail command

## Allowed Special-Case Handling Rules

V0.1 recognizes these special cases:
- barrel files: `index.ts`, `index.tsx`
- framework/tool required names (root/tooling config patterns):
  - `package.json`
  - `package-lock.json`
  - `tsconfig*.json`
  - `vite.config.*`
  - `eslint.config.*`
- test files: `*.test.*`, `*.spec.*`
- ambient declarations: `*.d.ts`

Special-case list is explicit and intentionally narrow in V0.1.

## Legacy Exception Handling Rules

For incremental adoption, V0.1 classifies non-canonical in-scope files as `legacy-exception` when they do not clearly claim canonical syntax.

A file is `invalid-ambiguous` instead of `legacy-exception` when it presents canonical intent but violates contract deterministically, including:
- unknown role segment in canonical position
- semantic-name casing violation in canonical position
- hyphen-appended role ambiguity (e.g., `leftpanel-selector-wiring.ts`)

## Determinism Requirements

- normalize path separators to `/`
- sort findings by normalized path ascending
- stable classification and code assignment per filename

## Non-Goals (V0.1)

- no automatic rename suggestions beyond optional textual hints
- no repository-wide rename migration
- no automatic suppression generation
- no cross-file semantic validation
