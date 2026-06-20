# Naming Bridge Occurrence Identity Contract

- **Classification:** Normative for the Naming occurrence bridge identity, field-eligibility, enrichment, versioning, and migration contract; descriptive only where explicitly labeled as **current runtime truth**.
- **Applies to:** Cross-slice occurrence identity used by Addressing, Naming bridge observations, Tree evidence joins, and suite-core neutral transport.
- **Status:** Contract/specification decision slice only for issue #651; no runtime behavior is changed by this artifact.
- **Issue context:** Refs #651 and Refs #647. Earlier identity baseline: Refs #621, Refs #618, and Slice 1 audit #648 / PR #649.
- **Repo-reality input:** `calculogic-validator/doc/Audits/occurrence-identity-and-naming-tree-bridge.audit.md` and `calculogic-validator/doc/Audits/addressing-backed-naming-tree-bridge-enrichment-surfaces.audit.md`.

## 1. Purpose and authority boundary

This spec defines the neutral occurrence identity contract, the versioned Naming bridge envelope, and the normative decision gate for future enriched Naming occurrence bridge fields.

This artifact is intentionally narrow. It defines contract names, ownership boundaries, approved future field shapes, deferred/rejected candidate status, migration expectations, and non-goals only. It does not implement Naming bridge enrichment, does not change Tree joins or consumption policy, does not add runtime payload fields, does not wire Tree to a different provider, does not extract shared join helpers, and does not change CLI or report envelope behavior.

Authority posture:

1. Current source files, tests, and the issue #648 audit remain the source for **current runtime truth**.
2. This spec defines the **target contract direction** for future implementation slices.
3. A field marked `approved for a future enriched bridge version` is approved for an additive future contract shape only; it is **not current runtime truth** until a later implementation slice emits and tests it.
4. A field marked `deferred` is **deferred implementation work** that needs the named prerequisite before runtime payload use.
5. A field marked `rejected for bridge payload use` must not be emitted by the Naming bridge payload as a contract field.

## 2. Current runtime truth

Current runtime truth from the issue #648 / PR #649 audit:

- Naming bridge observations can be emitted in a versioned occurrence bridge payload with `bridgeContractVersion: naming-occurrence-bridge.v1`.
- The only resolved durable occurrence identity tuple for addressed Naming occurrence observations is `addressProfileId + addressedSnapshotId + occurrenceAddress`.
- Naming occurrence bridge observations currently preserve path/source trace fields: `repoRelativePath`, `path`, and optional `addressPath`.
- `path` and `repoRelativePath` remain compatibility/source-trace fields, not the preferred durable join identity.
- `addressPath` remains a compatibility/debug mirror unless it is explicitly equal to `occurrenceAddress`; it must not become a second competing occurrence identity.
- Current Naming bridge semantic evidence includes existing Naming-owned semantic fields such as `semanticName`, `familyRoot`, `semanticFamily`, optional `familySubgroup`, optional sorted `ambiguityFlags`, and optional sorted `splitFamilyFlags`.
- `occurrenceType` is an existing optional `naming-occurrence-bridge.v1` occurrence-context / compatibility field when the addressed occurrence record supplies it. It is Addressing-owned occurrence type data that Naming may echo when available; it is not part of the durable identity tuple and is not Tree folder-kind interpretation.
- The bridge does not currently emit genuinely new enriched context partition fields such as `parentAddressPath`, `depth`, `orderIndex`, `lineageKey`, `contextPartitionKey`, `siblingContextKey`, `subtreeContextKey`, `semanticTokens`, `role`, `role-like fields`, `disambiguationNotes`, `evidenceStrength`, or `evidenceLimitNotes` merely because they may be useful.
- Tree staged intake and address-keyed join preparation may inspect the v1 bridge, but current Tree contributor behavior preserves fallback to path-keyed semantic-family evidence unless address-keyed evidence is clean and usable under Tree-owned policy.

## 3. Canonical occurrence identity contract

### 3.1 Namespace rule

`occurrenceAddress` is interpreted only inside the namespace identified by `addressProfileId` and `addressedSnapshotId`.

The tuple `addressProfileId + addressedSnapshotId + occurrenceAddress` is the preferred durable join identity for one addressed snapshot namespace. It is not a timeless global id, not a repo-wide immutable id across every profile, and not a semantic identity by itself.

### 3.2 Required durable identity tuple

For an addressed Naming occurrence observation, all three fields are required either directly on the observation or by an explicitly validated envelope inheritance rule:

| Field | Requirement | Owner | Contract meaning | Current runtime relationship |
| --- | --- | --- | --- | --- |
| `addressProfileId` | Required | Addressing | Identifier for the address profile whose grammar/provider semantics make `occurrenceAddress` meaningful. | Structural-addressing currently uses `profileId`; Naming bridge payloads normalize the contract field as `addressProfileId`. |
| `addressedSnapshotId` | Required | Addressing | Identifier for the specific addressed snapshot namespace shared by the producer and consumers during a run or staged payload exchange. | Structural-addressing has `snapshotOutputId`; whether that is sufficient as the durable snapshot namespace remains a later provider decision. |
| `occurrenceAddress` | Required | Addressing | Neutral occurrence address used for cross-slice joins inside the profile/snapshot namespace. | Current bridge payload construction can normalize an addressed occurrence `occurrenceAddress`, `address`, or `addressPath` into this field. |

Normative identity rules:

- The tuple remains the preferred durable join identity for addressed Naming occurrence observations.
- `path` and `repoRelativePath` remain compatibility/source-trace fields.
- `addressPath` remains a compatibility/debug mirror unless explicitly equal to `occurrenceAddress`.
- No second competing occurrence identity is introduced by this spec.
- Consumers must not treat observation array index, path, semantic family, context partition key, diagnostic metadata, or Tree placement evidence as a replacement identity.

## 4. Versioned Naming bridge envelope contract

### 4.1 Current valid version

`naming-occurrence-bridge.v1` remains valid. Existing v1 producers and consumers must continue to preserve the canonical identity tuple and path-keyed compatibility/source-trace fields during migration.

### 4.2 Future enriched version decision

Genuinely new approved enrichment fields in this spec require a future explicit version named `naming-occurrence-bridge.v2` unless a later contract slice intentionally chooses a separately named additive sidecar. The default path is an additive v2 bridge payload, not mutation of v1 semantics.

Existing valid v1 fields do not require a version bump merely to retain or document them. In particular, valid v1 observations may retain optional `occurrenceType` when supplied by the addressed occurrence record; retaining `occurrenceType` does not require `naming-occurrence-bridge.v2`.

The v2 bridge may keep the same top-level envelope fields as v1 and add an explicitly versioned observation enrichment block or direct observation fields for genuinely new enrichment. A later implementation slice must choose the concrete serialization route before runtime emission. Until that slice lands, approved new fields below are contract-approved but **not current runtime truth**.

### 4.3 Version handling and unknown fields

Version handling rules:

- v1 consumers may ignore unknown enrichment fields only if those fields are not needed to validate identity and do not change v1 semantics.
- Consumers that interpret v2 enrichment need an explicit v2-aware intake path or an explicitly documented sidecar intake path.
- Unsupported bridge versions must be handled as unsupported future evidence, not as invalid identity by default.
- Diagnostics must distinguish invalid identity from unsupported enrichment:
  - **invalid identity:** missing, non-string, empty, mismatched, duplicate, or namespace-incompatible `addressProfileId`, `addressedSnapshotId`, or `occurrenceAddress`.
  - **unsupported enrichment:** recognized identity with a bridge version, field, or sidecar that the consumer does not interpret.
  - **unsupported version:** a bridge contract version outside the consumer's supported set.
- Unsupported enrichment must not force fallback removal, shared-helper extraction, provider swaps, or Tree policy changes.

## 5. Ownership boundaries

| Surface | Addressing | Naming | Tree | Suite-core |
| --- | --- | --- | --- | --- |
| Occurrence identity | Owns `occurrenceAddress`, address profile semantics, address grammar, addressed snapshot/provider output rules, and parent/child/sibling identity facts. | References identity to attach observations; does not define address grammar. | Consumes identity for tuple matching and join preparation; does not define Naming semantics. | Transports identity neutrally; does not own semantics. |
| Neutral occurrence context | Owns neutral lineage/depth/containment facts, parent/child/sibling identity facts, and deterministic occurrence ordering. | May copy approved neutral context as evidence when sourced from Addressing and shaped by this spec. | May consume neutral context only as evidence under Tree-owned qualification policy. | May stage opaque payloads without semantic ownership. |
| Semantic interpretation | Does not own Naming semantics. | Owns semantic-name, family-root, semantic-family, family-subgroup, token interpretation, role interpretation, ambiguity flags, split-family flags, disambiguation interpretation, bridge observation production, and approved semantic-evidence partitioning representation. | Consumes Naming evidence for Tree-owned interpretation after joining. | May report metadata without semantic ownership. |
| Tree conclusions | Does not own Tree placement conclusions. | Must not emit Tree conclusions. | Owns folder-kind interpretation, structural-home interpretation, semantic-home interpretation, placement reasoning, scatter/cluster reasoning, confidence, severity, findings, fallback selection, join diagnostics, and clean/usable evidence assessment. | May transport/report metadata without owning Tree conclusions. |

Suite-core owns only runner orchestration, staging, target/scope transport, source metadata, report-envelope mechanics, and neutral opaque payload transport.

## 6. Existing v1 occurrence-context and compatibility fields

The field-eligibility table below applies only to genuinely new future enrichment candidates. It does not re-decide existing valid v1 fields.

Existing v1 occurrence-context / compatibility fields include:

| Field | v1 status | Owner | Source of truth | Value shape | Required / optional | Identity status | Tree-consumption limitation | Versioning effect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `occurrenceType` | Existing optional v1 occurrence-context / compatibility field | Addressing | Addressed occurrence record occurrence-type vocabulary | Non-empty string from the Addressing-owned vocabulary, currently expected to include values such as `file` or `folder` | Optional in v1 because current production includes it only when the addressed occurrence record supplies it | Not part of `addressProfileId + addressedSnapshotId + occurrenceAddress`; must not be used as a replacement identity | Tree may consume only as occurrence type evidence; it is not Tree folder-kind interpretation and must not encode folder kind, structural home, semantic home, placement, confidence, severity, or findings | Retaining or documenting existing `occurrenceType` in valid v1 observations does not require a v2 bridge version |

## 7. Field eligibility table for future enriched bridge versions

Decision standard: approve only fields with a clear current source, a narrow semantic purpose, a deterministic representation, and a concrete need for the first enriched Naming bridge version. Defer fields that require a new vocabulary, an opaque grouping strategy, a separate role/token model, unclear source authority, or likely Tree-policy leakage. Reject fields that would encode Tree placement, folder/home interpretation, severity, confidence policy, or findings.

| Candidate | Decision status | Owner | Source of truth | Exact field name when approved | Value shape when approved | Required / optional when approved | Null / absence behavior when approved | Normalization and deterministic-order requirements when approved | Classification | Tree-consumption limitation | Explicit prerequisite when deferred | Reason when rejected |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `parentAddressPath` | approved for a future enriched bridge version | Addressing | Addressed occurrence record from the active `addressProfileId` / `addressedSnapshotId` namespace | `parentOccurrenceAddress` | string occurrence address in the same namespace as `occurrenceAddress`, or `null` for namespace roots | Optional | Omit when the source record does not provide parent identity; use `null` only for an addressed root whose source explicitly has no parent | Must equal the Addressing-owned parent occurrence identity; no Naming inference; stable string; no sorting role | neutral context | Tree may consume only as parent identity evidence and must not infer folder kind, structural home, semantic home, or placement from Naming emission alone | n/a | n/a |
| `depth` | approved for a future enriched bridge version | Addressing | Addressed occurrence record | `occurrenceDepth` | non-negative integer rooted at `0` in the addressed snapshot namespace | Optional | Omit when unavailable; do not use `null`; invalid negative/non-integer values invalidate only the enrichment field, not the identity tuple | Numeric integer; producer must not bucket, band, or semantically label depth | neutral context | Tree may consume only as neutral nesting evidence; Tree owns any placement or scatter/cluster interpretation | n/a | n/a |
| `orderIndex` | approved for a future enriched bridge version | Addressing | Addressed occurrence record deterministic traversal output | `occurrenceOrderIndex` | non-negative integer stable for the addressed snapshot traversal | Optional | Omit when unavailable; do not use `null`; invalid negative/non-integer values invalidate only the enrichment field, not the identity tuple | Numeric integer; represents Addressing traversal order only; consumers must not treat it as identity | neutral context / diagnostic metadata | Tree may use only for deterministic ordering or evidence review, not placement quality, severity, or confidence | n/a | n/a |
| `lineageKey` | deferred | Addressing, with Naming allowed to reference only after source is defined | No approved current source for bridge payload use | n/a | n/a | n/a | n/a | n/a | neutral context candidate | Tree must not consume a Naming-computed lineage key as structural-home or semantic-home evidence | Addressing must define an opaque, deterministic lineage/grouping key source and collision semantics, or the bridge must choose `parentOccurrenceAddress` instead | n/a |
| `contextPartitionKey` | deferred | Naming if semantic-evidence partitioning; Addressing if opaque occurrence partitioning | No approved current source or grouping strategy | n/a | n/a | n/a | n/a | n/a | semantic evidence partition candidate | Tree must not treat it as folder/home/placement policy | A later Naming-owned contract must define the partition purpose, stable algorithm, collision behavior, and proof it is folder-agnostic and not Tree policy | n/a |
| `siblingContextKey` | deferred | Addressing preferred; Naming only if it can prove neutral evidence partitioning | No approved current source or grouping strategy | n/a | n/a | n/a | n/a | n/a | neutral context candidate | Tree must not treat it as sibling placement quality or folder-kind evidence | Addressing must define sibling identity/group semantics, or a later Naming contract must define an opaque source-backed key without Tree-policy leakage | n/a |
| `subtreeContextKey` | deferred | Addressing preferred; Naming only if it can prove neutral evidence partitioning | No approved current source or grouping strategy | n/a | n/a | n/a | n/a | n/a | neutral context candidate | Tree must not treat it as subtree ownership, structural home, semantic home, or placement evidence by itself | Addressing must define subtree grouping semantics and stability/collision rules, or a later sidecar must carry it as opaque evidence | n/a |
| `semanticTokens` | deferred | Naming | Naming token interpretation model | n/a | n/a | n/a | n/a | n/a | semantic evidence candidate | Tree must not derive role/category/home policy from tokens without Tree-owned rules | Naming must define a token vocabulary, token source, normalization, ordering, duplicate handling, and relationship to `semanticName`, `familyRoot`, and `semanticFamily` | n/a |
| `role` | deferred | Naming | Naming role parser / role registry | n/a | n/a | n/a | n/a | n/a | semantic evidence candidate | Tree must not derive folder/home/placement policy solely from role | Naming must define whether the bridge emits raw parsed role, normalized role, registry category/status, or all of these, and how provisional/deprecated roles serialize | n/a |
| `role-like fields` | deferred | Naming | Naming disambiguation / role-like token interpretation | n/a | n/a | n/a | n/a | n/a | semantic evidence candidate | Tree must not treat role-like evidence as a role verdict or placement policy | Naming must define bounded field names and distinguish role verdicts from role-like hints, ambiguity flags, and disambiguation evidence | n/a |
| `disambiguationNotes` | approved for a future enriched bridge version | Naming | Naming-owned disambiguation interpretation | `disambiguationNotes` | array of objects, each `{ "code": "<non-empty-kebab-case-string>", "message": "<short deterministic string>", "source": "naming" }`; no severity/confidence/verdict fields | Optional | Omit when there are no notes; empty array is allowed only when a producer intentionally serializes empty containers; `null` is not allowed | Sort by `code`, then `message`, then `source`; remove exact duplicates; messages must be deterministic and not environment-specific | diagnostic metadata / semantic evidence | Tree may consume only as Naming disambiguation evidence; Tree owns whether it is usable, diagnostic-only, or ignored | n/a | n/a |
| `evidenceStrength` | rejected for bridge payload use | Tree, if strength/confidence is ever interpreted; Naming may own only source facts | Tree confidence/severity policy, not a Naming bridge field | n/a | n/a | n/a | n/a | n/a | rejected Tree-policy/confidence candidate | Tree must not receive Naming-authored strength as bridge policy | n/a | It would encode confidence/strength policy and blur Tree-owned clean/usable evidence assessment, confidence, severity, and findings. |
| `evidenceLimitNotes` | approved for a future enriched bridge version | Naming | Naming-owned bridge production and source limitation diagnostics | `evidenceLimitNotes` | array of objects, each `{ "code": "<non-empty-kebab-case-string>", "message": "<short deterministic string>", "source": "naming" }`; no severity/confidence/verdict fields | Optional | Omit when there are no limits; empty array is allowed only when a producer intentionally serializes empty containers; `null` is not allowed | Sort by `code`, then `message`, then `source`; remove exact duplicates; messages must be deterministic and not environment-specific | diagnostic metadata | Tree may consume only as source-limit evidence or diagnostics; Tree owns fallback and finding policy | n/a | n/a |

Approved genuinely new first enriched bridge set: `parentOccurrenceAddress`, `occurrenceDepth`, `occurrenceOrderIndex`, `disambiguationNotes`, and `evidenceLimitNotes`.

Deferred genuinely new candidate set: `lineageKey`, `contextPartitionKey`, `siblingContextKey`, `subtreeContextKey`, `semanticTokens`, `role`, and `role-like fields`.

Rejected genuinely new candidate set: `evidenceStrength`.

## 8. Guardrails for approved future enrichment fields

Every approved future enrichment field is governed by these rules:

1. Naming remains folder-agnostic.
2. The field is evidence, not Tree policy.
3. The field must not encode occurrence identity, folder kind, structural home, semantic home, placement judgment, scatter/cluster judgment, confidence, severity, or findings.
4. Tree may consume the field only as evidence and retains all clean/usable evidence assessment, fallback selection, join diagnostics, placement reasoning, confidence, severity, and findings policy.
5. The field does not move tuple matching or join preparation into Addressing.
6. The field does not require shared join-helper extraction.
7. The field must remain additive and versioned.
8. The field must preserve current path-keyed compatibility during migration.
9. A future implementation must not remove `path`, `repoRelativePath`, or path-keyed compatibility fallback solely because approved enrichment fields exist.
10. A future implementation must validate enriched fields separately from the required identity tuple so unsupported enrichment can be reported without mislabeling valid identity as invalid.

## 9. Fallback and migration rule

Future implementation slices must follow this migration rule:

1. Tree should prefer address-keyed joins when `addressProfileId`, `addressedSnapshotId`, and `occurrenceAddress` are present and match the addressed occurrence namespace being consumed.
2. Path-based joins may remain as an explicit temporary compatibility fallback during migration.
3. Fallback behavior must be documented, test-covered, and removable later by an explicit implementation slice.
4. Fallback diagnostics should make it clear when Tree used path compatibility instead of address identity.
5. Tree must not silently re-derive Naming semantic-family interpretation when Naming evidence is missing. Missing Naming evidence should remain missing, bounded, or diagnostic according to Tree-owned consumer policy.
6. Future v2 enrichment does not by itself authorize provider swaps, Tree consumption changes, fallback removal, helper extraction, CLI changes, report-envelope changes, or runtime bridge production.
7. Retaining existing optional v1 `occurrenceType` does not require v2 and does not authorize any Tree folder-kind interpretation.

Path fallback is current implementation reality and must not be removed in this contract slice.

## 10. Relationship to current audited runtime fields

| Current audited field/surface | Relationship to this contract |
| --- | --- |
| Tree-local `addressPath` | Current runtime truth. Preserve as compatibility/debug alias during migration. Do not rename in runtime code as part of this contract. |
| Tree-local `parentAddressPath` | Current runtime truth on addressed occurrence records. Future enriched bridge payloads may emit `parentOccurrenceAddress` sourced from this parent identity, but the old source field name is not approved as the bridge field name. |
| Structural-addressing `address` | Candidate source for neutral `occurrenceAddress`; exact aliasing remains an implementation-slice decision. |
| Structural-addressing `addressPath` | Candidate compatibility/debug alias and possible initial source for `occurrenceAddress`; must be interpreted inside profile/snapshot namespace. |
| Structural-addressing `profileId` | Candidate source for contract field `addressProfileId`; this spec uses the bridge field name `addressProfileId` for clarity. |
| Structural-addressing `snapshotOutputId` | Related to `addressedSnapshotId`, but not identical by contract until a later slice decides whether output id is sufficient or an instance/source id is required. |
| Structural-addressing `occurrenceType` | Existing optional v1 occurrence-context / compatibility field when available; it remains Addressing-owned occurrence type data that Naming may echo, not durable identity and not Tree folder-kind policy. |
| Structural-addressing `depth` | Approved future bridge enrichment source for `occurrenceDepth`; it remains neutral context evidence. |
| Structural-addressing `orderIndex` | Approved future bridge enrichment source for `occurrenceOrderIndex`; it remains deterministic ordering/diagnostic evidence, not identity. |
| Current Naming bridge `path` observations | Current runtime truth and temporary compatibility alias. Future bridge observations should preserve `repoRelativePath` / `path` compatibility during migration. |
| Current Tree semantic-home evidence join by `path` | Current runtime truth and temporary fallback path. Future Tree consumption should prefer address-keyed joins only when contract fields are present and Tree-owned qualification accepts them. |

## 11. Unresolved naming and migration follow-up notes

The following questions remain explicit follow-up work and are not resolved by runtime changes in this slice:

1. Whether `addressedSnapshotId` should be a run/snapshot instance id, a content digest, a source snapshot id, or a constrained alias of current `snapshotOutputId`.
2. Whether the future v2 bridge should emit genuinely new approved enrichment fields directly on each observation, inside a nested `occurrenceContext` / `diagnostics` object, or in a separately named additive sidecar.
3. Whether structural-addressing `address` or `addressPath` should populate the first `occurrenceAddress` field in every producer path, and which compatibility alias must be retained in reports.
4. Which focused repeated-same-family fixtures should prove that address-keyed joins beat path/family bucket assumptions before fallback removal.
5. Which producer is the authoritative addressed snapshot provider for the cross-slice bridge: Tree-local addressed occurrences, structural-addressing addressed snapshots, or a later compatibility bridge between them.
6. Whether deferred partition keys should ever be emitted, and if so whether Addressing or Naming owns the exact grouping algorithm.
7. Whether deferred Naming token and role evidence should be modeled as bridge fields, a Naming-owned sidecar, or remain outside the occurrence bridge.

## 12. Non-goals

This spec does not:

- change runtime behavior;
- change Naming bridge payloads;
- change Tree join behavior;
- add genuinely new enriched fields to runtime outputs;
- rename `addressPath` in runtime code;
- wire Tree runtime to a different structural-addressing provider;
- remove path fallback;
- remove known-roots or revive known-roots;
- promote Addressing to a standalone runnable validator slice;
- move Addressing semantics into suite-core;
- move tuple matching or join preparation into Addressing;
- require shared join-helper extraction;
- broaden Tree semantic-home, structural-home, scatter, cluster, or drift reasoning;
- add Tree confidence, severity, findings, or report-envelope policy to Naming bridge payloads;
- rework validator report envelopes;
- change CLI behavior;
- fix unrelated validator findings;
- perform broad docs cleanup outside this contract slice.

## 13. Recommended next implementation child

Recommended next implementation child: define and test a data-only, explicitly versioned `naming-occurrence-bridge.v2` payload or additive sidecar that preserves v1 identity, optional v1 `occurrenceType`, and path/source-trace compatibility while carrying only the approved genuinely new first enriched bridge set: `parentOccurrenceAddress`, `occurrenceDepth`, `occurrenceOrderIndex`, `disambiguationNotes`, and `evidenceLimitNotes`.

That child should still avoid Tree reasoning expansion. It should include focused tests for payload shape, version handling, unsupported-enrichment diagnostics, and explicit fallback behavior without removing the current path-based consumer path.
