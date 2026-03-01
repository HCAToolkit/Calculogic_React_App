/**
 * Configuration: cfg-contentDrawer (Content Drawer Configuration)
 * Concern File: Logic
 * Source NL: doc/nl-doc-engine/cfg-contentDrawer.md
 * Responsibility: Narrow app-level registry resolution to drawer-supported payloads while preserving canonical resolver outcomes.
 * Invariants: Resolver outputs preserve type tags, adapter never returns null.
 */

import type {
  ContentResolutionResult,
  FoundContent,
  InvalidRef,
  MissingContent,
  NoProvider,
} from '@calculogic/doc-engine';
import { contentProviderRegistry } from './contentEngine';

export type DrawerContentResolution =
  | FoundContent
  | MissingContent
  | NoProvider
  | InvalidRef
  | {
      type: 'unsupported_namespace';
      namespace: string;
      contentId: string;
      reason: string;
    };

// [5.2] cfg-contentDrawer · Primitive · "Registry Resolution Adapter"
// Concern: Logic · Parent: "Resolver Pipeline" · Catalog: resolver.adapter
// Notes: Returns canonical doc-engine union for docs and explicit unsupported_namespace for non-doc namespaces.
export function resolveDrawerContent(contentId: string, anchorId?: string): DrawerContentResolution {
  const resolution = contentProviderRegistry.resolveContent({
    contentId,
    anchorId,
  }) as ContentResolutionResult;

  if (resolution.type === 'found' && resolution.namespace !== 'docs') {
    return {
      type: 'unsupported_namespace',
      namespace: resolution.namespace,
      contentId: resolution.contentId,
      reason: `Namespace ${resolution.namespace} is not supported in this drawer yet.`,
    };
  }

  if (resolution.type === 'no_provider') {
    return {
      type: 'unsupported_namespace',
      namespace: resolution.namespace,
      contentId: resolution.contentId,
      reason: `Namespace ${resolution.namespace} is not supported in this drawer yet.`,
    };
  }

  return resolution;
}
