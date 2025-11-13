export type HeaderTabId = 'build' | 'logic' | 'knowledge' | 'results';
export type HeaderModeId = 'default' | 'style';

export interface HeaderTabDefinition {
  id: HeaderTabId;
  label: string;
  order: number;
  docId: string;
  hoverSummary: string;
}

export const HEADER_TAB_DEFINITIONS: HeaderTabDefinition[] = [
  {
    id: 'build',
    label: 'Build',
    order: 1,
    docId: 'doc-build',
    hoverSummary: 'Define and arrange containers, sub-containers, and atomic components.',
  },
  {
    id: 'logic',
    label: 'Logic',
    order: 2,
    docId: 'doc-logic',
    hoverSummary: 'Add calculations, conditions, and interaction rules.',
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    order: 3,
    docId: 'doc-knowledge',
    hoverSummary: 'Store reusable traits, constants, and reference schemas.',
  },
  {
    id: 'results',
    label: 'Results',
    order: 4,
    docId: 'doc-results',
    hoverSummary: 'Design and inspect derived outputs, scores, and summaries.',
  },
];

export interface BreakpointDefinition {
  name: 'desktop' | 'tablet' | 'mobile';
  minWidth: number;
}

export const BREAKPOINTS: BreakpointDefinition[] = [
  { name: 'desktop', minWidth: 1024 },
  { name: 'tablet', minWidth: 768 },
  { name: 'mobile', minWidth: 0 },
];

export const BRAND_WORDMARK = 'Calculogic';
export const BRAND_TAGLINE = 'a system for creating systems';
export const BRAND_TOOLTIP = 'Return to Calculogic home / dashboard.';

export const PUBLISH_LABEL = 'Publish';
