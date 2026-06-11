# Validator Slice Formula Alignment Audit

## Scope

This audit uses `calculogic-validator/doc/ConventionRoutines/ValidatorSliceAndReportFormula.md` as the rubric for Naming, Tree, and Structural Addressing / Addressing alignment with the validator slice and report formula.

This is an audit/planning slice, not an implementation slice. It records current runtime truth, current implementation reality, merged docs/spec truth, historical context, and future/planning-only intent without changing runtime behavior, report shape, report ids/descriptions, findings, summaries, severities, exit-code behavior, package scripts, package bins, registry loaders, Naming behavior, Tree behavior, Addressing behavior, or candidate behavior.

Provenance: this audit follows the validator slice/report formula introduced after the completed formula-doc slice and uses current repo reality as primary evidence.

## Evidence reviewed

### Runtime and suite-core evidence

- `calculogic-validator/doc/ConventionRoutines/ValidatorSliceAndReportFormula.md`
- `calculogic-validator/doc/Indexes/validator-docs.index.md`
- `calculogic-validator/src/core/validator-registry.knowledge.mjs`
- `calculogic-validator/src/core/validator-runner.logic.mjs`
- `calculogic-validator/src/core/validator-report.contracts.mjs`
- `calculogic-validator/src/core/validator-report-meta.logic.mjs`
- `calculogic-validator/src/core/validator-exit-code.logic.mjs`
- `calculogic-validator/src/core/validator-scopes.logic.mjs`
- `calculogic-validator/src/core/scoped-target-paths.logic.mjs`
- `calculogic-validator/src/core/suite-scoped-snapshot-input.logic.mjs`
- `calculogic-validator/src/core/validator-candidate-policy.contracts.mjs`
- `calculogic-validator/src/core/validator-candidate-policy.logic.mjs`
- `calculogic-validator/src/core/validator-candidate-collection.logic.mjs`
- `calculogic-validator/doc/Audits/validator-repeatable-slice-infrastructure.audit.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md`

### Naming evidence

- `calculogic-validator/naming/src/**`
- `calculogic-validator/naming/test/**`
- `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`

### Tree evidence

- `calculogic-validator/tree/src/**`
- `calculogic-validator/tree/test/**`
- `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md` as navigation/discovery only
- `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md` as current tree-slice runtime/spec authority
- `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md`

### Structural Addressing / Addressing evidence

- `calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md`
- `calculogic-validator/scripts/addressing-get-tree.host.mjs`
- `calculogic-validator/structural-addressing/src/**`
- `calculogic-validator/structural-addressing/test/**`
- `calculogic-validator/tree/src/tree-structural-address-snapshot.logic.mjs`
- Tree evidence modules that consume addressed occurrence records.

### Supporting convention evidence

- `calculogic-validator/doc/ConventionRoutines/CCPP.md`
- `calculogic-validator/doc/ConventionRoutines/CCS.md`
- `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
- `doc/ConventionRoutines/General-NL-Skeletons.md`
- `doc/ConventionRoutines/NL-First-Workflow.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorHelperAreas-And-Reuse-Conventions.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md`
- `calculogic-validator/doc/ConventionRoutines/DocumentContentClassificationConvention-V1.md`
- `calculogic-validator/doc/ConventionRoutines/TerminologyScoping-Conventions-V1.md`
- `README.md`
- `calculogic-validator/README.md`

## Classification legend

- `aligned`: follows the formula with no material gap for the audited scope.
- `partially aligned`: follows the formula in some areas but has bounded gaps.
- `intentionally different`: differs for a documented ownership, compatibility, or staged implementation reason.
- `under-hardened`: should follow the formula but lacks metadata, tests, docs, or explicit contracts.
- `deferred`: gap is real but fixing it belongs to a later scoped issue.

## Executive summary

Naming and Tree are mostly aligned with the formula for runnable validator slices. The strongest current alignment is that both are runner-visible, registered, report-wrapped by suite-core in `validate:all`, command/report-capture documented in metadata, tested for registry metadata shape, and bounded by slice-owned interpretation rules.

The material gaps are not generic cleanup gaps. They are narrow ROI gaps around explicit bridge hardening, suite-core metadata consumption, and Addressing classification boundaries:

1. Naming is `partially aligned` overall because its slice identity, runner/report visibility, command metadata, candidate helper use, value authority, report shape, and bridge-provider behavior are strong, but registry metadata is not yet the single consumed source for all command/report literals and bridge ambiguity/confidence limitations remain mostly in bridge output/tests rather than in a named contract location.
2. Tree is `partially aligned` overall because its slice identity, runner/report visibility, command metadata, suite-core scoped input use, Tree-owned placement interpretation, and Naming bridge consumption are strong, but Tree still carries some local structural-address snapshot mechanics and Tree bridge tests focus on Naming bridge behavior more than a complete provider/consumer contract matrix.
3. Structural Addressing / Addressing is `intentionally different` and `under-hardened` overall: current repo reality supports the classification "hybrid shared validator layer plus bridge provider" for now. It is not pure suite-core, not purely Tree-owned, and not yet a standalone runnable validator slice. Its current runtime value is deterministic addressed evidence, profile/marker strategy logic, a bounded `addressing:get-tree` host, and Tree-local addressed snapshot consumption; it does not own Tree placement reasoning, Naming semantic-family interpretation, final validation findings, final severity, or platform engine internals.

No immediate recommendation should change runtime behavior. The next child issue should be a bounded docs/test/metadata follow-up that hardens bridge-contract documentation and tests for Naming -> Tree and Addressing -> Tree without changing reports, commands, bins, or validator findings.

## Naming alignment

### Formula-area classification

| Formula area | Classification | Current repo evidence | Answers to required audit questions |
| --- | --- | --- | --- |
| 1. Slice Integration Formula | aligned | Naming has registry id `naming`, report metadata, command metadata, package-bin availability, runner inclusion, bridge metadata, report-capture metadata, and compatibility metadata. | Does it follow the formula? Yes. Is the difference intentional? No material difference. Worth fixing now? No. Deferred? No. Runtime behavior changes required? No. |
| 2. Suite-Core Usage Formula | partially aligned | Naming consumes suite-core scope lookup, path normalization, candidate policy creation, and candidate collection. Suite-core runner wraps the Naming result in all-runner reports. Naming direct CLI still has a slice-owned report builder for single-slice output, which is current runtime truth. | Does it follow the formula? Mostly. Is the difference intentional? Yes, for compatibility and direct runnable behavior. Worth fixing now? Only docs/test clarification if needed. Deferred? Any migration to consume registry metadata more broadly is deferred. Runtime behavior changes required? Likely yes for broad migration; not this issue. |
| 3. Slice-Owned Interpretation Formula | aligned | Naming owns filename parsing, semantic-name interpretation, semantic-family derivation, role/category/status/special-case/finding-policy registries, reportable extension/root-file value authority, and summary bucket meaning. | Does it follow the formula? Yes. Is the difference intentional? No material difference. Worth fixing now? No. Deferred? No. Runtime behavior changes required? No. |
| 4. Report Behavior Formula | partially aligned | Runner-visible Naming returns the common base result shape through the registry hook and includes `scope`, `totalFilesScanned`, `findings`, `summary`, and optional `meta.registry` / `meta.filters`. Direct Naming reports also include registry metadata through the slice CLI/report path. Registry report metadata exists, but not all report identity literals are consumed from registry metadata at every call site. | Does it follow the formula? Mostly. Is the difference intentional? Yes, behavior-preserving compatibility. Worth fixing now? Not unless limited to docs/tests. Deferred? Registry-driven report literal migration is deferred. Runtime behavior changes required? Possibly, so not this issue. |
| 5. Bridge / Cross-Slice Consumption Formula | partially aligned | Naming provides `naming-semantic-family-bridge`; the runner stages the Naming result before Tree and passes `projectNamingSemanticFamilyBridge(...)` into Tree. Tests assert registry bridge metadata and that Tree does not derive semantic-family when Naming-owned fields are absent. | Does it follow the formula? Mostly. Is the difference intentional? Yes, Naming is a provider and Tree is the consumer. Worth fixing now? Yes only as bounded contract docs/tests. Deferred? Runtime orchestration changes are deferred. Runtime behavior changes required? No for docs/tests; yes for runtime handoff redesign. |
| 6. Evidence vs Policy Formula | aligned | Naming bridge observations are evidence for consumers; Naming registries remain policy/value authority, and runtime normalized registry views are exposed as metadata without becoming competing policy truth. | Does it follow the formula? Yes. Is the difference intentional? No material difference. Worth fixing now? No. Deferred? No. Runtime behavior changes required? No. |
| 7. Registry / Metadata Formula | partially aligned | Naming registry metadata answers integration questions and avoids semantic policy. Metadata is tested as data-only, serializable, and compatible with package/bin and script surfaces. The remaining gap is that metadata is not yet broadly consumed by command/report code. | Does it follow the formula? Mostly. Is the difference intentional? Yes, staged implementation path. Worth fixing now? Small docs/tests only. Deferred? Code migration is deferred. Runtime behavior changes required? Potentially. |
| 8. Command / Docs / Test Formula | partially aligned | Naming has npm commands, direct script, package bin, report-capture commands, canonical/supporting docs, index coverage, registry metadata tests, runtime tests, report metadata tests, candidate/scope tests, and bridge tests. The formula-specific audit gap is primarily explicit bridge ambiguity/confidence contract placement. | Does it follow the formula? Mostly. Is the difference intentional? Mostly. Worth fixing now? Yes as a bounded docs/test issue. Deferred? Broader command/report migration is deferred. Runtime behavior changes required? No for docs/tests. |

### Naming audit notes

Current runtime truth: Naming should remain owner of filename parsing, semantic-name/family interpretation, Naming registries, finding policy, and summary meaning. That ownership is preserved by current code and tests. Naming consumes suite-core mechanics where applicable, especially scope/target/candidate mechanics, but direct single-slice report generation remains slice-owned for compatibility.

Merged docs/spec truth: the formula expects registry metadata for repeatable integration questions and suite-core ownership of report wrapping mechanics. Naming satisfies the data declaration part and partially satisfies the consumption part.

Historical formula-doc context: the completed formula-doc slice provided the formula as a rubric, not a mandate to migrate runtime behavior in this audit slice.

Future/planning-only intent: registry-driven command/report literal consumption may be useful later, but it should be scoped as an implementation child because it can affect runtime and report behavior.

## Tree alignment

### Formula-area classification

| Formula area | Classification | Current repo evidence | Answers to required audit questions |
| --- | --- | --- | --- |
| 1. Slice Integration Formula | aligned | Tree has registry id `tree-structure-advisor`, report metadata, command metadata, package-bin expectation with unavailable status, runner inclusion, consumes bridge metadata, report-capture metadata, and compatibility metadata. | Does it follow the formula? Yes. Is the difference intentional? No material difference; missing package bin is explicitly represented. Worth fixing now? No. Deferred? Package-bin changes are deferred. Runtime behavior changes required? No for audit; yes for bin work. |
| 2. Suite-Core Usage Formula | partially aligned | Tree wiring consumes suite-core scoped snapshot inputs with Tree-owned walk exclusions and targets, then prepares occurrence snapshots and evidence. Runner-visible reports are suite-wrapped and exit-code derivation is suite-owned. Tree local structural-address snapshot mechanics are current implementation reality rather than shared Addressing consumption. | Does it follow the formula? Mostly. Is the difference intentional? Yes, staged implementation path. Worth fixing now? No runtime change now. Deferred? Addressing consumption migration is deferred. Runtime behavior changes required? Yes for migration. |
| 3. Slice-Owned Interpretation Formula | aligned | Tree owns folder-kind evidence, structural-home evidence, semantic-home evidence, placement/coherence interpretation, occurrence classification, Tree registries, and Tree finding policy. It consumes Naming bridge evidence without moving Naming interpretation into Tree. | Does it follow the formula? Yes. Is the difference intentional? No material difference. Worth fixing now? No. Deferred? No. Runtime behavior changes required? No. |
| 4. Report Behavior Formula | partially aligned | Tree returns the common base result shape through the registry hook and runner wrapper. Tree owns summary meaning through its summarizer. Report identity metadata exists, but report entry identity is still wired through current runner/registry hook mechanics rather than all literals being generated from metadata. | Does it follow the formula? Mostly. Is the difference intentional? Yes, compatibility. Worth fixing now? Not for runtime. Deferred? Registry-driven report literal migration is deferred. Runtime behavior changes required? Potentially. |
| 5. Bridge / Cross-Slice Consumption Formula | partially aligned | Tree consumes the Naming semantic-family bridge through runner-staged input and tests prove it does not silently re-derive Naming-owned semantic-family when bridge fields are absent. Addressing bridge consumption is future/planning-only intent; current Tree structural-address snapshot logic is local. | Does it follow the formula? Mostly for Naming bridge; partially for Addressing direction. Is the difference intentional? Yes. Worth fixing now? Yes only for docs/test bridge-contract hardening. Deferred? Addressing runtime bridge migration is deferred. Runtime behavior changes required? No for docs/tests; yes for migration. |
| 6. Evidence vs Policy Formula | aligned | Tree evidence modules use addressed occurrence records, structural-home registries, folder-kind registries, repo-shape policy, and Naming semantic evidence as inputs while keeping final Tree interpretation in Tree-owned logic. | Does it follow the formula? Yes. Is the difference intentional? No material difference. Worth fixing now? No. Deferred? No. Runtime behavior changes required? No. |
| 7. Registry / Metadata Formula | partially aligned | Tree metadata declares command/report/runner/bridge/package-bin compatibility status and avoids embedding Tree policy. The remaining gap is the same suite-wide registry consumption gap: metadata records integration facts but runner/CLI code still owns some literals and orchestration logic. | Does it follow the formula? Mostly. Is the difference intentional? Yes, behavior-preserving metadata-first staging. Worth fixing now? Small docs/tests only. Deferred? Code migration is deferred. Runtime behavior changes required? Potentially. |
| 8. Command / Docs / Test Formula | partially aligned | Tree has npm commands, a direct script, report-capture commands, docs/spec authority, index coverage, registry metadata tests, runtime tests, report tests, scope/target integration tests, and bridge tests. Missing package bin is explicit. Addressing bridge tests are not yet a complete cross-slice contract because Addressing is not currently a runnable validator slice. | Does it follow the formula? Mostly. Is the difference intentional? Yes. Worth fixing now? Bounded docs/test hardening only. Deferred? Package-bin and Addressing runtime extraction are deferred. Runtime behavior changes required? No for docs/tests. |

### Tree audit notes

Current runtime truth: Tree owns placement interpretation. It may consume Naming semantic-family bridge output and currently does so through the runner-staged bridge. Tree should not silently re-derive Naming-owned meaning when bridge data is available; current tests explicitly protect the absent-field case.

Current implementation reality: Tree also prepares a local structural-address snapshot from occurrence records and uses addressed occurrence records as evidence input for structural-home, semantic-home, folder-kind, and occurrence-classification logic.

Merged docs/spec truth: the formula says Addressing should later provide addressed snapshots through an explicit provider/bridge boundary and Tree should keep placement interpretation.

Future/planning-only intent: Tree should later consume Addressing evidence without giving Addressing ownership of placement interpretation. That migration should not occur in this audit slice.

## Structural Addressing / Addressing alignment

### Current classification

Structural Addressing / Addressing is classified for now as: **hybrid shared validator layer plus bridge provider**.

It is:

- **not pure suite-core** because it owns address grammar/profile/marker/domain-adapter semantics rather than repo-agnostic runner mechanics.
- **not purely Tree-owned** because `calculogic-validator/structural-addressing/src/**` already owns standalone structural-addressing profile, marker strategy, tree-codebase addressed snapshot, and render-tree logic, and `calculogic-validator/scripts/addressing-get-tree.host.mjs` exposes a bounded Addressing-oriented host.
- **not yet a standalone runnable validator slice** because it is not registered in `VALIDATOR_REGISTRY`, is not runner-visible, does not produce validator findings/summaries/severities, has no package bin, and its current host is a bounded get-tree/addressed-snapshot command rather than a validator report producer.

Current repo reality supports this classification. It does not conflict with it.

### What Addressing should own

Addressing should own:

- shared address grammar;
- address profiles;
- marker strategies;
- addressed snapshot contracts;
- domain adapters;
- bridge outputs;
- pre-reasoning structural evidence.

### What Addressing should not own

Addressing should not own:

- Tree placement reasoning;
- Naming semantic-family interpretation;
- final validation findings;
- final severity;
- platform engine internals.

### Formula-area classification

| Formula area | Classification | Current repo evidence | Answers to required audit questions |
| --- | --- | --- | --- |
| 1. Slice Integration Formula | intentionally different | Addressing has profile/output ids and an `addressing:get-tree` command, but no validator registry entry, runner inclusion, runner report identity, package bin, or validator report-capture profile. This is appropriate because it is not yet a standalone runnable validator slice. | Does it follow the formula? It intentionally omits runnable-slice fields. Is the difference intentional? Yes. Worth fixing now? Only docs/test classification hardening. Deferred? Validator slice registration is deferred. Runtime behavior changes required? Yes for runnable-slice work. |
| 2. Suite-Core Usage Formula | intentionally different | Addressing has its own grammar/profile/marker/snapshot mechanics. The get-tree host has scoped target handling specific to `--scope=validator`; Tree separately uses suite-core scoped snapshot mechanics before local structural-address preparation. | Does it follow the formula? Not as a pure validator slice, intentionally. Is the difference intentional? Yes. Worth fixing now? No runtime work. Deferred? Suite-core integration questions belong to later extraction/bridge work. Runtime behavior changes required? Yes. |
| 3. Slice-Owned Interpretation Formula | partially aligned | Addressing-owned interpretation is bounded to address/profile/marker/snapshot semantics. The formula direction is preserved because Tree keeps placement interpretation and Naming keeps semantic-family interpretation. However, Tree currently has local structural-address snapshot logic, so ownership is split across Tree and `structural-addressing` during the staged implementation path. | Does it follow the formula? Partially. Is the difference intentional? Yes, staged implementation path. Worth fixing now? Docs/test only. Deferred? Runtime unification/extraction is deferred. Runtime behavior changes required? Yes. |
| 4. Report Behavior Formula | intentionally different | Addressing does not currently produce validator findings, summaries, severities, counts, or runner-visible report entries. The get-tree host can emit text/json/both addressed snapshots, but that is not validator report behavior. | Does it follow the formula? Not applicable as a validator report slice. Is the difference intentional? Yes. Worth fixing now? No. Deferred? Standalone validator report behavior is deferred until it has independent report value. Runtime behavior changes required? Yes. |
| 5. Bridge / Cross-Slice Consumption Formula | under-hardened | Addressing profile metadata declares `addressedTreeSnapshot` and primary consumer `tree`; the tree-codebase logic emits `snapshotOutputId`; Tree evidence functions consume addressed occurrence records. But there is not yet a complete runner-visible provider/consumer registry metadata contract or end-to-end bridge handoff between `structural-addressing` and Tree. | Does it follow the formula? Partially. Is the difference intentional? Yes for staging, but under-hardened for bridge-contract proof. Worth fixing now? Yes as bounded docs/tests only. Deferred? Runtime handoff is deferred. Runtime behavior changes required? No for docs/tests; yes for handoff. |
| 6. Evidence vs Policy Formula | aligned | Addressing currently produces deterministic addressed evidence and renderable snapshots; Tree evidence/interpretation modules consume addressed occurrence records without giving Addressing final placement policy. | Does it follow the formula? Yes. Is the difference intentional? Yes. Worth fixing now? No. Deferred? No. Runtime behavior changes required? No. |
| 7. Registry / Metadata Formula | deferred | Addressing integration metadata exists in profile knowledge, not `VALIDATOR_REGISTRY`. That is correct while Addressing is bridge-provider/supporting-layer only, but registry-visible bridge metadata would be useful if/when runner-visible integration exists. | Does it follow the formula? Deferred for validator registry metadata. Is the difference intentional? Yes. Worth fixing now? No. Deferred? Yes. Runtime behavior changes required? Likely. |
| 8. Command / Docs / Test Formula | partially aligned | Addressing has a command script, package script, report-capture command for get-tree validator scope, profile tests, marker tests, snapshot tests, render tests, and host tests. It is not a validator report slice and does not have package-bin or runner report tests, which is currently appropriate. | Does it follow the formula? Partially, for a hybrid layer. Is the difference intentional? Yes. Worth fixing now? Only clarify classification/bridge docs/tests. Deferred? Package-bin/runner/report work is deferred. Runtime behavior changes required? Yes for runnable validator work. |

### Addressing audit notes

Current runtime truth: Addressing is already more than a comment convention. It has code-owned marker strategies, profile constants, addressed-snapshot preparation, render logic, tests, and a bounded get-tree host.

Current implementation reality: Tree still contains Tree-local structural-address snapshot preparation for validator runtime. This supports the hybrid classification because Addressing is not the sole runtime owner for all addressed records currently consumed by Tree.

Merged docs/spec truth: the formula classifies Addressing as a hybrid shared validator layer plus bridge provider for now and says it should not become standalone until it has independent report value.

Historical task context: this audit records and classifies current Addressing reality. It does not authorize Addressing runtime extraction.

Future/planning-only intent: Addressing can later become the explicit provider of addressed snapshots through a bridge boundary. That should remain separate from Tree placement reasoning.

## Cross-slice bridge alignment

| Bridge | Current status | Classification | ROI assessment |
| --- | --- | --- | --- |
| Naming -> Tree semantic-family bridge | Runner-staged bridge with registry metadata on both provider and consumer; Naming projection prepares observations; Tree consumes prepared semantic-family fields; tests guard against Tree deriving absent Naming-owned fields. | partially aligned | High ROI for small docs/test hardening because it protects clean ownership boundaries and developer mental models without changing behavior. |
| Addressing -> Tree addressed-snapshot bridge | Addressing profile declares an addressed snapshot output and Tree consumes addressed occurrence records, but current Tree runtime prepares local structural-address snapshots and there is no runner-visible Addressing provider metadata. | under-hardened / deferred | High ROI for explicit planning docs/tests; runtime migration is deferred because it would change implementation boundaries. |
| Suite-core -> slices mechanics | Suite-core owns scope/target/candidate/report/exit mechanics; Naming and Tree consume many helpers; registry metadata is declared and tested but not yet universally consumed by command/report code. | partially aligned | Medium ROI for metadata-consumption work later; low ROI for generic cleanup now. |

Cross-slice boundary rule: providers prepare output; consumers consume it. Consumers should not silently re-derive provider-owned meaning. Naming and Tree mostly satisfy this today. Addressing and Tree satisfy the evidence-vs-policy boundary, but the bridge boundary is under-hardened because Addressing is still hybrid and Tree-local structural-address logic remains current implementation reality.

## Immediate alignment gaps

Small docs/test/metadata fixes that do not change runtime behavior:

1. **Bridge-contract hardening doc/test slice for Naming -> Tree and Addressing -> Tree.** Add or update targeted tests/docs that name provider output ids, consumer input ids, staged-by/orchestrator expectations, ambiguity/confidence limits, and no-silent-rederivation expectations. This directly improves clean ownership boundaries, deterministic organization, fidelity to developer mental models, and future extraction paths.
2. **Addressing classification pointer in validator docs/index context.** If a later docs-only child permits index edits, add a narrow pointer from validator docs navigation to this audit or to a stable Addressing classification note. This is useful only if it avoids repeated confusion about whether Addressing is suite-core, Tree-owned, or runnable.
3. **Registry metadata consumption gap note.** Keep the current metadata-first staging documented as current implementation reality until a runtime issue explicitly migrates command/report literal consumption.

## Near-term follow-up

Bounded implementation or test work that may change runtime behavior:

1. **Registry metadata consumption migration for runner/report identity.** Migrate only if an implementation issue scopes exact call sites and preserves report shape. This may affect runtime behavior and should include focused runner/report tests.
2. **Addressing-to-Tree bridge handoff prototype behind behavior-preserving tests.** A later issue can evaluate replacing Tree-local structural-address preparation with Addressing-provided addressed snapshots, but only if output parity and Tree placement ownership are protected.
3. **Bridge metadata expansion for provider/consumer contracts.** If registry metadata becomes the inspection surface for bridge relationships, add fields without embedding Naming, Tree, or Addressing semantic policy.

## Deferred gaps

Larger runtime rewrites, package/bin changes, report-shape changes, Addressing extraction, or new validator slices:

- Creating a standalone Addressing validator slice.
- Adding Addressing package bins or runner registration.
- Changing report shapes, report ids/descriptions, severities, findings, summaries, or exit-code behavior.
- Rewriting runner dispatch or bridge orchestration.
- Extracting Tree-local structural-address runtime into `structural-addressing`.
- Making Addressing a pure suite-core helper area.
- Moving Naming interpretation into suite-core.
- Moving Tree placement interpretation into suite-core or Addressing.
- Creating universal plugin architecture, generic shared buckets, Lexical, or Coherence.

## Not worth fixing yet

Changes that would be generic cleanup without clear ROI:

- Renaming commands, package scripts, or prefixes only for aesthetic consistency.
- Adding a Tree package bin without a concrete distribution/use-case issue.
- Making registry metadata exhaustive for every possible field before a consumer exists.
- Consolidating all address-like code by broad refactor without a parity contract.
- Moving bridge logic into a generic helper solely to reduce file count.
- Broad repo cleanup unrelated to the formula gaps.

## Recommended next child issue

Ranked recommendation:

1. **Next child issue recommendation: Bridge-contract hardening for Naming -> Tree and Addressing -> Tree, docs/tests only.** This is the highest-ROI next child because it directly addresses the most important alignment gap without changing runtime behavior: explicit provider output ids, consumer input ids, staged handoff expectations, ambiguity/confidence limitations, and no-silent-rederivation proof. It supports clean ownership boundaries, deterministic organization, future extraction paths, fidelity to developer mental models, and extensibility over generic convenience.
2. **Second choice: Registry metadata consumption audit-to-implementation plan.** This should remain a planning/implementation child only after bridge contracts are hardened, because changing command/report consumption could affect runtime behavior.
3. **Third choice: Addressing extraction readiness plan.** This should remain deferred until bridge-contract proof and parity expectations are stable.

Recommended issue title: **Harden Naming/Addressing bridge contracts against Validator Slice Formula**.

Recommended scope for that child:

- Do not change runtime behavior.
- Do not change report shape.
- Do not add bins or package scripts.
- Add or update focused docs/tests that make Naming -> Tree and Addressing -> Tree bridge boundaries explicit.
- Preserve Naming ownership of semantic-family interpretation.
- Preserve Tree ownership of placement interpretation.
- Preserve Addressing ownership of addressed evidence/profile/marker semantics.
