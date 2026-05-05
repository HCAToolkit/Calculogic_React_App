# naming + suite self-cleanup audit (post staged registry split)

## 1. Purpose

This audit is an issue-#443, scope-limited, audit-only snapshot of current Naming + shared + suite-wide naming self-noise after the staged registry split, using issue #442 as parent roadmap context.

This document records current runtime truth and current implementation reality from fresh validator output, then separates actionable cleanup from deferred custom/Tree lanes.

## 2. Commands run

Run date: 2026-05-04 (UTC).

1. `npm run validate:naming -- --scope=validator --target calculogic-validator/naming/src/registries`
   - Outcome: exited 2, findings present (expected audit input).
   - Key counts: canonical 20, legacy-exception 1, invalid-ambiguous 2.
2. `npm run validate:naming -- --scope=validator --target calculogic-validator/src`
   - Outcome: exited 2, findings present (expected audit input).
   - Key counts: canonical 21, legacy-exception 1, invalid-ambiguous 2.
3. `npm run validate:naming -- --scope=validator --target calculogic-validator/bin`
   - Outcome: exited 0, no noise findings in target.
   - Key counts: canonical 3.
4. `npm run validate:naming -- --scope=validator --target calculogic-validator/scripts`
   - Outcome: exited 0, no noise findings in target.
   - Key counts: canonical 7.
5. `npm run validate:naming -- --scope=validator --target calculogic-validator/doc`
   - Outcome: exited 0, findings present (expected audit input).
   - Key counts: canonical 19, legacy-exception 29.
6. Broad check used for context: `npm run validate:naming -- --scope=validator`
   - Outcome: exited 2, findings present (expected audit input).
   - Key counts: canonical 109, allowed-special-case 55, legacy-exception 31, invalid-ambiguous 8.

## 3. Current validator findings summary

### Current active cleanup (inside #442 scope)

- `calculogic-validator/src/**`
  - `NAMING_MISSING_ROLE`: `calculogic-validator/src/index.mjs`.
  - `NAMING_UNKNOWN_ROLE`: `calculogic-validator/src/core/validator-scopes.runtime.mjs`, `calculogic-validator/src/registries/validator-exit-policy.registry.runtime.mjs`.
- `calculogic-validator/naming/src/registries/**`
  - `NAMING_MISSING_ROLE`: `calculogic-validator/naming/src/registries/registry-state.json`.
  - `NAMING_UNKNOWN_ROLE`: `_custom/*.registry.custom.json` pair.
- `calculogic-validator/doc/**` (legacy-missing-role heavy cluster)
  - 29 `NAMING_MISSING_ROLE` findings concentrated in `doc/Audits`, `doc/ConventionRoutines`, `doc/Indexes`, `doc/ValidatorSpecs/...`.

### Comparison vs historical audit (`validator-missing-role-decision-lanes.audit.md`)

- Still current:
  - `src/index.mjs` role-vocabulary pressure remains.
  - `naming/src/registries/registry-state.json` missing-role pressure remains.
  - `doc/Indexes/validator-docs.index.md`, `doc/...inventory...`, and many convention/spec files remain missing-role findings.
- Already resolved since historical pass:
  - `bin/**` and `scripts/**` previously rename-candidate host surfaces are now canonical host-named files.
- Newly changed / now explicit after registry split:
  - `_custom/*.registry.custom.json` now stand out as explicit unknown-role compatibility surfaces.
  - `validator-scopes.runtime.mjs` and `validator-exit-policy.registry.runtime.mjs` expose `runtime`-token pressure in suite-core/shared lanes.
- Deferred (same lane as prior + still valid):
  - custom registry UX/state switching surfaces.
  - Tree documentation-map and Tree transition inventory surfaces.
- No longer relevant from older “rename now” list:
  - old bin/scripts rename-now queue is effectively complete in current implementation reality.

## 4. Rename-ready files

No high-confidence rename-ready items are proposed in this audit slice.

Reason: remaining active findings are either role-vocabulary pressure, compatibility scaffolding, or authority-doc naming that needs a policy-level decision before deterministic rename.

## 5. Ambiguous files

1. `calculogic-validator/src/core/validator-scopes.runtime.mjs`
   - Ambiguity: responsibility is clear (scope runtime interpretation), but taxonomy fit is ambiguous because `runtime` is not an active role.
   - Decision needed: whether to fold into existing `*.logic.mjs` naming or defer until explicit role policy slice.
   - Recommended disposition: rename later (not now).

2. `calculogic-validator/src/registries/validator-exit-policy.registry.runtime.mjs`
   - Ambiguity: mixed surface (`registry` semantic-name + runtime implementation surface) with inactive `runtime` role token.
   - Decision needed: whether this should be `*.logic.mjs`, split into loader-vs-runtime files, or preserved as compatibility bridge.
   - Recommended disposition: split-or-rename later after explicit ownership pass.

3. `calculogic-validator/doc/Audits/validator-shim-cleanup-design-checkpoint.md`
   - Ambiguity: mixed checkpoint/decision posture.
   - Decision needed: lock as audit history vs planning note.
   - Recommended disposition: leave alone for now.

4. `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-top-root-registry-transition-inventory.md`
   - Ambiguity: inventory + spec-like semantics coexist.
   - Decision needed: split inventory from spec authority, or keep mixed with explicit classification.
   - Recommended disposition: defer to Tree work.

## 6. Role-vocabulary pressure

1. `calculogic-validator/src/index.mjs`
   - Responsibility: package export surface/barrel.
   - Distortion today: active roles (`logic`, `host`, `contracts`, etc.) do not honestly express barrel/export identity.
   - Candidate role: `inventory` or `note` does not fit; likely needs dedicated barrel/index handling later.
   - Recommendation: later role-addition/governance slice only.

2. `calculogic-validator/naming/src/registries/registry-state.json`
   - Responsibility: tiny registry-state snapshot for active source resolution.
   - Distortion today: no active role honestly captures runtime state snapshot semantics.
   - Candidate role: `inventory`/`note` not a fit; this is configuration/state semantics.
   - Recommendation: defer until explicit registry-state naming policy slice.

3. `calculogic-validator/doc/Indexes/validator-docs.index.md`
   - Responsibility: doc routing index.
   - Distortion today: missing active role for index/inventory-like document surfaces.
   - Candidate role: `inventory` is plausible and should be considered in a later role-addition slice.

4. `calculogic-validator/doc/ConventionRoutines/naming-interpretation-hardening-transitional.inventory.md`
5. `calculogic-validator/doc/naming-compatibility.inventory.md`
6. `calculogic-validator/doc/ValidatorSpecs/naming-owned/naming-documentation-map-and-reorg.inventory.md`
7. `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md`
   - Responsibility cluster: inventory/map/transition-note docs.
   - Distortion today: they are neither pure `spec` nor pure `audit`.
   - Candidate role: `inventory` is plausible; `note` may also be a secondary candidate when material is explanatory rather than indexed.
   - Recommendation: capture evidence for later role-addition slice; do not add roles now.

## 7. Post-split legacy compatibility scaffolding

1. `calculogic-validator/naming/src/registries/_custom/reportable-extensions.registry.custom.json`
   - Classification: defer to custom registry system.
   - Why: custom overlay compatibility surface; out of #442 scope.

2. `calculogic-validator/naming/src/registries/_custom/roles.registry.custom.json`
   - Classification: defer to custom registry system.
   - Why: same custom overlay lane.

3. `calculogic-validator/naming/src/registries/registry-state.json`
   - Classification: keep for now.
   - Why: current runtime truth uses this state host; removal/rename would change behavior contracts.

4. docs/comments still mentioning grouped-role legacy behavior (suite + naming)
   - Classification: needs more evidence.
   - Why: some transitional references appear intentional; should be validated against current implementation reality before cleanup.

5. tests preserving legacy grouped-role external behavior
   - Classification: keep for now.
   - Why: compatibility guardrails remain useful until explicit deprecation slice is approved.

## 8. Custom-system deferred findings

Deferred explicitly (out of #442):

- `_custom` registry filenames and shape semantics.
- custom registry state initialization/selection UX.
- active registry switching flow and related compatibility policy.

No `_custom` renames are proposed in this slice.

## 9. Tree-deferred findings

Deferred explicitly (out of #442):

- `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md`
- `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-top-root-registry-transition-inventory.md`
- `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md`

Tree registry/runtime interpretation changes are not current runtime truth for this slice and remain deferred.

## 10. Not-worth-touching-yet findings

- Convention authority docs currently flagged by `NAMING_MISSING_ROLE` (`CCPP.md`, `CCS.md`, `FileNamingMasterList-V1_1.md`, `NamingValidatorSpec.md`, etc.): low ROI without a coordinated governance rename pass.
- existing audit history files under `doc/Audits` with legacy names: historical continuity likely more valuable than immediate rename churn.
- test fixture naming anomalies reported in broad scope (`*.system.*`, semantic-case findings): not part of requested focused cleanup scope and often intentionally special-cased.

## 11. Recommended next minimal slices

1. **Minimal slice A (highest confidence):** suite-core naming cleanup for inactive `runtime` role tokens in `src/core` and `src/registries` without behavior changes (rename plan + references update only).
2. **Minimal slice B:** documentation inventory-role evidence pass limited to `doc/Indexes` + naming-owned map/inventory docs, producing a role-governance decision memo (no role addition yet).
3. **Minimal slice C:** custom registry compatibility audit-only deep dive to decide keep-for-now vs eventual extraction path, explicitly outside #442 runtime behavior.

---

Refs #443  
Refs #442
