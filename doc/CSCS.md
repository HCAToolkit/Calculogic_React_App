Calculogic Concern System (CCS, NL-Aligned, Codebase-Level)
1. First Principles
Configuration is semantic, not a file

A Configuration is a semantic module (e.g. “Global Header Shell”, “Tab Navigation”).

It spans up to six concerns: Build, BuildStyle, Logic, Knowledge, Results, ResultsStyle.

Code lives in six concern files; the configuration is defined by its NL skeleton, not its file layout. The canonical section layout and numbering for NL skeletons is defined in General-NL-Skeletons.md and every configuration or shell document must follow it exactly.

NL Skeleton as the ordering source

Each configuration has an NL Configuration Skeleton (or ProjectShell skeleton).

The skeleton’s numbered sections (3 = Build, 4 = BuildStyle, 5 = Logic, 6 = Knowledge, 7 = Results, 8 = ResultsStyle) define the canonical top-down order for all concerns.

Code in all concern files must follow this order and mirror the same numbering in comments.

Concerns vs. hierarchical types (orthogonal axes)

Every Atomic Component has:

A Concern: Build / BuildStyle / Logic / Knowledge / Results / ResultsStyle, and

A Hierarchical type: Container, Subcontainer, or Primitive.

These axes are independent: you can have a Logic Container, a Build Primitive, a ResultsStyle Primitive, etc.

Purity per concern

Build – structure only (containers, subcontainers, primitives; no state, no visual design tokens).

BuildStyle – styling of structure only (layout, spacing, responsive rules; no DOM creation, no state).

Logic – interaction, workflows, state, derived flags; no DOM, no CSS.

Knowledge – copy, constants, reference tables; no state mutation, no layout, no behavior.

Results – derived outputs / readouts; no structure creation beyond what Build defines.

ResultsStyle – styling of results; no structure, no logic.

Folder mapping

- Build → files like src/configs/<configId>/<ConfigName>.build.tsx or src/shells/<shellId>/<ShellName>.build.tsx
- BuildStyle → files like src/configs/<configId>/<ConfigName>.buildStyle.tsx
- Logic → files like src/configs/<configId>/<ConfigName>.logic.ts
- Knowledge → files like src/configs/<configId>/<ConfigName>.knowledge.ts
- Results → files like src/configs/<configId>/<ConfigName>.results.ts
- ResultsStyle → files like src/configs/<configId>/<ConfigName>.resultsStyle.tsx

Shells follow the same pattern within src/shells/<shellId>/, sharing the same base name across all concern files.

Structure source and fallbacks

Build is the default structural source for any UI configuration or shell.

Non-structural concerns (BuildStyle, Logic, Knowledge, Results, ResultsStyle) never create or reorder structure; they attach to anchors defined by Build.

Fallback (rare): if a configuration has no Build (e.g. a pure data concern), use the highest present non-style concern as the mental ordering source (Logic → Knowledge → Results), but it still must not invent DOM structure.

Anchors are stable

Every visible piece of structure exposes stable anchors (class, data-anchor, or id).

All non-Build concerns refer to these anchors, never to incidental DOM or query patterns.

Directional dependencies

Build → BuildStyle / Logic / ResultsStyle.

Logic → Results.

Knowledge informs all but depends on none.

No upward or cyclic imports (e.g., Results cannot feed Logic, Logic cannot define anchors).

Locality

Code for one configuration’s concerns lives in its folder under builder/configs/ or builder/shells/.

Nested configurations (e.g., a shell zone as its own config) live inside the parent’s folder but obey all the same rules independently.

Monotonic diffs

When you change structure in the NL skeleton for a configuration, corresponding changes in Build, BuildStyle, Logic, Knowledge, Results, and ResultsStyle must appear in the same top-down order when you read each file.

2. Configuration Definition Template (Per Configuration or Shell)
Use this before writing code or asking AI to generate code.
NL Skeleton:
Create doc/nl-config/cfg-*.md or doc/nl-shell/shell-*.md using the General NL Skeleton – Configuration-Level or ProjectShell-Level.

That document is the canonical contract for:

Purpose and scope,

Per-concern responsibilities,

Containers/Subcontainers/Primitives and their order,

Numbering (3.x.y, 4.x.y, 5.x.y, etc.).

Concern entry (per configuration):
Name: Short, unambiguous; use cfg-* for configs, shell-* for shells.

Purpose (1 sentence): What outcome this configuration achieves.

In-Scope / Out-of-Scope: Boundaries for behavior and structure.

Concerns present: Build / BuildStyle / Logic / Knowledge / Results / ResultsStyle (which apply).

Anchors: The structural anchors owned by this configuration (Build).

Inputs: Props/context/events it consumes.

Outputs: Events, derived values, results, or debug UI it emits.

Invariants: Truths that must always hold (e.g. “Tabs never wrap; scroll instead”).

Dependencies: Only on lower-level utilities, shared hooks, or Knowledge; no cross-concern cheating.

3. Atomic Components (per concern)
For each concern in the NL skeleton, list:
Containers – top-level roots for that concern in this configuration.

Subcontainers – nested encapsulations inside Containers.

Primitives – leaves: individual fields, rules, styles, state atoms, maps, result lines.

Rules:
A concern can have one or more Containers at the top level.

Subcontainers only appear inside Containers (never at the root of a concern).

Primitives never contain anything else.

Containers may be:
Flat roots (contain only primitives), or

Hierarchical roots (contain subcontainers and primitives).

4. Decision Rules (What Belongs Where, NL-Aware)
Use these to keep responsibilities clean:
Structure vs interaction vs readout

Changes to regions, zones, section layout → Build.

Visual variants, responsiveness, spacing → BuildStyle / ResultsStyle.

State, validation, transitions, routing → Logic.

Copy, labels, options, thresholds → Knowledge.

Counters, scores, derived summaries → Results.

No structure in non-structural concerns

BuildStyle, Logic, Knowledge, Results, ResultsStyle must not introduce new DOM or change sibling ordering. They attach to anchors established in Build.

Results is “where data ends”

Once you are just showing derived information (e.g., state summaries, counts, debug), it belongs in Results / ResultsStyle; it cannot mutate structure or state.

Knowledge is guidance, not behavior

Tooltips, doc text, label maps, thresholds live in Knowledge and do not contain side effects or layout code.

Use the NL hierarchy to split or merge

If you can’t describe a section of behavior/structure in a single NL bullet under one concern, it’s a sign you have multiple concerns tangled together—split them.

5. Nested vs Sibling Configurations
Nested configuration if all are true:

It attaches to specific anchors owned by a parent configuration.

It cannot operate meaningfully without that parent structure.

It never reorders or replaces the parent’s anchors.

Example: The global header shell includes a nested tab-strip configuration that mounts directly into the header’s Build anchors.

Sibling configuration otherwise:

It uses the same frame (shell) but defines its own Build structure and anchors.

Promote from nested → sibling when a feature gains its own structure, reuse, or lifecycle.

Example: cfg-intro, cfg-q-motivations, and cfg-buildSurface coexist as siblings that the spa host shell swaps within the same main-pane frame.

6. Change Management
When you change a configuration:
Update its NL skeleton first:

Adjust the numbering and text for any moved/added/removed Container/Subcontainer/Primitive.

Then update code:

Adjust Build to match the new NL order.

Update BuildStyle, Logic, Knowledge, Results, ResultsStyle in the same pass, keeping the same ordering and comment numbers.

Preserve anchors if possible:

If anchors must change, treat that as a deliberate breaking change and update all attached concerns.

Acceptance (per PR):

NL skeleton updated and committed.

Build matches NL structure and order.

All other concerns follow the same ordering via comments.

Concerns respect purity and directional dependencies.

Comments (file headers + section headers + atomic comments) present and consistent.
