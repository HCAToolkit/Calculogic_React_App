# Validator Docs Index

Purpose: quick routing map for validator documentation so readers can distinguish canonical contracts from drafts and implementation notes.

Current `ValidatorSpecs` layout note: root-level files remain the stable canonical/shared entrypoints, while ownership-specialized supporting docs now live under `naming-owned/`, `tree-owned/`, `cross-cutting/`, and `suite-owned/`. Use the root entrypoints first, then drop into the ownership lane that matches the task.

Authority labels used in this index:

- **Canonical contract**: suite-wide normative contract; controls runtime-facing semantics within stated scope.
- **Canonical slice spec**: slice-owned normative behavior/spec authority.
- **Bounded normative supporting spec**: active normative/spec guidance for a bounded lane; non-primary authority that must defer to canonical contracts/slice specs.
- **Supporting implementation guidance**: implementation context only; does not redefine runtime authority.
- **Draft**: governance-in-progress or scoped draft assumptions; non-final authority outside explicitly closed scope.
- **Audit**: snapshot verification artifact; records findings at a point in time.
- **Transitional inventory**: migration/routing context; not runtime/spec authority.

## 1) Canonical contract (suite-wide)

- `doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
  **Authority:** canonical contract. **Intended use:** first-read suite authority for report-first semantics, mode vocabulary, report envelope, and exit-policy framing.

- `doc/ConventionRoutines/ValidatorReportSchema-V0_1.md`
  **Authority:** canonical contract. **Intended use:** normative schema for validator JSON output envelopes (slice + runner), including deterministic field/order expectations.

- `doc/ConventionRoutines/ValidatorRuleIds-Contract.md`
  **Authority:** canonical contract. **Intended use:** normative rule-ID contract for stable finding IDs and `ruleRef` linkage.

- `doc/ConventionRoutines/ValidatorHelperAreas-And-Reuse-Conventions.md`
  **Authority:** canonical contract. **Intended use:** normative helper ownership/reuse boundaries for validator helper surfaces.

## 2) Canonical contract (config)

- `doc/ValidatorSpecs/validator-config-spec.md`
  **Authority:** canonical contract. **Intended use:** normative config semantics (report-only input, strict schema/validation, normalization + merge semantics, CLI `--config` behavior).

## 3) Canonical slice specs

- `doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
  **Authority:** canonical contract (cross-slice naming authority). **Intended use:** normative source for filename grammar, role/category/status vocabulary, exception policy, and naming change-control.

- `doc/ConventionRoutines/NamingValidatorSpec.md`
  **Authority:** canonical slice spec (naming). **Intended use:** normative naming-slice behavior/spec for scope profiles, classification contract, report details, and strict-exit behavior.

- `doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md`
  **Authority:** canonical slice spec (tree). **Intended use:** normative tree-slice runtime/spec behavior for diagnostics and snapshot-driven structure checks.

## 4) Non-canonical implementation/spec guidance

### 4.1 Bounded normative supporting specs

- `doc/ValidatorSpecs/filename-case-and-interpretation-contract.md`
  **Authority:** bounded normative supporting spec. **Intended use:** shared filename interpretation/case-policy contract lane for cross-slice alignment; defer primary runtime authority to suite contract + slice specs.

- `doc/ValidatorSpecs/naming-owned/naming-semantic-name-and-role-disambiguation-spec.md`
  **Authority:** bounded normative supporting spec. **Intended use:** naming semantic-name vs role-token disambiguation interpretation guidance; supports implementation and modeling without replacing canonical slice authority.

- `doc/ValidatorSpecs/naming-owned/naming-semantic-family-and-interpretation-spec.md`
  **Authority:** bounded normative supporting spec. **Intended use:** active documentation-first semantic-family modeling tranche for naming interpretation; runtime behavior remains governed by canonical authorities unless implemented.

- `doc/ValidatorSpecs/cross-cutting/registry-model-and-slice-interaction-spec.md`
  **Authority:** bounded normative supporting spec. **Intended use:** suite-level registry model/interaction constraints for implementation design and ownership boundaries; defer primary runtime authority to canonical contracts/slice specs.

- `doc/ValidatorSpecs/tree-owned/tree-structural-vocabulary-and-root-classification-spec.md`
  **Authority:** bounded normative supporting spec. **Intended use:** tree-owned structural vocabulary and root-classification modeling contract; supports tree interpretation work without replacing canonical tree runtime authority.

- `doc/ValidatorSpecs/tree-owned/tree-occurrence-model-and-addressing-spec.md`
  **Authority:** bounded normative supporting spec. **Intended use:** tree-owned occurrence/addressing modeling contract used for deterministic path-occurrence reasoning; no runtime authority change implied.

- `doc/ValidatorSpecs/tree-owned/tree-registry-definitions-and-relationships-spec.md`
  **Authority:** bounded normative supporting spec. **Intended use:** tree-owned interpretive registry definitions/relationships modeling contract that supports tree design work while deferring runtime authority to the canonical tree spec.

- `doc/ValidatorSpecs/tree-owned/tree-top-root-registry-transition-inventory.md`
  **Authority:** bounded normative supporting spec. **Intended use:** transition-scoped top-root registry contract for tree modeling/migration work; does not replace the canonical tree slice spec.

### 4.2 Supporting implementation guidance

- `doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md`
  **Authority:** supporting implementation guidance. **Intended use:** tree NL/config implementation context and sequencing notes; defer runtime authority to suite contract + tree slice spec.

- `doc/nl-config/cfg-namingValidator.md`
  **Authority:** supporting implementation guidance (repo-local/external to validator-owned canonical set). **Intended use:** local implementation context only; defer normative behavior to validator-owned canonical docs.

## 5) Transitional inventories / migration routing

- `doc/ValidatorSpecs/naming-owned/naming-documentation-map-and-reorg-inventory.md`
  **Authority:** transitional inventory. **Intended use:** naming-document routing/ownership guidance and bounded reorg context; does not define runtime behavior.

- `doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md`
  **Authority:** transitional inventory. **Intended use:** tree-document routing/ownership guidance and bounded reorg context; does not define runtime behavior.

- `doc/naming-compatibility-inventory.md`
  **Authority:** transitional inventory. **Intended use:** naming runtime compatibility/migration tracking; does not define runtime behavior or naming-spec authority.

## 6) Drafts

- `doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md`
  **Authority:** draft. **Intended use:** structural-addressing modeling guidance while governance decisions remain in progress.

- `doc/ValidatorSpecs/suite-owned/compat-shim-policy.md`
  **Authority:** draft. **Intended use:** draft policy for time-bounded compat shims during refactor staging; does not establish canonical runtime behavior by itself.

- `doc/ValidatorSpecs/suite-owned/registry-customization-state-system-draft.md`
  **Authority:** draft. **Intended use:** draft spec for built-in vs custom registry state and customization commands (report-only).

## 7) Audits (snapshot artifacts)

- `doc/Audits/current-validator-shim-audit.md`
  **Authority:** audit snapshot. **Intended use:** earlier shim audit context for pre/post-hardening transition.

- `doc/Audits/post-hardening-validator-shim-audit.md`
  **Authority:** audit snapshot. **Intended use:** post-hardening shim re-audit vs `validate:tree -- --scope=validator`.

- `doc/Audits/final-state-validator-shim-verification-audit.md`
  **Authority:** audit snapshot. **Intended use:** final-state verification audit after detector-noise cleanup.

## 8) Maintenance note

- When adding a new validator doc, classify it in this index using one of the authority labels above.
- If a document changes authority level (for example draft -> canonical slice spec), update this index in the same change set.
