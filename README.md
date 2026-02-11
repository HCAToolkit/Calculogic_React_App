# Calculogic React App

A modular React + TypeScript builder shell for composing configuration-driven workflows. The current app includes a global header shell, a build workspace with resizable panels, and a content drawer backed by namespaced content resolution.

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
9. [Calculogic-Style Concern System (CSCS)](#calculogic-style-concern-system-cscs)
10. [Comment & Provenance Protocol (CCPP)](#comment--provenance-protocol-ccpp)

---

## Features (Current)

- Global header shell with Build / Logic / Knowledge / Results tabs and mode controls.
- Build tab layout with draggable/resizable panels and persisted dimensions.
- Context-driven content drawer that resolves `docs:<id>` payloads.
- Type-safe configuration-oriented structure following CSCS + CCPP conventions.

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

### Install

```bash
git clone https://github.com/your-org/Calculogic_React_App.git
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
npm run dev      # Start Vite dev server
npm run lint     # Run ESLint
npm run build    # Type-check + production build
npm test         # Run unit tests with node:test
npm run preview  # Preview the built app locally
```

## Project Structure (Current)

```text
/
├─ doc/                                # Architecture and NL-first workflow docs
├─ public/                             # Static assets copied by Vite
├─ src/
│  ├─ assets/                          # App assets
│  ├─ components/
│  │  ├─ ContentDrawer/                # Drawer build/style and anchor utility
│  │  └─ GlobalHeaderShell/            # Build/logic/knowledge/results concerns
│  ├─ content/                         # Content context + provider registry/adapter
│  ├─ content-drawer/                  # Shared content drawer domain types/providers
│  ├─ tabs/
│  │  ├─ BuildTab.tsx                  # Build tab entry
│  │  └─ build/                        # BuildSurface build/style/logic + anchors
│  ├─ App.tsx                          # Top-level app composition
│  ├─ App.logic.ts                     # App-level logic wiring
│  └─ main.tsx                         # React entrypoint
├─ eslint.config.js
├─ package.json
├─ tsconfig*.json
└─ vite.config.ts
```

## Roadmap (Planned)

- Converge transitional content adapter usage onto the canonical provider registry API.
- Break down larger logic modules (especially build surface interactions) into smaller focused utilities/hooks.
- Expand unit + integration tests around resizing, content resolution, and state persistence.
- Add CI automation for lint/build/test enforcement.

## Configuration Architecture

- External architecture document: <https://docs.google.com/document/d/1UNlEDQTqWKbuq2QIFNIhYWxzMzj_opopgXu4QIScZKA/edit>
- Local summary: `doc/Architecture/ConfigurationArchitectureSummary.md`

## Calculogic-Style Concern System (CSCS)

The CSCS defines concern boundaries and dependency direction across Build / BuildStyle / Logic / Knowledge / Results.

- Spec: `doc/ConventionRoutines/CSCS.md`
- Doc-engine mapping: `doc/Architecture/DocEngine-CSCS-Mapping.md`

## Comment & Provenance Protocol (CCPP)

CCPP defines file headers, section/atomic comments, decision notes, and provenance annotations.

- Spec: `doc/ConventionRoutines/CCPP.md`
