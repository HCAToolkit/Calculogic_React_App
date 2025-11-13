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

// [6.5.a] shell-globalHeader · Primitive · "Header Documentation Link Schema"
// Concern: Knowledge · Catalog: schema.definition
// Notes: Associates documentation links for cross-navigation inside modal output.
export interface HeaderDocLink {
  label: string;
  docId: string;
  description?: string;
}

// [6.5.b] shell-globalHeader · Primitive · "Header Documentation Section Schema"
// Concern: Knowledge · Catalog: schema.definition
// Notes: Breaks documentation body into digestible headings and copy blocks.
export interface HeaderDocSection {
  heading: string;
  body: string[];
}

// [6.5.c] shell-globalHeader · Primitive · "Header Documentation Definition"
// Concern: Knowledge · Catalog: schema.definition
// Notes: Source of truth for documentation payload consumed by results concern modal.
export interface HeaderDocDefinition {
  id: string;
  concern: 'Build' | 'Logic' | 'Knowledge' | 'Results';
  title: string;
  summary: string;
  recommendedWorkflows?: string[];
  sections: HeaderDocSection[];
  links?: HeaderDocLink[];
}

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
      label: 'Build /Style',
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
      label: 'Results /Style',
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

// [6.5.d] shell-globalHeader · Primitive · "Header Documentation Definitions"
// Concern: Knowledge · Catalog: data.collection
// Notes: Encodes contextual documentation surfaced via info icon modal per concern.
export const HEADER_DOC_DEFINITIONS: Record<string, HeaderDocDefinition> = {
  'doc-build': {
    id: 'doc-build',
    concern: 'Build',
    title: 'Build Concern Overview',
    summary:
      'Assemble layouts with containers, sub-containers, and atomic components. Build/Style/ applies theming to the same structure.',
    recommendedWorkflows: [
      'Start from an official Configuration and customize anchors, containers, and atomic placements.',
      'Switch to Build/Style/ to adjust spacing, typography, and color tokens for the active structure.',
    ],
    sections: [
      {
        heading: 'What lives in Build/',
        body: [
          'Define top-level containers, identify sub-containers, and anchor atomic components. Every structural decision rolls up into this concern.',
          'When you keep Build/ authoritative, cloning configurations stays predictable and documentation tags stay in sync.',
        ],
      },
      {
        heading: 'When to use Build/Style/',
        body: [
          'Use Build/Style/ to adjust the presentation of the same structure without mutating the canonical container tree.',
          'Preview Style directly from the tab hover if you are working from another concern and need a quick check on presentation.',
        ],
      },
      {
        heading: 'Tips for getting started',
        body: [
          'Use anchors (data-anchor) consistently so downstream automation and documentation stay linked.',
          'Leverage the guidance panel on the canvas to remind collaborators which structural pieces belong here versus Logic or Results.',
        ],
      },
    ],
    links: [
      {
        label: 'Jump to Logic guidance',
        docId: 'doc-logic',
        description: 'Add state handling and conditional rules once structure is in place.',
      },
      {
        label: 'Review Results outputs',
        docId: 'doc-results',
        description: 'Confirm derived data and presentation targets before publishing.',
      },
    ],
  },
  'doc-logic': {
    id: 'doc-logic',
    concern: 'Logic',
    title: 'Logic Concern Overview',
    summary: 'Add calculations, conditions, and interaction rules. Keep heavy math in helpers and orchestrate workflows here.',
    recommendedWorkflows: [
      'Use Logic/ to react to user input, validate data, and orchestrate cross-configuration communication.',
      'Pair Logic rules with Knowledge traits to stay consistent across similar builds.',
    ],
    sections: [
      {
        heading: 'Responsibilities',
        body: [
          'Bind to viewport state, configuration context, and orchestrate actions like publish or docs modal control.',
          'React to tab changes by setting active modes for Build and Results, ensuring breadcrumbs stay accurate.',
        ],
      },
      {
        heading: 'What stays out',
        body: [
          'Do not encode styling tokens here; those belong in Build/Style/ or Results/Style/.',
          'Leave persistent data definitions to Knowledge/. Import them as needed instead of redefining them locally.',
        ],
      },
      {
        heading: 'Publishing pipeline hook',
        body: [
          'Trigger onPublish when the header publish CTA is pressed. The pipeline can evolve without changing the header shell.',
        ],
      },
    ],
    links: [
      {
        label: 'See Knowledge reference',
        docId: 'doc-knowledge',
        description: 'Understand how shared schemas and traits feed your logic flows.',
      },
    ],
  },
  'doc-knowledge': {
    id: 'doc-knowledge',
    concern: 'Knowledge',
    title: 'Knowledge Concern Overview',
    summary: 'Store reusable traits, constants, and reference schemas to keep builds consistent.',
    recommendedWorkflows: [
      'Centralize enumerations, scoring tables, and shared text snippets.',
      'Expose documentation variables to automatically populate configuration guidance.',
    ],
    sections: [
      {
        heading: 'Why Knowledge matters',
        body: [
          'Knowledge/ is the bridge between reusable data and the live builder experience. It feeds hover summaries, doc payloads, and automation tags.',
          'Keep meta.summary and doc descriptors updated so every ℹ️ icon stays trustworthy.',
        ],
      },
      {
        heading: 'Documentation propagation',
        body: [
          'Use documentationVariables to keep cloned configurations coherent. Built-in tags like {{name}} and {{#atomicComponents}} update automatically.',
          'Plan for future sync tooling that can reconcile atomicDoc changes back into cloned configs when requested.',
        ],
      },
    ],
    links: [
      {
        label: 'Review Build structure',
        docId: 'doc-build',
        description: 'See how Knowledge summaries surface within the structural concern.',
      },
      {
        label: 'Inspect Results outputs',
        docId: 'doc-results',
        description: 'Confirm how Knowledge data feeds final reporting.',
      },
    ],
  },
  'doc-results': {
    id: 'doc-results',
    concern: 'Results',
    title: 'Results Concern Overview',
    summary: 'Design and inspect derived outputs, scores, and summaries. Results/Style/ fine-tunes their presentation.',
    recommendedWorkflows: [
      'Define scoring formulas and narrative summaries in Results/.',
      'Switch to Results/Style/ to control layout, chart framing, and typography for the same payload.',
    ],
    sections: [
      {
        heading: 'Outputs first',
        body: [
          'Treat Results/ as the source of truth for derived data structures. Keep transformations transparent for auditing.',
          'Leverage the debug panel (when enabled) to confirm which modes and breakpoints are active during testing.',
        ],
      },
      {
        heading: 'Styling the outcomes',
        body: [
          'Use Results/Style/ to control cards, analytics surfaces, and score highlights without redefining calculations.',
          'Coordinate with Build/Style/ so that shared tokens stay synchronized across the experience.',
        ],
      },
      {
        heading: 'Publish readiness',
        body: [
          'Before triggering publish, confirm Results outputs are populated and narrative copy is proofed.',
          'Cross-check Knowledge definitions to ensure referenced schemas are current and unambiguous.',
        ],
      },
    ],
    links: [
      {
        label: 'Open Build guidance',
        docId: 'doc-build',
        description: 'Verify structural anchors before styling outcomes.',
      },
      {
        label: 'Reference Knowledge data',
        docId: 'doc-knowledge',
        description: 'Ensure shared traits and constants align with your reporting.',
      },
    ],
  },
};

// [6.5.e] shell-globalHeader · Primitive · "Header Documentation Resolver"
// Concern: Knowledge · Catalog: data.accessor
// Notes: Provides safe lookup for modal consumption with null fallback when docId is unknown.
export function resolveHeaderDoc(docId: string): HeaderDocDefinition | null {
  return HEADER_DOC_DEFINITIONS[docId] ?? null;
}
