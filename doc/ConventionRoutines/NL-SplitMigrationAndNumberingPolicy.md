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

Status token meanings are centralized in:

- `doc/ConventionRoutines/StatusVocabularyRegistry-V1.md`

This policy keeps the core scaffold lifecycle statuses and relies on the registry for deterministic shared meanings:

1. **planned**
2. **in-progress**
3. **repointed**
4. **retired**

### Lifecycle Vocabulary Alignment Note

The four statuses above are the **minimum/core scaffold** for this policy. Additional transitional statuses used in architecture/inventory/playbook tracking (for example `extracted`, `legacy-wrapper`, `deferred`) should use the same centralized meanings from the registry rather than ad-hoc redefinition.

`legacy-wrapper` may apply to NL docs when a monolith or index/wrapper continues forwarding readers to repointed split-canonical slices. In code-oriented inventories, the same term may remain code-centric; NL docs may alternatively use equivalent explicit wording when that is clearer.

## Numbering and Provenance Continuity Rules

- Preserve stable NL section continuity inside content and provenance artifacts; do not break the per-document 1–10 skeleton contract.
- For migrated slices, record traceability from legacy section ranges/atom references to split-canonical locations.
- Keep continuity in mapping tables, headings, and provenance tokens; do not rely on positional filename numbering to carry migration meaning.
- Mark migration state truthfully; avoid declaring repointed/retired status before actual content migration is complete.

## Naming Guidance References

- Use semantic, low-churn NL filenames aligned with the naming philosophy in:
  - `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
- Keep migration-order readability via index/manifest docs where needed, instead of churn-prone filename prefixes.

## High-Level Slice Done Checklist (Code + NL Co-Migration)

A slice is considered done when all of the following are true:

- [ ] Split-canonical NL target exists and follows the stable skeleton contract.
- [ ] Legacy wrapper/index mapping table is updated with accurate status and provenance links.
- [ ] Section/atom traceability from legacy to split target is explicit.
- [ ] Any co-migrated implementation/docs are synchronized under NL-first workflow expectations.
- [ ] No stale placeholder claims remain for the completed slice.

## Cross-References

- `doc/ConventionRoutines/StatusVocabularyRegistry-V1.md`
- `doc/ConventionRoutines/General-NL-Skeletons.md`
- `doc/ConventionRoutines/NL-First-Workflow.md`
- `calculogic-validator/doc/ConventionRoutines/CCPP.md`
- `calculogic-validator/doc/ConventionRoutines/CSCS.md`
