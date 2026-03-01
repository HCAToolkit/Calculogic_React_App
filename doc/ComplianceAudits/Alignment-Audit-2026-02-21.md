# Alignment Audit – 2026-02-21

## Scope and method
- Binding routines reviewed first: `calculogic-validator/doc/ConventionRoutines/CCPP.md`, `calculogic-validator/doc/ConventionRoutines/CSCS.md`, `doc/ConventionRoutines/General-NL-Skeletons.md`, and `doc/ConventionRoutines/NL-First-Workflow.md`.
- Recently changed configuration/shell surfaces were identified from git history focused on active config/shell paths.
- Audited targets:
  - `cfg-buildSurface`
  - `shell-globalHeader`

## 1) cfg-buildSurface

### Violations found
1. **Build concern numbering drift in comments**
   - Concern files: `src/tabs/BuildTab.tsx`, `src/tabs/build/BuildSurface.build.tsx`
   - Sections involved: Build `§3.1.x`, `§3.2.x`, `§3.3.x`
   - Violation: Comment labels used coarse or mismatched IDs (`[3.1]`, `[3.2]`, `[3.6.x]`) that did not match NL skeleton numbering.
   - Minimal fix: Renumber atomic comments to the NL identifiers in-order.

2. **Logic concern numbering drift in comments**
   - Concern file: `src/tabs/build/BuildSurface.logic.ts`
   - Sections involved: Logic `§5.1.1`–`§5.1.5`
   - Violation: Container comments used `[5.1]` … `[5.5]` instead of NL IDs.
   - Minimal fix: Renumber to `[5.1.1]` … `[5.1.5]`.

3. **Knowledge concern numbering drift in comments**
   - Concern file: `src/tabs/build/anchors.ts`
   - Sections involved: Knowledge `§6.1.1`, `§6.2.1`
   - Violation: Comments used `[6.1]` and `[6.2]` instead of NL IDs.
   - Minimal fix: Renumber to `[6.1.1]` and `[6.2.1]`.

### Status
- Fixed in this alignment change set.

## 2) shell-globalHeader

### Violations found
1. **NL → Code + Code → NL mismatch for mode menu atoms**
   - Concern files: `doc/nl-shell/shell-globalHeader.md`, `src/components/GlobalHeaderShell/GlobalHeaderShell.build.tsx`
   - Sections involved: Build `§3.2.x`, `§3.3.x`
   - Violation: Build code contained mode-menu atoms/subcontainers not explicitly represented in NL.
   - Minimal fix: Update NL first to add Build/Results mode menu subcontainers and shared mode-menu primitive, then renumber Build comments to match.

2. **Knowledge schema/constants mismatch against NL numbering**
   - Concern files: `doc/nl-shell/shell-globalHeader.md`, `src/components/GlobalHeaderShell/GlobalHeaderShell.knowledge.ts`
   - Sections involved: Knowledge `§6.1.x`, `§6.2.x`
   - Violation: Knowledge file included additional schema/constants with ad-hoc numbering (`6.1.a`, `6.2.a`, etc.) and duplicates not reflected in NL numbering.
   - Minimal fix: Expand NL knowledge entries for tab schema, mode schema/catalog/sequence, then renumber code comments to aligned numeric IDs.

3. **ResultsStyle atom missing explicit NL section mapping**
   - Concern files: `doc/nl-shell/shell-globalHeader.md`, `src/components/GlobalHeaderShell/GlobalHeaderShell.results.css`
   - Sections involved: ResultsStyle `§8.2`
   - Violation: Code included live-region anchor style atom without explicit NL atomic ID.
   - Minimal fix: Add `[8.2.1] Live Region Anchor` to NL and align CSS comment to `[8.2.1]`.

### Status
- Fixed in this alignment change set.

## Purity and dependency direction
- No new cross-concern imports were introduced during alignment.
- Changes are comment/metadata/NL alignment only and preserve existing concern boundaries.

