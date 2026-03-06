# Naming runtime compatibility inventory (transitional)

This note is a lightweight map for the later hardening/removal pass.

## Retired legacy modules
- `SCOPE_PROFILES` retired after runtime/test import audit confirmed no internal consumers; runtime path remains `getBuiltinScopeProfiles()`.
- `EXCLUDED_DIRECTORIES` retired after runtime/test import audit confirmed no internal consumers; runtime path remains `getBuiltinWalkExclusions().excludedDirectories`.
- `BUILTIN_WALK_EXCLUSIONS` retired after runtime/test import audit and consumer repointing to `getBuiltinWalkExclusions()` completed.
- `BUILTIN_SPECIAL_CASE_RULES` retired after runtime/test import audit confirmed no internal consumers; runtime path remains `getBuiltinSpecialCaseRules()`.
- `src/naming/registries/naming-roles.knowledge.mjs` removed after runtime/test import audit confirmed no internal consumers.
- `src/naming/registries/naming-extensions.knowledge.mjs` removed after runtime/test import audit confirmed no internal consumers.

## Compatibility exports retained
- None.

## Registry loader seams
- `naming-special-cases.knowledge.mjs` loaders for special-cases and walk-exclusions registries.
- `naming-case-rules.knowledge.mjs` builtin registry assertions and semantic-name case-rule getter.
- `validator-scopes.knowledge.mjs` builtin scope profile registry loading/normalization.
- `naming-scope-profiles.knowledge.mjs` re-export seam to validator-scope APIs.

## Primary runtime paths
- Getter-backed registry accessors (`getBuiltin*`, `getSemanticNameCaseRule`).
- Resolver-backed builtin registry payload via `resolveNamingRegistryInputs()` + shared runtime converters (`toNamingRolesRuntime`, `toReportableExtensionsSet`) for defaults.
