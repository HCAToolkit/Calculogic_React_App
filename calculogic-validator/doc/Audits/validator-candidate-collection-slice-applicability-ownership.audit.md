# Validator Candidate Collection and Slice Applicability Ownership Audit

## Summary

This audit is an inspection-only child output for issue #576 and parent issue #575. It audits current runtime truth for validator candidate collection, reportable file policy, scope/target handling, and slice applicability ownership. It does not move runtime behavior, registries, loaders, report shape, severity, exit-code behavior, package scripts, or validator slice ownership.

Key findings:

- Suite-core already owns scope profiles, scope profile loading, target resolution, target filtering, scoped snapshot input packaging, report metadata helpers, source snapshot metadata, report contract shape, exit-code derivation, validator registry dispatch, and shared CLI runner mechanics.
- Suite-core owns filesystem walking mechanics for the Tree scoped-input path through `collectSuiteScopedSnapshotInputs(...)`, but it currently walks all files inside scope roots and does not expose a named broad validator candidate policy contract.
- Naming currently owns a separate repository walk that combines walk exclusions with `reportableExtensions` and `reportableRootFiles` before applying suite-core scope/target filters. That makes current Naming reportability a mixed seam: part Naming applicability, part broad validator candidate filtering, and part duplicated walk mechanics.
- Tree currently consumes suite-core scoped snapshot inputs and owns structural interpretation, occurrence evidence, repo-shape policy, boundary/drift reasoning, and Tree contributor findings. Tree does not currently duplicate extension/root-file reportability policy, but future slices would likely duplicate Naming-like candidate allowlists if suite-core never defines a candidate contract.
- Best ROI path: **Option C**, split suite-core candidate policy from slice-owned applicability/interpretation. Do this as a staged implementation path after parent #575 closes: first document/add a suite-core candidate contract and compatibility bridge without behavior changes, then migrate slice adapters in a later narrow issue.

Short answers to the required questions:

1. Suite-core already cleanly owns scope profiles/loading, target resolution/filtering, selected path packaging for Tree, target descriptor packaging, source snapshot metadata, report metadata helpers, report contract shape, exit-code derivation, validator registry dispatch, and shared CLI runner/target helpers.
2. Suite-core owns walking and scoped snapshot packaging but does not yet expose a strong enough candidate-file contract for slices because Tree gets all scoped files while Naming performs separate reportability filtering during its own walk.
3. Naming-owned semantic/applicability policy includes naming roles, special cases, semantic-name case rules, semantic-family interpretation, missing-role interpretation, finding policy, summary buckets, and the decision to classify a selected path as canonical/deprecated/unknown/missing/legacy.
4. Naming-owned broad-candidate-looking policy includes `reportableExtensions`, `reportableRootFiles`, and the Naming-local filesystem walk/exclusion flow used only to decide which files are eligible before naming interpretation.
5. Tree or future slices would likely duplicate extension/root filename candidate allowlists, walk exclusions, dot-directory handling, selected-path preparation, and filter metadata if they need a narrowed file population rather than all scoped files.
6. `reportableExtensions` is better understood as **split**: suite-core should own a broad validator candidate extension policy/contract, while Naming should own narrower applicability over those candidates only when extension semantics affect Naming interpretation.
7. `reportableRootFiles` is better understood as **split**: suite-core should own broad root-file inclusion mechanics/policy, while Naming should own any Naming-specific special interpretation of root files.
8. The next implementation should add a suite-core candidate contract first, not immediately move behavior. Document ownership and provide a compatibility bridge before runtime migration.
9. The smallest high-ROI implementation slice after #575 closes is a suite-core candidate-policy contract plus tests that reproduce current Naming candidate output and current Tree selected-path behavior without changing reports.

## Current suite-core ownership

### Scope profiles and scope loading

Current runtime truth: suite-core owns the builtin scope profile payload at `calculogic-validator/src/registries/_builtin/scope-profiles.registry.json`, including `app`, `docs`, `repo`, `system`, and `validator` profiles. The runtime loader in `validator-scopes.logic.mjs` validates and normalizes that payload, expands legacy system compatibility patterns through `ROOT_APP_FILES`, exposes `DEFAULT_VALIDATOR_SCOPE`, and returns cloned profiles to callers.

Ownership classification: **suite-core-owned and already canonical**.

### Target resolution and target filtering

Current runtime truth: suite-core owns target normalization, existence checks, symlink/root escape protection through real paths, file/dir target descriptors, deterministic sorting, and filtering selected paths by resolved targets in `scoped-target-paths.logic.mjs`.

The core CLI target helper also owns repeatable `--target` parsing normalization for shared runner-style CLIs.

Ownership classification: **suite-core-owned and already canonical** for target resolution/filtering; **suite-core-owned but under-hardened** for publishing target descriptors consistently to all slices because Naming currently returns only target rel-path strings, while Tree receives `targetDescriptors` from the suite scoped snapshot input path.

### Scoped filesystem walking and selected path packaging

Current runtime truth: `suite-scoped-snapshot-input.logic.mjs` walks scope roots, skips configured directory names, optionally skips dot-directories, includes configured root files, sorts/dedupes in-scope paths, resolves targets, and packages `selectedPaths`, `targetDescriptors`, and `targets`.

This is the strongest suite-core candidate for a common input contract. However, it currently collects all files under scoped roots; it does not apply a broad validator candidate extension/root-file allowlist. Tree consumes this path directly, while Naming does not.

Ownership classification: **suite-core-owned but under-hardened**.

### Report metadata, report contract, source snapshot, exit codes, registry, and shared CLI runner

Current runtime truth:

- `source-snapshot.logic.mjs` owns git/source metadata for reports.
- `validator-report.contracts.mjs` records the combined report contract fields.
- `validator-report-meta.logic.mjs` owns tool version lookup, stable stringify, SHA-256 digesting, and config digesting.
- `validator-exit-code.logic.mjs` owns exit-code derivation from findings and strict mode through builtin exit policies.
- `validator-registry.knowledge.mjs` owns suite validator registration and adapts Naming/Tree results into runner entries.
- `validator-cli-runner.logic.mjs`, `validator-cli-scopes.logic.mjs`, `validator-cli-targets.logic.mjs`, `validator-cli-output.logic.mjs`, and `validator-cli-usage.logic.mjs` own shared runner CLI mechanics.

Ownership classification: **suite-core-owned and already canonical**, except CLI scope parsing is split because per-command host scripts still parse `--scope=` themselves and pass it into the shared runner.

## Current Naming ownership

### Naming semantic/applicability policy

Current runtime truth: Naming owns filename interpretation and finding generation. `classifyPath(...)` normalizes paths, extracts basenames, checks special cases, parses canonical names, evaluates role status, checks semantic-name case, derives semantic-family details, detects hyphen-appended role ambiguity, detects missing-role patterns, and falls back to legacy exception findings.

Naming registries and runtime converters own:

- roles, categories, category-role perspective, and role statuses;
- special cases;
- case rules;
- missing-role patterns;
- semantic-family and disambiguation interpretation;
- finding policy and summary buckets;
- Naming registry state/custom overlay resolution.

Ownership classification: **slice-owned applicability/interpretation policy**.

### Naming reportability and local collection flow

Current runtime truth: Naming owns `reportableExtensions` and `reportableRootFiles` registries today. Naming wiring resolves those registry inputs, converts them into runtime sets, loads Naming walk exclusions, runs a Naming-local repository walk, then uses suite-core target resolution/filtering.

Important current implementation details:

- `isReportableFile(...)` returns true if a path extension is in `reportableExtensions` or the basename is in `reportableRootFiles`.
- `collectPathsFromRoot(...)` recursively walks the repository from `.`, applies Naming walk exclusions, and only pushes reportable files.
- `collectRepositoryPaths(...)` applies suite-core scope profile filtering after collecting all reportable paths, except repo scope returns all reportable paths directly.
- `prepareNamingValidatorInputs(...)` resolves Naming registries, invokes the Naming collection path, resolves suite-core targets, and packages `selectedPaths` and `targets` for the Naming runtime.

This is the ambiguous seam. The policy is currently Naming-owned, but the behavior includes broad candidate decisions that are not intrinsically Naming-semantic: file extension inclusion, root-file inclusion, repository walking, and exclusion mechanics.

Ownership classification: **duplicated or at risk of duplication** and **safe migration candidate** for the broad candidate portion; **slice-owned applicability/interpretation policy** for Naming-specific interpretation after candidate selection.

### Naming reportable extensions

Current runtime truth: builtin Naming reportable extensions are `.cjs`, `.css`, `.js`, `.json`, `.jsx`, `.md`, `.mjs`, `.ts`, and `.tsx`. Config overlays can add extensions under `naming.reportableExtensions.add`, and registry-state logic canonicalizes/dedupes/sorts the merged result.

Audit interpretation: extension inclusion is a broad validator candidate policy when it asks “which file types can validators inspect at all?” It becomes Naming policy only when an extension maps to Naming-specific role or missing-role interpretation. The current list is not obviously Naming-only because Tree and future validators may need the same text/source/document/config file candidate universe.

Recommended owner: split suite-core broad candidate extension policy + Naming applicability/interpretation policy.

### Naming reportable root files

Current runtime truth: builtin Naming reportable root files are `package-lock.json` and `package.json`. These files are selected by basename anywhere in the Naming walk, not only through suite-core `includeRootFiles`, because `isReportableFile(...)` compares basename.

Audit interpretation: root-file inclusion is also mixed. Suite-core already owns scope profile root-file inclusion for scope selection, but Naming separately owns a reportable root file allowlist for candidate eligibility. Broad root-file candidate inclusion belongs better in suite-core; Naming should own only Naming-specific treatment after those files are candidates.

Recommended owner: split suite-core broad root-file candidate policy + Naming applicability/interpretation policy.

## Current Tree ownership

Current runtime truth: Tree consumes suite-core `collectSuiteScopedSnapshotInputs(...)`, not the Naming reportability walk. Tree wiring passes Tree-specific walk exclusions into suite-core, receives `selectedPaths`, `targetDescriptors`, `includeRoots`, and `targets`, then prepares occurrence snapshots, structural address snapshots, structural-home evidence, semantic-home evidence, folder-kind evidence, repo-shape policy, occurrence-classification runtime, contributor findings, and Tree runtime inputs.

Tree runtime owns structural reasoning over prepared inputs:

- top-level unexpected folder findings;
- validator-owned file outside tree findings;
- owned-slice boundary drift findings;
- contributor findings;
- total file count and filter metadata for Tree report output.

Tree registries own structural homes, folder kinds, repo-shape policy, semantic-home policy, structural-home signals, surface/structural-home perspectives, shim detection signals, and validator-owned signals.

Ownership classification: **slice-owned adapter over suite-core contract** for consuming scoped snapshot inputs; **slice-owned applicability/interpretation policy** for structural applicability and repo-shape reasoning.

## Duplication risk

The main duplication risk is not that Tree currently duplicates Naming reportability; it does not. The risk is that future slices will need a candidate file/path population narrower than “all scoped files” but broader than “Naming semantic policy.” Without a suite-core candidate contract, each slice could independently recreate:

- extension allowlists;
- root-file allowlists;
- root-file-vs-nested basename semantics;
- walk exclusions and dot-directory behavior;
- sorting/dedupe rules;
- target descriptor packaging;
- selected-path filter metadata;
- tests proving target filtering and scope filtering behave the same across validators.

Naming already duplicates suite-core walking mechanics by walking the repository locally before using suite-core profile/target filters. Tree currently avoids that duplication by consuming suite-core snapshot inputs, but Tree still has slice-local walk exclusion sets passed into suite-core. That is acceptable for Tree-specific structural scan needs, but it reinforces why suite-core should define the common mechanics/contract and keep slice-specific applicability narrow.

Duplication risk classification: **duplicated or at risk of duplication**.

## Responsibility classification table

| Responsibility | Current owner | Current classification | Recommended owner | Recommended classification | Evidence summary |
|---|---|---|---|---|---|
| scope profile ownership | suite-core | suite-core-owned and already canonical | suite-core | suite-core-owned and already canonical | Builtin scope-profile registry plus validator-scopes loader. |
| target resolution | suite-core | suite-core-owned and already canonical | suite-core | suite-core-owned and already canonical | `resolveScopedTargets(...)` owns normalization, root escape checks, kind descriptors, dedupe, and sorting. |
| path normalization | suite-core helper, also consumed by Naming | suite-core-owned but under-hardened | suite-core contract with slice adapters | slice-owned adapter over suite-core contract | `normalizePath(...)` is exported from suite-core and re-exported by Naming, but candidate contracts do not consistently publish normalized selected path shape. |
| filesystem walking mechanics | suite-core for Tree; Naming for Naming | duplicated or at risk of duplication | suite-core | suite-core-owned but under-hardened | Tree uses suite-core scoped snapshot walking; Naming has a separate recursive walk. |
| walk exclusions | Naming registry; Tree constants passed into suite-core | duplicated or at risk of duplication | suite-core mechanics + slice-provided scan profile | slice-owned adapter over suite-core contract | Exclusion mechanics are common; exclusion values may remain slice-tuned. |
| selected path packaging | suite-core for Tree; Naming wiring for Naming | duplicated or at risk of duplication | suite-core | suite-core-owned but under-hardened | Tree receives suite-core `selectedPaths`; Naming packages selected paths after its own collection. |
| target descriptor packaging | suite-core for scoped snapshot inputs | suite-core-owned but under-hardened | suite-core | suite-core-owned but under-hardened | Tree receives `targetDescriptors`; Naming currently exposes only `targets` rel paths. |
| source snapshot metadata | suite-core | suite-core-owned and already canonical | suite-core | suite-core-owned and already canonical | `getSourceSnapshot(...)` owns fs/git metadata. |
| broad validator candidate file/path policy | Naming by current behavior; absent as suite-core contract | duplicated or at risk of duplication | suite-core | safe migration candidate | Current broad candidate allowlists live in Naming registries, not suite-core. |
| Naming reportable extensions | Naming | duplicated or at risk of duplication | split | safe migration candidate | Extension list looks broadly useful as validator candidate policy; Naming keeps semantic interpretation. |
| Naming reportable root files | Naming | duplicated or at risk of duplication | split | safe migration candidate | Root-file inclusion overlaps suite-core scope root-file mechanics. |
| Naming applicability over candidates | Naming | slice-owned applicability/interpretation policy | Naming | slice-owned applicability/interpretation policy | Roles, special cases, case rules, semantic families, missing roles, and finding policy are Naming-owned. |
| Tree structural applicability over candidates | Tree | slice-owned adapter over suite-core contract | Tree | slice-owned applicability/interpretation policy | Tree uses selected paths to build occurrence/structural evidence and findings. |
| Tree repo-shape policy | Tree | slice-owned applicability/interpretation policy | Tree | slice-owned applicability/interpretation policy | Allowed top-level directories and structural drift policy are Tree-owned. |
| report metadata/filter metadata | suite-core report contract/runner plus slice filter payloads | suite-core-owned but under-hardened | suite-core report contract + slice adapters | suite-core-owned but under-hardened | Report fields are suite-core; filter payload construction is repeated in Naming and Tree runtimes. |
| exit code policy | suite-core | suite-core-owned and already canonical | suite-core | suite-core-owned and already canonical | Exit code derivation consumes findings and strict mode through builtin policies. |
| CLI scope parsing | shared runner validation plus per-command parsers | suite-core-owned but under-hardened | suite-core parsing helper with command adapters | suite-core-owned but under-hardened | Host scripts still parse `--scope=` while shared runner validates the selected scope. |
| validator registry ownership | suite-core | suite-core-owned and already canonical | suite-core | suite-core-owned and already canonical | Registry dispatch and result adaptation are centralized in suite-core. |

## Options compared

### Option A: keep Naming reportability fully Naming-owned

Pros:

- No behavior migration.
- Preserves current registry/config shape.
- Lowest immediate implementation risk.

Cons:

- Keeps broad candidate policy coupled to Naming semantics.
- Leaves duplicated walking mechanics in Naming while Tree uses suite-core scoped snapshots.
- Future slices needing candidate filtering would likely copy Naming reportability or invent another allowlist.
- Weakens future extraction paths because suite-core cannot state what a validator candidate is before slice interpretation.

ROI assessment: acceptable as current implementation reality, but weak as target architecture.

### Option B: move all reportability to suite-core

Pros:

- Centralizes candidate file/path selection.
- Reduces duplicated walking mechanics.
- Makes target/scope/candidate packaging deterministic in one place.

Cons:

- Too blunt if it moves Naming-specific applicability/interpretation into suite-core.
- Risks turning suite-core into a semantic junk drawer.
- Could collapse Naming and Tree distinctions by treating all reportability as common policy.
- Higher migration risk because Naming config overlays and registries currently live in Naming.

ROI assessment: directionally useful for broad mechanics, but too broad as an ownership model.

### Option C: split suite-core candidate policy from slice-owned applicability

Pros:

- Preserves clean ownership boundaries: suite-core owns common mechanics/contracts; slices own interpretation.
- Makes implicit candidate selection explicit without creating a generic shared bucket.
- Reduces future duplication across Tree and future slices.
- Supports staged compatibility: suite-core can first mirror current Naming broad candidate output, then slices can adopt adapters later.
- Best matches the developer mental model: “candidate files” are suite input; “what this candidate means” is slice policy.

Cons:

- Requires careful naming to avoid implying suite-core owns Naming semantics.
- Requires compatibility tests before behavior migration.
- Requires a decision about whether current `naming.reportableExtensions.add` remains as a Naming overlay, gains a suite-core alias, or bridges to a suite-core candidate profile in a later issue.

ROI assessment: best target architecture and best staged implementation path.

### Option D: defer movement and only document ownership

Pros:

- Lowest immediate risk.
- Useful if parent #575 needs more deep research before implementation.
- Avoids accidental runtime/report changes.

Cons:

- Does not reduce duplication risk.
- Leaves the core seam ambiguous for future slices.
- Requires future implementers to re-audit current behavior before safely hardening suite-core.

ROI assessment: appropriate for this docs-only PR, not sufficient as the next implementation after parent #575 closes.

## Recommendation

Recommend **Option C: split suite-core candidate policy from slice-owned applicability**, implemented through a staged implementation path after parent #575 closes.

Recommended ownership model:

- Suite-core owns scope profiles, target resolution, filesystem walking mechanics, selected-path packaging, target descriptor packaging, source snapshot metadata, report metadata contracts, CLI common parsing/validation helpers, validator registry dispatch, and broad validator candidate file/path policy.
- Naming owns Naming applicability over candidates: role grammar, semantic-name case, special cases, semantic-family interpretation, missing-role interpretation, finding policy, and any Naming-specific treatment of candidate files.
- Tree owns structural applicability over candidates: occurrence evidence, structural-home reasoning, semantic-home reasoning, repo-shape policy, boundary/drift reasoning, shim signals, and Tree finding contributors.

For the specific audited seam:

- Treat `reportableExtensions` as split. The extension allowlist should become or feed a suite-core broad validator candidate contract; Naming should retain semantic interpretation after files are selected.
- Treat `reportableRootFiles` as split. Broad root-file candidate inclusion should become suite-core policy/mechanics; Naming should retain any filename interpretation after selection.
- Do not move Naming registries or Tree registries in this audit PR.
- Do not immediately rewrite runtime collection paths. First add a suite-core candidate contract and compatibility tests that prove current Naming output and Tree behavior are unchanged.

## Suggested next implementation slice

Smallest high-ROI implementation slice after #575 closes:

1. Add a suite-core-owned candidate policy contract/spec that explicitly distinguishes:
   - scope profiles;
   - target resolution;
   - walk mechanics;
   - broad candidate file/path policy;
   - slice applicability/interpretation policy.
2. Add a suite-core candidate collection helper behind a compatibility seam that can accept the current extension/root-file allowlist and current walk exclusion values without changing behavior.
3. Add focused tests that compare:
   - current Naming candidate output vs suite-core candidate helper output for representative fixtures;
   - current Tree selected paths vs unchanged suite-core scoped snapshot output;
   - target descriptor/filter metadata stability.
4. Only after those pass, open a separate migration issue to have Naming wiring consume the suite-core candidate helper while keeping Naming semantic registries and finding behavior untouched.

Do **not** begin by moving registries. The high-ROI first slice is a contract + compatibility bridge, not a registry relocation.

## Non-goals / not worth touching yet

Not in this audit PR and not recommended as the immediate next implementation slice:

- Moving Naming registries.
- Moving Tree registries.
- Rewriting collection runtime paths in this PR.
- Altering validator behavior.
- Changing report shape.
- Changing severity or exit-code behavior.
- Adding/removing package scripts.
- Introducing a universal plugin architecture.
- Introducing generic shared abstractions that are not tied to the candidate collection/applicability seam.
- Collapsing Naming and Tree ownership into a shared semantic layer.
- Making suite-core responsible for Naming roles, Tree structural homes, or other slice semantics.

## Evidence

### Issue and convention context

- Issue #576 asks for an audit-only document that gives parent #575 repo-grounded evidence for deciding suite-core hardening direction; it explicitly forbids implementing the hardening plan in this task.
- Parent #575 identifies the suspected target architecture as suite-core candidate collection plus broad candidate policy, with slimmer Naming and Tree applicability/interpretation layers.
- `AGENTS.md` requires docs-first, ownership-aligned changes, preserves issue-vs-PR boundaries, and forbids broad issue-planning language from becoming durable implementation truth unless stable.
- Validator ownership rules in `AGENTS.md` keep Naming responsible for filename/semantic-family interpretation and Tree responsible for folder classification, structural-home reasoning, semantic-home reasoning, placement evidence, and whole-placement confidence.

### Suite-core evidence

- `calculogic-validator/src/registries/_builtin/scope-profiles.registry.json` defines builtin scopes and root/root-file inclusions.
- `calculogic-validator/src/core/validator-scopes.logic.mjs` loads, normalizes, clones, lists, and retrieves scope profiles.
- `calculogic-validator/src/core/scoped-target-paths.logic.mjs` exports `normalizePath(...)`, `resolveScopedTargets(...)`, `filterScopedPathsByTargets(...)`, and `filterScopedPathsByProfile(...)`.
- `calculogic-validator/src/core/suite-scoped-snapshot-input.logic.mjs` recursively walks scope roots, includes root files, packages `inScopePaths`, resolves targets, packages `selectedPaths`, `targetDescriptors`, and `targets`.
- `calculogic-validator/test/suite-scoped-snapshot-input.test.mjs` covers suite scoped snapshots for docs scope and target filtering.
- `calculogic-validator/src/core/source-snapshot.logic.mjs`, `validator-report.contracts.mjs`, `validator-report-meta.logic.mjs`, and `validator-exit-code.logic.mjs` own report metadata, report contract, config digesting, and exit-code derivation.
- `calculogic-validator/src/core/validator-registry.knowledge.mjs` registers Naming and Tree validators and adapts slice results into runner entries.
- `calculogic-validator/src/core/cli/**` owns shared runner output, usage, supported scope display, target parsing, and runner orchestration.

### Naming evidence

- `calculogic-validator/naming/src/registries/_builtin/reportable-extensions.registry.json` defines the current Naming reportable extension list.
- `calculogic-validator/naming/src/registries/_builtin/reportable-root-files.registry.json` defines current Naming reportable root files.
- `calculogic-validator/naming/src/registries/_builtin/walk-exclusions.registry.json` defines Naming walk exclusions and dot-directory behavior.
- `calculogic-validator/naming/src/registries/registry-state.logic.mjs` treats reportable extensions/root files as required Naming builtin registry files, canonicalizes them, and merges config extension additions.
- `calculogic-validator/naming/src/naming-runtime-converters.logic.mjs` converts reportable extensions/root files into runtime `Set`s.
- `calculogic-validator/naming/src/naming-validator.logic.mjs` implements `isReportableFile(...)`, a Naming-local repository walk, scope filtering over reportable paths, selected-path runtime assertions, and Naming path classification.
- `calculogic-validator/naming/src/naming-validator.wiring.mjs` prepares Naming runtime inputs, invokes Naming collection, then uses suite-core target resolution/filtering.
- Naming tests exercise reportable extension/root-file preparation, override behavior, registry-state behavior, runtime input boundaries, and config overlay validation.

### Tree evidence

- `calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs` imports `collectSuiteScopedSnapshotInputs(...)`, passes Tree walk exclusions, and receives `selectedPaths`, `targetDescriptors`, `includeRoots`, and `targets`.
- Tree wiring prepares occurrence, structural-address, structural-home, semantic-home, folder-kind, repo-shape, occurrence-classification, and contributor inputs after suite-core selection.
- `calculogic-validator/tree/src/tree-structure-advisor.logic.mjs` requires prepared Tree inputs, derives file reasoning input from occurrence snapshots or selected-path fallback, then emits structural findings and filter metadata.
- `calculogic-validator/tree/src/registries/_builtin/repo-shape-policy.registry.json` and `tree-repo-shape-policy-registry.logic.mjs` keep repo-shape policy Tree-owned.
- Tree tests cover prepared selected paths for scopes/targets, occurrence snapshots, structural reasoning, and selected-path fallback behavior.

### Cross-slice evidence

- `calculogic-validator/src/core/validator-runner.logic.mjs` runs Naming ahead of Tree when Tree needs Naming semantic-family bridge data, showing suite-core owns orchestration while Naming and Tree retain slice interpretation.
- `calculogic-validator/test/cross-slice-deterministic-invariants.test.mjs` includes cross-slice selected-path expectations, showing selected-path stability is already treated as cross-slice-sensitive.
- `package.json` exposes separate Naming, Tree, and all-validator commands, including scope and target variants, without a dedicated docs-only validator command beyond the naming validator doc target.
