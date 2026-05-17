# Tree Known-Roots / Structural Addressing Compatibility Bridge Spec

## Status and scope

This defines the known-roots / Structural Addressing compatibility bridge for Tree.
It documents current Tree known-roots compatibility truth, current Tree-local registry reality, Structural Addressing V0 addressed occurrence ownership, and the staged path toward cleaner evidence consumption.
It does not change runtime behavior, Tree advisor behavior, registry JSON payloads, Structural Addressing logic, Naming integration, or validate:addressing behavior.

Issue linkage for this slice:
- Refs #505
- Refs #508
- Follows completed parent #487 (Structural Addressing get-tree V0 implementation path)
- Incorporates prior context from #452 (Tree registry hardening / known-roots compatibility context)

## Purpose and relationship framing

### Purpose and scope

This spec provides a focused compatibility bridge description between:
- Tree known-roots runtime compatibility behavior,
- Tree-local registry payloads already present in the repository,
- Structural Addressing V0 addressed occurrence production,
- and a staged implementation path that preserves behavior while clarifying ownership.

### Relationship to parent #505

This document is the bridge-definition slice under #505. It converts inventory/audit context into explicit ownership and staging boundaries for a later runtime adapter slice.

### Relationship to completed parent #487

Structural Addressing get-tree V0 from #487 is treated as current implemented ownership for deterministic addressed occurrence production (`scopeRoots`, `occurrenceRecords`, `addressPath`, `parentAddressPath`).

### Relationship to prior parent #452

This bridge keeps #452 guardrails: maintain deterministic staging, keep known-roots as compatibility-only runtime truth for now, and avoid collapsing Structural Home / Surface / Naming ownership boundaries.

## Core ownership boundary (binding for this bridge)

Structural Addressing owns deterministic addressed occurrence production.
Tree known-roots remains compatibility runtime truth until replaced or wrapped deliberately.
Structural Home registries own Structural Home identity and placement evidence inputs.
Tree owns Tree-specific interpretation and advisory behavior.
Naming owns semantic-name and semantic-family interpretation.

Interpretation guardrails:
- Do not move Structural Addressing ownership back into Tree.
- Do not treat known roots as the long-term canonical Structural Home or Semantic Home model.

## Current runtime truth

Current runtime truth for Tree known-roots compatibility remains:
- top-root vocabulary (`topRoots`),
- known top-level directory allow-list (`knownTopLevelDirectories`),
- current classification compatibility input,
- unexpected top-level folder behavior input,
- repo-top structural/semantic shortcut behavior,
- partial structural/semantic hints used as compatibility evidence.

This is current runtime truth, not the target architecture.

## Current implementation reality: registry and bridge surfaces

### Tree built-in registry reality inspected for this slice

Current implementation reality in `calculogic-validator/tree/src/registries/_builtin/`:
- `tree-known-roots.registry.json` exists and remains active compatibility runtime truth.
- `structural-homes.registry.json` exists as Tree-local built-in registry data.
- `surface-structural-home-perspective.registry.json` exists as Tree-local built-in registry data.
- `folder-kinds.registry.json` exists as Tree-local built-in registry data.
- standalone shared `surfaces.registry.json` does not clearly appear to exist yet in this repository path set.

### Observed alignment drift to preserve for follow-up slice

Current implementation reality includes a naming/alignment mismatch that should be documented, not changed in this slice:
- `tree-known-roots.registry.json` uses runtime `test` in known roots.
- `structural-homes.registry.json` uses `tests` as structural home identity.
- `surface-structural-home-perspective.registry.json` includes quality mapping that references `test`.

This potential `test`/`tests` alignment drift should be handled in a later implementation slice with explicit adapter/normalization scope.

## Structural Addressing V0 role (already implemented)

Structural Addressing V0 currently owns deterministic addressed occurrence production and render contracts in its slice runtime.
Tree should consume this addressed occurrence evidence, rather than re-own deterministic address production in Tree-local marker logic.

What is already covered by Structural Addressing V0:
- deterministic addressed occurrence production,
- addressed lineage fields (`addressPath`, `parentAddressPath`),
- occurrence ordering and render inspection output contracts.

What is not changed here:
- no Tree runtime rewiring,
- no Structural Addressing runtime changes,
- no validate:addressing behavior changes.

## Long-term target ownership

Target architecture ownership for this bridge:
- Structural Addressing V0 locates addressed occurrences.
- `structural-homes.registry.json` owns Structural Home identity.
- `surface-structural-home-perspective.registry.json` owns contextual Surface → Structural Home evidence.
- `surfaces.registry.json`, if/when added, should own canonical Surface identity rather than hiding Surface identity inside Tree perspective data.
- `tree-known-roots.registry.json` remains compatibility-only until wrapped/reduced/retired.
- Tree advisor consumes evidence and produces Tree-specific findings.
- Naming remains owner of semantic-name and semantic-family interpretation.

## Bridge question answers

### What remains compatibility-only now?

`tree-known-roots.registry.json` and current known-roots-driven top-level compatibility behavior remain compatibility-only current runtime truth.

### What belongs to Structural Home registry?

Structural Home identity vocabulary and bounded definitions belong to `structural-homes.registry.json`.

### What belongs to Surface → Structural Home perspective registry?

Affinity/evidence mapping between surfaces and candidate structural homes belongs to `surface-structural-home-perspective.registry.json`; it is evidence, not final placement authority.

### What is missing/deferred for shared surfaces registry?

A standalone shared `surfaces.registry.json` is not clearly present yet in inspected paths. Surface identity therefore remains effectively embedded/implicit in current perspective payloads and surrounding runtime interpretation context.

### What should Tree consume rather than re-own?

Tree should consume:
- deterministic addressed occurrence outputs from Structural Addressing,
- Structural Home identity/evidence registries,
- compatibility hints from known-roots while transition is active,
then keep Tree-owned advisory interpretation behavior as the final consumer layer.

### What should not change before a runtime adapter slice?

Do not change:
- Tree advisor behavior,
- known-roots runtime compatibility behavior,
- Structural Addressing runtime ownership,
- registry JSON payload contracts.

### Is there a test/tests alignment concern?

Yes. Current implementation reality shows a likely `test`/`tests` alignment concern across known-roots and structural-home identity vocabulary. This should be addressed by a later implementation slice, not this docs/spec slice.

## Compatibility-only known-roots role

Known-roots remains a compatibility lane that preserves deterministic existing Tree advisories and checks while bridge modeling matures.
It should be treated as compatibility runtime truth during transition and not promoted to long-term canonical Structural Home or Semantic Home ownership.

## Tree advisor interpretation role

Tree remains owner of Tree-specific interpretation and advisory behavior.
Even after consuming Structural Addressing addressed occurrence evidence, Tree still owns:
- Tree-specific policy interpretation,
- advisory finding logic,
- confidence/placement interpretation output behavior.

## Staged bridge options and recommended path

### Option A — Keep known-roots compatibility only

Keep existing known-roots runtime behavior unchanged while clarifying ownership and evidence boundaries.

### Option B — Immediate runtime rewiring

Not recommended for this slice because it risks behavior drift before adapter contracts are explicit.

### Option C — Hybrid transition path (recommended)

Recommended staged implementation path:
1. Keep `tree-known-roots` as compatibility runtime truth for current advisories.
2. Treat Structural Addressing V0 as deterministic addressed occurrence producer.
3. Treat Structural Home and Surface → Structural Home registries as identity/evidence sources.
4. Document shared surfaces registry status as missing/deferred current implementation reality.
5. Implement a future adapter slice that wraps/maps known-roots compatibility around addressed occurrence evidence without changing advisor behavior first.
6. Add a later implementation slice for registry alignment normalization (`test` vs `tests` and any shared-surface identity extraction), if confirmed.

## Recommended next implementation slice

Recommended next slice after this bridge spec:
- implement a bounded Tree compatibility adapter that consumes Structural Addressing V0 addressed occurrences and maps known-roots compatibility evidence onto that occurrence model,
- preserve Tree advisor behavior unchanged in the first adapter step,
- then add a dedicated registry alignment slice if `test`/`tests` normalization or shared-surface identity extraction requires deterministic contract updates.

## Explicit non-goals

This bridge spec intentionally does not:
- change runtime behavior,
- change Tree advisor behavior,
- change Structural Addressing runtime logic,
- change registry JSON payloads (`tree-known-roots`, `structural-homes`, `surface-structural-home-perspective`, `folder-kinds`, or any future `surfaces.registry.json`),
- add new shared surfaces registry,
- change Naming integration,
- add or change validate:addressing command behavior.
