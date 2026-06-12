# Tree/Naming Runtime Alignment Next-Slice Audit

## Scope and provenance

Issue: #612.

Parent / predecessor context:

- #598 — behavior-preserving suite-core hardening parent.
- #599 / PR #600, #601 / PR #602, #603 / PR #604, #605 / PR #607, #608 / PR #609, and #610 / PR #611 — staged suite-core, report-capture, report identity, registry, and Tree terminology cleanup work.
- #590 — validator slice/report/bridge/suite-core formula parent.

This audit is a planning and architecture artifact only. It documents current implementation reality and recommends the next staged implementation path. It does not change runtime behavior, report behavior, report shape, report ids/descriptions, findings, summaries, severities, exit-code behavior, package scripts, package bins, runner dispatch, Naming behavior, Tree behavior, Addressing behavior, or candidate behavior.

Runtime authority treated as binding for this audit:

- `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorSliceAndReportFormula.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorBridgeContracts.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md`
- `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md`
- `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
- current runtime truth in `calculogic-validator/src/core/**`, `calculogic-validator/tree/**`, `calculogic-validator/naming/**`, and `package.json`

Task-scoped supporting context:

- `calculogic-validator/doc/Audits/naming-tree-suite-core-usage-alignment.audit.md`
- `calculogic-validator/doc/Audits/tree-known-roots-remnant-cleanup.audit.md`
- #590, #598, #599 / PR #600, #601 / PR #602, #603 / PR #604, #605 / PR #607, #608 / PR #609, and #610 / PR #611

Navigation-only context:

- `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md`

## Executive summary

The smallest safe behavior-changing runtime alignment step is **Tree-only activation of the existing prepared Tree occurrence-classification replacement runtime for the repo top-level unexpected-folder path**, with Naming bridge output remaining a prepared evidence input and Addressing remaining deferred.

The current runtime path already prepares:

- suite-core scoped snapshot inputs;
- Tree occurrence and structural-address snapshots;
- Tree structural-home, semantic-home, folder-kind, parity, shadow, readiness, recommendation, evaluation-plan, and execution-contract evidence;
- a Tree-owned occurrence-classification replacement runtime;
- Naming semantic-family bridge evidence when the runner stages Naming before Tree.

However, the current Tree finding path still uses only the replacement runtime's `collectUnexpectedTopLevelDirectoryNames()` for the top-level repo-shape finding. The richer replacement runtime classification is prepared and parity-tested but remains staged evidence rather than active finding behavior.

The best next ROI step is therefore not a new suite-core evidence transport helper, not a Naming bridge expansion, and not Addressing extraction. It is a narrow Tree behavior change that replaces the current selected-path/fallback file-reasoning source for one existing Tree behavior with the already prepared occurrence-classification runtime where parity gates prove the delta. The implementation child should activate only one bounded route and keep all report identity, summary shape, finding codes, finding severities, report-capture metadata, package scripts, and runner sequencing stable.

## Current post-cleanup Tree runtime evidence path

1. Suite-core collects scoped snapshot inputs for Tree through `collectSuiteScopedSnapshotInputs()` in Tree wiring. Tree supplies Tree-owned walk exclusions and dot-directory behavior, while suite-core owns scope/target mechanics and normalized selected paths.
2. Tree wiring prepares an occurrence snapshot from selected paths, target descriptors, and include roots.
3. Tree wiring prepares a structural-address snapshot from the occurrence snapshot. This is current implementation reality as a Tree-local addressed evidence seam; it is not Addressing runner registration or Addressing extraction.
4. Tree wiring loads Tree-owned registries and repo-shape policy: structural homes, folder kinds, and repo-shape policy.
5. If the runner provides `namingSemanticFamilyBridge`, Tree wiring normalizes it through the Naming-owned semantic evidence bridge preparer. If not provided, Tree uses an empty observations array.
6. Tree prepares Tree-owned structural-home evidence from addressed occurrence records and Tree structural-home registry entries.
7. Tree prepares Tree-owned semantic-home evidence by joining addressed occurrence records to Naming-prepared semantic evidence by path. Tree does not re-derive Naming semantic-family meaning in this evidence preparer.
8. Tree prepares Tree-owned folder-kind evidence from addressed occurrence records, structural-home evidence, semantic-home evidence, and the Tree folder-kind registry.
9. Tree prepares a Tree-owned occurrence-classification replacement runtime from Tree structural-home evidence, Tree semantic-home evidence, Tree folder-kind evidence, and Tree repo-shape policy.
10. Tree immediately computes current replacement classification records, parity evidence, parity summary, shadow report, replacement readiness, replacement recommendation, runtime evaluation plan, and runtime execution contract. These are prepared dependencies today.
11. Tree runtime currently validates that prepared inputs include `selectedPaths`, `topLevelDirectoryNames`, and `targets`; then it collects file reasoning input from `structuralAddressSnapshot` or `occurrenceSnapshot` when present, falling back to `selectedPaths` when occurrence records are malformed or unavailable.
12. Tree runtime currently emits existing Tree findings from four routes: unexpected top-level folder findings, validator-owned files outside `calculogic-validator/**`, owned-slice boundary drift, and attached contributors.
13. Default contributors currently include shim diagnostics plus a Naming semantic-family bridge contributor when bridge payload is provided.
14. The runner stages Naming before Tree whenever Tree is selected, projects the Naming semantic-family bridge, and passes it only to Tree. If Naming is also selected, the runner reuses the staged Naming result for the Naming report entry.

## Available Naming evidence for Tree

Naming evidence currently available to Tree has two related forms:

1. **Runner-staged bridge output:** `projectNamingSemanticFamilyBridge(stagedNamingResult)` produces the provider-owned bridge payload passed as `namingSemanticFamilyBridge` to Tree when Tree is selected by the runner.
2. **Tree-prepared normalized bridge input:** `prepareNamingSemanticEvidenceBridge()` accepts the bridge payload and returns deterministic observations containing `path`, `semanticName`, `semanticFamily`, `familyRoot`, optional `familySubgroup`, source markers, evidence strength, ambiguity status, and split markers.

Tree currently consumes that evidence in two ways:

- Tree semantic-home evidence joins addressed occurrence records to Naming-prepared records by path and treats `semanticFamily` as `semanticHome` evidence with source and strength metadata.
- The Tree Naming semantic-family bridge contributor uses bridge observations for Tree-owned placement findings such as `TREE_FAMILY_SCATTERED`, `TREE_OBSERVED_FAMILY_CLUSTER`, `TREE_FAMILY_SUBGROUP_OPPORTUNITY`, and `TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES`.

Current implementation reality already proves Tree can consume Naming semantic-family / semantic-home evidence without re-deriving Naming semantics. The safe boundary is: Naming owns semantic-name and semantic-family interpretation; Tree may join prepared Naming records to addressed paths and interpret Tree placement, structural-home, semantic-home, folder-kind, and advisory findings.

## Suite-core, Naming, Tree, and Addressing separation

| Area | Current owner | Current role in the path | Next-slice implication |
| --- | --- | --- | --- |
| Suite-core orchestration | Suite-core | Runner selection, Naming-before-Tree staging, report wrapping, report identity, source snapshot, exit/report mechanics, scoped snapshot input mechanics. | Keep stable. Do not add a new evidence transport helper before a bounded Tree runtime delta proves need. |
| Suite-core evidence transport | Suite-core when slice-neutral | Current transport is explicit runner options plus prepared inputs. | Existing mechanics are sufficient for the next child. A helper can remain staged implementation path after more than one bridge/evidence route needs common mechanics. |
| Report guardrails | Suite-core / registry metadata | Report identity helper, report-capture preset metadata, registry metadata, and tests guard report shape and package-script parity. | Keep report ids/descriptions, summary/count fields, finding fields, capture presets, package scripts, and exit policy stable. |
| Naming semantic evidence | Naming | Naming produces semantic-name / semantic-family bridge evidence and ambiguity/split markers. | No new Naming semantics are required for the recommended child. Add bridge tests only if Tree begins consuming a new bridge field or changes ambiguity filtering. |
| Tree repo-shape and placement reasoning | Tree | Tree owns repo-shape policy, top-level directory expectation interpretation, structural-home evidence, semantic-home evidence, folder-kind evidence, occurrence classification, and Tree findings. | Recommended child should be Tree-owned and limited to replacing one active Tree reasoning route with the already prepared replacement runtime. |
| Addressing | Deferred bridge-provider layer | Current Tree-local structural-address snapshot prepares addressed records for Tree evidence. Addressing is not a runner-visible validator slice. | Addressing remains deferred. No Addressing extraction, registration, package bin, or broad Addressing -> Tree handoff is needed for the recommended child. |

## Option comparison

| Option | Description | ROI assessment | Main risk | Verdict |
| --- | --- | --- | --- | --- |
| Option A: Tree-only runtime alignment using current prepared inputs | Activate a bounded piece of the already prepared Tree occurrence-classification replacement runtime for existing Tree behavior, starting with repo top-level unexpected-folder reasoning. | Strongest. Ownership stays clean because Tree already owns repo-shape policy and finding behavior. Modular decomposition improves by routing active behavior through prepared evidence already staged by Tree. Deterministic organization improves because parity/shadow artifacts become the gate for one active route. Future extraction paths remain clean because Addressing stays neutral and deferred. Developer mental model improves because prepared Tree evidence starts driving Tree runtime behavior instead of remaining parallel shadow evidence. | Behavior delta must be tightly scoped so existing report shape and finding identity remain stable. | Recommended. |
| Option B: Naming -> Tree bridge alignment using existing Naming semantic-family evidence | Expand active Tree behavior that consumes Naming semantic-family evidence, or move more contributor logic behind normalized semantic-home evidence. | Medium. It uses existing evidence and can make semantic modeling more explicit, but the current bridge contributor already emits behavior-changing Tree findings from Naming evidence. The next change would likely be broader placement reasoning and could blur whether the task is Tree runtime alignment or bridge semantics. | High chance of expanding Tree reasoning and changing multiple advisory findings at once. | Defer until after one Tree-only prepared-runtime route is active and parity-tested. |
| Option C: Suite-core evidence transport helper before Tree consumes more evidence | Add a slice-neutral evidence transport helper for staged runner evidence or prepared-input handoff. | Medium-low now. Suite-core orchestration/report guardrails are hardened, but current runner/prepared-input mechanics already transport Naming bridge output and Tree prepared dependencies. A helper before a second consumer/provider pattern exists would optimize generic convenience before proven need. | Premature suite-core abstraction could make suite-core appear to own Naming or Tree evidence semantics. | Defer. Revisit after at least two transport routes need identical mechanics. |
| Option D: Addressing-backed occurrence/evidence handoff now | Move Tree addressed occurrence preparation behind Addressing-owned output, or introduce Addressing as a bridge provider/runner-visible slice. | Low for this child. It may improve future extraction paths later, but current evidence does not prove Addressing is required for the smallest next Tree/Naming behavior delta. | Violates scope by turning a Tree runtime alignment step into Addressing extraction/registration or a broad handoff. | Do not do now. Documented deferred boundary remains sufficient. |

## Recommended next behavior-changing target

The next best candidate is **Tree top-level repo-shape reasoning through the prepared occurrence-classification replacement runtime**.

Recommended behavior delta:

- Keep existing `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` code, severity, classification, message, ruleRef, and `details.allowedTopLevelDirectories` stable.
- Change only the source of top-level unexpected-folder selection from the fallback top-level directory list path to the prepared Tree occurrence-classification replacement runtime when the runtime execution contract says the route is ready.
- Treat a repo-top folder as expected when the replacement runtime marks it as a repo-shape allowed top-level directory through Tree structural-home, semantic-home, folder-kind, and repo-shape policy evidence.
- Preserve fallback behavior when prepared occurrence evidence is malformed, unavailable, or explicitly not ready.
- Do not add new Tree findings, Naming findings, Addressing outputs, package scripts, or report shape fields.

The expected visible behavior delta should be intentionally small: the same existing unexpected-top-level advisory remains the only affected finding route, but it becomes evidence-backed by the prepared Tree occurrence-classification runtime. In targeted fixtures where current fallback and replacement classification disagree, the replacement runtime should determine whether an existing top-level folder advisory is emitted. In parity fixtures where they agree, output must be byte-stable except for time/source snapshot fields that are already non-deterministic in runner envelopes.

## Does the next slice require suite-core evidence transport?

No. The current runner/prepared-input mechanics are sufficient.

Evidence:

- Runner already stages Naming before Tree and passes `namingSemanticFamilyBridge` through options.
- Tree wiring already transforms runner options into prepared inputs and prepared dependencies.
- Tree runtime already consumes `preparedDependencies.treeOccurrenceClassificationReplacementRuntime` for current top-level fallback runtime collection and occurrence classification.
- Report identity, report capture, and registry metadata are already guarded separately from slice reasoning.

A suite-core evidence transport helper should remain a staged implementation path only after a second evidence route needs the same neutral transport semantics. The next child should not add suite-core helper logic.

## Does the next slice require Naming bridge changes?

No.

Naming bridge output is already sufficient for the recommended Tree-only child because the target is repo-shape classification behavior, not new Naming semantics. Existing Naming evidence can continue to flow into Tree semantic-home evidence and parity/shadow evidence exactly as it does now.

Naming bridge changes would be required only if the child changed one of these contracts:

- new required bridge field;
- new ambiguity/split-family filtering semantics;
- changed `semanticFamily` / `familyRoot` / `familySubgroup` meaning;
- changed provider-owned bridge projection shape;
- changed Tree's no-silent-rederivation boundary.

The recommended child requires none of those.

## Does the next slice require Addressing?

No. Addressing can remain deferred.

Current implementation reality already has Tree-local addressed occurrence records sufficient for Tree structural-home, semantic-home, folder-kind, and occurrence-classification evidence. The next child should not extract Addressing, register Addressing as a runner-visible validator, add Addressing package bins, or introduce a broad Addressing -> Tree runtime handoff.

If a later child proves a bounded Addressing handoff is required, the smallest acceptable interface should be an addressed occurrence evidence envelope only:

- `source` / `profileId` / optional contract version;
- repo-relative `path` / `resolvedPath`;
- `occurrenceType`;
- `addressPath` / `parentAddressPath`;
- scope/target descriptors needed to prove deterministic selection;
- no Tree findings, severities, summary buckets, placement confidence, structural-home policy, semantic-home policy, or folder-kind policy.

That future interface would remain evidence-only. It is not required for the recommended child.

## Required report/output parity

The recommended child must preserve:

- validator ids, report entry ids, descriptions, and report mode;
- runner envelope shape and per-validator report-entry shape;
- report-capture presets, script names, prefixes, wrapped commands, and package-script alignment;
- package scripts and bins;
- Tree summary shape (`counts`, `codeCounts`) and deterministic sorting;
- `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` code, severity, classification, message, ruleRef, path style, and `details.allowedTopLevelDirectories` shape;
- all Naming report behavior and Naming finding semantics;
- all existing Tree bridge contributor finding codes unless explicitly covered by a separate child;
- exit-code derivation behavior;
- target/filter metadata behavior;
- no active runtime terminology regression from current repo-shape policy language.

## Required tests before or with implementation

Minimum tests for the recommended child:

1. **Tree runtime delta fixture:** a focused Tree fixture where replacement runtime classification differs from current fallback top-level directory treatment, proving the existing `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` route is now driven by prepared classification when ready.
2. **Tree parity fixture:** a focused Tree fixture where fallback and replacement classification agree, proving output remains stable for common top-level repo-shape policy cases.
3. **Fallback guard:** malformed or missing occurrence/classification prepared evidence falls back to current behavior without throwing beyond existing contract errors.
4. **Report parity:** direct `validate:tree` report shape remains stable for ids, description, summary keys, finding keys, filters, and sorting.
5. **Runner parity:** `validate:all` with Tree selected still stages Naming once, passes bridge evidence to Tree, and reuses Naming output if Naming is also reported.
6. **No Naming bridge regression:** existing Naming bridge contributor tests continue to prove incomplete observations are dropped and Tree does not re-derive Naming-owned semantic-family meaning.
7. **Registry/report-capture guard:** registry and report-capture metadata tests continue to prove command/report-capture metadata remains aligned and Addressing remains unregistered as a runner-visible slice.

Recommended focused commands for that child:

- `node --test --experimental-strip-types calculogic-validator/tree/test/tree-structure-advisor.test.mjs`
- `node --test --experimental-strip-types calculogic-validator/tree/test/tree-occurrence-classification-parity-evidence.logic.test.mjs calculogic-validator/tree/test/tree-occurrence-classification-replacement-readiness.logic.test.mjs calculogic-validator/tree/test/tree-occurrence-classification-replacement-recommendation.logic.test.mjs`
- `node --test --experimental-strip-types calculogic-validator/test/validator-runner.test.mjs calculogic-validator/test/validator-registry.test.mjs calculogic-validator/test/validator-report-capture*.test.mjs`
- `npm run validate:naming -- --scope=validator --target calculogic-validator/tree`
- `git diff --check`

## Recommended next implementation child

Recommended issue title:

> Activate Tree repo-shape occurrence-classification replacement for top-level advisory parity

Implementation goal:

- Make the prepared Tree occurrence-classification replacement runtime the active source for the existing top-level unexpected-folder advisory when readiness/parity gates allow it.
- Keep the change constrained to one existing Tree finding route.
- Preserve report identity, report shape, summary shape, package scripts, report-capture metadata, Naming bridge output semantics, and Addressing-deferred status.

Files likely touched:

- `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md` — document the scoped current runtime truth delta and parity gate.
- `calculogic-validator/tree/src/tree-structure-advisor.logic.mjs` — route the top-level unexpected-folder decision through prepared classification when safe.
- `calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs` — only if an explicit readiness flag or execution-contract field must be passed more directly; otherwise avoid changing wiring.
- `calculogic-validator/tree/test/tree-structure-advisor.test.mjs` — focused behavior delta and fallback/parity tests.
- `calculogic-validator/test/validator-runner.test.mjs` — only if runner-level parity for staged Naming + active Tree behavior needs an additional fixture.
- Existing report-capture/registry tests only if touched by the implementation, which should generally be unnecessary.

Expected behavior delta:

- Existing top-level Tree advisory emission becomes classification-backed for the prepared runtime route.
- Findings outside that one route remain unchanged.
- No new finding codes are introduced.
- No Naming output changes.
- No Addressing output or registration changes.

Explicit non-goals:

- No broad Tree reasoning expansion.
- No new Tree findings.
- No new Naming findings.
- No Naming bridge shape changes.
- No suite-core evidence transport helper.
- No Addressing extraction.
- No Addressing runner registration.
- No Addressing package bins.
- No package script/bin changes.
- No report shape changes.
- No generic plugin architecture.
- No Lexical or Coherence work.
- No command/package cosmetic renames.

Why this is the best next ROI step:

- It uses already prepared Tree evidence instead of adding new abstractions.
- It preserves clean ownership: suite-core orchestrates and guards reports, Naming owns semantic evidence, Tree owns repo-shape and placement reasoning, and Addressing remains evidence-only/deferred.
- It improves modular decomposition by moving one active behavior from legacy/fallback reasoning to the prepared replacement runtime.
- It protects future extraction paths because Addressing is not pulled into runner registration or policy interpretation.
- It matches developer mental models: the Tree validator's prepared Tree evidence should gradually become Tree runtime truth through small parity-gated slices.
- It makes semantic modeling operational where it already exists, without turning semantic evidence into generic convenience or competing policy truth.
