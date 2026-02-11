# Doc-Engine Standards Summary

This summary restates required conventions for doc-engine implementation work. It is a local, practical restatement of the canonical standards in `doc/ConventionRoutines/CCPP.md`, `doc/ConventionRoutines/CSCS.md`, `doc/ConventionRoutines/General-NL-Skeletons.md`, and `doc/ConventionRoutines/NL-First-Workflow.md`.

## 1) Required File Header (CCPP)

Every concern file should begin with a single file header that identifies:

- configuration/shell identity,
- concern file type,
- source NL skeleton path,
- responsibility,
- invariants,
- optional notes.

Reference shape:

```ts
/**
 * Configuration: cfg-[id] ([Name])
 * Concern File: Build | BuildStyle | Logic | Knowledge | Results | ResultsStyle
 * Source NL: doc/nl-config/cfg-[id].md (or doc/nl-shell/shell-[id].md)
 * Responsibility: <one-sentence concern responsibility>
 * Invariants: <comma-separated truths>
 * Notes: <optional>
 */
```

## 2) Required Section Headers (CCPP + Skeleton Alignment)

Within each concern file, add section headers in NL order and keep numbering aligned with the NL skeleton.

- Concern numbering contract:
  - `3` Build
  - `4` BuildStyle
  - `5` Logic
  - `6` Knowledge
  - `7` Results
  - `8` ResultsStyle
- Section header includes concern name, NL section span, purpose, and constraints.

Reference shape:

```ts
// ─────────────────────────────────────────────
// 3. Build – cfg-[id] ([Name])
// NL Sections: §3.0–3.x in cfg-[id].md
// Purpose: <short purpose>
// Constraints: <key constraints>
// ─────────────────────────────────────────────
```

## 3) Required Atomic Comments (CCPP)

Add atomic comments immediately before each Container/Subcontainer/Primitive implementation block.

Required structure:

1. `[sectionNumber] cfg-id · HierarchicalType · "Atomic Name"`
2. `Concern`, parent context (if applicable), and catalog/base id
3. concise intent or constraint note

Reference shape:

```ts
// [3.2.2] cfg-[id] · Subcontainer · "[Atomic Name]"
// Concern: Build · Parent: "[Parent Name]" · Catalog: layout.group
// Notes: <intent / constraints>
```

## 4) Doc-Engine Concern Boundaries (CSCS)

Keep concern purity strict:

- **Build**: structure only
- **BuildStyle**: styling only
- **Logic**: behavior/state only
- **Knowledge**: static content/maps/constants
- **Results**: derived readouts
- **ResultsStyle**: styling of results

Non-structural concerns must not invent or reorder DOM structure defined by Build.

## 5) NL-First Requirement (Workflow)

Before code edits:

1. Create/update the corresponding NL skeleton file (`doc/nl-config/...` or `doc/nl-shell/...`).
2. Ensure sections 1–10 and concern atom numbering are up to date.
3. Then implement concern files and comments to match NL numbering.

If behavior/structure changes, update NL first, then code.
