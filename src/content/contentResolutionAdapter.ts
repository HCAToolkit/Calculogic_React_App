/**
 * Configuration: cfg-contentDrawer (Content Drawer Configuration)
 * Concern File: Logic
 * Source NL: doc/nl-doc-engine/cfg-contentDrawer.md
 * Responsibility: Adapt app-level registry resolution into drawer-local render shapes.
 * Invariants: Docs payloads map to drawer doc shape, docs not_found maps to drawer missing shape, invalid or unsupported ids map to null.
 */

import { type ContentNode, type HeaderDocDefinition, type NotFound } from './index';
import { contentProviderRegistry } from './contentEngine';

export type DrawerContentResolution =
  | {
      kind: 'doc';
      contentId: string;
      doc: HeaderDocDefinition;
    }
  | {
      kind: 'missing';
      contentId: string;
    };

// [5.2] cfg-contentDrawer · Primitive · "Registry Resolution Adapter"
// Concern: Logic · Parent: "Resolver Pipeline" · Catalog: resolver.adapter
// Notes: Preserves legacy drawer contract while consuming normalized registry outputs.
export function resolveDrawerContent(
  contentId: string,
  anchorId?: string,
): DrawerContentResolution | null {
  const resolved = contentProviderRegistry.resolveContent({
    contentId,
    anchorId,
  });

  if (resolved.type === 'content') {
    return toDrawerDocResolution(contentId, resolved);
  }

  return toDrawerMissingResolution(contentId, resolved);
}

function toDrawerDocResolution(
  requestContentId: string,
  resolved: ContentNode,
): DrawerContentResolution | null {
  if (resolved.namespace !== 'docs') {
    return null;
  }

  return {
    kind: 'doc',
    contentId: requestContentId,
    doc: resolved.payload as HeaderDocDefinition,
  };
}

function toDrawerMissingResolution(
  requestContentId: string,
  resolved: NotFound,
): DrawerContentResolution | null {
  if (resolved.namespace !== 'docs') {
    return null;
  }

  return {
    kind: 'missing',
    contentId: requestContentId,
  };
}
