Calculogic Comment & Provenance Protocol (CCPP, NL-Aligned)
1. Purpose
Comments encode intent, structure, and provenance in a way that:
Mirrors the NL skeleton order,

Helps AI reconstruct or extend code from NL,

And keeps files navigable top-down.

Comments are not narration of obvious code; they are a projection of the NL skeleton and decisions into the codebase.

2. Comment Types (Use Only These)
File Header – one per file.

Section Header – top of each config section inside a file.

Atomic Comment – immediately before a Container/Subcontainer/Primitive.

Inline Rationale – rare; why a non-obvious line/block exists.

Decision Note – tiny ADR embedded in code.

TODO with expiry – actionable, owner + date.

Provenance Block – when external logic/content influences code (no payload).

3. Required Fields & Format
3.1 File Header (TS/TSX/TS, etc.)
/**
 * ProjectShell/Config: Global Header Shell (shell-globalHeader)
 * Concern File: Build | BuildStyle | Logic | Knowledge | Results | ResultsStyle
 * Source NL: doc/nl-shell/shell-globalHeader.md
 * Responsibility: <one sentence for this concern file>
 * Invariants: <comma-separated truths>
 * Notes: <optional; ADR id, link, or short note>
 */
For non-shell configs, replace ProjectShell/Config with Configuration: cfg-....
3.2 Section Header (per configuration inside a concern file)
// ─────────────────────────────────────────────
// 3. Build – cfg-tabNavigation (Tab Navigation)
// NL Sections: §3.0–3.3 in cfg-tabNavigation.md
// Purpose: <short purpose>
// Constraints: <key constraints or perf/a11y notes>
// ─────────────────────────────────────────────
The leading number (3. here) matches the NL skeleton’s concern index.

3.3 Atomic Comment (Container / Subcontainer / Primitive)
// [3.2.2] cfg-tabNavigation · Subcontainer · "Center Zone – Tab Strip"
// Concern: Build · Parent: "Global Header Shell" · Catalog: layout.group
// Notes: hosts 4 tabs and info icons; no reordering; center-aligned
function GlobalHeaderTabStripZone() {
  ...
}
Rules:
First line: [NLSectionNumber] cfg-id · HierarchicalType · "Name".

Second line: Concern, Parent (if any), Catalog id.

Third line: short intent/constraint note.

These should read like compressed NL bullets and are the main thing AI should preserve.
3.4 Inline Rationale
// WHY: Avoids focus loss when switching tabs via keyboard
Use sparingly, only when the reason is not obvious.
3.5 Decision Note
// DECISION: Tab hover previews via CSS only | 2025-11-05
// Context: Keep Logic lightweight for header interactions
// Choice: Use CSS hover for previews instead of JS listeners
// Consequence: Less JS complexity; no previews on touch devices
// ADR: header-hover-001   // optional
Promote a Decision note to a standalone ADR when the rationale spans multiple paragraphs, introduces cross-team dependencies, or affects more than one configuration. Longer decisions live alongside other records in doc/decisions/*.md; reference the ADR id from the inline note once it exists.
3.6 TODO with expiry
// TODO(@owner, 2025-12-01): Wire openDoc(docId) to docs modal shell
Must always have owner and date.
3.7 Provenance Block
// SOURCE: https://example.org/a11y/tabs
// Accessed: 2025-11-05T14:22:00Z
// Note: Pattern used as reference for keyboard tab navigation; no content copied
No payload; just reference.

4. Language & Mapping
TS/TSX/JS: /** ... */ for file header; // ... for everything else.

CSS: /* ... */ for file and atomic comments; still match NL numbers.

JSON: no comments; if needed, keep a .meta or .md doc instead.

Markdown docs: NL skeletons themselves.

5. NL Skeleton Alignment
Every concern file must have:

A file header linking to its NL doc.

Section headers for each configuration in NL order.

Atomic comments for each Container/Subcontainer/Primitive referenced in NL.

The NL skeleton is the source:

When a number changes in NL (e.g. 3.2.1 → 3.2.2), comments should be updated to match.

When a new atomic is added to NL, a new atomic comment + code block is added in the same position.

6. Strict Do / Don’t
Do
Use NL section numbers [3.2.1] consistently across files.

Explain why something exists, not what it does.

Keep comments short and structured (good for humans and AI).

Update NL + comments in the same change as code.

Don’t
Narrate obvious code.

Add code that doesn’t correspond to a skeleton section (unless you add it to NL first).

Use unlabeled TODO:.

Copy external content into comments.

7. Minimal Examples
Build file:
/**
 * Configuration: cfg-tabNavigation (Tab Navigation)
 * Concern File: Build
 * Source NL: doc/nl-config/cfg-tabNavigation.md
 * Responsibility: Header tab strip structure (no styling, no behavior)
 * Invariants: Tabs never wrap; center zone stays in single row
 */

// ─────────────────────────────────────────────
// 3. Build – cfg-tabNavigation (Tab Navigation)
// NL Sections: §3.0–3.3 in cfg-tabNavigation.md
// Purpose: Provide 4 canonical tabs in fixed order
// Constraints: Order fixed: Build, Logic, Knowledge, Results
// ─────────────────────────────────────────────

// [3.1] cfg-tabNavigation · Container · "Global Header Shell"
// Concern: Build · Catalog: layout.shell
export function GlobalHeaderShell() { ... }
BuildStyle file:
/*
 * Configuration: cfg-tabNavigation (Tab Navigation)
 * Concern File: BuildStyle
 * Source NL: doc/nl-config/cfg-tabNavigation.md
 * Responsibility: Visual styling of header tab strip (no structure)
 * Invariants: Tabs remain single-line; scroll instead of wrap
*/

/* [4.2.1] cfg-tabNavigation · Primitive · "Tab Item Base Rule"
   Matches Build primitive [3.3.4–3.3.7] (tab buttons)
*/
.globalHeader__tab {
  /* ... */
}

Bad vs. good atomic comments

- Bad:
  - `// handles tab click`
  - `const handleClick = () => setActive(tabId);`
  (Narrates the obvious and lacks NL reference.)
- Good:
  - `// [5.2.2] cfg-tabNavigation · Primitive · "handleTabSelect"`
  - `// Concern: Logic · Parent: "Tab Navigation Logic" · Notes: syncs active tab state`
  - `const handleTabSelect = (tabId: string) => setActiveTab(tabId);`

8. Maintenance Rules
On every structural change:
Update the NL skeleton first.

Then update code and comments to match:

Keep section headers in NL order.

Keep atomic comments synchronized with NL numbers.

Remove or update any Decision notes that no longer apply (add new ones instead of rewriting history).

Clean up or close TODOs on each release cut.
