# cfg-contentNodeSchema – Doc Engine ContentNode Schema Configuration

This document is a configuration-level NL skeleton for the planned Doc Engine `ContentNode` schema contract.

## 1. Purpose and Scope
### 1.1 Purpose
Define the canonical ContentNode structure, validation rules, and compatibility boundaries used across the Doc Engine.

### 1.2 Context
Serves as the core schema referenced by resolver, registry, and UI configurations.

### 1.3 Interactions
Validated by `cfg-contentResolver`, referenced by `cfg-contentDrawer` renderers, and version-aligned with `cfg-providerRegistry` capabilities.

## 2. Configuration Contracts
### 2.1 TypeScript Interfaces
- `ContentNode` – ID, type, title, payload, lineage, metadata, and children pointers.
- `ContentNodeRef` – lightweight reference object for cross-links.
- `ContentNodeValidationResult` – validity boolean and issue list.
- `ContentNodeSchemaVersion` – semantic version object.

### 2.2 Data & State Requirements
- Local state: none (schema is primarily declarative).
- Global context: active schema version and compatibility mode.
- External data sources: optional migration definitions for legacy node formats.

### 2.3 Dependencies
- Validation utility library and type guards.
- Serialization helpers for storage/transport boundaries.

## 3. Build Concern (Structure)
### 3.0 Dependencies & Hierarchy Notes
- Root schema container groups field domains and reusable substructures.

### 3.1 Atomic Components — Containers (Build)
- **[3.1.1] Container – "ContentNode Schema Root"**
  - Children: `[3.2.1] Identity Block`, `[3.2.2] Taxonomy Block`, `[3.2.3] Payload Block`, `[3.2.4] Relationship Block`, `[3.2.5] Metadata Block`.

### 3.2 Atomic Components — Subcontainers (Build)
- **[3.2.1] Subcontainer – "Identity Block"**
  - Children: `[3.3.1] Node ID Field`, `[3.3.2] Node Ref Field`.
- **[3.2.2] Subcontainer – "Taxonomy Block"**
  - Children: `[3.3.3] Node Type Field`, `[3.3.4] Node Title Field`.
- **[3.2.3] Subcontainer – "Payload Block"**
  - Children: `[3.3.5] Payload Field`, `[3.3.6] Payload Kind Field`.
- **[3.2.4] Subcontainer – "Relationship Block"**
  - Children: `[3.3.7] Parent Ref Field`, `[3.3.8] Children Ref List Field`.
- **[3.2.5] Subcontainer – "Metadata Block"**
  - Children: `[3.3.9] Source Provider Field`, `[3.3.10] Version Stamp Field`, `[3.3.11] Timestamp Field`.

### 3.3 Atomic Components — Primitives (Build)
- **[3.3.1] Primitive – "Node ID Field"**
- **[3.3.2] Primitive – "Node Ref Field"**
- **[3.3.3] Primitive – "Node Type Field"**
- **[3.3.4] Primitive – "Node Title Field"**
- **[3.3.5] Primitive – "Payload Field"**
- **[3.3.6] Primitive – "Payload Kind Field"**
- **[3.3.7] Primitive – "Parent Ref Field"**
- **[3.3.8] Primitive – "Children Ref List Field"**
- **[3.3.9] Primitive – "Source Provider Field"**
- **[3.3.10] Primitive – "Version Stamp Field"**
- **[3.3.11] Primitive – "Timestamp Field"**

## 4. BuildStyle Concern (Visual Styling of Structure)
### 4.0 Dependencies
Applies when rendering schema docs/tables in internal tooling.

### 4.1 Atomic Components — Containers / Groups (BuildStyle)
- **[4.1.1] Container – "Schema Table Layout Styling"**

### 4.2 Atomic Components — Primitives (BuildStyle)
- **[4.2.1] Primitive – "Field Name Styling"**
- **[4.2.2] Primitive – "Type Signature Styling"**
- **[4.2.3] Primitive – "Constraint Note Styling"**

### 4.3 Responsive Rules
- Convert wide field table to card rows on small viewports.

### 4.4 Interaction Styles
- Highlight row on hover/focus in schema explorer.

## 5. Logic Concern (Workflow)
### 5.0 Dependencies
Type guards, validation pipeline, migration dispatcher.

### 5.1 Atomic Components — Containers (Logic)
- **[5.1.1] Container – "ContentNodeSchemaLogic"**

### 5.2 Atomic Components — Subcontainers (Logic)
- **[5.2.1] Subcontainer – "Validation Workflow"**
- **[5.2.2] Subcontainer – "Migration Workflow"**

### 5.3 Atomic Components — Primitives (Logic)
- **[5.3.1] Primitive – "Required Field Check"**
- **[5.3.2] Primitive – "Type Constraint Check"**
- **[5.3.3] Primitive – "Relationship Integrity Check"**
- **[5.3.4] Primitive – "Schema Version Detection"**
- **[5.3.5] Primitive – "Migration Transform"**
- **[5.3.6] Primitive – "Validation Result Emit"**

## 6. Knowledge Concern (Reference Data)
### 6.1 Maps / Dictionaries
- Node type enum map, payload-kind map, relationship constraint map.

### 6.2 Constants
- Current schema version, supported legacy versions, maximum depth constraints.

### 6.3 Shared / Global Reference
- Imported by resolver and provider registry to enforce contract compatibility.

## 7. Results Concern (Outputs)
### 7.1 User-Facing Outputs
- Validation results surfaced as success/error summaries in tooling.

### 7.2 Dev / Debug Outputs
- Detailed field-level issue list and migration trace.

### 7.3 Accessibility Outputs
- Semantic labels for schema issue summaries when displayed in UI.

## 8. ResultsStyle Concern (Output Styling)
### 8.1 Results Layout Styles
- Structured list styling for validation issues grouped by field.

### 8.2 Debug Display Styles
- Monospace block styling for migration trace output.

## 9. Assembly Pattern
### 9.1 File Structure
- `src/docEngine/contentNodeSchema/ContentNodeSchema.build.ts`
- `src/docEngine/contentNodeSchema/ContentNodeSchema.logic.ts`
- `src/docEngine/contentNodeSchema/ContentNodeSchema.knowledge.ts`
- `src/docEngine/contentNodeSchema/ContentNodeSchema.results.ts`

### 9.2 Assembly Logic
- Exports type contracts, validator, and migration helpers from a single public index.

### 9.3 Integration
- Consumed by provider adapters and resolver before node output is published.

## 10. Implementation Passes
### 10.1 Pass Mapping
- Pass 0: skeleton and atomic IDs.
- Pass 1: type contracts and constants.
- Pass 2: validator implementation.
- Pass 3: migration support and diagnostics.

### 10.2 Export Checklist
- Container/subcontainer/primitive taxonomy is complete for CCPP atomic comment mapping.
- Schema versioning and compatibility rules are explicitly defined.
