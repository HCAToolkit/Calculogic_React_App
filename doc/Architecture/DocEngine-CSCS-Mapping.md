# Doc Engine ↔ CSCS Concern Mapping

This note defines how **doc-engine modules** map to CSCS concerns so file naming and layer boundaries stay consistent.

## 1) Mapping Table

| CSCS Concern | Doc-engine modules | Scope |
| --- | --- | --- |
| **Build** | `drawer`, `renderer` | UI composition, anchors, visible structure only. |
| **Logic** | `resolver`, `providerRegistry`, `useOrchestration*` hooks | Dependency resolution, provider lookup, orchestration flow/state. |
| **Knowledge** | `contentCatalog*`, `contentSchema*`, `*Definition*` | Static catalogs, schema contracts, declarative definitions. |
| **Results** | `diagnostics*`, `telemetry*` surfaces | Read-only debug/readout output (if present). |

## 2) File Naming Rules

Use concern-first suffixes to make ownership obvious:

- Build: `*.build.tsx` (or `*.build.ts` for non-React helpers)
- Logic: `*.logic.ts` / `*.logic.tsx`
- Knowledge: `*.knowledge.ts`
- Results: `*.results.ts` / `*.results.tsx`

For doc-engine module names, keep the concern signal in the base name:

- Build examples: `DocEngineDrawer.build.tsx`, `DocEngineRenderer.build.tsx`
- Logic examples: `DocEngineResolver.logic.ts`, `DocEngineProviderRegistry.logic.ts`, `useDocEngineOrchestration.logic.ts`
- Knowledge examples: `DocEngineContentCatalog.knowledge.ts`, `DocEngineContentSchema.knowledge.ts`, `DocEngineDefinitions.knowledge.ts`
- Results examples: `DocEngineDiagnostics.results.tsx`, `DocEngineTelemetry.results.ts`

## 3) Layering Guardrails

- **Build** may render structure and anchors; it must not resolve providers or mutate orchestration state.
- **Logic** may compute and coordinate behavior; it must not define copy catalogs or schemas.
- **Knowledge** is declarative-only (catalog/schema/definitions); it must not run orchestration.
- **Results** is readout-only diagnostics/telemetry; it must not feed state back into Logic.

## 4) Dependency Direction (enforced)

- Build can depend on Logic + Knowledge for inputs.
- Logic can depend on Knowledge.
- Results can depend on Logic + Knowledge.
- Knowledge depends on none of the other concerns.
- No upward/cyclic flow (especially `Results -> Logic`).

Use this file as the naming + review checklist for any new doc-engine modules.
