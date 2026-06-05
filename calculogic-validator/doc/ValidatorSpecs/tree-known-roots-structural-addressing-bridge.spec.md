# Tree Known-Roots / Structural Addressing Compatibility Bridge Spec

## Status and scope

This defines the known-roots / Structural Addressing compatibility bridge for Tree.
It documents current runtime truth, current implementation reality, and the staged implementation path after Slice 4 implementation.
It does not change runtime behavior, Tree advisor behavior, registry JSON payloads, Structural Addressing logic, Naming integration, or validate:addressing behavior.

Issue linkage for this slice:
- Refs #505
- Refs #514
- Refs #508
- Follows completed parent #487 (Structural Addressing get-tree V0 implementation path)
- Incorporates prior context from #452 (Tree registry hardening / known-roots compatibility context)

## Purpose and relationship framing

### Purpose and scope

This spec provides a focused compatibility bridge description between:
- Tree known-roots runtime compatibility behavior,
- Tree-local registry payloads already present in the repository,
- Structural Addressing V0 addressed occurrence production,
- Tree-owned evidence preparation now implemented,
- and a staged implementation path that preserves behavior while clarifying ownership.

### Relationship to parent #505

This document is the bridge-definition and bridge-state alignment slice under #505.

### Relationship to completed parent #487

Structural Addressing get-tree V0 from #487 is treated as current runtime truth ownership for deterministic addressed occurrence production (`scopeRoots`, `occurrenceRecords`, `addressPath`, `parentAddressPath`).

## Core ownership boundary (binding for this bridge)

Structural Addressing remains the owner of deterministic address production.
Tree no longer has an evidence-only known-roots compatibility adapter in current implementation reality.
Tree advisor input preparation no longer prepares known-roots compatibility evidence internally.
Tree advisor output remains unchanged.
Known-roots remains default legacy/fallback compatibility runtime truth only.
Registry alignment remains deferred.
test / tests normalization remains deferred.
Shared surfaces.registry.json remains deferred.

Interpretation guardrails:
- This bridge does not move deterministic address ownership back into Tree.
- This bridge does not make known-roots canonical Structural Home truth.
- This bridge does not make known-roots canonical Semantic Home truth.
- This bridge does not make Structural Addressing responsible for Tree interpretation.
- This bridge does not make prepared compatibility evidence user-facing advisor output.

## Current runtime truth

Current runtime truth for Tree known-roots compatibility remains:
- top-root vocabulary (`topRoots`),
- known top-level directory allow-list (`knownTopLevelDirectories`),
- current classification compatibility input,
- unexpected top-level folder behavior input,
- repo-top structural/semantic shortcut behavior,
- partial structural/semantic hints used as compatibility evidence.

This is current runtime truth, not target architecture.

## Current implementation reality after Slice 4

### Implemented docs/spec surfaces

Current implementation reality includes:
- Tree structural-address usage inventory exists (`tree-structural-address-usage-inventory.spec.md`).
- Known-roots / Structural Addressing compatibility bridge spec exists (this document).
- Tree-owned known-roots compatibility evidence adapter was removed by the #569 cleanup bridge after occurrence classification and unexpected top-level folder guarded replacement coverage existed.
- Tree advisor wiring no longer prepares known-roots compatibility evidence internally; retained known-roots runtime use is limited to default legacy/fallback paths and final-deletion candidates.

### Retired adapter ownership

`calculogic-validator/tree/src/tree-known-roots-compatibility-evidence.logic.mjs` was a Tree-side evidence-only adapter for known-roots compatibility matching. Current implementation reality after the #569 cleanup bridge is that the adapter and its wiring handoff are removed because no guarded replacement or fallback runtime path consumes `preparedDependencies.treeKnownRootsCompatibilityEvidence`.

Retained known-roots references remain compatibility/fallback dependencies for the default legacy path and final-deletion candidates for a later known-roots deletion slice.

### Implemented addressed occurrence enrichment support

`calculogic-validator/tree/src/tree-structural-address-snapshot.logic.mjs` enriches internal structural-address snapshot occurrence records with addressed fields used by Tree evidence preparation:

- `path`
- `name`
- `addressPath`
- `parentAddressPath`

This enrichment supports internal Tree evidence preparation. It does not change Tree advisor/report behavior.

## Repo-top matching behavior (retired bridge behavior)

Known-roots compatibility evidence matching was repo-top path-shape based, not scope-depth based. Current implementation reality no longer prepares that evidence bridge.

This retired bridge did not redefine matching as semantic-home inference, structural-home interpretation, naming semantic-family inference, or scope-depth modeling.

## Current non-observable boundary

Current implementation reality boundary:

- `preparedDependencies.treeKnownRootsCompatibilityEvidence` is no longer prepared internally.
- Known-roots-backed runtime behavior remains available only through default legacy/fallback paths.
- Removed compatibility evidence was not emitted as Tree advisor findings.
- Removed compatibility evidence was not assigned severity, placement verdicts, confidence scores, report output, or advisor recommendation text.
- Tree advisor output remains unchanged.

## Structural Addressing and Tree interpretation boundary

Structural Addressing V0 currently owns deterministic addressed occurrence production and render contracts in its slice runtime.
Tree remains owner of Tree-specific interpretation and advisory behavior.

This bridge preserves:
- deterministic address production ownership in Structural Addressing,
- compatibility/fallback runtime ownership in Tree,
- report/advisor interpretation ownership in Tree,
- known-roots-backed default legacy/fallback runtime truth during transition.

## Deferred work (staged implementation path)

The following remain deferred and are not current runtime truth:

- registry alignment
- test / tests normalization
- standalone shared `surfaces.registry.json` extraction or introduction
- Tree-local vs shared registry ownership migration
- semantic-home classification
- structural-home interpretation
- Tree advisor findings based on compatibility evidence
- `validate:addressing` commands
- NL addressing
- code-file addressing
- NL-to-code comparison
- Naming semantic-family bridge integration

## Non-goals

This bridge documentation slice does not add or change:

- runtime behavior
- Tree advisor behavior
- Tree advisor findings
- finding codes
- severity
- placement verdicts
- confidence scoring
- validation-style reports
- semantic-home classification
- structural-home interpretation
- broader scatter heuristics
- `validate:addressing` commands
- `validate:addressing:nl` commands
- `validate:addressing:code` commands
- `validate:addressing:nl-code` commands
- NL addressing
- code-file addressing
- NL-to-code comparison
- Naming validation integration
- package bin entrypoints
- root npm scripts
- report-capture commands
- registry JSON payloads
- shared surfaces registry
- Structural Addressing runtime logic
- Tree advisor output behavior

## Precise status wording map for this bridge

- current runtime truth: known-roots remains compatibility runtime truth; Structural Addressing owns deterministic address production.
- current implementation reality: the evidence-only compatibility adapter and internal prepared dependency handoff were removed by #569 / PR #570; retained known-roots references remain default legacy/fallback compatibility dependencies or final-deletion candidates.
- target architecture: move toward cleaner registry-aligned modeling without changing current report behavior.
- not current runtime truth: evidence-driven Tree advisor findings, structural-home/semantic-home interpretation outputs, and registry normalization migration.
- staged implementation path: preserve behavior, preserve ownership boundaries, and migrate in bounded deterministic slices.
