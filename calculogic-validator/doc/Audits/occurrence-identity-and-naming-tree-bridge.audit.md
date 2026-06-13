# Occurrence Identity and Naming → Tree Bridge Audit

Issue context: Refs #619 and Refs #618.

## 1. Scope, authority, and files inspected

This audit is one planning slice only. It records current runtime truth before any address-keyed Naming bridge implementation work. It does not change runtime behavior, Naming bridge payloads, Tree join behavior, occurrence identity fields, known-roots behavior, CLI behavior, or report envelopes.

Audit location rationale: `calculogic-validator/doc/Audits/` is the smallest established validator docs path for bounded repo-reality audits. This file is intentionally an audit artifact, not a new runtime/spec contract.

Runtime authority was assigned in this order for this slice:

1. current source files, tests, package scripts, and validator entrypoints;
2. current convention/spec docs where they describe current runtime truth;
3. issue #618 only as roadmap context for the target architecture.

Files and surfaces inspected:

- Suite-core transport and report surfaces:
  - `calculogic-validator/src/core/scoped-target-paths.logic.mjs`
  - `calculogic-validator/src/core/suite-scoped-snapshot-input.logic.mjs`
  - `calculogic-validator/src/core/source-snapshot.logic.mjs`
  - `calculogic-validator/src/core/validator-runner.logic.mjs`
  - `calculogic-validator/src/core/validator-scopes.logic.mjs`
  - `calculogic-validator/src/core/validator-root-files.knowledge.mjs`
  - `calculogic-validator/src/core/cli/validator-cli-targets.logic.mjs`
  - `package.json`
  - `calculogic-validator/package.json`
- Naming production surfaces:
  - `calculogic-validator/naming/src/naming-validator.logic.mjs`
  - `calculogic-validator/naming/src/naming-semantic-family-bridge-projection.logic.mjs`
  - `calculogic-validator/naming/src/naming-semantic-evidence-bridge.logic.mjs`
  - `calculogic-validator/naming/src/naming-runtime-converters.logic.mjs`
  - `calculogic-validator/naming/src/rules/naming-rule-parse-canonical.logic.mjs`
  - `calculogic-validator/naming/src/rules/naming-rule-derive-semantic-family.logic.mjs`
  - `calculogic-validator/naming/src/rules/naming-rule-derive-disambiguation-hints.logic.mjs`
  - `calculogic-validator/naming/test/naming-semantic-family-bridge-projection.test.mjs`
  - `calculogic-validator/naming/test/naming-semantic-evidence-bridge.logic.test.mjs`
- Tree occurrence, address, bridge consumption, evidence, and advisor surfaces:
  - `calculogic-validator/tree/src/tree-occurrence-snapshot.logic.mjs`
  - `calculogic-validator/tree/src/tree-structural-address-snapshot.logic.mjs`
  - `calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs`
  - `calculogic-validator/tree/src/tree-structure-advisor.logic.mjs`
  - `calculogic-validator/tree/src/tree-semantic-home-evidence.logic.mjs`
  - `calculogic-validator/tree/src/tree-structural-home-evidence.logic.mjs`
  - `calculogic-validator/tree/src/tree-folder-kind-evidence.logic.mjs`
  - `calculogic-validator/tree/src/tree-occurrence-classification.logic.mjs`
  - `calculogic-validator/tree/src/contributors/tree-naming-semantic-family-bridge-contributor.logic.mjs`
  - `calculogic-validator/tree/src/contributors/tree-naming-semantic-family-bridge-contributor.wiring.mjs`
  - `calculogic-validator/tree/src/tree-structure-advisor-contributors-assembly.wiring.mjs`
  - `calculogic-validator/tree/test/tree-occurrence-snapshot.test.mjs`
  - `calculogic-validator/tree/test/tree-structural-address-snapshot.logic.test.mjs`
  - `calculogic-validator/tree/test/tree-semantic-home-evidence.logic.test.mjs`
  - `calculogic-validator/tree/test/tree-naming-semantic-family-bridge-contributor.test.mjs`
- Structural-addressing current shape:
  - `calculogic-validator/structural-addressing/src/structural-addressing-profile.knowledge.mjs`
  - `calculogic-validator/structural-addressing/src/structural-addressing-marker-strategies.logic.mjs`
  - `calculogic-validator/structural-addressing/src/structural-addressing-tree-codebase.logic.mjs`
  - `calculogic-validator/structural-addressing/src/structural-addressing-render-tree.logic.mjs`
  - `calculogic-validator/structural-addressing/test/*.test.mjs`
- Relevant docs inspected as contract/spec context:
  - `calculogic-validator/doc/ConventionRoutines/CCPP.md`
  - `calculogic-validator/doc/ConventionRoutines/CCS.md`
  - `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
  - `doc/ConventionRoutines/General-NL-Skeletons.md`
  - `doc/ConventionRoutines/NL-First-Workflow.md`
  - `README.md`
  - `calculogic-validator/README.md`
  - `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
  - `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md`
  - `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
  - `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md`
  - `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md`
  - `calculogic-validator/doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md`
  - `calculogic-validator/doc/ConventionRoutines/ValidatorHelperAreas-And-Reuse-Conventions.md`
  - `calculogic-validator/doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md`
  - `calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md`
  - `calculogic-validator/doc/ConventionRoutines/DocumentContentClassificationConvention-V1.md`
  - `calculogic-validator/doc/ConventionRoutines/TerminologyScoping-Conventions-V1.md`

## 2. Current runtime truth summary

Current runtime truth:

- Suite-core owns neutral scope/target transport, selected path collection, target descriptor normalization, source snapshot metadata, and report envelope metadata.
- Naming owns filename parsing and semantic interpretation. Its Tree bridge projection is currently path-keyed and semantic-family-oriented.
- Tree currently prepares occurrence and structural-address snapshots for its own runtime, then consumes Naming evidence through two routes:
  - Tree semantic-home evidence joins addressed occurrence records to Naming semantic evidence records by `path`.
  - The Tree naming semantic-family contributor independently consumes the staged Naming bridge observations by `path` and semantic family to emit bounded advisory findings.
- `calculogic-validator/structural-addressing/**` exists and has an active current implementation shape, but the normal Tree validator runtime inspected here uses Tree-local occurrence and structural-address snapshot modules rather than importing the structural-addressing slice provider.
- No current Naming bridge payload carries `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`, `addressPath`, `parentOccurrenceAddress`, `parentAddressPath`, `depth`, or `root lane`.
- Current Tree addressed occurrence records carry address-like fields named `addressPath` and `parentAddressPath`, not `occurrenceAddress`.

## 3. Suite-core target/scope transport map

| Surface | Current payload fields | Current owner | Current classification |
| --- | --- | --- | --- |
| CLI target parsing | `--target`, `--target=<path>`, normalized slash paths | suite-core CLI | target transport only |
| Target resolution | `absPath`, `relPath`, `kind` internally; public descriptors use `{ kind, relPath }`; `targets` uses relPath strings | suite-core | path/scope transport, not occurrence identity |
| Scope profiles | `includeRoots`, `includeRootFiles`, expanded compatibility root-file patterns | suite-core | scope transport |
| Suite scoped snapshot input | `scope`, `includeRoots`, `includeRootFiles`, `inScopePaths`, `selectedPaths`, `targetDescriptors`, `targets` | suite-core | path/scope transport; `selectedPaths` are selected file paths |
| Source snapshot | `source`, optional `gitRef`, `gitHeadSha`, `diagnostics.isDirty`, `changedCount`, `untrackedCount` | suite-core report/runtime | source/report metadata, not occurrence identity |
| Runner report metadata | report `version`, `mode`, `scope`, `validatorId`, optional tool/config metadata, source snapshot, timing, validator entries | suite-core runner | report envelope metadata |
| Staged Naming output for Tree | staged Naming result, then `projectNamingSemanticFamilyBridge(...)`, passed as `namingSemanticFamilyBridge` only to Tree | suite-core orchestrator/transport; Naming owns payload semantics | bridge transport only; semantic content remains Naming-owned |

Current implementation reality: suite-core path transport currently outranks any planned address-keyed bridge wording. Suite-core does not produce occurrence identity, address profiles, or addressed snapshot identifiers.

## 4. Occurrence identity / addressing surfaces map

### 4.1 Tree occurrence snapshot

`prepareTreeOccurrenceSnapshot(...)` accepts selected file paths, target descriptors, and include roots. It derives:

- `scopeRoots`: normalized root paths derived from explicit targets first, then include roots, then selected path top-level roots.
- `occurrenceRecords` containing:
  - `resolvedPath`
  - `actualName`
  - `occurrenceType` (`file` or `folder`)
  - `parentResolvedPath`
  - `depth`
  - `scopeRootPath`
  - `lineageSegments`
  - `markerSegments`
  - `occurrenceMarker`
  - `isScopedRoot`
  - `isScopeTopOccurrence`

Ownership classification:

- Tree-local current runtime truth for occurrence record preparation.
- Address-like semantics are currently local to Tree's snapshot modules for validator runtime purposes.
- The marker grammar is deterministic but does not yet expose an Addressing-owned bridge namespace in normal Tree runtime.

### 4.2 Tree structural-address snapshot

`prepareTreeStructuralAddressSnapshot(...)` consumes an occurrence snapshot or prepares one, then adds addressed occurrence fields:

- Envelope:
  - `scope.scopeRootPath`
  - `scope.targetKind`
  - `scope.source`
  - `scopeRoots`
  - `occurrenceRecords`
- Addressed occurrence fields added or aliased:
  - `path` from `resolvedPath`
  - `name` from `actualName`
  - `addressPath` from `occurrenceMarker`
  - `parentAddressPath` from parent resolved path lookup
  - plus all original occurrence snapshot fields

Ownership classification:

- Tree-local current runtime truth.
- `addressPath` is the current runtime address-like field.
- `occurrenceAddress` is not present on this Tree runtime surface.
- `addressProfileId` and `addressedSnapshotId` are not present on this Tree runtime surface.

### 4.3 Structural-addressing slice current shape

`calculogic-validator/structural-addressing/**` exists. Its current code shape includes:

- Profile constants:
  - `profileId: 'tree-codebase'`
  - `snapshotOutputId: 'addressedTreeSnapshot'`
  - `domainPrefix: 'T'`
  - occurrence types `folder` and `file`
  - marker strategies `upper-alpha` and `arabic-number`
- `prepareTreeCodebaseAddressedSnapshot(...)` output:
  - `snapshotOutputId`
  - `profileId`
  - `domainPrefix`
  - `sourceNamespace`
  - `scope`
  - `target`
  - `scopeRoots`
  - `occurrenceRecords`
- Structural-addressing occurrence records contain:
  - `address`
  - `addressPath`
  - `displayMarker`
  - `occurrenceType`
  - `name`
  - `path`
  - `parentAddressPath`
  - `depth`
  - `orderIndex`

Ownership classification:

- Structural-addressing owns the standalone/current addressed snapshot and render profile semantics in its own slice.
- Normal Tree validator runtime does not currently consume `prepareTreeCodebaseAddressedSnapshot(...)` as its addressed occurrence provider.
- This is a current shape mismatch to settle before Slice 2 implementation: Tree-local address snapshots and structural-addressing addressed snapshots overlap, but their envelopes and field names are not identical.

## 5. Naming bridge production surfaces map

### 5.1 Naming canonical finding source

Naming `classifyPath(...)` normalizes a relative path and emits findings with:

- `path`
- `classification`
- `details.semanticName`
- `details.role`
- `details.extension`
- `details.roleStatus`
- `details.roleCategory`
- optional semantic-family fields from family derivation:
  - `semanticTokens`
  - `semanticFamily`
  - `familyRoot`
  - optional `familySubgroup`
  - optional `ambiguityFlags`
- optional disambiguation metadata:
  - `disambiguation.roleLikeSemanticTokens`
  - `disambiguation.roleLikeFolderTokens`

### 5.2 Naming bridge projection for Tree contributor

`projectNamingSemanticFamilyBridge(...)` filters to canonical findings and emits:

- `observations[]`
  - `path`
  - `semanticName`
  - `familyRoot`
  - `semanticFamily`
  - optional `familySubgroup`
  - optional `ambiguityFlags`
  - optional `splitFamilyFlags`

It does not emit role, extension, role status/category, disambiguation hints, finding code, severity, source snapshot metadata, bridge version metadata, address metadata, or occurrence metadata.

### 5.3 Naming semantic evidence bridge for Tree evidence preparation

`prepareNamingSemanticEvidenceBridge(...)` consumes the Naming bridge payload and emits evidence records with:

- `path`
- `semanticName`
- `semanticFamily`
- `familyRoot`
- optional `familySubgroup`
- `semanticNameSource: 'naming-canonical-finding'`
- `semanticFamilySource: 'naming-family-derivation'`
- `evidenceSource: 'namingSemanticFamilyBridge'`
- `evidenceStrength: 'high' | 'bounded'`
- `ambiguityStatus: 'none' | 'present'`
- optional `splitMarkers`

Current implementation reality: Naming outputs are mixed path-keyed and semantic-family-oriented observations. They are not occurrence-address-keyed.

## 6. Tree bridge consumption and join surfaces map

| Tree surface | Input consumed | Join / grouping behavior | Output |
| --- | --- | --- | --- |
| Tree wiring | `selectedPaths`, target descriptors, include roots, optional `namingSemanticFamilyBridge` | prepares occurrence snapshot, structural-address snapshot, and naming semantic evidence | prepared Tree inputs and dependencies |
| Tree semantic-home evidence | addressed occurrence records + Naming semantic evidence records | groups Naming evidence by `record.path`; matches addressed occurrences by `occurrenceRecord.path`; uses `occurrenceType` only as a safe tie-breaker if Naming evidence has it | `treeSemanticHomeEvidence.evidenceRecords[]` with `addressPath`, `parentAddressPath`, `path`, Naming semantic fields, `semanticHome` |
| Tree structural-home evidence | addressed occurrence records + structural homes registry | repo-top folder token match by `occurrenceRecord.path` | structural-home evidence records with address/path fields |
| Tree folder-kind evidence | addressed occurrence records + structural-home evidence + semantic-home evidence | path lookups by evidence `path`; derives folder kind | folder-kind evidence records with address/path fields |
| Occurrence classification replacement runtime | structural-home evidence, semantic-home evidence, folder-kind evidence, repo-shape policy | consumes prepared Tree evidence; remains Tree-owned | classification records and parity/shadow/readiness artifacts |
| Tree naming semantic-family bridge contributor | raw `namingSemanticFamilyBridge` observations | normalizes required `path`, `semanticName`, `familyRoot`, `semanticFamily`; groups by `semanticFamily`; derives placement context from path segments and semantic-family signals | advisory findings such as scatter, cluster, subgroup opportunity, shared-root lane spread |
| Tree core fallback file reasoning | structural-address snapshot or occurrence snapshot when valid, otherwise selected paths | prefers occurrence records; falls back to `selectedPaths` on invalid/missing occurrence classification | file reasoning inputs for existing Tree findings |

Current join behavior:

- Tree semantic-home evidence joins by path, not address.
- Tree folder-kind evidence joins Tree-owned evidence by path.
- Tree naming semantic-family contributor groups by semantic family and derives structural/semantic placement from path segments.
- Tree core still has a selected-path fallback if occurrence snapshot usage is unavailable or malformed.

## 7. Path-as-identity assumptions

| Assumption | Location / surface | Classification | Notes |
| --- | --- | --- | --- |
| Naming bridge observations require `path` and are sorted by `path` | Naming bridge projection and Tree bridge contributor normalization | confirmed current join assumption | `path` is the only durable key emitted by Naming bridge observations. |
| Tree semantic-home evidence groups Naming records by `path` and matches addressed occurrences by `occurrenceRecord.path` | `tree-semantic-home-evidence.logic.mjs` | confirmed current join assumption | `occurrenceType` can only disambiguate if present on Naming record; current Naming projection does not emit it. |
| Tree structural-home evidence identifies repo-top structural homes by `occurrenceRecord.path` | `tree-structural-home-evidence.logic.mjs` | confirmed current Tree-owned assumption | This is Tree-owned evidence, not a Naming bridge join. |
| Tree folder-kind evidence lookup maps semantic/structural evidence by `path` | `tree-folder-kind-evidence.logic.mjs` | confirmed current Tree-owned assumption | This composes Tree evidence after the semantic-home path join. |
| Tree naming semantic-family contributor groups by `semanticFamily` and derives placement from path segments | `tree-naming-semantic-family-bridge-contributor.logic.mjs` | confirmed current join / family-bucket assumption | It intentionally works at bounded semantic-family advisory level today. |
| Contributor placement treats directory path segment alignment with `familyRoot`, `semanticFamily`, and `familySubgroup` as semantic container/home evidence | `tree-naming-semantic-family-bridge-contributor.logic.mjs` and tests | compatibility/debug and current advisory assumption | It is not a durable occurrence identity model. |
| Suite-core target descriptors and selected paths are passed as `targets`, `targetDescriptors`, `selectedPaths` | suite-core and Tree wiring | transport assumption | Paths are transport/filtering data, not identity contracts. |
| Tree core falls back to selected paths when occurrence snapshot use is unavailable or malformed | `tree-structure-advisor.logic.mjs` | compatibility/debug reference | Must not be removed in Slice 2. |
| Tests assert path-joined semantic-home evidence and path-keyed Naming bridge output | Naming and Tree bridge tests | test-only assumption confirming current runtime truth | Useful as regression markers until address-keyed fixtures are introduced. |
| Docs and issue roadmap name `addressProfileId + addressedSnapshotId + occurrenceAddress` as target direction | issue #618 and related docs | docs/planning-only assumption | Not current runtime truth. |
| `addressPath` vs `occurrenceAddress` naming | Tree snapshot and structural-addressing slice | ambiguous / needs follow-up | Runtime has `addressPath`; roadmap asks whether `occurrenceAddress` should become contract field. |
| Structural-addressing provider vs Tree-local structural-address snapshot ownership | structural-addressing slice and Tree snapshot modules | ambiguous / needs follow-up | Existing providers overlap but are not wired as one canonical runtime provider. |

## 8. Ownership classification

- Suite-core owns runner orchestration, selected path collection, target descriptors, scope profiles, report envelopes, source snapshot/report metadata, and neutral transport of staged Naming output into Tree.
- Naming owns filename parsing, semantic name, role/extension parse output, semantic family, family root, family subgroup, ambiguity/split-family metadata, disambiguation hints, and Naming bridge observation production.
- Tree owns occurrence snapshot use inside the Tree validator runtime today, structural-address snapshot use inside the Tree validator runtime today, structural-home evidence, semantic-home evidence after joining Naming evidence, folder-kind evidence, occurrence classification replacement/parity/shadow/readiness artifacts, and advisor findings/recommendations.
- Structural-addressing owns its profile constants, marker strategy mechanics, addressed tree snapshot provider, and get-tree render surface in its current slice shape.
- Ambiguous for Slice 2: which producer is authoritative for the cross-slice addressed occurrence snapshot consumed by Naming and Tree. Tree-local and structural-addressing providers currently overlap.

## 9. Recommended Slice 2 contract field set

Recommended minimum bridge identity fields for the next slice:

1. `addressProfileId`
   - Recommended value source: Addressing-owned profile identifier.
   - Current candidate from structural-addressing: `tree-codebase`.
2. `addressedSnapshotId`
   - Recommended role: identifies the specific addressed occurrence snapshot namespace used by both Naming observations and Tree addressed occurrence records.
   - Open naming question: structural-addressing currently has `snapshotOutputId: 'addressedTreeSnapshot'`, but this identifies output type more than instance namespace. Slice 2 should decide whether `addressedSnapshotId` is an instance id, stable run id, content digest, or output id alias.
3. `occurrenceAddress`
   - Recommended role: contract-level occurrence identity field.
   - Current runtime field: `addressPath` exists; `occurrenceAddress` does not.
   - Recommendation: treat `occurrenceAddress` as the neutral bridge field only after a contract slice defines whether it aliases or supersedes current `addressPath`.
4. `repoRelativePath`
   - Recommended compatibility/diagnostic field.
   - Current runtime field names are `path` and `resolvedPath`; Slice 2 should define whether `path` remains as compatibility alias or whether `repoRelativePath` is added without removing fallback behavior.
5. `occurrenceKind` or `occurrenceType`
   - Current runtime uses `occurrenceType` with values `file` and `folder`.
   - Recommendation: prefer preserving `occurrenceType` in addressed occurrence records; if bridge observations need a lightweight type, define the exact name once and keep it compatibility-focused.
6. `bridgeContractVersion`
   - Recommended owner: Naming owns its observation/envelope version, with suite-core transporting it neutrally and Tree checking it only to choose supported join behavior.

Recommended separation:

- Put `parentOccurrenceAddress` / current `parentAddressPath`, `depth`, `scopeRootPath`, lineage, marker segments, and root lane on addressed occurrence records, not on every Naming bridge observation, unless Slice 2 identifies a specific Naming disambiguation need.
- Keep Naming bridge observations focused on semantic interpretation attached to the minimum occurrence identity triple plus compatibility path metadata.
- Keep structural-home, semantic-home, folder-kind, placement, scatter, cluster, and advisor conclusion fields out of Naming observations.

Temporary fallback behavior recommendation:

- Tree should prefer address-keyed joins only when all required identity fields are present and the addressed snapshot namespace matches.
- Tree should retain the current explicit path/family fallback during migration.
- Any fallback output should be explicit and diagnostic; fallback removal should wait for focused repeated-same-family fixtures.

Versioning and transport recommendation:

- Addressing should own profile and addressed snapshot semantics.
- Naming should own Naming bridge observation/envelope version and semantic payload meaning.
- Tree should own supported join behavior and fallback policy at consumption time.
- Suite-core should only stage and transport the bridge payload and report/source metadata.

## 10. Risks and stop conditions for implementation

Risks:

- Implementing address-keyed joins before resolving Tree-local vs structural-addressing provider ownership could create two competing address namespaces.
- Reusing `addressPath` as a durable cross-slice identity without a profile/snapshot namespace could collide across target scopes or future address profiles.
- Adding parent/depth/root-lane fields to Naming observations could blur Naming ownership into Tree placement or Addressing lineage ownership.
- Removing path fallback too early would break current Tree semantic-home evidence and naming bridge contributor behavior.
- Treating semantic-family buckets as identity would fail repeated same-family occurrences across runtime, tests, docs, registries, fixtures, or sibling slices.
- Treating target-layout prose as runtime truth would contradict current code: current Naming bridge payloads are path-keyed and current Tree join behavior is path-based.

Stop conditions for Slice 2 implementation:

- Stop if there is no agreed producer for the addressed occurrence snapshot namespace used by both Naming and Tree.
- Stop if `addressProfileId`, `addressedSnapshotId`, and `occurrenceAddress` cannot be interpreted together deterministically.
- Stop if the implementation would require changing report envelopes, CLI behavior, Tree advisory reasoning, or suite-core semantic ownership.
- Stop if the implementation would remove or silently bypass current path fallback behavior before repeated-same-family fixtures exist.
- Stop if structural-addressing is promoted to a standalone runnable validator slice or its semantics are moved into suite-core as part of the bridge contract slice.

## 11. Inspection and verification commands

Commands run for this audit:

```sh
pwd && find .. -name AGENTS.md -print
cat AGENTS.md
for f in calculogic-validator/doc/ConventionRoutines/CCPP.md calculogic-validator/doc/ConventionRoutines/CCS.md calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md doc/ConventionRoutines/General-NL-Skeletons.md doc/ConventionRoutines/NL-First-Workflow.md README.md calculogic-validator/README.md calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md calculogic-validator/doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md calculogic-validator/doc/ConventionRoutines/ValidatorHelperAreas-And-Reuse-Conventions.md calculogic-validator/doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md calculogic-validator/doc/ConventionRoutines/DocumentContentClassificationConvention-V1.md calculogic-validator/doc/ConventionRoutines/TerminologyScoping-Conventions-V1.md; do if [ ! -f "$f" ]; then echo "MISSING $f"; fi; done
sed -n '1,220p' calculogic-validator/doc/ConventionRoutines/CCPP.md && printf '\n---CCS---\n' && sed -n '1,220p' calculogic-validator/doc/ConventionRoutines/CCS.md && printf '\n---FNM---\n' && sed -n '1,220p' calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md
gh issue view 619 --repo HCAToolkit/Calculogic_React_App --json number,title,body && printf '\n---618---\n' && gh issue view 618 --repo HCAToolkit/Calculogic_React_App --json number,title,body
find calculogic-validator/src/core calculogic-validator/naming/src calculogic-validator/naming/test calculogic-validator/tree/src calculogic-validator/tree/test calculogic-validator/structural-addressing calculogic-validator/doc -maxdepth 3 -type f | sort | sed -n '1,220p'
find calculogic-validator/naming/src calculogic-validator/naming/test calculogic-validator/tree/src calculogic-validator/tree/test calculogic-validator/src/core calculogic-validator/structural-addressing -type f | sort
rg -n "occurrence|address|semantic family|bridge|selected paths|target descriptor|include roots|source snapshot|report metadata|scope" calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md calculogic-validator/doc/ConventionRoutines/ValidatorSuiteOwnedSharedHelpers-And-Capabilities.md calculogic-validator/doc/ConventionRoutines/ValidatorHelperAreas-And-Reuse-Conventions.md calculogic-validator/doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md calculogic-validator/doc/ConventionRoutines/DocumentContentClassificationConvention-V1.md calculogic-validator/doc/ConventionRoutines/TerminologyScoping-Conventions-V1.md
sed -n '1,240p' calculogic-validator/src/core/scoped-target-paths.logic.mjs
sed -n '1,220p' calculogic-validator/src/core/suite-scoped-snapshot-input.logic.mjs
sed -n '1,220p' calculogic-validator/src/core/source-snapshot.logic.mjs
sed -n '1,260p' calculogic-validator/src/core/validator-runner.logic.mjs
sed -n '1,220p' calculogic-validator/src/core/cli/validator-cli-targets.logic.mjs
sed -n '1,220p' calculogic-validator/src/core/validator-scopes.logic.mjs
sed -n '1,160p' calculogic-validator/src/core/validator-root-files.knowledge.mjs
sed -n '1,260p' calculogic-validator/naming/src/naming-semantic-evidence-bridge.logic.mjs
sed -n '1,260p' calculogic-validator/naming/src/naming-semantic-family-bridge-projection.logic.mjs
sed -n '1,220p' calculogic-validator/naming/src/naming-runtime-converters.logic.mjs
sed -n '1,760p' calculogic-validator/naming/src/naming-validator.logic.mjs
sed -n '1,160p' calculogic-validator/naming/src/rules/naming-rule-parse-canonical.logic.mjs
sed -n '1,260p' calculogic-validator/naming/src/rules/naming-rule-derive-semantic-family.logic.mjs
sed -n '1,240p' calculogic-validator/naming/src/rules/naming-rule-derive-disambiguation-hints.logic.mjs
sed -n '1,260p' calculogic-validator/tree/src/tree-occurrence-snapshot.logic.mjs
cat calculogic-validator/tree/src/tree-structural-address-snapshot.logic.mjs
cat calculogic-validator/tree/src/tree-semantic-home-evidence.logic.mjs
sed -n '1,260p' calculogic-validator/tree/src/tree-folder-kind-evidence.logic.mjs
sed -n '1,260p' calculogic-validator/tree/src/tree-structural-home-evidence.logic.mjs
sed -n '1,760p' calculogic-validator/tree/src/contributors/tree-naming-semantic-family-bridge-contributor.logic.mjs
sed -n '1,260p' calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs
sed -n '1,760p' calculogic-validator/tree/src/tree-structure-advisor.logic.mjs
cat calculogic-validator/tree/src/tree-structure-advisor-contributors-assembly.wiring.mjs
cat calculogic-validator/tree/src/contributors/tree-naming-semantic-family-bridge-contributor.wiring.mjs
for f in calculogic-validator/structural-addressing/src/*.mjs; do echo '---' $f; sed -n '1,240p' $f; done
cat package.json | sed -n '1,220p'
cat calculogic-validator/package.json
sed -n '1,260p' calculogic-validator/naming/test/naming-semantic-family-bridge-projection.test.mjs
sed -n '1,260p' calculogic-validator/naming/test/naming-semantic-evidence-bridge.logic.test.mjs
cat calculogic-validator/tree/test/tree-semantic-home-evidence.logic.test.mjs
sed -n '1,260p' calculogic-validator/tree/test/tree-occurrence-snapshot.test.mjs
sed -n '1,240p' calculogic-validator/tree/test/tree-structural-address-snapshot.logic.test.mjs
sed -n '1,220p' calculogic-validator/tree/test/tree-naming-semantic-family-bridge-contributor.test.mjs
git diff -- calculogic-validator/src calculogic-validator/naming calculogic-validator/tree calculogic-validator/structural-addressing calculogic-validator/doc
node --test calculogic-validator/naming/test/*.test.mjs calculogic-validator/tree/test/*.test.mjs
npm run validate:naming -- --scope=validator --target calculogic-validator/naming
node --experimental-strip-types calculogic-validator/scripts/validate-naming.host.mjs --scope=validator --target calculogic-validator/naming > /tmp/naming-audit.json; status=$?; node - <<'NODE'
import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('/tmp/naming-audit.json','utf8'));
console.log(JSON.stringify({status: data.counts, invalid: data.findings.filter(f => f.classification === 'invalid-ambiguous' || f.classification === 'legacy-exception').map(f => ({code:f.code,path:f.path,classification:f.classification}))}, null, 2));
NODE
exit $status
npm run validate:tree -- --scope=validator --target calculogic-validator/tree
npm run validate:naming -- --scope=validator --target calculogic-validator/doc/Audits/occurrence-identity-and-naming-tree-bridge.audit.md
```

Outcomes:

- `gh issue view ...` could not run in this container because `gh` is not installed; the issues were inspected through the public GitHub web page instead.
- The required canonical convention docs were present.
- `calculogic-validator/structural-addressing/**` is present and has a current active source/test shape.
- `git diff -- calculogic-validator/src calculogic-validator/naming calculogic-validator/tree calculogic-validator/structural-addressing calculogic-validator/doc` exited 0 with no output at the first required diff checkpoint because the audit artifact was still untracked.
- `node --test calculogic-validator/naming/test/*.test.mjs calculogic-validator/tree/test/*.test.mjs` exited 0 with 348 passing tests.
- `npm run validate:naming -- --scope=validator --target calculogic-validator/naming` exited 2 due existing focused-target findings in `calculogic-validator/naming/src/registries/_custom/reportable-extensions.registry.custom.json`, `calculogic-validator/naming/src/registries/_custom/roles.registry.custom.json`, and `calculogic-validator/naming/src/registries/registry-state.json`; this docs-only audit did not modify those files.
- `npm run validate:tree -- --scope=validator --target calculogic-validator/tree` exited 0 and reported existing advisory findings for Tree shim/bridge surfaces and one observed Tree semantic-family cluster.
- `npm run validate:naming -- --scope=validator --target calculogic-validator/doc/Audits/occurrence-identity-and-naming-tree-bridge.audit.md` exited 0 and classified this audit filename as canonical.
