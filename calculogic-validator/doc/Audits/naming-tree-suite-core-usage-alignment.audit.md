# Naming and Tree Suite-Core Usage Alignment Audit

## Scope and provenance

Issue: #599.

Parent context:

- #598 — Align Naming and Tree suite-core usage with validator slice formula.
- #590 — validator slice/report/bridge/suite-core formula parent.
- #591 / PR #592 — validator slice/report formula docs.
- #594 / PR #595 — validator slice formula alignment audit.
- #596 / PR #597 — bridge-contract hardening for Naming -> Tree and Addressing -> Tree.

This audit is a planning and evidence snapshot only. It documents current implementation reality and recommended staged implementation paths. It does not change runtime behavior, report behavior, report shape, report ids/descriptions, findings, summaries, severities, exit-code behavior, package scripts, package bins, runner dispatch, Naming behavior, Tree behavior, Addressing behavior, or candidate behavior.

Runtime authority treated as binding for this audit:

- `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
- `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
- `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md`
- current runtime truth in `calculogic-validator/src/core/**`, `calculogic-validator/naming/**`, `calculogic-validator/tree/**`, `calculogic-validator/scripts/**`, `calculogic-validator/bin/**`, and `package.json`

Task-scoped supporting context:

- `calculogic-validator/doc/ConventionRoutines/ValidatorSliceAndReportFormula.md`
- `calculogic-validator/doc/Audits/validator-slice-formula-alignment.audit.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorBridgeContracts.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md`

Navigation-only context:

- `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md`

## Evidence reviewed

Repository evidence directly inspected for this audit:

- Suite-core helpers and registry surfaces:
  - `calculogic-validator/src/core/scoped-target-paths.logic.mjs`
  - `calculogic-validator/src/core/suite-scoped-snapshot-input.logic.mjs`
  - `calculogic-validator/src/core/validator-candidate-collection.logic.mjs`
  - `calculogic-validator/src/core/validator-candidate-policy.contracts.mjs`
  - `calculogic-validator/src/core/validator-candidate-policy.logic.mjs`
  - `calculogic-validator/src/core/validator-exit-code.logic.mjs`
  - `calculogic-validator/src/core/validator-registry.knowledge.mjs`
  - `calculogic-validator/src/core/validator-report-meta.logic.mjs`
  - `calculogic-validator/src/core/validator-runner.logic.mjs`
  - `calculogic-validator/src/core/validator-scopes.logic.mjs`
  - `calculogic-validator/src/core/source-snapshot.logic.mjs`
  - `calculogic-validator/src/core/cli/**`
- Naming runtime, wiring, CLI, bridge, registries, and tests:
  - `calculogic-validator/naming/src/**`
  - `calculogic-validator/naming/test/**`
- Tree runtime, wiring, contributors, registries, and tests:
  - `calculogic-validator/tree/src/**`
  - `calculogic-validator/tree/test/**`
- Host scripts and bins:
  - `calculogic-validator/scripts/validate-naming.host.mjs`
  - `calculogic-validator/scripts/validate-tree.host.mjs`
  - `calculogic-validator/scripts/validate-all.host.mjs`
  - `calculogic-validator/bin/**`
- Cross-suite tests:
  - `calculogic-validator/test/**`
- Command/package surface:
  - `package.json`
- Formula and bridge context:
  - `calculogic-validator/doc/ConventionRoutines/ValidatorSliceAndReportFormula.md`
  - `calculogic-validator/doc/Audits/validator-slice-formula-alignment.audit.md`
  - `calculogic-validator/doc/ConventionRoutines/ValidatorBridgeContracts.md`
  - `calculogic-validator/doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md`
  - `calculogic-validator/doc/Indexes/validator-docs.index.md`

## Executive summary

Naming and Tree already consume suite-core for the highest-risk shared mechanics: suite scope profiles, target resolution, scoped snapshot collection, path normalization, candidate policy mechanics where candidate filtering applies, report metadata helpers, exit-code derivation, registry selection, and runner composition. The largest remaining gaps are not semantic ownership violations. They are alignment gaps where current direct runnable paths still locally duplicate or bypass suite-core runner/report/metadata wrappers that the validator slice formula identifies as suite-core-owned.

Highest-ROI current implementation reality:

- Naming is more locally direct-runnable than Tree. It has a slice-owned CLI runner and slice-owned direct report builder, while `validate:all` uses suite-core runner wrapping.
- Tree direct CLI already uses the suite-core runner CLI and suite-core runner report wrapper, but the Tree host script still locally owns argument parsing and usage-line construction.
- Registry metadata exists for Naming and Tree report identity, command identity, runner status, bridge relationships, package-bin expectation, report-capture profile, and compatibility status, but runtime command/report code largely preserves literal current runtime truth instead of consuming registry metadata as the active source.
- Naming -> Tree bridge hardening from #596 / PR #597 is sufficient for the next behavior-preserving implementation slices around suite-core consumption. It clearly supports runner-staged provider/consumer expectations and no-silent-rederivation boundaries. Remaining bridge work is metadata/contract consumption and staging ergonomics, not a blocker for basic Naming/Tree suite-core alignment.
- Tree reasoning expansion remains explicitly deferred. Addressing extraction, Addressing runner registration, Addressing package bins, and Addressing -> Tree runtime handoff remain explicitly deferred.

## Naming current alignment classification

| Area | Current implementation reality | Classification | Notes |
| --- | --- | --- | --- |
| Scope profiles | Naming delegates scope vocabulary and profile lookup to suite-core via `listValidatorScopes`, `getValidatorScopeProfile`, and `DEFAULT_VALIDATOR_SCOPE`. | aligned | Naming owns no independent scope-profile registry. |
| Target resolution | Naming delegates repeatable target CLI parsing to suite-core and candidate collection delegates target resolution/filtering through suite-core collection helpers. | aligned | The direct CLI parser is local, but target argument mechanics are suite-core. |
| Source snapshots / candidate inputs | Naming candidate paths are collected through suite-core candidate collection, which uses suite-core scoped snapshot input packaging. | aligned | Naming adapts Naming-owned `reportableExtensions`, `reportableRootFiles`, and walk exclusions into the suite candidate contract. |
| Candidate policy helper usage | Naming uses suite-core candidate-policy creation and collection. | aligned | Naming keeps candidate value authority in Naming registries, which is correct slice ownership. |
| Report wrapping and report metadata | `validate:all` wraps Naming through suite-core runner report entries, but `validate:naming` uses a Naming-owned direct report builder for the whole direct report envelope. | report/report-capture gap | Current runtime truth is preserved, but direct report wrapper mechanics are duplicated locally. |
| Registry metadata / validator identity | Suite-core registry declares Naming report, command, package-bin, runner, bridge, capture, and compatibility metadata. Direct report/CLI code still uses local literals for `validatorId`, command usage, and direct report structure. | registry metadata gap | Metadata exists and is tested as an inspection surface, but it is not yet the active driver for direct report identity or command text. |
| Report-capture assumptions | Package scripts wrap Naming direct host commands with hardcoded capture prefixes. | report/report-capture gap | Current scripts match metadata expectations but are not generated or validated as the command source-of-truth. |
| CLI/direct script behavior | `validate-naming.host.mjs` and Naming CLI runner locally coordinate usage handling, config loading, source snapshot, direct report building, stdout, and exit code. | suite-core mechanics gap | Many mechanics call suite-core helpers, but the direct CLI orchestration is local rather than using the suite runner CLI. |
| Package script / bin expectations | Naming has repo-local scripts and a package bin. Registry metadata marks expected bin availability as true. | command/bin/package-surface gap | No runtime change recommended in this audit. |
| Test coverage for suite-core usage boundaries | Tests cover Naming default scope owner alignment, Naming scope contract, runtime input boundary, registry metadata, candidate collection compatibility, report registry metadata, runner metadata, report capture, bins, and cross-slice invariants. | mostly aligned | Coverage exists for many boundaries, but no focused test proves direct `validate:naming` report identity is sourced from registry metadata. |

### Naming gap classification

1. **suite-core mechanics gap** — direct Naming CLI orchestration still owns wrapper-level mechanics that could be delegated to the suite-core runner CLI in a behavior-preserving staged migration only if report parity is proven.
2. **registry metadata gap** — registry metadata is present, but direct Naming report identity and command text are still literal current runtime truth.
3. **report/report-capture gap** — direct Naming report envelope is slice-local while runner-visible Naming report entries are suite-core wrapped.
4. **command/bin/package-surface gap** — Naming has a package bin and package scripts; no direct problem, but command/bin expectations remain manually mirrored across package scripts, registry metadata, usage examples, and tests.

No Naming gap observed in filename parsing, semantic-name interpretation, semantic-family interpretation, Naming findings, Naming summaries, Naming registry value authority, or Naming bridge output semantics. Those remain correctly Naming-owned.

## Tree current alignment classification

| Area | Current implementation reality | Classification | Notes |
| --- | --- | --- | --- |
| Scope profiles | Tree direct CLI and runner paths use suite-core scope profile lookup and supported-scope usage helpers. Tree runtime preparation uses suite-core scoped snapshot input collection. | aligned | Tree owns no independent scope-profile registry. |
| Target resolution | Tree host script locally parses `--scope` and `--config`, but repeatable `--target` parsing and target filtering are suite-core. | mostly aligned | Remaining local parsing is command-surface mechanics, not Tree semantic interpretation. |
| Source snapshots / candidate inputs | Tree uses suite-core scoped snapshot inputs directly, not a candidate-policy layer. | aligned | Tree scans selected scoped paths rather than filename-extension candidates; no candidate value helper is required for current Tree behavior. |
| Candidate policy helper usage | Tree does not use candidate-policy helpers. | aligned / intentionally omitted | Tree currently reasons over scoped selected paths. Adding candidate filtering would be behavior-changing unless separately scoped. |
| Runner integration | `validate:tree` uses suite-core runner CLI and selects `tree-structure-advisor`; `validate:all` includes Tree through the same runner. | aligned | Tree direct report shape is runner report shape. |
| Report wrapping and report metadata | Tree direct CLI and `validate:all` are suite-core runner-wrapped, with source snapshot, tool version, config digest, and exit derivation through suite-core. | mostly aligned | Report identity still comes from registry entry `id` and `description`, not the nested metadata fields. |
| Registry metadata / validator identity | Suite-core registry declares Tree report, command, package-bin unavailable, runner, bridge, capture, and compatibility metadata. Runtime code does not consume all nested metadata fields as active drivers. | registry metadata gap | This mirrors Naming but is lower-risk because Tree already uses runner wrappers. |
| Report-capture assumptions | Package scripts wrap `validate-tree.host.mjs` with hardcoded capture prefixes. Registry metadata records matching expected pattern and prefix. | report/report-capture gap | Metadata is inspectable but not command-generation authority. |
| CLI/direct script behavior | Tree host script locally owns usage-line construction and argument parsing before invoking suite-core runner CLI. | command/bin/package-surface gap | This is smaller than Naming because report/run orchestration is suite-core-owned after parsing. |
| Package script / bin expectations | Tree has package scripts but no package bin. Registry metadata explicitly records expected bin unavailable. | aligned | No package-bin implementation recommended. |
| Test coverage for suite-core usage boundaries | Tests cover validate-tree script behavior, runner registry metadata, registry shape, report schema conformance, report capture scopes, suite scoped snapshots, cross-slice deterministic invariants, and Tree slice behavior. | mostly aligned | A focused test could prove Tree direct command usage remains aligned to registry command metadata, but this is lower priority. |

### Tree gap classification

1. **registry metadata gap** — registry metadata exists but does not drive all report identity and command text.
2. **report/report-capture gap** — capture command prefixes and script patterns are manually mirrored rather than consumed from registry metadata.
3. **command/bin/package-surface gap** — direct Tree host owns command usage and argument parsing surface, though runner/report execution is suite-core.
4. **deferred Tree reasoning gap** — Tree has substantial Tree-owned reasoning and shadow/replacement-planning internals. Those are not suite-core mechanics gaps; any expansion for folder distinctions, nesting, scatter, semantic home, structural home, or known-roots retirement remains deferred.

No Tree gap observed in placement interpretation, folder-kind reasoning, structural-home reasoning, semantic-home reasoning, Tree findings, Tree severity, or Tree summaries. Those remain correctly Tree-owned.

## Naming -> Tree bridge suite-core implications

The Naming -> Tree bridge hardening from #596 / PR #597 is sufficient for the next implementation slices that align Naming and Tree suite-core usage, with these boundaries preserved:

- Naming remains the provider of semantic-name and semantic-family interpretation.
- Tree remains the consumer of prepared Naming bridge observations for placement context.
- Tree drops incomplete bridge observations instead of deriving absent Naming-owned semantic-family meaning.
- Runner staging remains the current suite-core orchestration point for the Naming -> Tree bridge.
- Registry metadata records Naming as the provider and Tree as the consumer for `naming-semantic-family-bridge`.

Remaining bridge-related gaps:

| Gap | Classification | Recommendation |
| --- | --- | --- |
| Runner staging is hardcoded in `validator-runner.logic.mjs` rather than generated from bridge metadata. | bridge-contract gap | Near-term only if a behavior-preserving bridge-staging helper can preserve report and execution parity. |
| Bridge metadata exists but is not the active runtime driver for staging decisions. | registry metadata gap | Treat as a registry metadata consumption gap, not as a semantic bridge gap. |
| Direct Tree runs without the suite runner do not independently stage Naming evidence; current `validate:tree` does use the suite runner, so this is not a current command gap. | suite-core mechanics gap | No action unless a new direct non-runner Tree entrypoint is introduced. |
| Addressing -> Tree remains hybrid/deferred and should not be implemented under this child. | deferred Addressing gap | Keep deferred until an Addressing extraction/handoff parity issue is explicitly scoped. |

## Suite-core mechanics gaps

### Immediate mechanics gaps

1. **Naming direct CLI/report wrapper remains slice-local.**
   - Classification: suite-core mechanics gap; report/report-capture gap.
   - Expected change type if addressed: behavior-preserving, runtime implementation, report-affecting only if parity is not exact.
   - Constraint: do not change current report shape, report ids/descriptions, findings, summaries, severities, or exit-code behavior without a behavior-changing issue.

2. **Registry metadata is inspectable but not fully consumed.**
   - Classification: registry metadata gap.
   - Expected change type if addressed: behavior-preserving, runtime implementation, may be report-affecting if report identity wiring changes carelessly.
   - Constraint: use registry metadata only where parity is proven; do not let metadata become competing policy truth for Naming or Tree semantics.

3. **Report-capture profile metadata does not drive package scripts.**
   - Classification: report/report-capture gap; command/bin/package-surface gap.
   - Expected change type if addressed: docs/tests only first; runtime/package-surface affecting only in a later explicitly scoped issue.
   - Constraint: do not rename package scripts or prefixes for aesthetics.

4. **Tree host command parser remains local.**
   - Classification: command/bin/package-surface gap.
   - Expected change type if addressed: behavior-preserving, runtime implementation, command/package-surface affecting only if usage text or parser behavior changes.
   - Constraint: preserve current CLI behavior exactly unless a command behavior issue is opened.

### Non-gaps / correctly slice-owned boundaries

- Naming parsing, semantic-name interpretation, semantic-family interpretation, findings, summaries, registry value authority, and bridge output semantics are slice-owned and should not move to suite-core.
- Tree folder-kind interpretation, structural-home reasoning, semantic-home reasoning, placement evidence, whole-placement confidence, findings, severity, and summaries are slice-owned and should not move to suite-core.
- Tree use of structural-address snapshots is current implementation reality, not a reason to classify Addressing as suite-core or to implement Addressing extraction in this child.

## Behavior-preserving implementation recommendations

### Immediate / next child

1. **Migrate or wrap the Naming direct CLI through a suite-core-compatible direct-runner adapter, with exact report parity tests.**
   - Classification: suite-core mechanics gap; report/report-capture gap.
   - Expected: behavior-preserving; runtime implementation; report-affecting risk; not command/package-surface affecting if parity holds.
   - Required proof: `validate:naming` direct report JSON remains identical in shape, ids, descriptions, scope fields, filters, registry fields, counts, findings, source snapshot presence, config digest behavior, and exit-code behavior for representative scopes/targets.
   - Rationale: Naming is the largest remaining direct duplication of wrapper-level suite-core mechanics.

2. **Add focused metadata-consumption tests before runtime metadata consumption.**
   - Classification: registry metadata gap.
   - Expected: docs/tests only; behavior-preserving; not report-affecting; not command/package-surface affecting.
   - Required proof: registry metadata continues to match current package scripts, direct script paths, report-capture prefixes, package-bin availability, and bridge ids for Naming and Tree.
   - Rationale: hardens the inspection surface before it becomes a runtime driver.

### Near-term / same parent

3. **Introduce a suite-core report-identity lookup helper used by runner wrapping only after parity tests exist.**
   - Classification: registry metadata gap; report/report-capture gap.
   - Expected: behavior-preserving; runtime implementation; report-affecting risk.
   - Constraint: preserve current report `id`, `validatorId`, `description`, and mode values exactly.

4. **Evaluate consolidating Tree host parsing into a reusable suite-core parser surface.**
   - Classification: command/bin/package-surface gap.
   - Expected: behavior-preserving; runtime implementation; command/package-surface affecting risk.
   - Constraint: preserve accepted arguments, invalid-argument errors, help behavior, npm forwarding detection, and usage examples.

5. **Create a bridge-staging inspection helper without changing runner staging.**
   - Classification: bridge-contract gap; registry metadata gap.
   - Expected: docs/tests only first, then behavior-preserving runtime implementation if needed; not report-affecting if inspection-only.
   - Constraint: do not replace runner staging until bridge parity tests prove no behavior change.

## Behavior-changing implementation recommendations, if any

No behavior-changing implementation is recommended as an immediate child of #598.

Behavior-changing candidates that require a later explicit issue:

1. **Use registry metadata as the active generator for command/package/report-capture surfaces.**
   - Priority: Deferred / later parent.
   - Classification: command/bin/package-surface gap; report/report-capture gap; registry metadata gap.
   - Expected: behavior-changing risk; runtime implementation; report-affecting possible; command/package-surface affecting.
   - Reason to defer: package scripts, bins, prefixes, and report identity are externally visible.

2. **Change Tree to use candidate filtering.**
   - Priority: Not worth fixing yet.
   - Classification: behavior-changing alignment gap.
   - Expected: behavior-changing; runtime implementation; report-affecting.
   - Reason to defer: Tree currently reasons over scoped selected paths; candidate filtering would change scanned inputs.

3. **Replace Tree-local structural-address preparation with an Addressing-provided runtime handoff.**
   - Priority: Deferred / later parent.
   - Classification: deferred Addressing gap; bridge-contract gap.
   - Expected: behavior-changing risk; runtime implementation; report-affecting possible.
   - Reason to defer: requires Addressing extraction/handoff parity and explicit Addressing scope.

4. **Add a Tree package bin.**
   - Priority: Not worth fixing yet.
   - Classification: command/bin/package-surface gap.
   - Expected: command/package-surface affecting; runtime/package distribution affecting.
   - Reason to defer: registry metadata correctly records Tree package-bin unavailable; no direct suite-core usage reason requires a bin.

## Deferred Tree reasoning work

Explicitly deferred under this audit:

- folder distinction expansion
- nesting interpretation expansion
- scatter reasoning expansion
- semantic-home reasoning expansion
- structural-home reasoning expansion
- known-roots retirement
- whole-placement confidence changes
- Tree finding, severity, summary, and report behavior changes

These are Tree-owned interpretation topics. They are not suite-core mechanics gaps. A later Tree reasoning issue may use suite-core scoped input mechanics, but the reasoning itself must remain Tree-owned.

## Deferred Addressing work

Explicitly deferred under this audit:

- Addressing extraction
- Addressing runner registration
- Addressing package bins
- Addressing package scripts
- Addressing report-capture profiles
- Addressing -> Tree runtime handoff
- converting Addressing into pure suite-core
- converting Addressing into a standalone runnable validator slice before it has independent report value

Addressing remains a deferred hybrid/shared validator layer plus bridge-provider concern for this parent context. Tree-local structural-address preparation remains current implementation reality until an explicit Addressing handoff parity issue changes it.

## Not-worth-it-yet items

| Item | Classification | Reason |
| --- | --- | --- |
| Cosmetic command/package renames. | command/bin/package-surface gap | No direct suite-core usage reason; would create external churn. |
| Tree package bin creation. | command/bin/package-surface gap | Metadata intentionally records unavailable; no current distribution need. |
| Generic shared bucket or plugin system. | behavior-changing alignment gap | Low ROI and outside formula scope. |
| Moving Naming candidate value authority to suite-core. | slice-owned interpretation gap | Incorrect ownership; Naming owns reportable extension/root-file value authority. |
| Moving Tree placement policy to suite-core. | slice-owned interpretation gap | Incorrect ownership; Tree owns placement interpretation. |
| Adding Tree candidate filtering. | behavior-changing alignment gap | Would change Tree scanned inputs. |
| Making bridge staging fully metadata-driven before inspection tests. | bridge-contract gap | Higher risk than value until metadata parity tests exist. |

## Recommended next child issue(s)

### 1. Immediate / next child

**Title:** Align Naming direct report wrapper with suite-core mechanics under report parity.

- Priority: Immediate / next child.
- Gap classes: suite-core mechanics gap; report/report-capture gap; registry metadata gap.
- Expected: behavior-preserving; runtime implementation; report-affecting risk; not command/package-surface affecting if CLI surface is preserved.
- Scope: evaluate a suite-core-compatible direct-runner adapter or wrapper path for `validate:naming` while preserving direct report shape and exit behavior exactly.
- Required tests/checks: direct `validate:naming` parity for scope, target, config digest, registry metadata fields, source snapshot presence, findings, summaries, and exit policy.
- Non-scope: no report id/description changes, no report shape changes, no package script/bin changes, no Naming interpretation changes.

### 2. Near-term / same parent

**Title:** Harden validator registry metadata consumption tests for Naming and Tree command/report/capture surfaces.

- Priority: Near-term / same parent.
- Gap classes: registry metadata gap; report/report-capture gap; command/bin/package-surface gap.
- Expected: docs/tests only; behavior-preserving; not report-affecting; not command/package-surface affecting.
- Scope: prove registry metadata matches current scripts, bins, direct paths, report-capture prefixes, runner ids, and bridge ids before runtime consumption is expanded.
- Non-scope: no package script changes, no bin changes, no report shape changes.

### 3. Near-term / same parent

**Title:** Evaluate Tree host parser consolidation into suite-core CLI helpers without command behavior changes.

- Priority: Near-term / same parent.
- Gap classes: command/bin/package-surface gap; suite-core mechanics gap.
- Expected: behavior-preserving; runtime implementation; command/package-surface affecting risk.
- Scope: reduce local Tree command-surface mechanics while keeping runner/report behavior unchanged.
- Non-scope: no Tree reasoning changes, no Tree package bin, no report shape changes.

### 4. Deferred / later parent

**Title:** Plan Addressing -> Tree runtime handoff parity after bridge-provider extraction decisions.

- Priority: Deferred / later parent.
- Gap classes: deferred Addressing gap; bridge-contract gap.
- Expected: behavior-changing risk; runtime implementation; report-affecting possible.
- Scope: only after Addressing extraction/handoff parity criteria are accepted.
- Non-scope for #598: Addressing extraction, Addressing runner registration, Addressing package bins, Addressing package scripts, and Addressing -> Tree runtime handoff.

### 5. Not worth fixing yet

**Title:** Tree package bins and generic command/package renames remain out of scope for this parent.

- Priority: Not worth fixing yet.
- Gap classes: command/bin/package-surface gap.
- Expected: command/package-surface affecting if attempted.
- Reason: no direct suite-core usage reason outweighs churn.

## Verification record

Required verification for this audit was run on 2026-06-11:

- PASS — `git diff --check`
- PASS — `node --experimental-strip-types calculogic-validator/scripts/validate-naming.host.mjs --scope=validator --target calculogic-validator/doc/Audits`
- PASS — `node --experimental-strip-types calculogic-validator/scripts/validate-naming.host.mjs --scope=validator --target calculogic-validator/doc/Indexes/validator-docs.index.md`

No runtime test suite was required because this audit adds documentation only and does not add or modify tests.

Refs #599
Refs #598
Refs #590
Refs #596
Refs #597
