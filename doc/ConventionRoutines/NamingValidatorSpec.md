# Naming Validator Spec (V0.1.1)

## Purpose and Scope

This document defines the V0.1.1 filename naming validator slice for deterministic automation.

V0.1.1 scope is intentionally narrow:
- filename validation only
- report mode only
- deterministic findings output
- richer diagnostics for migration planning
- no rename enforcement

Out of scope for V0.1.1:
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

## Canonical Filename Contract (V0.1.1)

Canonical grammar:
- `<semantic-name>.<role>.<ext>`

Recognized compound format suffixes in V0.1.1:
- `module.css`

Filename grammar is unchanged from V0.1.

## Role Registry Metadata (V0.1.1)

V0.1.1 uses a structured role registry with metadata:
- `role`
- `category` (`concern-core` | `architecture-support` | `deprecated`)
- `status` (`active` | `deprecated`)
- `notes` (optional)

Active roles:
- `host` (`architecture-support`, `active`)
- `wiring` (`architecture-support`, `active`)
- `contracts` (`architecture-support`, `active`)
- `build` (`concern-core`, `active`)
- `build-style` (`concern-core`, `active`)
- `logic` (`concern-core`, `active`)
- `knowledge` (`concern-core`, `active`)
- `results` (`concern-core`, `active`)
- `results-style` (`concern-core`, `active`)

Deprecated historical roles:
- `view` (`deprecated`, `deprecated`) — historical pre-current concern split term.

Semantic-name rules:
- kebab-case only for canonical filenames
- semantic name is everything before role segment

Parsing assumptions:
- role is the segment immediately before extension/format segment
- for `module.css`, role is the segment before `module`
- role suffix must be dot-separated (not hyphen-appended)

## Input Scope Modes

V0.1.1 defines these modes:

1. `all-files` (implemented)
   - scans repository files with deterministic sorting
2. `folder-targeted` (placeholder in spec)
   - planned: scan only selected folder prefixes
3. `changed-files` (placeholder in spec)
   - planned: scan files from VCS diff set

## Classification Outputs

Stable classifications used by V0.1.1:
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

### Special-case subtype metadata

V0.1.1 keeps top-level classification `allowed-special-case` and adds deterministic subtype metadata in `details.specialCaseType`:
- `ecosystem-required`: `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.*`, `eslint.config.*`
- `barrel`: `index.ts`, `index.tsx`
- `test-convention`: `*.test.*`, `*.spec.*`
- `ambient-declaration`: `*.d.ts`
- `conventional-doc`: `README.md`

README policy in V0.1.1: `README.md` is treated as `allowed-special-case` with subtype `conventional-doc`.

### Deprecated role metadata

When a canonical-like parse resolves to a known deprecated role (currently `view`):
- classification remains `invalid-ambiguous`
- code is `NAMING_DEPRECATED_ROLE`
- `details` includes parsed filename metadata plus:
  - `roleStatus: "deprecated"`
  - `roleCategory: "deprecated"`
  - optional `deprecationNote`
- validator does not auto-map deprecated role to modern roles (manual migration required)

## Finding / Error Codes (V0.1.1)

- `NAMING_CANONICAL`
- `NAMING_ALLOWED_SPECIAL_CASE`
- `NAMING_LEGACY_EXCEPTION`
- `NAMING_UNKNOWN_ROLE`
- `NAMING_DEPRECATED_ROLE`
- `NAMING_BAD_SEMANTIC_CASE`
- `NAMING_ROLE_HYPHEN_AMBIGUITY`

Code alignment note: `NAMING_INVALID_PATTERN` is deferred/removed from active V0.1.1 emission because unmatched filenames are intentionally classified as `NAMING_LEGACY_EXCEPTION` in report mode.

## Rollout Modes

- `report` (V0.1.1 behavior)
  - always emits findings and summary
  - never fails build in V0.1.1
- `soft-fail` (deferred)
  - planned targeted enforcement by folders or changed files
- `hard-fail` (deferred)
  - planned full enforcement with explicit exceptions

## Exit Code Behavior

V0.1.1 report mode exit behavior:
- process exits `0`
- invalid findings are reported but do not fail command

## Allowed Special-Case Handling Rules

V0.1.1 recognizes these special cases:
- barrel files: `index.ts`, `index.tsx`
- framework/tool required names (root/tooling config patterns):
  - `package.json`
  - `package-lock.json`
  - `tsconfig*.json`
  - `vite.config.*`
  - `eslint.config.*`
- test files: `*.test.*`, `*.spec.*`
- ambient declarations: `*.d.ts`
- conventional docs: `README.md`

Special-case list is explicit and intentionally narrow in V0.1.1.

## Legacy Exception Handling Rules

For incremental adoption, V0.1.1 classifies non-canonical in-scope files as `legacy-exception` when they do not clearly claim canonical syntax.

A file is `invalid-ambiguous` instead of `legacy-exception` when it presents canonical intent but violates contract deterministically, including:
- unknown role segment in canonical position
- deprecated role segment in canonical position
- semantic-name casing violation in canonical position
- hyphen-appended role ambiguity (e.g., `leftpanel-selector-wiring.ts`)

## Determinism Requirements

- normalize path separators to `/`
- sort findings by normalized path ascending
- stable classification and code assignment per filename
- deterministic summary breakdown ordering

## Non-Goals (V0.1.1)

- no automatic rename suggestions beyond optional textual hints
- no repository-wide rename migration
- no automatic suppression generation
- no cross-file semantic validation
