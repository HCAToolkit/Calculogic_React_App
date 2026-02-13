/**
 * Configuration: cfg-contentResolver (Doc Engine Content Resolver Configuration)
 * Concern File: Build
 * Source NL: doc/nl-doc-engine/cfg-contentResolver.md
 * Responsibility: Provide a namespaced provider registry and resolver pipeline for normalized content nodes.
 * Invariants: Content ids must include namespace prefix, registered providers are keyed by namespace, unresolved ids return NotFound.
 */

import type { ContentNode, ContentProvider, ContentResolutionRequest, NotFound } from './types.ts';

export class ContentProviderRegistry {
  private providers = new Map<string, ContentProvider>();

  registerProvider(namespace: string, provider: ContentProvider) {
    this.providers.set(namespace, provider);
  }

  resolveContent<Context = unknown>({
    contentId,
    anchorId,
    context,
  }: ContentResolutionRequest<Context>): ContentNode | NotFound {
    const { namespace, resolvedId } = splitNamespace(contentId);

    if (!namespace || !resolvedId) {
      return {
        type: 'not_found',
        contentId,
        reason: 'Content id must include a namespace prefix.',
      };
    }

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

export function splitNamespace(contentId: string): { namespace: string | null; resolvedId: string | null } {
  const [namespace, ...rest] = contentId.split(':');
  const resolvedId = rest.join(':');

  if (!namespace || !resolvedId) {
    return { namespace: null, resolvedId: null };
  }

  return { namespace, resolvedId };
}
