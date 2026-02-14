/**
 * Configuration: cfg-contentDrawer (Content Drawer Configuration)
 * Concern File: Logic
 * Source NL: doc/nl-doc-engine/cfg-contentDrawer.md
 * Responsibility: Narrow app-level registry resolution to docs namespace while preserving doc-engine union discriminants.
 * Invariants: Resolver outputs preserve type tags, docs namespace is required, invalid or unsupported ids map to null.
 */

import type { ContentNode, HeaderDocDefinition, NotFound } from './index';
import { contentProviderRegistry } from './contentEngine';

export type DrawerContentResolution = ContentNode<HeaderDocDefinition> | NotFound;

// [5.2] cfg-contentDrawer · Primitive · "Registry Resolution Adapter"
// Concern: Logic · Parent: "Resolver Pipeline" · Catalog: resolver.adapter
// Notes: Preserves canonical resolver discriminants while narrowing to docs namespace.
export function resolveDrawerContent(
  contentId: string,
  anchorId?: string,
): DrawerContentResolution | null {
  const resolved = contentProviderRegistry.resolveContent({
    contentId,
    anchorId,
  });

  if (resolved.namespace !== 'docs') {
    return null;
  }

  if (resolved.type === 'content') {
    return resolved as ContentNode<HeaderDocDefinition>;
  }

  return resolved;
}
