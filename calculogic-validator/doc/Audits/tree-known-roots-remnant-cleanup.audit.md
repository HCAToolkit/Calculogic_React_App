# Tree known-roots Remnant Cleanup Audit

## Scope and status

Issue: #610.
Parent context: #598.

This audit records the classification performed before the cleanup changes in this slice. Current runtime truth is that Tree unexpected top-level folder behavior is owned by Tree repo-shape policy (`allowedTopLevelDirectories`) and occurrence classification is owned by prepared Tree evidence (`addressed occurrences`, `structural-home evidence`, `semantic-home evidence`, and `folder-kind evidence`). The old Tree known-roots registry/runtime model is retired and is not current runtime truth.

Runtime authority used for this audit:

- `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
- `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md`
- `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md`
- `calculogic-validator/tree/src/tree-structure-advisor.logic.mjs`
- `calculogic-validator/tree/src/tree-occurrence-classification.logic.mjs`

Navigation/supporting context used for this audit:

- `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md`
- `calculogic-validator/doc/ValidatorSpecs/tree-known-roots-*.md`
- `calculogic-validator/doc/Audits/naming-tree-suite-core-usage-alignment.audit.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorSliceAndReportFormula.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorBridgeContracts.md`

## Classification table

| Occurrence area | Classification before cleanup | Decision in this slice |
|---|---|---|
| `calculogic-validator/tree/src/tree-structure-advisor.logic.mjs` `details.knownRoots` for `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` | live report output / report detail | Renamed to `details.allowedTopLevelDirectories` so active report details match Tree repo-shape policy ownership. Finding code, severity, classification, message, summary behavior, and exit behavior remain stable. |
| `calculogic-validator/tree/test/tree-structure-advisor.test.mjs` assertions for `details.knownRoots` | obsolete test expectation | Updated to assert `details.allowedTopLevelDirectories` and added a focused guard that `knownRoots` is no longer emitted. |
| `calculogic-validator/tree/src/tree-occurrence-classification.logic.mjs` `isKnownTopRoot` output flag | live runtime behavior | Renamed to `isRepoShapeAllowedTopLevelDirectory` because the active predicate is repo-shape allow-list membership, not legacy known-roots authority. |
| `calculogic-validator/tree/src/tree-occurrence-classification-parity-evidence.logic.mjs` `isKnownTopRoot`/`currentIsKnownTopRoot` consumption and `known-top-root` label | live runtime behavior / live report-support detail | Renamed to `isRepoShapeAllowedTopLevelDirectory`, `currentIsRepoShapeAllowedTopLevelDirectory`, and `repo-shape-allowed-top-level-directory` to preserve comparison behavior without exposing known-root terminology. |
| Tree occurrence-classification, parity-evidence, and shadow-report tests carrying `isKnownTopRoot`, `currentIsKnownTopRoot`, or `known-root` fixture values | obsolete test expectation | Updated to current repo-shape / repo-top terminology while preserving expected booleans and parity status behavior. |
| Tree evidence-only tests whose names or forbidden-key lists referenced known-roots classification/replacement fields | obsolete test expectation | Updated wording and forbidden-key lists to the renamed repo-shape field. |
| `calculogic-validator/tree/src/registries/_builtin/surface-structural-home-perspective.registry.json` `current-known-root-aligned` relationship values | active docs/data reference | Renamed to `current-repo-shape-policy-aligned`; rationale wording now points at current repo-shape policy instead of known roots. |
| `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md` and `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md` active runtime boundary notes | active docs/spec reference | Updated active report-detail field and occurrence flag names. Retained explicit retirement statements for `knownTopLevelDirectories` and `topRoots[].kind` because they clarify not current runtime truth. |
| `calculogic-validator/doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md` Tree loader list | dead documentation reference | Replaced the retired `tree-known-roots-registry.logic.mjs` pointer with the current `tree-repo-shape-policy-registry.logic.mjs` pointer. |
| `calculogic-validator/doc/ConventionRoutines/registry-expansion-candidates.audit.md` and `post-registry-reassessment.audit.md` completed extraction/planning notes | historical/retired planning record with stale active wording | Reworded concise references to current repo-shape policy so these planning records no longer look like active known-roots runtime evidence. |
| `calculogic-validator/doc/ValidatorSpecs/tree-known-roots-*.md` | historical/retired planning record | Kept in place because these files are already marked as historical/retired context after issue #572. Their active-runtime-sounding statements are governed by that status banner and remain not current runtime truth. |
| `calculogic-validator/doc/ValidatorSpecs/tree-owned/**` known-roots references | historical/retired planning record or navigation record | Kept when already status-marked as historical context or navigation/supporting context; no active runtime authority was taken from these occurrences. |
| `calculogic-validator/doc/Audits/naming-tree-suite-core-usage-alignment.audit.md` known-roots retirement mentions | historical/retired planning record | Kept as issue #599 audit context. |
| `calculogic-validator/test/validator-config-strictness.test.mjs` `tmp-config-unknown-root-key.json` | unrelated false-positive occurrence | Kept; this is an “unknown root key” config strictness fixture, not Tree known-roots terminology. |
| `package.json` | no occurrence found | No change; package scripts and bins remain untouched. |
| `calculogic-validator/src/core/validator-registry.knowledge.mjs` | no occurrence found | No change; suite registry metadata remains untouched. |

## Post-cleanup active behavior boundary

- Active `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` details expose `allowedTopLevelDirectories` and do not expose `knownRoots`.
- Active occurrence classification exposes `isRepoShapeAllowedTopLevelDirectory` and does not expose `isKnownTopRoot`.
- The old `knownTopLevelDirectories`, `topRoots[].kind`, and `tree-known-roots` names may remain only in clearly retired/historical planning records or in active specs that explicitly state those paths are not current runtime truth.
- Naming behavior, Addressing registration/extraction, package scripts, suite runner dispatch, Tree severities, Tree summaries, and Tree exit-code behavior are outside this cleanup and remain unchanged.
