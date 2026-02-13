/**
 * Configuration: cfg-contentDrawer (Content Drawer Configuration)
 * Concern File: Logic
 * Source NL: doc/nl-doc-engine/cfg-contentDrawer.md
 * Responsibility: Adapt doc-engine registry responses into the drawer's render model.
 * Invariants: Resolution delegates to app content engine, unknown namespaces return null, and missing docs emit deterministic missing payloads.
 */

import { contentProviderRegistry } from './contentEngine.ts';
import type { HeaderDocDefinition } from '../doc-engine/index.ts';

export type ContentResolution =
  | {
      kind: 'doc';
      contentId: string;
      doc: HeaderDocDefinition;
    }
  | {
      kind: 'missing';
      contentId: string;
    };

// [5.2] cfg-contentDrawer · Primitive · "Provider Resolution"
// Concern: Logic · Parent: "Resolver Pipeline" · Catalog: resolver.dispatch
// Notes: Delegates to app-owned registry and maps doc-engine responses to drawer render model.
export function resolveContent(contentId: string, anchorId?: string | null): ContentResolution | null {
  const resolved = contentProviderRegistry.resolveContent({
    contentId,
    anchorId: anchorId ?? undefined,
  });

  if (resolved.type === 'not_found') {
    if (!resolved.namespace || resolved.namespace === 'docs') {
      return {
        kind: 'missing',
        contentId,
      };
    }
    return null;
  }

  if (resolved.namespace !== 'docs') {
    return null;
  }

  return {
    kind: 'doc',
    contentId,
    doc: resolved.payload as HeaderDocDefinition,
  };
}
