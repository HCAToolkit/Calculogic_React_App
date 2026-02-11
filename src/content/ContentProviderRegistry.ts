/**
 * Configuration: cfg-contentResolver (Doc Engine Content Resolver Configuration)
 * Concern File: Build
 * Source NL: doc/nl-doc-engine/cfg-contentResolver.md
 * Responsibility: Provide a namespaced provider registry and resolver pipeline for normalized content nodes.
 * Invariants: Content ids must include namespace prefix, registered providers are keyed by namespace, unresolved ids return NotFound.
 */

import { HEADER_DOC_DEFINITIONS } from '../components/GlobalHeaderShell/GlobalHeaderShell.knowledge.ts';

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

// ─────────────────────────────────────────────
// 3. Build – cfg-contentResolver (Doc Engine Content Resolver Configuration)
// NL Sections: §3.1.1–§3.3.9 in cfg-contentResolver.md
// Purpose: Implement service-oriented resolver pipeline with namespace parsing and provider dispatch.
// Constraints: Avoid side effects; preserve deterministic request/response mapping.
// ─────────────────────────────────────────────

// [3.1.1] cfg-contentResolver · Container · "Resolver Pipeline"
// Concern: Build · Parent: "Doc Engine Content Resolver Configuration" · Catalog: service.pipeline
// Notes: Registry owns provider map and executes request intake through output composition.
export class ContentProviderRegistry {
  private providers = new Map<string, ContentProvider>();

  // [3.3.8] cfg-contentResolver · Primitive · "Cache Write"
  // Concern: Build · Parent: "Resolver Pipeline" · Catalog: registry.mutation
  // Notes: Provider map registration stores namespace-to-adapter binding for future resolution.
  registerProvider(namespace: string, provider: ContentProvider) {
    this.providers.set(namespace, provider);
  }

  // [3.2.5] cfg-contentResolver · Subcontainer · "Output Stage"
  // Concern: Build · Parent: "Resolver Pipeline" · Catalog: resolver.output
  // Notes: Emits either content payload from provider or typed NotFound response.
  resolveContent<Context = unknown>({
    contentId,
    anchorId,
    context,
  }: ContentResolutionRequest<Context>): ContentNode | NotFound {
    // [3.2.1] cfg-contentResolver · Subcontainer · "Request Intake"
    // Concern: Build · Parent: "Resolver Pipeline" · Catalog: resolver.input
    // Notes: Namespace parser validates incoming identifiers before provider dispatch.
    const { namespace, resolvedId } = splitNamespace(contentId);

    if (!namespace || !resolvedId) {
      return {
        type: 'not_found',
        contentId,
        reason: 'Content id must include a namespace prefix.',
      };
    }

    // [3.2.2] cfg-contentResolver · Subcontainer · "Adapter Dispatch"
    // Concern: Build · Parent: "Resolver Pipeline" · Catalog: resolver.dispatch
    // Notes: Selects provider by namespace and delegates downstream normalization logic.
    const provider = this.providers.get(namespace);

    if (!provider) {
      return {
        type: 'not_found',
        namespace,
        contentId: resolvedId,
        reason: `No content provider registered for namespace: ${namespace}.`,
      };
    }

    return provider.resolveContent({ contentId: resolvedId, anchorId, context });
  }
}

const DOCS_PROVIDER: ContentProvider = {
  resolveContent: ({ contentId, anchorId }) => {
    const doc = HEADER_DOC_DEFINITIONS[contentId];

    if (!doc) {
      return {
        type: 'not_found',
        namespace: 'docs',
        contentId,
        reason: 'Documentation entry was not found.',
      };
    }

    return {
      type: 'content',
      namespace: 'docs',
      contentId,
      anchorId,
      payload: doc,
    };
  },
};

export const contentProviderRegistry = new ContentProviderRegistry();
contentProviderRegistry.registerProvider('docs', DOCS_PROVIDER);

// [3.3.2] cfg-contentResolver · Primitive · "Scope Parser"
// Concern: Build · Parent: "Request Intake" · Catalog: resolver.parse
// Notes: Splits content id into namespace and provider-local identifier.
export function splitNamespace(contentId: string): { namespace: string | null; resolvedId: string | null } {
  const [namespace, ...rest] = contentId.split(':');
  const resolvedId = rest.join(':');

  if (!namespace || !resolvedId) {
    return { namespace: null, resolvedId: null };
  }

  return { namespace, resolvedId };
}
