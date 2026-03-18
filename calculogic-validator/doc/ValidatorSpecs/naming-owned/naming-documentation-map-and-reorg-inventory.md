# Naming Documentation Map and Reorg Inventory

Status/Authority:
- **Status:** Transitional inventory (bounded reorg/routing metadata, current snapshot).
- **Authority level:** Transitional inventory (non-canonical for runtime behavior/spec semantics).
- **Intended use:** Route naming-adjacent docs, clarify ownership boundaries, and record deterministic "stay put" vs later move/split/merge decisions.
- **Does not control:** Naming runtime behavior, naming taxonomy authority, suite mode/exit semantics, or config contract semantics.
- **Defer to (if conflict):**
  - `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md` (canonical contract)
  - `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md` (canonical slice spec for naming runtime/spec behavior)
  - `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md` (canonical naming grammar/taxonomy authority)
  - `calculogic-validator/doc/ValidatorSpecs/validator-config-spec.md` (canonical config contract)

## Purpose

This document provides one bounded, implementation-facing navigation map for naming-adjacent documentation.

It is intended to:

- identify the primary naming-adjacent docs used in implementation work,
- distinguish canonical authority from supporting, draft, and transitional materials,
- provide a practical reading order for naming tasks,
- record deterministic "stay put" vs "move/split/merge later" decisions,
- reduce future setup/discovery friction without broad folder reorganization in this pass.

## Canonical Reading Order (Naming Implementation Work)

Use this sequence for naming implementation tasks (runtime behavior, wiring/contracts, config interpretation, or naming semantics):

1. `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
2. `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
3. `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
4. `calculogic-validator/doc/ValidatorSpecs/filename-case-and-interpretation-contract.md`
5. `calculogic-validator/doc/ValidatorSpecs/naming-owned/naming-semantic-name-and-role-disambiguation-spec.md`
6. `calculogic-validator/doc/ValidatorSpecs/naming-owned/naming-semantic-family-and-interpretation-spec.md`
7. `calculogic-validator/doc/ValidatorSpecs/cross-cutting/registry-model-and-slice-interaction-spec.md`
8. `calculogic-validator/doc/ValidatorSpecs/validator-config-spec.md`
9. `doc/nl-config/cfg-namingValidator.md` (supporting implementation context only)
10. `calculogic-validator/doc/naming-compatibility-inventory.md` (transitional migration context)
11. `calculogic-validator/doc/ValidatorSpecs/naming-owned/naming-documentation-map-and-reorg-inventory.md` (this doc; routing/ownership metadata only)

Interpretation notes:

- Runtime/spec authority comes from the suite contract, naming slice spec, and explicit canonical contracts.
- Bounded normative supporting specs provide active interpretation/model constraints for their lane, but they do not supersede primary canonical authorities.
- Repo-local supporting implementation notes and transitional inventories provide local context/routing only; they do not redefine canonical behavior.
- This map is navigation metadata only.

## Inventory (Bounded Naming-Adjacent Set)

| Document | Document role | Status classification | Audience / usage | Path decision | Action recommendation |
|---|---|---|---|---|---|
| `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md` | Suite-wide validator contract authority | **Canonical contract** | Runtime implementation, cross-slice contract framing, task setup first read | **Stay put** | **Keep** |
| `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md` | Naming-slice runtime/spec authority | **Canonical slice spec** | Naming runtime behavior/spec implementation and validation | **Stay put** | **Keep** |
| `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md` | Naming grammar/taxonomy authority (filename grammar + role/category/status vocabulary) | **Canonical contract** (cross-slice naming authority) | Naming taxonomy/governance, classification semantics, change-control | **Stay put** | **Keep** |
| `calculogic-validator/doc/ValidatorSpecs/validator-config-spec.md` | Validator config semantics authority | **Canonical contract** (config) | Config modeling, schema/runtime strictness, merge/normalization behavior | **Stay put** | **Keep** |
| `calculogic-validator/doc/ValidatorSpecs/filename-case-and-interpretation-contract.md` | Shared filename interpretation and case-policy contract surface | **Bounded normative supporting spec** (shared contract lane; non-primary canonical authority in this map) | Cross-slice interpretation vocabulary, implementation alignment context | **Stay put** | **Reference and maintain as bounded supporting contract lane** |
| `calculogic-validator/doc/ValidatorSpecs/naming-owned/naming-semantic-name-and-role-disambiguation-spec.md` | Naming interpretation spec for semantic-name vs role disambiguation | **Bounded normative supporting spec** | Naming interpretation implementation tasks and bounded design alignment | **Moved to `naming-owned/`** for clearer naming ownership while keeping canonical authorities stable elsewhere | **Keep in `naming-owned/`; split later only if scanability degrades materially** |
| `calculogic-validator/doc/ValidatorSpecs/naming-owned/naming-semantic-family-and-interpretation-spec.md` | Naming interpretation spec for semantic-family semantics | **Bounded normative supporting spec** (active for documentation-first modeling) | Naming interpretation implementation tasks and bounded design alignment | **Moved to `naming-owned/`** for easier same-owner discovery | **Keep in `naming-owned/`; do not merge into master list authority** |
| `calculogic-validator/doc/ValidatorSpecs/cross-cutting/registry-model-and-slice-interaction-spec.md` | Naming registry model and slice interaction reference | **Bounded normative supporting spec** (suite-level model constraints) | Wiring/modeling decisions and slice-boundary context | **Moved to `cross-cutting/`** because forcing it under naming would blur suite-level ownership | **Keep in `cross-cutting/`; consider later split by concern only if document growth harms scanability** |
| `doc/nl-config/cfg-namingValidator.md` | Repo-local naming NL/config note | **Supporting implementation guidance** (repo-local/external to validator-owned canonical set) | Implementation sequencing/context for local repo tasks | **Stay put** | **Reference only** |
| `calculogic-validator/doc/naming-compatibility-inventory.md` | Naming migration/compatibility snapshot | **Transitional inventory** | Migration context, retirements, follow-up hardening routing | **Stay put** | **Keep as transitional inventory** |
| `calculogic-validator/doc/ValidatorSpecs/naming-owned/naming-documentation-map-and-reorg-inventory.md` | Naming routing and bounded reorg map | **Transitional inventory** | First-stop navigation for naming documentation and ownership decisions | **Moved to `naming-owned/`** to colocate the navigation map with the docs it routes | **Keep and maintain** |
| `calculogic-validator/doc/ConventionRoutines/CCPP.md` | Comment/provenance protocol used during naming implementation changes | **Supporting implementation guidance** | Implementation discipline, provenance/comment consistency | **Stay put** | **Reference only** |
| `calculogic-validator/doc/ConventionRoutines/CCS.md` | Concern-separation architecture conventions affecting naming changes | **Supporting implementation guidance** | Ownership boundaries and dependency-direction enforcement | **Stay put** | **Reference only** |
| `doc/ConventionRoutines/General-NL-Skeletons.md` | NL skeleton conventions for deterministic doc/code structure | **Supporting implementation guidance** | NL-first documentation and structure consistency | **Stay put** | **Reference only** |
| `doc/ConventionRoutines/NL-First-Workflow.md` | NL-first process contract | **Supporting implementation guidance** | Task sequencing and NL-first change workflow | **Stay put** | **Reference only** |

## Reorg Recommendations (Bounded)

### Stay put now (explicit)

- Keep `ValidatorSuite-Contracts-And-Modes.md` as suite-owned canonical authority in `ConventionRoutines`.
- Keep `NamingValidatorSpec.md` as naming-slice canonical runtime/spec authority in `ConventionRoutines`.
- Keep `FileNamingMasterList-V1_1.md` as canonical naming grammar/taxonomy authority in `ConventionRoutines`.
- Keep `validator-config-spec.md` at the `ValidatorSpecs` root because it is a canonical first-read config contract referenced across slices.
- Keep `filename-case-and-interpretation-contract.md` at the `ValidatorSpecs` root because it is a shared contract lane used by multiple slices and already acts as a stable first-read contract surface.
- Keep `naming-compatibility-inventory.md` outside the ownership buckets because it remains a cross-path transitional inventory rather than a validator-spec owner document.

### Completed bounded move (this pass)

- Move naming-specialized supporting specs into `ValidatorSpecs/naming-owned/` so the naming-owned lane scans cleanly without disturbing canonical contract entrypoints.
- Move `registry-model-and-slice-interaction-spec.md` into `ValidatorSpecs/cross-cutting/` because it constrains slice interaction and registry modeling across ownership boundaries rather than belonging purely to naming.
- Keep root-level canonical entrypoints stable and update routing surfaces in the same change set.

### Reference-only posture

- `doc/nl-config/cfg-namingValidator.md` remains supporting implementation guidance and should not be treated as canonical runtime/spec authority.
- General convention routines (`CCPP`, `CCS`, NL skeleton/workflow docs) remain reference-only framing for implementation discipline.

### Potential later split/reshape (only if needed)

- If `registry-model-and-slice-interaction-spec.md` grows beyond practical scanability, split into bounded sub-specs by concern while preserving existing ownership boundaries.
- If either naming interpretation spec grows significantly, allow bounded split by semantic lane (for example role disambiguation vs family interpretation) while keeping canonical authorities unchanged.

### Explicit non-merge boundaries

- Do **not** merge suite-owned contract content into naming-owned canonical slice spec.
- Do **not** merge naming-slice canonical behavior (`NamingValidatorSpec.md`) into taxonomy authority (`FileNamingMasterList-V1_1.md`); boundaries are intentionally distinct.
- Do **not** collapse transitional inventories into canonical specs.

## Guardrails for Future Naming Doc Moves

1. No behavior change via path move: relocation-only changes must not alter runtime/spec semantics.
2. Preserve canonical authority and reading order: if routing changes, retain explicit first-read sequence and conflict-defer rules.
3. Move in bounded phases: avoid broad reorgs; isolate one narrow move family per change set.
4. Update cross-links in the same change set: no dangling references after moves/renames.
5. Do not collapse suite-owned vs naming-owned boundaries.
6. Prefer explicit **stay put** unless relocation clearly improves ownership clarity.
7. Do not relabel supporting/transitional docs as canonical without explicit authority-level change and index update.

## Maintenance Notes

Update this map when any of the following occur:

- a naming-adjacent document is added/removed/renamed,
- an authority label changes (canonical/supporting/transitional/draft),
- reading order changes for implementation onboarding,
- a bounded reorg decision is executed or retired.

Runtime/spec conflicts must defer to canonical authorities listed at the top of this document, not to this map.
