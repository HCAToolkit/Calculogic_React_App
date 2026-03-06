# Naming runtime compatibility inventory (transitional)

This note is a lightweight map for the later hardening/removal pass.

## Retired legacy modules
- `src/naming/registries/naming-roles.knowledge.mjs` removed after runtime/test import audit confirmed no internal consumers.
- `src/naming/registries/naming-extensions.knowledge.mjs` removed after runtime/test import audit confirmed no internal consumers.

## Compatibility exports retained
- `SCOPE_PROFILES` (snapshot compatibility export; primary runtime path is `getBuiltinScopeProfiles()`).
- `BUILTIN_SPECIAL_CASE_RULES` (snapshot compatibility export; primary runtime path is `getBuiltinSpecialCaseRules()`).
- `BUILTIN_WALK_EXCLUSIONS` (snapshot compatibility export; primary runtime path is `getBuiltinWalkExclusions()`).
- `EXCLUDED_DIRECTORIES` (legacy data export retained temporarily; primary runtime path is `getBuiltinWalkExclusions().excludedDirectories`).
- `CANONICAL_SEMANTIC_PATTERN` (compatibility export; primary runtime path is `getSemanticNameCaseRule().pattern`).

## Registry loader seams
- `naming-special-cases.knowledge.mjs` loaders for special-cases and walk-exclusions registries.
- `naming-case-rules.knowledge.mjs` builtin registry assertions.
- `validator-scopes.knowledge.mjs` builtin scope profile registry loading/normalization.
- `naming-scope-profiles.knowledge.mjs` re-export seam to validator-scope APIs.

## Primary runtime paths
- Getter-backed registry accessors (`getBuiltin*`, `getSemanticNameCaseRule`).
- Resolver-backed builtin registry payload via `resolveNamingRegistryInputs()` + shared runtime converters (`toNamingRolesRuntime`, `toReportableExtensionsSet`) for defaults.
