# Validator Docs Index

Purpose: quick routing map for validator documentation so readers can distinguish canonical contracts from drafts and implementation notes.

## 1) Canonical suite contracts

- `doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
  Canonical suite-wide contract for report-first semantics, mode vocabulary, report envelope, and exit-policy framing, including canonical-envelope-to-current naming-slice report mapping notes. Read this first when interpreting validator behavior.

- `doc/ConventionRoutines/ValidatorReportSchema-V0_1.md`
  Canonical schema reference for validator JSON output envelopes (slice report and runner report), including deterministic field and ordering expectations.

- `doc/ConventionRoutines/ValidatorRuleIds-Contract.md`
  Canonical rule ID contract for stable finding identifiers and rule-to-document linkage via `ruleRef`.

## 2) Canonical config contract

- `doc/ValidatorSpecs/validator-config-spec.md`
  Canonical config contract (report-only input, strict schema/validation, normalization + merge semantics, CLI `--config` behavior).

## 3) Naming

- `doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
  Canonical naming authority (roles, grammar, exception policy, rollout guidance). Read when defining or reviewing naming rules.

- `doc/ConventionRoutines/NamingValidatorSpec.md`
  Naming-slice validator spec (scope profiles, classification contract, report details, current report/strict exit behavior), including the current runtime category vocabulary for naming role metadata. Read when implementing or validating naming checks.

## 4) Tree advisor

- `doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md`
  Tree-structure advisor validator spec. Read when working on tree diagnostics and snapshot-driven structure checks.

## 5) Structural addressing

- `doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md`
  Draft structural-addressing spec. Read for addressing model details; treat as draft/governance-in-progress, not naming authority.

## 6) Implementation notes (non-canonical / external)

- `doc/nl-config/cfg-namingValidator.md`
  Non-canonical implementation notes for NL/config context in this repo. Use for implementation context only; defer normative behavior to canonical validator-owned docs under `calculogic-validator/doc/...`.

## 7) Drafts / ValidatorSpecs

- `doc/ValidatorSpecs/registry-customization-state-system-draft.md`
  Draft spec for built-in vs custom registry state, customization commands, and digest-based default/custom switching (report-only).

## 8) Audits

- `doc/Audits/current-validator-shim-audit.md`
  Earlier shim audit snapshot (pre/post-hardening transition context).

- `doc/Audits/post-hardening-validator-shim-audit.md`
  Current post-hardening re-audit comparing manually confirmed shim/shim-like inventory vs `validate:tree -- --scope=validator`, including hardened carveout validation and remaining follow-up opportunities.
