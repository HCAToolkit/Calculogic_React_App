# Tree Known-Roots Derived Compatibility Path Audit

> Status after issue #572: This document is retained as historical docs/spec context. Any known-roots statements describing active runtime ownership are not current runtime truth; current runtime truth is that Tree known-roots registry/runtime dependencies are retired and replacement Tree evidence controls the relevant runtime paths.


## 1) Scope and intent

This document is a docs-only audit slice for issue #467 under roadmap context #452.

The purpose is to describe current runtime truth and current implementation reality for `tree-known-roots.registry.json`, then compare staged implementation path options toward the target architecture.

## 2) Current runtime ownership

### 2.1 What `tree-known-roots.registry.json` owns in current runtime truth

`tree-known-roots.registry.json` currently owns a bounded top-root vocabulary through `topRoots` and compatibility `knownTopLevelDirectories` data consumed by tree runtime logic.

In current implementation reality, this registry is used as:

- runtime top-root vocabulary (repo-top names and kind metadata)
- current classification compatibility input (occurrence classification map from `root -> kind`)
- unexpected top-level folder behavior input (known-root allow-list for `TREE_UNEXPECTED_TOP_LEVEL_FOLDER`)
- repo-top structural/semantic shortcut behavior (single-segment path + root-name kind lookup)
- shallow depth/lineage shortcutting (repo-top determination by path depth only, not full addressed lineage)
- partial Structural Home evidence (structural root hinting only)
- partial Semantic Home evidence (semantic root hinting only)

### 2.2 Important distinction

The above is current runtime truth, not target architecture.

The current usage is a compatibility shortcut that blends vocabulary, recognition, and limited evidence hints in one runtime surface.

## 3) Long-term non-ownership boundaries

Under target architecture, `tree-known-roots.registry.json` should not become the long-term canonical owner of:

- Structural Home identity
- Semantic Home derivation
- Surface → Structural Home evidence
- final Tree placement correctness
- full Tree occurrence addressing
- Naming semantic-name or semantic-family interpretation

Naming ownership remains with naming slice semantics, and Tree ownership remains occurrence location + Tree interpretation layers.

## 4) Future path comparison

## Option A — Compatibility wrapper only

Known roots remain compatibility runtime truth for preserving behavior while newer layers mature.

Benefits:

- lowest immediate runtime churn
- deterministic continuation of current advisories
- simple migration envelope

Risks:

- prolongs ownership blending
- may reinforce shortcut coupling between repo-top recognition and meaning interpretation

Enables/blocks:

- enables incremental runtime stability
- blocks clean decomposition if retained too broadly for too long

Retirement/reduction point:

- reduce after addressed-occurrence evidence and policy layers can replace shortcut meaning assumptions

## Option B — Split registry model

Split known roots into separate structural-root and semantic-root compatibility inputs.

Benefits:

- improves ownership visibility
- reduces one-file ambiguity for root-kind semantics

Risks:

- increases registry ownership surface
- can create intermediate complexity without solving occurrence-address dependence

Before/after occurrence addressing runtime:

- likely safer after at least minimal occurrence addressing runtime exists; doing it earlier may reorganize compatibility data without enough runtime leverage

## Option C — Derived evidence model

Known-root evidence is derived from addressed occurrences combined with Structural Home and Semantic Home evidence layers.

Benefits:

- strongest ownership purity
- aligns occurrence location vs meaning interpretation boundaries
- best fit for long-term deterministic reasoning

Risks:

- requires runtime prerequisites and broader staging
- premature adoption would force cross-slice churn

Runtime prerequisites:

- stable occurrence addressing model in runtime
- bounded evidence assembly for Structural Home / Semantic Home interpretation
- compatibility bridge for existing advisories

Why long-term target architecture but not immediate next implementation:

- current runtime still relies on direct known-root compatibility behavior in classification and top-level unexpected-folder advisories

## Option D — Hybrid transition path

Keep `tree-known-roots.registry.json` as compatibility runtime truth while adding an addressed-occurrence evidence layer as a parallel staged implementation path.

Benefits:

- safest staged implementation path
- preserves deterministic existing behavior
- allows new evidence model growth without broad runtime churn

Risks:

- temporary dual-model reasoning during transition
- requires clear ownership wording to avoid drift

Why safest now:

- keeps compatibility stable while enabling target architecture progression
- avoids forcing immediate rewiring of all Tree interpretation surfaces

### Recommended next minimal path

Preferred recommendation, unless the audit finds a clearer lower-risk path: Option D (hybrid transition path).

## 5) Relationship to Tree occurrence addressing

Adopt the #465 framing:

- `A` is the active validation/addressing scope root.
- The same physical path can have different addresses under different active scopes.
- Folder tokens such as `src`, `doc`, `test`, and `scripts` can repeat at multiple depths and parent lineages.
- Addressing locates occurrence.
- Registries and Tree interpretation explain occurrence meaning.

Implications for known roots:

- known-root behavior should eventually become evidence about an addressed occurrence
- known-root behavior should not remain the primary source of all Tree meaning
- Tree occurrence addressing should answer where an occurrence is, not whether placement is correct

## 6) Relationship to existing registries and ownership surfaces

Ownership boundaries for target architecture staging:

- suite scope profiles own scan boundaries
- Tree occurrence addressing owns scope-relative occurrence location
- `tree-known-roots.registry.json` owns current runtime compatibility vocabulary unless changed by a future runtime slice
- `structural-homes.registry.json` owns reusable Structural Home identity
- `folder-kinds.registry.json` owns Tree folder-kind vocabulary
- `surface-structural-home-perspective.registry.json` owns affinity/evidence only
- Semantic Home remains Tree-derived from folder context and Naming bridge outputs
- Naming owns semantic-name and semantic-family interpretation

## 7) Impact on next slices

This audit sets these constraints for staged implementation path sequencing:

- Do not implement `structural-home-signal-policy.registry.json` until known-root compatibility ownership is explicit enough to avoid mixing weak folder labels with repo-top compatibility shortcuts.
- Do not implement `semantic-home-policy.registry.json` as if `tree-known-roots.registry.json` were canonical Semantic Home truth.
- Do not normalize Tree registry loading around the assumption that known roots are the long-term primary source of Tree meaning.
- Future runtime structural addressing should be staged after this compatibility path is documented and reviewed.

## 8) Recommended next minimal action

Primary recommendation:

- Create a follow-up implementation/design issue for addressed-occurrence evidence modeling (or a compatibility-wrapper refinement plan) after this audit review.

Conditional alternative:

- Proceed to Slice 5 only if review confirms that `tree-known-roots.registry.json` can remain compatibility-only while `structural-home-signal-policy.registry.json` is added without ownership mixing.

## 9) Authority and status wording map

- current runtime truth: compatibility shortcut behavior from known roots in runtime classification/advisories
- current implementation reality: known-root data currently contributes both vocabulary and partial structural/semantic hints
- target architecture: addressed-occurrence location + layered evidence/identity ownership split
- staged implementation path: hybrid compatibility + addressed-occurrence evidence progression
- not current runtime truth: treating known roots as full canonical owner for Tree meaning
