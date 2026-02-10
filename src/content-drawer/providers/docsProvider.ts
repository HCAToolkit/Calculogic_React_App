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
    sections: doc.sections.map((section) => ({
      heading: section.heading,
      body: [...section.body],
    })),
    links: doc.links?.map((link) => ({
      label: link.label,
      id: toDocsId(link.docId),
      description: link.description,
    })),
  };
}

export const DOCS_REGISTRY: Record<string, ContentNode> = Object.keys(HEADER_DOC_DEFINITIONS).reduce(
  (registry, docId) => {
    registry[toDocsId(docId)] = headerDocToContentNode(docId);
    return registry;
  },
  {} as Record<string, ContentNode>,
);

export function resolveDocsContentNode(id: string): ContentNode {
  return DOCS_REGISTRY[id] ?? NotFound;
}
