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
  NotFound,
  UnsupportedNamespace,
} from '../doc-engine/index.ts';
import type { HeaderDocDefinition } from './packs/header-docs/header-docs.catalog.ts';
import { contentProviderRegistry } from './contentEngine';

export type DrawerContentResolution =
  | FoundContent<HeaderDocDefinition>
  | NotFound
  | UnsupportedNamespace
  | InvalidRef;

// [5.2] cfg-contentDrawer · Primitive · "Registry Resolution Adapter"
// Concern: Logic · Parent: "Resolver Pipeline" · Catalog: resolver.adapter
// Notes: Returns canonical doc-engine union unchanged so drawer callers handle outcomes consistently.
export function resolveDrawerContent(contentId: string, anchorId?: string): DrawerContentResolution {
  return contentProviderRegistry.resolveContent({
    contentId,
    anchorId,
  }) as ContentResolutionResult<HeaderDocDefinition>;
}
