# Persistence Contract Stability Pass — Inventory and Targeted Hardening

## Scope
- Repo scan commands:
  - `rg -n "localStorage|sessionStorage|persist|storage" src`
  - `rg -n "localStorage|sessionStorage" src`
- Storage APIs discovered: `localStorage` only (no `sessionStorage` usage in `src/`).

## Repo-wide persistence inventory

| Storage key | File paths / symbols | Owner | Purpose | Payload shape | Defaults / fallback | Validation/parsing | Bounds / clamping | Versioning | Risk notes |
|---|---|---|---|---|---|---|---|---|---|
| `section-configurations-state` | `src/tabs/build/BuildSurface.logic.ts` (`useBuildSurfaceLogic`, `useSectionLogic`) | Build tab logic | Persist Configurations section height/collapsed state | JSON object `{ version, height, collapsed }` | Fallback `{ version:1, height:180, collapsed:false }` | `parseSectionStatePayload` in `src/tabs/build/buildSurfacePersistence.contracts.ts` | Height clamped to `[32, parentHeight - 64]`; toggle restore min `120` | Versioned (`version:1`) with legacy unversioned upgrade | Read-on-init key; malformed/legacy/version drift risks; now includes explicit fallback reason codes. |
| `section-atomic-components-state` | `src/tabs/build/BuildSurface.logic.ts` (`useBuildSurfaceLogic`, `useSectionLogic`) | Build tab logic | Persist Atomic Components section height/collapsed state | JSON object `{ version, height, collapsed }` | Fallback `{ version:1, height:260, collapsed:false }` | `parseSectionStatePayload` in `buildSurfacePersistence.contracts.ts` | Height clamped to `[32, parentHeight - 64]`; toggle restore min `120` | Versioned (`version:1`) with legacy unversioned upgrade | Same contract path as above; highest risk due to init-time usage and JSON shape. |
| `section-search-configurations-state` | `src/tabs/build/BuildSurface.logic.ts` (`useBuildSurfaceLogic`, `useSectionLogic`) | Build tab logic | Persist Search Configurations section height/collapsed state | JSON object `{ version, height, collapsed }` | Fallback `{ version:1, height:180, collapsed:false }` | `parseSectionStatePayload` in `buildSurfacePersistence.contracts.ts` | Height clamped to `[32, parentHeight - 64]`; toggle restore min `120` | Versioned (`version:1`) with legacy unversioned upgrade | Same high-risk section contract family; now hardened centrally. |
| `right-panel-state` | `src/tabs/build/BuildSurface.logic.ts` (`useRightPanelLogic`) | Build tab logic | Persist inspector width/collapsed state | JSON object `{ version, width, collapsed }` | Fallback `{ version:1, width:320, collapsed:false }` | `parseRightPanelStatePayload` in `buildSurfacePersistence.contracts.ts` | Width clamped to `[40, max(160, innerWidth - 320)]`; toggle collapsed width `40`; expanded restore min `200` | Versioned (`version:1`) with legacy unversioned upgrade | Read-on-init JSON contract; version drift can break init if not guarded. |
| `left-panel-width` | `src/tabs/build/BuildSurface.logic.ts` (`useLeftPanelLogic`) | Build tab logic | Persist catalog width | Primitive numeric string (e.g. `"320"`) | Fallback `320` | Inline `Number(raw)` + finite guard in `useLeftPanelLogic` | Width clamped to `[160, max(160, innerWidth - 320)]` | Unversioned primitive by design | Lower-risk scalar contract; intentionally unchanged this pass. |

## Risk ranking
1. `right-panel-state` — JSON object, read on init, version-sensitive.
2. `section-*-state` family — JSON object, read on init, shared parser path used by 3 keys.
3. `left-panel-width` — scalar string with simple finite-number guard.

## Selected targets in this PR
- `right-panel-state` (`parseRightPanelStatePayload` path).
- `section-*-state` family (`parseSectionStatePayload` path).

### Rationale
- Highest risk by prioritization rules: JSON object payloads + read-on-init contracts + shared parser logic.
- Small-scope consolidation opportunity already existed (`parsePayloadContract`), so hardening could be done with low churn in owner module.

## Hardening implemented
- Added explicit fallback reason taxonomy: `malformed-json`, `unsupported-version`, `invalid-shape`.
- Added `wasMigrated` metadata to parse result for explicit legacy-upgrade observability.
- Added explicit unsupported-version detection with reset-to-default behavior.
- Preserved legacy unversioned JSON upgrade behavior for backward compatibility.

## Intentionally unchanged
- `left-panel-width` remains primitive numeric string.
- Why unchanged: it is a simple scalar with existing finite guard + clamp and does not currently need schema metadata; migrating to JSON in this pass would add churn without commensurate risk reduction.

## Recommended next persistence targets
1. Extract left-panel numeric parsing into `buildSurfacePersistence.contracts.ts` for uniform diagnostics (`reasonCode`) while keeping primitive storage shape.
2. Add optional dev-only telemetry aggregation for persistence fallbacks across Build-surface keys to detect contract drift patterns.
3. If future fields are required for left panel, migrate `left-panel-width` to versioned object with explicit legacy string upgrade path.
