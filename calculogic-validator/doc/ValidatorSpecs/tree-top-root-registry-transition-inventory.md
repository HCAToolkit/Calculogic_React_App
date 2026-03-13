# Tree Top-Root Registry Transition Inventory/Contract

## 1) Purpose

Define a bounded, implementation-facing transition contract for moving tree top-root registry shape from the current flat runtime list to a structured metadata model.

This document is transition-scoped for the current known roots in this repository. It does not define a universal ontology for all future repositories.

Classification: Normative

## 2) Source Anchors and Scope

Current source anchors for this transition:

- runtime flat registry: `calculogic-validator/tree/src/registries/_builtin/tree-known-roots.registry.json`
- tree top-root classes/ownership modeling note: `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md` ("Top-Root Registry Classes and Ownership Boundary")

Scope boundary:

- top-root registry shape only
- no runtime behavior changes in this document task
- no registry implementation migration in this document task

Classification: Normative

## 3) Current Runtime Shape (Flat)

Current shape:

```json
{
  "knownTopLevelDirectories": ["..."]
}
```

Current known roots are a mixed list inside `knownTopLevelDirectories[]`:

- structural/generic roots (for example: `src`, `test`, `doc`, `docs`, `scripts`, `tools`, `public`, `bin`)
- semantic/custom-style repo roots (current dogfooding/current-repo reality):
  - `calculogic-validator`
  - `calculogic-doc-engine`

Transition interpretation note:

- the current runtime list is operationally flat and does not encode `kind`, ownership/source, or style class metadata.

Classification: Normative

## 4) Target Structured Shape (First Transition Shape)

First intended structured metadata shape for transition work:

```json
{
  "topRoots": [
    {
      "root": "src",
      "kind": "structural",
      "ownershipSource": "builtin",
      "styleClass": "generic-builtin"
    }
  ]
}
```

Field contract (first pass):

- `root` (string, required): top-level directory token
- `kind` (enum, required): `structural` | `semantic`
- `ownershipSource` (enum, required): `builtin` | `custom`
- `styleClass` (string, optional first-pass): bounded style classification for migration clarity (for example `generic-builtin`, `custom-style`)

Notes:

- `styleClass` is intentionally optional in first transition work.
- This shape is a transition contract target, not a claim that runtime has already migrated.

Classification: Normative

## 5) Initial Classification Inventory (Current Known Roots Only)

Bounded inventory for current known roots in the flat registry:

| root | kind | ownershipSource | styleClass | rationale |
|---|---|---|---|---|
| `bin` | structural | builtin | generic-builtin | generic structural surface |
| `doc` | structural | builtin | generic-builtin | generic structural surface |
| `docs` | structural | builtin | generic-builtin | generic structural surface |
| `public` | structural | builtin | generic-builtin | generic structural surface |
| `scripts` | structural | builtin | generic-builtin | generic structural surface |
| `src` | structural | builtin | generic-builtin | generic structural surface |
| `test` | structural | builtin | generic-builtin | generic structural surface |
| `tools` | structural | builtin | generic-builtin | generic structural surface |
| `calculogic-validator` | semantic | custom | custom-style | repo-local package-style root |
| `calculogic-doc-engine` | semantic | custom | custom-style | repo-local package-style root |

Boundary note:

- This inventory is intentionally limited to current known roots and current repo context.
- It is not a universal builtin policy declaration for published-package defaults.

Classification: Normative

## 6) Transition Compatibility Plan

Decision for next implementation slice: **dual-read temporary compatibility**.

### 6.1 Plan

1. Introduce structured top-root metadata shape.
2. Add temporary compatibility support so tree can read:
   - legacy flat shape (`knownTopLevelDirectories[]`), and
   - structured shape (`topRoots[]`).
3. Prefer structured metadata when both shapes are present and valid.
4. Keep a bounded removal follow-up that deletes flat-shape support after migration is complete.

### 6.2 Canonical state during transition

- Runtime canonical_source during initial compatibility window: flat list remains accepted for backward compatibility.
- Migration canonical_target: structured metadata shape is the intended long-term authority.
- During overlap, parity between both shapes must be deterministic for shared entries.

### 6.3 Test implications

Next implementation slice should include contract tests for:

- flat-only payload read success
- structured-only payload read success
- dual-shape payload read with deterministic precedence (structured preferred)
- parity/consistency check for roots represented in both shapes
- invalid enum/value handling for `kind` and `ownershipSource`

Classification: Normative

## 7) Ownership Guardrails

- Tree owns structural root interpretation.
- Naming-like style signals may inform semantic/custom-style root classification but do not convert roots into filename role semantics.
- Published-package builtin defaults should not silently absorb repo-specific dogfooding roots.
- Repo-local semantic/custom-style roots are allowed via explicit custom ownership modeling, not implicit builtin drift.

Classification: Normative

## 8) Non-goals

- no runtime changes in this doc task
- no full registry migration in this doc task
- no semantic subfolder model in this doc task
- no relationships/definitions registry implementation in this doc task
- no naming behavior changes in this doc task

Classification: Normative
