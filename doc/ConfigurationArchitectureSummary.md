# Configuration Architecture in Calculogic

## Overview
Calculogic empowers non-developers to assemble sophisticated forms and quizzes. The platform treats every form as a composition of reusable configurations assembled from atomic UI and logic components. This unifies form-building, programming education, and no-code design within one ecosystem.

## Core Concepts
- **Form / Quiz** – A deployable collection of configurations that end users complete.
- **Configuration** – A user-defined blueprint (for example, "checkbox + slider + label") that can be reused and cloned without altering the original.
- **Atomic Component** – The smallest UI or logic primitive (such as HTML inputs, CSS properties, or JavaScript functions) used to compose configurations.
- **Clone** – An editable copy of a configuration that preserves the source configuration.

## Trifecta Vision
Calculogic delivers three experiences in parallel:
1. **Form & Quiz Builder** – Users drag and drop entire configurations instead of isolated inputs.
2. **Programming Learning Environment** – Tabs mirror learning stages, moving from natural-language Mad Libs to JSON manifests.
3. **No-Code Interface** – Dropdowns and toggles provide guardrails, while syntax and reference validation prevent errors.

## Architectural Principles
- **Layer Order** – Build → BuildStyle → Logic → Knowledge → Results → ResultsStyle.
- **Directional Dependencies** – Build feeds BuildStyle and Logic; Logic feeds Results; Knowledge informs every layer; Results in turn inform ResultsStyle; cycles are forbidden.
- **Stable Anchors** – Every layer exposes deliberate anchors (names, classes, or data attributes) for downstream references.
- **Layer Purity** – Build handles structure, BuildStyle handles appearance of configuration surfaces, Logic handles interaction/state, Knowledge handles reference content, Results handles derived feedback, and ResultsStyle handles presentation of those results.
- **Locality & Monotonic Diffs** – Each concern is self-contained, and changes cascade predictably in a single direction.

## JSON-First Operation
Guided natural-language templates generate JSON as the single source of truth. Beginners work with plain sentences, intermediates manipulate syntax-aware templates, and advanced users export the JSON for integration elsewhere.

In earlier drafts, “View” referred to visual treatment across both configuration and results experiences; this is now split into BuildStyle (for configuration surfaces) and ResultsStyle (for result surfaces).

## Versioning & Cloning
Cloning behaves like Git branching. Users fork Build, BuildStyle, Logic, and Knowledge data from an existing configuration, edit safely, and optionally merge improvements without mutating the source.

## Practical Example: Enneagram Test
- **Build Tab** – Assemble configurations (e.g., checkbox + slider) and validate identifiers and trait links.
- **BuildStyle Tab** – Customize appearance of configuration surfaces via atomic CSS properties.
- **Logic Tab** – Define conditionals, such as `slider-empathy.value > 7`.
- **Knowledge Tab** – Centralize reference data and static instructional copy for the configuration.
- **Results Tab** – Calculate personality outcomes from user responses.
- **ResultsStyle Tab** – Present computed outcomes in a consistent, styled surface.

## Educational & Systemic Goals
Calculogic transforms form building into a hands-on coding lesson. Each tab enforces separation of concerns while guaranteeing interoperability, supporting sharing, cloning, and officialization across the system.

## Related Docs / Reading Order
1. ConfigurationArchitectureSummary.md (this document)
2. CSCS.md (Concern semantics and file mappings)
3. General-NL-Skeletons.md (Canonical NL skeleton templates)
4. NL-First-Workflow.md (Authoring workflow)
5. CCPP.md (Comment and provenance protocol)
6. doc/nl-config/*.md and doc/nl-shell/*.md (Per-configuration and shell specifications built from the skeletons)
