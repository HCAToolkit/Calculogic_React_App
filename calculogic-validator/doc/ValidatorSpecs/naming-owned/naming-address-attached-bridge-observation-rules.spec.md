# Naming Address-Attached Bridge Observation Rules

- **Classification:** Normative for target Naming bridge rule direction; descriptive where explicitly labeled as current runtime truth.
- **Applies to:** Future Naming-owned semantic observations that may be attached to addressed occurrences for Tree consumption through a versioned bridge.
- **Status:** Contract/specification slice only for issue #623; no runtime behavior is changed by this artifact.
- **Issue context:** Refs #623 and Refs #618.
- **Occurrence identity input:** `calculogic-validator/doc/ValidatorSpecs/cross-cutting/naming-bridge-occurrence-identity-contract.spec.md` from issue #621 / PR #622.

## 1. Purpose and authority boundary

This spec defines the Naming-owned rules for future address-attached bridge observations.

The purpose is to preserve Naming semantic evidence while preventing bridge payloads from becoming Tree placement conclusions, Addressing grammar definitions, or suite-core semantic policy.

Authority posture:

1. Current source files, tests, and `calculogic-validator/doc/ValidatorSpecs/cross-cutting/naming-bridge-occurrence-identity-contract.spec.md` remain the source for **current runtime truth** and the occurrence identity contract input.
2. This artifact defines the **target Naming bridge rule direction** for future implementation slices.
3. Any behavior described as address-attached, address-keyed, versioned bridge transport, or diagnostic emission is **deferred implementation work**, not current runtime truth.

This artifact is intentionally narrow. It defines rules only; it does not implement the bridge, change Naming bridge payloads, add occurrence identity fields, change Tree joins, wire Tree to structural-addressing, change CLI behavior, or change validator report envelopes.

## 2. Current runtime truth

Current runtime truth:

- The Naming semantic-family bridge is path-keyed.
- Naming bridge observations currently use `path` as the compatibility identity/reference field.
- Current bridge observations preserve Naming semantic payload fields: `semanticName`, `familyRoot`, `semanticFamily`, and optional `familySubgroup`, `ambiguityFlags`, and `splitFamilyFlags`.
- Current bridge observations do not carry `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`, `repoRelativePath`, `addressPath`, or `occurrenceType` as Naming bridge payload fields.
- Tree currently consumes Naming evidence through the staged Naming semantic-family bridge and performs Tree-owned interpretation after joining evidence.
- Tree runtime is not currently wired to `calculogic-validator/structural-addressing/**` as the canonical addressed snapshot provider.

## 3. Target Naming bridge rule direction

Target Naming bridge rule direction:

- Naming may emit semantic observations attached to occurrence identity supplied by an addressed occurrence record or staged transport.
- Naming observations should preserve Naming-owned semantic payload fields where practical.
- Naming may echo neutral occurrence identity and compatibility fields only to attach evidence to an occurrence and support traceability during migration.
- Naming must not emit Tree-owned placement, folder, repo-shape, advisory, or severity conclusions.
- Tree may derive Tree-owned conclusions after joining Naming evidence to addressed occurrence records.
- Suite-core may stage or transport bridge payloads, but suite-core must not become the owner of Naming semantics, Addressing semantics, or Tree conclusions.

## 4. Naming-owned semantic payload rules

Future address-attached Naming bridge observations may preserve these Naming-owned semantic fields when they are produced by Naming-owned filename and semantic interpretation:

| Field | Naming rule | Ownership boundary |
| --- | --- | --- |
| `semanticName` | May be preserved as the Naming-owned semantic-name interpretation for the occurrence filename. | Naming-owned semantic observation; not a folder, address, or placement conclusion. |
| `semanticFamily` | May be preserved as the Naming-owned semantic-family interpretation. | Naming-owned semantic observation; Tree may later use it as evidence, but Naming does not decide semantic home. |
| `familyRoot` | May be preserved as the Naming-owned family root signal. | Naming-owned semantic observation; not a root-lane or top-level folder conclusion. |
| `familySubgroup` | May be preserved when Naming derives a bounded subgroup signal. | Naming-owned semantic observation; not a child structural-home conclusion. |
| `ambiguityFlags` | May be preserved when Naming detects bounded semantic/name/family ambiguity. | Naming-owned ambiguity signal; not advisory severity or Tree placement confidence. |
| `splitFamilyFlags` | May be preserved when Naming detects bounded split-family evidence. | Naming-owned split-family signal; not Tree scatter, cluster, or drift conclusion. |
| role parse fields, if later included | May be included only when they represent Naming-owned role-slot or role-like-token parsing from filename semantics. | Naming-owned filename interpretation; not folder-kind, structural-home, or parent/child placement reasoning. |
| disambiguation metadata, if later included | May be included only when it records Naming-owned filename/semantic disambiguation inputs, choices, or bounded uncertainty. | Naming-owned disambiguation evidence; not Tree semantic-home selection. |
| finding/source references, if later included | May be included only as traceability back to Naming findings, Naming report records, or source snapshots. | Traceability metadata; not additional runtime policy authority and not Tree conclusion ownership. |

These fields are Naming-owned semantic observations. They describe what Naming observed about a filename or semantic-name/family pattern. They do not describe where the occurrence belongs in the tree, whether its folder is correct, whether the repo shape is correct, or whether Tree should emit an advisory.

## 5. Address and occurrence attachment rules

Future address-attached Naming bridge observations may attach or echo these fields only as occurrence attachment, compatibility, or traceability context:

| Field | Naming attachment rule | Owner of underlying meaning |
| --- | --- | --- |
| `addressProfileId` | Naming may attach or echo it when supplied by the addressed occurrence namespace or staged transport. | Addressing owns profile semantics and address grammar. |
| `addressedSnapshotId` | Naming may attach or echo it when supplied by the addressed snapshot namespace or staged transport. | Addressing or the addressed snapshot producer owns snapshot semantics. |
| `occurrenceAddress` | Naming may attach or echo it as the neutral occurrence identity inside the supplied profile/snapshot namespace. | Addressing owns address meaning and grammar. |
| `repoRelativePath` | Naming may attach or echo it for diagnostics, compatibility fallback, and human traceability. | Originating collector/addressed occurrence transport supplies the path; Naming does not turn it into placement truth. |
| temporary compatibility path | Naming may continue preserving the current path-keyed compatibility field during migration. | Compatibility transport; temporary and removable later through explicit migration. |
| temporary compatibility/debug `addressPath` | Naming may echo it only as a temporary debug or compatibility alias when supplied by the occurrence/address transport. | Addressing or Tree-local occurrence transport owns the alias semantics. |
| `occurrenceType`, when supplied by the addressed occurrence record or staged transport | Naming may echo it as bounded occurrence context such as file/folder where available. | The addressed occurrence record or staged transport supplies it; Naming does not infer structural placement from it. |

Naming references these fields to attach semantic observations to an occurrence. Naming does not own:

- address grammar;
- addressed snapshot semantics;
- lineage;
- structural placement;
- parent/child address interpretation;
- depth or root-lane meaning;
- structural-addressing provider selection.

The minimum target occurrence identity remains the issue #621 tuple:

```text
addressProfileId + addressedSnapshotId + occurrenceAddress
```

Naming may carry that tuple, but Naming does not define its grammar or prove its structural correctness.

## 6. Neutral context use rules

### 6.1 Allowed neutral attachment and traceability context

Naming may use neutral context to attach observations and make bridge records traceable:

- occurrence identity tuple values supplied by the addressed occurrence namespace;
- `repoRelativePath` or current `path` for diagnostics and human-readable traceability;
- temporary compatibility/debug aliases supplied by staged transport;
- finding/source references back to Naming-owned findings, reports, or bridge source records if later included.

This use is neutral because it explains which occurrence received Naming evidence. It does not decide structural home, semantic home, folder kind, repo shape, or placement validity.

### 6.2 Allowed compatibility fallback context

During migration, Naming bridge payloads may preserve path-only compatibility context so existing Tree consumption can remain explicit and test-covered.

Compatibility context must be treated as temporary and removable later. It must not be promoted into durable semantic identity when address-backed identity is available and compatible.

### 6.3 Allowed bounded disambiguation context

Future Naming use of folder, path, address, or occurrence context for disambiguation is allowed only when all of these conditions are met:

1. The use is explicitly documented in a Naming-owned spec or contract before implementation.
2. The decision remains a Naming-owned filename, role-slot, semantic-name, or semantic-family interpretation.
3. The context is used as bounded disambiguation evidence, not as a Tree placement conclusion.
4. The emitted field names and diagnostics make the Naming-owned nature of the interpretation clear.
5. Tests cover that Naming does not emit Tree-owned conclusions from that context.

Allowed bounded disambiguation examples include distinguishing role-like tokens in filenames or preserving ambiguity metadata about semantic-name/family interpretation. Forbidden uses include deciding that a file is in the wrong folder, belongs under an expected top-level folder, or has drifted from a structural/semantic home.

### 6.4 Forbidden structural reasoning context

Naming must not use folder, path, address, parent, depth, root-lane, sibling, cluster, or repo-shape context to emit Tree-owned reasoning.

Naming bridge observations must not convert attachment context into placement evidence, folder classifications, structural-home conclusions, semantic-home conclusions, repo-shape conclusions, scatter/cluster/drift conclusions, or advisory verdicts.

## 7. Forbidden Tree-owned conclusions

Naming bridge observations must not emit these Tree-owned fields or concepts:

- structural-home conclusions;
- semantic-home conclusions;
- folder-kind conclusions;
- repo-shape conclusions;
- placement conclusions;
- scatter conclusions;
- cluster conclusions;
- drift conclusions;
- advisory verdicts;
- advisory severity;
- expected top-level folder conclusions;
- allowed top-level folder conclusions;
- parent structural-home conclusions;
- child structural-home conclusions;
- root-lane placement conclusions;
- whole-placement confidence;
- structural-home evidence scoring;
- semantic-home evidence scoring;
- structural/semantic placement alignment verdicts.

Tree may derive Tree-owned conclusions after joining Naming evidence to addressed occurrence records. Naming may provide semantic evidence and occurrence attachment only.

## 8. Missing or unmatched occurrence identity rule

Future implementation slices must not hide missing occurrence identity.

When Naming semantic evidence exists but occurrence identity cannot be attached:

1. The evidence may remain in the current path-only compatibility output when that output is still part of the migration contract.
2. The observation must be omitted from any address-keyed bridge lane that requires `addressProfileId`, `addressedSnapshotId`, and `occurrenceAddress`.
3. The missing identity should produce an explicit diagnostic or bridge metadata record when a versioned address-attached bridge is expected to be produced.
4. Tree fallback may be staged only as an explicit compatibility fallback, and the fallback must not hide that address identity was missing or unmatched.
5. Naming must not synthesize `occurrenceAddress`, infer snapshot identity, or derive address grammar to force attachment.

This section defines the rule only. It does not implement diagnostics, path-only emission behavior, bridge filtering, Tree fallback, or address-keyed payloads in this slice.

## 9. Versioning and migration expectations

Migration expectations:

- The current path-keyed Naming bridge shape is **current runtime truth**.
- The address-attached Naming bridge shape is **future implementation work**.
- The first implementation should be additive where practical: preserve current semantic payload fields and temporary path compatibility while adding occurrence identity fields only when supplied by an addressed occurrence namespace or staged transport.
- Compatibility path fields should remain temporary and removable later through an explicit, test-covered migration.
- Temporary compatibility/debug `addressPath` should remain clearly marked as an alias or debug field if it is included.
- Tree fallback should remain explicit and test-covered.
- Versioned bridge payloads should make producer/source identity and compatibility behavior inspectable without making suite-core the owner of Naming semantics.

Versioning must distinguish path-keyed current runtime truth from address-attached target architecture. A version increment or new bridge lane must not silently change Tree join semantics without focused tests.

## 10. Relationship to the issue #621 occurrence identity contract

This spec is a Naming-owned child contract of the issue #621 / PR #622 occurrence identity contract.

Relationship points:

- **Bridge envelope:** Naming rules assume the future versioned bridge envelope described by the issue #621 contract. Naming may contribute semantic observations inside that envelope, while suite-core may stage and transport the envelope without owning semantics.
- **Observation identity fields:** Naming may attach or echo `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`, `repoRelativePath`, temporary `path`, temporary/debug `addressPath`, and supplied `occurrenceType` under the attachment rules in this spec.
- **Ownership matrix:** Naming owns semantic-name, semantic-family, family root, subgroup, role parse, ambiguity, and disambiguation observations. Addressing owns address/profile/snapshot grammar and semantics. Tree owns placement, folder, repo-shape, semantic-home, structural-home, and advisory conclusions. Suite-core owns neutral orchestration and transport mechanics only.
- **Fallback/migration rule:** Naming must preserve path fallback only as explicit temporary compatibility. Missing or unmatched address identity must stay visible and must not be hidden by fallback behavior.
- **Fields not allowed on Naming observations:** Naming observations must not include parent/child structural-home fields, root-lane placement fields, expected/allowed top-level folder conclusions, folder-kind conclusions, placement verdicts, scatter/cluster/drift conclusions, or advisory severity/verdict fields.

If this Naming-owned spec conflicts with the cross-cutting occurrence identity contract, stop and resolve the contract conflict before implementing bridge payload changes.

## 11. Non-goals

This spec does not:

- change runtime behavior;
- change Naming bridge payloads;
- add occurrence identity fields;
- change Tree joins;
- change Tree reasoning;
- wire Tree runtime to the structural-addressing provider;
- move Addressing semantics into Naming;
- move Naming semantics into suite-core;
- move Tree conclusions into Naming;
- remove path fallback;
- remove known-roots or revive known-roots;
- rework validator report envelopes;
- change CLI behavior;
- fix unrelated validator findings;
- perform broad docs cleanup outside this contract slice.

## 12. Recommended next child issue

Recommended next child issue: define and test a data-only versioned Naming bridge payload shape that additively preserves the current path-keyed semantic payload while attaching `addressProfileId`, `addressedSnapshotId`, `occurrenceAddress`, `repoRelativePath`, temporary compatibility path fields, temporary/debug `addressPath`, and supplied `occurrenceType` when an addressed occurrence namespace is available.

That child should include focused tests for shape validation, missing/unmatched occurrence diagnostics, explicit Tree fallback behavior, and proof that Naming observations still omit Tree-owned placement, folder, repo-shape, scatter/cluster/drift, advisory, parent/child, and root-lane conclusions.
