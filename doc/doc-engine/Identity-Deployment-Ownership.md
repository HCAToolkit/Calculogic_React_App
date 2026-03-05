# Doc-Engine Identity, Deployment, and Ownership (Canonical)

## 1) Purpose

Doc-engine exists to provide a portable, UI-agnostic content resolution system that any host UI (including this interface app, other UIs, and plugin surfaces) can call through a stable contract.

It is designed around:

- deterministic resolution,
- pluggable providers,
- stable content identity,
- normalized outcomes.

Non-goals:

- It is not a UI component system.
- It is not coupled to one repo's folder layout or one app's drawer implementation.
- It must not assume a single host application as the only consumer.

## 2) Terminology

- **DocNode**: canonical normalized document payload shape returned by doc-engine. In this repo, historical references to `ContentNode` mean the same normalized node and are treated as the current type name until a rename is executed.
- **docId/contentId**: stable content identity key, typically namespaced (for example `docs:doc-build`).
- **anchorId**: optional stable target within a document/node for deep linking.
- **ContextEnvelope**: optional call context metadata for routing/analytics/policy that must not change doc identity.

Supporting terms:

- **Doc Store**: one or more underlying sources of content (static packs, plugin sources, DB-backed stores).
- **Resolver**: deterministic orchestration pipeline that maps request -> normalized outcome.
- **Registry**: routing/lookup map from namespace/capability to provider.
- **Provider**: source adapter implementing contract-compatible resolution from one store class.

## 3) Two-Layer Model

### Layer A: Doc-Engine Core (Package Boundary)

Contains:

- contracts and types,
- resolver pipeline and normalized outcomes,
- registry abstractions,
- normalization and validation utilities.

Must not contain:

- UI components,
- host app orchestration,
- app-specific content packs,
- app wiring/state management.

### Layer B: Doc-Engine Runtime (Engine/Service Boundary)

Becomes relevant when DB-backed docs, user/project docs, governed search, indexing, or policy enforcement is required.

This runtime may be either:

- a standalone service/subsystem, or
- a module merged into the headless runtime engine.

Runtime exposes a stable API that returns core-contract outcomes:

- `Found`,
- `Missing`,
- `NoProvider`,
- `InvalidRef`.

## 4) Deployment Modes

### Embedded Mode

- Host UI imports doc-engine core package.
- Providers are registered in-process by the host.
- Best for local/dev simplicity, low-latency local resolution, and offline-friendly operation.

### Remote Mode

- Host UI calls runtime API (HTTP/IPC).
- Runtime uses core contracts internally.
- Best for centralized governance, shared indexing/search controls, and unified DB-backed access.

Tradeoffs:

- **Latency**: embedded is typically lower per-call latency; remote adds network hop.
- **Governance/source-of-truth**: remote centralizes policy and lifecycle controls.
- **DB access**: remote can directly enforce DB/data policy boundaries; embedded can avoid DB entirely.
- **Dev/offline simplicity**: embedded is simpler for isolated local workflows.

## 5) Doc Store Sources (Deterministic, Multi-Source)

Doc-engine supports deterministic resolution across multiple source classes:

- bundled/static docs,
- plugin-provided docs (installed/registered),
- repo-provided docs (official packs from this or other repos),
- user/project docs in DB.

Rule: **document identity remains stable while source can vary by trust/visibility tier**.

## 6) DB Relationship Model

When runtime mode is used, doc-engine runtime requires access to the same DB cluster(s) used by the headless runtime engine (shared infra), while preserving clear ownership boundaries.

Two valid patterns:

- **Shared tables**: doc-engine reads doc-like records that are stored with user configuration records.
- **Dedicated schema/tables**: doc-engine owns doc-specific tables while sharing database infrastructure.

Embedded mode can operate without DB dependencies.

## 7) Ownership Boundaries (What Lives Where)

- **Host UI repo owns**:
  - content drawer shell and rendering composition,
  - UI state orchestration,
  - provider registration wiring,
  - app-specific content packs and host-specific providers.

- **Doc-engine core package/repo owns**:
  - contracts/types,
  - resolver/registry,
  - normalization pipeline,
  - provider interfaces and deterministic outcome semantics.

- **Doc-engine runtime (if separated) owns**:
  - DB adapters,
  - governance/search/indexing subsystems,
  - official/runtime provider packs (if shipped centrally).

## 8) Extraction Strategy

- **Phase 0 (current)**: incubate in this repo with strict boundary discipline.
- **Phase 1**: extract core as `@calculogic/doc-engine` package.
- **Phase 2**: decide runtime topology:
  - standalone runtime service, or
  - merged module in headless runtime engine.

Keep-contracts-stable checklist:

- preserve outcome union semantics (`Found | Missing | NoProvider | InvalidRef`),
- preserve identity fields (`docId/contentId`, `anchorId`, `ContextEnvelope` behavior),
- preserve deterministic resolver behavior,
- preserve host/runtime parity of normalized response shape.

## 9) Repo-Organization Implications (Decision Support)

In this repo today:

- keep host UI artifacts under `src/components/*`, `src/content/*`, and app composition layers,
- keep core-boundary implementation under `src/doc-engine/*` with import discipline,
- treat runtime/DB adapters as separate-phase artifacts (do not leak into host UI folders).

Owner-root rules:

- any artifact implementing core contracts/resolver/registry belongs to the doc-engine owner-root,
- any artifact implementing drawer visuals or app orchestration belongs to host/UI owner-root,
- any DB/governance/search adapter belongs to runtime owner-root (even if co-deployed with headless runtime engine).
