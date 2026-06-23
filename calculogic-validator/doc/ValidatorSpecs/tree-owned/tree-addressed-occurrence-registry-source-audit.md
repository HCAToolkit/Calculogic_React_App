# Tree Addressed-Occurrence Registry Source Audit

Status/Authority:
- **Status:** Audit.
- **Authority level:** Supporting implementation guidance for a future narrow Tree occurrence adapter or resolver.
- **Runtime authority:** The current runtime truth remains `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md` plus the suite contract.
- **Scope:** Documents verified Tree built-in registry surfaces and registry-backed runtime helpers as of issue #668. It does not change runtime behavior.

References:
- Refs #668
- Refs #662
- Follows #663 / PR #664
- Supersedes #665 / PR #666
- Builds on #660, #657, #655, #651
- Follows #647

## 1. Purpose and correction

The next Tree reasoning layer for addressed occurrences must consume registered Tree interpretation. It must not derive a second structural vocabulary from contributor-local path parsing.

The corrected flow is:

```text
addressed occurrence
→ existing Tree built-in registries
→ existing registry-backed Tree runtime interpretation
→ registered structural truth
→ future narrow adapter or reasoning step
```

The unsafe flow is:

```text
address path
→ contributor-local assumptions
→ newly invented structural vocabulary
```

The abandoned #665 / PR #666 direction was useful because it exposed the architectural risk before merge: Tree structural context would have moved toward contributor-local path-segment checks such as `tree`, `registries`, `_builtin`, or "next segment after `src`" instead of consuming the registered model. That is an architecture correction, not a trivial coding mistake.

This audit establishes the current implementation reality for Tree's registered structural surfaces, the helpers that consume them, and the exact seams available for a future addressed-occurrence interpretation layer. It intentionally does not add `treeStructuralContext`, alter `semanticHomeEvidence`, add path-segment classifiers, add Tree findings, or change Addressing/Naming contracts.

## 2. Registry inventory table

| Registry or helper | Location | Structural concept owned | Authoritative vocabulary / policy | Current runtime consumer | Current status | Suitability for addressed occurrence interpretation |
|---|---|---|---|---|---|---|
| Structural homes built-in registry | `calculogic-validator/tree/src/registries/_builtin/structural-homes.registry.json` | Tree-owned structural-home vocabulary for recognized repository/top-level homes. | `app`, `assets`, `bin`, `calculogic-doc-engine`, `calculogic-validator`, `compat`, `config`, `data`, `doc`, `docs`, `examples`, `experimental`, `generated`, `ops`, `public`, `scripts`, `src`, `test`, `tests`, `tools`, `vendor`, with status and definition fields. | Loaded by `getBuiltinStructuralHomesRegistry`; passed by tree wiring into `prepareTreeStructuralHomeEvidence`; consumed downstream by folder-kind evidence and occurrence-classification replacement runtime. | Already represented and actively consumed, but current evidence only resolves direct repo-top folder matches. | Registry-backed but needs a narrow adapter for occurrence-local structural-root/ancestor use below repo top. |
| Structural homes loader/accessor | `calculogic-validator/tree/src/registries/tree-structural-homes-registry.logic.mjs` | Deterministic loading and shape validation for structural-home registry payloads. | Requires object payload with `structuralHomes[]`; caches builtin payload. | `tree-structure-advisor.wiring.mjs`. | Already represented and actively consumed. | Reusable loader for a future narrow Tree occurrence adapter. |
| Structural-home evidence helper | `calculogic-validator/tree/src/tree-structural-home-evidence.logic.mjs` | Registry-backed evidence linking addressed folder occurrences to structural-home metadata. | Uses only direct repo-top token matches against `structuralHomes[]`; emits `structuralHome`, source, evidence strength, status, and definition. | `tree-structure-advisor.wiring.mjs`; output consumed by folder-kind evidence, occurrence-classification replacement runtime, parity evidence, and readiness/shadow helpers. | Already represented and actively consumed. | Directly reusable for repo-top structural-root context; too narrow by itself for container-local homes or nested addressed-occurrence descriptors. |
| Folder kinds built-in registry | `calculogic-validator/tree/src/registries/_builtin/folder-kinds.registry.json` | Tree-owned folder-kind vocabulary. | `structural`, `semantic`, `unspecified`. | Loaded by `getBuiltinFolderKindsRegistry`; passed by wiring into `prepareTreeFolderKindEvidence`. | Already represented and actively consumed. | Registry-backed and reusable as a coarse `surfaceKind`/folder-kind source, but requires an adapter to avoid exposing raw evidence shape as a new context contract. |
| Folder kinds loader/accessor | `calculogic-validator/tree/src/registries/tree-folder-kinds-registry.logic.mjs` | Deterministic loading and shape validation for folder-kind registry payloads. | Requires object payload with `folderKinds[]`; caches builtin payload. | `tree-structure-advisor.wiring.mjs`. | Already represented and actively consumed. | Reusable loader for adapter work. |
| Folder-kind evidence helper | `calculogic-validator/tree/src/tree-folder-kind-evidence.logic.mjs` | Registry-backed folder-kind interpretation from structural-home and semantic-home evidence. | Emits `structural` when structural-home evidence exists; `semantic` when semantic-home evidence exists; otherwise `unspecified`, limited to registered folder kinds. | `tree-structure-advisor.wiring.mjs`; output consumed by occurrence-classification replacement runtime and parity evidence. | Already represented and actively consumed, but it has no independent Tree-owned semantic repository-top-home source for `calculogic-validator` or `calculogic-doc-engine`. | Reusable for addressed occurrences as an interpreted Tree evidence layer; adapter should preserve its evidence-only status and must receive semantic repo-top evidence before structural entries are retired. |
| Repo-shape policy built-in registry | `calculogic-validator/tree/src/registries/_builtin/repo-shape-policy.registry.json` | Tree-owned allowed top-level directory policy for unexpected top-level folder behavior. | Allowed repo-top names: `bin`, `calculogic-doc-engine`, `calculogic-validator`, `doc`, `docs`, `public`, `scripts`, `src`, `test`, `tools`. | Loaded by `getBuiltinTreeRepoShapePolicy`; consumed directly by core Tree runtime fallback and by occurrence-classification replacement runtime. | Already represented and actively consumed, but allowance is not equivalent to successful structural-or-semantic occurrence classification. | Reusable for repo-top allowed-root context only; insufficient by itself to preserve replacement-route behavior for unclassified repo-top folders. |
| Repo-shape policy loader/accessor | `calculogic-validator/tree/src/registries/tree-repo-shape-policy-registry.logic.mjs` | Deterministic loading and shape validation for repo-shape policy. | Requires `allowedTopLevelDirectories[]`; exposes builtin payload. | `tree-structure-advisor.logic.mjs` and `tree-structure-advisor.wiring.mjs`. | Already represented and actively consumed. | Reusable for adapter work that needs allowed top-level root policy. |
| Occurrence-classification replacement runtime | `calculogic-validator/tree/src/tree-occurrence-classification.logic.mjs` | Registry-backed runtime interpretation of repo-top occurrence classification from prepared Tree evidence plus repo-shape policy. | Emits current replacement metadata such as `structuralClass`, `structuralKind`, `isRepoTopOccurrence`, `isRepoShapeAllowedTopLevelDirectory`, `isStructuralRoot`, `isSemanticRoot`, and subtree partition candidate flags. | Prepared by wiring; used by Tree runtime only behind readiness/execution gates for unexpected top-level folder route, with fallback retained. | Represented indirectly through registry-backed helpers and actively prepared; observable behavior only uses it when execution gates are ready. Unclassified repo-top records carry `isRepoShapeAllowedTopLevelDirectory: false` even when their names are listed in repo-shape policy. | Strong candidate seam for a future narrow occurrence adapter, but adapter must avoid broad new structural-context output and must not conflate repo-shape allowance with classification success. |
| Semantic-home policy built-in registry | `calculogic-validator/tree/src/registries/_builtin/semantic-home-policy.registry.json` | Tree-owned policy lanes for semantic-home evidence inputs and guardrails. | Lanes include `folder-context`, `parent-lineage`, `naming-bridge`, `structural-home-boundary`, `structural-signal-boundary`, and `repo-top-structural-boundary`. | No runtime loader/accessor found in `tree/src`; `prepareTreeSemanticHomeEvidence` does not consume this registry. | Represented but unused/stale relative to current runtime; not an active semantic repository-top-home source. | Could inform future semantic-home interpretation only after a separately scoped loader/consumer issue; not directly reusable today for `calculogic-validator` or `calculogic-doc-engine`. |
| Semantic-home evidence helper | `calculogic-validator/tree/src/tree-semantic-home-evidence.logic.mjs` | Bounded Tree evidence join from addressed occurrences to Naming-prepared semantic evidence. | Uses Naming-owned `semanticName`, `semanticFamily`, `familyRoot`, and optional `familySubgroup` by path/type match; emits `semanticHome` as evidence. | `tree-structure-advisor.wiring.mjs`; output consumed by folder-kind evidence, occurrence-classification replacement runtime, and parity evidence. | Represented indirectly through a helper, but not registry-backed today and not automatically equivalent to Tree-owned semantic repository-top-home classification. | Useful as supporting evidence only; semantic family/name fields remain Naming-owned and should not become Tree fields. A separate Tree-owned semantic repo-top source is still missing. |
| Structural-home signal policy built-in registry | `calculogic-validator/tree/src/registries/_builtin/structural-home-signal-policy.registry.json` | Evidence-token policy for structural-home signal strength. | Strong/contextual/weak/anti-pattern token vocabulary for structural-home evidence. | No runtime loader/accessor found in `tree/src`. | Represented but unused/stale relative to current runtime. | Not directly reusable until a future issue adds a narrow registry-backed resolver or retires/consolidates the surface. |
| Surface-to-structural-home perspective registry | `calculogic-validator/tree/src/registries/_builtin/surface-structural-home-perspective.registry.json` | Intended mapping from surface vocabulary to structural-home perspective. | Surfaces include `runtime`, `ui-facing`, `quality`, `docs`, `tooling`, `config`, `data`, `ops`, `assets`, `generated`, `vendor`, `examples`, and `experimental`, each mapped to structural homes with relationship status and signal strength. | No runtime loader/accessor found in `tree/src`. | Represented but unused/stale relative to current runtime. | Likely the exact existing registry to touch for future `surfaceKind`/ownership-lane adapter work, but not current runtime truth. |
| Validator-owned signals built-in registry | `calculogic-validator/tree/src/registries/_builtin/validator-owned-signals.registry.json` | Tree signal policy for validator-owned-looking basenames and validator CLI/quality surfaces. | Regex matchers classified as `validator-module-surface`, `validator-cli-entrypoint`, or `validator-quality-surface`. | Loaded by `getBuiltinTreeSignalPolicy`; consumed by `tree-structure-advisor.logic.mjs` and shim detection. | Already represented and actively consumed. | Reusable for validator-owned surface evidence, but not as a structural-root vocabulary. |
| Shim-detection signals built-in registry | `calculogic-validator/tree/src/registries/_builtin/shim-detection-signals.registry.json` | Tree shim/compat signal, suppression, and relevant-extension policy. | Folder/name/surface shim signals; non-runtime weak-signal suppression surfaces; detector implementation tokens; relevant extensions. | Loaded by `getBuiltinTreeSignalPolicy`; consumed by `tree-shim-detection.logic.mjs`. | Already represented and actively consumed. | Reusable for shim/content-backed surface evidence only; not a general addressed-occurrence structural interpreter. |
| Tree signal policy loader/accessor | `calculogic-validator/tree/src/registries/tree-signal-policy-registry.logic.mjs` | Combined loading/normalization of validator-owned and shim-detection signal registries. | Compiles regex matchers, lowercases string lists, and exposes Sets for shim signal/suppression vocabularies. | `tree-structure-advisor.logic.mjs` and `tree-shim-detection.logic.mjs`. | Already represented and actively consumed. | Reusable only for its narrow signal-policy scopes. |
| Shim detection helper | `calculogic-validator/tree/src/tree-shim-detection.logic.mjs` | Runtime shim evidence and findings from registry-backed shim/validator signals plus content-backed thin-reexport checks. | Registry-backed shim signal Sets, non-runtime suppression surfaces, relevant extensions; helper-local artifact surface inference; content-backed pass-through detection. | Attached by `tree-shim-diagnostics-contributor.wiring.mjs`; observable findings include shim surface/debt advisories. | Actively consumed; contains both registry-backed policy and helper-local policy. | Not suitable as a general structural-context source; a future adapter must separate registry-backed shim signals from helper-local artifact surface inference. |
| Naming semantic-family bridge contributor | `calculogic-validator/tree/src/contributors/tree-naming-semantic-family-bridge-contributor.logic.mjs` | Contributor-local placement/coherence interpretation from Naming semantic-family bridge observations. | Helper-local constants for structural root surfaces, semantic root folders, allowed root pairings, shared-root lanes, local placement coherence, and broader spread interpretation. | Attached by contributor assembly when Naming bridge input is present. | Actively consumed but not registry-backed for these structural constants. | Primary unsafe overlap: should not be extended for addressed-occurrence structural vocabulary; future work should route through registered Tree interpretation instead. |

## 3. Registry-to-runtime-consumer map

### 3.1 Structural homes

```text
structural-homes.registry.json
→ getBuiltinStructuralHomesRegistry()
→ prepareTreeStructureAdvisorInputs()
→ prepareTreeStructuralHomeEvidence(addressedOccurrenceRecords, structuralHomesRegistry)
→ prepareTreeFolderKindEvidence(... treeStructuralHomeEvidence ...)
→ prepareTreeOccurrenceClassificationReplacementRuntime(... treeStructuralHomeEvidence, treeFolderKindEvidence ...)
→ Tree unexpected-top-level behavior only when replacement runtime/readiness/execution gates allow it; otherwise fallback policy remains active
```

Current runtime truth: structural homes are consumed for direct repo-top folder evidence. They do not currently provide nested container-local homes, ownership lanes, registry tiers, or placement conclusions.

### 3.2 Folder kinds

```text
folder-kinds.registry.json
→ getBuiltinFolderKindsRegistry()
→ prepareTreeStructureAdvisorInputs()
→ prepareTreeFolderKindEvidence(addressedOccurrenceRecords, structural-home evidence, semantic-home evidence, folderKindsRegistry)
→ prepareTreeOccurrenceClassificationReplacementRuntime(... treeFolderKindEvidence ...)
→ parity/readiness/shadow helpers and gated unexpected-top-level route
```

Current runtime truth: folder kinds are coarse evidence categories derived from already-prepared structural-home and semantic-home evidence. They are not a path classifier and should not be expanded by contributor-local literals.

### 3.3 Repo-shape policy

```text
repo-shape-policy.registry.json
→ getBuiltinTreeRepoShapePolicy()
→ tree-structure-advisor.logic.mjs fallback runtime for unexpected top-level folders
```

and:

```text
repo-shape-policy.registry.json
→ getBuiltinTreeRepoShapePolicy()
→ prepareTreeStructureAdvisorInputs()
→ prepareTreeOccurrenceClassificationReplacementRuntime(... treeRepoShapePolicy ...)
→ gated replacement route for unexpected top-level folder selection
```

Current runtime truth: repo-shape policy owns allowed top-level directory behavior for `TREE_UNEXPECTED_TOP_LEVEL_FOLDER`; it does not authorize all structural-home usage and does not make surface equivalent to structural home.

### 3.4 Validator-owned and shim signals

```text
validator-owned-signals.registry.json
shim-detection-signals.registry.json
→ getBuiltinTreeSignalPolicy()
→ tree-structure-advisor.logic.mjs validator-owned-looking file advisory
→ tree-shim-detection.logic.mjs shim evidence and shim findings
→ tree-shim-diagnostics-contributor.wiring.mjs attaches the shim contributor
```

Current runtime truth: these registries are actively consumed for validator-owned basename signals and shim/compat detection. They are signal-policy registries, not Tree structural-root or addressed-occurrence context registries.

### 3.5 Semantic-home policy registry

```text
semantic-home-policy.registry.json
→ no runtime loader/accessor found
→ no current Tree runtime consumer found
```

Current implementation reality: `tree-semantic-home-evidence.logic.mjs` joins addressed occurrences to Naming-prepared semantic evidence directly; it does not consume `semantic-home-policy.registry.json`.

### 3.6 Structural-home signal policy registry

```text
structural-home-signal-policy.registry.json
→ no runtime loader/accessor found
→ no current Tree runtime consumer found
```

Current implementation reality: this is registered policy vocabulary without a runtime-backed resolver today.

### 3.7 Surface-to-structural-home perspective registry

```text
surface-structural-home-perspective.registry.json
→ no runtime loader/accessor found
→ no current Tree runtime consumer found
```

Current implementation reality: this is the closest registered surface-to-home perspective, but it is not current runtime truth until a loader/resolver consumes it.

### 3.8 Helper-local policy that is not registry-backed

`tree-naming-semantic-family-bridge-contributor.logic.mjs` currently contains helper-local structural root surfaces, semantic root folders, root pairings, shared-root lanes, and placement/coherence interpretation constants. It is observable through contributor findings, but those literals are not built-in registry truth. Extending that contributor to parse addressed paths would duplicate Tree policy and repeat the abandoned #665 / PR #666 architectural problem.

`tree-shim-detection.logic.mjs` also contains helper-local artifact surface inference (`quality`, `docs`, `examples`, `fixtures`, `runtimeish`) while consuming registry-backed shim signal policy. For future addressed-occurrence work, those helper-local surface labels must not be mistaken for registered Tree surface truth.

## 4. Ownership map

| Category | Current owner | Boundary reason |
|---|---|---|
| canonical occurrence identity | Addressing | Addressing owns occurrence identity/address keys and snapshots; Tree consumes addressed occurrence records as input evidence. |
| profile / snapshot | Addressing / suite-core | Suite-core collects scoped snapshot inputs; Addressing-shaped snapshots provide occurrence records. Tree prepares Tree-specific projections but must not redefine identity. |
| path / resolved path | Addressing / suite-core | Paths are input evidence and scope material; raw paths are not structural truth by themselves. |
| lineage | Addressing | Parent/ancestor relationships come from addressed occurrence records; Tree may consume lineage but should not invent it from path parsing. |
| parent | Addressing | Parent identity is occurrence metadata, not Tree policy. |
| depth | Addressing | Depth/order are occurrence/address properties. |
| order | Addressing | Stable occurrence ordering belongs with snapshot/address preparation. |
| semantic family | Naming | Naming owns semantic-family interpretation; Tree consumes bounded bridge evidence only. |
| role | Naming | Filename role/category/status interpretation belongs to Naming and the master naming convention. |
| ambiguity | Naming / shared unresolved | Naming owns name/semantic ambiguity; Tree may record placement evidence ambiguity only in Tree-owned scopes. |
| disambiguation | Naming / shared unresolved | Naming disambiguates semantic/name role signals; Tree should not create parallel semantic disambiguation. |
| evidence-limit notes | Tree / suite-core | Tree can state limits of Tree-owned evidence; suite-core owns shared report envelope and runner-level metadata. |
| structural root | Tree | Structural-home and repo-top structural-root interpretation is Tree-owned when sourced from Tree registries/helpers. |
| slice or lane ownership | Tree / suite-core | Tree can own structural lane interpretation only when registry-backed; suite-core owns validator slice boundaries and shared helper areas. |
| surface type | Tree / shared unresolved | Tree has shim helper-local artifact surfaces and an unused surface perspective registry; registered general surface type is not current runtime truth. |
| container-local home | Tree | This is a Tree structural interpretation concept, but it is not currently registry-backed for addressed occurrences. |
| registry tier | Tree / suite-core | Tree owns Tree built-in registry payload tiers; suite-core owns shared registry model/customization conventions. |
| placement/coherence conclusion | Tree | Current contributor emits some placement/coherence advisories, but future addressed-occurrence context must not add new conclusions in this issue. |
| bridge-permission conclusion | suite-core / shared unresolved | Permission/allowance contracts cross slices; Tree should not infer bridge permission from path segments. |

## 5. Intended future occurrence-context fields

| Field | Conclusion | Reason |
|---|---|---|
| `structuralRootKind` | registry-backed but needs a narrow adapter | Structural-home evidence, folder-kind evidence, repo-shape policy, and occurrence-classification replacement metadata already exist for repo-top roots, but no stable occurrence-context adapter exposes exactly this field. |
| `ownershipLane` | not currently represented; future registry addition needed | Existing surface perspective and contributor lane constants do not provide an active registry-backed lane model for addressed occurrences. |
| `surfaceKind` | registry-backed but needs a narrow adapter | `surface-structural-home-perspective.registry.json` represents surface vocabulary, but it has no loader/consumer; shim artifact surfaces are helper-local and should not be treated as registered truth. |
| `ancestor / lineage descriptor` | not a Tree field; another owner already owns it | Addressing owns lineage, parent, depth, and occurrence identity. Tree may consume lineage as evidence, not own the descriptor. |
| `direct-parent descriptor` | not a Tree field; another owner already owns it | Addressing owns parent occurrence identity; Tree can attach Tree interpretation to a parent only through an adapter. |
| `containerLocalHome` | not currently represented; future registry addition needed | No current built-in registry defines container-local structural homes below repo top; contributor-local derivation is not an acceptable substitute. |
| `registryTier` | not currently represented; future registry addition needed | Runtime loaders distinguish builtin paths in code, but no Tree registry vocabulary models registry tiers for occurrence interpretation. |

## 6. Gap and overlap findings

1. **Structural homes are registered and consumed, but only at repo-top depth.** `prepareTreeStructuralHomeEvidence` matches direct repo-top folder occurrence paths to `structuralHomes[]`. This is safe and registry-backed, but too narrow for nested addressed-occurrence context.

2. **Folder kinds are registry-backed but derived.** `prepareTreeFolderKindEvidence` consumes registered folder-kind vocabulary, but the classification depends on existing structural-home and semantic-home evidence. It should remain an evidence layer, not become an independent path classifier.

3. **Repo-shape policy is actively consumed and narrower than structural-home vocabulary.** `repo-shape-policy.registry.json` is the current allowed top-level directory policy. It intentionally differs from the broader structural-home registry, so future code must not assume every structural home is allowed at repo top.

4. **Surface-to-structural-home perspective exists but is not runtime-consumed.** This registry is promising for future `surfaceKind` or lane work, but it is not current runtime truth until a loader/resolver consumes it.

5. **Semantic-home policy and structural-home signal policy exist but are unused by runtime.** These surfaces should be treated as represented-but-unused, not as active interpretation sources.

6. **Tree has no verified active source that classifies `calculogic-validator` and `calculogic-doc-engine` as semantic repository-top homes in the downstream occurrence-classification path.** The existing Naming-backed semantic-home evidence path is related evidence, but it is not automatically equivalent to Tree-owned semantic repository-top-home classification.

7. **The Naming semantic-family bridge contributor contains non-registry structural literals.** Its structural root surfaces, semantic root folders, allowed root pairings, shared-root lanes, and local placement routines are helper-local policy. Reusing those literals for addressed-occurrence context would duplicate policy instead of consuming Tree registries.

8. **Shim detection mixes registry-backed signals with helper-local artifact surface inference.** Shim registries are safe for shim/compat signal interpretation, while helper-local artifact surfaces are not a general Tree surface taxonomy.

9. **Container-local structural homes, registry tiers, and ownership lanes are absent as active registry-backed occurrence concepts.** They require future bounded registry or resolver work before runtime output can consume them.

10. **Contributor-local literals are unsafe because they bypass registry change control.** A literal such as `src`, `tree`, `registries`, `_builtin`, or "next segment after `src`" can be path evidence, but it is not structural truth unless a Tree registry or registry-backed helper interprets it. Literal parsing would create drift between current runtime truth, registered policy, and future extraction paths.

## 7. Repository-Top Home Partition and Downstream Classification

This section audits the repository-top-only partition requested by #668 update. The partition applies only to actual repository-top folder occurrences. Descendants such as `calculogic-validator/tree` and `calculogic-validator/tree/src` are not repository-top homes and must not be classified by reusing the repository-top-home rule.

### 7.1 Current behavior answers

1. **How does Tree currently identify a repository-top folder?**
   - `prepareTreeOccurrenceSnapshot` and `prepareTreeStructuralAddressSnapshot` preserve occurrence records with `resolvedPath`/`path`, depth, lineage, and occurrence type. The replacement classification runtime treats an occurrence as repo-top when its `resolvedPath` is a non-empty string with no `/` segment separator. It also requires `occurrenceType === 'folder'` before applying repo-top structural/semantic root classification.
2. **How does the structural-homes registry currently affect that folder?**
   - `prepareTreeStructuralHomeEvidence` builds a lookup from `structuralHomes[]` and emits structural-home evidence only when a folder occurrence path is itself a single repo-top token matching that registry. Therefore `src`, `doc`, `scripts`, `calculogic-validator`, and `calculogic-doc-engine` all currently produce structural-home evidence when present as repo-top folder occurrence paths because all five are in `structural-homes.registry.json` today.
3. **How does current semantic-home evidence classify repository-top folders, if at all?**
   - `prepareTreeSemanticHomeEvidence` does not have a Tree-owned semantic repository-top-home registry. It only joins addressed occurrence records to Naming-prepared semantic evidence by path/type. A repo-top folder can become semantic in the replacement runtime only if semantic-home evidence is supplied for that same occurrence and folder-kind evidence resolves to `semantic` or semantic-home lookup succeeds. There is no current default rule that turns every non-structural allowed repo-top folder into a semantic repo-top home.
4. **What happens today when a repository-top folder matches neither structural nor semantic classification?**
   - `prepareTreeFolderKindEvidence` emits `unspecified` when neither structural-home nor semantic-home evidence exists and the folder-kind registry supports `unspecified`. The replacement classification runtime then returns `structuralClass: unclassified`, `structuralKind: unknown`, `isRepoShapeAllowedTopLevelDirectory: false`, `isStructuralRoot: false`, and `isSemanticRoot: false` for that repo-top occurrence. Separately, fallback unexpected-top-level collection uses `repo-shape-policy.registry.json`, but the prepared replacement route filters classified repo-top records by both repo-shape policy membership and `classification.isRepoShapeAllowedTopLevelDirectory`. Therefore repo-shape membership alone is not sufficient to preserve replacement-route suppression when classification remains unknown.
5. **Are `calculogic-validator` and `calculogic-doc-engine` currently producing incorrect structural-home evidence?**
   - Yes, under the intended repository-top partition in this update. Current runtime truth treats both as structural because they are present in `structural-homes.registry.json` and `prepareTreeStructuralHomeEvidence` consumes that registry directly for repo-top matches. The corrected target architecture is that they are allowed semantic repository-top homes, not structural repository-top homes.
6. **What downstream consumers use structural-home evidence?**
   - `prepareTreeFolderKindEvidence` consumes it to derive `folderKind: structural`; `prepareTreeOccurrenceClassificationReplacementRuntime` consumes structural-home and folder-kind evidence to derive repo-top structural-root metadata; parity, shadow, readiness, recommendation, evaluation-plan, and execution-contract helpers consume the prepared replacement evidence; the Tree runtime can use the replacement route for unexpected top-level folder selection only when readiness/execution gates are satisfied.
7. **Would removing the two entries cause them to become semantic correctly, become unspecified, disappear from classification, or change finding behavior?**
   - Removing only `calculogic-validator` and `calculogic-doc-engine` from `structural-homes.registry.json` would stop structural-home evidence for those repo-top folders. It would not make them semantic by itself because no Tree-owned semantic repo-top-home registry/resolver currently supplies semantic-home evidence for them. They would most likely become `unspecified`/`unclassified` in occurrence classification unless Naming-prepared semantic evidence happened to be supplied for those exact folder occurrences. Because `repo-shape-policy.registry.json` still allows both names, fallback behavior has the allow-list information. However, under the prepared replacement route, unclassified repo-top records carry `isRepoShapeAllowedTopLevelDirectory: false`; those folders may therefore become reportable despite remaining listed in repo-shape policy. Removal must be deferred until semantic repo-top classification is available and wired into the same downstream path.
8. **How do folder-kind evidence and occurrence-classification replacement handle structural, semantic, and unspecified repo-top homes?**
   - Structural repo-top homes: structural-home evidence wins first in `prepareTreeFolderKindEvidence`, producing `folderKind: structural`; replacement classification emits `repo-top-structural-root`, `top-root-structural`, `isRepoShapeAllowedTopLevelDirectory: true`, and `isStructuralRoot: true`.
   - Semantic repo-top homes: semantic-home evidence can produce `folderKind: semantic` only when structural-home evidence is absent for the same path; replacement classification emits `repo-top-semantic-root`, `semantic-root`, `isRepoShapeAllowedTopLevelDirectory: true`, and `isSemanticRoot: true`.
   - Unspecified repo-top homes: folder-kind evidence emits `unspecified` when no stronger evidence exists; replacement classification currently returns `unclassified`/`unknown` with repo-shape allowed flag false in the classification payload, while fallback unexpected-folder behavior remains governed by repo-shape policy and prepared replacement behavior may treat the unclassified record as not allowed.
9. **Are lower-level folders safely distinguished from repo-top homes?**
   - Yes in the audited helpers. `prepareTreeStructuralHomeEvidence` only accepts paths without `/`, and replacement classification only applies repo-top root classification when `resolvedPath` has no `/`. Current tests assert that `calculogic-validator/tree` is a scoped root but not a repo-top occurrence and remains `unclassified`; tests also cover `calculogic-validator/tree/src` as a descendant occurrence in snapshots.
10. **Does any current logic accidentally classify descendants as repository-top homes, structural homes, semantic homes, or unspecified homes incorrectly?**
    - The registry-backed structural-home helper and replacement classification route do not classify descendants as repo-top homes. Descendants may receive other replacement metadata, such as subtree partition candidate classification for names like `components`, but that is separate from repository-top home classification. The risky area remains helper-local contributor policy, not the registry-backed repo-top route.

### 7.2 Repo-top partition inventory table

| Repo-top category | Source of truth | Example | Current runtime behavior | Intended behavior | Downstream consumers | Follow-up needed |
|---|---|---|---|---|---|---|
| structural repository-top home | `structural-homes.registry.json` via `prepareTreeStructuralHomeEvidence`, plus repo-top check in occurrence classification | `src`, `doc`, `scripts` | Produces structural-home evidence; folder-kind evidence becomes `structural`; replacement classification emits `repo-top-structural-root`. `doc` and `scripts` are structural by current registry membership, while repo-shape separately says they are allowed at repo top. | Remain structural repo-top homes only if the structural registry intentionally defines them as structural; repo-shape allowance remains separate. | Folder-kind evidence; occurrence-classification replacement; parity/shadow/readiness helpers; gated unexpected-top-level replacement route. | No broad change for these examples in this audit; future semantic partition work should confirm each retained structural entry. |
| semantic repository-top home | Missing Tree-owned semantic repo-top source today; only possible indirectly through Naming-prepared semantic-home evidence joined by `prepareTreeSemanticHomeEvidence` | `calculogic-validator`, `calculogic-doc-engine` | Currently structural because both names are in `structural-homes.registry.json`; they do not become semantic by default. | Allowed at repo top by repo-shape policy, semantic as repository-top homes, not structural. | Same replacement evidence consumers once a semantic source exists; repo-shape policy continues to control allowed top-level status. | Required: define a Tree-owned semantic repo-top-home registry/resolver before retiring these names from structural homes. |
| unspecified repository-top fallback | `folder-kinds.registry.json` supports `unspecified`; `prepareTreeFolderKindEvidence` emits it when neither structural nor semantic evidence exists | A safe unknown repo-top folder in prepared evidence; if structural entries were removed without semantic replacement, `calculogic-validator` and `calculogic-doc-engine` would fall here in classification | Current replacement classification maps unspecified repo-top evidence to `unclassified`/`unknown`; fallback unexpected-folder behavior still has repo-shape policy, but prepared replacement behavior may treat the unclassified record as not allowed. | Fallback only when structural or semantic classification cannot be safely established; should not normally occur for known allowed repo-top homes. | Occurrence-classification replacement and parity/readiness helpers. | Add semantic source first so known semantic repo-top homes do not degrade to unspecified. |
| non-repository-top descendant | Addressed occurrence `resolvedPath`/lineage/depth from snapshot; repo-top classification requires no `/` in `resolvedPath` | `calculogic-validator/tree`, `calculogic-validator/tree/src` | Not repo-top; no structural-home evidence from repo-top registry; replacement classification leaves `calculogic-validator/tree` unclassified in scoped-root tests, and treats descendants separately from repo-top homes. | Continue to be descendants, not independent repository-top homes; no reuse of repo-top-home rule below repository top. | Snapshot/address evidence consumers; replacement classification for non-root metadata only. | No registry change; future adapters must preserve the repo-top guard. |

### 7.3 Repo-shape policy boundary

`repo-shape-policy.registry.json` is not a structural-home registry. It answers whether a folder name is allowed at repository top level for unexpected-top-level folder behavior. Structural-home classification answers whether an allowed repo-top folder is structurally defined. Semantic-home classification must answer whether an allowed repo-top folder is a semantic repository-top home. `unspecified` remains a fallback when neither structural nor semantic classification is established.

Therefore an allowed folder may be:

```text
allowed at repo top
+ semantic
+ not structural
```

`calculogic-validator` and `calculogic-doc-engine` are the required target examples of that state. The audit finds that current runtime does not yet have the semantic repo-top source needed to make that state true after structural registry retirement.

### 7.4 Repository-Top Structural-to-Semantic Migration Dependency

`calculogic-validator` and `calculogic-doc-engine` are conceptually semantic repository-top homes, not structural homes. Their present structural-home registration is incorrect in classification meaning.

However, those entries cannot safely be removed in isolation because the current runtime does not yet establish a Tree-owned semantic repository-top-home classification for them. Without that semantic source, removal can produce unspecified folder-kind evidence and unclassified repository-top records. Under the prepared replacement route, those unclassified records carry `isRepoShapeAllowedTopLevelDirectory: false`, and `tree-structure-advisor.logic.mjs` can treat them as unexpected even though `repo-shape-policy.registry.json` still lists the folder names as allowed.

The migration dependency is therefore:

```text
repo-shape policy allowance
≠
successful structural-or-semantic occurrence classification
≠
guaranteed suppression of unexpected-top-level behavior
```

Removing the entries must be deferred until semantic repository-top classification is available and wired into the same downstream folder-kind and occurrence-classification path. The current repo-shape policy remains necessary but is insufficient by itself to preserve replacement-route behavior for an unclassified repository-top folder.

| Scenario | Structural-home evidence | Semantic-home evidence | Folder-kind / classification result | Repo-shape policy state | Unexpected-top-level behavior risk |
|---|---|---|---|---|---|
| Current registry state | Present, but conceptually incorrect | Not required for current classification | `structural` / `repo-top-structural-root` | Allowed | Current behavior preserved, wrong category |
| Remove structural entry only | Absent | Absent unless unrelated Naming evidence happens to match that exact folder occurrence | `unspecified` / `unclassified` in the verified prepared evidence path | Allowed by registry, but prepared replacement classification may carry `isRepoShapeAllowedTopLevelDirectory: false` | May become reportable under the prepared replacement route; fallback-only behavior still has the allow-list |
| Add semantic source and then remove structural entry | Absent | Present from a Tree-owned semantic repo-top source | `semantic` / `repo-top-semantic-root` | Allowed | Intended stable migration state, subject to follow-up tests proving replacement-route and fallback behavior match |

## 8. Recommended next seam

Recommended follow-up shape: **Define and consume Tree-owned semantic repository-top-home classification before retiring incorrect structural-home entries**.

Exact registry and runtime seam to change:

1. Define or activate a Tree-owned semantic repository-top-home source of truth, proposed as the missing registry concept `calculogic-validator/tree/src/registries/_builtin/semantic-repository-top-homes.registry.json`.
2. Wire it through the existing occurrence-classification preparation route in `calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs` into semantic-home evidence, folder-kind evidence, and occurrence classification as appropriate.
3. Add tests proving structural, semantic, and unspecified repository-top behavior, including `calculogic-validator` and `calculogic-doc-engine`.
4. Confirm repo-shape-policy interaction and unexpected-top-level behavior remain correct in both fallback and prepared replacement routes.
5. Only then remove `calculogic-validator` and `calculogic-doc-engine` from `structural-homes.registry.json`.

This is intentionally not a broad "implement structural context" issue. It is a partition-correction seam for repository-top homes and remains distinct from this audit PR.

Bounds for that follow-up:

- do not treat `allowedTopLevelDirectories` as structural or semantic truth;
- preserve the repo-top-only guard and do not classify descendants such as `calculogic-validator/tree` or `calculogic-validator/tree/src` as repository-top homes;
- emit internal Tree evidence first, not `treeStructuralContext` in advisory details;
- do not add new findings, placement/coherence conclusions, or Addressing/Naming fields;
- keep helper-local shim artifact surface inference and Naming bridge contributor literals out of the repository-top resolver unless they are separately registered or explicitly bridged by a later issue.
