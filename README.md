# Calculogic React App

_Curious how AI-assisted development works across HCAToolkit projects? See the [organization overview](https://github.com/HCAToolkit/.github/blob/main/profile/README.md#ai-assisted-development)._

Calculogic grew from earlier H-CAT work on structured character-development tools, including forms, quizzes, scoring, and reusable, configurable logic. As those needs expanded beyond the original character-development use case, Calculogic evolved into a broader system-building project; this repository contains the current React implementation of that evolving project.

A modular React + TypeScript builder shell for composing configuration-driven workflows. The current app includes a global header shell, a build workspace with resizable panels, and a content drawer backed by namespaced content resolution.

The current standalone and authoritative Validator implementation source is [`HCAToolkit/calculogic-validator`](https://github.com/HCAToolkit/calculogic-validator), and it is the normal home for current standalone Validator development. The `calculogic-validator/` directory in this repository is the retained pre-extraction implementation; the React app's current default package configuration still resolves the Validator and report-capture packages from that embedded tree. Migration to standalone package consumption is a [staged implementation path tracked in issue #695](https://github.com/HCAToolkit/Calculogic_React_App/issues/695).

---

## Table of Contents

1. [Features (Current)](#features-current)
2. [Current Tech Stack (Implemented)](#current-tech-stack-implemented)
3. [Future Additions (Planned)](#future-additions-planned)
4. [Getting Started](#getting-started)
5. [Current Scripts](#current-scripts)
6. [Project Structure (Current)](#project-structure-current)
7. [Roadmap (Planned)](#roadmap-planned)
8. [Configuration Architecture](#configuration-architecture)
9. [Calculogic Concern System (CCS)](#calculogic-concern-system-ccs)
10. [Comment & Provenance Protocol (CCPP)](#comment--provenance-protocol-ccpp)

---

## Features (Current)

- Global header shell with Build / Logic / Knowledge / Results tabs and mode controls.
- Build tab layout with draggable/resizable panels and persisted dimensions.
- Context-driven content drawer that resolves `docs:<id>` payloads.
- Type-safe configuration-oriented structure following CCS + CCPP conventions.

## Current Tech Stack (Implemented)

### Runtime

- React 19
- React DOM 19
- React Router DOM 7
- Zustand
- react-resizable-panels
- json-logic-js
- mustache

### Tooling

- TypeScript 5
- Vite 6
- ESLint 9 + typescript-eslint
- Node.js built-in test runner (`node --test`) for unit tests

## Future Additions (Planned)

These are intentionally planned but not yet baseline in this repository:

- Prettier formatting pipeline
- Jest and/or React Testing Library integration for component-level testing
- CI quality gates that enforce lint/build/test on every pull request
- Expanded integration test coverage for builder interactions

## Getting Started

### Prerequisites

- Node.js 22+
- npm

Codespaces/devcontainer baseline is documented in `.devcontainer/README.md`.

### Install

```bash
git clone https://github.com/HCAToolkit/Calculogic_React_App.git
cd Calculogic_React_App
npm install
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:5173`.

## Current Scripts

```bash
npm run dev              # Start Vite dev server
npm run lint             # Run ESLint
npm run build            # Type-check + production build
npm test                 # Run unit tests with node:test
npm run preview          # Preview the built app locally
npm run validate:naming  # Run validator naming workflow
npm run validate:all     # Run full validator suite workflow
npm run health:validator # Run validator environment/health checks
# Optional report capture workflows:
# npm run report:naming:*
# npm run report:all:*
```

In a default React-app checkout, these scripts use the packages resolved from the embedded `calculogic-validator/` tree; see `calculogic-validator/README.md` for workflow and report-command documentation matching that current package configuration. For current Validator development and standalone package documentation, use the authoritative [`HCAToolkit/calculogic-validator`](https://github.com/HCAToolkit/calculogic-validator) repository. Migration of this app's package consumption is tracked in [issue #695](https://github.com/HCAToolkit/Calculogic_React_App/issues/695) and is not current runtime truth.

## Project Structure (Current)

```text
/
├─ calculogic-doc-engine/              # @calculogic/doc-engine package root
│  ├─ doc/                             # Canonical package docs for doc-engine
│  │  ├─ Hub/                          # Package-owned integration and governance docs
│  │  └─ Standards/                    # Package-owned standards docs
│  ├─ src/
│  └─ test/
├─ calculogic-validator/               # Retained pre-extraction Validator; used by default package wiring
│  ├─ doc/
│  │  └─ ConventionRoutines/           # Validator-owned convention routines
│  ├─ src/
│  ├─ test/
│  ├─ tools/
│  └─ scripts/
├─ doc/                                # Host app docs and architecture notes
├─ public/                             # Static assets copied by Vite
├─ src/
│  ├─ assets/
│  ├─ components/
│  │  ├─ ContentDrawer/
│  │  └─ GlobalHeaderShell/
│  ├─ content/
│  │  ├─ packs/
│  │  └─ providers/
│  ├─ shared/
│  ├─ tabs/
│  │  ├─ BuildTab.tsx                  # Build tab entry
│  │  └─ build/                        # Build surface modules
│  ├─ App.tsx                          # Top-level app composition
│  ├─ app.logic.ts                     # App-level logic wiring
│  ├─ App.css
│  ├─ index.css
│  └─ main.tsx                         # React entrypoint
├─ test/
│  ├─ build-surface-utils.test.mjs
│  ├─ content-drawer-anchor.test.mjs
│  └─ doc-engine-package-boundary.test.mjs
├─ .reports/                           # Generated by report capture; typically gitignored
├─ eslint.config.js
├─ index.html
├─ package.json
├─ package-lock.json
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```

### Package and documentation ownership notes

- Canonical doc-engine package documentation lives under `calculogic-doc-engine/doc/**`.
- `doc/doc-engine/**` in this host repo is host-facing historical/working material unless a package hub explicitly marks an item canonical.
- **Standalone source and development authority:** The current Validator implementation source and standalone package/development documentation are owned by the standalone [`HCAToolkit/calculogic-validator`](https://github.com/HCAToolkit/calculogic-validator) repository.
- **Current implementation reality:** The embedded `calculogic-validator/` tree is the retained pre-extraction implementation and supplies the Validator and report-capture packages for this app's default package configuration; it is not a second authoritative source.
- **React-repo documentation reality:** Active contributor guidance in `AGENTS.md` and the convention entrypoints under `doc/ConventionRoutines/` still resolve through the embedded Validator tree. Their authority/pointer migration is outside this README clarification.
- **Staged implementation path:** [Issue #695](https://github.com/HCAToolkit/Calculogic_React_App/issues/695) tracks migration of this app to standalone package consumption; that migration is not current runtime truth.

## Roadmap (Planned)

- Converge transitional content adapter usage onto the canonical provider registry API.
- Break down larger logic modules (especially build surface interactions) into smaller focused utilities/hooks.
- Expand unit + integration tests around resizing, content resolution, and state persistence.
- Add CI automation for lint/build/test enforcement.

## Configuration Architecture

- External architecture document: <https://docs.google.com/document/d/1UNlEDQTqWKbuq2QIFNIhYWxzMzj_opopgXu4QIScZKA/edit>
- Local summary: `doc/Architecture/ConfigurationArchitectureSummary.md`

## Calculogic Concern System (CCS)

The CCS defines concern boundaries and dependency direction across Build / BuildStyle / Logic / Knowledge / Results.

- Spec: `calculogic-validator/doc/ConventionRoutines/CCS.md`
- Doc-engine mapping: `doc/Architecture/DocEngine-CCS-Mapping.md`

Conventions are Validator-owned so they can be reused across repositories. The standalone [`HCAToolkit/calculogic-validator`](https://github.com/HCAToolkit/calculogic-validator) repository is the authoritative Validator implementation source and home for standalone package/development documentation. For current contributor guidance in this React repository, `doc/ConventionRoutines/CCS.md` remains an active entrypoint that resolves to the retained embedded spec listed above.

## Comment & Provenance Protocol (CCPP)

CCPP defines file headers, section/atomic comments, decision notes, and provenance annotations.

Conventions are Validator-owned so they can be reused across repositories. The standalone [`HCAToolkit/calculogic-validator`](https://github.com/HCAToolkit/calculogic-validator) repository is the authoritative Validator implementation source and home for standalone package/development documentation. For current contributor guidance in this React repository, `doc/ConventionRoutines/CCPP.md` remains an active entrypoint that resolves to the retained embedded spec listed below.

- Spec: `calculogic-validator/doc/ConventionRoutines/CCPP.md`
