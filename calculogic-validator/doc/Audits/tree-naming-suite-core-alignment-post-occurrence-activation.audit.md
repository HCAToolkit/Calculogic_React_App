# Tree/Naming Suite-Core Alignment Post-Occurrence Activation Audit

## Scope and status

Issue: #616.

Parent context: #598 and #590.

Predecessor context: #599 / PR #600, #601 / PR #602, #603 / PR #604, #605 / PR #607, #608 / PR #609, #610 / PR #611, #612 / PR #613, and #614 / PR #615.

This audit is planning/audit only. It records current implementation reality after the first narrow Tree occurrence-classification runtime activation. It does not change runtime behavior, report behavior, report shape, report ids/descriptions, findings, summaries, severities, exit behavior, package scripts, package bins, Naming behavior, Tree behavior, Addressing behavior, or candidate/path collection behavior.

Runtime authority treated as binding for this audit:

- `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorSliceAndReportFormula.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorBridgeContracts.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md`
- `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md`
- `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
- current runtime truth in `calculogic-validator/src/core/**`, `calculogic-validator/tree/**`, `calculogic-validator/naming/**`, `calculogic-validator/scripts/**`, `calculogic-validator/test/report-capture*.test.mjs`, and `package.json`

Task-scoped supporting context:

- `calculogic-validator/doc/Audits/naming-tree-suite-core-usage-alignment.audit.md`
- `calculogic-validator/doc/Audits/tree-naming-runtime-alignment-next-slice.audit.md`
- `calculogic-validator/doc/Audits/tree-known-roots-remnant-cleanup.audit.md`

Navigation-only context:

- `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md`

## 1. Current state summary

Post-#615 current runtime truth is broadly aligned with the validator slice/report/bridge/suite-core formula.

Suite-core currently owns these shared mechanics:

- direct Tree runner mechanics through `runValidatorRunnerCli()`, including npm argument-forwarding detection, shared argument parsing hooks, config loading, report output, and exit-code derivation;
- `validate:all` runner orchestration and per-validator report wrapping through the validator registry;
- report identity for runner-visible entries through registry metadata;
- report-capture preset metadata for Naming, Tree, validate-all, and deferred Addressing capture surfaces;
- source snapshot, config digest, scope profiles, candidate collection, and suite-scoped snapshot input mechanics.

Naming currently owns these semantics:

- canonical filename parsing and classification;
- semantic-name and semantic-family derivation;
- Naming finding policy and summary buckets;
- Naming direct report semantics;
- Naming bridge projection from canonical Naming findings into `naming-semantic-family-bridge` observations.

Tree currently owns these semantics:

- repo-shape policy and allowed top-level directory interpretation;
- structural-home, semantic-home, folder-kind, and occurrence-classification evidence;
- Tree advisory findings, summaries, severities, and existing Tree report entry semantics;
- the post-#615 active route for unexpected top-level folder behavior, which now attempts prepared occurrence classification first and falls back to the existing repo-shape collection route only when the prepared evidence route is unavailable.

Addressing remains deferred. Current implementation reality still uses Tree-local structural-address snapshot preparation as an evidence seam, but Addressing is not registered as a validator slice and is not extracted into suite-core evidence transport.

## 2. Confirmed aligned surfaces

| Surface | Current evidence | Owner classification | Risk level |
| --- | --- | --- | --- |
| Tree direct CLI/report surface | `validate-tree.host.mjs` delegates to `runValidatorRunnerCli()` with `validators: ['tree-structure-advisor']`; report output and exit-code derivation remain suite-core runner mechanics. | suite-core mechanics | none |
| Validate-all runner staging | `runValidatorRunner()` resolves selected registry entries, stages Naming before Tree when Tree runs, projects the Naming bridge, and injects only the prepared bridge payload into Tree. | suite-core mechanics / bridge contract | none |
| Runner report identity | `toValidatorReportEntry()` uses `getValidatorReportIdentity()` from registry metadata for per-validator entries. | suite-core mechanics | none |
| Naming direct report envelope | Naming direct CLI uses `buildDirectValidatorReportEnvelope()` through `buildNamingValidatorReport()` while preserving Naming-owned summary fields and registry state metadata. | report/capture guardrail / Naming semantics | none |
| Tree direct report parity | Tree direct execution uses the same suite runner report envelope as runner-selected Tree execution; existing integration tests assert no-finding and finding parity against `validate:all --validators=tree-structure-advisor`. | report/capture guardrail | none |
| Report-capture metadata | `VALIDATOR_REPORT_CAPTURE_PRESETS` is suite-core data-only metadata and `buildReportCapturePackageScript()` derives package-script strings from those presets. | report/capture guardrail / suite-core mechanics | none |
| Package script/bin guardrails | Package scripts still expose `validate:naming`, `validate:tree`, `validate:all`, report-capture presets, and deferred Addressing capture without a Tree package bin. Tests cover package-bin expectations and report-capture metadata alignment. | report/capture guardrail | none |
| Naming runtime input boundary | Naming runtime requires prepared inputs from wiring/runtime adapters and does not collect repo paths directly in semantic runtime logic. | Naming semantics | none |
| Tree runtime input boundary | Tree runtime requires prepared `selectedPaths`, `topLevelDirectoryNames`, and `targets`; Tree wiring prepares suite-scoped snapshot inputs, addressed occurrence evidence, Tree evidence, and occurrence-classification dependencies before runtime. | Tree semantics / suite-core mechanics | low |
| Naming-to-Tree bridge consumption | Naming projects canonical findings into bridge observations; Tree converts the bridge through Naming-owned bridge preparation and joins evidence by path without re-deriving semantic-family meaning. | bridge contract | none |
| Suite-core semantic neutrality | Suite-core stages bridge payloads and wraps reports, but Tree and Naming registries, summaries, severities, findings, and evidence interpretation remain slice-owned. | suite-core mechanics | none |
| Known-roots retirement | Active current runtime truth uses repo-shape allowed top-level directory language; known-roots remains retired historical terminology rather than active runtime language. | Tree semantics | none |

## 3. Required audit questions

### 3.1 After #615, where do Tree and Naming still bypass intended suite-core mechanics, if anywhere?

No high-risk bypass remains.

Confirmed current alignment:

- Tree direct CLI uses suite-core `runValidatorRunnerCli()` and runner report wrapping.
- Tree and Naming runner-visible report entries are selected through registry ids.
- Tree scope/target snapshot collection uses suite-core `collectSuiteScopedSnapshotInputs()`.
- Naming candidate path collection uses suite-core candidate policy and candidate collection helpers.
- Naming direct output uses the suite-core direct report envelope helper.

Remaining low-risk seam:

- Naming direct CLI still has a slice-local `runNamingCli()` because Naming preserves a legacy-compatible direct report shape rather than using the runner envelope. This is intentional current runtime truth and is guardrailed by direct-report parity tests, not a current implementation gap.

### 3.2 Are there remaining direct CLI/report/report-capture paths that should consume suite-core helpers or registry metadata?

No immediate implementation gap is justified.

Confirmed current alignment:

- Tree direct CLI consumes suite-core direct runner mechanics.
- Naming direct report consumes the suite-core direct report envelope builder and registry report identity.
- report-capture package scripts are represented by suite-core registry preset metadata.
- package-script/report-capture tests guard the metadata-to-script contract.

Low-risk observation:

- `validate-all.host.mjs` still owns its validator-selection argument parser locally, but it delegates execution to `runValidatorRunnerCli()` and uses registry selection. This is acceptable because validator selection is a validate-all-specific command surface, not duplicated Tree/Naming semantic behavior.

### 3.3 Are there remaining runner staging or bridge handoff paths that duplicate suite-core-owned orchestration mechanics?

No.

Current implementation reality has one runner-owned bridge staging path: when Tree is selected, `runValidatorRunner()` runs Naming once, projects `naming-semantic-family-bridge`, reuses the staged Naming result if Naming is also report-included, and passes the prepared bridge payload to Tree. Tree does not run Naming independently. Naming projection remains Naming-owned; suite-core only stages and passes the payload.

### 3.4 Are Tree runtime paths now consuming prepared inputs/dependencies in a way that matches the slice formula?

Yes, with one low-risk fallback seam described below.

Tree wiring prepares suite-scoped snapshot inputs, occurrence snapshots, structural-address snapshots, structural-home evidence, semantic-home evidence, folder-kind evidence, repo-shape policy, occurrence-classification replacement runtime, parity evidence, shadow report, readiness, recommendation, evaluation plan, and execution contract before invoking the Tree runtime.

Post-#615 Tree runtime consumes prepared occurrence-classification dependencies for:

- repo top-level unexpected-folder collection where execution readiness permits the replacement route;
- file reasoning input, where classified occurrence file records become the active source when classification succeeds.

### 3.5 Are there Tree runtime paths that still use fallback/legacy inputs where prepared evidence should become the active route later?

Yes, but the remaining fallback behavior is low risk and does not justify another #598 child by itself.

Remaining fallback seams:

1. The unexpected top-level folder path falls back to `collectUnexpectedTopLevelDirectoryNames()` when the prepared classification route is unavailable, not execution-ready, incomplete, or throws.
2. File reasoning falls back to `selectedPaths` when no occurrence records are available or occurrence classification fails.
3. Tree still keeps `topLevelDirectoryNames` as a prepared input because the existing report behavior is scoped to top-level repo-shape advisories and because the fallback route preserves current behavior.

These are safety fallbacks, not active known-roots revival. They preserve report behavior while prepared occurrence evidence continues to carry the active route when readiness gates pass.

### 3.6 Are any Naming bridge outputs consumed by Tree in a way that risks Tree re-deriving Naming-owned semantics?

No.

Naming owns semantic-family projection. Tree consumes Naming-prepared bridge observations as evidence records and joins them to addressed occurrence records by path. Tree semantic-home evidence uses `semanticFamily` as a prepared semantic-home evidence value, records the Naming evidence source, and does not parse filenames or derive semantic-family details itself.

### 3.7 Are any suite-core helpers drifting into Tree/Naming semantic ownership?

No.

Suite-core helpers currently provide mechanics: runner orchestration, report wrapping, report identity lookup, exit policy, source snapshot, config digest, scope/candidate collection, and report-capture metadata. Tree and Naming semantic registries, finding policy, summary meaning, severity behavior, and evidence interpretation remain in slice-owned modules.

### 3.8 Are any Tree/Naming tests missing parity guardrails for report shape, exit behavior, package scripts, or report-capture metadata?

No high-risk test gap remains for #598 closure.

Confirmed guardrails include:

- Naming direct report parity tests for the direct report builder.
- Tree direct-vs-runner parity tests for no-finding and finding paths.
- report schema conformance tests for direct Naming and validate-all runner envelopes.
- report-capture registry metadata tests.
- package-bin and command-surface tests.
- validator exit-policy and exit-code tests.
- Tree occurrence-classification parity, shadow-report, readiness, recommendation, evaluation-plan, and runtime-execution contract tests.

Low-risk possible enhancement outside #598 closure:

- A future behavior-changing Tree issue that removes or narrows fallback routes should add targeted tests proving fallback removal does not alter existing finding codes, severities, summaries, exit behavior, or package-script surfaces.

### 3.9 Are docs/specs consistent with the post-#615 runtime truth?

Yes.

The docs/spec set consistently distinguishes:

- suite-core mechanics from slice-owned semantics;
- Naming semantic-family ownership from Tree semantic-home consumption;
- Tree repo-shape policy from retired known-roots terminology;
- Addressing as deferred/non-runner-visible bridge/evidence context;
- current runtime truth from target architecture and staged implementation path.

This audit adds the post-#615 evidence point that Tree now actively uses prepared occurrence-classification evidence for the bounded occurrence route while keeping fallback behavior as compatibility safety.

### 3.10 Is another implementation child justified under #598, or is #598 ready to close after current alignment?

Recommendation: **close #598 after this audit is reviewed**, with no further #598 implementation child.

Rationale:

- The remaining low-risk fallback seams are Tree behavior-migration choices, not suite-core usage misalignment.
- Direct CLI/report/report-capture/registry/package-script mechanics are aligned or intentionally preserved with tests.
- Naming-to-Tree bridge staging follows the formula without Tree re-deriving Naming semantics.
- Addressing remains deferred and no current repo evidence requires a bounded Addressing handoff before #598 closure.
- Another child under #598 would likely broaden from suite-core alignment into general Tree reasoning expansion, which this task explicitly avoids.

## 4. Remaining gaps, risks, and ownership

| Gap id | Gap | Current impact | Risk level | Owner classification | Recommendation |
| --- | --- | --- | --- | --- | --- |
| G-001 | Tree unexpected top-level folder behavior retains a fallback to the repo-shape collection route when prepared occurrence classification is unavailable or not execution-ready. | Compatibility safety; current active route uses prepared occurrence classification when readiness gates pass. | low | Tree semantics | Do not open a #598 child. If a later Tree behavior issue removes the fallback, scope it to Tree-only parity-gated migration. |
| G-002 | Tree file reasoning still falls back to `selectedPaths` when occurrence records are missing or classification fails. | Compatibility safety; active route uses classified occurrence file records when available. | low | Tree semantics | Do not open a #598 child. Future fallback narrowing belongs to Tree runtime behavior work only. |
| G-003 | Naming direct CLI remains slice-local instead of wholly using `runValidatorRunnerCli()`. | Intentional current runtime truth because direct Naming report shape differs from runner envelope and is parity-tested. | none | Naming semantics / report-capture guardrail | No action. |
| G-004 | Addressing remains a deferred bridge/evidence layer rather than a runner-visible validator slice or suite-core evidence transport helper. | Intentional current implementation reality; no current #598 blocker. | none | deferred Addressing | No action under #598. |
| G-005 | Validate-all keeps a local parser for `--validators` and `--strict`. | Command-surface-specific mechanics; execution still delegates to suite-core runner CLI and registry selection. | none | suite-core mechanics | No action. |
| G-006 | Future fallback removal would need explicit parity guardrails for report shape, exit behavior, and finding summaries. | No current behavior drift; only relevant if a future Tree implementation child changes runtime fallback behavior. | low | report/capture guardrail | Record as verification needed for any future Tree-only child, not as current #598 work. |

## 5. Recommendation

**Recommended disposition: close #598 after #616.**

No additional implementation child is recommended under #598.

The exact recommended closeout statement for the human owner is:

> Post-#615 audit found no remaining suite-core usage misalignment requiring implementation under #598. Remaining fallback seams are low-risk Tree behavior-migration choices and should be handled, if needed, as future Tree-only behavior work outside the suite-core alignment parent.

## 6. Explicit non-goals for any future Tree-only child

No child is recommended under #598. If a future Tree-only issue is created outside #598 to narrow fallback behavior, its non-goals should be:

- Do not change Naming behavior.
- Do not change Naming bridge projection semantics.
- Do not change report ids, report descriptions, report envelopes, report shape, summary buckets, severities, or exit-code policy.
- Do not change package scripts or package bins.
- Do not add Tree findings or Naming findings.
- Do not extract Addressing.
- Do not add a suite-core evidence transport helper.
- Do not revive known-roots terminology as active runtime language.
- Do not broaden into general Tree placement/scatter/cluster reasoning expansion.

## 7. Verification needed for any future Tree-only fallback child

No implementation child is recommended under #598. If a later Tree-only behavior issue narrows or removes fallback routes, require at least:

1. `git diff --check`
2. focused Tree occurrence-classification tests that prove prepared occurrence evidence remains deterministic;
3. Tree direct-vs-runner report parity tests for no-finding and finding paths;
4. exit behavior checks proving Tree remains non-strict unless an explicitly scoped issue changes that;
5. report-capture metadata/package-script checks if any command-surface files are touched;
6. focused Naming bridge tests proving Tree still consumes Naming evidence without re-deriving Naming semantics.

## 8. Verification for this audit

Required verification for this docs-only audit:

- `git diff --check`
- `npm run validate:naming -- --scope=validator --target calculogic-validator/doc`

If full validator-doc naming validation reports pre-existing findings, run focused validation on this audit document only:

- `npm run validate:naming -- --scope=validator --target calculogic-validator/doc/Audits/tree-naming-suite-core-alignment-post-occurrence-activation.audit.md`
