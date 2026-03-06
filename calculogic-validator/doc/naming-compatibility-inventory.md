# Naming runtime compatibility inventory (transitional)

This note is a lightweight map for the later hardening/removal pass.

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
- `ROLE_REGISTRY` and `REPORTABLE_EXTENSIONS` as direct runtime policy defaults.
