# Tree Documentation Map and Reorg Inventory

## Purpose

This document provides one bounded, implementation-facing navigation map for tree-adjacent documentation.

It is intended to:

- identify what documents currently exist for the tree implementation slice,
- distinguish canonical_source implementation guidance from supporting references,
- make explicit “stay put for now” vs “move/split/merge later” decisions,
- reduce ambiguity for human maintainers and Codex task setup before any physical folder reorganization.

Guardrail for this inventory pass: keep changes bounded to the tree NL/config note colocation move plus same-change-set cross-link updates (no broad folder reorganization).

## Canonical Reading Order (Implementation Work)

Use this sequence for tree implementation tasks (runtime, wiring, contracts, or bounded architecture guidance):

1. `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
2. `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md`
3. `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
4. `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md`
5. `calculogic-validator/doc/ValidatorSpecs/tree-documentation-map-and-reorg-inventory.md` (this doc, as navigation/index metadata)

Interpretation note:

- Runtime behavior authority should come from suite contract + tree spec.
- NL/config note is implementation-context guidance that mirrors status labeling and reading order for this slice.
- This map is a navigation/ownership layer and does not redefine runtime behavior.

## Inventory (Bounded Set)

| Document | Document role | Status classification | Audience / usage | Path decision | Action recommendation |
|---|---|---|---|---|---|
| `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md` | Suite contract (canonical_source for shared validator vocabulary/modes/scope boundary) | Current runtime behavior + current implementation policy + limited future advisory direction notes | Runtime implementation, architecture/modeling, Codex task context | **Stay put** at current path | **Keep** |
| `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md` | Canonical spec for tree slice runtime behavior and bounded tree modeling guidance | Mixed: current runtime behavior, current implementation guidance, current architectural/modeling guidance, bounded modeling note, future advisory direction, dogfooding/current-repo reality | Runtime implementation, architecture/modeling, Codex task context | **Stay put** at current path (already under `ValidatorSpecs`, implementation-facing) | **Keep** |
| `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md` | Supporting convention/spec boundary for naming-signal consumption by tree advisor | Current runtime behavior and current implementation guidance for naming slice; supports tree interpretation boundaries | Runtime implementation, architecture/modeling, Codex task context, supporting context only for tree | **Stay put** at current path | **Reference only** for tree tasks |
| `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md` | NL/config implementation note for tree slice | Current implementation guidance + deferred behavior (future advisory direction) + dogfooding/current-repo reality examples | Runtime implementation, Codex task context, historical/reference context for implementation sequencing | **Now colocated** under `ValidatorSpecs/nl-config` with pointer stub retained at the prior repo-root NL path | **Keep** (validator-owned supporting implementation guidance) |
| `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md` | Supporting convention (canonical_source for filename grammar + role/category/status taxonomy) | Current architectural/modeling guidance and governance vocabulary; runtime subset enforcement is delegated to naming slice | Architecture/modeling, Codex task context, supporting context only for tree | **Stay put** at current path | **Reference only** for tree tasks |
| `calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md` | Bounded modeling note source for report-only tree-address grammar alignment | Draft-bounded modeling guidance (not full runtime enforcement contract for tree slice) | Architecture/modeling, supporting context only, historical/deferred decision reference | **Stay put** at current path | **Reference only** |

## Reorg Recommendations (Bounded / First Move Completed)

### Canonical now (do not relocate in this pass)

- Keep suite contract in `ConventionRoutines` as validator-suite canonical_source.
- Keep tree runtime spec in `ValidatorSpecs` as tree slice canonical_source.
- Keep naming and naming-master docs in `ConventionRoutines` as cross-slice authorities consumed by tree.

### Completed bounded move (this pass)

1. `doc/nl-config/cfg-treeStructureAdvisor.md` -> `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md`
   - **Outcome:** completed as a bounded colocation move with a tiny pointer stub left at the old path to preserve navigation continuity.
   - **Authority posture:** remains supporting implementation guidance; canonical runtime authority stays with suite contract + tree validator spec.

### Split-later / merge-later posture

- No mandatory split now for `tree-structure-advisor-validator-spec.md`; keep as single canonical spec while status labels remain clear and sectioned.
- Potential **split-later** if document growth materially harms scanability:
  - runtime contract section remains in `tree-structure-advisor-validator-spec.md`,
  - bounded modeling appendices (for example deeper registry modeling) move to a dedicated supporting note under `ValidatorSpecs`.
- No merge recommended between suite contract and tree spec; ownership boundaries are intentionally separate.

## Guardrails for Future Folder Moves

1. **No behavior change via path move.** Any move must preserve canonical_source authority and reading order semantics.
2. **Move in bounded phases.** First add pointer/wrapper or backlink docs, then move content, then retire wrappers after references are updated.
3. **Preserve deterministic references.** Update all cross-links in suite/tree/naming/NL docs in the same change set as any move.
4. **Do not collapse ownership boundaries.** Suite-wide contracts remain suite-owned; tree slice behavior remains tree-spec-owned.
5. **Prefer explicit “stay put” outcomes.** If ownership is not clearly improved by relocation, keep current path.

## Maintenance Notes

- Update this inventory whenever a tree-adjacent canonical_source document is added, superseded, or repathed.
- For tree task setup, this inventory is an index and should be used before ad hoc doc discovery.
- If runtime behavior conflicts appear, defer to suite contract and tree spec canonical_source docs; treat this map as navigational metadata.
