# Tree Documentation Map and Reorg Inventory

Status/Authority:
- **Status:** Transitional inventory (bounded reorg/routing metadata, current snapshot).
- **Authority level:** Transitional inventory (non-canonical for runtime behavior).
- **Intended use:** Route tree-adjacent docs, clarify ownership boundaries, and record "stay put" vs bounded move decisions.
- **Does not control:** Tree runtime behavior, suite report/exit semantics, or naming/runtime contract definitions.
- **Defer to (if conflict):**
  - `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md` (suite canonical contract)
  - `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md` (tree canonical slice spec)
  - `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md` (naming canonical slice spec when naming boundaries are implicated)

## Purpose

This document provides one bounded, implementation-facing navigation map for tree-adjacent documentation.

It is intended to:

- identify what documents currently exist for the tree implementation slice,
- distinguish canonical runtime/spec authority from bounded normative supporting specs, supporting implementation guidance, draft references, and transitional metadata,
- make explicit “stay put for now” vs “move/split/merge later” decisions,
- reduce ambiguity for human maintainers and Codex task setup before any physical folder reorganization.

Guardrail for this inventory pass: keep changes bounded to the tree NL/config note colocation move plus same-change-set cross-link updates (no broad folder reorganization).

## Canonical Reading Order (Implementation Work)

Use this sequence for tree implementation tasks (runtime, wiring, contracts, or bounded architecture guidance):

1. `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
2. `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md`
3. `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
4. `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md`
5. `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md` (this doc; navigation/index metadata under `tree-owned/`)

Interpretation note:

- Runtime/spec authority comes from the suite canonical contract and the tree canonical slice spec.
- Cross-slice naming docs consumed by tree remain canonical within naming-owned scope; tree consumes them as bounded supporting authority for naming-signal boundaries, not as tree-owned runtime authority.
- NL/config note is supporting implementation guidance; draft references are bounded and non-final outside explicitly closed draft scope.
- This map is transitional inventory metadata and ownership guidance only; it does not redefine runtime/spec behavior.

## Inventory (Bounded Set)

| Document | Document role | Status classification | Audience / usage | Path decision | Action recommendation |
|---|---|---|---|---|---|
| `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md` | Suite contract (shared validator vocabulary/modes/scope boundary) | **Canonical contract** | Runtime implementation, architecture/modeling, Codex task context | **Stay put** at current path | **Keep** |
| `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md` | Tree slice runtime/spec authority with bounded modeling notes | **Canonical slice spec** | Runtime implementation, architecture/modeling, Codex task context | **Stay put** at current path (already under `ValidatorSpecs`, implementation-facing) | **Keep** |
| `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md` | Naming slice runtime/spec authority consumed by tree for naming-signal boundary interpretation | **Canonical slice spec** (cross-slice supporting authority for tree tasks) | Runtime implementation, architecture/modeling, Codex task context, supporting context only for tree | **Stay put** at current path | **Reference only** for tree tasks |
| `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md` | Tree NL/config implementation note | **Supporting implementation guidance** | Runtime implementation, Codex task context, historical/reference context for implementation sequencing | **Now colocated** under `ValidatorSpecs/nl-config` with pointer stub retained at the prior repo-root NL path | **Keep** (validator-owned supporting implementation guidance) |
| `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md` | Naming grammar/taxonomy authority consumed by tree for filename/role vocabulary boundaries | **Canonical contract** (cross-slice naming authority) | Architecture/modeling, Codex task context, supporting context only for tree | **Stay put** at current path | **Reference only** for tree tasks |
| `calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md` | Bounded draft reference for report-only tree-address grammar alignment | **Draft** (bounded modeling guidance) | Architecture/modeling, supporting context only, historical/deferred decision reference | **Stay put** at current path | **Reference only** |

## Reorg Recommendations (Bounded / First Move Completed)

### Canonical now (do not relocate in this pass)

- Keep suite contract in `ConventionRoutines` as validator-suite canonical authority.
- Keep tree runtime spec in `ValidatorSpecs` as tree slice canonical authority.
- Keep naming and naming-master docs in `ConventionRoutines` as cross-slice authorities consumed by tree.

### Completed bounded move (this pass)

1. `doc/nl-config/cfg-treeStructureAdvisor.md` -> `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md`
   - **Outcome:** completed earlier as a bounded colocation move with a tiny pointer stub left at the old path to preserve navigation continuity.
   - **Authority posture:** remains supporting implementation guidance; canonical runtime authority stays with suite contract + tree validator spec.
2. Tree-owned supporting specs and inventories now live under `calculogic-validator/doc/ValidatorSpecs/tree-owned/`:
   - `tree-documentation-map-and-reorg-inventory.md`
   - `tree-occurrence-model-and-addressing-spec.md`
   - `tree-registry-definitions-and-relationships-spec.md`
   - `tree-structural-vocabulary-and-root-classification-spec.md`
   - `tree-top-root-registry-transition-inventory.md`
   - **Outcome:** tree-specific supporting material is easier to scan without moving the canonical tree slice spec or the path-sensitive NL/config note.

### Split-later / merge-later posture

- No mandatory split now for `tree-structure-advisor-validator-spec.md`; keep as single canonical spec while status labels remain clear and sectioned.
- Potential **split-later** if document growth materially harms scanability:
  - runtime contract section remains in `tree-structure-advisor-validator-spec.md`,
  - bounded modeling appendices (for example deeper registry modeling) move to a dedicated supporting note under `ValidatorSpecs`.
- No merge recommended between suite contract and tree spec; ownership boundaries are intentionally separate.

## Guardrails for Future Folder Moves

1. **No behavior change via path move.** Any move must preserve canonical authority and reading order semantics.
2. **Move in bounded phases.** First add pointer/wrapper or backlink docs, then move content, then retire wrappers after references are updated.
3. **Preserve deterministic references.** Update all cross-links in suite/tree/naming/NL docs in the same change set as any move.
4. **Do not collapse ownership boundaries.** Suite-wide contracts remain suite-owned; tree slice behavior remains tree-spec-owned.
5. **Prefer explicit “stay put” outcomes.** If ownership is not clearly improved by relocation, keep current path.

## Maintenance Notes

- Update this inventory whenever a tree-adjacent canonical authority document is added, superseded, or repathed.
- For tree task setup, this inventory is an index and should be used before ad hoc doc discovery.
- If runtime behavior conflicts appear, defer to suite contract and tree spec canonical authority docs; treat this map as navigational metadata.
