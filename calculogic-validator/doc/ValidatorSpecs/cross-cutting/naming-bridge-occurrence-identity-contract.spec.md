# Naming Bridge Occurrence Identity Contract

- **Classification:** Normative for the target contract direction; descriptive where explicitly labeled as current runtime truth.
- **Applies to:** Cross-slice occurrence identity used by Addressing, Naming bridge observations, Tree evidence joins, and suite-core neutral transport.
- **Status:** Contract/specification slice only for issue #621; no runtime behavior is changed by this artifact.
- **Issue context:** Refs #621 and Refs #618.
- **Repo-reality input:** `calculogic-validator/doc/Audits/occurrence-identity-and-naming-tree-bridge.audit.md` from issue #619 / PR #620.

## 1. Purpose and authority boundary

This spec defines the neutral occurrence identity contract and the versioned Naming bridge envelope needed for future address-keyed Naming bridge evidence.

This artifact is intentionally narrow. It defines contract names, ownership boundaries, migration expectations, and non-goals only. It does not implement the Naming bridge, does not change Tree joins, does not add runtime payload fields, does not wire Tree to the structural-addressing provider, and does not change CLI or report envelope behavior.

Authority posture:

1. Current source files, tests, and the issue #619 audit remain the source for **current runtime truth**.
2. This spec defines the **target contract direction** for future implementation slices.
3. Any field marked deferred is **deferred implementation work**, not current runtime truth.

## 2. Current runtime truth

Current runtime truth from the issue #619 / PR #620 audit:

- Naming bridge observations are path-keyed today. The current bridge projection emits `observations[]` records with `path`, `semanticName`, `familyRoot`, `semanticFamily`, and optional `familySubgroup`, `ambiguityFlags`, and `splitFamilyFlags`.
- Naming bridge observations do not currently carry `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`, `addressPath`, `parentOccurrenceAddress`, `parentAddressPath`, `depth`, or root-lane fields.
- Tree-local addressed occurrence records expose `addressPath` and `parentAddressPath`; they do not expose `occurrenceAddress`.
- Structural-addressing currently has its own addressed snapshot shape with `profileId`, `snapshotOutputId`, `domainPrefix`, and occurrence records containing `address`, `addressPath`, `occurrenceType`, `path`, `parentAddressPath`, `depth`, and `orderIndex`.
- Tree semantic-home evidence currently joins Naming semantic evidence by `path`; `occurrenceType` is only available as a tie-breaker when Naming evidence supplies it, and the current Naming bridge projection does not.
- Tree runtime is not currently wired to `calculogic-validator/structural-addressing/**` as its canonical addressed snapshot provider.

## 3. Target contract direction

Target contract direction:

- Cross-slice joins should use address-backed occurrence identity in an explicit profile/snapshot namespace.
- The minimum join identity is:

```text
addressProfileId + addressedSnapshotId + occurrenceAddress
```

- `repoRelativePath` remains a compatibility and diagnostic reference during migration; it is not the durable semantic identity.
- Naming semantic payloads should be preserved where practical and identity fields should be added additively in later implementation slices.
- Tree should prefer address-keyed joins when required identity fields are present and compatible, while retaining an explicit temporary path-based fallback during migration.

## 4. Occurrence identity contract

### 4.1 Namespace rule

`occurrenceAddress` is interpreted only inside the namespace identified by `addressProfileId` and `addressedSnapshotId`.

The tuple `addressProfileId + addressedSnapshotId + occurrenceAddress` is a deterministic join identity for one addressed snapshot namespace. It is not a timeless global id, not a repo-wide immutable id across every profile, and not a semantic identity by itself.

### 4.2 Required first-slice identity fields

| Field | Requirement for first implementation slice | Owner | Contract meaning | Current runtime relationship |
| --- | --- | --- | --- | --- |
| `addressProfileId` | Required | Addressing | Identifier for the address profile whose grammar/provider semantics make `occurrenceAddress` meaningful. | Structural-addressing currently uses `profileId`; Tree-local snapshots do not carry this field. |
| `addressedSnapshotId` | Required | Addressing | Identifier for the specific addressed snapshot namespace shared by the producer and consumers during a run or staged payload exchange. | Structural-addressing currently has `snapshotOutputId`; the audit records an unresolved question about whether that is an output-type id or a snapshot instance/source id. |
| `occurrenceAddress` | Required | Addressing | Neutral occurrence address used for cross-slice joins inside the profile/snapshot namespace. | Current runtime fields are `addressPath` and structural-addressing `address`/`addressPath`; `occurrenceAddress` is not current runtime truth. |
| `repoRelativePath` | Required compatibility/debug field | Suite-core transports; originating occurrence/address snapshot producer supplies | Repository-relative path for diagnostics, compatibility fallback, and human traceability. | Current Naming bridge uses `path`; Tree occurrence and structural-addressing records also expose path-like fields. |
| `occurrenceType` | Required when available from the addressed occurrence record | Addressing supplies; Naming may echo only as identity/debug context | Bounded occurrence kind/type such as `file` or `folder`. | Current runtime uses `occurrenceType`; preserve this name rather than introducing `occurrenceKind` in the first implementation slice. |

### 4.3 `occurrenceAddress` and current `addressPath`

Target contract direction: use `occurrenceAddress` as the neutral bridge identity field.

Migration rule: current `addressPath` should be preserved and aliased first rather than renamed in runtime code. A later implementation slice may populate `occurrenceAddress` from the current Addressing-owned address field while preserving `addressPath` as a compatibility/debug alias until consumers are migrated.

`addressPath` remains current runtime truth. `occurrenceAddress` is deferred implementation work and must not be added to runtime outputs in this docs-only slice.

### 4.4 Deferred identity fields

The following fields are not required on every first-slice Naming bridge observation unless a later implementation slice documents a specific need:

- `parentOccurrenceAddress` or `parentAddressPath`
- `depth`
- `orderIndex`
- `displayMarker`
- `domainPrefix`
- `scopeRootPath`
- root-lane or repo-top/scope-top markers
- lineage arrays or ancestor address paths

These fields may belong on addressed occurrence records or addressed snapshot envelopes. They should not be copied into Naming bridge observations merely for convenience.

## 5. Naming bridge envelope contract

### 5.1 Envelope shape

Target contract direction for a versioned Naming bridge payload:

```json
{
  "bridgeContractVersion": "naming-occurrence-bridge.v1",
  "bridgeSource": "calculogic-validator/naming",
  "bridgeProducerId": "naming-semantic-family-bridge",
  "addressProfileId": "tree-codebase",
  "addressedSnapshotId": "<addressed snapshot namespace id>",
  "sourceReportRef": "<optional source/report reference>",
  "sourceSnapshotRef": "<optional source snapshot reference>",
  "observations": []
}
```

### 5.2 Envelope fields

| Field | Requirement for first implementation slice | Owner | Semantics |
| --- | --- | --- | --- |
| `bridgeContractVersion` | Required | Naming owns the bridge contract; suite-core may transport | Version field for the Naming bridge payload shape. Use this exact field name for the first versioned bridge. |
| `bridgeSource` | Required | Naming | Stable source identity for the slice producing the bridge payload. |
| `bridgeProducerId` | Required | Naming | Stable producer identity for the specific bridge projection routine or payload family. |
| `addressProfileId` | Required | Addressing semantics; Naming references | Address profile namespace used by all observations in the envelope unless an observation explicitly overrides it in a future version. |
| `addressedSnapshotId` | Required | Addressing semantics; Naming references | Addressed snapshot namespace shared by the envelope and observations. |
| `sourceReportRef` | Deferred | Suite-core transport/report mechanics | Optional pointer to report metadata when needed for traceability. It must not become a semantic owner. |
| `sourceSnapshotRef` | Deferred | Suite-core transport/source snapshot mechanics | Optional pointer to source snapshot metadata when needed for traceability. It must not replace `addressedSnapshotId`. |
| `observations` | Required | Naming | Ordered container of Naming-owned semantic observations attached to occurrence identity and compatibility/debug context. |

### 5.3 Observations container semantics

`observations[]` contains Naming observations for occurrences in the addressed snapshot namespace declared by the envelope. The first implementation slice should require envelope-level `addressProfileId` and `addressedSnapshotId` and should not require per-observation overrides.

Observation order should be deterministic for repeatable reports, but consumers must not treat array index as occurrence identity.

## 6. Naming bridge observation contract

### 6.1 Observation shape

Target contract direction for one observation:

```json
{
  "addressProfileId": "tree-codebase",
  "addressedSnapshotId": "<addressed snapshot namespace id>",
  "occurrenceAddress": "<address in the addressed snapshot namespace>",
  "repoRelativePath": "calculogic-validator/example/path.md",
  "path": "calculogic-validator/example/path.md",
  "addressPath": "<compatibility/debug alias when populated>",
  "occurrenceType": "file",
  "semanticName": "example-path",
  "familyRoot": "example",
  "semanticFamily": "example-path",
  "familySubgroup": "example",
  "ambiguityFlags": [],
  "splitFamilyFlags": [],
  "disambiguation": {},
  "findingRefs": []
}
```

This illustrative object is not current runtime truth. It shows target field groupings and additive migration direction.

### 6.2 Addressing / occurrence identity fields

| Field | Requirement for first implementation slice | Notes |
| --- | --- | --- |
| `addressProfileId` | Required, or inherited from required envelope field | Per-observation field may be omitted only if inherited from the envelope by contract. |
| `addressedSnapshotId` | Required, or inherited from required envelope field | Per-observation field may be omitted only if inherited from the envelope by contract. |
| `occurrenceAddress` | Required | Neutral join field. It may initially be populated from an Addressing-owned `addressPath` alias, but runtime renaming is not part of this slice. |
| `repoRelativePath` | Required compatibility/debug | Human-readable and fallback path reference. |
| `occurrenceType` | Required when available | Use current runtime term `occurrenceType` for `file`/`folder`; do not introduce `occurrenceKind` unless a future contract intentionally renames it. |

### 6.3 Compatibility/debug path fields

| Field | Requirement | Notes |
| --- | --- | --- |
| `path` | Temporary compatibility alias | Current Naming bridge consumers expect `path`; preserve it during migration. |
| `addressPath` | Temporary compatibility/debug alias when producer has it | Current Tree-local and structural-addressing surfaces expose `addressPath`; do not rename runtime code in this slice. |
| `parentAddressPath` | Deferred; generally not on Naming observations | If needed, prefer addressed occurrence records as the source. |

### 6.4 Naming-owned semantic fields

Preserve current Naming semantic payloads where practical:

- `semanticName`
- `semanticFamily`
- `familyRoot`
- `familySubgroup`
- `ambiguityFlags`
- `splitFamilyFlags`

Additional Naming-owned fields may include role parse and disambiguation metadata when a later Naming-owned implementation slice documents the exact shape:

- `role`
- `extension`
- `roleStatus`
- `roleCategory`
- `disambiguation.roleLikeSemanticTokens`
- `disambiguation.roleLikeFolderTokens`

Naming owns these fields because they are filename-derived semantic interpretation, ambiguity, and disambiguation evidence. They are observations, not Tree placement conclusions.

### 6.5 Finding/source references

`findingRefs[]` or equivalent source references are deferred for the first implementation slice unless needed to preserve traceability from bridge observations to Naming findings.

If added later, finding/source references may identify Naming findings or source report metadata. They must not be required for Tree to infer semantic-family meaning, and suite-core must only transport them neutrally.

### 6.6 Fields not allowed on Naming bridge observations

Naming bridge observations must not include Tree conclusions, including:

- `structuralHome`
- `semanticHome`
- `folderKind`
- `repoShape`
- `placement`
- `placementConfidence`
- `scatterStatus`
- `clusterStatus`
- `driftStatus`
- `expectedTopLevelFolder`
- `allowedTopLevelFolder`
- Tree advisory finding severity or verdict fields

Tree may derive or attach those fields after joining Naming evidence to addressed occurrence records. Naming must not emit them as bridge semantics.

## 7. Ownership matrix

| Surface | Addressing | Naming | Tree | Suite-core |
| --- | --- | --- | --- | --- |
| Occurrence identity | Owns `occurrenceAddress`, address profile semantics, addressed snapshot semantics, and address grammar/provider semantics. | References identity to attach observations; does not define address grammar. | Consumes identity for joins; does not define Naming semantics. | Transports identity neutrally; does not own semantics. |
| Bridge envelope | Owns profile/snapshot meaning referenced by the envelope. | Owns bridge version, producer identity, semantic payload, and observation production. | Owns supported consumer behavior and fallback policy after receiving payloads. | Owns orchestration, staging, target/scope transport, report envelope mechanics, and neutral payload guardrails. |
| Semantic interpretation | Does not own Naming semantics. | Owns semantic-name, semantic-family, family root, family subgroup, role parse, ambiguity, and disambiguation. | Consumes Naming evidence for Tree-owned interpretation after joining. | May report metadata without semantic ownership. |
| Tree conclusions | Does not own Tree placement conclusions. | Must not emit Tree conclusions. | Owns structural-home, semantic-home, folder kind, repo-shape, placement, scatter/cluster, and interpretation after joining. | May transport/report metadata without owning Tree conclusions. |

Suite-core may stage, transport, validate envelope mechanics, or report bridge metadata, but suite-core must not become the owner of Naming, Tree, or Addressing semantics.

## 8. Fallback and migration rule

Future implementation slices must follow this migration rule:

1. Tree should prefer address-keyed joins when `addressProfileId`, `addressedSnapshotId`, and `occurrenceAddress` are present and match the addressed occurrence namespace being consumed.
2. Path-based joins may remain as an explicit temporary compatibility fallback during migration.
3. Fallback behavior must be documented, test-covered, and removable later.
4. Fallback diagnostics should make it clear when Tree used path compatibility instead of address identity.
5. Tree must not silently re-derive Naming semantic-family interpretation when Naming evidence is missing. Missing Naming evidence should remain missing, bounded, or diagnostic according to Tree-owned consumer policy.

Path fallback is current implementation reality and must not be removed in this contract slice.

## 9. Relationship to current audited runtime fields

| Current audited field/surface | Relationship to this contract |
| --- | --- |
| Tree-local `addressPath` | Current runtime truth. Preserve as compatibility/debug alias during migration. Do not rename in runtime code as part of this contract. |
| Tree-local `parentAddressPath` | Current runtime truth. Keep on addressed occurrence records; do not require on Naming observations in the first bridge shape. |
| Structural-addressing `address` | Candidate source for neutral `occurrenceAddress`; exact aliasing requires a later implementation slice. |
| Structural-addressing `addressPath` | Candidate compatibility/debug alias and possible initial source for `occurrenceAddress`; must be interpreted inside profile/snapshot namespace. |
| Structural-addressing `profileId` | Candidate source for contract field `addressProfileId`; this spec chooses the bridge field name `addressProfileId` for clarity. |
| Structural-addressing `snapshotOutputId` | Related to `addressedSnapshotId`, but not identical by contract until a later slice decides whether output id is sufficient or an instance/source id is required. |
| Structural-addressing `domainPrefix` | Address grammar/provider metadata. It is not required in every Naming observation. |
| Current Naming bridge `path` observations | Current runtime truth and temporary compatibility alias. Future bridge observations should add `repoRelativePath` rather than remove `path` immediately. |
| Current Tree semantic-home evidence join by `path` | Current runtime truth and temporary fallback path. Future Tree consumption should prefer address-keyed joins only when contract fields are present. |

## 10. Unresolved naming and migration follow-up notes

The following questions remain explicit follow-up work and are not resolved by runtime changes in this slice:

1. Whether `addressedSnapshotId` should be a run/snapshot instance id, a content digest, a source snapshot id, or a constrained alias of current `snapshotOutputId`.
2. Whether the first bridge implementation should emit per-observation `addressProfileId` and `addressedSnapshotId` redundantly, or rely on envelope-level inheritance plus validation.
3. Whether structural-addressing `address` or `addressPath` should populate the first `occurrenceAddress` field, and which compatibility alias must be retained in reports.
4. Whether `findingRefs[]`, `sourceReportRef`, or `sourceSnapshotRef` are needed in the first implementation slice for traceability.
5. Which focused repeated-same-family fixtures should prove that address-keyed joins beat path/family bucket assumptions before fallback removal.
6. Which producer is the authoritative addressed snapshot provider for the cross-slice bridge: Tree-local addressed occurrences, structural-addressing addressed snapshots, or a later compatibility bridge between them.

## 11. Non-goals

This spec does not:

- change runtime behavior;
- change Naming bridge payloads;
- change Tree join behavior;
- add `occurrenceAddress` fields to runtime outputs;
- rename `addressPath` in runtime code;
- wire Tree runtime to the structural-addressing provider;
- remove path fallback;
- remove known-roots or revive known-roots;
- promote Addressing to a standalone runnable validator slice;
- move Addressing semantics into suite-core;
- broaden Tree semantic-home, structural-home, scatter, cluster, or drift reasoning;
- rework validator report envelopes;
- change CLI behavior;
- fix unrelated validator findings;
- perform broad docs cleanup outside this contract slice.

## 12. Recommended next implementation child

Recommended next implementation child: define and test a data-only, versioned Naming bridge payload shape that preserves the current semantic payload and `path` compatibility field while additively carrying `bridgeContractVersion`, `bridgeSource`, `bridgeProducerId`, `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`, `repoRelativePath`, and `occurrenceType` when an addressed occurrence namespace is available.

That child should still avoid Tree reasoning expansion. It should include focused tests for payload shape and explicit fallback behavior without removing the current path-based consumer path.
