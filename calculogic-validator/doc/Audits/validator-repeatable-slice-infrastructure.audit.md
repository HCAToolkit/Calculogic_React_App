# Validator Repeatable Slice Infrastructure Audit

## Summary

This audit is the docs-only child output for issue #586 under parent #585. It inspects current implementation reality for suite-core infrastructure that a future validator slice should be able to repeat without inventing ad hoc command, scope, report, candidate, registry, or exit-code surfaces.

Direct answers:

1. Repeatable suite-core surfaces for every validator slice are: slice registration identity, runner dispatch, report-entry assembly, report metadata, report emission, report capture, summary pass-through, exit-code derivation, CLI usage/error output, scope profiles, target filtering, scoped snapshot input collection, candidate-policy contract/collection where a slice needs broad file candidates, package script/bin naming, health entrypoints, suite-owned registries, and tests that prove those seams stay deterministic.
2. Already-hardened enough: scope profiles and scoped snapshot helpers, target parsing/filtering for npm runner scripts, candidate-policy contract and collection helper, report-first stdout/stderr behavior for current suite CLIs, exit-code derivation through the builtin exit-policy registry, report metadata helpers, and the report-capture utility mechanics.
3. Under-hardened: validator registry metadata, registry-to-command/report identity alignment, bin/package script symmetry for Tree and `--target`, registry-declared slice dependency/bridge metadata, report profile/report-capture naming metadata, and compatibility tests proving that a newly registered slice can fit the pattern without bespoke runner edits.
4. Stable mechanics that should remain code-owned: runner dispatch mechanics, staged bridge execution mechanics, report assembly mechanics, scope/target filtering mechanics, candidate collection mechanics, stable hashing, source snapshot capture, stdout/stderr emission mechanics, and exit-code derivation mechanics.
5. Policy/metadata that should move toward suite-core registries: richer validator registry metadata, scope-profile descriptions currently hardcoded in the loader, command/bin/report-prefix metadata, report-profile metadata if more slices need it, and possibly exit-code policy shape/coverage metadata. Slice interpretation policy should not move to suite-core.
6. npm command names mostly follow a consistent `validate:<slice-or-all>` and `report:<slice-or-all>:<scope>` pattern, but bin names and script coverage are not fully aligned: Naming has a package bin and npm command; Tree has an npm command but no package bin; direct `calculogic-validate` lacks the npm runner's repeatable `--target` surface.
7. Package scripts, bins, direct scripts, and docs are aligned with the repo-local validator workflow as the current working assumption, but there are visible asymmetries between npm scripts, package bins, and documentation for future slices.
8. Report contracts, report metadata, report capture, summary pass-through, and exit-code derivation are reusable enough for current slices, but still under-inspectable as registry-declared slice metadata/profile contracts.
9. The current validator registry makes slice registration deterministic at a minimal level, but not inspectable enough for future slices because `id`, `description`, and `run` are the only declared fields.
10. Scope, target, and candidate helpers are clearly slice-repeatable after #579: the candidate lane hardened the suite-owned contract/helper while preserving Naming-owned value authority.
11. Docs/specs are mostly aligned with actual repeatable infrastructure, especially suite contracts and shared-helper inventory, but they describe target architecture more clearly than the current registry metadata can enforce.
12. Highest-ROI first implementation slice: validator registry metadata hardening, without runtime behavior changes.

Recommendation: **implement validator registry metadata hardening first**. The registry is the central suite-core surface that future slices will touch for registration, runner dispatch, report identity, command identity, bridge/dependency visibility, and command/report naming alignment. The next child issue should add data-only metadata and shape tests while preserving runtime behavior.

This audit does not change runtime behavior, package scripts, bins, registries, loaders, report shape, findings, summaries, severities, exit-code behavior, Naming interpretation, or Tree interpretation.

## Current repeatable surfaces

Current implementation reality includes these repeatable suite-core surfaces:

- **Validator registry / slice registration:** `VALIDATOR_REGISTRY` registers `naming` and `tree-structure-advisor` with `id`, `description`, and `run` hooks. The list/getter helpers provide deterministic selection by id.
- **Runner dispatch:** `runValidatorRunner(...)` resolves selected validator ids, runs selected registry entries, stages Naming when Tree needs the naming semantic-family bridge, and emits a composed runner report.
- **Report-entry assembly:** runner report entries are assembled from registry identity plus slice result fields; `summary.counts` is lifted to `counts`, the rest of summary is passed through, and optional `meta` is preserved.
- **Report contract:** the suite report contract documents the runner envelope and per-validator entry fields with pass-through summary/finding/meta areas.
- **Report metadata:** helper functions provide validator package version, stable stringify, sha256 digest, and config digest.
- **Exit-code derivation:** suite-core derives exit codes from flattened findings through builtin exit-policy data.
- **Scope profiles:** suite-core owns scope profile loading and current scope vocabulary (`repo`, `app`, `docs`, `validator`, `system`).
- **Target filtering:** suite-core normalizes, resolves, validates, dedupes, sorts, and applies repeatable target filters.
- **Scoped snapshot input:** suite-core collects in-scope files from scope profiles, includes root files, applies walk exclusions/dot-directory behavior, and returns selected paths and target descriptors.
- **Candidate policy/collection:** suite-core normalizes candidate extensions/root files/walk exclusions and collects candidate paths through scoped snapshot inputs.
- **CLI helper area:** suite-core owns report stdout emission, exit-code assignment, usage/error formatting, scope usage helpers, repeatable target parsing, and runner-style CLI orchestration.
- **Report capture utility:** `calculogic-report-capture` captures command output with deterministic prefix/timestamp naming, retention, pruning, verification, and summary utilities.
- **Package scripts and bins:** repo-root scripts expose `validate:naming`, `validate:all`, `validate:tree`, `health:validator`, scope-specific report capture scripts, validator-internal target presets, and report utilities; package bins expose full-suite, Naming, and health entrypoints.
- **Health surfaces:** health is currently Naming-centered through the package health bin and host script.
- **Tests:** current tests cover candidate collection compatibility, scoped snapshot behavior, exit policy, report metadata, target parsing/integration, package/report capture behavior, Naming registries, and Tree registries/runtime logic.

## Already-hardened surfaces

### Scope and target surfaces

Scope and target mechanics are hardened enough for future slices. Suite-core reads builtin scope profiles, exposes deterministic list/get helpers, validates selected scopes in runner-style CLIs, resolves targets inside the repository root, rejects missing or escaping targets, dedupes targets by real path, and sorts selected paths. This is current runtime truth for suite-owned path-boundary mechanics.

The main remaining issue is not mechanics. The remaining issue is metadata inspectability: scope profile descriptions are still loader-hardcoded compatibility values instead of payload-owned descriptions, so the registry payload is not fully self-describing.

### Candidate helper surfaces

Candidate collection is hardened enough as a repeatable suite-core mechanics layer after #579 / #578 / #581 / #583. Suite-core owns the candidate-policy contract and deterministic helper. Naming owns `reportableExtensions`, `reportableRootFiles`, walk-exclusion values, config overlay, semantic interpretation, findings, summaries, and report behavior. Tree remains unchanged and is not forced through the candidate helper.

This is the correct current split:

- suite-core owns collection mechanics;
- slices provide candidate policy values when they need that helper;
- slices retain interpretation authority.

### Runner-style CLI scaffolding

`validate:all` and `validate:tree` already share `runValidatorRunnerCli(...)`, repeatable `--target` parsing, scope usage helpers, report stdout emission, and report-derived exit code application. This is hardened enough for runner-style CLIs.

Naming remains a single-slice CLI with slice-owned parsing and report builder, but it still reuses suite-core report output, usage/error output, report metadata, source snapshot, exit-code derivation, target parsing through Naming args, and candidate collection. That is acceptable because Naming has slice-specific config/strict/report needs.

### Report-first behavior and report capture mechanics

Current suite docs and runtime agree that successful validator report runs emit JSON to stdout, set report-derived exit status after emission, and reserve stderr for usage/config/runtime errors. Report capture can wrap npm scripts or direct node commands without needing slice-specific capture logic. Capture mechanics are stable and should stay utility-owned rather than slice-owned.

### Exit-code derivation mechanics

Exit-code derivation is repeatable enough for current slices. Suite-core flattens runner report findings and applies builtin exit policies. The policy payload is already in a suite registry. The mechanics should remain code-owned; policy rows can remain data-owned.

## Under-hardened surfaces

### Validator registry metadata

The registry is the highest-leverage under-hardened surface. It currently declares only:

- `id`
- `description`
- `run`

That is deterministic enough to run current slices, but not inspectable enough for future slices. A future slice still lacks one obvious registry-owned place to see:

- canonical slice id;
- report identity fields;
- CLI command/script/bin naming expectations;
- default inclusion in `validate:all`;
- whether the slice is directly runnable, runner-only, or both;
- whether the slice has package bin coverage;
- whether it contributes bridge data to another slice;
- whether it consumes bridge data from another slice;
- report-profile/capture prefix metadata;
- test expectations for compatibility.

The current Tree bridge is a concrete signal: runner code knows about `tree-structure-advisor`, `naming`, and `namingSemanticFamilyBridge` by id-specific branches. That staged execution is legitimate current runtime truth, but the dependency is not visible as registry metadata.

### Command/bin symmetry

Repo-root npm commands follow a clear pattern:

- `validate:naming`
- `validate:tree`
- `validate:all`
- `report:naming:<scope>`
- `report:tree:<scope>`
- `report:all:<scope>`

But package bins are not symmetric:

- `calculogic-validate` exists for full-suite validation;
- `calculogic-validate-naming` exists for Naming;
- no `calculogic-validate-tree` bin exists;
- `calculogic-validate` does not expose repeatable `--target`, while `validate:all` does;
- health is package-bin exposed as `calculogic-validator-health`, but the health implementation is Naming-centered.

This does not require immediate behavior changes, but it weakens future slice repeatability because command coverage cannot be inferred from registry metadata.

### Report metadata / profile inspectability

The report envelope and assembly mechanics are usable, but report profiles are not registry-declared. Current report capture prefixes are encoded in npm scripts (`naming-*`, `validate-tree-*`, `validate-all-*`) rather than a suite-core metadata surface. This is acceptable for current runtime truth but under-hardened for future slices because adding a slice would require touching package scripts/docs by pattern memory rather than by inspectable metadata.

### Compatibility tests for new slice fit

Existing tests prove current slices and helpers. They currently do not include a small fake/fixture slice that proves a future slice can register with suite-core, be selected by id, produce a report entry, pass through summary/meta, participate in exit-code derivation, and expose command/report metadata without bespoke runner edits. That gap matters more than generic plugin architecture because the project wants future slices to be boring and deterministic.

### Docs/spec alignment gaps

Docs accurately describe suite-owned helper boundaries and current report-first behavior. The gap is that docs now express a clearer target architecture than the current validator registry can encode. The docs say the suite is extensible through registry/runner composition, but the registry metadata is too thin to serve as the main inspection point for future slice registration.

## Hardcoded mechanics vs hardcoded policy

### Stable mechanics that should remain code-owned

These hardcoded mechanics are stable and should stay code-owned:

- selecting all registered validators when no ids are provided;
- validating unknown selected validator ids;
- preserving registry order for runner dispatch;
- staging Naming before Tree when Tree needs the bounded naming semantic-family bridge;
- converting slice results into runner report entries;
- lifting `summary.counts` to `counts` and passing other summary keys through;
- preserving optional `meta` from slice results;
- computing `startedAt`, `endedAt`, and `durationMs`;
- looking up tool version from package metadata;
- stable stringification and sha256 digest mechanics;
- resolving targets, rejecting escaped targets, deduping by real path, and sorting;
- walking include roots and including root files;
- applying walk exclusions and dot-directory behavior;
- candidate matching by extension/root-file token;
- report JSON stdout emission and stderr usage/error separation;
- deriving an exit code from flattened findings and policy rows;
- report-capture timestamping, prefix sanitization, pruning, and child-process capture.

These are mechanics because they define deterministic execution behavior, not slice policy values.

### Inspectable/extensible policy or metadata that should move toward registry ownership

These hardcoded values are policy/metadata candidates:

- validator registry metadata beyond `id`/`description`/`run`;
- slice command metadata (`validate:<slice>`, bin availability, direct script path, report prefixes);
- default validator inclusion metadata for `validate:all`;
- bridge dependency/contribution metadata for Naming → Tree;
- report identity/profile metadata used by runner entries and capture scripts;
- scope profile descriptions currently hardcoded in the loader;
- preferred scope display order if it needs to differ from registry order;
- health command metadata if health grows beyond Naming-owned checks;
- exit-policy shape/semantic labels if future modes need inspectable policy documentation generated from data.

### Slice-owned interpretation that should not move to suite-core

These should remain slice-owned:

- Naming role, category, status, case-rule, semantic-family, special-case, missing-role, finding-policy, reportable extension, reportable root-file, summary-bucket, overlay, and registry-state interpretation;
- Tree repo-shape, folder-kind, structural-home, semantic-home, placement evidence, occurrence classification, signal policy, and structural-address interpretation;
- any future slice's semantic findings, classification vocabulary, and interpretation registries.

Suite-core can carry metadata that says a slice has command/report/bridge surfaces. It should not carry the slice's semantic policy.

## Command and bin naming alignment

Command naming is mostly aligned for repo-local npm usage and partially aligned for package-bin usage.

Aligned patterns:

- root npm validation commands use `validate:<slice-or-all>`;
- report capture commands use `report:<slice-or-all>:<scope>`;
- validator-internal Naming presets use `validate:naming:validator:<target-preset>` and `report:naming:validator:<target-preset>`;
- direct scripts use `validate-<slice-or-all>.host.mjs` for the implemented direct host scripts;
- full-suite and Naming package bins use `calculogic-validate` and `calculogic-validate-naming`.

Under-aligned patterns:

- Tree has `npm run validate:tree` and `scripts/validate-tree.host.mjs`, but no `calculogic-validate-tree` package bin.
- `calculogic-validate` direct bin supports `--scope`, `--validators`, `--config`, and `--strict`, but does not support the repeatable `--target` surface supported by `validate:all`.
- Report capture prefixes mix `naming-*`, `validate-all-*`, and `validate-tree-*`; this is understandable but not encoded as slice metadata.
- Health command naming is suite-looking (`health:validator`, `calculogic-validator-health`) while current health implementation delegates to Naming health checks.
- README direct invocation still highlights Tree as a direct script rather than a package bin, which matches current runtime truth but reveals the asymmetry.

Conclusion: command/bin names are consistent enough for current repo-local use, but not hardened enough for future slice repeatability. The next implementation should not change command names first; it should make expected command/bin metadata visible in the validator registry so any later command alignment is deliberate.

## Report and exit-code repeatability

Report and exit-code surfaces are reusable for any slice at the mechanics level.

Reusable current runtime truth:

- runner reports have a suite-level envelope with version, mode, optional scope, `validatorId: "runner"`, optional tool/config metadata, source snapshot, timing metadata, and `validators[]` entries;
- each validator entry receives registry id/description, scope, total files scanned, optional counts, summary pass-through, findings, and meta;
- Naming single-slice reports use a slice-owned report builder but suite-owned metadata, source snapshot, output, and exit-code helpers;
- `validate:all` and `validate:tree` use runner-style report output;
- exit code policy is suite-owned and data-backed by `exit-policy.registry.json`;
- report capture is command-agnostic and can wrap any slice command.

Under-hardened current implementation reality:

- report entry identity is derived from minimal registry fields, not a richer report metadata object;
- summary shape is only loosely contracted as `counts` plus pass-through keys, so slices can fit the report but there is no registry-level declaration of expected summary/meta shape;
- report capture profiles/prefixes live in package scripts instead of an inspectable metadata layer;
- package bin direct full-suite entry lacks `--target`, so direct bin report capture cannot fully mirror npm runner target workflows;
- Tree's selected runner path is reusable but still represented by a validator id branch rather than declared bridge metadata.

This is good enough to avoid report-shape work as the first slice. It is not good enough to skip registry metadata hardening.

## Registry and metadata repeatability

Current suite-core registries:

- `scope-profiles.registry.json` owns scope profile payloads.
- `exit-policy.registry.json` owns exit-code policy rows.
- `validator-registry.knowledge.mjs` owns runtime slice registration.

Current implementation reality for scope and exit registries is stronger than validator registration:

- scope registry is data-backed and loader-normalized, although descriptions remain hardcoded compatibility metadata;
- exit policy is data-backed and runtime-matched by predicates;
- validator registry is code-backed and minimal.

The current validator registry is deterministic enough to run selected validators and list ids, but not inspectable enough for repeatable slice registration. It should become the first metadata hardening target because every future slice will need a stable answer for identity, command naming, report profile, default runner inclusion, and any bridge relationships.

The implementation should avoid a universal plugin architecture. The right first slice is a bounded metadata object on existing registry entries, plus tests that prove the current entries are valid and behavior remains unchanged.

## Docs/spec alignment

Aligned docs/specs:

- `ValidatorSuite-Contracts-And-Modes.md` accurately states report-first behavior, shared CLI report emission, current exit-code policy, suite-owned scope boundary, shared scoped snapshot/input helper, report-envelope boundary, and determinism rules.
- `ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md` accurately lists currently real suite-owned helper areas: CLI helpers, scoped snapshot input, candidate policy/collection, exit policy derivation, report meta/source snapshot.
- `ValidatorHelperAreas-And-Reuse-Conventions.md` correctly keeps suite-core helpers bounded and warns against generic catch-all helper areas.
- `ValidatorLoaderConverterRuntimeOwnership-Contract.md` correctly separates policy-data loaders/converters from runtime mechanics and warns against flattening every registry behind one universal state layer.
- `calculogic-validator/README.md` documents repo-root npm workflows, report capture, direct invocation, scope/target usage, config behavior, and report envelopes.

Under-aligned docs/specs:

- README's projected package layout and the suite contract describe an extensible registry/runner future more clearly than the current registry metadata supports.
- The docs can describe command/report patterns only prose-first; there is no registry metadata that can be inspected or tested against those patterns.
- Health docs/commands look suite-level, while current health implementation is Naming-centered.
- Scope profile descriptions are treated as runtime descriptions but are not payload-owned in the registry file.

Docs-only alignment is not the highest-ROI next step because the docs are already close; the main gap is implementation metadata inspectability.

## Option comparison

| Option | ROI | Risk | Behavior-change risk | Ownership clarity | Future slice repeatability | Implementation size | Testability | Chance of over-abstraction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A. validator registry metadata hardening first | Highest. Central surface used by every future slice. | Low if data-only and shape-tested. | Low; preserve `run`, ids, order, and report shape. | High; suite owns suite-facing metadata, slices keep semantics. | Highest; makes registration, commands, reports, and bridges inspectable. | Small to medium. | High with registry shape and compatibility tests. | Low if bounded to current entries and declared metadata only. |
| B. npm/bin command naming alignment first | Medium. Visible asymmetries exist. | Medium; command changes can break users/scripts. | Medium. Adding bins is low, changing scripts is higher. | Medium; may encode policy before registry metadata exists. | Medium; helps ergonomics but not registration semantics. | Small to medium. | Medium with help/bin/script tests. | Medium; commands may be overfit before metadata model. |
| C. report contract / report metadata hardening first | Medium-high. Reports are central. | Medium; schema/report shape changes are sensitive. | Medium-high unless docs/tests only. | Medium; may duplicate registry identity decisions. | Medium-high; helps all slices but is downstream of identity metadata. | Medium. | Medium-high. | Medium; risk of schema abstraction before slice metadata is settled. |
| D. exit-code/report policy registry cleanup first | Medium. Exit policy already has registry data. | Low-medium. | Low if policy rows unchanged; higher if semantics move. | Medium; suite-owned policy already clear. | Medium; useful but not the main blocker for adding slices. | Small-medium. | High for unchanged policy tests. | Medium; mode policy could over-expand prematurely. |
| E. docs/spec alignment only | Low-medium. Docs are mostly aligned. | Low. | None. | Medium in prose only. | Low; future slice still lacks metadata/tests. | Small. | High via naming/doc checks. | Low. |
| F. defer implementation because current surfaces are already good enough | Low. Candidate/scope helpers are good, registry is not. | Low short-term, high long-term drift. | None. | Low; accidental patterns remain. | Low; future slices still require pattern archaeology. | None. | None. | None now, but future ad hoc abstraction risk rises. |

Best option: **A. validator registry metadata hardening first**.

## Recommended first implementation slice

Implement a bounded validator registry metadata hardening slice under parent #585.

### What should change

Add a data-only metadata layer to each existing `VALIDATOR_REGISTRY` entry, likely inside `calculogic-validator/src/core/validator-registry.knowledge.mjs`, with a small normalizer/shape helper if needed. Candidate metadata fields should be implementation-ready but bounded to current runtime truth, for example:

- `id`
- `description`
- `kind` or `sliceKind` (`slice` / `runner-composed` is not needed on entries if all entries are slices; avoid unused taxonomy)
- `defaultRunnerIncluded: true`
- `reportIdentity` with current `validatorId` / description expectations
- `commands` with repo npm command, direct script path, package bin if present, and report capture prefix pattern if present
- `supportsTargets` for current command surfaces
- `bridge` metadata for Tree consuming Naming semantic-family bridge and Naming contributing it, without changing bridge runtime behavior
- optional `health` metadata only where current runtime truth supports it

Add tests that validate:

- every registry entry has required metadata;
- registry ids remain unique and sorted helper output remains unchanged;
- current registered ids remain `naming` and `tree-structure-advisor`;
- `getValidatorById(...)` behavior remains unchanged;
- current report entries from runner still preserve ids/descriptions/report shape;
- current bridge metadata matches existing staged Naming → Tree behavior, but does not drive behavior yet;
- command metadata matches existing package scripts/bin/direct scripts without changing them.

### What should not change

Do not change:

- runtime dispatch behavior;
- registry ids;
- report shape;
- summary shape;
- findings or severity behavior;
- exit-code behavior;
- package scripts or bins in the first metadata slice;
- Naming candidate-policy value authority;
- Tree interpretation policy;
- the Tree bridge runtime branch;
- report capture behavior;
- scope/candidate helpers.

### Likely touched files/surfaces

Likely touched:

- `calculogic-validator/src/core/validator-registry.knowledge.mjs`
- new or existing `calculogic-validator/test/*validator-registry*.test.mjs`
- possibly `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md` if metadata fields need a short canonical note
- possibly `calculogic-validator/doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md` if the registry metadata becomes a listed reusable surface

Avoid touching package scripts, bins, report contracts, exit policy, candidate helpers, Naming registries, or Tree registries unless tests reveal a narrow docs/spec mismatch.

### Runtime behavior that must remain unchanged

- `validate:naming`, `validate:tree`, and `validate:all` outputs must remain behaviorally identical aside from timestamps/source snapshot volatility.
- `listRegisteredValidators()` must still return the current ids.
- `getValidatorById('naming')` and `getValidatorById('tree-structure-advisor')` must still return runnable entries.
- `validate:tree` must still stage Naming bridge data through current runner mechanics.
- Exit-code policy must remain unchanged.

## Acceptance criteria for the first implementation

A follow-up child issue for validator registry metadata hardening should be accepted only if:

1. Registry entries expose bounded suite-facing metadata for current slice id, command/report surfaces, runner inclusion, and bridge relationships.
2. Metadata is current implementation reality, not target architecture wish-list.
3. Shape tests fail if a new slice omits required metadata.
4. Compatibility tests prove current registry ids, report entries, and runner behavior remain unchanged.
5. Command metadata tests compare against existing `package.json`, `calculogic-validator/package.json`, direct script paths, and report prefix patterns without changing them.
6. Bridge metadata is inspectable but not behavior-driving in the first pass.
7. No runtime behavior, report shape, exit behavior, package scripts, bins, Naming interpretation, or Tree interpretation changes.
8. The PR body records exact verification commands and outcomes.

## Later / not worth it yet

Not worth doing before registry metadata hardening:

- adding `calculogic-validate-tree` or changing package bins;
- changing `calculogic-validate` to support `--target`;
- creating a universal plugin architecture;
- making report capture generated from registry metadata;
- creating a generic shared registry-state layer for suite-core;
- moving Naming reportable extension/root-file values to suite-core;
- moving Tree structural policy to suite-core;
- changing report shape or summary shape;
- changing exit-code behavior or adding broader suite modes;
- broad docs/spec rewrites.

Potential later slices after registry metadata hardening:

1. command/bin naming alignment, if metadata tests expose an accepted command surface plan;
2. report profile/report capture metadata cleanup, if command metadata proves useful;
3. scope profile description payload migration, if registry self-description becomes a repeated need;
4. exit policy metadata cleanup, if suite mode work resumes;
5. health surface alignment, if health grows beyond Naming-specific checks.

## Parent #585 recommendation

Parent #585 should remain open after this audit long enough to create the next implementation child for **validator registry metadata hardening**. After that implementation child is accepted or explicitly queued, parent #585 can be summarized with:

- current runtime truth: scope, target, candidate, report-output, report-meta, report-capture, and exit-code mechanics are already sufficiently repeatable for current slices;
- current implementation reality: validator registry metadata and command/bin/report identity alignment remain under-hardened;
- staged implementation path: harden registry metadata first, then use that metadata to decide whether command/bin/report-profile alignment is worth a separate child;
- not current runtime truth: no universal plugin architecture, no suite-core ownership of Naming/Tree interpretation policy, no package-consumer invocation model decision, and no report/exit behavior migration.

Use `Refs #586`, `Refs #585`, and `Refs #579` in PR and parent notes. Do not use closing keywords; the human owner should close #586 and #585 manually after review.

## Evidence

### Issue and PR context reviewed

- #575 identified suite-core scope profiles, target resolution, scoped target filtering, scoped snapshot input packaging, and shared candidate collection as ownership pressure areas.
- #578 / PR #580 added the suite-core candidate-policy contract and collection helper.
- #581 / PR #582 migrated Naming candidate collection to the suite-core helper while preserving Naming value authority.
- #583 / PR #584 concluded that `reportableExtensions` and `reportableRootFiles` should remain Naming-owned current runtime truth.
- #585 is the parent issue for assessing repeatable validator-slice infrastructure hardening.
- #586 is this audit-only child issue.

### Files and surfaces inspected

Required inspection targets were reviewed across:

- `package.json`
- `calculogic-validator/package.json`
- `calculogic-validator/README.md`
- `calculogic-validator/src/index.mjs`
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
- `calculogic-validator/src/core/cli/**`
- `calculogic-validator/src/registries/**`
- `calculogic-validator/scripts/**`
- `calculogic-validator/bin/**`
- `calculogic-validator/tools/report-capture/**`
- `calculogic-validator/test/**`
- `calculogic-validator/naming/src/**`
- `calculogic-validator/naming/test/**`
- `calculogic-validator/tree/src/**`
- `calculogic-validator/tree/test/**`
- `calculogic-validator/doc/**`

### Concrete evidence map

- Root package scripts expose repo-local validator workflows and report capture commands in `package.json`.
- Validator package exports and bins expose suite-core, registry, scopes, Naming, Tree, full-suite, Naming-only, and health surfaces in `calculogic-validator/package.json`.
- `calculogic-validator/src/index.mjs` exports runner, registry, and report contract surfaces.
- `calculogic-validator/src/core/validator-registry.knowledge.mjs` registers only `id`, `description`, and `run`, with id list/get helpers.
- `calculogic-validator/src/core/validator-runner.logic.mjs` owns selected-validator resolution, report-entry assembly, runner envelope, and current Naming → Tree staged bridge mechanics.
- `calculogic-validator/src/core/validator-report.contracts.mjs` documents the current runner report contract and pass-through summary/meta areas.
- `calculogic-validator/src/core/validator-report-meta.logic.mjs` owns tool-version lookup, stable stringify, sha256, and config digest helpers.
- `calculogic-validator/src/core/validator-exit-code.logic.mjs` owns findings-to-exit-code derivation against builtin exit policies.
- `calculogic-validator/src/registries/_builtin/exit-policy.registry.json` owns current exit policy rows.
- `calculogic-validator/src/core/validator-scopes.logic.mjs` loads builtin scope profiles, owns default scope, and currently hardcodes compatibility descriptions/display-related metadata.
- `calculogic-validator/src/registries/_builtin/scope-profiles.registry.json` owns builtin scope profile include roots/root files.
- `calculogic-validator/src/core/scoped-target-paths.logic.mjs` owns target normalization, validation, dedupe, sorting, scope predicates, and target filtering.
- `calculogic-validator/src/core/suite-scoped-snapshot-input.logic.mjs` owns suite scoped path collection and selected-path packaging.
- `calculogic-validator/src/core/validator-candidate-policy.contracts.mjs`, `validator-candidate-policy.logic.mjs`, and `validator-candidate-collection.logic.mjs` own candidate policy normalization, matching, and deterministic collection mechanics.
- `calculogic-validator/src/core/cli/**` owns repeatable runner-style CLI scaffolding, usage/output helpers, scope usage helpers, and target parsing.
- `calculogic-validator/scripts/validate-all.host.mjs` uses suite-core runner CLI scaffolding and supports repeatable `--target`.
- `calculogic-validator/scripts/validate-tree.host.mjs` uses suite-core runner CLI scaffolding and supports repeatable `--target`.
- `calculogic-validator/scripts/validate-naming.host.mjs` delegates to Naming CLI while using suite-core npm-argument forwarding detection and shared helpers through the Naming CLI runner.
- `calculogic-validator/bin/calculogic-validate.host.mjs` exposes full-suite package-bin behavior but does not currently expose repeatable `--target`.
- `calculogic-validator/bin/calculogic-validate-naming.host.mjs` exposes Naming package-bin behavior.
- `calculogic-validator/bin/calculogic-validator-health.host.mjs` exposes suite-looking health behavior that currently delegates to Naming health.
- `calculogic-validator/tools/report-capture/**` owns command-agnostic output capture, filename prefix/timestamp mechanics, retention, pruning, verification, and summary utilities.
- `calculogic-validator/naming/src/**` shows Naming retains semantic interpretation, registry-state ownership, CLI/report builder ownership, health, and candidate value authority while consuming suite helpers.
- `calculogic-validator/tree/src/**` shows Tree retains structural interpretation and consumes runner-scoped/staged bridge behavior rather than being forced through candidate collection.
- `calculogic-validator/test/**`, `calculogic-validator/naming/test/**`, and `calculogic-validator/tree/test/**` prove current slice/helper behavior but currently do not prove a fixture future slice can register without bespoke runner edits.
- `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md` and `ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md` document the suite-owned boundaries that this audit treats as current authority.
