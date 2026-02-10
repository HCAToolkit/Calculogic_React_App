/**
 * Configuration: cfg-contentDrawer (Content Drawer Configuration)
 * Concern File: Knowledge
 * Source NL: doc/nl-doc-engine/cfg-contentDrawer.md
 * Responsibility: Materialize static documentation registry entries for docs namespace resolution.
 * Invariants: Registry keys are docs-prefixed ids and every unresolved lookup returns a deterministic fallback node.
 */

import { HEADER_DOC_DEFINITIONS } from '../../components/GlobalHeaderShell/GlobalHeaderShell.knowledge';

export interface ContentSection {
  heading: string;
  body: string[];
}

export interface ContentLink {
  label: string;
  id: string;
  description?: string;
}

export interface ContentNode {
  id: string;
  title: string;
  summary: string;
  concern?: string;
  recommendedWorkflows?: string[];
  sections: ContentSection[];
  links?: ContentLink[];
}

const DOCS_PREFIX = 'docs:';

// ─────────────────────────────────────────────
// 6. Knowledge – cfg-contentDrawer (Content Drawer Configuration)
// NL Sections: §6.2 in cfg-contentDrawer.md
// Purpose: Build static docs registry and resolver fallback used by drawer content pipelines.
// Constraints: Keep registry deterministic and side-effect free.
// ─────────────────────────────────────────────

// [6.2] cfg-contentDrawer · Subcontainer · "Static Docs Registry"
// Concern: Knowledge · Parent: "ContentNode Schema" · Catalog: data.fallback
// Notes: Fallback node guarantees user-facing guidance when a doc id misses registry entries.
export const NotFound: ContentNode = {
  id: `${DOCS_PREFIX}not-found`,
  title: 'Documentation Not Found',
  summary: 'The requested documentation entry could not be located.',
  sections: [
    {
      heading: 'Check the identifier',
      body: [
        'Confirm the documentation identifier is spelled correctly.',
        'Return to the navigation surface and choose another topic.',
      ],
    },
  ],
};

function toDocsId(docId: string) {
  return `${DOCS_PREFIX}${docId}`;
}

function headerDocToContentNode(docId: string): ContentNode {
  const doc = HEADER_DOC_DEFINITIONS[docId];

  return {
    id: toDocsId(doc.id),
    title: doc.title,
    summary: doc.summary,
    concern: doc.concern,
    recommendedWorkflows: doc.recommendedWorkflows,
    sections: doc.sections.map(section => ({
      heading: section.heading,
      body: [...section.body],
    })),
    links: doc.links?.map(link => ({
      label: link.label,
      id: toDocsId(link.docId),
      description: link.description,
    })),
  };
}

// [6.2] cfg-contentDrawer · Container · "Static Docs Registry"
// Concern: Knowledge · Parent: "Content Drawer Configuration" · Catalog: data.registry
// Notes: Seeds docs namespace with transformed header-doc payloads.
export const DOCS_REGISTRY: Record<string, ContentNode> = Object.keys(HEADER_DOC_DEFINITIONS).reduce(
  (registry, docId) => {
    registry[toDocsId(docId)] = headerDocToContentNode(docId);
    return registry;
  },
  {} as Record<string, ContentNode>,
);

// [6.2] cfg-contentDrawer · Primitive · "Registry Resolver"
// Concern: Knowledge · Parent: "Static Docs Registry" · Catalog: data.lookup
// Notes: Performs id lookup and falls back to deterministic NotFound node.
export function resolveDocsContentNode(id: string): ContentNode {
  return DOCS_REGISTRY[id] ?? NotFound;
}
