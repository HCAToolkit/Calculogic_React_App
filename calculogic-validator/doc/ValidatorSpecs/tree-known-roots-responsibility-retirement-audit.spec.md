# Tree Known-Roots Responsibility Retirement Audit

> Status after issue #572: This document is retained as historical docs/spec context. Any known-roots statements describing active runtime ownership are not current runtime truth; current runtime truth is that Tree known-roots registry/runtime dependencies are retired and replacement Tree evidence controls the relevant runtime paths.


## 1. Status and scope

This is a docs/audit-only slice under #516.

Issue linkage:
- Refs #516
- Refs #517
- Follows #505 and completed #506, #508, #510, #512, and #514 slices.

This audit identifies the remaining responsibilities currently carried by `tree-known-roots.registry.json` and related helpers, tests, docs, and advisor paths before known-roots can be split, replaced, and removed.

This audit does not change:
- runtime behavior
- registry payloads
- Tree advisor output
- Structural Addressing logic
- Naming integration
- validation commands

Current ownership boundary used throughout this audit:

```text
Structural Addressing owns deterministic occurrence/address production.
Tree owns structural-home interpretation.
Tree owns semantic-home interpretation.
Tree owns folder-kind interpretation.
Tree owns placement/advisor policy.
Naming owns semantic-name and semantic-family interpretation.
Tree may consume Naming-prepared evidence through an explicit bridge.
tree-known-roots is transitional compatibility data only.
```

Important distinction: Structural Addressing replaces known-roots only for deterministic occurrence/location evidence. Tree replaces known-roots for structural-home and semantic-home interpretation. Naming provides semantic-name and semantic-family evidence through an explicit prepared-evidence bridge. The compatibility adapter is scaffolding, not target architecture, and known-roots must not be promoted into permanent canonical truth.

Required artifact inspection result: `calculogic-validator/tree/src/tree-known-roots-registry.logic.mjs` was listed for inspection but does not exist in current implementation reality. The current registry loader path is `calculogic-validator/tree/src/registries/tree-known-roots-registry.logic.mjs`.

## 2. Current known-roots artifacts

### Registry payloads

| Artifact | Current role |
| --- | --- |
| `calculogic-validator/tree/src/registries/_builtin/tree-known-roots.registry.json` | Stores `topRoots` entries and legacy-compatible `knownTopLevelDirectories`. Current entries include structural roots such as `src`, `doc`, `test`, `scripts`, and semantic custom roots such as `calculogic-validator` and `calculogic-doc-engine`. |

### Registry loaders/normalizers

| Artifact | Current role |
| --- | --- |
| `calculogic-validator/tree/src/registries/tree-known-roots-registry.logic.mjs` | Loads and caches the builtin known-roots registry. Normalizes structured `topRoots`, validates enum values for `kind` and `ownershipSource`, validates optional `styleClass`, deduplicates compatible duplicate structured roots, supports legacy flat `knownTopLevelDirectories`, and returns both canonical `topRoots` and a `knownTopLevelDirectories` `Set`. |
| `calculogic-validator/tree/src/tree-known-roots-registry.logic.mjs` | Missing. No current artifact exists at this path. |

### Compatibility evidence adapter

| Artifact | Current role |
| --- | --- |
| `calculogic-validator/tree/src/tree-known-roots-compatibility-evidence.logic.mjs` | Removed by the #569 cleanup bridge. It was dead compatibility-bridge preparation after guarded replacement coverage existed for occurrence classification and unexpected top-level folder policy; no current legacy/fallback runtime path consumes `preparedDependencies.treeKnownRootsCompatibilityEvidence`. |

### Tree advisor wiring/prepared dependencies

| Artifact | Current role |
| --- | --- |
| `calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs` | Prepares occurrence and structural-address snapshots, loads builtin known-roots for default legacy/fallback compatibility paths and parity planning, and passes normal Tree advisor inputs and contributors into runtime. It no longer prepares `preparedDependencies.treeKnownRootsCompatibilityEvidence`. |
| `calculogic-validator/tree/src/tree-occurrence-snapshot.logic.mjs` | Produces Tree occurrence records with deterministic scope roots, lineage, occurrence markers, depth, scoped-root flags, and scope-top occurrence flags from selected paths and targets. It does not interpret known-roots directly. |
| `calculogic-validator/tree/src/tree-structural-address-snapshot.logic.mjs` | Converts occurrence snapshot records into addressed snapshot records with `path`, `name`, `addressPath`, and `parentAddressPath` fields used by Tree evidence preparation. It does not interpret structural homes, semantic homes, or placement policy. |

### Tree advisor logic/report paths

| Artifact | Current role |
| --- | --- |
| `calculogic-validator/tree/src/tree-structure-advisor.logic.mjs` | Loads builtin known-roots at runtime, uses `knownTopLevelDirectories` as the allow-list for `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` findings in repo scope, and passes `TREE_KNOWN_ROOTS` into `classifyTreeOccurrenceRecords(...)` for occurrence-derived classification. Report-visible unexpected top-level folder behavior and internal file-reasoning classification still depend on known-roots. |
| `calculogic-validator/tree/src/tree-occurrence-classification.logic.mjs` | Consumes known-roots `topRoots` metadata to classify repo-top occurrence records. It reads `topRoots[].kind`, then produces `structuralClass`, `structuralKind`, `isKnownTopRoot`, `isStructuralRoot`, and `isSemanticRoot` fields for occurrence records. |

### Tests

| Artifact | Current role |
| --- | --- |
| `calculogic-validator/tree/test/tree-known-roots-registry.test.mjs` | Locks registry normalization, legacy flat payload support, structured payload support, structured precedence over dual-shape payloads, enum validation, duplicate conflict failures, non-empty requirements, `styleClass` validation, and current stable known-root values including semantic custom entries. |
| `calculogic-validator/tree/test/tree-known-roots-compatibility-evidence.logic.test.mjs` | Removed by the #569 cleanup bridge because it only covered dead compatibility evidence preparation state. |
| `calculogic-validator/tree/test/tree-structure-advisor.test.mjs` | Locks Tree advisor wiring and output behavior: runtime report output remains deterministic, known roots remain available for bounded default legacy/fallback registry policy, unexpected top-level folder behavior remains stable, explicit guarded replacement behavior remains stable, and finding summaries remain deterministic. |
| `calculogic-validator/tree/test/tree-occurrence-classification.test.mjs` | Locks current occurrence classification behavior for known repo-top structural roots, known repo-top semantic roots, scoped rebasing, repeated names across depth/context, and unknown cases. It confirms structural and semantic repo-top classification behavior derived from known-roots metadata. |

### Docs/specs/audits

| Artifact | Current role |
| --- | --- |
| `calculogic-validator/doc/ValidatorSpecs/tree-known-roots-structural-addressing-bridge.spec.md` | Documents current implementation reality for the retired known-roots / Structural Addressing compatibility evidence bridge. It states that retained known-roots runtime references remain default legacy/fallback compatibility truth and final-deletion candidates, not target architecture. |
| `calculogic-validator/doc/ValidatorSpecs/tree-known-roots-derived-compatibility-path.audit.md` | Audits derived compatibility path options and documents the bridge between current known-roots behavior and a target architecture that separates occurrence evidence from Tree interpretation. |
| `calculogic-validator/doc/ValidatorSpecs/tree-structural-address-usage-inventory.spec.md` | Inventories Tree structural-address usage and documents that Structural Addressing provides deterministic addressed occurrence evidence while Tree remains responsible for interpretation. |
| `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-addressed-occurrence-evidence-model.spec.md` | Defines Tree-owned addressed occurrence evidence modeling boundaries and reinforces that address evidence locates occurrences rather than owning structural-home, semantic-home, or placement interpretation. |
| `calculogic-validator/doc/ValidatorSpecs/tree-occurrence-addressing-profile.audit.md` | Describes Tree occurrence addressing profile context and explicitly identifies known-roots as current runtime top-root occurrence vocabulary and compatibility truth, not long-term canonical Structural Home or Semantic Home truth. |
| `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md` | Defines current Tree advisor runtime/spec behavior, including current advisory-structure behavior and bounded modeling notes used as runtime authority for Tree advisor validation. |
| `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md` | Validator-owned NL/config note for Tree advisor behavior and current Tree configuration context. |

## 3. Current responsibilities carried by known-roots

The responsibilities below are included only where current code, tests, or docs support them.

### Top-level folder recognition

`tree-known-roots.registry.json` provides current top-root vocabulary through structured `topRoots` and legacy-compatible `knownTopLevelDirectories`. The runtime loader returns `knownTopLevelDirectories` as a `Set`, and Tree advisor logic uses that set for repo-scope top-level directory recognition.

### Repo-top path-shape compatibility matching

The compatibility evidence adapter only matches folder occurrences whose `path` is a single repo-top token with no slash or backslash. Tests confirm that `src` can match while `calculogic-validator/src`, `docs/test`, `packages/foo/src`, and file occurrences do not match.

### Runtime compatibility behavior

Known-roots is still current runtime truth for the Tree advisor's unexpected top-level folder allow-list. The compatibility bridge docs describe known-roots as compatibility runtime truth and current implementation reality, not target architecture.

### Unexpected top-level folder behavior

Tree advisor runtime reports `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` findings in repo scope for top-level directories that are absent from `TREE_KNOWN_ROOTS.knownTopLevelDirectories`. Findings include the sorted known-root list in `details.knownRoots`.

### Structural-home hints

Structured `topRoots` include `kind: "structural"` for entries such as `src`, `doc`, `docs`, `scripts`, `test`, `tools`, `public`, and `bin`. Current docs describe these as partial structural/semantic hints and state they are compatibility evidence, not canonical Structural Home truth.

### Occurrence-derived structural/semantic classification

Known-roots is not only passive registry metadata. Tree advisor runtime passes `TREE_KNOWN_ROOTS` into `classifyTreeOccurrenceRecords(...)`, and `tree-occurrence-classification.logic.mjs` reads `topRoots[].kind` to produce occurrence classification fields. Current known-roots metadata contributes to `structuralClass`, `structuralKind`, `isKnownTopRoot`, `isStructuralRoot`, and `isSemanticRoot`, including repo-top structural classification and repo-top semantic classification.

### Semantic-home-ish hints

Structured `topRoots` include `kind: "semantic"` and `ownershipSource: "custom"` for repo-local roots `calculogic-validator` and `calculogic-doc-engine`. Current docs identify this as partial semantic hinting mixed into known-roots compatibility data, not canonical Semantic Home truth.

### Folder allow-list behavior

`knownTopLevelDirectories` is the runtime allow-list for top-level folder findings. Registry tests also lock structured precedence over dual-shape payloads, so the allow-list is derived from `topRoots` when structured data exists.

### Legacy Tree advisor assumptions

Tree advisor logic imports the known-roots loader directly and binds `TREE_KNOWN_ROOTS` at module load. The report-visible unexpected top-level folder behavior still assumes known-roots is the source for acceptable repo-top directories.

### Removed compatibility evidence

Tree advisor wiring no longer prepares `preparedDependencies.treeKnownRootsCompatibilityEvidence`. The #569 cleanup bridge removed that dead internal handoff because no current guarded replacement or fallback runtime path consumes it.

### Registry normalization/shape validation

The loader supports two accepted payload shapes: structured `topRoots` and legacy flat `knownTopLevelDirectories`. It validates structured enum values, optional `styleClass`, duplicate metadata conflicts, non-empty payload requirements, and deterministic sorting/deduplication.

### Test / tests non-normalization

Compatibility evidence tests confirm current known-root values are preserved without `test` / `tests` normalization. Only `test` matches when `test` is the registered root.

## 4. Responsibility-to-owner mapping

| Responsibility | Current known-roots role | Long-term owner | Replacement path | Current blockers | Recommended follow-up slice |
| --- | --- | --- | --- | --- | --- |
| Top-level occurrence/location recognition | Provides top-root vocabulary and allow-list tokens. | Structural Addressing occurrence evidence | Use addressed occurrence records to identify deterministic repo-top or scope-top folder occurrences without assigning meaning. | Runtime advisor still consumes `knownTopLevelDirectories` directly for report-visible behavior. | Define target replacement model for top-level occurrence evidence. |
| Repo-top path-shape matching | Removed compatibility adapter matched only slash-free repo-top folder `path` values against known-roots. | Structural Addressing occurrence evidence | Replacement/fallback runtime paths now rely on guarded route behavior instead of this internal bridge. | Adapter was compatibility-only and is removed in current implementation reality. | No action in this slice; final known-roots deletion remains separate. |
| Unexpected top-level folder policy | Supplies allow-list used to decide whether a repo-top directory is unexpected. | Tree advisor policy | Move policy to Tree-owned advisor rules fed by addressed occurrence evidence and Tree-owned folder-kind/structural-home evidence. | `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` output currently depends on known-roots list and details payload. | Reduce known-roots runtime usage in bounded advisor-policy slice. |
| Structural root hints | Stores `kind: "structural"` on builtin roots. | Tree structural-home logic | Replace `kind: structural` hints with Tree-owned structural-home interpretation for addressed folder occurrences. | Structural-home interpretation path is not implemented as a replacement for known-roots. | Introduce Tree-owned structural-home interpretation path. |
| Occurrence-derived structural/semantic classification | `topRoots[].kind` supplies structural/semantic classification metadata for repo-top occurrence records and currently drives `structuralClass`, `structuralKind`, and known-root flags. | Tree structural-home logic; Tree semantic-home logic; Tree folder-kind logic; possibly Naming-prepared semantic-family evidence for semantic interpretation | Derive classification from addressed occurrence evidence plus Tree-owned structural-home, semantic-home, and folder-kind interpretation instead of known-roots `kind` hints. Semantic interpretation should consume Naming-prepared evidence through an explicit bridge when needed. | Classification logic and tests currently depend on known-roots `topRoots` metadata. | Define target replacement model for occurrence classification before reducing known-roots runtime usage. |
| Semantic custom root hints | Stores `kind: "semantic"` for repo-local custom roots. | Tree semantic-home logic | Replace semantic root hinting with Tree semantic-home interpretation using occurrence context and prepared evidence. | Semantic-home logic is not implemented as a replacement for known-roots. | Introduce Tree-owned semantic-home interpretation path. |
| Naming-side semantic family signals | Known-roots currently mixes repo-local semantic identity into Tree compatibility data. | Naming-prepared semantic-family evidence | Naming should prepare semantic-name/semantic-family evidence through an explicit bridge that Tree can consume. | Naming semantic-family bridge is not implemented as a known-roots replacement. | Introduce Naming-prepared semantic-family bridge evidence. |
| Folder allow-list behavior | `knownTopLevelDirectories` acts as current top-level directory allow-list. | Tree folder-kind logic and Tree advisor policy | Replace flat allow-list with Tree folder-kind interpretation plus advisor policy for allowed/expected top-level folders. | Allow-list details are report-visible today; replacement must preserve or intentionally migrate output in a bounded slice. | Define Tree folder-kind logic and advisor-policy migration plan. |
| Registry payload shape compatibility | Loader supports structured and legacy payload shapes and exposes a compatibility `Set`. | registry alignment work | Stage registry alignment so any replacement registries have explicit ownership and no competing policy truth. | Tree-local vs shared registry ownership and standalone shared `surfaces.registry.json` status remain unresolved in docs. | Resolve or stage registry alignment blockers. |
| Internal compatibility evidence | Removed adapter prepared known-root evidence records from addressed snapshots. | legacy/fallback runtime coverage | Removed by #569 after dependency analysis showed no current guarded replacement/fallback runtime consumer. | Adapter and adapter tests are removed in current implementation reality. | No action in this slice; final known-roots deletion remains separate. |
| Test / tests literal handling | Known-roots preserves literal registered roots without plural normalization. | registry alignment work | Preserve literal compatibility until registry alignment decides whether any aliasing belongs in Naming, Tree folder-kind policy, or neither. | Current tests lock non-normalization. | Include `test` / `tests` decision in registry alignment slice. |

## 5. Keep vs replace vs remove table

| Piece | Classification | Notes for future task |
| --- | --- | --- |
| `tree-known-roots.registry.json` | keep temporarily | Transitional compatibility runtime truth only; do not delete, rename, split, or promote to permanent architecture in this slice. |
| `topRoots[].root` | replace with addressed occurrence evidence | Use Structural Addressing for deterministic occurrence/location evidence; Tree may still interpret addressed occurrences. |
| `topRoots[].kind` | replace with Tree structural-home logic / Tree semantic-home logic | Current `structural` and `semantic` values are compatibility hints and active occurrence-classification inputs; they feed `structuralClass`, `structuralKind`, and known-root flags for repo-top occurrences. |
| `topRoots[].ownershipSource` | resolve in registry alignment | Current builtin/custom distinction may inform migration, but owner and replacement registry shape need explicit alignment. |
| `topRoots[].styleClass` | resolve in registry alignment | Current style class is registry metadata; no confirmed long-term owner in this audit. |
| `knownTopLevelDirectories` | replace with Tree folder-kind logic and Tree advisor policy | Current allow-list behavior is report-visible and must migrate in behavior-preserving slices. |
| `tree-known-roots-registry.logic.mjs` loader under `tree/src/registries` | keep temporarily | Retain until replacement registries and runtime bridges exist. |
| Missing flat `tree/src/tree-known-roots-registry.logic.mjs` path | remove after no runtime dependency remains | No current file exists; no retirement action needed except avoiding new dependency on this missing path. |
| `prepareTreeKnownRootsCompatibilityEvidence` | removed by #569 | Compatibility adapter was dead scaffolding after guarded replacement coverage existed; not target architecture. |
| `preparedDependencies.treeKnownRootsCompatibilityEvidence` | removed by #569 | Internal prepared state was output-neutral and unconsumed by current guarded replacement/fallback runtime paths. |
| Direct `TREE_KNOWN_ROOTS.knownTopLevelDirectories` advisor usage | replace with Tree advisor policy | Confirmed report-visible dependency for unexpected top-level findings. |
| Direct `TREE_KNOWN_ROOTS.topRoots` occurrence-classification usage | replace with Tree structural-home logic / Tree semantic-home logic / Tree folder-kind logic | Confirmed runtime dependency through `classifyTreeOccurrenceRecords(...)`; replace before retiring known-roots. |
| Registry shape tests | keep temporarily | Preserve while current runtime truth exists; replace with registry alignment tests after migration. |
| Compatibility evidence tests | removed by #569 | Removed with the dead adapter contract; default legacy/fallback behavior remains covered elsewhere. |
| Tree advisor known-roots tests | replace with Tree advisor policy tests | Must be updated only when behavior-preserving replacement path exists. |
| Bridge/audit docs | keep temporarily | Keep as staged implementation path records until known-roots retirement is complete. |

## 6. Current blockers to removal

### Confirmed blocker: report-visible unexpected top-level folder behavior

Tree advisor runtime still imports builtin known-roots and uses `knownTopLevelDirectories` to decide `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` findings. Removing known-roots before replacing this policy would change Tree advisor output.

### Confirmed blocker: occurrence classification depends on known-roots topRoots metadata

`tree-structure-advisor.logic.mjs` passes `TREE_KNOWN_ROOTS` into `classifyTreeOccurrenceRecords(...)`. `tree-occurrence-classification.logic.mjs` reads `topRoots[].kind` and uses it to set `structuralClass`, `structuralKind`, `isKnownTopRoot`, `isStructuralRoot`, and `isSemanticRoot`. `tree-occurrence-classification.test.mjs` locks known repo-top structural and semantic classification cases. Removing or replacing only the unexpected-folder allow-list would leave this runtime known-roots dependency in place.

### Confirmed blocker: registry loader and shape tests

The registry loader and `tree-known-roots-registry.test.mjs` lock accepted payload shapes, validation behavior, structured precedence, stable current roots, and non-empty requirements. Removing the payload or loader before replacement tests exist would break current test coverage.

### Removed cleanup bridge: compatibility evidence adapter tests

`tree-known-roots-compatibility-evidence.logic.test.mjs` was removed by the #569 cleanup bridge because the adapter covered dead preparation state rather than current guarded replacement/fallback runtime behavior. Default legacy/fallback runtime behavior remains covered by known-roots registry, occurrence classification, runtime routing, and Tree advisor tests.

### Removed cleanup bridge: Tree advisor wiring prepared dependency

`tree-structure-advisor.wiring.mjs` no longer prepares `preparedDependencies.treeKnownRootsCompatibilityEvidence`. Tree advisor tests continue to cover default known-roots-backed legacy/fallback behavior and explicit guarded replacement behavior without the dead compatibility bridge dependency.

### Confirmed blocker: `test` / `tests` alignment is intentionally not normalized

Tests confirm that `test` and `tests` remain distinct and that `tests` does not match when only `test` is registered. Any replacement must preserve current implementation reality or make an explicit migration decision in a separate slice.

### Possible blocker: Tree-local vs shared registry ownership

Current docs reference registry alignment as deferred. This audit confirms Tree-local known-roots ownership today, but does not confirm the final registry ownership model for structural homes, folder kinds, semantic homes, or shared surface-related registry data.

### Possible blocker: standalone shared `surfaces.registry.json` status

Prior bridge docs list shared `surfaces.registry.json` as deferred. This audit did not confirm a runtime dependency from known-roots to a shared surfaces registry, so this remains possible/follow-up registry alignment work rather than a confirmed removal blocker.

### Needs follow-up: surface-to-structural-home perspective expectations

Search terms found docs discussing structural homes and surface/home perspective boundaries, but this audit did not confirm a direct known-roots runtime dependency for surface structural home behavior. Follow-up registry/model alignment should decide whether any surface perspective evidence is separate from Tree structural-home interpretation.

### Needs follow-up: semantic-home logic not implemented as replacement

Known-roots currently carries semantic-ish hints for custom repo-local roots. This audit does not find a replacement semantic-home interpretation path that can fully retire those hints.

### Needs follow-up: Naming semantic-family bridge not implemented as replacement

Tree advisor wiring accepts `namingSemanticFamilyBridge` for contributors, but this audit does not find a known-roots replacement bridge where Naming-prepared semantic-family evidence replaces semantic custom root hints.

### Not confirmed in this audit: Structural Addressing owns Tree interpretation

No inspected current artifact establishes Structural Addressing as owner of structural-home, semantic-home, folder-kind, or placement/advisor interpretation. Structural Addressing remains limited to deterministic occurrence/location evidence for this retirement path.

## 7. Recommended next slices

1. Define the target replacement model for known-roots responsibilities.
   - Separate deterministic occurrence evidence, Tree structural-home logic, Tree semantic-home logic, Tree folder-kind logic, Tree advisor policy, and Naming-prepared evidence.
2. Resolve or stage registry alignment blockers.
   - Decide which replacement registries, if any, own structural-home identities, folder-kind vocabularies, semantic-home evidence, and compatibility metadata.
3. Define the target replacement model for occurrence classification before reducing known-roots runtime usage.
   - Replace `topRoots[].kind`-driven `structuralClass`, `structuralKind`, and known-root flags with addressed occurrence evidence plus Tree-owned interpretation paths.
4. Introduce a Tree-owned structural-home interpretation path.
   - Consume addressed occurrence evidence and produce Tree-owned structural-home evidence without depending on known-roots `kind: structural` hints.
5. Introduce a Tree-owned semantic-home interpretation path using Naming-prepared evidence when available.
   - Keep Naming semantic-name and semantic-family interpretation behind an explicit prepared-evidence bridge.
6. Introduce Tree-owned folder-kind interpretation and advisor-policy replacement for top-level allow-list behavior.
   - Preserve current `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` behavior until a bounded behavior-preserving migration is ready.
7. Reduce known-roots runtime usage in bounded behavior-preserving slices.
   - Remove direct advisor and occurrence-classification usage only after equivalent prepared evidence/policy exists and tests are updated.
8. Retire/archive known-roots after dependency analysis proves safe.
   - Compatibility adapter and prepared dependency are already removed; remove registry loader, remaining tests, and payload only after no runtime dependency remains.

## Final retirement guardrails

- Structural Addressing replaces known-roots for location/occurrence evidence only.
- Tree replaces known-roots for structural-home and semantic-home interpretation.
- Tree owns folder-kind reasoning and placement/advisor policy.
- Naming provides semantic-name and semantic-family evidence through an explicit bridge.
- The removed compatibility adapter was temporary scaffolding, not target architecture.
- Known-roots should not become permanent canonical Structural Home, Semantic Home, folder-kind, or Naming truth.
