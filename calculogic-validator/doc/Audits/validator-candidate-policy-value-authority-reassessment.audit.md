# Validator Candidate Policy Value Authority Reassessment

## Summary

This reassessment is the docs-only child output for issue #583 under implementation parent #579. It inspects current implementation reality after the completed #578 / PR #580 contract-helper slice and the #581 / PR #582 Naming migration slice.

Recommendation: **keep current candidate-policy value authority Naming-owned for now**.

Direct decisions:

- `reportableExtensions` authority stays Naming-owned.
- `reportableRootFiles` authority stays Naming-owned.
- Suite-core should not own a default candidate profile registry now.
- No additional behavior-moving implementation issue is justified now.
- Parent #579 can document this deferral and close after this reassessment is reviewed, because its staged implementation path has completed contract ownership, helper ownership, Naming adapter migration, and value-authority reassessment.

This recommendation preserves the #579 distinction:

```text
owning the candidate-policy contract
≠
owning the initial policy values
```

Suite-core now owns the candidate-policy contract, candidate-collection helper, and shared candidate collection mechanics. Naming still owns the current candidate-policy values, config overlay surface, semantic interpretation, findings, summaries, report behavior, and exit behavior. This document does not move runtime behavior, registries, loaders, report shape, finding codes, summary counts, severity behavior, exit-code behavior, package scripts, Tree behavior, or Naming config surfaces.

## Current post-migration state

Current runtime truth: suite-core owns the normalized candidate-policy contract shape for candidate extensions, candidate root files, walk-excluded directories, and `skipDotDirectories`. It also owns conversion to input sets for deterministic candidate matching.

Current runtime truth: suite-core owns candidate-path matching and an adapter-style `createValidatorCandidatePolicyFromValues(...)` helper that can be fed by slice-owned values. That adapter accepts candidate extension values, candidate root-file values, and walk-exclusion values without declaring suite-core authority over those values.

Current runtime truth: suite-core owns deterministic candidate collection through the suite scoped snapshot path. It applies scope/profile selection, target filtering, walk exclusions, dot-directory handling, candidate filtering, sorting, and dedupe, then returns selected candidate paths and related scope/target metadata.

Current runtime truth: Naming wiring resolves Naming registry inputs, converts them into runtime sets/maps, builds a Naming-owned candidate policy from `reportableExtensions`, `reportableRootFiles`, and `walkExclusions`, then feeds that policy into the suite-core candidate collection helper.

Current runtime truth: Naming logic no longer owns duplicated recursive walking for normal candidate collection. Its `collectRepositoryPaths(...)` compatibility entry point now prepares a Naming-owned candidate policy and delegates selected-path collection to suite-core.

Current runtime truth: Naming remains the value authority for:

- `reportableExtensions`
- `reportableRootFiles`
- walk-exclusion values
- `naming.reportableExtensions.add` config overlay support
- role, special-case, case-rule, missing-role, finding-policy, semantic-family, summary, and report interpretation

The current Naming builtin reportable extension values are `.cjs`, `.css`, `.js`, `.json`, `.jsx`, `.md`, `.mjs`, `.ts`, and `.tsx`. The current Naming builtin reportable root-file values are `package-lock.json` and `package.json`.

## Ownership options compared

### Option A: remain Naming-owned for now

Option A keeps `reportableExtensions`, `reportableRootFiles`, walk-exclusion values, and the config overlay surface in Naming while continuing to feed those values into the suite-core candidate-policy contract.

ROI comparison:

- **Clean ownership boundaries:** strongest current fit. Suite-core owns the reusable contract/mechanics; Naming owns values tied to Naming's registry and overlay model.
- **Clean modular decomposition:** strong. Contract/helper reuse is already extracted without making suite-core a registry-state host for Naming policy values.
- **Deterministic organization:** strong. The value source remains where current registry loading, digesting, overlay application, and runtime conversion already occur.
- **Future extraction paths:** acceptable. The adapter-fed suite contract keeps the seam explicit if future evidence justifies a suite-level profile registry.
- **Fidelity to developer mental models:** strong. Developers can read Naming's registries to understand what Naming scans and read suite-core to understand how candidates are collected.
- **Semantic modeling:** strong enough for current evidence. The model makes candidate mechanics explicit without over-modeling a shared value registry before more consumers exist.
- **Extensibility over generic convenience:** strongest. It avoids a generic shared bucket and requires concrete future pressure before moving values.

Answer to required question 1: after the contract/helper and Naming migration, there is **not enough meaningful duplication pressure around `reportableExtensions` / `reportableRootFiles` value authority** to justify moving those values now. The duplicated runtime walking pressure has already been removed; the remaining shared surface is an adapter-fed value payload, not duplicated mechanics.

### Option B: move partially to suite-core now

Option B would move some value authority, likely `reportableExtensions` and/or `reportableRootFiles`, while keeping Naming overlays or interpretation local.

ROI comparison:

- **Clean ownership boundaries:** weaker than Option A today. It would split Naming's registry/config overlay model before another slice proves it needs the same defaults.
- **Clean modular decomposition:** weaker today. It risks creating a suite-core value source plus Naming overlay bridges, which is more complex than the current adapter-fed model.
- **Deterministic organization:** mixed. A suite value registry could be deterministic, but current runtime inputs already resolve deterministically in Naming.
- **Future extraction paths:** potentially useful later, but premature now because the future extraction target is not yet evidenced by multiple consumers.
- **Fidelity to developer mental models:** weaker today. `reportableExtensions` is currently presented as a Naming config surface, so a partial move would make users ask whether extension defaults are Naming policy, suite policy, or both.
- **Semantic modeling:** too early. It would model a shared default profile before the repo has current runtime truth that multiple slices need one.
- **Extensibility over generic convenience:** weaker than Option A because it optimizes for possible reuse over proven reuse.

Answer to required question 3: moving value authority into suite-core now would **not improve ownership clarity enough to justify the churn**. It would prematurely centralize Naming-owned configuration and introduce bridging questions around `naming.reportableExtensions.add`.

### Option C: move fully to suite-core now

Option C would make suite-core own the default candidate-policy values and likely introduce a suite-owned default candidate profile registry now.

ROI comparison:

- **Clean ownership boundaries:** weakest current fit. It would collapse the difference between suite candidate mechanics and Naming's current scan/config values.
- **Clean modular decomposition:** weak today. Suite-core would gain registry value authority without a second value consumer.
- **Deterministic organization:** possible mechanically, but less deterministic semantically because the reason for the values would no longer live with Naming's interpretation and overlay surface.
- **Future extraction paths:** too broad for current evidence. Full centralization would be harder to unwind if future slices need narrower or different candidate values.
- **Fidelity to developer mental models:** weak today. Developers currently encounter these values as Naming reportability, not a suite-wide default profile.
- **Semantic modeling:** over-modeled for current implementation reality.
- **Extensibility over generic convenience:** weak. It risks creating a universal candidate-value bucket before slice needs are concrete.

Answer to required question 2: no slice besides Naming currently needs to own or configure the same default candidate extension/root-file values. Tree currently consumes scoped paths for structural analysis and has not introduced the same extension/root-file default registry need.

### Option D: defer until another slice needs candidate-policy values

Option D records that suite-core may eventually own a default candidate profile registry, but only after concrete evidence appears.

ROI comparison:

- **Clean ownership boundaries:** strong when paired with Option A as the current decision. It keeps current value authority Naming-owned and names future migration evidence.
- **Clean modular decomposition:** strong. The current adapter-fed model remains simple while suite-core's reusable contract remains available.
- **Deterministic organization:** strong. Future movement can be issue-driven with explicit migration criteria rather than implicit drift.
- **Future extraction paths:** strong. The seam is preserved without committing to a registry shape before future slices prove the shape.
- **Fidelity to developer mental models:** strong. It matches the current mental model and documents when that model should be revisited.
- **Semantic modeling:** appropriate. It models triggers, not speculative architecture.
- **Extensibility over generic convenience:** strong. It defers generic value centralization until extensibility evidence exists.

Answer to required question 5: suite-core may eventually own a default candidate profile registry, but the current adapter-fed model is enough until another slice needs shared candidate default values.

## Recommendation

Keep current candidate-policy value authority Naming-owned for now.

Explicit recommendation requirements:

- `reportableExtensions` authority stays Naming-owned.
- `reportableRootFiles` authority stays Naming-owned.
- Suite-core should not own a default candidate profile registry now.
- Do not open another behavior-moving implementation issue under #579 now.
- Parent #579 can close after this reassessment is reviewed and the deferral is accepted.

Answer to required question 4: yes, `reportableExtensions` and `reportableRootFiles` are still better described as **Naming-owned values feeding a suite-core contract**. That description is the clearest current ownership model because suite-core now owns the candidate-policy contract and mechanics while Naming still owns the registry/config source for the values.

The decisive reason is that #580 and #582 already removed the high-value duplication: duplicated candidate collection mechanics. What remains is value authority. Moving values now would not remove comparable duplication; it would mainly relocate Naming registry/config authority into suite-core before another slice needs those defaults. That would weaken ownership clarity rather than improve it.

## Deferred migration triggers

Answer to required question 6: future value-authority migration would be justified by concrete evidence such as:

- another validator slice needing the same default extension/root-file candidate values;
- Tree needing a narrower broad-candidate policy instead of all scoped paths;
- multiple slices duplicating candidate value registries or equivalent extension/root-file allowlists;
- candidate policy values becoming independent of Naming semantics and Naming config overlays;
- a suite-level config surface needing shared candidate defaults;
- report or runner composition needing one suite-owned candidate profile to compare or coordinate slices deterministically;
- compatibility tests showing a suite-owned default profile can reproduce current Naming candidate output and preserve Tree scoped-path behavior without changing report shape, finding codes, summary counts, severity behavior, or exit-code behavior.

If one or more triggers appears, the staged implementation path should be:

1. docs/spec alignment for suite-owned default candidate profile authority;
2. data-only suite candidate-profile payloads;
3. registry/profile shape tests and old-vs-new compatibility tests;
4. loader or adapter compatibility bridges that preserve `naming.reportableExtensions.add` semantics or explicitly introduce a suite-level config surface;
5. runtime behavior migration only after compatibility proof;
6. extraction preparation only after multiple consumers prove the profile shape.

## Parent #579 recommendation

Answer to required question 7: parent #579 should **document deferral and close after this reassessment**, not open another implementation child now.

Rationale:

- Slice 1 completed the suite-core candidate-policy contract/helper and compatibility proof.
- Slice 2 completed Naming migration to the suite-core helper and removed duplicated Naming-local runtime walking.
- Slice 3 has now reassessed value authority and found insufficient current evidence for moving `reportableExtensions` or `reportableRootFiles` authority.
- Closing #579 after review preserves the planned sequence while preventing a low-evidence centralization slice.

If a future trigger appears, open a new child issue with a narrow scope that cites this reassessment and identifies the concrete second consumer or suite-level config requirement.

## Evidence

Repository evidence inspected:

- `calculogic-validator/src/core/validator-candidate-policy.contracts.mjs` normalizes the candidate-policy contract shape and input sets, but contains no default extension/root-file values.
- `calculogic-validator/src/core/validator-candidate-policy.logic.mjs` performs candidate path matching and exposes `createValidatorCandidatePolicyFromValues(...)` as an adapter from external values.
- `calculogic-validator/src/core/validator-candidate-collection.logic.mjs` owns deterministic collection mechanics over scoped snapshot inputs and candidate filtering.
- `calculogic-validator/src/core/suite-scoped-snapshot-input.logic.mjs` and `calculogic-validator/src/core/scoped-target-paths.logic.mjs` own shared scope/target walking, filtering, descriptor, sorting, and path-normalization mechanics.
- `calculogic-validator/naming/src/naming-validator.wiring.mjs` prepares Naming inputs, resolves Naming registries, and feeds Naming-owned values into suite-core candidate collection.
- `calculogic-validator/naming/src/naming-validator.logic.mjs` now delegates candidate collection through suite-core for `collectRepositoryPaths(...)` and consumes prepared `selectedPaths` for Naming interpretation.
- `calculogic-validator/naming/src/registries/_builtin/reportable-extensions.registry.json` and `calculogic-validator/naming/src/registries/_builtin/reportable-root-files.registry.json` remain the current value sources for reportable extensions and reportable root files.
- `calculogic-validator/naming/src/registries/_builtin/overlay-capabilities.registry.json` keeps the config overlay surface under `naming.reportableExtensions.add`; there is no suite-level candidate-default config surface.
- `calculogic-validator/naming/src/registries/registry-state.logic.mjs` still owns Naming registry resolution, config overlay application, canonicalization, digesting, and resolved payload assembly for `reportableExtensions` and `reportableRootFiles`.
- `calculogic-validator/test/validator-candidate-collection.naming-compatibility.test.mjs` proves the suite helper can preserve current Naming candidate behavior from Naming-fed values.
- `calculogic-validator/test/suite-scoped-snapshot-input.test.mjs` preserves suite scoped snapshot behavior separately from Naming value authority.
- `calculogic-validator/doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md` explicitly describes the suite-core candidate helper as contract/helper reuse for adapting slice-owned values without moving registry authority.
- `calculogic-validator/doc/Audits/validator-candidate-collection-slice-applicability-ownership.audit.md` recommended Option C as target architecture before the #580 and #582 slices: split suite-core candidate policy from slice-owned applicability/interpretation. Current implementation reality has completed the high-ROI mechanics side of that split, while leaving the value-authority movement as a question that no longer has enough duplication pressure to justify immediate implementation.
