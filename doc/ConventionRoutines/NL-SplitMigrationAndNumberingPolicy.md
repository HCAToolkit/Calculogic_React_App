# NL Split Migration and Numbering Policy (Scaffold)

## Purpose and Scope

This policy defines lightweight conventions for NL-document split migrations during semantic refactors (for example, Build Surface decomposition) while preserving existing NL-first and skeleton-contract rules.

- In scope: NL migration lifecycle, wrapper/index behavior, numbering/provenance continuity, and cross-reference expectations.
- Out of scope: replacing the base 1–10 skeleton templates, imposing repo-wide filename validators, or mandating immediate mass renames.

## Definitions

- **Legacy monolith NL doc:** Existing single NL file that currently contains end-to-end configuration documentation.
- **Split-canonical NL doc:** New semantic NL file intended to become canonical for a bounded responsibility slice.
- **Wrapper/index doc:** Transitional legacy NL document that remains readable while forwarding/repointing migrated slices to split-canonical targets.

## Migration Lifecycle Statuses

Use explicit statuses in migration indexes/mapping tables:

1. **planned** – target and intent identified; no canonical repoint yet.
2. **in-progress** – split target drafting/migration underway.
3. **repointed** – canonical source moved for the mapped slice; provenance links recorded.
4. **retired** – legacy slice/doc no longer canonical after complete verified migration.

## Numbering and Provenance Continuity Rules

- Preserve stable NL section continuity inside content and provenance artifacts; do not break the per-document 1–10 skeleton contract.
- For migrated slices, record traceability from legacy section ranges/atom references to split-canonical locations.
- Keep continuity in mapping tables, headings, and provenance tokens; do not rely on positional filename numbering to carry migration meaning.
- Mark migration state truthfully; avoid declaring repointed/retired status before actual content migration is complete.

## Naming Guidance References

- Use semantic, low-churn NL filenames aligned with the naming philosophy in:
  - `doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
- Keep migration-order readability via index/manifest docs where needed, instead of churn-prone filename prefixes.

## High-Level Slice Done Checklist (Code + NL Co-Migration)

A slice is considered done when all of the following are true:

- [ ] Split-canonical NL target exists and follows the stable skeleton contract.
- [ ] Legacy wrapper/index mapping table is updated with accurate status and provenance links.
- [ ] Section/atom traceability from legacy to split target is explicit.
- [ ] Any co-migrated implementation/docs are synchronized under NL-first workflow expectations.
- [ ] No stale placeholder claims remain for the completed slice.

## Cross-References

- `doc/ConventionRoutines/General-NL-Skeletons.md`
- `doc/ConventionRoutines/NL-First-Workflow.md`
- `doc/ConventionRoutines/CCPP.md`
- `doc/ConventionRoutines/CSCS.md`
