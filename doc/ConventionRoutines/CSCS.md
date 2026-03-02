# CSCS — Concern Separation & Coupling Strategy

## Purpose
Define boundaries between concerns so changes stay modular and dependency flow remains one-directional.

## Core Rules
1. Keep each file focused on a single concern.
2. Prefer composition over cross-layer coupling.
3. Dependency direction should flow from high-level orchestration to low-level utilities.
4. Avoid circular dependencies between modules and docs.
5. Configuration and documentation changes should not introduce behavioral coupling unless explicitly required.

## Change Checklist
- Identify impacted concern(s) before editing.
- Keep behavior, configuration, and documentation updates in their own scoped edits.
- Validate that dependency direction is preserved.
