# General NL Skeletons

This doc defines the canonical NL skeleton templates used by all configuration (`doc/nl-config/*.md`) and shell (`doc/nl-shell/*.md`) documents. Section numbers (1–10) and concern ordering are considered stable contracts.

## Addressing & Numbering Note (Draft Alignment)

- **NL section numbering (this doc):** The `1–10` section structure below is a stable documentation/template contract.
- **Structural Address (Draft):** Deterministic structural positioning (host-present or no-host forms) is a supplementary addressing layer described in `DeterministicStructuralAddressingSpec-Draft.md`.
- **Relationship between the two:** These systems are related but **not identical**. Structural addresses do not replace NL section numbering in this skeleton.
- **Template usage:** Where useful, templates may record structural addresses as **draft, optional metadata** alongside NL content.
- **Placeholder note (`x`):** Examples that use `x` (for example `3.2.x`) are illustrative draft placeholders in this doc; placeholder marker policy remains deferred to `DeterministicStructuralAddressingSpec-Draft.md`.
- **Governance note:** Comment/provenance protocol conventions remain governed by `CCPP.md`; this doc remains the canonical NL skeleton structure source.

## Changing This Doc

If you change top-level sections or numbering here, you must also update `NL-First-Workflow.md`, `CSCS.md`, and `CCPP.md` to keep the system consistent.

---

## 1) General NL Skeleton – Configuration-Level

Use this for things like “Motivations question,” individual sections, etc.

Configuration: [Config Name] ([config-id])
Project: [Project Name] ([project-id])
Type: [Configuration type, e.g. Question Block / Section / Interaction]
Scope: [Local to page / shared / referenced by others]
Passes: [0–7] (Multi-pass implementation)

### Semantic Notes

- A Configuration is a semantic module, not a file.
- It spans up to six concerns: Build, BuildStyle, Logic, Knowledge, Results, ResultsStyle.
- Per-configuration implementation files commonly live under paths like:
  - `src/configs/<configId>/<ConfigName>.build.tsx` (structure)
  - `src/configs/<configId>/<ConfigName>.build-style.module.css` (configuration styling)
  - Other concern files with matching base names.
- The engine or build step may merge those files into project-level bundles such as `src/projects/<projectId>/Project.build.tsx`.
- BuildStyle and ResultsStyle are implemented as CSS/CSS-Module files (for example `[ConfigName].build-style.module.css` and `[ConfigName].results-style.module.css`) that target the anchors emitted by the Build and Results `.tsx` concerns.
- Note: Actual repository naming should still follow the naming master and current repo conventions.
- All content of a configuration is expressed as Atomic Components.
- Each atomic component has:
  - a concern (Build / BuildStyle / Logic / Knowledge / Results / ResultsStyle), and
  - a hierarchical type: Container, Subcontainer, or Primitive.
- Most atoms belong to exactly one configuration. Some Knowledge/System atoms may be project-global (e.g. breakpoints, brand tokens) and are documented separately.
- Hierarchical types:
  - Container – top-level encapsulation in a concern for this configuration; not nested inside other Containers in that concern; may contain Subcontainers and/or Primitives directly (flat or hierarchical).
  - Subcontainer – nested encapsulation; always inside a Container or another Subcontainer; never at the root of a concern.
  - Primitive – leaf unit; contains nothing else (single field, rule, style block, kb map, result line, etc.).
- Concern vs hierarchy are orthogonal.
  - Any valid combination is allowed as long as the concern’s purity rules are respected.

### Draft Structural-Address Usage Notes (Supplementary)

- **No-host mode (common):** For standalone/local configurations without a host composition file, draft structural addresses may be recorded in no-host form.
- **Host-present mode (common in composed shells/layouts):** When a host composes zones/panels/substructures, draft structural addresses may be recorded in host-present form.
- This guidance is descriptive and draft-aligned; final structural-address policy and token decisions remain deferred to the draft spec.
- Concern ordering and NL-first structure are unchanged by this supplementary layer.

### 1. Purpose and Scope

- 1.1 This configuration is responsible for […].
- 1.2 It appears in context of […].
- 1.3 It interacts with other configurations by […].

### 2. Configuration Contracts

#### 2.1 TypeScript Interfaces

Define props/state models used by this configuration.

Example (code hint only):

```ts
interface [ConfigName]Props { ... }
interface [ConfigName]State { ... }
```

#### 2.2 Data & State Requirements

- Local state:
- Global context needed:
- External data sources (if any):

#### 2.3 Dependencies

- UI libs:
- Routing:
- Shared hooks / utilities:

### 3. Build Concern (Structure)

#### 3.0 Dependencies & Hierarchy Notes

- Requires parent layout: […].
- Requires context: […].
- This concern has one or more Containers at the top level for this configuration.
- Subcontainers only appear inside Containers (never at the root).
- Containers may be used as:
  - flat roots (directly containing only Primitives), or
  - hierarchical roots (containing Subcontainers and Primitives).

#### 3.1 Atomic Components — Containers (Build)

- Name: `"[Container name]"`
- Hierarchical type: Container
- Concern: Build
- Catalog base: `[layout.group / layout.stack / section.*]`
- Anchor: `data-anchor="..."`
- Structural Address (Draft, optional): `[A.1.3.2 / 3.1.2 / etc.]`
- Layout: `[vertical / horizontal / grid]`
- Children: `[subcontainers and/or primitives in order]`

#### 3.2 Atomic Components — Subcontainers (Build)

##### 3.2.1 Subcontainer `"[Name]"`

- Hierarchical type: Subcontainer
- Concern: Build
- Purpose: […].
- Catalog base: […].
- Parent container: […].
- Structural Address (Draft, optional): `[A.1.3.2 / 3.2.1 / etc.]`
- Children: […].

##### 3.2.2 Subcontainer `"[Name]"`

- […].

#### 3.3 Atomic Components — Primitives (Build)

##### 3.3.1 Primitive `"[Name]"`

- Hierarchical type: Primitive
- Concern: Build
- Catalog base: `[ui.text / ui.input / ui.button / ui.checkbox / ui.select / ui.details / etc.]`
- Structural Address (Draft, optional): `[A.1.3.4 / 3.3.1 / etc.]`
- Content / label: […].
- Props (NL description): […].

##### 3.3.2 Primitive `"[Name]"`

- […].

### 4. BuildStyle Concern (Visual Styling of Structure)

#### 4.0 Dependencies

- Needs theme tokens: […].

#### 4.1 Atomic Components — Containers / Groups (BuildStyle)

- Optional named style group for this configuration (e.g. `"[ConfigName] Layout Styles"`).

#### 4.2 Atomic Components — Primitives (BuildStyle)

- Base Layout Styles
  - Container selector, basic flex/grid, spacing.
- Element Styles
  - Primitive-specific styles, states, variants.

#### 4.3 Responsive Rules

- Breakpoints and what changes at each (ideally referencing project-global breakpoint constants in Knowledge).

#### 4.4 Interaction Styles

- Hover, focus, active, disabled.

### 5. Logic Concern (Workflow)

#### 5.0 Dependencies

- Hooks / router / form libs used.

#### 5.1 Atomic Components — Containers (Logic)

- Root logic container for this configuration (e.g. `"[ConfigName]Logic hook"`).

#### 5.2 Atomic Components — Primitives (Logic)

##### 5.2.1 State Management

- Local state shape + initialization (`logic.state` atoms).
- Global state it reads/writes.

##### 5.2.2 Event Handlers

- OnChange, OnClick, OnSubmit, etc. (`logic.on` or handler atoms).
- Structural Address (Draft, optional): `[A.2.1.5 / 5.2.2 / etc.]`

##### 5.2.3 Derived Values

- `useMemo`/selectors/computed flags (`logic.compute` atoms).

##### 5.2.4 Side Effects

- `useEffect` usage, subscriptions, listeners (if any).

##### 5.2.5 Workflows

- Validation, submission, navigation, etc. (expressed as sequences of logic atoms, possibly grouped inside Subcontainers if needed).

### 6. Knowledge Concern (Reference Data)

#### 6.1 Maps / Dictionaries (Primitives – Knowledge)

- e.g. option maps, type definitions (`kb.map`).

#### 6.2 Constants (Primitives – Knowledge)

- Labels, copy strings, thresholds (`kb.const`, `kb.list`).

#### 6.3 Shared / Global Reference

- IDs / doc links / anchors used elsewhere.
- Note here if this configuration depends on project-global Knowledge atoms (e.g. breakpoints, brand tokens) instead of defining them locally.

### 7. Results Concern (Outputs)

#### 7.1 User-Facing Outputs (Primitives / Containers – Results)

- What this configuration renders as “results” (e.g. summary lines, scores, lists).

#### 7.2 Dev / Debug Outputs

- Optional debug text/blocks for builders.

#### 7.3 Accessibility Outputs

- Announcements, ARIA live regions, etc.

### 8. ResultsStyle Concern (Output Styling)

#### 8.1 Results Layout Styles (Primitives – ResultsStyle)

- Layout/styling for result blocks.

#### 8.2 Debug Display Styles

- Styling for debug overlays/panels.

### 9. Assembly Pattern

#### 9.1 File Structure

- Implementation pattern only; configuration remains semantic.

```text
/src/configs/[config-id]/[ConfigName]/
  [ConfigName].build.tsx
  [ConfigName].build-style.module.css
  [ConfigName].logic.ts
  [ConfigName].knowledge.ts
  [ConfigName].results.ts
  [ConfigName].results-style.module.css
  index.ts
```

#### 9.2 Assembly Logic

- `index.ts` wires concerns together.
- It exports a single component that implements this configuration.

#### 9.3 Integration

- Parent integration pattern:
  - How the parent passes props/context.
  - How the parent uses this configuration.

### 10. Implementation Passes

#### 10.1 Pass Mapping

- Pass 0: […].
- Pass 1: […].
- …

#### 10.2 Export Checklist

- All concern files exist.
- Types line up.
- Logic matches spec.
- Styling matches breakpoints.
- Accessibility checks passed.

---

## 2) General NL Skeleton – ProjectShell-Level (Global Shells)

Use this for things like the Global Header, App Shell, persistent sidebars.

ProjectShell Configuration: [Shell Name] ([shell-id])
Project: [Project Name] ([project-id])
Type: Persistent [Shell type, e.g. Navigation Shell / App Layout Shell]
Scope: Global – wraps all Configuration views
Passes: [0–7] (Multi-pass implementation)

### Semantic Notes

- A ProjectShell is still a Configuration in the semantic sense, but it is global and persistent.
- It spans the same concerns (Build, BuildStyle, Logic, Knowledge, Results, ResultsStyle), and is also expressed entirely through Atomic Components (Containers, Subcontainers, Primitives).
- Many Knowledge atoms here will be project-global (tab definitions, routes, breakpoints, brand content) and consumed by other configurations.

### Draft Structural-Address Usage Notes (Supplementary)

- **No-host mode:** Can be used for shell-local structures when no external host composition file is involved.
- **Host-present mode (common for global shells):** When the shell participates in/acts as a host composition context for nested zones, draft host-present structural addresses may be recorded as optional metadata.
- Structural addresses here remain draft guidance and do not alter the stable `1–10` NL section contract.

### 1. Purpose and Scope

- 1.1 This shell provides the global [header/sidebar/layout] that persists across all Configuration views.
- 1.2 It manages [navigation state, modes, responsive layout, etc.].
- 1.3 It coordinates with routing and configuration context.

### 2. Configuration Contracts

#### 2.1 TypeScript Interfaces

- Shell-level state types (tabs, modes, viewport, etc.).

#### 2.2 Global State Requirements

- What global state this shell owns or consumes.

#### 2.3 Routing & Context

- URL patterns, config ID context, etc.

### 3. Build Concern (Structure)

#### 3.0 Dependencies & Hierarchy Notes

- Parent App, routing, providers.
- This shell has one or more Containers at the top level for Build.
  - Shell zones are modeled as Subcontainers and Primitives under those containers.

#### 3.1 Atomic Components — Containers (Build) – `"[Shell Container]"`

- Hierarchical type: Container
- Concern: Build
- Catalog base: `layout.group / layout.shell`
- Zones: left/center/right, top/bottom, etc.
- Anchor: shell-level anchor if needed.
- Structural Address (Draft, optional): `[A.1.2 / 3.1 / etc.]`

#### 3.2 Atomic Components — Subcontainers (Build) – `"Shell Zones"`

- Zone A Subcontainer: [Brand / Nav / Tools]
- Zone B Subcontainer: [Tabs / Modes / Breadcrumbs]
- Zone C Subcontainer: [Actions / Profile / Publish]
- Structural Address (Draft, optional): `[A.1.2.1 / 3.2.x / etc.]`

#### 3.3 Atomic Components — Primitives (Build)

- Buttons, labels, icons, previews, etc., assigned to each zone as leaf-level primitives.
- Structural Address (Draft, optional): `[A.1.2.1.4 / 3.3.x / etc.]`

### 4. BuildStyle Concern (Visual Styling of Structure)

#### 4.0 Dependencies

- Theme tokens and global layout rules.

#### 4.1 Base Layout Styles

- Shell container (padding, background, borders).

#### 4.2 Zone Styles

- Alignment, spacing, stacking of zones.

#### 4.3 Responsive Layout Rules

- Desktop / tablet / mobile behavior.

#### 4.4 Interaction States

- Active tab, hover preview, disabled states.

### 5. Logic Concern (Workflow)

#### 5.0 Dependencies

- Router, viewport detection, config context.

#### 5.1 Global State Management

- Navigation state, modes, hover previews, etc.

#### 5.2 Navigation Logic

- Tab activation, mode toggles, sync with URL.

#### 5.3 Responsive Logic

- Breakpoint calculation, conditional rendering flags.

#### 5.4 Shell-Specific Workflows

- e.g. Publish, open docs, open settings.

### 6. Knowledge Concern (Reference Data)

#### 6.1 Shell Metadata (often project-global Knowledge atoms)

- Tab definitions, routes, tooltips.

#### 6.2 Breakpoints

- Thresholds + helper functions (often project-global).

#### 6.3 Brand Content

- Wordmark, tagline, home tooltip.

### 7. Results Concern (Outputs)

#### 7.1 Navigation State Output

- Debug display / current route string.

#### 7.2 Accessibility Announcements

- Tab change messages, mode change messages.

### 8. ResultsStyle Concern (Output Styling)

#### 8.1 Debug Overlay Styles

#### 8.2 Any special shell-only result visuals

### 9. Assembly Pattern

#### 9.1 File Structure

- Implementation pattern reference.

```text
/src/shells/[shell-id]/[ShellName]/
  [ShellName].build.tsx
  [ShellName].build-style.module.css
  [ShellName].logic.ts
  [ShellName].knowledge.ts
  [ShellName].results.tsx
  [ShellName].results-style.module.css
  index.ts
```

#### 9.2 Assembly Logic

- `index.ts` wires shell concerns together.
- It exports a shell component that implements this project shell.
- Implementation pattern typically includes:
  - Hook for logic.
  - Build component for structure.
  - Knowledge/constants.
  - Optional results debug.

#### 9.3 Integration

- Integration pattern:
  - How the shell wraps child routes/configurations.

### 10. Implementation Passes

#### 10.1 Pass Mapping

- Pass 0: Shell container.
- Pass 1+: Zones, tabs, actions, etc.

#### 10.2 Export Checklist

- Shell renders correctly at all breakpoints.
- Global state + routing are in sync.
- All zones behave as specified.
- Debug + accessibility pieces wired up.
