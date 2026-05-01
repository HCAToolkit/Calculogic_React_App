# AGENTS.md

## Scope
These instructions apply to the entire repository.

## Purpose
This repository uses a docs-first workflow with validator-backed conventions.
Agents must keep changes deterministic, minimal, and ownership-aligned.

## Required pre-work for each task
Before making changes, read:
1. `calculogic-validator/doc/ConventionRoutines/CCPP.md`
2. `calculogic-validator/doc/ConventionRoutines/CCS.md`
3. `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
4. `doc/ConventionRoutines/General-NL-Skeletons.md`
5. `doc/ConventionRoutines/NL-First-Workflow.md`

If a required canonical convention document is missing, stop and report the missing file rather than inventing replacements.

## NL-first and concern purity
- Follow NL-first: update the relevant NL/canonical doc first when structure, behavior, contracts, or conventions change.
- Preserve concern purity and dependency direction per CCS.
- Preserve comment/provenance rules per CCPP.

## Naming and validator authority
- Treat `FileNamingMasterList-V1_1.md` as canonical naming authority.
- Treat validator-owned convention docs as canonical when both validator-owned and repo-local pointer docs exist.
- Do not assume validators enforce all taxonomy concepts unless explicitly documented in the active validator spec.

## Task boundaries
- Keep PRs narrowly scoped to the requested issue.
- Do not broaden into unrelated runtime refactors or convention rewrites.
- Do not modify validator behavior, registry payloads/loaders, report output, CI workflows, templates, or specs unless explicitly requested.

## Verification
- Run the narrowest relevant checks for files touched.
- If a requested check does not target a touched path, note the limitation and do not broaden scope.

## PR requirements
- Include concise summary and verification results.
- Reference the issue being closed (for example: `Closes #<issue-number>`).
