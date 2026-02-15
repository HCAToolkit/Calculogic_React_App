# cfg-contentResolver – Doc Engine Content Resolver Configuration

This document is a configuration-level NL skeleton for the planned Doc Engine Content Resolver.

## 1. Purpose and Scope
### 1.1 Purpose
Define how raw provider payloads are resolved into normalized `ContentNode` objects for downstream UI and workflow concerns.

### 1.2 Context
Runs as a core domain service behind authoring and navigation components.

### 1.3 Interactions
Accepts provider adapters registered by `cfg-providerRegistry`, emits nodes conforming to `cfg-contentNodeSchema`, and serves filtered results to `cfg-contentDrawer`.

### 1.4 In-Repo Staging Boundary
- Runtime resolver/registry implementation is staged under `src/doc-engine/*` for future package extraction.
- Resolver runtime modules must not import from UI feature directories (`src/components/*`, `src/tabs/*`).

## 2. Configuration Contracts
### 2.1 TypeScript Interfaces
- `ContentResolverRequest` – provider key, scope descriptor, optional query/filter options.
- `ContentResolverResponse` – resolved node collection, diagnostics, and cursor data.
- `ContentResolverState` – cache slots, in-flight status, and error envelope.

### 2.2 Data & State Requirements
- Local state: per-request lifecycle state and cache index.
- Global context: runtime environment flags (preview/live), tenant/workspace ID.
- External data sources: provider adapter fetch methods and optional remote API endpoints.

### 2.3 Dependencies
- Shared utilities: adapter execution helper, validation library, cache utility.
- Async primitives: abort signals and concurrency gate.

## 3. Build Concern (Structure)
### 3.0 Dependencies & Hierarchy Notes
- Primary structure is service-oriented with container-level orchestration and nested subcontainers for stages.

### 3.1 Atomic Components — Containers (Build)
- **[3.1.1] Container – "Resolver Pipeline"**
  - Children: `[3.2.1] Request Intake`, `[3.2.2] Adapter Dispatch`, `[3.2.3] Normalization Stage`, `[3.2.4] Cache Stage`, `[3.2.5] Output Stage`.

### 3.2 Atomic Components — Subcontainers (Build)
- **[3.2.1] Subcontainer – "Request Intake"**
  - Children: `[3.3.1] Request Guard`, `[3.3.2] Scope Parser`.
- **[3.2.2] Subcontainer – "Adapter Dispatch"**
  - Children: `[3.3.3] Adapter Lookup`, `[3.3.4] Adapter Execute`.
- **[3.2.3] Subcontainer – "Normalization Stage"**
  - Children: `[3.3.5] Raw Node Mapper`, `[3.3.6] Schema Validator`.
- **[3.2.4] Subcontainer – "Cache Stage"**
  - Children: `[3.3.7] Cache Read`, `[3.3.8] Cache Write`.
- **[3.2.5] Subcontainer – "Output Stage"**
  - Children: `[3.3.9] Response Composer`.

### 3.3 Atomic Components — Primitives (Build)
- **[3.3.1] Primitive – "Request Guard"**
- **[3.3.2] Primitive – "Scope Parser"**
  - Split namespace parser is exported for contract tests covering valid/invalid `contentId` formats.
- **[3.3.3] Primitive – "Adapter Lookup"**
- **[3.3.4] Primitive – "Adapter Execute"**
- **[3.3.5] Primitive – "Raw Node Mapper"**
- **[3.3.6] Primitive – "Schema Validator"**
- **[3.3.7] Primitive – "Cache Read"**
- **[3.3.8] Primitive – "Cache Write"**
- **[3.3.9] Primitive – "Response Composer"**

## 4. BuildStyle Concern (Visual Styling of Structure)
### 4.0 Dependencies
Not UI-focused; style concern applies only to optional diagnostics visualization.

### 4.1 Atomic Components — Containers / Groups (BuildStyle)
- **[4.1.1] Container – "Resolver Diagnostic Layout"**

### 4.2 Atomic Components — Primitives (BuildStyle)
- **[4.2.1] Primitive – "Stage Badge Styling"**
- **[4.2.2] Primitive – "Latency Meter Styling"**

### 4.3 Responsive Rules
- N/A for non-visual runtime path.

### 4.4 Interaction Styles
- N/A except debug panel interactions if rendered.

## 5. Logic Concern (Workflow)
### 5.0 Dependencies
Promises, abortable operations, schema validation hooks.

### 5.1 Atomic Components — Containers (Logic)
- **[5.1.1] Container – "ContentResolverLogic"** handles full resolve lifecycle.

### 5.2 Atomic Components — Subcontainers (Logic)
- **[5.2.1] Subcontainer – "Resolve Lifecycle"**
- **[5.2.2] Subcontainer – "Error Recovery"**

### 5.3 Atomic Components — Primitives (Logic)
- **[5.3.1] Primitive – "Cache Hit Decision"**
- **[5.3.2] Primitive – "Adapter Invocation"**
- **[5.3.3] Primitive – "Normalization Execution"**
- **[5.3.4] Primitive – "Validation Gate"**
- **[5.3.5] Primitive – "Fallback Resolution"**
- **[5.3.6] Primitive – "Response Emit"**

## 6. Knowledge Concern (Reference Data)
### 6.1 Maps / Dictionaries
- Provider-to-adapter map and node-type normalization map.

### 6.2 Constants
- Cache TTL defaults, retry limits, resolver error codes.

### 6.3 Shared / Global Reference
- Shares schema version and provider capability constants with sibling configs.

## 7. Results Concern (Outputs)
### 7.1 User-Facing Outputs
- Normalized node lists and query cursors.

### 7.2 Dev / Debug Outputs
- Stage timings, adapter warnings, validation error summaries.

### 7.3 Accessibility Outputs
- N/A (service-level concern).

## 8. ResultsStyle Concern (Output Styling)
### 8.1 Results Layout Styles
- Debug timeline/list styling when surfaced in tooling.

### 8.2 Debug Display Styles
- Severity color coding for warnings/errors.

## 9. Assembly Pattern
### 9.1 File Structure
- `src/doc-engine/types.ts`
- `src/doc-engine/registry.ts`
- `src/content/providers/docs.provider.ts`
- `src/content/packs/header-docs/header-docs.catalog.ts`
- `src/doc-engine/index.ts`

### 9.2 Assembly Logic
- Expose resolver factory that wires adapter registry, schema validator, and cache provider.
- App-owned docs catalog and provider are composed from `src/content/*`; doc-engine exports core resolver contracts only.

### 9.3 Integration
- Consumed by UI configs and backend-facing orchestration points.

## 10. Implementation Passes
### 10.1 Pass Mapping
- Pass 0: skeleton + atomic IDs.
- Pass 1: resolver pipeline scaffolding.
- Pass 2: adapter dispatch and normalization.
- Pass 3: caching and retries.
- Pass 4: diagnostics output.

### 10.2 Export Checklist
- Containers/subcontainers/primitives are explicitly enumerated for CCPP mapping.
- All resolver outputs reference `ContentNode` schema contract.
