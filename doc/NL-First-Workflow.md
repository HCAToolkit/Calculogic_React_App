NL-First Workflow (What the AI Does First)
Golden rule: Before generating or editing any code for a configuration or shell, instantiate the appropriate NL skeleton template from General-NL-Skeletons.md (Configuration-Level or ProjectShell-Level) and create or update the NL skeleton text file for it.
0. NL Skeleton Step (Mandatory First Step)
When starting work on a feature, configuration, or shell:
Decide the type:

If it’s a normal configuration (e.g. “Tab Navigation”, “Brand Block”), use:

doc/nl-config/cfg-[name].md

If it’s a global shell (e.g. “Global Header Shell”), use:

doc/nl-shell/shell-[name].md

Create (or update) the NL skeleton file using the correct template:

- Skeleton templates:
  - General-NL-Skeletons.md → Section 1.x–10.x under “General NL Skeleton – Configuration-Level” for configurations
  - General-NL-Skeletons.md → Section 1.x–10.x under “General NL Skeleton – ProjectShell-Level” for shells

Fill it out in prose:

Sections 1–10, including:

Purpose and scope

Configuration contracts

Build / BuildStyle / Logic / Knowledge / Results / ResultsStyle

Atomic Components (Containers, Subcontainers, Primitives) with numbering (3.1, 3.2.1, 3.3.1, etc.)

Assembly pattern and implementation passes

Only after the NL file exists and is filled in may the AI:

Create or edit any concern files under src/builder/...

Add or update code comments referencing [3.x.y], [4.x.y], etc.

Never add new code that isn’t described in the NL skeleton first.

If new behavior/structure is needed, AI must update the NL file first, then code.

1. Code Generation Step (After NL)
Once the NL skeleton file is in place:
Read cfg-*.md or shell-*.md top to bottom.

For each concern, in order:

Add/adjust the file header (with link to the NL file).

Add/adjust section headers (3. Build – cfg-..., 4. BuildStyle – cfg-..., etc.).

Implement Containers/Subcontainers/Primitives in the same numeric order as NL.

Prepend each with an atomic comment:

// [3.2.2] cfg-tabNavigation · Subcontainer · "Center Zone – Tab Strip"
// Concern: Build · Parent: "Global Header Shell" · Catalog: layout.group

2. Enforcement Checklist (For AI / You)
Any time code is generated or changed for a config/shell:
NL skeleton file exists in doc/nl-config or doc/nl-shell.

The change to code is reflected in NL, and the numbering matches.

All new functions/components/blocks have the correct [sectionNumber] cfg-id · type · name comments.

No concern file contains “orphan” code that isn’t mentioned in the NL skeleton.

Example alignment

- NL excerpt:
  - [3.2.1] Subcontainer “Center Zone – Tab Strip” (Build)
  - [5.2.2] Handler “handleTabSelect” (Logic)
- Code comments:
  - `// [3.2.1] cfg-buildSurface · Subcontainer · "Center Zone – Tab Strip"`
  - `// [5.2.2] cfg-buildSurface · Primitive · "handleTabSelect"`
- Code stub:
  - ```ts
    // [5.2.2] cfg-buildSurface · Primitive · "handleTabSelect"
    const handleTabSelect = (tabId: string) => {
      setActiveTab(tabId);
    };
    ```
