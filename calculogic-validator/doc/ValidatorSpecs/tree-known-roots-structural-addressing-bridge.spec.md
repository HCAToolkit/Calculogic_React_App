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
Tree now has an evidence-only known-roots compatibility adapter.
Tree advisor input preparation now prepares compatibility evidence internally.
Tree advisor output remains unchanged.
Known-roots remains compatibility runtime truth.
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
- Tree-owned known-roots compatibility evidence adapter exists.
- Tree advisor wiring prepares known-roots compatibility evidence internally.

### Implemented adapter ownership

`calculogic-validator/tree/src/tree-known-roots-compatibility-evidence.logic.mjs` owns the Tree-side evidence-only adapter:

- input: Structural Addressing-style addressed occurrence records
- input: current Tree known-roots compatibility vocabulary
- output: Tree-owned known-roots compatibility evidence records

The adapter remains compatibility evidence-only. It does not emit findings, severity, placement verdicts, or confidence scores.

### Implemented internal wiring handoff

`calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs` now prepares compatibility evidence internally and attaches it under:

- `preparedDependencies.treeKnownRootsCompatibilityEvidence`

This is internal preparation state and current implementation reality. It is not current runtime truth for report-visible advisor output.

### Implemented addressed occurrence enrichment support

`calculogic-validator/tree/src/tree-structural-address-snapshot.logic.mjs` now enriches internal structural-address snapshot occurrence records with addressed fields required by compatibility evidence preparation:

- `path`
- `name`
- `addressPath`
- `parentAddressPath`

This enrichment supports internal evidence preparation. It does not change Tree advisor/report behavior.

## Repo-top matching behavior (current implementation reality)

Known-roots compatibility evidence matching is repo-top path-shape based, not scope-depth based.

Current implementation reality examples:

- `src` => may produce known-root compatibility evidence.
- `test` => may produce known-root compatibility evidence because current known-roots registry contains `test`.
- `text` => may produce known-root compatibility evidence only if current known-roots registry contains `text`.
- `calculogic-validator/src` => does not produce known-root compatibility evidence.
- `docs/test` => does not produce known-root compatibility evidence.
- `packages/foo/src` => does not produce known-root compatibility evidence.

This bridge does not redefine matching as semantic-home inference, structural-home interpretation, naming semantic-family inference, or scope-depth modeling.

## Current non-observable boundary

Current implementation reality boundary:

- `preparedDependencies.treeKnownRootsCompatibilityEvidence` is prepared internally.
- The prepared evidence is not emitted as Tree advisor findings.
- The prepared evidence is not assigned severity.
- The prepared evidence is not assigned placement verdicts.
- The prepared evidence is not assigned confidence scores.
- The prepared evidence does not change report output.
- The prepared evidence does not change advisor recommendation text.
- Tree advisor output remains unchanged.

## Structural Addressing and Tree interpretation boundary

Structural Addressing V0 currently owns deterministic addressed occurrence production and render contracts in its slice runtime.
Tree remains owner of Tree-specific interpretation and advisory behavior.

This bridge preserves:
- deterministic address production ownership in Structural Addressing,
- compatibility evidence preparation ownership in Tree,
- report/advisor interpretation ownership in Tree,
- known-roots compatibility runtime truth during transition.

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
- current implementation reality: Tree now has an evidence-only compatibility adapter and internal prepared dependency handoff.
- target architecture: move toward cleaner registry-aligned modeling without changing current report behavior.
- not current runtime truth: evidence-driven Tree advisor findings, structural-home/semantic-home interpretation outputs, and registry normalization migration.
- staged implementation path: preserve behavior, preserve ownership boundaries, and migrate in bounded deterministic slices.
