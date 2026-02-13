/**
 * Configuration: cfg-contentResolver (Doc Engine Content Resolver Configuration)
 * Concern File: Knowledge
 * Source NL: doc/nl-doc-engine/cfg-contentResolver.md
 * Responsibility: Define normalized contracts for content resolution requests, content payloads, and not-found responses.
 * Invariants: Types preserve namespace-prefixed content addressing and deterministic resolver response union.
 */

export interface ContentResolutionRequest<Context = unknown> {
  contentId: string;
  anchorId?: string;
  context?: Context;
}

export interface ContentNode<Payload = unknown> {
  type: 'content';
  namespace: string;
  contentId: string;
  anchorId?: string;
  payload: Payload;
}

export interface NotFound {
  type: 'not_found';
  namespace?: string;
  contentId: string;
  reason: string;
}

export interface ContentProvider<Context = unknown, Payload = unknown> {
  resolveContent: (request: ContentResolutionRequest<Context>) => ContentNode<Payload> | NotFound;
}
