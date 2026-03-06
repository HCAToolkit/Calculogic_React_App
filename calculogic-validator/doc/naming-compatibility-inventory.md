# Naming runtime compatibility inventory (transitional)

This note is a lightweight map for the later hardening/removal pass.

## Retired legacy modules
- `SCOPE_PROFILES` retired after runtime/test import audit confirmed no internal consumers; runtime path remains `getBuiltinScopeProfiles()`.
- `EXCLUDED_DIRECTORIES` retired after runtime/test import audit confirmed no internal consumers; runtime path remains `getBuiltinWalkExclusions().excludedDirectories`.
- `BUILTIN_WALK_EXCLUSIONS` retired after runtime/test import audit and consumer repointing to `getBuiltinWalkExclusions()` completed.
- `BUILTIN_SPECIAL_CASE_RULES` retired after runtime/test import audit confirmed no internal consumers; runtime path remains `getBuiltinSpecialCaseRules()`.
- `src/naming/registries/naming-roles.knowledge.mjs` removed after runtime/test import audit confirmed no internal consumers.
- `src/naming/registries/naming-extensions.knowledge.mjs` removed after runtime/test import audit confirmed no internal consumers.
- `src/naming/registries/naming-scope-profiles.knowledge.mjs` removed after runtime/test import audit + consumer repointing to `src/validator-scopes.knowledge.mjs`.

## Compatibility exports retained
- None.

## Registry loader seams
- `src/naming/registries/naming-special-cases.knowledge.mjs` removed after runtime/test import audit + consumer repointing to dedicated runtime-owner loader modules (`naming-special-case-rules.registry.logic.mjs`, `naming-walk-exclusions.registry.logic.mjs`).
- `src/naming/registries/naming-case-rules.knowledge.mjs` removed after runtime/test import audit + consumer repointing to `src/naming/rules/naming-rule-check-semantic-case.logic.mjs`.
- `validator-scopes.knowledge.mjs` retained-path validator-owned registry/runtime seam for builtin scope profiles; primary runtime access is getter-backed (`getBuiltinScopeProfiles`, `listValidatorScopes`, `getValidatorScopeProfile`) and the `.knowledge` filename is intentionally kept to avoid broad import churn.

## Primary runtime paths
- Getter-backed registry accessors (`getBuiltin*`, `getSemanticNameCaseRule`).
- Resolver-backed builtin registry payload via `resolveNamingRegistryInputs()` + shared runtime converters (`toNamingRolesRuntime`, `toReportableExtensionsSet`) for defaults.
