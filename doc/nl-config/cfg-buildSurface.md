# cfg-buildSurface – Build Surface Configuration

This document is an instance of the Configuration-Level NL Skeleton defined in ../ConventionRoutines/General-NL-Skeletons.md.

## Transition Migration Status (Build Surface NL Split)
- **NL Migration Mode:** `hybrid-forwarding`
- **State:** Planned / transition-ready scaffolding active.
- **Current canonical source:** This monolithic `cfg-buildSurface.md` document remains the authoritative NL reference until split migration slices are explicitly repointed.
- **Planned direction:** Introduce semantic split-canonical NL documents for Build Surface concerns and interaction slices while preserving section/provenance continuity.
- **Truthfulness rule:** Mapping rows and target statuses must reflect actual migration state; do not mark slices as migrated until corresponding split docs are written and validated.
- **Mode meaning:** `hybrid-forwarding` means this monolith remains canonical for current content while also serving as a transition wrapper/index for planned split-canonical targets.

## Canonical Split NL Targets (Planned / In-Progress)
> Placeholder index for semantic split targets. Entries remain non-canonical until explicitly marked repointed.
> Naming note: placeholder row filenames below are illustrative semantic examples only (planning vocabulary), not final segment-style commitments.
> Provisional pattern note: `cfg-buildSurface-<semantic-slice>.md` is a shape-level placeholder (semantic-first, low-churn). Exact segment style remains subject to convention/policy authority before the first repointed slice (`doc/ConventionRoutines/FileNamingMasterList-V1_1.md`, `doc/ConventionRoutines/NL-SplitMigrationAndNumberingPolicy.md`).
> Binding-level note: **Binding Level** classifies row authoritativeness (`placeholder`/`planned`/`provisional`/`canonical`/`retired`) and is separate from migration lifecycle status.

| Target NL Doc (planned) | Scope Intent | Migration status | Binding Level | Notes |
|---|---|---|---|---|
| `doc/nl-config/cfg-buildSurface-layoutAndAnchors.md` | Build/BuildStyle layout anchors and panel topology | planned | placeholder | Placeholder only in this pass |
| `doc/nl-config/cfg-buildSurface-panelStateAndPersistence.md` | Logic + Knowledge for resize/collapse persistence | planned | placeholder | Placeholder only in this pass |
| `doc/nl-config/cfg-buildSurface-previewAndInspectorFlows.md` | Preview controls + inspector behavioral workflows | planned | placeholder | Placeholder only in this pass |

## Legacy-to-Canonical Mapping Scaffold
> Slice-by-slice migration tracker. Use one row per migrated section group; keep provenance explicit.
> Placeholder target labels in this table are planning scaffolds only and should be finalized per convention/policy authority before repointed status is claimed; they follow the same temporary, non-authoritative guidance class as the canonical-target placeholder examples above.
> Migration lifecycle status and binding level are intentionally tracked as separate dimensions in this scaffold.

| Legacy section(s) in `cfg-buildSurface.md` | Canonical split target | Migration status (`planned`/`in-progress`/`repointed`/`retired`) | Binding Level | Provenance / continuity notes |
|---|---|---|---|---|
| `3.x` (Build concern) | `TBD semantic split doc` | planned | placeholder | Preserve direct traceability to existing `[3.*]` atoms |
| `4.x` (BuildStyle concern) | `TBD semantic split doc` | planned | placeholder | Keep selector/anchor provenance tied to migrated Build slices |
| `5.x–6.x` (Logic + Knowledge) | `TBD semantic split doc` | planned | placeholder | Keep persistence parser/version history references intact |
| `7.x–8.x` (Results + ResultsStyle) | `TBD semantic split doc` | planned | placeholder | Repoint only when output contracts are fully documented |

## Monolith Behavior During Migration
- This document currently acts as both:
  - the **temporary source of truth** for Build Surface NL content, and
  - a **transition wrapper/index** for upcoming semantic split-canonical NL docs.
- During migration, sections may be incrementally forwarded/repointed to split docs, but unchanged sections continue to be read directly from this monolith.
- Retirement rule: this monolith should be retired only after all mapped slices are repointed with explicit provenance continuity and no unresolved placeholders remain.

## 1. Purpose and Scope
### 1.1 Purpose
Present the Calculogic Build tab surface, including navigation chrome, the catalog of configuration panels, the preview canvas, and the inspector column.

### 1.2 Context
Mounted within cfg-appFrame and displayed when the Build tab is active inside shell-globalHeader navigation.

### 1.3 Interactions
Coordinates with shell-globalHeader for tab selection, exposes anchors to shell-spaHost for layout sizing, and consumes bindings from its Logic concern for interactive affordances.

## 2. Configuration Contracts
### 2.1 TypeScript Interfaces
- `BuildSurfaceProps` – Props for initial section ordering, persisted dimensions, and injection points for nested configs.
- `SectionBinding` – Contract describing collapse, grip, and content anchors for each catalog section.
- `BuildSurfaceBindings` – Aggregate binding object returned by Logic for Build to consume.

### 2.2 Data & State Requirements
- Local state: Panel widths/heights, collapse states per section, hover/focus state for grips.
- Global context: Theme tokens inherited from cfg-appFrame; routing context determines active tab.
- External data sources: `localStorage` for persistence of dimensions and collapse preferences.
- Persistence payload contract: section/right-panel state uses versioned JSON payloads (`{ version: 1, ... }`) while readers continue to accept legacy unversioned JSON during migration.
- Parser diagnostics contract: section/right-panel parsers emit explicit fallback reasons (`malformed-json`, `unsupported-version`, `invalid-shape`) so read wrappers can report non-fatal, diagnosable reset paths.
- Left panel width intentionally remains the legacy primitive numeric string contract (`"<width>"`) to avoid unnecessary migration churn for a single scalar value; migrate to versioned JSON only when left-panel persistence needs additional fields/metadata.

### 2.3 Dependencies
- UI libs: React, including `useState`, `useEffect`, and refs for DOM measurements.
- Routing: shell-globalHeader tab state (read-only).
- Shared hooks / utilities: `src/shared/interaction/usePointerDrag.ts` for pointer drag lifecycle + capture and `src/shared/interaction/pointerDrag.ts` clamp helpers for panel bounds.

## 3. Build Concern (Structure)
### 3.0 Dependencies & Hierarchy Notes
- Requires anchors from cfg-appFrame for outer shell mounting.
- Owns all `builder-*` anchors consumed by downstream concerns.
- Reading / implementation guide: Implement Build first, then BuildStyle, Logic, Knowledge, Results, and ResultsStyle in numeric order to maintain anchor fidelity.

### 3.1 Atomic Components — Containers (Build)
- **[3.1.1] Container – "Build Tab Forwarder"**
  - Catalog base: layout.shell
  - Responsibility: Barrel export that keeps `src/tabs/BuildTab.tsx` stable while delegating to the build folder.
- **[3.1.2] Container – "Build Surface Layout"**
  - Catalog base: layout.split
  - Anchor: `data-anchor="builder-root"`
  - Children: `[3.2.1] Build Surface Composer`, `[3.2.2] Header Chrome`, `[3.2.3] Catalog Column`, `[3.2.4] Preview Stage`, `[3.2.5] Inspector Column`.

### 3.2 Atomic Components — Subcontainers (Build)
- **[3.2.1] Subcontainer – "Build Surface Composer"**
  - Location: src/tabs/build/index.tsx
  - Purpose: Default export binding Logic to Build surface view.
- **[3.2.2] Subcontainer – "Header Chrome"**
  - Anchor: `data-anchor="builder-header"`
  - Children: tab list, publish CTA, header title.
- **[3.2.3] Subcontainer – "Catalog Column"**
  - Anchor: `data-anchor="builder-left-panel"`
  - Children: Section panel template instances and `[3.3.5] Catalog Grip`.
- **[3.2.4] Subcontainer – "Preview Stage"**
  - Anchor: `data-anchor="builder-center-panel"`
  - Children: `[3.3.6] Preview Placeholder` and nested configuration slot.
- **[3.2.5] Subcontainer – "Inspector Column"**
  - Anchor: `data-anchor="builder-right-panel"`
  - Children: Inspector header, content wrapper, `[3.3.7] Inspector Grip`.
- **[3.2.6] Subcontainer – "Section Panel Template"**
  - Anchor pattern: `builder-section-<id>`
  - Purpose: Collapsible panel shell repeated for each catalog section.

### 3.3 Atomic Components — Primitives (Build)
- **[3.3.1] Primitive – "Chevron Left Icon"**
  - Catalog base: ui.icon
  - File: src/tabs/build/BuildSurface.build.tsx (left collapse icon).
- **[3.3.2] Primitive – "Chevron Right Icon"**
  - Catalog base: ui.icon
  - File: src/tabs/build/BuildSurface.build.tsx (right collapse icon).
- **[3.3.3] Primitive – "Section Content Catalog"**
  - Catalog base: layout.map
  - Description: Declarative map of section anchors to placeholder content and nested configuration slots.
- **[3.3.4] Primitive – "Section Header"**
  - Anchor: `builder-section-<id>-header`
  - Contains title, collapse button, and icon.
- **[3.3.5] Primitive – "Catalog Grip"**
  - Anchor: `builder-left-grip`
  - Purpose: Left panel resize handle.
- **[3.3.6] Primitive – "Preview Placeholder"**
  - Anchor: `builder-center-inner`
  - Placeholder canvas awaiting dynamic rendering.
- **[3.3.7] Primitive – "Inspector Grip"**
  - Anchor: `builder-right-grip`
  - Purpose: Separator enabling inspector resizing.
- **[3.3.8] Primitive – "Inspector Content Wrapper"**
  - Anchor: `builder-right-content`
  - Hosts settings placeholders and future nested configs.
- **[3.3.9] Primitive – "Preview Breakpoint Controls"**
  - Anchor: `builder-tabs`
  - Provides preview-only viewport presets (`mobile` / `tablet` / `desktop`) for deterministic center-canvas sizing.

## 4. BuildStyle Concern (Visual Styling of Structure)
### 4.0 Dependencies
- Consumes project tokens for colors, typography, spacing, and border radii.
- Implemented in CSS or CSS-Module files that target anchors emitted by the Build concern.

### 4.1 Atomic Components — Containers / Groups (BuildStyle)
- **[4.1.1] Container – "Surface Chrome Styling"**
  - Selector: `[data-anchor="builder-root"]`
  - Layout: Column flex with full-height shell.
- **[4.1.2] Container – "Catalog Column Styling"**
  - Selector: `[data-anchor="builder-left-panel"]`
  - Layout: Scrollable column with section spacing.
- **[4.1.3] Container – "Center Preview Styling"**
  - Selector: `[data-anchor="builder-center-panel"]`
  - Layout: Flexible middle pane with centered canvas.
- **[4.1.4] Container – "Inspector Column Styling"**
  - Selector: `[data-anchor="builder-right-panel"]`
  - Layout: Right column with stacked utilities.

### 4.2 Atomic Components — Primitives (BuildStyle)
- **[4.2.1] Primitive – "Root Surface"**
  - Applies base background, typography, and gap rules.
- **[4.2.2] Primitive – "Header Bar"**
  - Styles `[data-anchor="builder-header"]` with border and alignment.
- **[4.2.3] Primitive – "Header Title"**
  - Typography treatment for builder title element.
- **[4.2.4] Primitive – "Tab List Container"**
  - Flex layout and spacing for `[data-anchor="builder-tabs"]`.
- **[4.2.5] Primitive – "Tab Button Base"**
  - Base button styles shared across tab anchors.
- **[4.2.6] Primitive – "Active Tab"**
  - Highlight and underline for active tab state.
- **[4.2.7] Primitive – "Publish CTA"**
  - Accent styling for publish button anchor.
- **[4.2.8] Primitive – "Section Wrapper"**
  - Box styles for `builder-section-<id>` containers.
- **[4.2.9] Primitive – "Section Header Bar"**
  - Layout for section header row and collapse affordance.
- **[4.2.10] Primitive – "Section Chevron Button"**
  - Icon button chrome for collapse icons.
- **[4.2.11] Primitive – "Section Hidden State"**
  - Utility class toggling `display`/`height` for collapsed content.
- **[4.2.12] Primitive – "Section Content"**
  - Scroll behavior and padding for `builder-section-<id>-content`.
- **[4.2.13] Primitive – "Section Content Buttons"**
  - Shared width and gap rules for button groups.
- **[4.2.14] Primitive – "Section Content List"**
  - List reset for `builder-list-<id>` anchors.
- **[4.2.15] Primitive – "Grip Icon Styling"**
  - Visual chrome for resize grips, including pseudo-elements.
- **[4.2.16] Primitive – "Preview Placeholder Text"**
  - Typography for `[data-anchor="builder-center-inner"]` placeholder copy.
- **[4.2.17] Primitive – "Inspector Content"**
  - Padding and text styling for `builder-right-content`.
- **[4.2.18] Primitive – "Anchor List Item"**
  - Item-level spacing for anchor registry lists.
- **[4.2.19] Primitive – "Dark Theme Parity Styling"**
  - `body.dark` selectors align left panel, preview stage, inspector, and grip tones for coherent host-surface theming.

### 4.3 Responsive Rules
- At min-width 1440px widen left/right panels and clamp preview canvas for readability.
- At max-width 960px collapse inspector column by default while keeping anchors present.

### 4.4 Interaction Styles
- Hover/focus states for grips reuse `[4.2.15]` pseudo-elements and include `touch-action: none` so touch drags do not scroll the page.
- Tabs and buttons use focus outlines sourced from Knowledge-defined tokens.

## 5. Logic Concern (Workflow)
### 5.0 Dependencies
- Relies on browser pointer and keyboard events for resizing.
- Uses `localStorage` to persist panel states.
- Uses shared payload parser/serializer helpers from `buildSurfacePersistence.contracts.ts` so section/right-panel keys enforce a stable versioned schema while left-panel width stays primitive.

### 5.1 Atomic Components — Containers (Logic)
- **[5.1.1] Container – "Section Contracts"**
  - Defines section order constants, types, and helper utilities.
- **[5.1.2] Container – "Section Logic Hook"**
  - `useSectionLogic` managing per-section collapse and height.
- **[5.1.3] Container – "Left Panel Logic"**
  - `useLeftPanelLogic` controlling width persistence and resize gestures.
- **[5.1.4] Container – "Right Panel Logic"**
  - `useRightPanelLogic` handling inspector state.
- **[5.1.5] Container – "Surface Bindings"**
  - `useBuildSurfaceLogic` aggregator returning `BuildSurfaceBindings`.

### 5.2 Atomic Components — Primitives (Logic)
- **[5.2.1] Primitive – "Clamp Utility"**
  - Helper ensuring panel sizes stay within min/max bounds and exported for boundary-value unit tests.
- **[5.2.2] Primitive – "Keyboard Resize Handler"**
  - Responds to arrow keys on grips for accessible resizing.
- **[5.2.3] Primitive – "Pointer Resize Handler"**
  - Uses shared `usePointerDrag` with incremental deltas (`dx/dy` from last pointer position), pointer capture for section and side-panel grips, guarded capture release, and a shared cleanup path for `pointerup`/`pointercancel`/capture-loss.
  - When pointer capture is unavailable or fails to activate, `usePointerDrag` temporarily attaches move/up/cancel listeners to `window` so drag lifecycles stay active after the pointer exits the handle.
- **[5.2.4] Primitive – "Persistence Effect"**
  - Syncs panel dimensions and collapse state to `localStorage`.
- **[5.2.5] Primitive – "Bindings Memo"**
  - Memoized object mapping anchors to handlers/aria attributes consumed by Build.
- **[5.2.6] Primitive – "Persistence Failure Reporter"**
  - Shared non-fatal reporting hook used by persistence reads/writes to emit diagnosable storage operation failures.
- **[5.2.7] Primitive – "Versioned Payload Contract"**
  - Centralized in `src/tabs/build/buildSurfacePersistence.contracts.ts`.
  - Normalizes persisted section and right-panel payloads to `{ version: 1, ...state }` on writes while accepting prior unversioned JSON shapes on reads.
  - Handles malformed JSON syntax in parser helpers by returning versioned fallback state with `{ wasFallback: true, reasonCode, reason }` so read-path wrappers can report non-fatal diagnostics consistently.
  - Distinguishes unsupported version mismatches from malformed/invalid-shape payloads and resets to safe defaults for unsupported/malformed payloads.
  - Marks successful legacy upgrades via `wasMigrated: true` so the persisted contract can be rewritten as versioned JSON by existing write effects.
  - Left-panel width intentionally remains a primitive numeric string contract until the payload requires additional structured fields.
- **[5.2.8] Primitive – "Preview Breakpoint State"**
  - Tracks selected preview breakpoint and exposes the active preview width variant to Build bindings.

### 5.2.3 Derived Values
- Derived booleans for collapsed states, computed widths/heights.

### 5.2.4 Side Effects
- Pointer capture lifecycle inside `usePointerDrag`, including unmount cleanup and temporary `document.body.style.userSelect` suppression during active drag.
- `localStorage` updates triggered by state changes.

### 5.2.5 Workflows
- Resize workflow: Grip `onPointerDown` (touch-action disabled on handle) → `[5.2.3]` computes deltas and updates dimensions → `[5.2.4]` persists values → Build re-renders with new sizes.
- Collapse workflow: Toggle click → Section state updates → `[5.2.5]` memo recalculates bindings for Build.

## 6. Knowledge Concern (Reference Data)
### 6.1 Maps / Dictionaries
- **[6.1.1] Primitive – "Anchor Registry"**
  - `BUILD_ANCHORS` map exposing anchor factories for reuse across concerns.

### 6.2 Constants
- **[6.2.1] Primitive – "Section Labels"**
  - Display strings for catalog section headers.
- **[6.2.2] Primitive – "Grip Aria Labels"**
  - Accessible labels for resize grips.
- **[6.2.3] Primitive – "Placeholder Copy"**
  - Text for preview and inspector placeholder panels.

### 6.3 Shared / Global Reference
- Provides canonical anchor string literals for use by other configurations.

## 7. Results Concern (Outputs)
### 7.0 Absence-State Vocabulary (v1)
Absence-state labels distinguish intentional omission from planned future additions so reserved Results/ResultsStyle sections remain deterministic during incremental implementation.

| Absence State | Meaning | Intent Type | Current Omission Expected? |
|---|---|---|---|
| `absent-by-design` | Intentionally not present in the current scope/design. | Intentional omission. | Yes — not an error/oversight. |
| `deferred-planned` | Not present yet, but planned for a future iteration. | Planned future work. | Yes — pending a later pass. |
| `not-applicable` | Concept/category does not apply to this artifact/section in its current form. | Non-applicable. | Yes — omission is structurally correct. |
| `future-slot-reserved` | Section/slot intentionally reserved for structural continuity and provenance; content is expected later when triggering conditions exist. | Intentional structural reservation for future activation. | Yes — placeholder is deliberate. |

### 7.1 User-Facing Outputs
- Absence State: `absent-by-design`.
- Build surface currently focuses on structure and interaction rather than user-facing result outputs.

### 7.2 Dev / Debug Outputs
- Absence State: `deferred-planned`.
- Optional debug panel for anchor inspection is planned for a future iteration.

### 7.3 Accessibility Outputs
- Absence State: `future-slot-reserved`.
- Live-region hooks will surface here when the builder emits status messages that require announcements.

## 8. ResultsStyle Concern (Output Styling)
### 8.1 Results Layout Styles
- Absence State: `future-slot-reserved`.
- Results layout styles are intentionally reserved and will be added when Results outputs exist.

### 8.2 Debug Display Styles
- Absence State: `deferred-planned`.
- Debug display styles are planned for the same future iteration as Results debug outputs.

## 9. Assembly Pattern
### 9.1 File Structure
- src/tabs/build/BuildSurface.build.tsx
- src/tabs/build/BuildSurface.build.module.css
- src/tabs/build/BuildSurface.logic.ts
- src/tabs/build/buildSurfacePersistence.ts
- src/tabs/build/buildSurfacePersistence.contracts.ts
- src/tabs/build/BuildSurface.knowledge.ts
- (Results and ResultsStyle files: `future-slot-reserved`; add when outputs exist.)
- src/tabs/build/index.ts

### 9.2 Assembly Logic
- `src/tabs/build/index.tsx` composes Build with Logic bindings, imports BuildStyle CSS modules for side effects, and re-exports the assembled component.

### 9.3 Integration
- Imported by cfg-appFrame via its `[3.3.2]` Build Tab Mount primitive and swapped by shell-globalHeader navigation.

## 10. Implementation Passes
### 10.1 Pass Mapping
- Pass 0: Author NL skeleton and establish anchor registry in Knowledge.
- Pass 1: Implement Build containers and primitives.
- Pass 2: Implement BuildStyle styling groups.
- Pass 3: Implement Logic hooks for resizing and persistence.
- Pass 4: Expand Knowledge with copy/aria tokens.
- Pass 5+: Add Results/ResultsStyle (`deferred-planned`) when builder emits analytics or summaries.

### 10.2 Export Checklist
- All Build anchors match Knowledge registry.
- BuildStyle selectors reference anchors without introducing structure.
- Logic handlers clean up pointer listeners and persist state safely.
- Knowledge exports copy strings consumed by Build and BuildStyle.
- Results user-facing outputs remain `absent-by-design`; reserved accessibility/style slots are `future-slot-reserved`; debug outputs/styles are `deferred-planned`. Confirm these typed omissions when reviewing changes.
