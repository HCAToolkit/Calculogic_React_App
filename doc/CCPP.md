Calculogic Comment & Provenance Protocol (CCPP).
1) Purpose
Comments carry intent, rationale, and provenance—never restate code. They mirror the Build order so readers traverse files the same way the UI is structured.
2) Types (use only these)
File Header (one per file)


What this file is, where it sits in Build order, what it attaches to.


Section Header (top of each major section, in Build order)


What this section does and its constraints.


Inline Rationale (rare; next to non-obvious code)


Why this line/block exists (not what it does).


Decision Note (lightweight ADR)


Record of a local trade-off with date & link/id.


TODO with expiry


Actionable, owner, deadline; auto-fails lint if stale.


Provenance Block (when pulling external logic/content)


Source URL, access time, hash; no payload.


3) Required fields & format
3.1 File Header (all languages)
/**
 * Concern: <Name>
 * Layer: Build | View | Logic | Knowledge | Results
 * BuildIndex: <NN.MM>          // ordering source index
 * AttachesTo: <anchor/selector> // if not Build
 * Responsibility: <one sentence>
 * Invariants: <comma-separated truths>
 * LastDecision: <ADR-<id> or link> (optional)
 */

3.2 Section Header (mirrors Build order)
// [Section 20.10] <SectionName>
// Purpose: <short purpose>
// Inputs: <signals/props/events>
// Outputs: <signals/events>
// Constraints: <key constraints or perf/a11y notes>

3.3 Inline Rationale
// WHY: <reason that isn’t obvious from code/tests>

3.4 Decision Note (micro-ADR in code)
// DECISION: <title> | <YYYY-MM-DD>
// Context: <1 line>
// Choice: <A over B because C>
// Consequence: <1 line>
// ADR: <id or link>    // optional

3.5 TODO with expiry
// TODO(@owner, YYYY-MM-DD): <actionable task>

3.6 Provenance Block (external reference; no content retention)
// SOURCE: <url>
// Accessed: <UTC timestamp>
// Hash: sha256:<...>
// License: <string>
// Note: evidence retained ephemerally; see logs

4) Language & export mapping
Target
Line
Block
TS/JS
//
/** ... */
CSS
/* ... */
/* ... */
HTML
<!-- ... -->
<!-- ... -->
Python
#
"""docblock""" (module/func/class)
JSON
(no inline comments)
Sidecar: <file>.meta.json with the same headers; or embed under "__doc" keys if allowed
Markdown docs
> NOTE:
fenced blocks

JSON rule: never put comments in JSON; use <file>.meta.json with:
{
  "file": "thing.json",
  "header": { "Concern":"...", "Layer":"...", "BuildIndex":"..." },
  "sections": [{ "index":"20.10", "name":"...", "purpose":"..." }]
}

5) BOS alignment (Build-as-Order Source)
File Header must include BuildIndex.


Section Headers must appear in ascending Build order.


View/Logic/Knowledge/Results may not introduce new structural sections—only attach via AttachesTo.


6) Strict do/don’t
Do
Explain why, list invariants, cite decisions, add expiry to TODOs, include provenance for externals.
 Don’t


Narrate obvious code, duplicate names/types, leave TODOs without owner/date, paste external payloads.


7) Lint & CI checks (lightweight)
Headers present (File + every Section).


Monotonic order of [Section NN.MM].


TODO expiry not past due.


No plain “TODO:” without owner/date.


No comments in JSON (enforce sidecar).


Provenance required when external refs detected (e.g., http/https in strings).


8) Knowledge integration
Treat Knowledge as the upstream source of comment text.


On export, render Knowledge entries into the appropriate comment syntax per target.


Keep Knowledge canonical; code comments are projections.


9) Minimal examples
TSX (View)
/**
 * Concern: BuilderShell
 * Layer: View
 * BuildIndex: 01.00
 * AttachesTo: .builder-shell
 * Responsibility: Responsive frame chrome (no behavior)
 * Invariants: No overflow; keyboard focus ring visible
 */
export function BuilderShellView(){...}

// [Section 01.10] Header
// Purpose: Global header chrome & tabs
// Inputs: layoutMode
// Outputs: none
// Constraints: sticky; min-height 56px

Logic (TS)
/**
 * Concern: AtomicComponents
 * Layer: Logic
 * BuildIndex: 20.00
 * AttachesTo: #atoms-canvas
 * Responsibility: DnD + selection
 * Invariants: No structure mutation; anchors are stable
 * LastDecision: ADR-042
 */

// DECISION: Keyboard reordering over mouse-only | 2025-10-20
// Context: a11y requirement
// Choice: Arrow+Enter beats drag-only
// Consequence: extra focus mgmt; simpler pointer code

Provenance
// SOURCE: https://example.org/a11y/drag-guidance
// Accessed: 2025-10-20T15:04:12Z
// Hash: sha256:9b7c…3ad
// License: CC-BY 4.0

10) Maintenance rules
When structure changes in Build, update Section Headers and BuildIndex across layers in the same PR.


When a Decision changes, append a new DECISION block; don’t edit history.


Purge or convert stale TODOs during each release cut.


That’s the whole method: five comment types, Build-ordered structure, language-aware export, sidecar for JSON, lintable rules, and Knowledge as the single source for comment content.