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

// [6.3] shell-globalHeader · Primitive · "Header Tab Knowledge Base"
// Concern: Knowledge · Catalog: data.collection
// Notes: Canonical list of header tabs sorted by `order`.
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

// [6.4] shell-globalHeader · Primitive · "Breakpoint Definition Schema"
// Concern: Knowledge · Catalog: schema.definition
// Notes: Structure for responsive breakpoint metadata.
export interface BreakpointDefinition {
  name: 'desktop' | 'tablet' | 'mobile';
  minWidth: number;
}

// [6.5] shell-globalHeader · Primitive · "Responsive Breakpoint Catalog"
// Concern: Knowledge · Catalog: data.collection
// Notes: Breakpoint ordering aligns with logic heuristic priority.
export const BREAKPOINTS: BreakpointDefinition[] = [
  { name: 'desktop', minWidth: 1024 },
  { name: 'tablet', minWidth: 768 },
  { name: 'mobile', minWidth: 0 },
];

// [6.6] shell-globalHeader · Primitive · "Brand Wordmark Copy"
// Concern: Knowledge · Catalog: content.copy
// Notes: Brand name presented inside header link.
export const BRAND_WORDMARK = 'Calculogic';

// [6.7] shell-globalHeader · Primitive · "Brand Tagline Copy"
// Concern: Knowledge · Catalog: content.copy
// Notes: Supportive phrase rendered conditionally in build concern.
export const BRAND_TAGLINE = 'a system for creating systems';

// [6.8] shell-globalHeader · Primitive · "Brand Tooltip Copy"
// Concern: Knowledge · Catalog: content.copy
// Notes: Tooltip content reinforcing link destination.
export const BRAND_TOOLTIP = 'Return to Calculogic home / dashboard.';

// [6.9] shell-globalHeader · Primitive · "Publish Label Copy"
// Concern: Knowledge · Catalog: content.copy
// Notes: Publish CTA text consumed by build concern.
export const PUBLISH_LABEL = 'Publish';
