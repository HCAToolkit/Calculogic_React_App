Calculogic-Style Concern System (Codebase-Level)
1) First Principles
Canonical Layer Order: Build → View → Logic → Knowledge → Results.


Ordering Source (BOS): The highest present layer in that order becomes the structural reference for the concern. All lower layers mirror its top-down order.


Attachment-Only for Non-Sources: Layers that are not the ordering source attach to declared anchors; they do not create or reorder structure.


Stable Anchors: Every part exposes a stable, public anchor (name/class/data-attr). All layers refer to anchors—never to incidental DOM.


Directional Dependencies: Build feeds View/Logic; Logic feeds Results; Knowledge informs all. No cycles; no reaching “up” the stack.


Purity Per Layer:


Build = structure only


View = appearance only


Logic = interaction/state only


Knowledge = guidance/reference only


Results = derived feedback only


Locality: Keep code for a concern co-located; nested concerns live inside their parent’s folder but follow the same rules independently.


Monotonic Diffs: A change to the ordering source appears in the same top-down sequence across its sibling layer files.


Minimal Surface Area: Each concern exposes a tiny interface (anchors, events, and read-only signals). Internal details stay private.



2) Concern Definition Protocol (CDP)
Use this as a one-page template for any concern before you write code.
Name: Short, unambiguous.


Purpose (1 sentence): What outcome this concern provides.


In-Scope / Out-of-Scope: Bulleted boundaries.


Ordering Source: Build | View | Logic | Knowledge | Results (choose the highest present).


Anchors: The public selectors/IDs this concern owns or attaches to.


Inputs: Events, props, or data it consumes (read-only).


Outputs: Events, derived values, or UI it emits (no side effects outside scope).


Invariants: Facts that must always hold true (e.g., “never reorders sibling regions”).


Dependencies: Lower layers/foundations only; no upward imports.


Acceptance: 3–5 observable criteria to declare the concern “done.”



3) Decision Rules (what belongs where)
Frame vs. Items:


Changes to page frame, regions, or section layout → Build (structure concern).


Creation/move/reorder/select of items (atoms/configs/etc.) → Logic in an item-owner concern.


No Structure? Use Fallback: If a concern has no Build, View sets order; if no View, Logic; then Knowledge; then Results.


Results Belongs Where Data Ends: If something is purely a derived readout (counts, previews), it’s Results—never creates structure or state.


Knowledge Is Guidance, Not Behavior: Tooltips/help text/reference tables live in Knowledge and do not mutate state or structure.



4) Nested vs. Sibling Concerns (classification)
Nested if ALL are true:


It attaches to specific parent anchors that must exist.


It cannot operate outside the parent’s structure.


It never alters the parent’s structural order.


Otherwise, it’s a Sibling concern: it renders within the same frame but manages its own internal anchors and lifecycle.



5) The Four Tests (split/merge decisions)
Run these before adding code, refactoring, or scoping tickets.
Single Reason to Change: Will most changes to this code happen for the same reason?


Yes → keep together. No → split into separate concerns.


Boundary of Effects: Can this code change without forcing structural or behavioral changes outside its scope?


If not, you’re leaking responsibilities—split.


Ordering Consistency: Can lower layers mirror the ordering source 1:1 without re-grouping?


If not, you’ve mixed concerns—separate the parts.


User-Visible Contract: Can you describe its inputs/outputs in one short paragraph?


If not, you’ve bundled multiple concerns—split.



6) Change Management Rules
Promotions: When a nested concern gains its own structure or broad usage, promote it to a sibling concern with its own ordering source.


Deprecations: When two concerns always change together and share the same ordering and anchors, merge them.


Renames: Preserve anchors; if they must change, provide an adapter layer and update all attachments in one PR.


Spec Drift Guard: If a concern’s code requires new anchors, update the ordering source first, then mirror changes down the stack.



7) Interfaces & Contracts (tiny but strict)
Anchors: The only cross-layer selectors.


Events: Named, scoped (“atomic:reordered”, “panel:collapsed”).


Signals (read-only): Derived flags exposed by Logic to Results (e.g., isDragging, count).


No Hidden Coupling: No direct DOM poking; no style reads in Logic; no state in Knowledge; no DOM creation in Logic/Results.



8) Acceptance Checklist (applied to every PR)
One (and only one) ordering source selected for the concern.


All present layers mirror the source’s order.


Non-source layers attach via declared anchors only.


Roles respected (Build/View/Logic/Knowledge/Results purity).


No upward or cyclic dependencies.


Tests cover the concern’s acceptance criteria.


Diffs read top-down consistently across files.



9) Example classification (generic)
Structure & Responsiveness: Concern = frame, panes, sections (Ordering source: Build; View mirrors; no DnD).


Atomic Components (current): Concern = atom list/canvas interactions (Ordering source: Build for the atom list; DnD in Logic attaches to those anchors).


Configurations (future): Concern = config blocks + persistence (its own Build order; Logic handles block-level DnD; Results show derived summaries).


Search/Browse: Concern = find/filter UI (Build for list; Logic for queries; Results for counts; never alters frame order).



This is the go/no-go rubric before coding anything. It’s brief enough to keep next to editor, strict enough to prevent drift, and flexible enough to apply to any feature while preserving coherence across the codebase.