# Tree Structural Address Usage Inventory

## Status and scope

This inventory documents **current runtime truth** for Tree-side structural-address usage before any bridge or behavior changes.

This inventory documents current Tree-side structural-address usage so the Tree slice can be aligned with Structural Addressing V0 without changing runtime behavior.
Structural Addressing V0 is treated as the implemented source of deterministic tree-codebase addressed evidence.
Tree is treated as the consumer/interpreter/advisor layer for Tree-specific policy and findings.
This slice does not add runtime behavior, Tree advisor findings, semantic-home behavior, structural-home behavior, or validate:addressing behavior.

Core ownership boundary used in this inventory:

- Structural Addressing owns deterministic address production.
- Tree owns Tree-specific interpretation and advisory behavior.

## Relationship to parent #505

Refs #505 (Tree bridge alignment planning): this document captures the present Tree-side usage surface that later bridge slices must classify as keep/bridge/retire without authority drift.

## Relationship to completed parent #487

Refs completed parent #487 (`Structural Addressing get-tree V0`): this inventory treats the get-tree V0 command path and its spec as the implemented source for deterministic addressed evidence production and render output contracts.

## Search terms used

Primary terms searched:

- `structuralAddress`
- `structural-address`
- `structural address`
- `addressPath`
- `parentAddressPath`
- `occurrenceRecords`
- `scopeRoots`
- `marker`
- `renderedTree`
- `prepareTreeStructuralAddressSnapshot`
- `tree structural address snapshot`
- `structuralAddressSnapshot`

## Files inspected

Minimum requested areas inspected for this slice:

- `calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs`
- `calculogic-validator/tree/src/tree-structure-advisor.logic.mjs`
- `calculogic-validator/tree/src/tree-structural-address-snapshot.logic.mjs`
- `calculogic-validator/tree/src/tree-occurrence-snapshot.logic.mjs`
- `calculogic-validator/tree/test/tree-structural-address-snapshot.logic.test.mjs`
- `calculogic-validator/tree/test/tree-occurrence-snapshot.test.mjs`
- `calculogic-validator/structural-addressing/src/structural-addressing-tree-codebase.logic.mjs`
- `calculogic-validator/structural-addressing/src/structural-addressing-render-tree.logic.mjs`
- `calculogic-validator/structural-addressing/test/structural-addressing-render-tree.logic.test.mjs`
- `calculogic-validator/scripts/addressing-get-tree.host.mjs`
- `calculogic-validator/doc/ValidatorSpecs/structural-addressing-get-tree-commands.spec.md`
- `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
- `calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md`

## Findings

| File | Usage | Finding type | Classification | Notes |
| --- | --- | --- | --- | --- |
| `calculogic-validator/structural-addressing/src/structural-addressing-tree-codebase.logic.mjs` | Produces addressed occurrence records (`addressPath`, `parentAddressPath`, marker strategy output, scope metadata). | address-production logic | canonical Structural Addressing owner | Current production authority for deterministic addressed evidence preparation is Structural Addressing slice code, not Tree runtime code. |
| `calculogic-validator/structural-addressing/src/structural-addressing-render-tree.logic.mjs` | Consumes addressed snapshot and produces deterministic `renderedTree`. | address-production logic | canonical Structural Addressing owner | Rendering contract is part of Structural Addressing V0 inspection path. |
| `calculogic-validator/scripts/addressing-get-tree.host.mjs` | Host command wiring for get-tree V0 (`scopeRoots`, addressed snapshot, `renderedTree`, formats). | advisor handoff evidence | canonical Structural Addressing owner | Command surface is in scripts layer but forwards to Structural Addressing ownership. |
| `calculogic-validator/tree/src/tree-structure-advisor.wiring.mjs` | Builds `structuralAddressSnapshot` via `prepareTreeStructuralAddressSnapshot` and passes it into Tree prepared input envelope. | address-consumption logic | Tree consumer-side use | Tree wiring currently consumes/forwards address-like evidence for advisor context; no deterministic address generation rules are defined here. |
| `calculogic-validator/tree/src/tree-structural-address-snapshot.logic.mjs` | `prepareTreeStructuralAddressSnapshot` returns `scope`, `scopeRoots`, `occurrenceRecords` from Tree occurrence snapshot preparation fallback. | address-consumption logic | transitional Tree-owned duplicate | Snapshot shape mirrors addressed evidence envelope terminology, but current implementation relies on Tree occurrence records (`occurrenceMarker`) rather than Structural Addressing V0 `addressPath` contract; this is a likely bridge target. |
| `calculogic-validator/tree/src/tree-occurrence-snapshot.logic.mjs` | Produces `scopeRoots`, `occurrenceRecords`, and per-node `occurrenceMarker` using Tree-local marker logic. | address-production logic | transitional Tree-owned duplicate | Tree-local marker/address-like production appears to overlap conceptual surface with Structural Addressing deterministic production and should be evaluated in follow-up bridge slice. |
| `calculogic-validator/tree/src/tree-structure-advisor.logic.mjs` | Consumes `occurrenceSnapshot.occurrenceRecords` for tree interpretation/classification flow. | address-consumption logic | Tree consumer-side use | Tree runtime acts as consumer/interpreter of occurrence evidence for advisor behavior. |
| `calculogic-validator/tree/test/tree-structural-address-snapshot.logic.test.mjs` | Asserts neutral envelope shape and snapshot fields for Tree structural-address snapshot helper. | test fixture / assertion | Tree consumer-side use | Confirms existing Tree wrapper contract but does not establish Structural Addressing production authority. |
| `calculogic-validator/tree/test/tree-occurrence-snapshot.test.mjs` | Asserts uppercase folder markers, scope roots, and occurrence records in Tree-local snapshot builder. | test fixture / assertion | transitional Tree-owned duplicate | Test expectations lock current Tree-local marker/address-like behavior; defer runtime changes until bridge spec is explicit. |
| `calculogic-validator/doc/ValidatorSpecs/structural-addressing-get-tree-commands.spec.md` | Declares get-tree V0 inspection boundary and `renderedTree` / addressed snapshot outputs. | conceptual documentation | canonical Structural Addressing owner | Current authoritative command/status wording aligns production ownership to Structural Addressing V0. |
| `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md` | Tree spec references structural addressing boundaries and tree consumption posture. | conceptual documentation | Tree consumer-side use | Treat as tree runtime/spec authority for advisor behavior; contains boundary statements that Tree consumes but does not own address grammar production. |
| `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md` | Navigation map references Structural Addressing draft/spec docs in reading map context. | navigation-only / historical documentation | navigation-only doc reference | Inventory/map role only; non-canonical for runtime behavior. |
| `calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md` | Defines deterministic structural-address grammar and terms. | conceptual documentation | canonical Structural Addressing owner | Grammar authority reference; draft status still applies for deferred decisions. |
| `calculogic-validator/tree/src/tree-structural-address-snapshot.logic.mjs` + `calculogic-validator/structural-addressing/src/*` | Similar envelope concepts (`scopeRoots`, occurrence records) but different marker/address fields and generation source. | advisor handoff evidence | unclear / needs follow-up slice | Boundary is visible, but exact adapter/bridge mapping from Tree occurrence marker model to Structural Addressing V0 addressed model should be defined in a dedicated bridge slice spec before code migration. |

## Candidate next-slice recommendations

1. Keep Tree runtime (`tree-structure-advisor.logic.mjs`) as consumer/interpreter only; do not move deterministic address production rules into Tree.
2. Define an explicit Tree↔Structural Addressing bridge contract for occurrence/address evidence mapping before changing any Tree snapshot builder internals.
3. Evaluate whether `tree-occurrence-snapshot.logic.mjs` marker production should remain Tree-local for advisor-only needs or be wrapped/replaced by Structural Addressing V0 addressed evidence in staged migration.
4. Keep Tree tests that currently lock Tree-local marker behavior unchanged until bridge spec clarifies replacement/compat policy.
5. Clean up docs where needed so ownership wording consistently states: Structural Addressing owns deterministic address production; Tree consumes and interprets for advisory policy.
6. Avoid changing files with runtime production logic in Tree or Structural Addressing until the bridge spec defines adapter shape, confidence policy, and rollback-safe sequencing.

## Non-goals

This slice is inventory only and does not add or change:

- runtime behavior changes
- new Tree advisor recommendations
- new Tree findings
- semantic-home classification changes
- structural-home interpretation changes
- broader scatter heuristics
- `validate:addressing` commands
- `validate:addressing:nl` commands
- `validate:addressing:code` commands
- `validate:addressing:nl-code` commands
- NL addressing
- code-file addressing
- NL-to-code comparison
- Naming validation integration
- package bin entrypoints
- new root npm scripts
- new report-capture commands

