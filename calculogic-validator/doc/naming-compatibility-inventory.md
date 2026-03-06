# Naming runtime compatibility inventory (transitional)

This note is a lightweight map for the later hardening/removal pass.

## Retired legacy modules
- `SCOPE_PROFILES` retired after runtime/test import audit confirmed no internal consumers; runtime path remains `getBuiltinScopeProfiles()`.
- `EXCLUDED_DIRECTORIES` retired after runtime/test import audit confirmed no internal consumers; runtime path remains `getBuiltinWalkExclusions().excludedDirectories`.
- `BUILTIN_WALK_EXCLUSIONS` retired after runtime/test import audit and consumer repointing to `getBuiltinWalkExclusions()` completed.
- `BUILTIN_SPECIAL_CASE_RULES` retired after runtime/test import audit confirmed no internal consumers; runtime path remains `getBuiltinSpecialCaseRules()`.
- `src/naming/registries/naming-roles.knowledge.mjs` removed after runtime/test import audit confirmed no internal consumers.
- `src/naming/registries/naming-extensions.knowledge.mjs` removed after runtime/test import audit confirmed no internal consumers.
- `src/naming/registries/naming-scope-profiles.knowledge.mjs` removed after runtime/test import audit + consumer repointing to `src/validator-scopes.runtime.mjs`.

## Compatibility exports retained
- None.

## Registry loader seams
- `src/naming/registries/naming-special-cases.knowledge.mjs` removed after runtime/test import audit + consumer repointing to dedicated runtime-owner loader modules (`naming-special-case-rules.registry.logic.mjs`, `naming-walk-exclusions.registry.logic.mjs`).
- `src/naming/registries/naming-case-rules.knowledge.mjs` removed after runtime/test import audit + consumer repointing to `src/naming/rules/naming-rule-check-semantic-case.logic.mjs`.
- `validator-scopes.runtime.mjs` is kept as the canonical validator-owned runtime owner for builtin scope profiles; getter-backed runtime APIs (`getBuiltinScopeProfiles`, `listValidatorScopes`, `getValidatorScopeProfile`) are the primary contract. The prior `.knowledge` filename/path was retired in a churn-managed rename-only pass; canonical runtime ownership and behavior are unchanged in this slice.

## Primary runtime paths
- Getter-backed registry accessors (`getBuiltin*`, `getSemanticNameCaseRule`).
- Resolver-backed builtin registry payload via `resolveNamingRegistryInputs()` + shared runtime converters (`toNamingRolesRuntime`, `toReportableExtensionsSet`) for defaults.
