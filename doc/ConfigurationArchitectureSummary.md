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
- **Layer Order** – Build → View → Logic → Knowledge → Results.
- **Directional Dependencies** – Build feeds View and Logic; Logic feeds Results; Knowledge informs every layer; cycles are forbidden.
- **Stable Anchors** – Every layer exposes deliberate anchors (names, classes, or data attributes) for downstream references.
- **Layer Purity** – Build handles structure, View handles appearance, Logic handles interaction/state, Knowledge handles reference content, and Results handles derived feedback.
- **Locality & Monotonic Diffs** – Each concern is self-contained, and changes cascade predictably in a single direction.

## JSON-First Operation
Guided natural-language templates generate JSON as the single source of truth. Beginners work with plain sentences, intermediates manipulate syntax-aware templates, and advanced users export the JSON for integration elsewhere.

## Versioning & Cloning
Cloning behaves like Git branching. Users fork Build, View, Logic, and Knowledge data from an existing configuration, edit safely, and optionally merge improvements without mutating the source.

## Practical Example: Enneagram Test
- **Build Tab** – Assemble configurations (e.g., checkbox + slider) and validate identifiers and trait links.
- **Logic Tab** – Define conditionals, such as `slider-empathy.value > 7`.
- **View Tab** – Customize appearance via atomic CSS properties.
- **Results Tab** – Calculate personality outcomes from user responses.

## Educational & Systemic Goals
Calculogic transforms form building into a hands-on coding lesson. Each tab enforces separation of concerns while guaranteeing interoperability, supporting sharing, cloning, and officialization across the system.
