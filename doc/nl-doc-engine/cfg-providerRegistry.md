# cfg-providerRegistry – Doc Engine Provider Registry Configuration

This document is a configuration-level NL skeleton for the planned Doc Engine Provider Registry.

## 1. Purpose and Scope
### 1.1 Purpose
Define registration, discovery, and capability exposure for all content providers used by the Doc Engine.

### 1.2 Context
Acts as the source of truth for which providers exist, how they are resolved, and what feature flags they support.

### 1.3 Interactions
Supplies adapter references to `cfg-contentResolver`, contributes filter metadata to `cfg-contentDrawer`, and aligns provider payload contracts with `cfg-contentNodeSchema`.

## 2. Configuration Contracts
### 2.1 TypeScript Interfaces
- `ProviderDefinition` – ID, display metadata, adapter factory, capability flags.
- `ProviderRegistry` – methods to register, unregister, list, and resolve providers.
- `ProviderCapability` – typed feature flags (searchable, hierarchical, paginated, etc.).

### 2.2 Data & State Requirements
- Local state: registry map keyed by provider ID.
- Global context: environment permissions and rollout flags.
- External data sources: optional runtime extension manifests.

### 2.3 Dependencies
- Shared utilities: semantic version matcher, schema compatibility checker.
- Optional persistence: local storage or bootstrap config for default providers.

## 3. Build Concern (Structure)
### 3.0 Dependencies & Hierarchy Notes
- Service-centric structure with one root container and subcontainers for lifecycle and querying paths.

### 3.1 Atomic Components — Containers (Build)
- **[3.1.1] Container – "Registry Core"**
  - Children: `[3.2.1] Registration Lane`, `[3.2.2] Discovery Lane`, `[3.2.3] Compatibility Lane`.

### 3.2 Atomic Components — Subcontainers (Build)
- **[3.2.1] Subcontainer – "Registration Lane"**
  - Children: `[3.3.1] Provider Register Primitive`, `[3.3.2] Provider Unregister Primitive`.
- **[3.2.2] Subcontainer – "Discovery Lane"**
  - Children: `[3.3.3] Provider List Primitive`, `[3.3.4] Provider Lookup Primitive`.
- **[3.2.3] Subcontainer – "Compatibility Lane"**
  - Children: `[3.3.5] Capability Match Primitive`, `[3.3.6] Version Gate Primitive`.

### 3.3 Atomic Components — Primitives (Build)
- **[3.3.1] Primitive – "Provider Register Primitive"**
- **[3.3.2] Primitive – "Provider Unregister Primitive"**
- **[3.3.3] Primitive – "Provider List Primitive"**
- **[3.3.4] Primitive – "Provider Lookup Primitive"**
- **[3.3.5] Primitive – "Capability Match Primitive"**
- **[3.3.6] Primitive – "Version Gate Primitive"**

## 4. BuildStyle Concern (Visual Styling of Structure)
### 4.0 Dependencies
Only relevant when exposing registry status in tooling UIs.

### 4.1 Atomic Components — Containers / Groups (BuildStyle)
- **[4.1.1] Container – "Registry Status Panel Styling"**

### 4.2 Atomic Components — Primitives (BuildStyle)
- **[4.2.1] Primitive – "Provider Chip Styling"**
- **[4.2.2] Primitive – "Capability Badge Styling"**

### 4.3 Responsive Rules
- Collapse capability grid to stacked list on narrow widths.

### 4.4 Interaction Styles
- Hover/focus for provider rows and expand actions.

## 5. Logic Concern (Workflow)
### 5.0 Dependencies
Map/set operations, validation guards, optional event emitter for registry change notifications.

### 5.1 Atomic Components — Containers (Logic)
- **[5.1.1] Container – "ProviderRegistryLogic"**

### 5.2 Atomic Components — Subcontainers (Logic)
- **[5.2.1] Subcontainer – "Mutation Workflow"**
- **[5.2.2] Subcontainer – "Query Workflow"**

### 5.3 Atomic Components — Primitives (Logic)
- **[5.3.1] Primitive – "Register Validation"**
- **[5.3.2] Primitive – "Registry Mutation"**
- **[5.3.3] Primitive – "Capability Filtering"**
- **[5.3.4] Primitive – "Compatibility Evaluation"**
- **[5.3.5] Primitive – "Change Notification Emit"**

## 6. Knowledge Concern (Reference Data)
### 6.1 Maps / Dictionaries
- Canonical provider IDs, capability descriptions, deprecation aliases.

### 6.2 Constants
- Registry event names, default provider list, compatibility policy version.
- App-level singleton registry initialized in `src/content/contentEngine.ts` with explicit `docs` namespace registration.

### 6.3 Shared / Global Reference
- Exports provider metadata used by resolver and drawer.

## 7. Results Concern (Outputs)
### 7.1 User-Facing Outputs
- Provider list and capability summaries for selector UIs.

### 7.2 Dev / Debug Outputs
- Warnings for duplicate IDs, version mismatch notices.

### 7.3 Accessibility Outputs
- N/A for core service; panel outputs should include aria labels when rendered.

## 8. ResultsStyle Concern (Output Styling)
### 8.1 Results Layout Styles
- Tabular/list layout for registry diagnostics.

### 8.2 Debug Display Styles
- Color coding for healthy/degraded/disabled provider states.

## 9. Assembly Pattern
### 9.1 File Structure
- `src/docEngine/providerRegistry/ProviderRegistry.build.ts`
- `src/docEngine/providerRegistry/ProviderRegistry.logic.ts`
- `src/docEngine/providerRegistry/ProviderRegistry.knowledge.ts`
- `src/docEngine/providerRegistry/ProviderRegistry.results.ts`
- `src/content/contentEngine.ts`

### 9.2 Assembly Logic
- Factory initializes defaults, then merges extension providers with policy checks.

### 9.3 Integration
- Instantiated at the application composition root before resolver boot so adapter lookup is available at runtime.
- Module exports remain side-effect free; provider registration is performed explicitly by the consumer/composition layer.

## 10. Implementation Passes
### 10.1 Pass Mapping
- Pass 0: skeleton and atomic taxonomy.
- Pass 1: registration/discovery primitives.
- Pass 2: compatibility and capability logic.
- Pass 3: diagnostics and tooling views.

### 10.2 Export Checklist
- Atomic hierarchy is explicit for CCPP annotation mapping.
- Provider definitions include schema compatibility metadata.
