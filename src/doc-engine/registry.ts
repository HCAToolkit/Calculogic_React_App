/**
 * Configuration: cfg-contentResolver (Doc Engine Content Resolver Configuration)
 * Concern File: Build
 * Source NL: doc/nl-doc-engine/cfg-contentResolver.md
 * Responsibility: Provide a namespaced provider registry and resolver pipeline for normalized content outcomes.
 * Invariants: Content ids must include namespace prefix, registered providers are keyed by namespace, resolver never returns null.
 */

import type {
  ContentProvider,
  ContentResolutionRequest,
  ContentResolutionResult,
  ParsedContentRef,
} from './types.ts';

export class ContentProviderRegistry {
  private providers = new Map<string, ContentProvider>();

  registerProvider(namespace: string, provider: ContentProvider) {
    this.providers.set(namespace, provider);
  }

  resolveContent<Context = unknown>({
    contentId,
    anchorId,
    context,
  }: ContentResolutionRequest<Context>): ContentResolutionResult {
    const parsedRef = parseContentRef(contentId);

    if (parsedRef.type === 'invalid_ref') {
      return parsedRef;
    }

    const { namespace, resolvedId } = parsedRef;
    const provider = this.providers.get(namespace);

    if (!provider) {
      return {
        type: 'unsupported_namespace',
        namespace,
        contentId: resolvedId,
        reason: `No content provider registered for namespace: ${namespace}.`,
      };
    }

    return provider.resolveContent({ contentId: resolvedId, anchorId, context });
  }
}

// [3.3.2] cfg-contentResolver · Primitive · "Scope Parser"
// Concern: Build · Parent: "Request Intake" · Catalog: resolver.parser
// Notes: Produces valid parsed refs or canonical invalid_ref outcomes used by resolver contract tests.
export function parseContentRef(contentId: string): ParsedContentRef {
  const [namespace, ...rest] = contentId.split(':');
  const resolvedId = rest.join(':');

  if (!namespace || !resolvedId) {
    return {
      type: 'invalid_ref',
      contentId,
      reason: 'Content id must include a namespace prefix and payload (namespace:id).',
    };
  }

  return {
    type: 'valid',
    namespace,
    resolvedId,
  };
}

export function splitNamespace(contentId: string): { namespace: string | null; resolvedId: string | null } {
  const parsedRef = parseContentRef(contentId);

  if (parsedRef.type === 'invalid_ref') {
    return { namespace: null, resolvedId: null };
  }

  return {
    namespace: parsedRef.namespace,
    resolvedId: parsedRef.resolvedId,
  };
}
