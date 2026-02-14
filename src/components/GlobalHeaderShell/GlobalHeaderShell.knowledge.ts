/**
 * ProjectShell/Config: Global Header Shell (shell-globalHeader)
 * Concern File: Knowledge
 * Source NL: doc/nl-shell/shell-globalHeader.md
 * Responsibility: Supply canonical tab definitions, breakpoint metadata, and brand copy for the header shell.
 * Invariants: Tab identifiers remain stable; breakpoint ordering matches logic heuristic; brand copy stays synced with marketing voice.
 */

// ─────────────────────────────────────────────
// 6. Knowledge – shell-globalHeader (Global Header Shell)
// NL Sections: §6.1–§6.9 in shell-globalHeader.md
// Purpose: Centralize enumerations and copy shared across header concerns.
// Constraints: Values must remain serializable and environment-agnostic.
// ─────────────────────────────────────────────

// [6.1] shell-globalHeader · Primitive · "Header Tab Identifier Types"
// Concern: Knowledge · Catalog: types.identifier
// Notes: Enumerates supported tab and mode identifiers shared across concerns.
export type HeaderTabId = 'build' | 'logic' | 'knowledge' | 'results';
export type HeaderModeId = 'default' | 'style';

// [6.2] shell-globalHeader · Primitive · "Header Tab Definition Schema"
// Concern: Knowledge · Catalog: schema.definition
// Notes: Shapes tab configuration consumed by build concern.
export interface HeaderTabDefinition {
  id: HeaderTabId;
  label: string;
  order: number;
  docId: string;
  hoverSummary: string;
}

// [6.1.a] shell-globalHeader · Primitive · "Header Tab Map Entry"
// Concern: Knowledge · Catalog: schema.definition
// Notes: Stores per-tab metadata without repeating the identifier key.
export type HeaderTabMapEntry = Omit<HeaderTabDefinition, 'id'>;

// [6.2] shell-globalHeader · Primitive · "Header Mode Definition Schema"
// Concern: Knowledge · Catalog: schema.definition
// Notes: Encapsulates metadata for Build and Results mode selections.
export interface HeaderModeDefinition {
  id: HeaderModeId;
  label: string;
  description: string;
  docId?: string;
  hoverSummary?: string;
}

export type HeaderModeGroupId = 'build' | 'results';

export type HeaderModeGroup = Record<HeaderModeId, HeaderModeDefinition>;
export type HeaderModeCatalog = Record<HeaderModeGroupId, HeaderModeGroup>;

// [6.1.b] shell-globalHeader · Primitive · "Header Tab Knowledge Base"
// Concern: Knowledge · Catalog: data.collection
// Notes: Canonical list of header tabs sorted by `order`.
export const HEADER_TAB_MAP: Record<HeaderTabId, HeaderTabMapEntry> = {
  build: {
    label: 'Build',
    order: 1,
    docId: 'doc-build',
    hoverSummary: 'Owns and arranges structure: containers, sub-containers, and atomic components.',
  },
  logic: {
    label: 'Logic',
    order: 2,
    docId: 'doc-logic',
    hoverSummary: 'Defines calculations, conditions, validation rules, and interactions.',
  },
  knowledge: {
    label: 'Knowledge',
    order: 3,
    docId: 'doc-knowledge',
    hoverSummary: 'Stores reusable traits, constants, and reference schemas.',
  },
  results: {
    label: 'Results',
    order: 4,
    docId: 'doc-results',
    hoverSummary: 'Derived outputs and summaries produced from structure + logic + knowledge.',
  },
};

export const HEADER_TAB_DEFINITIONS: HeaderTabDefinition[] = Object.entries(HEADER_TAB_MAP)
  .map(([id, entry]) => ({ id: id as HeaderTabId, ...entry }))
  .sort((a, b) => a.order - b.order);

// [6.2.a] shell-globalHeader · Primitive · "Header Mode Metadata Catalog"
// Concern: Knowledge · Catalog: data.collection
// Notes: Provides labels and descriptions for Build and Results mode selectors.
export const HEADER_MODE_DEFINITIONS: HeaderModeCatalog = {
  build: {
    default: {
      id: 'default',
      label: 'Build',
      description: 'Define and arrange containers, sub-containers, and atomic components.',
      docId: 'doc-build',
      hoverSummary: 'Build mode focuses on the structural hierarchy and anchor placement.',
    },
    style: {
      id: 'style',
      label: 'Style',
      description: 'Configure layout-affecting style for Build outputs (grouping, alignment, sizing).',
      docId: 'doc-build',
      hoverSummary: 'Style the structural outputs without mutating the canonical container tree.',
    },
  },
  results: {
    default: {
      id: 'default',
      label: 'Results',
      description: 'Design and inspect derived outputs, scores, and summaries.',
      docId: 'doc-results',
      hoverSummary: 'Review the derived outputs before sharing or publishing.',
    },
    style: {
      id: 'style',
      label: 'Style',
      description: 'Configure layout-affecting style for Results outputs (cards, grouping, highlight rules).',
      docId: 'doc-results',
      hoverSummary: 'Adjust the presentation for results without redefining calculations.',
    },
  },
};

// [6.2.b] shell-globalHeader · Primitive · "Header Mode Sequence"
// Concern: Knowledge · Catalog: data.collection
// Notes: Preserves canonical ordering when rendering mode options.
export type HeaderModeSequence = Record<HeaderModeGroupId, HeaderModeId[]>;

export const HEADER_MODE_SEQUENCE: HeaderModeSequence = {
  build: ['default', 'style'],
  results: ['default', 'style'],
};

// [6.3] shell-globalHeader · Primitive · "Breakpoint Definition Schema"
// Concern: Knowledge · Catalog: schema.definition
// Notes: Structure for responsive breakpoint metadata.
export interface BreakpointDefinition {
  name: 'desktop' | 'tablet' | 'mobile';
  minWidth: number;
}

// [6.3.a] shell-globalHeader · Primitive · "Responsive Breakpoint Catalog"
// Concern: Knowledge · Catalog: data.collection
// Notes: Breakpoint ordering aligns with logic heuristic priority.
export const BREAKPOINTS: BreakpointDefinition[] = [
  { name: 'desktop', minWidth: 1024 },
  { name: 'tablet', minWidth: 768 },
  { name: 'mobile', minWidth: 0 },
];

// [6.4] shell-globalHeader · Primitive · "Brand Wordmark Copy"
// Concern: Knowledge · Catalog: content.copy
// Notes: Brand name presented inside header link.
export const BRAND_WORDMARK = 'Calculogic';

// [6.4.a] shell-globalHeader · Primitive · "Brand Tagline Copy"
// Concern: Knowledge · Catalog: content.copy
// Notes: Supportive phrase rendered conditionally in build concern.
export const BRAND_TAGLINE = 'a system for creating systems';

// [6.4.b] shell-globalHeader · Primitive · "Brand Tooltip Copy"
// Concern: Knowledge · Catalog: content.copy
// Notes: Tooltip content reinforcing link destination.
export const BRAND_TOOLTIP = 'Return to Calculogic home / dashboard.';

// [6.4.c] shell-globalHeader · Primitive · "Publish Label Copy"
// Concern: Knowledge · Catalog: content.copy
// Notes: Publish CTA text consumed by build concern.
export const PUBLISH_LABEL = 'Publish';

