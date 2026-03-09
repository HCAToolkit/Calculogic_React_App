# Registry-Expansion-Candidates.audit

## Purpose

This audit inventories remaining **policy-shaped hardcoding** in the current validator runtime and classifies what should be extracted into deterministic registries next.

This is a planning artifact only: **no runtime behavior changes are proposed in this pass**.

Primary inspection scope:

- `calculogic-validator/naming/src/`
- `calculogic-validator/tree/src/`
- `calculogic-validator/src/core/`

## Current registry-backed areas

These areas are already registry-backed and should not be redundantly re-extracted:

- Builtin roles registry (`roles.registry.json`) via `registry-state.logic.mjs`.
- Reportable extensions registry (`reportable-extensions.registry.json`) via `registry-state.logic.mjs`.
- Reportable root-file adjunct registry (`reportable-root-files.registry.json`) via `registry-state.logic.mjs`.
- Missing-role patterns registry (`missing-role-patterns.registry.json`) via `registry-state.logic.mjs` + `naming-missing-role-patterns.registry.logic.mjs`.
- Finding policy registry (`finding-policy.registry.json`) via `registry-state.logic.mjs` + `naming-finding-policy.registry.logic.mjs` + `naming-validator.logic.mjs`.
- Summary buckets registry (`summary-buckets.registry.json`) via `registry-state.logic.mjs` + `naming-summary-buckets.registry.logic.mjs` + `naming-validator.logic.mjs`.
- Scope profiles registry (`scope-profiles.registry.json`) via `validator-scopes.runtime.mjs`.
- Default validator scope policy via `DEFAULT_VALIDATOR_SCOPE` in `validator-scopes.runtime.mjs` (canonical suite-owned default consumed by runtime + naming CLI/wiring).
- Special cases registry (`special-cases.registry.json`) via `naming-special-case-rules.registry.logic.mjs`.
- Tree known-roots registry (`tree-known-roots.registry.json`) via `tree-known-roots.registry.logic.mjs`.
- Walk exclusions registry (`walk-exclusions.registry.json`) via `naming-walk-exclusions.registry.logic.mjs`.

## Hardcoded-policy inventory

| Area | File | Current hardcoded thing | Why it is policy-like | Candidate registry type | Extraction readiness | Recommended action | Notes |
|---|---|---|---|---|---|---|---|
| Naming reportability adjunct policy | `naming/src/naming-validator.logic.mjs` | Runtime now consumes `reportableRootFiles` from registry inputs as additive reportability adjunct policy. | This is repo policy vocabulary for reportability, not traversal mechanics. | `reportable-root-files.registry.json` | `completed` | Keep defaults bounded (`package.json`, `package-lock.json`) and maintain deterministic additive behavior with extension reportability. | Extraction completed without changing report semantics. |
| Missing-role heuristic | `naming/src/naming-validator.logic.mjs` + `naming/src/registries/_builtin/missing-role-patterns.registry.json` | Runtime now consumes normalized missing-role pattern descriptors (2-segment and `module.css`) from builtin registry payload. | Heuristic remains engine-owned while extension-pattern policy vocabulary is registry-owned. | `missing-role-patterns.registry.json` with deterministic pattern forms. | `completed` | Keep schema bounded (`dotSegments`, segment indexes, literal constraints, optional compound extension) and preserve exact legacy exception semantics. | Extraction completed after normalization-first pass; parser/tokenization remains code-owned. |
| Default scope fallback (runtime) | `naming/src/naming-validator.logic.mjs` and `naming/src/naming-validator.wiring.mjs` | Fallback now reads suite-owned `DEFAULT_VALIDATOR_SCOPE` (no local `'repo'` hardcoding). | Default scope selection is policy; now centralized to suite runtime owner. | `DEFAULT_VALIDATOR_SCOPE` in suite runtime. | `completed` | Keep centralized owner and guard with drift tests. | Consolidation completed in scope-default unification slice. |
| Default scope fallback (CLI) | `naming/src/cli/naming-cli-args.logic.mjs` and `src/core/validator-scopes.runtime.mjs` | CLI parser now initializes from suite-owned `DEFAULT_VALIDATOR_SCOPE`; runtime normalizes from same owner. | Canonical owner removes CLI/runtime drift risk. | `DEFAULT_VALIDATOR_SCOPE` in suite runtime. | `completed` | Preserve behavior (`repo`) while keeping one owner. | Parser behavior unchanged; ownership consolidated. |
| Finding severity/classification/message family mapping | `naming/src/naming-validator.logic.mjs` + `naming/src/registries/_builtin/finding-policy.registry.json` | Runtime now resolves finding metadata (`severity`, `classification`, `code`, message templates, rule refs, optional suggested fix) from registry entries keyed by stable outcome IDs. | Branch-to-finding mapping is policy vocabulary and enforcement semantics, with algorithmic decision flow staying code-owned. | `finding-policy.registry.json` keyed by decision outcome IDs. | `completed` | Keep outcome IDs stable and preserve deterministic metadata lookup semantics. | Extraction completed via registry loader/state wiring with runtime lookup ownership in naming validator logic. |
| Summary bucket structure | `naming/src/registries/_builtin/summary-buckets.registry.json` + `naming/src/naming-validator.logic.mjs` | `summarizeFindings(...)` now consumes wiring-prepared summary bucket policy sourced from builtin registry. | Report vocabulary and summary grouping are policy surface decisions and now have a deterministic owner. | `summary-buckets.registry.json` (classification buckets + optional facets). | `completed` | Keep schema bounded and preserve deterministic sort/count behavior. | Extracted in V0.1.24 without output-shape changes. |
| Config overlay limits | `naming/src/registries/registry-state.logic.mjs` + `naming/src/registries/_builtin/overlay-capabilities.registry.json` | Runtime now resolves bounded overlay support from registry-declared capabilities and preserves add-only handling for `naming.reportableExtensions.add` and `naming.roles.add`. | Overlay capability is a policy contract surface; contract declaration is now registry-owned while merge mechanics remain engine-owned. | `overlay-capabilities.registry.json` (declared add-only fields and merge mode). | `completed` | Keep overlay schema bounded to current naming surfaces and preserve unsupported-path behavior. | Extraction completed as bounded contract-first slice without broadening overlay semantics. |
| Exit behavior mapping | `src/registries/_builtin/exit-policy.registry.json` + `src/registries/validator-exit-policy.registry.runtime.mjs` + `src/core/validator-exit-code.logic.mjs` | Runtime now resolves ordered exit-policy predicates from bounded builtin registry and evaluates those predicates deterministically in code. | Severity/classification + strict-mode to exit-code mapping is policy contract, while semantic evaluation remains engine-owned. | `exit-policy.registry.json` (ordered predicates). | `completed` | Keep schema bounded to current semantics and preserve deterministic first-match ordering. | Extraction completed in Slice A without exit-semantic changes. |
| Tree top-level shape vocabulary | `tree/src/registries/_builtin/tree-known-roots.registry.json` + `tree/src/tree-structure-advisor.logic.mjs` | Runtime now consumes `knownTopLevelDirectories` from bounded tree registry payload. | Allowed root directories are repository policy, not algorithmic necessity. | `tree-known-roots.registry.json`. | `completed` | Keep payload bounded to current top-level vocabulary and preserve deterministic ordering in findings details. | Extraction completed without decision-flow changes. |
| Tree validator-owned basename signals | `tree/src/tree-structure-advisor.logic.mjs` | `VALIDATOR_OWNED_BASENAME_PATTERNS` regex list hardcoded. | File ownership signal vocabulary is policy-shaped and expected to drift over time. | `validator-owned-signals.registry.json`. | `registry-ready-after-normalization` | Normalize signal taxonomy (entrypoint/test/module classes) before extraction. | Avoid turning regex into unmanaged catch-all lists. |
| Shim detection token vocabularies | `tree/src/tree-shim-detection.logic.mjs` | Multiple token/surface sets: folder signals, name tokens, suppressed surfaces, extension allowlist. | These are heuristic policy knobs for advisory behavior. | `shim-detection-signals.registry.json`. | `registry-ready-after-normalization` | Split into bounded vocab sections (signals, suppressions, extensions) before extraction. | Ensure deterministic precedence remains code-owned. |
| System-scope compatibility expansions | `src/core/validator-scopes.runtime.mjs` | Hardcoded expansion for `eslint.config.*`, `vite.config.*`, `tsconfig*.json`. | Pattern expansion vocabulary is scope policy adjunct. | Scope-profile adjunct registry for compatibility pattern expansions. | `keep-hardcoded-for-now` | Keep local until root-file discovery contracts stabilize. | Tight coupling with `ROOT_APP_FILES` may not justify extraction yet. |

## Candidate classification

### registry-ready-now

- No pending items in this class for the current audit scope.

### registry-ready-after-normalization

- Tree basename ownership signal taxonomy.
- Shim detection signal/suppression vocabulary.

### keep-hardcoded-for-now

- System-scope wildcard expansion plumbing in `validator-scopes.runtime.mjs` while root file compatibility behavior remains coupled to core runtime knowledge.

## Recommended extraction order

Prioritized by structural ROI (clean policy ownership boundaries first):

1. **Deeper semantic relationship metadata (tree signals)**
   - Add bounded registries for shim signal semantics and cross-surface suppression behavior.

## Keep-hardcoded-for-now

Retain hardcoded implementation behavior for now where code is primarily **engine mechanics** or where policy is too intertwined with runtime internals to extract safely in a small slice:

- Traversal/sorting mechanics (`sortPaths`, deterministic ordering helpers).
- Parser mechanics (`parseCanonicalName`, tokenization algorithms).
- Scope compatibility wildcard expansion internals tied to `ROOT_APP_FILES` until a stable external contract is defined.

## Risks / anti-patterns to avoid

- **Generic “mega config” registry** that mixes unrelated policy concerns.
- **Regex dump registries** without normalized schema or precedence rules.
- **Behavior-first refactors** that alter findings while “extracting policy.”
- **Split ownership** where defaults remain duplicated in CLI + runtime after extraction.
- **Leaky engine/policy boundary** (algorithm control flow should stay in code; decision vocabularies move to registries).

## Next-step implementation slices

1. **Slice A — Tree signal policy extraction**
   - Extract validator-owned basename/shim signals after schema normalization.
   - Keep tree known-roots extraction completed and isolated from broader signal policy work.
