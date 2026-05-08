# Tree Structural-Address Neutral Probe Contract Spec (Issue #480)

## Status and ownership

- **Ownership:** Tree-owned.
- **Contract posture:** docs/spec only.
- **Contract purpose:** neutral pre-reasoning structural-address evidence contract.
- **current runtime truth:** occurrence snapshot runtime substrate exists and is consumed inside Tree runtime preparation/reasoning flow.
- **not current runtime truth:** this document does not introduce runtime behavior, loader/normalization implementation, report output exposure, final placement confidence semantics, or known-root replacement semantics.
- **staged implementation path:** formalize contract boundary first, then evaluate bounded runtime exposure in a later issue.

Issue lineage: Refs #480; parent roadmap context Refs #452; audit context Refs #478.

---

## Inputs

This contract defines a conceptual input boundary that reuses existing Tree scope and traversal behavior.

### Input boundary

- active Tree scope.
- target/include roots using existing Tree scope/target semantics.
- selected filesystem paths from existing Tree traversal/snapshot behavior.

### Guardrails

- no new scope policy.
- no new traversal policy.
- no new target resolution policy.

The neutral probe contract is intentionally defined on top of the existing occurrence snapshot substrate rather than introducing alternate traversal or scope interpretation.

---

## Neutral probe evidence shape

The neutral probe evidence contract is based on current occurrence snapshot concepts and field families.

```js
{
  scope: {
    scopeRootPath,
    targetKind,
    source
  },
  scopeRoots: [],
  occurrenceRecords: [
    {
      resolvedPath,
      actualName,
      occurrenceType,
      scopeRootPath,
      isScopedRoot,
      isScopeTopOccurrence,
      parentResolvedPath,
      depth,
      lineageSegments,
      markerSegments,
      occurrenceMarker
    }
  ]
}
```

Contract-preserved concepts (normative for this spec boundary):

- scope binding.
- scope roots.
- resolved path.
- actual name/token.
- folder/file occurrence type.
- scoped-root marker.
- scope-top marker.
- parent path.
- depth.
- lineage segments.
- marker segments.
- flattened occurrence marker/address.

Field naming may be refined in later implementation slices only if these concepts remain deterministic and explicitly mappable.

---

## Deterministic addressing semantics

This contract adopts the structural-address semantics already documented in `tree-occurrence-model-and-addressing.spec.md` for Tree occurrence identity modeling.

- active scope root starts at `A` in the illustrative lineage model.
- folder occurrences use alphabetic sibling markers: `A`, `B`, `C`, … (extended as needed).
- file occurrences use numeric sibling markers: `1`, `2`, `3`, …
- folder counters rebase per parent lineage.
- file counters rebase per parent lineage.
- addresses are lineage-based (for example `A.D.A.3`).
- resolved filesystem paths remain user-facing truth.
- structural addresses represent pre-reasoning occurrence identity, not final meaning.

This section defines neutral structural-address evidence semantics only; it does not change report semantics.

---

## Handoff boundaries

### Relationship to current occurrence snapshot substrate

- The current occurrence snapshot is the current implementation reality substrate that supplies most of the required neutral probe evidence fields.
- This contract formalizes boundary expectations without claiming a new runtime surface.

### Relationship to known-root compatibility interpretation

- Known-root compatibility interpretation remains a separate downstream interpretation layer.
- This contract does not change known-root behavior.

### Relationship to future registry-based Tree reasoning

- Registry-based Tree reasoning is a later consumer layer that may consume this neutral evidence contract.
- This issue does not wire registry policy into Tree runtime logic.

### Relationship to future loader/normalization work

- Loader/normalization work is downstream from this boundary and should wait until this contract is stable.
- This issue does not add loader code or normalization behavior.

### Relationship to final Tree findings and reports

- Findings and reports remain downstream output layers.
- This issue does not expose structural addresses in findings/reports.

---

## Future surface options

After contract acceptance, exposure options can be evaluated in a bounded implementation issue:

- docs-only contract usage,
- internal API,
- debug/probe output,
- command surface,
- staged combination.

This issue does not select or implement any command/runtime surface.

---

## Conformance notes

- current snapshot substrate is mostly sufficient for neutral structural-address probe evidence concepts.
- contract formalization is the immediate next step completed by this docs/spec slice.
- loader/normalization migration should wait until this neutral probe contract is accepted.
- report/finding exposure remains out of scope in this issue.
- a later implementation issue can decide whether to expose this probe via internal API, debug/probe output, command surface, or another bounded path.

Non-goal reaffirmation for this issue:

- no runtime Tree behavior changes.
- no get-tree command implementation.
- no structural-address CLI/report exposure.
- no debug-output addition.
- no internal API export changes.
- no loader additions.
- no policy registry wiring into Tree logic.
- no known-root compatibility behavior changes.
- no Tree findings/report shape/severity/detail/summary changes.
- no registry JSON changes.
- no Naming behavior changes.
- no Naming → Tree bridge payload changes.

---

## Next implementation direction

Recommended next runtime-safe slice after this contract is accepted:

- evaluate one bounded exposure path (internal neutral structural-address probe API, debug/probe output, command surface, or staged combination) based on current evidence and ownership boundaries.

Broader loader/normalization migration and registry-based Tree reasoning should wait until this neutral probe contract is stable.
