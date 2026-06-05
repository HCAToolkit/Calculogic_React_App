# Tree Known-Roots Retirement Target Model Spec

> Status after issue #572: This document is retained as historical docs/spec context. Any known-roots statements describing active runtime ownership are not current runtime truth; current runtime truth is that Tree known-roots registry/runtime dependencies are retired and replacement Tree evidence controls the relevant runtime paths.


## 1. Status and scope

This is a docs/spec-only slice under #516.

Issue linkage:
- Refs #516
- Refs #519
- Follows Slice 1 audit under #517 / PR #518.

This slice defines target architecture and staged implementation path for retiring `tree-known-roots` responsibilities.

This slice does **not** change:
- runtime behavior
- registry payloads
- Tree advisor output
- Structural Addressing logic
- Naming integration
- validation commands

Status framing used intentionally in this document:
- current runtime truth
- current implementation reality
- target architecture
- not current runtime truth
- staged implementation path

## 2. Source audit summary

Slice 1 confirms two runtime dependency paths still anchored to known-roots:

1. `knownTopLevelDirectories`
   - current runtime truth: input to unexpected top-level folder advisor policy.
   - `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` report behavior still depends on this allow-list.

2. `topRoots[].kind`
   - current runtime truth: input to occurrence-derived structural/semantic classification.
   - current implementation reality: drives `structuralClass`, `structuralKind`, `isKnownTopRoot`, `isStructuralRoot`, and `isSemanticRoot` through `classifyTreeOccurrenceRecords(...)`.

Slice 1 also confirms transitional compatibility scaffolding:
- `prepareTreeKnownRootsCompatibilityEvidence(...)`
- `preparedDependencies.treeKnownRootsCompatibilityEvidence`

That compatibility path is current runtime truth for transitional handoff only. It is not target architecture.

## 3. Target ownership model

Core boundary for replacement work:

- Structural Addressing owns deterministic occurrence/address production.
- Tree owns structural-home interpretation.
- Tree owns semantic-home interpretation.
- Tree owns folder-kind interpretation.
- Tree owns placement/advisor policy.
- Naming owns semantic-name and semantic-family interpretation.
- Tree may consume Naming-prepared evidence through an explicit bridge.
- `tree-known-roots` remains temporary compatibility runtime truth only until replacement and removal complete.

Owner-specific statement of responsibilities:

1. Structural Addressing occurrence evidence
   - owns: deterministic answers to where an occurrence is.
   - must not own: structural-home, semantic-home, or folder-kind meaning.

2. Tree structural-home interpretation
   - owns: interpretation of addressed occurrence evidence into structural-home meaning.
   - must not own: deterministic address generation semantics.

3. Tree semantic-home interpretation
   - owns: semantic-home interpretation over occurrence context/lineage.
   - must not own: Naming semantic-family semantics themselves.

4. Tree folder-kind interpretation
   - owns: folder-kind reasoning for placement/advisor policy use.
   - must not own: shared naming semantics.

5. Tree advisor policy
   - owns: report policy decisions such as unexpected top-level folder determinations.
   - must not own: raw deterministic addressing production.

6. Naming-prepared semantic-family evidence
   - owns: semantic-name/semantic-family interpretation and prepared evidence.
   - must not own: Tree placement policy decisions.

7. Registry alignment work
   - owns: clarifying which registry is policy truth for each evidence lane.
   - must not own: silent runtime behavior changes in this slice.

8. Legacy compatibility removal
   - owns: staged retirement of compatibility adapter once no runtime consumers remain.
   - must not own: permanent replacement architecture.

## 4. Responsibility replacement model

| Known-roots responsibility | Current known-roots input | Target replacement input | Target owner | Required missing piece | Safe migration note |
| --- | --- | --- | --- | --- | --- |
| top-level folder recognition | `knownTopLevelDirectories` / `topRoots[].root` | addressed repo-top/scope-top occurrence evidence | Structural Addressing (production) + Tree (consumption) | explicit addressed occurrence contract for repo-top/scope-top markers | keep known-roots path until replacement is behavior-preserving |
| repo-top path-shape matching | compatibility matching of single-token repo-top folder paths | deterministic addressed occurrence envelope with repo-top identity | Structural Addressing | codified repo-top identity fields consumed by Tree | do not infer meaning from token-only root matching |
| unexpected top-level folder policy | `knownTopLevelDirectories` allow-list | addressed repo-top occurrence evidence + Tree folder-kind evidence + Tree structural-home evidence + advisor rules | Tree advisor policy | Tree policy contract that reproduces current report-visible behavior | preserve current report output until bounded migration slice |
| structural root hints | `topRoots[].kind = structural` | Tree structural-home interpretation evidence lane | Tree | Tree structural-home preparation path over addressed occurrences | remove hint usage only after replacement evidence is in place |
| semantic custom root hints | `topRoots[].kind = semantic` + custom roots | Tree semantic-home interpretation + Naming-prepared evidence where applicable | Tree + Naming bridge | explicit semantic-home evidence prep and bridge inputs | keep known-roots semantic hints until replacement path is test-covered |
| occurrence-derived structural/semantic classification | `topRoots[].kind` and `topRoots[].root` | addressed occurrence evidence + Tree structural-home interpretation + Tree semantic-home interpretation + Tree folder-kind interpretation + Naming-prepared semantic-family evidence | Tree (interpretation) + Naming bridge + Structural Addressing (address source) | replacement classifier contract for `structuralClass`/`structuralKind`/known-root flags without known-roots | replace in behavior-preserving slices; do not change findings envelope in this slice |
| folder allow-list behavior | `knownTopLevelDirectories` set | Tree policy rules over addressed evidence and folder-kind/structural-home evidence | Tree advisor policy | deterministic Tree allow/expect policy model for repo-top directories | replacing this alone is insufficient; classification dependency must also retire |
| prepared compatibility evidence | `prepareTreeKnownRootsCompatibilityEvidence(...)` and prepared dependency payload | no long-term replacement; remove after consumers are retired | legacy compatibility removal | dependency inventory proving no runtime consumer requirement | compatibility adapter remains scaffolding only |
| registry normalization/shape validation | dual-shape loader (`topRoots` + legacy `knownTopLevelDirectories`) | replacement registry contracts aligned by ownership lanes | registry alignment work | owner-aligned registry normalization contracts | do not rewrite payloads in this slice |
| test / tests literal handling | literal registered roots, no normalization | explicit policy decision in registry alignment / Tree policy | registry alignment work + Tree policy | explicit decision on aliasing semantics (if any) | preserve literal non-normalization until dedicated migration decision |

## 5. Occurrence classification target model

Current known-roots-driven fields:
- `structuralClass`
- `structuralKind`
- `isKnownTopRoot`
- `isStructuralRoot`
- `isSemanticRoot`

Target architecture for those fields:
- addressed occurrence evidence (where is this occurrence?)
- Tree structural-home interpretation (what structural-home meaning applies?)
- Tree semantic-home interpretation (what semantic-home meaning applies?)
- Tree folder-kind interpretation (what folder-kind evidence applies?)
- Naming-prepared semantic-family evidence where applicable

Important distinction:
- Structural Addressing identifies occurrence and position.
- Tree decides structural/semantic/folder-kind interpretation.
- Naming may provide semantic-family evidence for Tree to consume through explicit bridge.

This replacement model is target architecture, not current runtime truth. No replacement runtime implementation is included in this slice.

## 6. Unexpected top-level folder policy target model

Current runtime truth:
- `knownTopLevelDirectories` drives unexpected top-level folder policy.

Target architecture:
- advisor policy consumes addressed repo-top occurrence evidence,
- combines Tree folder-kind evidence,
- combines Tree structural-home evidence,
- applies Tree advisor policy rules for unexpected/allowed top-level folders.

Migration guardrail:
- current report-visible behavior must remain stable until bounded behavior-preserving migration exists.

Retirement completeness guardrail:
- replacing occurrence classification alone is not enough.
- replacing unexpected-folder allow-list alone is not enough.
- both known-roots dependency paths must be retired.

## 7. Registry alignment target questions

| Question | Status tag | Notes |
| --- | --- | --- |
| `test` / `tests` alignment policy | required before replacement | Current tests lock literal non-normalization; replacement behavior must be explicit. |
| Tree-local vs shared registry ownership boundaries | required before replacement | Required to avoid competing policy truth across layers. |
| standalone shared `surfaces.registry.json` status | needs separate parent/slice | Deferred cross-cutting ownership decision; no runtime dependency confirmed for this slice. |
| surface-to-structural-home perspective expectations | can be deferred | Perspective evidence lane can remain non-authoritative while replacements stage. |
| structural-homes registry relationship to Tree interpretation | required before replacement | Tree must consume structural-home evidence without collapsing ownership boundaries. |
| folder-kinds registry relationship to classification | required before replacement | Needed before replacing known-roots-driven classification/policy routes. |
| semantic-home evidence model | required before replacement | Needed to separate Tree semantic-home interpretation from Naming semantics ownership. |

No registry payload resolution occurs in this slice.

## 8. Naming bridge boundary

Boundary statement:
- Naming owns semantic-name and semantic-family interpretation.
- Tree may consume Naming-prepared evidence through explicit bridge.
- Tree must not reimplement Naming interpretation directly.

Future Tree/Naming bridge inputs likely needed (target/deferred unless already present):
- semantic-family evidence
- semantic-name evidence
- evidence source metadata
- file/folder association signals where available

Availability framing:
- existing bridge contributor surfaces bounded `namingSemanticFamilyBridge` observations in current implementation reality.
- broader replacement fields above are target/deferred where not already present as runtime contract.

## 9. Migration sequence

Recommended staged implementation path after this model:

1. Resolve or stage registry alignment blockers.
2. Define addressed occurrence evidence contract for repo-top / scope-top classification.
3. Add Tree-owned structural-home evidence preparation.
4. Add Tree-owned semantic-home evidence preparation, using Naming-prepared evidence when available.
5. Add Tree folder-kind interpretation path.
6. Replace occurrence classification known-roots dependency in behavior-preserving slices.
7. Replace unexpected top-level folder known-roots dependency in behavior-preserving slices.
8. Remove compatibility adapter/prepared dependency after no consumer needs it.
9. Archive/remove known-roots registry, loader, and tests after no runtime dependency remains.

## 10. Non-goals and anti-drift guardrails

This target model does not:
- make known-roots permanent architecture
- make Structural Addressing responsible for Tree interpretation
- make Tree responsible for Naming interpretation
- change Tree advisor behavior
- change report output
- normalize `test` / `tests`
- introduce shared `surfaces.registry.json`
- remove known-roots in this slice
- rewrite registry payloads

Additional explicit non-goals for this docs/spec-only slice:
- no runtime behavior changes
- no Tree advisor findings/finding code/severity changes
- no structural-home or semantic-home runtime behavior changes
- no occurrence classification runtime behavior changes
- no unexpected folder policy runtime behavior changes
- no validation command changes
- no Naming integration runtime behavior changes
- no Structural Addressing runtime logic changes
