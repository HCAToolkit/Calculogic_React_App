# Validator missing-role decision lanes audit

## 1. Purpose

This audit is a bounded modeling pass for the remaining `NAMING_MISSING_ROLE` findings inside validator scope after the prior documentation-role canonicalization tranche.

The goal is to separate three different situations so the next rename tranche is ownership-first instead of report-noise-first:

1. files ready to rename using an existing active role,
2. files that still need ownership clarification before a rename would be honest, and
3. files whose responsibility is clear but that still expose role-vocabulary pressure.

## 2. Inputs and decision posture

Inventory source for this pass:

- `npm run validate:naming -- --scope=validator` on 2026-03-20
- current validator-owned conventions/specs, especially `FileNamingMasterList-V1_1.md`, `NamingValidatorSpec.md`, and the validator documentation maps/indexes

Decision posture used in every row:

- classify by actual ownership/responsibility, not by cosmetic filename cleanup,
- prefer current active roles when the fit is honest,
- do not force misleading roles to reduce detector counts,
- call out genuine taxonomy pressure explicitly instead of hiding it.

## 3. Bucket 1 — Rename now using existing role

These files have a clear current responsibility and an existing active role already fits honestly.

| Candidate file | Actual ownership / responsibility | Recommended role | Why this fits now |
|---|---|---|---|
| `calculogic-validator/bin/calculogic-validate-naming.mjs` | Public naming CLI entry surface that resolves repo root, builds usage text, and delegates to naming CLI runtime | `host` | Thin executable surface / public entry boundary; the owned logic already lives elsewhere. |
| `calculogic-validator/bin/calculogic-validate.mjs` | Public suite runner CLI entry surface for registered validators | `host` | Entry-surface composition is clear and stable. |
| `calculogic-validator/bin/calculogic-validator-health.mjs` | Public health-check entrypoint that hands off to the health host | `host` | It is a host surface, not the health logic itself. |
| `calculogic-validator/scripts/generate-validator-report-examples.mjs` | Script host that orchestrates validator report example generation | `host` | Executable orchestration surface rather than reusable inner logic. |
| `calculogic-validator/scripts/report-capture-summarize.mjs` | Standalone report-capture summarizer CLI surface | `host` | Public tool entry surface is the dominant responsibility. |
| `calculogic-validator/scripts/report-capture-verify.mjs` | Standalone report-capture verification CLI surface | `host` | Same host-surface reasoning as the other script entrypoints. |
| `calculogic-validator/scripts/validate-all.mjs` | npm-facing suite validator entry surface | `host` | Clear public runner surface. |
| `calculogic-validator/scripts/validate-naming.mjs` | npm-facing naming validator entry surface | `host` | Clear public runner surface. |
| `calculogic-validator/scripts/validate-tree.mjs` | npm-facing tree validator entry surface | `host` | Clear public runner surface. |
| `calculogic-validator/doc/Audits/naming-slice-boundary-correction.md` | Point-in-time reconciliation record of the naming slice ownership move | `audit` | Snapshot verification / correction record. |
| `calculogic-validator/doc/Audits/tree-slice-boundary-correction.md` | Point-in-time reconciliation record of the tree slice ownership move | `audit` | Snapshot verification / correction record. |
| `calculogic-validator/doc/Audits/validator-shim-cleanup-pass-1.md` | Completed pass record for shim cleanup pass 1 | `audit` | Completed-state cleanup record, not future planning. |
| `calculogic-validator/doc/Audits/validator-shim-cleanup-pass-2.md` | Completed pass record for shim cleanup pass 2 | `audit` | Completed-state cleanup record, not future planning. |
| `calculogic-validator/doc/Audits/validator-shim-cleanup-pass-3-final-removal.md` | Completed pass record for shim cleanup pass 3 final removal | `audit` | Completed-state cleanup record, not future planning. |
| `calculogic-validator/doc/ConventionRoutines/CCPP.md` | Repo-wide contributor convention/protocol for comments and provenance | `policy` | Governs contributor behavior and convention compliance. |
| `calculogic-validator/doc/ConventionRoutines/CCS.md` | Repo-wide architectural convention for concern separation and purity | `policy` | Governs contributor-facing concern boundaries. |
| `calculogic-validator/doc/ConventionRoutines/CSCS.md` | Repo-wide concern separation / coupling convention | `policy` | Behavior-governing convention rather than a one-off snapshot. |
| `calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md` | Draft structural-addressing contract/specification | `spec` | The dominant responsibility is specification, even though draft status remains in the semantic name. |
| `calculogic-validator/doc/ConventionRoutines/DocumentContentClassificationConvention-V1.md` | Contributor-facing rule set for document content classification | `policy` | Normative convention / governance guidance. |
| `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md` | Canonical naming grammar and taxonomy authority | `spec` | Primary naming contract/spec authority. |
| `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md` | Canonical naming-slice runtime/spec behavior document | `spec` | Explicit slice-spec authority. |
| `calculogic-validator/doc/ConventionRoutines/TerminologyScoping-Conventions-V1.md` | Contributor-facing terminology-scoping convention | `policy` | Normative usage guidance rather than implementation planning. |
| `calculogic-validator/doc/ConventionRoutines/ValidatorHelperAreas-And-Reuse-Conventions.md` | Canonical reuse-routing convention for validator helper ownership | `policy` | Normative helper routing rules for contributors. |
| `calculogic-validator/doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md` | Canonical ownership contract for loader/converter/runtime boundaries | `spec` | Bounded contract/spec semantics dominate. |
| `calculogic-validator/doc/ConventionRoutines/ValidatorReportSchema-V0_1.md` | Canonical current validator report-shape contract | `spec` | Schema/contract authority. |
| `calculogic-validator/doc/ConventionRoutines/ValidatorRuleIds-Contract.md` | Canonical rule-id contract for validator findings | `spec` | Stable contract document. |
| `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md` | Canonical suite-level validator runtime contract | `spec` | Canonical suite contract document. |
| `calculogic-validator/doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md` | Canonical current shared-capability contract/inventory for suite reuse | `spec` | The doc is normative and contract-like enough that `spec` is honest without waiting for a new inventory role. |
| `calculogic-validator/doc/ValidatorSpecs/filename-case-and-interpretation-contract.md` | Shared filename interpretation contract used across slices | `spec` | Bounded contract document. |
| `calculogic-validator/doc/ValidatorSpecs/suite-owned/registry-customization-state-system-draft.md` | Forward-looking proposal for registry customization state handling | `plan` | The dominant responsibility is planned future work, not current runtime authority. |

## 4. Bucket 2 — Needs ownership clarification first

These files are still mixed enough that renaming now would risk encoding the wrong responsibility into the filename.

| Candidate file | Why ownership is still ambiguous | Why not rename yet |
|---|---|---|
| `calculogic-validator/doc/Audits/validator-shim-cleanup-design-checkpoint.md` | The document mixes checkpoint analysis, compatibility-policy choice, and pre-pass-3 readiness framing. It is partly historical assessment and partly decision memo for future action. | Renaming it now to either `*.audit.md` or `*.plan.md` would prematurely collapse that mixed responsibility into one lane. Clarify whether it should remain a retrospective checkpoint record or be reframed as a planning/decision artifact first. |
| `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-top-root-registry-transition-inventory.md` | The document self-identifies as both transition inventory and contract. Its current content mixes migration inventory with bounded normative modeling. | Renaming directly to `*.spec.md` would bury the transition/inventory identity; renaming toward a future inventory/index lane would bury the contract content. Split or tighten ownership first. |

## 5. Bucket 3 — Suggests later role-vocabulary discussion

These files have clear current responsibility, but the current active role vocabulary does not express that responsibility honestly enough.

| Candidate file | Actual ownership / responsibility | Why existing active roles would distort it |
|---|---|---|
| `calculogic-validator/src/index.mjs` | Package/root export barrel for validator public exports | `host`, `wiring`, and `contracts` all miss the dominant barrel/export-surface identity. This looks more like a reserved barrel/special-case or a later explicit surface role discussion than a forced rename target. |
| `calculogic-validator/naming/src/registries/registry-state.json` | Tiny runtime state snapshot selecting active registry source | Active roles do not honestly express state-snapshot/config-state ownership. Forcing `contracts` or `knowledge` would blur mutable runtime-state semantics. |
| `calculogic-validator/doc/Indexes/ValidatorDocsIndex.md` | Pure validator documentation routing/index surface | Current active roles do not honestly capture index/navigation ownership. This is direct evidence for the later `index` / inventory-family discussion already foreshadowed in the master list. |
| `calculogic-validator/doc/naming-compatibility-inventory.md` | Transitional compatibility inventory / migration tracking note | `plan`, `audit`, and `spec` all distort the inventory-tracking responsibility. |
| `calculogic-validator/doc/ConventionRoutines/NamingInterpretationHardening-TransitionalInventory.md` | Transitional hardening inventory for implementation mapping | Same inventory-role pressure; not honestly a spec/policy/workflow. |
| `calculogic-validator/doc/ValidatorSpecs/naming-owned/naming-documentation-map-and-reorg-inventory.md` | Naming routing map plus bounded reorg inventory metadata | Current active roles do not express map/inventory navigation ownership. |
| `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md` | Tree routing map plus bounded reorg inventory metadata | Same map/inventory vocabulary pressure. |
| `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md` | Validator-owned NL/config implementation note | The active roles do not honestly capture “NL/config note” semantics; forcing `spec`, `workflow`, or `plan` would flatten an implementation-note lane into the wrong authority level. |

## 6. Candidate files reviewed

This pass reviewed every current validator-scope `NAMING_MISSING_ROLE` finding from the 2026-03-20 report run:

1. `calculogic-validator/bin/calculogic-validate-naming.mjs`
2. `calculogic-validator/bin/calculogic-validate.mjs`
3. `calculogic-validator/bin/calculogic-validator-health.mjs`
4. `calculogic-validator/doc/Audits/naming-slice-boundary-correction.md`
5. `calculogic-validator/doc/Audits/tree-slice-boundary-correction.md`
6. `calculogic-validator/doc/Audits/validator-shim-cleanup-design-checkpoint.md`
7. `calculogic-validator/doc/Audits/validator-shim-cleanup-pass-1.md`
8. `calculogic-validator/doc/Audits/validator-shim-cleanup-pass-2.md`
9. `calculogic-validator/doc/Audits/validator-shim-cleanup-pass-3-final-removal.md`
10. `calculogic-validator/doc/ConventionRoutines/CCPP.md`
11. `calculogic-validator/doc/ConventionRoutines/CCS.md`
12. `calculogic-validator/doc/ConventionRoutines/CSCS.md`
13. `calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md`
14. `calculogic-validator/doc/ConventionRoutines/DocumentContentClassificationConvention-V1.md`
15. `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
16. `calculogic-validator/doc/ConventionRoutines/NamingInterpretationHardening-TransitionalInventory.md`
17. `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
18. `calculogic-validator/doc/ConventionRoutines/TerminologyScoping-Conventions-V1.md`
19. `calculogic-validator/doc/ConventionRoutines/ValidatorHelperAreas-And-Reuse-Conventions.md`
20. `calculogic-validator/doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md`
21. `calculogic-validator/doc/ConventionRoutines/ValidatorReportSchema-V0_1.md`
22. `calculogic-validator/doc/ConventionRoutines/ValidatorRuleIds-Contract.md`
23. `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
24. `calculogic-validator/doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md`
25. `calculogic-validator/doc/Indexes/ValidatorDocsIndex.md`
26. `calculogic-validator/doc/naming-compatibility-inventory.md`
27. `calculogic-validator/doc/ValidatorSpecs/filename-case-and-interpretation-contract.md`
28. `calculogic-validator/doc/ValidatorSpecs/naming-owned/naming-documentation-map-and-reorg-inventory.md`
29. `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md`
30. `calculogic-validator/doc/ValidatorSpecs/suite-owned/registry-customization-state-system-draft.md`
31. `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md`
32. `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-top-root-registry-transition-inventory.md`
33. `calculogic-validator/naming/src/registries/registry-state.json`
34. `calculogic-validator/scripts/generate-validator-report-examples.mjs`
35. `calculogic-validator/scripts/report-capture-summarize.mjs`
36. `calculogic-validator/scripts/report-capture-verify.mjs`
37. `calculogic-validator/scripts/validate-all.mjs`
38. `calculogic-validator/scripts/validate-naming.mjs`
39. `calculogic-validator/scripts/validate-tree.mjs`
40. `calculogic-validator/src/index.mjs`

## 7. Highest-ROI subset for the next rename tranche

The best next bounded tranche is the files from Bucket 1 that are both high-volume and low-ambiguity:

### 7.1 First priority — executable entry surfaces

Rename the validator entry surfaces to `*.host.*` first:

- all three `calculogic-validator/bin/*` missing-role files,
- all six missing-role files in `calculogic-validator/scripts/`.

Why this is highest ROI:

- responsibility is unusually clear,
- rename blast radius is bounded and mechanically traceable,
- it removes a concentrated cluster of validator runtime/support noise without taxonomy expansion.

### 7.2 Second priority — clear canonical contract docs

After the executable surfaces, target the unambiguous convention/contract docs that already map cleanly to `spec` or `policy`:

- `CCPP`, `CCS`, `CSCS`, `DocumentContentClassificationConvention-V1`, `TerminologyScoping-Conventions-V1`, `ValidatorHelperAreas-And-Reuse-Conventions`
- `FileNamingMasterList-V1_1`, `NamingValidatorSpec`, `ValidatorLoaderConverterRuntimeOwnership-Contract`, `ValidatorReportSchema-V0_1`, `ValidatorRuleIds-Contract`, `ValidatorSuite-Contracts-And-Modes`, `filename-case-and-interpretation-contract`

Why this is the right second wave:

- ownership is already explicit in the docs themselves,
- active documentation roles are sufficient,
- the tranche avoids papering over the genuine inventory/index/state vocabulary pressure cases.

### 7.3 Leave out of the rename tranche for now

Do **not** include these in the next rename tranche until the appropriate prerequisite work happens:

- Bucket 2 mixed-ownership documents,
- Bucket 3 inventory/index/NL-config-note/state/barrel files.

Those files should either be clarified/split first or saved for a later vocabulary discussion so the repo does not encode dishonest role claims just to lower finding counts.
