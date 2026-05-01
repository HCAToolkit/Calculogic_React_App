# AGENTS.md

## Scope and Purpose
Applies to the entire repository.
Use docs-first, deterministic, ownership-aligned changes.

## Issue vs PR Discipline
- Issues hold planning context, deferred scope, roadmap notes, ADR context, and explicit “not this PR” boundaries.
- PRs hold durable repository changes only.
- Do not copy broad issue-planning language into repo docs unless it is stable implementation truth.
- Use `Closes #...` only when the PR completes the whole issue; otherwise use `Refs #...` or `Implements part of #...`.

## Baseline References
1. `calculogic-validator/doc/ConventionRoutines/CCPP.md`
2. `calculogic-validator/doc/ConventionRoutines/CCS.md`
3. `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
4. `doc/ConventionRoutines/General-NL-Skeletons.md`
5. `doc/ConventionRoutines/NL-First-Workflow.md`
6. `README.md`
7. `calculogic-validator/README.md`

Read the narrowest relevant subset for the task. For validator, convention, architecture, naming, or NL-aligned changes, treat the list below as baseline references.

If any always-read canonical convention doc is missing, stop and report it clearly.

## Required Task-Specific References
- **Runtime/suite work:**
  - `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
  - `calculogic-validator/doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md`
- **Naming work:**
  - `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
- **Tree work:**
  - `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md` is for navigation/discovery only.
  - For runtime/spec authority, follow the canonical reading order defined in that map.
- **Registry model work:**
  - `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
  - `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
  - `calculogic-validator/doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md`
  - `calculogic-validator/doc/ValidatorSpecs/cross-cutting/registry-model-and-slice-interaction.spec.md`
  - `calculogic-validator/doc/ValidatorSpecs/cross-cutting/registry-blueprint-implementation-map.spec.md`

## Precise Status Wording
Use these exact phrases when describing state:
- current runtime truth
- current implementation reality
- target architecture
- not current runtime truth
- staged implementation path
- Avoid vague sticky wording in durable repo docs (for example: “maybe later,” “future possible,” “deferred someday,” “do not implement,” “not yet”) unless the document is explicitly a roadmap, issue-derived plan, or transitional inventory.

## Workflow and Architecture Guardrails
- Follow NL-first when task scope touches structure, behavior, contracts, validators, registries, shells, or configs.
- Maintain concern purity and dependency direction per CCS.
- Maintain comment/provenance discipline per CCPP.
- Treat validator-owned convention docs as canonical when repo-local pointer docs also exist.

## Calculogic Validator ROI Priorities
Prioritize decisions using:
- clean ownership boundaries
- modular decomposition
- future extraction paths
- deterministic organization
- future-proof extensibility
- fidelity to developer mental models
- semantic modeling where it improves deterministic reasoning

## Validator Ownership Rules
- Naming owns filename / semantic-name / semantic-family interpretation.
- Tree owns folder classification, structural-home reasoning, semantic-home reasoning, placement evidence, and whole-placement confidence.
- Runtime loaders own normalization and deterministic runtime interpretation.
- Generated/runtime views consume registry truth and must not become competing policy truth.
- Do not make Surface equivalent to Structural Home.
- Do not make Agnostic-Core Meaning replace Category, Role, Surface, or Structural Home identity.

## Registry Work Order
Follow this sequence:
1. docs/spec alignment
2. data-only registry payloads
3. registry shape tests
4. loader compatibility bridges
5. runtime behavior migration
6. extraction preparation

## Task Boundaries and Verification
- Keep PRs narrowly scoped to the requested issue.
- Do not modify runtime code, registry payloads, loaders, workflows, templates, or existing specs unless explicitly requested.
- Run the narrowest relevant checks for touched files.
- If target filtering excludes touched files, note the limitation and do not broaden scope.
