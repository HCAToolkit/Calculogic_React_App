# Validator Rule IDs Contract

## 1) Purpose (Canonical)

This document defines the canonical rule identifier contract for Calculogic Validator findings.

A **rule ID** is the stable identifier for the rule that produced a finding. Rule IDs must remain stable across time so reports can be compared deterministically across runs, slices, tools, and CI systems.

## 2) Canonical Rule ID Format

Recommended canonical format:

- `<slice>::<RULE_TOKEN>`

Example:

- `naming::NAMING_UNKNOWN_ROLE`

Format requirements:

- `<slice>`: lowercase alphanumeric plus hyphen (`[a-z0-9-]+`)
- separator: literal `::`
- `<RULE_TOKEN>`: uppercase alphanumeric plus underscore (`[A-Z0-9_]+`)
- no whitespace
- no environment-specific prefixes/suffixes

## 3) Finding Fields and Mapping

Canonical finding identifier field:

- `ruleId`

Transitional mapping rule:

- If an implementation emits `code` today, treat `code` as that finding's effective `ruleId` until migration is complete.

Field relationship contract:

- `ruleId`: stable machine identifier (for diffing, policy, automation)
- `message`: human-readable explanation (can evolve for clarity)
- `ruleRef`: stable pointer to local spec text that defines or contextualizes the rule

## 4) `ruleRef` Contract

`ruleRef` should use a stable repo-local reference string format. Absolute URLs are not required.

Recommended format:

- `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md#finding--error-codes`
- `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md#role-registry-master-list-v1`

Contract rules:

- Reference strings should point to canonical docs for the slice/rule.
- Anchors should exist in the referenced file whenever possible.
- If an anchor changes, use a deterministic fallback section anchor in the same canonical document until the original anchor is restored or updated consistently.

## 5) Non-goals

This contract does **not** define fix execution behavior. It covers rule identification and documentation linkage only.
