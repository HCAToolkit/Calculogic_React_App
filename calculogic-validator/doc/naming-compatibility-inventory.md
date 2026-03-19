# Naming runtime compatibility inventory (transitional)

Status/Authority:
- **Status:** Transitional inventory (current migration snapshot).
- **Authority level:** Transitional inventory (non-canonical).
- **Intended use:** Track naming-runtime compatibility retirements/repointing and route follow-up hardening work.
- **Does not control:** Runtime behavior contracts, naming taxonomy authority, validator config semantics, or CLI exit policy semantics.
- **Defer to (if conflict):**
  - `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md` (canonical naming slice spec)
  - `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md` (canonical naming grammar/taxonomy authority)
  - `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md` (suite contract authority)
  - `calculogic-validator/doc/ValidatorSpecs/validator-config.spec.md` (config contract authority)

This note is a lightweight transitional map for later hardening/removal follow-up.

## Retired legacy modules
- `SCOPE_PROFILES` retired after runtime/test import audit confirmed no internal consumers; runtime path remains `getBuiltinScopeProfiles()`.
- `EXCLUDED_DIRECTORIES` retired after runtime/test import audit confirmed no internal consumers; runtime path remains `getBuiltinWalkExclusions().excludedDirectories`.
- `BUILTIN_WALK_EXCLUSIONS` retired after runtime/test import audit and consumer repointing to `getBuiltinWalkExclusions()` completed.
- `BUILTIN_SPECIAL_CASE_RULES` retired after runtime/test import audit confirmed no internal consumers; runtime path remains `getBuiltinSpecialCaseRules()`.
- `naming/src/registries/naming-roles.knowledge.mjs` removed after runtime/test import audit confirmed no internal consumers.
- `naming/src/registries/naming-extensions.knowledge.mjs` removed after runtime/test import audit confirmed no internal consumers.
- `naming/src/registries/naming-scope-profiles.knowledge.mjs` removed after runtime/test import audit + consumer repointing to `src/core/validator-scopes.runtime.mjs`.

## Compatibility exports retained
- None.

## Registry loader seams
- `naming/src/registries/naming-special-cases.knowledge.mjs` removed after runtime/test import audit + consumer repointing to dedicated runtime-owner loader modules (`naming-special-case-rules.registry.logic.mjs`, `naming-walk-exclusions.registry.logic.mjs`).
- `naming/src/registries/naming-case-rules.knowledge.mjs` removed after runtime/test import audit + consumer repointing to `naming/src/rules/naming-rule-check-semantic-case.logic.mjs`.
- `core/validator-scopes.runtime.mjs` is kept as the canonical validator-owned runtime owner for builtin scope profiles; getter-backed runtime APIs (`getBuiltinScopeProfiles`, `listValidatorScopes`, `getValidatorScopeProfile`) are the primary contract. The prior `.knowledge` filename/path was retired in a churn-managed rename-only pass; canonical runtime ownership and behavior are unchanged in this slice.

## Primary runtime paths
- Getter-backed registry accessors (`getBuiltin*`, `getSemanticNameCaseRule`).
- Resolver-backed builtin registry payload via `resolveNamingRegistryInputs()` + shared runtime converters (`toNamingRolesRuntime`, `toReportableExtensionsSet`) for defaults.
