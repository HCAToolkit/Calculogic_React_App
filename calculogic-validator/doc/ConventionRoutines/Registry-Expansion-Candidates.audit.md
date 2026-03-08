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
- Scope profiles registry (`scope-profiles.registry.json`) via `validator-scopes.runtime.mjs`.
- Default validator scope policy via `DEFAULT_VALIDATOR_SCOPE` in `validator-scopes.runtime.mjs` (canonical suite-owned default consumed by runtime + naming CLI/wiring).
- Special cases registry (`special-cases.registry.json`) via `naming-special-case-rules.registry.logic.mjs`.
- Walk exclusions registry (`walk-exclusions.registry.json`) via `naming-walk-exclusions.registry.logic.mjs`.

## Hardcoded-policy inventory

| Area | File | Current hardcoded thing | Why it is policy-like | Candidate registry type | Extraction readiness | Recommended action | Notes |
|---|---|---|---|---|---|---|---|
| Naming reportability adjunct policy | `naming/src/naming-validator.logic.mjs` | Runtime now consumes `reportableRootFiles` from registry inputs as additive reportability adjunct policy. | This is repo policy vocabulary for reportability, not traversal mechanics. | `reportable-root-files.registry.json` | `completed` | Keep defaults bounded (`package.json`, `package-lock.json`) and maintain deterministic additive behavior with extension reportability. | Extraction completed without changing report semantics. |
| Missing-role heuristic | `naming/src/naming-validator.logic.mjs` | `detectMissingRoleCandidate(...)` hardcodes only 2-segment and `module.css` forms. | Heuristic encodes extension-pattern policy and legacy exception semantics. | `missing-role-patterns.registry.json` with deterministic pattern forms. | `registry-ready-after-normalization` | Normalize to explicit pattern descriptors before extraction to avoid regex sprawl. | Explicit hotspot requested, includes module.css branch. |
| Default scope fallback (runtime) | `naming/src/naming-validator.logic.mjs` and `naming/src/naming-validator.wiring.mjs` | Fallback now reads suite-owned `DEFAULT_VALIDATOR_SCOPE` (no local `'repo'` hardcoding). | Default scope selection is policy; now centralized to suite runtime owner. | `DEFAULT_VALIDATOR_SCOPE` in suite runtime. | `completed` | Keep centralized owner and guard with drift tests. | Consolidation completed in scope-default unification slice. |
| Default scope fallback (CLI) | `naming/src/cli/naming-cli-args.logic.mjs` and `src/core/validator-scopes.runtime.mjs` | CLI parser now initializes from suite-owned `DEFAULT_VALIDATOR_SCOPE`; runtime normalizes from same owner. | Canonical owner removes CLI/runtime drift risk. | `DEFAULT_VALIDATOR_SCOPE` in suite runtime. | `completed` | Preserve behavior (`repo`) while keeping one owner. | Parser behavior unchanged; ownership consolidated. |
| Finding severity/classification/message family mapping | `naming/src/naming-validator.logic.mjs` | `classifyPath(...)` hardcodes `severity`, `classification`, `code`, and message templates per branch. | Branch-to-finding mapping is policy vocabulary and enforcement semantics, not parsing mechanics. | `finding-policy.registry.json` keyed by decision outcome IDs. | `registry-ready-after-normalization` | First normalize decision outcome IDs; then map outcomes → finding metadata via registry. | Explicit hotspot requested. |
| Summary bucket structure | `naming/src/registries/_builtin/summary-buckets.registry.json` + `naming/src/naming-validator.logic.mjs` | `summarizeFindings(...)` now consumes wiring-prepared summary bucket policy sourced from builtin registry. | Report vocabulary and summary grouping are policy surface decisions and now have a deterministic owner. | `summary-buckets.registry.json` (classification buckets + optional facets). | `completed` | Keep schema bounded and preserve deterministic sort/count behavior. | Extracted in V0.1.24 without output-shape changes. |
| Config overlay limits | `naming/src/registries/registry-state.logic.mjs` | `applyConfigOverlay(...)` only supports `naming.reportableExtensions.add` and `naming.roles.add`. | Overlay capability is narrow policy contract, currently not extensible to other policy surfaces. | `overlay-capabilities.registry.json` (declared add-only fields and merge mode). | `registry-ready-after-normalization` | Define bounded overlay capability map before adding new policy registries. | Explicit hotspot requested. |
| Exit behavior mapping | `src/core/validator-exit-code.logic.mjs` | Exit code derivation is hardcoded (`warn => 2`, strict+legacy exception => 1). | Severity/classification → exit code is policy contract. | `exit-policy.registry.json` (ordered predicates). | `registry-ready-after-normalization` | Extract only after naming finding policy is normalized to stable outcome semantics. | Cross-validator relevance; keep deterministic ordering. |
| Tree top-level shape vocabulary | `tree/src/tree-structure-advisor.logic.mjs` | `KNOWN_TOP_LEVEL_DIRECTORIES` hardcoded set. | Allowed root directories are repository policy, not algorithmic necessity. | `tree-known-roots.registry.json`. | `registry-ready-now` | Extract if tree advisor is expected to evolve per-repo without code edits. | Good ROI if tree advisor is actively used. |
| Tree validator-owned basename signals | `tree/src/tree-structure-advisor.logic.mjs` | `VALIDATOR_OWNED_BASENAME_PATTERNS` regex list hardcoded. | File ownership signal vocabulary is policy-shaped and expected to drift over time. | `validator-owned-signals.registry.json`. | `registry-ready-after-normalization` | Normalize signal taxonomy (entrypoint/test/module classes) before extraction. | Avoid turning regex into unmanaged catch-all lists. |
| Shim detection token vocabularies | `tree/src/tree-shim-detection.logic.mjs` | Multiple token/surface sets: folder signals, name tokens, suppressed surfaces, extension allowlist. | These are heuristic policy knobs for advisory behavior. | `shim-detection-signals.registry.json`. | `registry-ready-after-normalization` | Split into bounded vocab sections (signals, suppressions, extensions) before extraction. | Ensure deterministic precedence remains code-owned. |
| System-scope compatibility expansions | `src/core/validator-scopes.runtime.mjs` | Hardcoded expansion for `eslint.config.*`, `vite.config.*`, `tsconfig*.json`. | Pattern expansion vocabulary is scope policy adjunct. | Scope-profile adjunct registry for compatibility pattern expansions. | `keep-hardcoded-for-now` | Keep local until root-file discovery contracts stabilize. | Tight coupling with `ROOT_APP_FILES` may not justify extraction yet. |

## Candidate classification

### registry-ready-now

- Tree known-root vocabulary (if tree policy churn is expected).

### registry-ready-after-normalization

- Missing-role and extension-pattern heuristics.
- Finding outcome-to-metadata mapping (severity/classification/message families).
- Config overlay capability matrix.
- Exit policy mapping.
- Tree basename ownership signal taxonomy.
- Shim detection signal/suppression vocabulary.

### keep-hardcoded-for-now

- System-scope wildcard expansion plumbing in `validator-scopes.runtime.mjs` while root file compatibility behavior remains coupled to core runtime knowledge.

## Recommended extraction order

Prioritized by structural ROI (clean policy ownership boundaries first):

1. **Placement / adjacency policy (tree known roots)**
   - Externalize known top-level root vocabulary where tree advisor policy churn is expected.
2. **Missing-role / extension-pattern policy**
   - Normalize and extract `detectMissingRoleCandidate(...)` patterns.
3. **Severity/classification defaults**
   - Introduce stable decision outcomes and externalize finding metadata mapping.
4. **Overlay capability contract expansion**
   - Add explicit capability declarations for newly extracted registry surfaces.
5. **Exit policy mapping**
   - Externalize severity/classification-to-exit predicates after finding outcomes stabilize.
6. **Deeper semantic relationship metadata (tree signals)**
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

1. **Slice A — Tree known-root vocabulary extraction**
   - Extract `KNOWN_TOP_LEVEL_DIRECTORIES` into a bounded registry payload.
   - Keep advisor decision flow and deterministic ordering behavior unchanged.

2. **Slice B — Missing-role pattern registry introduction**
   - Define normalized pattern schema (`dotSegments`, `compoundExtension`, optional constraints).
   - Replace direct hardcoded branches with runtime-compiled pattern checks.
   - Verify current `module.css` semantics remain exact.

3. **Slice C — Finding policy map**
   - Introduce stable internal decision outcome IDs.
   - Move outcome→`{code,severity,classification,message,ruleRef,suggestedFix}` mapping to registry.
   - Keep rule evaluation flow unchanged.

4. **Slice D — Overlay capability expansion contract**
   - Add deterministic overlay capability declarations for newly extracted registries.
   - Keep add-only semantics where required and explicit.

5. **Slice E — Exit policy mapping extraction**
   - Externalize ordered exit predicates after finding policy outcomes are stable.
   - Preserve strict/legacy exception behavior semantics.

6. **Slice F — Tree signal policy extraction**
   - Extract known roots first (small bounded vocabulary).
   - Then extract validator-owned basename/shim signals after schema normalization (or skip known-root step if Slice B already landed).
