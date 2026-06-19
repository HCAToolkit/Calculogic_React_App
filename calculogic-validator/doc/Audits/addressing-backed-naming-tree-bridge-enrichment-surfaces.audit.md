# Addressing-backed Naming/Tree bridge enrichment surfaces audit

## Purpose

This audit is a docs-only Slice 1 contract-planning artifact for Addressing-backed Naming bridge enrichment and later Tree consumption. It answers the minimum safe contract question from current repo reality: the only resolved minimum-safe implementation contract is the current Addressing-backed identity/join tuple, while additional occurrence/nesting and Naming semantic context remains candidate enrichment that requires a Naming-owned bridge-contract/spec update before implementation. This audit does not resolve the exact bridge payload shape, required/optional status, or implementation eligibility for deferred enrichment fields. Any later enrichment must preserve Addressing-owned occurrence identity and leave all folder, home, placement, scatter/cluster, confidence, severity, diagnostic, and finding interpretation fully Tree-owned.

## Parent / issue context

- Child issue source: `Refs #648`.
- Parent roadmap context: `Refs #647`.
- Slice order: contract definition -> Naming bridge enrichment -> Tree enriched-bridge consumption.
- This slice defines the contract surface only. Runtime behavior is unchanged.

## Current repo reality

Current runtime truth has three separate surfaces:

1. Structural Addressing prepares deterministic tree-codebase occurrence records with address/profile/snapshot semantics and neutral lineage fields.
2. Naming projects semantic-family observations from canonical naming findings and can build a versioned occurrence bridge by attaching Addressing identity to those semantic observations by path.
3. Tree has a staged Naming occurrence bridge intake and address-keyed join helper, but current Tree contributor behavior only uses clean prepared address-keyed evidence as a safer source for the existing path-keyed semantic-family contributor shape; otherwise it falls back to the current path-keyed bridge.

This means the resolved minimum contract should be limited to the current additive identity/join surface, not a runtime policy migration. Candidate enrichment fields must first be decided and shaped in the relevant Naming-owned bridge spec/contract, keep Addressing identity stable, keep Naming folder-agnostic, and let Tree decide later whether enriched bridge evidence is clean, usable, diagnostic-only, or ignored.

## Current Addressing / structural-addressing surfaces

Inspected surfaces:

- `calculogic-validator/structural-addressing/src/structural-addressing-profile.knowledge.mjs`
- `calculogic-validator/structural-addressing/src/structural-addressing-tree-codebase.logic.mjs`
- `calculogic-validator/structural-addressing/test/`

Current address profile and profile-shaped constants:

- `STRUCTURAL_ADDRESSING_PROFILE_IDS.TREE_CODEBASE` is `tree-codebase`.
- `STRUCTURAL_ADDRESSING_BRIDGE_OUTPUT_IDS.ADDRESSED_TREE_SNAPSHOT` is `addressedTreeSnapshot`.
- `TREE_CODEBASE_ADDRESSING_PROFILE` currently defines `profileId`, `status`, `domainPrefix`, `lineageSeparator`, `counterReset`, `occurrenceTypes`, `levelRules`, and `snapshotOutputId`.
- `ADDRESSED_TREE_SNAPSHOT_BRIDGE_OUTPUT` currently declares producer `structural-addressing`, primary consumer `tree`, profile id `tree-codebase`, and domain prefix `T`.
- `GET_TREE_RENDER_VIEW` assumes `addressedTreeSnapshot` input, `tree-codebase` profile, and text/json/both render formats.

Current tree-codebase addressed output shape:

- Top-level snapshot fields: `snapshotOutputId`, `profileId`, `domainPrefix`, `sourceNamespace`, `scope`, `target`, `scopeRoots`, `occurrenceRecords`.
- Occurrence record fields: `address`, `addressPath`, `displayMarker`, `occurrenceType`, `name`, `path`, `parentAddressPath`, `depth`, `orderIndex`.
- Addressing currently uses `addressPath` as the stable neutral lineage token and also mirrors it in `address`.

Current occurrence identity fields:

- Addressing records expose `addressPath`; Naming occurrence payload construction can consume `occurrenceAddress`, `address`, or `addressPath` from occurrence records and normalizes that to `occurrenceAddress` in the bridge.
- Current minimum identity tuple for an addressed Naming occurrence is `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`.
- `repoRelativePath` / `path` remains compatibility and lookup evidence, not the preferred identity.

Parent/child/depth/order fields:

- `parentAddressPath` is `null` at roots and a string for child occurrences.
- `depth` is a non-negative integer rooted at `0`.
- `orderIndex` is a deterministic traversal order integer.
- Siblings are sorted by `name`, then `occurrenceType`, then `path`; folder and file marker counters reset per parent.

Renderer/provider assumptions and tests:

- Rendering requires unique `addressPath`, valid `parentAddressPath` references, valid parent/depth relationships, and non-negative `orderIndex`.
- Tests lock deterministic roots (`A`, `B`), nested folder/file marker behavior (`A.A`, `A.1`), required occurrence record fields, parent/depth/order behavior, and renderer failure modes for duplicate addresses, dangling parents, cycles, invalid depth, and invalid order.

## Current Naming bridge production surfaces

Inspected surfaces:

- `calculogic-validator/naming/src/naming-semantic-family-bridge-projection.logic.mjs`
- `calculogic-validator/naming/src/naming-occurrence-bridge-payload.logic.mjs`
- `calculogic-validator/naming/test/`

Current semantic-family bridge projection:

- `projectNamingSemanticFamilyBridge` reads naming findings and emits observations only for `classification: canonical` findings with a valid `path` and semantic details.
- Each observation can include `path`, `semanticName`, `familyRoot`, `semanticFamily`, optional `familySubgroup`, optional sorted `ambiguityFlags`, and optional sorted `splitFamilyFlags`.
- The projection is flat and path-keyed; it does not carry occurrence nesting context.

Current occurrence bridge payload shape:

- `createNamingOccurrenceBridgePayload` emits a versioned object with `bridgeContractVersion: naming-occurrence-bridge.v1`, `bridgeSource`, `bridgeProducerId`, `addressProfileId`, `addressedSnapshotId`, optional `sourceReportRef`, optional `sourceSnapshotRef`, `compatibility`, `observations`, and optional `diagnostics`.
- Observations include `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`, `repoRelativePath`, `path`, optional `addressPath`, optional `occurrenceType`, and Naming semantic fields copied from the semantic-family bridge.
- Naming currently attaches occurrence identity by path lookup against addressed occurrence records.

Current bridge metadata and compatibility behavior:

- Compatibility metadata records that path-keyed semantic payload is preserved, `path` is a temporary compatibility field, `addressPath` is temporary debug context, missing identity observations are omitted, and diagnostic counts are summarized.
- Missing address namespace fields create `invalid-addressed-namespace` diagnostics.
- Missing path keys, unmatched occurrence records, or incomplete occurrence identity create `missing-occurrence-identity` diagnostics.

Current ambiguity and split-family propagation:

- `ambiguityFlags` and `splitFamilyFlags` are copied from Naming details and normalized as string arrays where present.
- These flags remain Naming-owned semantic diagnostics/qualifiers; they do not become Tree placement policy.

Current output mode:

- The semantic-family projection is flat and path-keyed.
- The occurrence bridge is flat and occurrence-attached by identity tuple.
- There is no current context partitioning, lineage grouping, sibling grouping, or subtree grouping in Naming output.

## Current Tree bridge intake and join-consumption surfaces

Inspected surfaces:

- `calculogic-validator/tree/src/tree-naming-occurrence-intake.logic.mjs`
- `calculogic-validator/tree/src/contributors/tree-naming-semantic-family-bridge-contributor.logic.mjs`
- `calculogic-validator/tree/src/contributors/tree-naming-semantic-family-bridge-contributor.wiring.mjs`
- `calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs`
- `calculogic-validator/tree/test/`

Current staged Naming occurrence bridge intake:

- `prepareTreeNamingOccurrenceBridgeIntake` accepts either direct `namingOccurrenceBridge` transport or `namingSemanticFamilyBridge.namingOccurrenceBridge`.
- It recognizes only `bridgeContractVersion: naming-occurrence-bridge.v1`.
- It extracts sorted identity tuples with fields `addressProfileId`, `addressedSnapshotId`, and `occurrenceAddress`.
- It reports `absent`, `invalid`, `recognized-future-evidence-only`, or `recognized-with-diagnostics`.
- Current intake sets `usedForCurrentTreeJoins: false`; it is staged evidence, not direct current Tree policy.

Current address-keyed join evidence preparation:

- `prepareTreeNamingOccurrenceAddressJoinEvidence` joins Naming bridge observations to addressed occurrence records by the identity tuple.
- It validates addressed namespace `addressProfileId`, `addressedSnapshotId`, and array-shaped `occurrenceRecords`.
- It skips ambiguous duplicate observation tuples, ambiguous occurrence tuples, invalid observation tuples, and unmatched occurrence tuples.
- Joined entries carry `evidenceType: tree-prepared-naming-occurrence-address-join`, `identityTuple`, cleaned `namingObservation`, and cleaned `occurrenceRecord`.

Current clean-join qualification:

- The semantic-family contributor treats prepared address-keyed evidence as clean only when status is `joined`, `usedForCurrentTreeJoins` is `true`, `joinedEvidence` is non-empty, `diagnostics` is an empty array, and `skippedJoins` is an empty array.
- Clean address-keyed evidence is projected back into the existing semantic-family contributor observation shape before findings are collected.

Current invalid/skipped/diagnostic/empty states and fallback behavior:

- Intake invalid/malformed payloads become diagnostics and are not used for joins.
- Join output status can be `absent`, `skipped-with-diagnostics`, `joined-with-skips`, `joined`, or `no-joined-evidence`.
- The contributor falls back to the original path-keyed bridge whenever address-keyed evidence is absent, diagnostic-bearing, skipped, empty, or not clean.
- Tests lock fallback when address-keyed evidence is absent, has diagnostics, has no joined evidence, or has skipped mismatched joins.

Current Tree advisor/wiring handoff:

- `tree-structure-advisor.wiring.mjs` prepares structural address snapshots, semantic evidence bridges, occurrence bridge intake, structural-home evidence, semantic-home evidence, folder-kind evidence, occurrence classification replacement evidence, and contributor wiring.
- The contributor wiring accepts `namingSemanticFamilyBridge` plus optional `preparedAddressKeyedJoinEvidence`.
- Current runtime truth does not require Naming enriched bridge fields for Tree behavior.

## Current bridge payload and occurrence identity fields

Current bridge payload fields:

- Semantic-family bridge observations: `path`, `semanticName`, `familyRoot`, `semanticFamily`, optional `familySubgroup`, optional `ambiguityFlags`, optional `splitFamilyFlags`.
- Naming occurrence bridge top-level: `bridgeContractVersion`, `bridgeSource`, `bridgeProducerId`, `addressProfileId`, `addressedSnapshotId`, optional `sourceReportRef`, optional `sourceSnapshotRef`, `compatibility`, `observations`, optional `diagnostics`.
- Naming occurrence bridge observations: `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`, `repoRelativePath`, `path`, optional `addressPath`, optional `occurrenceType`, plus Naming semantic fields.

Current fields Tree already uses for joining:

- Required identity tuple: `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`.
- Addressed occurrence namespace: top-level `addressProfileId`, `addressedSnapshotId`, `occurrenceRecords`.
- Addressed occurrence record identity source: `occurrenceAddress` or `addressPath`.
- `path` / `repoRelativePath` is preserved for compatibility, report readability, and current fallback behavior, not as the long-term join key.

## Current fallback and compatibility behavior

- Path-keyed bridge behavior remains current implementation reality for the existing semantic-family contributor when clean address-keyed evidence is unavailable.
- Address-keyed evidence is preferred only when clean and non-empty.
- Compatibility fields (`path`, `addressPath`, compatibility diagnostic counts, source diagnostics) must remain diagnostic/transition support until a later slice changes runtime consumption policy.
- This slice does not remove fallback behavior or change report envelopes.

## Proposed contract questions

Resolved minimum-safe fields for current implementation:

1. Minimum safe identity contract: `addressProfileId`, `addressedSnapshotId`, and `occurrenceAddress` are the required occurrence identity tuple.
2. Minimum safe neutral context for current implementation: Naming may rely on the current identity/join fields `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`, and compatibility/source-trace path fields already present in the bridge.
3. Minimum Tree later-consumption contract: Tree should consume any later enriched fields as evidence and decide clean/usable/fallback behavior itself.

Candidate / unresolved fields for later contract work:

- `parentAddressPath`, `depth`, and `orderIndex` remain future enrichment candidates and require a normative bridge spec/contract update before implementation.
- `semanticTokens`, `role`, role-like fields, and bounded `disambiguationNotes` remain deferred Naming-owned enrichment candidates and require a later Naming-owned contract slice to document exact field shape, required/optional status, ownership, and implementation eligibility before runtime addition.
- Context partition keys are future enrichment candidates and require a normative bridge spec/contract update before implementation; if later approved, they must be explicitly labeled semantic-evidence partitions, not Tree structural homes.

Unresolved for later issue:

- Exact bridge version bump name and migration window.
- Whether enriched context is embedded per observation only or also summarized in top-level partitions.
- Whether `semanticTokens` is required or optional.
- Whether `role` or role-like fields should be included only after a later Naming-owned bridge slice documents the exact source, normalization, and payload shape.
- Whether sibling/subtree keys should be opaque Addressing-provided keys or Naming-computed partition keys from Addressing lineage.

## Proposed enriched Naming bridge field candidates

| Field candidate | Slice 1 recommendation | Ownership / notes |
| --- | --- | --- |
| `addressProfileId` | Allow; required identity. | Addressing-owned profile identity. |
| `addressedSnapshotId` | Allow; required identity. | Addressing-owned snapshot identity. |
| `occurrenceAddress` | Allow; required identity. | Addressing-owned occurrence identity. |
| `addressPath` | Allow as compatibility/diagnostic mirror only unless it is explicitly the same value as `occurrenceAddress`. | Addressing-owned; avoid two competing identities. |
| `parentAddressPath` | Defer as future enrichment candidate until a normative bridge spec/contract update includes it. | Addressing-owned containment pointer; Naming must not infer folder kind/home from it. |
| `depth` | Defer as future enrichment candidate until a normative bridge spec/contract update includes it. | Addressing-owned nesting depth; any later Naming partitioning by depth bands must be semantic evidence context only. |
| `orderIndex` | Defer as future enrichment candidate until a normative bridge spec/contract update includes it. | Addressing-owned deterministic traversal order; any later use should be diagnostic/sorting only for Naming. |
| `occurrenceKind` / `occurrenceType` | Prefer existing `occurrenceType`; defer `occurrenceKind` unless Addressing adds a separate vocabulary. | Addressing-owned file/folder occurrence type, not Tree folder kind. |
| `lineageKey` | Defer as future enrichment candidate until a normative bridge spec/contract update defines its source and shape. | Neutral grouping key, not a structural home. |
| `contextPartitionKey` | Defer as future enrichment candidate until a normative bridge spec/contract update defines its source and shape. | Must not encode folder kind, structural home, semantic home, or placement judgment. |
| `siblingContextKey` | Defer or allow only as opaque neutral key. | Safer if Addressing provides it; Naming-computed sibling semantics risk Tree ownership blur. |
| `subtreeContextKey` | Defer or allow only as opaque neutral key. | Subtree interpretation should remain Addressing/Tree-owned. |
| `semanticName` | Allow; existing Naming-owned field. | Naming-owned. |
| `semanticTokens` | Defer as a Naming-owned semantic bridge candidate unless a later Naming-owned bridge-contract/spec update documents exact field shape, required/optional status, ownership, and implementation eligibility. | Naming-owned token interpretation; should be deterministic and non-policy if later approved. |
| `familyRoot` | Allow; existing Naming-owned field. | Naming-owned. |
| `semanticFamily` | Allow; existing Naming-owned field. | Naming-owned. |
| `familySubgroup` | Allow optional; existing field. | Naming-owned. |
| `role` | Defer as a Naming-owned candidate unless a later Naming-owned bridge-contract/spec update documents the exact source, normalization, payload shape, required/optional status, and implementation eligibility. | Naming-owned, but current bridge does not carry it. |
| `ambiguityFlags` | Allow; existing Naming-owned field. | Diagnostic/semantic qualifier only. |
| `splitFamilyFlags` | Allow; existing Naming-owned field. | Diagnostic/semantic qualifier only. |
| `disambiguationNotes` | Defer as a Naming-owned diagnostic/semantic candidate unless a later Naming-owned bridge-contract/spec update documents exact field shape, required/optional status, ownership, and implementation eligibility. | Naming-owned notes; must not prescribe Tree findings if later approved. |
| `evidenceStrength` / `evidenceLimit notes` | Defer or allow as diagnostic-only. | Avoid creating Tree confidence policy inside Naming. |

## Neutral occurrence context Naming may consume

Naming may safely consume the current identity/join fields that already exist in the bridge:

- `addressProfileId`
- `addressedSnapshotId`
- `occurrenceAddress`
- `addressPath` only when used as the current compatibility/debug mirror for the occurrence address
- `occurrenceType` where already present in current bridge observations
- `repoRelativePath` / `path` only for compatibility and source traceability

Future enrichment candidates such as `parentAddressPath`, `depth`, and `orderIndex` may be considered only after a normative bridge spec/contract update defines their exact payload shape, required/optional status, and diagnostic behavior. Naming may use future approved fields to partition Naming semantic evidence by neutral occurrence/nesting context only when those partitions are labeled as evidence grouping, not as Tree structural interpretation.

## Naming enrichment constraints

Naming may:

- Attach neutral Addressing occurrence identity to Naming-owned semantic observations.
- Carry neutral nesting context and deterministic order only after the bridge spec/contract explicitly adds those fields.
- Group semantic evidence by neutral lineage/context partition keys only after the bridge spec/contract defines those keys.
- Preserve `ambiguityFlags` and `splitFamilyFlags` as Naming-owned qualifiers.

Naming must not own or emit as policy truth:

- folder kind;
- structural home;
- semantic home;
- placement judgment;
- scatter/cluster judgment;
- whole-placement confidence;
- Tree advisory severity;
- Tree findings.

## Tree later-consumption constraints

Tree later consumption should:

- Continue to validate the identity tuple before using enriched evidence.
- Treat enriched Naming bridge fields as evidence, not policy.
- Keep clean/usable evidence qualification Tree-owned.
- Keep fallback behavior Tree-owned until a later issue explicitly changes it.
- Preserve diagnostics for unsupported versions, malformed observations, ambiguous tuples, skipped joins, and empty evidence.
- Avoid re-deriving Naming semantic fields from filenames when enriched Naming fields are missing.

Tree needs from the enriched bridge later:

- A stable identity tuple.
- Enough neutral lineage context to distinguish same-path or same-family occurrences without path-only joins.
- Optional context partition keys that explain how Naming grouped semantic evidence without making folder/home/placement claims.
- Explicit diagnostics/compatibility metadata so Tree can decide whether evidence is clean, degraded, or fallback-only.

## Ownership matrix

| Area | Owns | Must not own |
| --- | --- | --- |
| Addressing | occurrence identity; address profile semantics; addressed snapshot semantics; lineage/depth/containment identity; parent/child/sibling traversal mechanics; deterministic occurrence ordering; neutral addressed evidence join mechanics when extracted; neutral provider/bridge output rules | Naming semantic interpretation; Tree folder/home/placement findings |
| Naming | semantic-name interpretation; semantic-token interpretation; family-root interpretation; semantic-family interpretation; family-subgroup interpretation; role parse interpretation; ambiguity flags; split-family flags; Naming bridge observation production; partitioning Naming semantic evidence by neutral occurrence/nesting context | folder kind; structural home; semantic home; placement judgment; scatter/cluster judgment; whole-placement confidence; Tree advisory severity; Tree findings |
| Tree | bridge consumption policy; clean/usable evidence qualification; fallback behavior; folder-kind interpretation; structural-home interpretation; semantic-home interpretation; placement reasoning; scatter/cluster reasoning; whole-placement confidence; diagnostics and findings | Addressing occurrence identity/profile semantics; Naming semantic-name/family derivation |
| Suite-core | runner orchestration; staging; target/scope transport; source metadata; report envelope mechanics; neutral opaque payload transport | Addressing semantics; Naming semantics; Tree policy/finding interpretation |

## Deferred / non-goal boundaries

This slice does not implement:

- Naming bridge enrichment runtime changes;
- Tree enriched-bridge consumption changes;
- Tree runtime provider swap;
- fallback removal;
- suite-core helper extraction;
- standalone Addressing validator promotion;
- known-roots revival;
- Tree placement/scatter/cluster expansion;
- Naming folder/placement reasoning;
- CLI changes;
- report-envelope changes;
- unrelated cleanup.

Runtime behavior must remain unchanged.

## Unresolved questions

1. What exact `bridgeContractVersion` should carry enriched context: `naming-occurrence-bridge.v2`, `naming-occurrence-bridge.v1.enriched`, or a separate sidecar contract?
2. Should `lineageKey`, `contextPartitionKey`, `siblingContextKey`, and `subtreeContextKey` be produced by Addressing, Naming, or both with separate owner-prefixed names?
3. Should `parentAddressPath`, `depth`, and `orderIndex` be required for all enriched observations or optional when absent from source snapshots?
4. Should `role` be included in the first enriched bridge version, or deferred until role parsing is explicitly bridge-versioned?
5. Should `evidenceStrength` be rejected entirely from Naming output to avoid Tree confidence leakage, or allowed as diagnostic-only `evidenceLimitNotes`?
6. Should Tree's later clean-join criteria require zero diagnostics globally, or allow degraded enriched evidence with explicit fallback diagnostics?

## Recommended next issue

Recommended next issue: begin with a bounded Naming-owned bridge-contract/spec update before implementing runtime fields. That next issue should:

1. update or refine the normative Naming bridge contract/spec;
2. decide which candidate enrichment fields are allowed;
3. define each allowed field's exact payload shape, ownership, and required/optional status;
4. only then permit additive runtime bridge enrichment work.

Candidate fields such as `parentAddressPath`, `depth`, `orderIndex`, `semanticTokens`, `role`, role-like fields, and partition keys must not be directly added from this audit alone. Runtime enrichment and Tree consumption policy should remain separate follow-up slices.

## Verification

Planned verification for this docs-only slice:

- `git diff --check`
- `git diff -- calculogic-validator/doc calculogic-validator/src/core calculogic-validator/naming calculogic-validator/tree calculogic-validator/structural-addressing`
- `npm run validate:naming -- --scope=validator --target calculogic-validator/doc/Audits/addressing-backed-naming-tree-bridge-enrichment-surfaces.audit.md --target calculogic-validator/doc/Indexes/validator-docs.index.md`
- `npm run validate:tree -- --scope=validator --target calculogic-validator/doc`
