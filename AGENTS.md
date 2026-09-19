# AGENTS.md

## Scope, Inheritance, and Purpose

This file applies to the entire React-app repository. More-specific `AGENTS.md`
files add instructions for their directory trees; in particular,
`calculogic-validator/AGENTS.md` owns guidance specific to the retained embedded
Validator and inherits this file.

Use docs-first, deterministic, ownership-aligned changes. Prefer structures that
make ownership, responsibility, role, and extraction boundaries obvious.

## Repository and Validator Authority Boundary

- This repository owns the React application, its integration surfaces, and its
  package-consumption configuration.
- `calculogic-validator/` is the retained pre-extraction Validator and is the
  app's current default dependency. Its checked-in implementation and docs are
  needed to describe and operate **current runtime truth** in this checkout.
- The standalone
  [`HCAToolkit/calculogic-validator`](https://github.com/HCAToolkit/calculogic-validator)
  repository is the authoritative source for new Validator development and
  standalone package/development documentation. Do not treat this embedded copy
  as a competing development authority.
- Migration of this app to linked or otherwise standalone package consumption is
  a **staged implementation path** tracked by issue #695 and is **not current
  runtime truth**. Do not change package resolution, links, manifests, lockfiles,
  scripts, or remove the embedded Validator unless a task explicitly owns that
  migration.
- Keep cross-repository changes ownership-aligned: change React-app integration
  here; make independently owned Validator product changes in the standalone
  repository. A task must explicitly authorize changes in each repository it
  touches.

## Issue vs PR Discipline

- Issues hold planning context, deferred scope, roadmap notes, ADR context, and
  explicit “not this PR” boundaries.
- PRs hold durable repository changes only.
- Do not copy broad issue-planning language into repo docs unless it is stable
  implementation truth.
- Default to `Refs #...` or `Implements part of #...` in PR bodies.
- Do not use closing keywords such as `Closes #...`, `Fixes #...`, or
  `Resolves #...` unless the human owner explicitly asks for automatic issue
  closure.
- Let the human owner close planning, architecture, roadmap, registry, and
  validator alignment issues manually after review.

## Repository-Wide Baseline References

Before making changes, read these binding convention routines from the React-app
repository root:

1. `calculogic-validator/doc/ConventionRoutines/CCPP.md`
2. `calculogic-validator/doc/ConventionRoutines/CCS.md`
3. `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
4. `doc/ConventionRoutines/General-NL-Skeletons.md`
5. `doc/ConventionRoutines/NL-First-Workflow.md`

Also read the narrowest relevant repository or package README, including
`README.md` for app and integration work and `calculogic-validator/README.md`
for operation of the retained embedded Validator. If any always-read canonical
convention document is missing, stop and report it clearly rather than inventing
a replacement.

Paths in this file are relative to the React-app repository root. Commands shown
in the root `README.md`, root `package.json`, or embedded Validator README as
“repo root” commands must be run from the React-app repository root. Within
`calculogic-validator/AGENTS.md`, paths are explicitly identified as either
embedded-Validator-relative or React-app-root-relative.

Validator-owned convention docs in the embedded tree remain the active local
convention entrypoints for this checkout. That local path fact preserves current
integration behavior; it does not make the embedded implementation the authority
for new standalone Validator development.

## Repository-Wide Workflow and Architecture Guardrails

- Follow NL-first when task scope touches structure, behavior, contracts,
  validators, registries, shells, configs, or features: update the relevant NL
  skeleton or canonical document first, then implementation.
- Maintain concern purity and dependency direction per CCS.
- Maintain comment and provenance discipline per CCPP.
- Treat Validator-owned convention docs as canonical when repo-local pointer
  docs also exist.
- Treat `FileNamingMasterList-V1_1.md` as the canonical naming authority for
  filename grammar, role taxonomy, category/status vocabulary, and naming
  change-control.
- Prefer clean ownership boundaries, modular decomposition, future extraction
  paths, deterministic organization, extensibility, fidelity to developer mental
  models, and bounded semantic modeling over generic catch-all structures.
- Do not finalize open or deferred decisions from draft documents. Drafts bind
  only the current repository usage they explicitly close.

## React-App and Integration Responsibilities

- The React app owns its UI structure, behavior, content integration, app-facing
  documentation, and the scripts/configuration by which it consumes packages.
- Preserve the concern split and directional dependencies across Build,
  BuildStyle, Logic, Knowledge, Results, and ResultsStyle.
- Preserve current package-consumption and command behavior unless a task
  explicitly changes an integration contract.
- Generated or package-provided output may be consumed by the app, but the app
  must not silently become a competing source of package policy truth.
- When work spans the app and an embedded package, identify which repository or
  package owns each durable change and keep host adapters separate from package
  internals.

## Precise Status Wording

Use these exact phrases when describing state:

- current runtime truth
- current implementation reality
- target architecture
- not current runtime truth
- staged implementation path

Avoid vague sticky wording in durable repo docs, such as “maybe later,” “future
possible,” “deferred someday,” “do not implement,” and “not yet,” unless the
document is explicitly a roadmap, issue-derived plan, or transitional inventory.

## Docs Task Fidelity

- For docs tasks with required sections or acceptance criteria, preserve each
  required section unless it conflicts with current repo truth.
- Do not satisfy a structural docs task with wording cleanup only unless the
  issue explicitly asks for wording cleanup only.
- Keep task-scoped supporting references task-scoped; do not add them to the
  global convention set unless they are stable, repository-wide requirements.

## Task Boundaries and Verification

- Keep PRs narrowly scoped to the requested issue.
- Do not modify runtime code, registry payloads, loaders, workflows, templates,
  existing specs, or package wiring unless explicitly requested.
- Run the narrowest relevant checks for touched files.
- If target filtering excludes touched files, note the limitation and do not
  broaden scope.
- If any verification command is run, record the exact command and outcome in
  the PR body or PR comment.
