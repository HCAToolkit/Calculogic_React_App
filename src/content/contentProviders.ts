/**
 * Configuration: cfg-contentDrawer (Content Drawer Configuration)
 * Concern File: Logic
 * Source NL: doc/nl-doc-engine/cfg-contentDrawer.md
 * Responsibility: Resolve namespaced content ids through deterministic provider selection.
 * Invariants: Provider lookup is prefix-based, unknown providers return null, missing docs return typed missing payload.
 */

import {
  resolveHeaderDoc,
  type HeaderDocDefinition,
} from '../components/GlobalHeaderShell/GlobalHeaderShell.knowledge';

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

interface ContentProvider {
  id: string;
  canResolve: (contentId: string) => boolean;
  resolve: (contentId: string) => ContentResolution | null;
}

// ─────────────────────────────────────────────
// 5. Logic – cfg-contentDrawer (Content Drawer Configuration)
// NL Sections: §5.2 in cfg-contentDrawer.md
// Purpose: Build resolver pipeline with docs namespace provider and deterministic routing.
// Constraints: Keep resolver pure and side-effect free.
// ─────────────────────────────────────────────

// [5.2] cfg-contentDrawer · Subcontainer · "Resolver Pipeline"
// Concern: Logic · Parent: "Drawer State Orchestrator" · Catalog: resolver.provider
// Notes: Docs provider handles namespaced doc lookups and emits missing sentinel when unknown.
const docsProvider: ContentProvider = {
  id: 'docs',
  canResolve: contentId => contentId.startsWith('docs:'),
  resolve: contentId => {
    const docId = contentId.replace('docs:', '');
    const doc = resolveHeaderDoc(docId);
    if (!doc) {
      return {
        kind: 'missing',
        contentId,
      };
    }
    return {
      kind: 'doc',
      contentId,
      doc,
    };
  },
};

const CONTENT_PROVIDERS: ContentProvider[] = [docsProvider];

// [5.2] cfg-contentDrawer · Primitive · "Provider Resolution"
// Concern: Logic · Parent: "Resolver Pipeline" · Catalog: resolver.dispatch
// Notes: Selects first capable provider and delegates actual content resolution.
export function resolveContent(contentId: string): ContentResolution | null {
  const provider = CONTENT_PROVIDERS.find(entry => entry.canResolve(contentId));
  if (!provider) {
    return null;
  }
  return provider.resolve(contentId);
}
