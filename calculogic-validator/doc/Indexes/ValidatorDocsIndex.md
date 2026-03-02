# Validator Docs Index

Purpose: quick routing map for validator documentation so readers can distinguish canonical contracts from drafts and implementation notes.

## 1) Canonical suite contracts

- `doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`  
  Canonical suite-wide contract for report-first semantics, mode vocabulary, report envelope, and exit-policy framing, including canonical-envelope-to-current naming-slice report mapping notes. Read this first when interpreting validator behavior.

## 2) Naming

- `doc/ConventionRoutines/FileNamingMasterList-V1_1.md`  
  Canonical naming authority (roles, grammar, exception policy, rollout guidance). Read when defining or reviewing naming rules.

- `doc/ConventionRoutines/NamingValidatorSpec.md`  
  Naming-slice validator spec (scope profiles, classification contract, report details, current report/strict exit behavior), including the current runtime category vocabulary for naming role metadata. Read when implementing or validating naming checks.

## 3) Tree advisor

- `doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md`  
  Tree-structure advisor validator spec. Read when working on tree diagnostics and snapshot-driven structure checks.

## 4) Structural addressing

- `doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md`  
  Draft structural-addressing spec. Read for addressing model details; treat as draft/governance-in-progress, not naming authority.

## 5) Implementation notes (non-canonical / external)

- `doc/nl-config/cfg-namingValidator.md`  
  Non-canonical implementation notes for NL/config context in this repo. Use for implementation context only; defer normative behavior to canonical validator-owned docs under `calculogic-validator/doc/...`.
