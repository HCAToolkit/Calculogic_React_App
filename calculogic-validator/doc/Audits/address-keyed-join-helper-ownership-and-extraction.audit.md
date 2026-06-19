# Address-Keyed Join Helper Ownership and Extraction Audit

## 1. Executive summary

This audit implements issue #642 as the parent roadmap's Slice 8 planning pass for issue #618. It uses the completed address-keyed bridge sequence as historical intent and uses current merged repo reality as primary evidence.

Recommendation:

1. Keep Tree-specific join qualification, fallback selection, contributor policy, advisor orchestration, diagnostic shaping for Tree status, and Tree finding interpretation Tree-owned. Keep the current contributor input adapter Tree-owned while it exists, but treat it as a temporary migration surface rather than a permanent architectural requirement.
2. Treat occurrence namespace preparation and addressed occurrence record production as the strongest candidate for a future Addressing-owned provider surface, because the current Tree occurrence and structural-address snapshots are already functioning as a Tree-local Addressing provider.
3. Move nothing into suite-core now. Suite-core should continue to own runner staging and neutral transport only. It should not own address profile semantics, snapshot identity, Naming semantic projection, Tree join statuses, or contributor policy.
4. Do not perform broad extraction until a narrowly scoped follow-up issue is approved and a second real consumer or concrete Addressing-provider migration pressure exists.

The best option is **Option E with a narrow Option B follow-up candidate**: defer runtime extraction now, record boundaries, and only consider an Addressing-owned provider contract for occurrence identity/namespace records if the next implementation issue explicitly scopes that seam.

## 2. Current runtime reality

### 2.1 Runner staging and transport

Current runtime truth: suite-core stages Naming before Tree when Tree is selected. `runValidatorRunner(...)` runs the Naming registry entry, projects the Naming semantic-family bridge, and passes that payload to Tree. The runner does not construct addressed occurrence records and does not interpret Naming or Tree semantics.

Current implementation reality: runner staging imports `projectNamingSemanticFamilyBridge` from Naming and passes `namingSemanticFamilyBridge` into Tree only for the Tree registry entry. This is suite-core orchestration plus bridge transport, but the import is id-specific and should remain bounded rather than become a generic semantic helper.

### 2.2 Naming projection and occurrence bridge payload creation

Current runtime truth: Naming owns semantic projection from Naming findings to bridge observations. `projectNamingSemanticFamilyBridge(...)` filters canonical Naming findings, preserves semantic name/family/root/subgroup and ambiguity flags, and sorts observations by path.

Current runtime truth: the occurrence bridge payload is Naming-owned bridge observation production over an addressed occurrence namespace supplied from outside Naming. `createNamingOccurrenceBridgePayload(...)` attaches `addressProfileId`, `addressedSnapshotId`, and `occurrenceAddress` to Naming semantic observations by matching semantic observations to occurrence records through a compatibility path key. It preserves source semantics and emits diagnostics when namespace identity or occurrence identity is incomplete.

Historical intent from #618 is consistent with this split: Naming emits semantic observations attached to occurrence identity while Tree consumes them after deterministic join, and suite-core does not become a semantic owner for Addressing, Naming, or Tree.

### 2.3 Tree occurrence and structural-address snapshots

Current runtime truth: Tree wiring prepares occurrence and structural-address snapshots before Tree runtime. `prepareTreeOccurrenceSnapshot(...)` normalizes selected paths, scope roots, target descriptors, lineage, depth, parent relationships, scoped-root flags, and deterministic sibling markers. `prepareTreeStructuralAddressSnapshot(...)` wraps that snapshot into Tree-consumable addressed occurrence records with `path`, `name`, `addressPath`, and `parentAddressPath` fields.

Current implementation reality: `prepareTreeStructuralAddressSnapshot(...)` does not currently emit explicit `addressProfileId` or `addressedSnapshotId`; those namespace fields are supplied by callers/tests when producing Naming occurrence bridge payloads or preparing address-keyed join evidence. Therefore the current Tree structural-address snapshot is a Tree-local addressed-record provider, but not yet a complete Addressing-owned provider surface.

### 2.4 Tree Naming occurrence intake and address-keyed join preparation

Current runtime truth: Tree owns bridge intake and address-keyed join preparation for Tree-consumable evidence. `prepareTreeNamingOccurrenceBridgeIntake(...)` recognizes the Naming occurrence bridge contract, validates identity tuple fields, preserves Naming diagnostics, and marks intake as not used for current Tree joins. `prepareTreeNamingOccurrenceAddressJoinEvidence(...)` combines Naming occurrence observations with addressed occurrence namespace records by the tuple `addressProfileId + addressedSnapshotId + occurrenceAddress` and returns Tree-specific join statuses, skipped join reasons, diagnostics, and `usedForCurrentTreeJoins`.

### 2.5 Clean-join qualification, contributor preference, and fallback

Current runtime truth: Tree contributor code prefers prepared address-keyed joined evidence only when it is clean: `status === 'joined'`, `usedForCurrentTreeJoins === true`, non-empty joined evidence, no diagnostics, and no skipped joins. When that predicate fails, the contributor falls back to the path-keyed Naming semantic-family bridge. This fallback selection is Tree policy because it decides which evidence route drives Tree scatter/cluster/advisory findings.

### 2.6 Structural-addressing subtree

Current implementation reality: `calculogic-validator/structural-addressing/` contains a profile, marker strategies, a tree-codebase addressed snapshot producer, render helpers, and tests. It models a `tree-codebase` profile and an `addressedTreeSnapshot` output with producer `structural-addressing` and primary consumer `tree`.

Documented target direction: issue #618 states Addressing should own occurrence identity, address grammar/profile semantics, addressed snapshot semantics, lineage/depth/containment identity, and bridge-provider rules. The structural-addressing subtree aligns with that target direction, but current Tree runtime does not consume it as the active provider.

## 3. Surface-by-surface ownership inventory

| Surface / responsibility | Current owner | Evidence | Long-term owner recommendation | Rationale |
|---|---|---|---|---|
| occurrence namespace preparation: `addressProfileId`, `addressedSnapshotId` | caller/test/wiring-adjacent, not complete in Tree snapshot | Naming payload and Tree join expect fields; Tree structural-address snapshot omits explicit namespace ids | Addressing-owned provider candidate; no extraction yet | Namespace identity is Addressing semantic identity, not Tree policy or suite-core mechanics. Current implementation is incomplete as a provider contract. |
| occurrence address generation | Tree occurrence snapshot / structural-address snapshot | `occurrenceMarker` and `addressPath` derive from Tree-local path/lineage sorting | Addressing-owned provider candidate | Address grammar/profile semantics should move behind Addressing if provider extraction is approved. |
| occurrence records | Tree occurrence snapshot and Tree structural-address snapshot | Tree creates records from selected paths, lineage, scope roots, depth, and markers | Addressing provider candidate for identity fields; Tree may still prepare Tree-specific inputs | Records encode addressed occurrence identity and relationships, but current consumer is Tree only. |
| Naming semantic-family projection | Naming | `projectNamingSemanticFamilyBridge(...)` derives observations from Naming findings | Naming | Filename-derived semantic interpretation is Naming-owned. |
| Naming occurrence bridge projection | Naming | `createNamingOccurrenceBridgePayload(...)` attaches Naming observations to supplied addressed namespace | Naming for semantic observation production; Addressing for future provider input | Naming should produce the bridge payload but should not own address grammar/profile semantics. |
| Naming bridge transport in runner | suite-core | runner stages Naming before Tree and passes bridge payload | suite-core | Neutral orchestration and payload transport. |
| Tree bridge intake | Tree | intake validates bridge contract for Tree consumption and preserves diagnostics | Tree | This is consumer-side contract guarding and Tree evidence readiness. |
| address-keyed join tuple matching | Tree today | `prepareTreeNamingOccurrenceAddressJoinEvidence(...)` indexes occurrence records and Naming observations by tuple | Keep Tree-owned now; possible neutral micro-helper only after second consumer | Matching mechanics are partly neutral, but current helper also shapes Tree statuses and diagnostics. |
| clean-join qualification | Tree | contributor predicate gates address-keyed evidence before findings | Tree | Clean enough for Tree findings is Tree policy. |
| fallback selection | Tree | contributor falls back to path-keyed bridge when address-keyed route is absent/unclean | Tree | Evidence-route choice controls Tree advisory behavior. |
| contributor input adaptation | Tree | joined evidence is converted back into a semantic-family bridge-shaped payload for existing contributor analysis | Tree-owned while present; removable migration surface | Adaptation is temporary Tree migration mechanics for Tree findings. Retirement of the adapter does not transfer contributor policy, fallback policy, or readiness/status semantics to Addressing or suite-core. |
| advisor orchestration | Tree | Tree wiring assembles snapshots, evidence, registries, replacement runtime, contributors | Tree, with suite-core inputs | Tree owns orchestration of Tree reasoning; suite-core only supplies scoped snapshot inputs. |
| diagnostic shaping for Tree join statuses | Tree | statuses include `absent`, `skipped-with-diagnostics`, `joined-with-skips`, `joined`, and `usedForCurrentTreeJoins` | Tree | These statuses express Tree readiness and policy, not neutral transport. |
| deterministic sorting | mixed local mechanics | Naming sorts observations; Tree sorts tuples/join entries; structural-addressing sorts siblings | Keep local unless duplicated across real consumers with identical semantics | Sorting keys are domain-specific today. Suite-core extraction would be premature. |

## 4. Ownership matrix

| Topic | Addressing owns | Naming owns | Tree owns | Suite-core owns |
|---|---|---|---|---|
| occurrence identity | target architecture owner for `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`, profile grammar, addressed snapshot semantics | consumes supplied identity to attach observations | consumes identity for Tree evidence joins | transports opaque payloads only |
| filename semantics | none | semantic name, family, root, subgroup, role, ambiguity, disambiguation | consumes Naming observations as evidence | none |
| addressed records | target architecture owner for provider rules and lineage/depth/containment identity | no generation responsibility | current implementation reality: Tree-local provider-like snapshots | neutral target/scope transport only |
| join preparation | may own tuple normalization if provider contract later exposes it | no Tree join ownership | Tree-owned evidence preservation, statuses, skips, readiness, and Tree-consumable shape | no semantic join ownership now |
| fallback policy | none | none | Tree-owned selection between address-keyed and path-keyed evidence | none |
| staging | none | exposes projection function | accepts staged bridge | runner orchestration and payload passing |
| report envelope | none | Naming report content | Tree report content | envelope, metadata, source snapshot, exit/report mechanics |

## 5. Dependency-direction analysis

Acceptable current directions:

- suite-core may import slice host/projection surfaces for registered runner orchestration while keeping semantics in slice-owned functions.
- Tree may import Naming bridge preparation contracts that produce stable observations, because Tree is a consumer of Naming-owned evidence.
- Tree may import suite-core scoped snapshot input helpers because scope/target transport is suite-owned.
- Naming may consume an addressed occurrence namespace as input to produce a Naming-owned occurrence bridge, provided Naming does not define address grammar/profile policy.

Directions to avoid:

- suite-core importing or implementing address grammar/profile semantics, Tree statuses, contributor preference, fallback policy, or Naming semantic interpretation.
- Tree importing Naming internals beyond bridge contracts/projection surfaces or re-parsing filenames to derive Naming semantics.
- Naming importing Tree placement, structural-home, semantic-home, scatter, cluster, drift, or advisor reasoning.
- Addressing depending on Tree-specific conclusions such as folder-kind, structural-home, semantic-home, clean-join readiness, or contributor policy.
- generic helpers depending on concrete validator findings, Tree contributor behavior, or report-visible advisory meaning.

Current risk level is low-to-moderate. The runner has id-specific staging logic for Naming-to-Tree, but this is current runtime truth for orchestration. The bigger future risk would be extracting tuple/join helpers into suite-core before the semantic boundaries are separated.

## 6. Extraction-pressure analysis

Actual evidence for extraction is limited.

Evidence that supports a future Addressing-owned provider candidate:

- The identity tuple is now stable across Naming payload production and Tree join preparation.
- Tree-local snapshots already prepare occurrence relationships, lineage/depth, and address-like markers.
- `structural-addressing/` already contains a provider-shaped tree-codebase addressed snapshot surface with profile metadata and tests.
- Parent issue #618 explicitly defines Addressing as the target owner for occurrence identity and addressed snapshot semantics.

Evidence against extraction now:

- Tree is the only active runtime consumer of the addressed occurrence records.
- The structural-addressing subtree is not the active Tree wiring provider.
- Suite-core has no second consumer for tuple matching, namespace validation, deterministic join sorting, or bridge envelope handling.
- Current join helper mixes neutral tuple matching with Tree-specific statuses, diagnostics, `usedForCurrentTreeJoins`, evidence preservation, and fallback readiness.
- Moving code now would create migration burden and test churn without changing runtime behavior.
- Clean fallback deletion remains easier if current helper boundaries stay local: the Tree contributor has one predicate and one fallback selection seam to retire later.

Conclusion: extraction pressure is real only around future Addressing provider ownership for occurrence namespace and addressed records. It is not yet strong enough for suite-core neutral helper extraction.

## 7. Options comparison

| Option | Benefit | Cost / risk | ROI assessment | Recommendation |
|---|---|---|---|---|
| Option A — Keep current ownership | Lowest migration risk; preserves proven tests; keeps Tree policy local | Leaves Tree-local Addressing-like provider seam in place | Good short-term ROI | Accept as current runtime truth. |
| Option B — Add an Addressing-owned provider surface | Aligns occurrence identity/profile/snapshot production with #618 target architecture; clarifies provider boundary | Requires migration design, parity tests, and no behavior changes; current Tree provider is not yet identical to structural-addressing | Good future ROI if scoped narrowly | Recommend as the only plausible implementation follow-up candidate, not this PR. |
| Option C — Extract neutral join mechanics to suite-core | Could reduce duplicate tuple normalization if multiple consumers appear | High risk of suite-core absorbing semantic Addressing/Tree policy; no second consumer now | Low current ROI | Do not recommend now. |
| Option D — Split responsibilities | Best target architecture: Addressing provider + Tree policy + neutral mechanics only if proven | Requires careful sequencing and multiple PRs; premature if done all at once | Good target model, poor immediate implementation ROI | Record as target direction, not immediate extraction. |
| Option E — Defer extraction | Avoids over-engineering; keeps fallback retirement easy; documents triggers | Leaves some duplication/local helper mechanics in place | Highest current ROI | Recommended now. |

Direct comparison: Option E wins now because it preserves deterministic organization with no runtime churn. Option B is the strongest future candidate because it moves semantic Addressing ownership to the right place without moving Tree policy. Option C is weakest now because suite-core has no real consumer count or semantic neutrality proof. Option D is the likely staged implementation path after an Addressing provider is approved, but it should not be implemented as one broad extraction.

## 8. Recommended ownership model

Recommended model:

1. **Tree-owned policy now and long term:** clean-join qualification, fallback selection, Tree bridge intake/readiness status semantics, `usedForCurrentTreeJoins`, contributor policy, advisor orchestration, diagnostics, and Tree findings.
2. **Tree-owned migration mechanics while present:** contributor input adaptation from joined occurrence evidence into the existing semantic-family contributor shape. This adapter may be removed after direct address-keyed consumption and fallback retirement are separately proven; retirement does not transfer Tree policy responsibilities to Addressing or suite-core.
3. **Naming-owned now and long term:** semantic-family projection and occurrence bridge observation production. Naming should continue to preserve semantic payload and attach occurrence identity only when an addressed namespace is supplied.
4. **Addressing-owned candidate:** occurrence namespace preparation, addressed snapshot identity, address profile semantics, occurrence address generation, lineage/depth/containment identity, and provider rules for addressed occurrence records.
5. **Suite-core-owned only:** runner orchestration, staging, target/scope transport, report-envelope mechanics, source metadata, and opaque payload transport.
6. **No suite-core extraction now:** tuple validation, deterministic tuple sorting, and envelope normalization should remain local until there is more than one real consumer and a helper can be proven not to encode profile, snapshot, Naming, or Tree semantics.

## 9. Explicit keep-as-is decisions

Keep these as-is in this task:

- Keep `prepareTreeNamingOccurrenceAddressJoinEvidence(...)` in Tree.
- Keep `prepareTreeNamingOccurrenceBridgeIntake(...)` in Tree.
- Keep the clean-join predicate and path fallback selection in the Tree semantic-family bridge contributor.
- Keep Naming bridge projection in Naming.
- Keep suite runner staging unchanged.
- Keep Tree occurrence and structural-address snapshots as current runtime truth until an Addressing provider issue is approved.
- Keep deterministic sorting local to each domain-specific helper.
- Keep path fallback in place.
- Keep structural-addressing as non-runnable provider-shaped code, not a standalone validator.

## 10. Narrow follow-up issue recommendations

### Recommended follow-up 1

**Proposed issue title:** Define an Addressing-owned provider contract for Tree addressed occurrence namespace records.

**Exact ownership boundary:** Addressing owns `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`, addressed snapshot identity, occurrence lineage/depth/containment identity, and provider output rules. Tree remains the consumer and keeps join qualification, fallback policy, contributors, advisor findings, and report behavior.

**Likely affected files/surfaces:**

- `calculogic-validator/structural-addressing/src/structural-addressing-profile.knowledge.mjs`
- `calculogic-validator/structural-addressing/src/structural-addressing-tree-codebase.logic.mjs`
- `calculogic-validator/tree/src/tree-occurrence-snapshot.logic.mjs`
- `calculogic-validator/tree/src/tree-structural-address-snapshot.logic.mjs`
- `calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs`
- targeted tests under `calculogic-validator/structural-addressing/test/` and `calculogic-validator/tree/test/`

**What must remain unchanged:** Tree findings, report envelopes, runner staging, Naming bridge payload shape, canonical identity tuple, path fallback behavior, scope/target selection, and CLI scripts.

**Why sufficient ROI now:** This is the only seam with real semantic ownership pressure: Tree-local snapshots already act as an Addressing-like provider, a structural-addressing provider-shaped subtree already exists, and #618 names Addressing as the target owner for occurrence identity. However, it should be a contract/parity issue first, not broad runtime extraction.

### No suite-core helper follow-up justified now

No implementation issue is justified for suite-core tuple matching, deterministic sorting, namespace validation, or neutral join mechanics. There is only one active consumer, and the current helper is not semantically neutral enough to move safely.

### No fallback-removal follow-up justified by this audit alone

No implementation issue is justified solely to remove path fallback. The fallback is explicit, local, and easy to retire later after provider parity is proven.

## 11. Deferred questions

- What exact algorithm should produce `addressedSnapshotId`, and should it include scope, target, source snapshot, provider profile version, or selected path digest?
- Should the Tree-local occurrence snapshot be replaced by `structural-addressing` provider output or adapted through a compatibility bridge first?
- Should `occurrenceAddress` and `addressPath` converge to one field after compatibility migration?
- Should Addressing remain a shared non-runnable internal package, or should it become a validator slice only after it has independent findings to report?
- What parity tests are required before Tree wiring consumes structural-addressing provider output directly?

## 12. Non-goals

This audit does not:

- implement helper extraction;
- move runtime files;
- alter imports or dependency direction;
- change bridge payloads;
- change the canonical identity tuple;
- remove path fallback;
- change Tree findings;
- expand placement, scatter, cluster, or drift reasoning;
- add automatic Addressing provider wiring;
- promote Addressing to a standalone runnable validator;
- move semantic Addressing rules into suite-core;
- revive known-roots;
- perform unrelated cleanup;
- change CLI or report envelopes.

## 13. Verification record

Verification run for this audit:

- `git diff --check`
- `git diff -- calculogic-validator/doc calculogic-validator/src/core calculogic-validator/naming calculogic-validator/tree calculogic-validator/structural-addressing`
- `npm run validate:naming -- --scope=validator --target calculogic-validator/doc/Audits/address-keyed-join-helper-ownership-and-extraction.audit.md --target calculogic-validator/doc/Indexes/validator-docs.index.md`
- `npm run validate:tree -- --scope=validator --target calculogic-validator/doc`

Runtime source change confirmation: no runtime source files were changed; the only intended repository changes are the audit artifact and the validator docs index entry.
