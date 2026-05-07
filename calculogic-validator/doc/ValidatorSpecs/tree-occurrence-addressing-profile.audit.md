# Tree Occurrence Addressing Profile (Audit)

## Purpose and scope

This document defines a docs-first audit profile for Tree occurrence addressing under issue #465 and parent context #452.

It records:
- current runtime truth,
- current implementation reality,
- target architecture,
- staged implementation path.

This slice is documentation-only and does not change runtime behavior, registry payloads, CLI behavior, report behavior, or validator findings.

## Current problem statement

`tree-known-roots.registry.json` is useful compatibility behavior in current runtime truth, but it presently mixes several concerns:
- top-root occurrence recognition,
- structural repo-top roots,
- semantic repo-top roots,
- unexpected top-level folder checks,
- shallow depth/lineage shortcutting,
- partial structural-home interpretation,
- partial semantic-home interpretation.

That mixed behavior is acceptable as current runtime truth and current implementation reality.

However, this mixed behavior should not be treated as the long-term registry model or target architecture for Tree placement interpretation.

## Relationship to deterministic structural addressing

This profile aligns with `calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md` and reuses the same core principle:
- addressing deterministically locates a structural node,
- addressing answers where an occurrence is.

This Tree occurrence profile is a Tree-specific addressing profile/candidate built from that deterministic addressing principle.

This document does not claim that the current deterministic structural addressing draft grammar already implements Tree folder/file occurrence addresses exactly.

This profile does not redefine:
- semantics,
- file naming,
- provenance,
- Structural Home identity,
- Semantic Home derivation,
- placement confidence.

Those interpretation responsibilities remain in their owning layers.

## Scope-relative Tree occurrence addressing model

Tree occurrence addressing is scope-relative path occurrence addressing.

Rules:
- The active validation/addressing scope is the root of the address.
- The address root is always `A` within the selected scope.
- `A` means the current active scope root, not always the GitHub repository root.
- The same physical path may have different addresses under different active scopes.
- Folder child positions use deterministic letter tokens such as `A`, `B`, `C`, etc.
- File child positions use deterministic numeric tokens such as `1`, `2`, `3`, etc.
- Letter tokens are sibling-position tokens within each parent context.
- The same letter may repeat at different depths because each parent has its own local child ordering.
- Addressing locates the folder/file occurrence.
- Registry and Tree interpretation layers later explain what that addressed occurrence means.

## Illustrative scope-modeling examples

The examples below are illustrative scope-modeling examples, not current runtime emitted addresses.

### Example 1: active scope is `calculogic-validator/`

```text
A       = calculogic-validator/
A.F     = calculogic-validator/tree/
A.F.B   = calculogic-validator/tree/src/
A.F.B.1 = calculogic-validator/tree/src/tree-structure-advisor.host.mjs
```

### Example 2: active scope is whole repository root

```text
A         = repo root
A.C       = calculogic-validator/
A.C.F     = calculogic-validator/tree/
A.C.F.B   = calculogic-validator/tree/src/
A.C.F.B.1 = calculogic-validator/tree/src/tree-structure-advisor.host.mjs
```


## Distinction between address and interpretation layers

To avoid ownership drift, this profile distinguishes the following layers:
- occurrence address: deterministic location identity for a folder/file occurrence within the active scope,
- Structural Home identity: reusable structural-home concept assignment (for example `src`, `doc`, `test`, `scripts`, `config`),
- Semantic Home derivation: Tree/Naming-informed semantic-home interpretation from context and lineage,
- known-root transitional runtime vocabulary: current runtime top-root vocabulary in `tree-known-roots.registry.json`,
- final Tree placement interpretation: full Tree placement result after combining address, lineage, and evidence layers.

## Required ownership boundaries

- Suite scope profiles own command/report scan boundaries.
- Tree occurrence addressing identifies where each folder/file occurrence exists inside the selected scope.
- Structural Home registry identifies reusable structural home identities such as `src`, `doc`, `test`, `scripts`, `config`, and related bounded identities.
- Semantic Home remains derived from folder context, Naming bridge outputs, and Tree interpretation.
- `tree-known-roots.registry.json` is current runtime top-root occurrence vocabulary and compatibility truth.
- `tree-known-roots.registry.json` should not be treated as the long-term canonical Structural Home registry.
- `tree-known-roots.registry.json` should not be treated as the Semantic Home registry.
- Naming may later consume Tree-provided occurrence address/context if needed.
- Naming must not own Tree path/depth interpretation.

## Future model direction (staged implementation path)

Interpretation chain:

suite scope profile  
→ selected validation/addressing scope  
→ Tree occurrence address  
→ folder/file token  
→ parent lineage  
→ structural-home identity evidence  
→ semantic-home derivation evidence  
→ surface/home perspective evidence  
→ Tree placement interpretation

Structural addressing should make repeated folder tokens less ambiguous.

Example: `src` under `calculogic-validator/tree/` and `src` under `calculogic-validator/naming/` are not globally identical occurrences. They are separate addressed structural-home occurrences under different scope/semantic lineage.

## Known-root clarification

- Long-term, explicit known-root lists should not be the primary source of Tree meaning.
- Known root should eventually become a derived property of addressed occurrences.
- `tree-known-roots.registry.json` may remain temporarily as compatibility/runtime vocabulary while Tree occurrence addressing matures.
- This docs slice does not deprecate or change runtime behavior.

## Recommended next minimal action

Create a follow-up issue to audit how `tree-known-roots.registry.json` could eventually be split, derived, or compatibility-wrapped once Tree occurrence addressing has a runtime profile.

That follow-up is out of scope for this documentation slice.
