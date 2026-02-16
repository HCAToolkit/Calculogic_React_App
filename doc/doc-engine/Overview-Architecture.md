# Overview + Architecture

## Purpose

Doc Engine provides a normalized way to load, resolve, and render structured documentation content in the UI while keeping source-specific logic isolated.

## Scope

- Gather content from one or more providers.
- Resolve references and relationships into display-ready nodes.
- Provide deterministic rendering inputs to consumer UI (e.g., Content Drawer).

## High-level architecture

```text
[Provider(s)] --> [Resolver Pipeline] --> [ContentNode Graph] --> [UI Consumer]
      |                   |                    |                    |
  fetch/raw          normalize/link        typed schema         render state
```

## Core layers

1. **Provider layer**
   - Reads source content (local files, APIs, generated docs).
   - Emits provider-native payloads.
2. **Resolver layer**
   - Transforms provider payloads into ContentNode entities.
   - Resolves links, parents/children, and metadata inheritance.
3. **Presentation layer**
   - Consumes ContentNode graph.
   - Renders in context-specific surfaces (drawer, panels, full-page docs).

## Design goals

- **Provider-agnostic core:** UI and downstream tooling depend on ContentNode, not provider internals.
- **Composable resolution:** Multiple resolvers can run in sequence with clear boundaries.
- **Traceability:** Every node includes source metadata for debugging and provenance.
- **Incremental adoption:** Can bootstrap with one provider and expand without schema churn.
