/**
 * Configuration: cfg-contentResolver (Doc Engine Content Resolver Configuration)
 * Concern File: Knowledge
 * Source NL: doc/nl-doc-engine/cfg-contentResolver.md
 * Responsibility: Define normalized contracts for content resolution requests and typed resolution outcomes.
 * Invariants: Types preserve namespace-prefixed content addressing and deterministic resolver response union.
 */

export interface ContentResolutionRequest<Context = unknown> {
  contentId: string;
  anchorId?: string;
  context?: Context;
}

export interface FoundContent<Payload = unknown> {
  type: 'found';
  namespace: string;
  contentId: string;
  anchorId?: string;
  payload: Payload;
}

export interface NotFound {
  type: 'not_found';
  namespace: string;
  contentId: string;
  reason: string;
}

export interface UnsupportedNamespace {
  type: 'unsupported_namespace';
  namespace: string;
  contentId: string;
  reason: string;
}

export interface InvalidRef {
  type: 'invalid_ref';
  contentId: string;
  reason: string;
}

export type ContentResolutionResult<Payload = unknown> =
  | FoundContent<Payload>
  | NotFound
  | UnsupportedNamespace
  | InvalidRef;

export interface ParsedContentRefValid {
  type: 'valid';
  namespace: string;
  resolvedId: string;
}

export interface ParsedContentRefInvalid {
  type: 'invalid_ref';
  contentId: string;
  reason: string;
}

export type ParsedContentRef = ParsedContentRefValid | ParsedContentRefInvalid;

export interface ContentProvider<Context = unknown, Payload = unknown> {
  resolveContent: (
    request: ContentResolutionRequest<Context>,
  ) => FoundContent<Payload> | NotFound;
}
