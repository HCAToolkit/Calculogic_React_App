/**
 * Configuration: cfg-contentResolver (Doc Engine Content Resolver Configuration)
 * Concern File: Knowledge
 * Source NL: doc/nl-doc-engine/cfg-contentResolver.md
 * Responsibility: Centralize docs catalog definitions and lookup accessors for the docs namespace provider.
 * Invariants: Doc ids remain stable, default content metadata is deterministic, unknown doc ids resolve to null.
 */

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

// [6.5.c.a] shell-globalHeader · Primitive · "Content Metadata Contract"
// Concern: Knowledge · Catalog: schema.definition
// Notes: Defines baseline metadata fields expected on all documentation payloads.
export interface ContentMeta {
  sourceTier: string;
  visibility: string;
  status: string;
  scope: string;
  version: string;
  conceptIds: string[];
  intentTags: string[];
  keywords: string[];
  tags: string[];
}

// [6.5.c] shell-globalHeader · Primitive · "Header Documentation Definition"
// Concern: Knowledge · Catalog: schema.definition
// Notes: Source of truth for documentation payload consumed by results concern modal.
export interface HeaderDocDefinition {
  id: string;
  concern: 'Build' | 'Logic' | 'Knowledge' | 'Results';
  title: string;
  summary: string;
  contentMeta: ContentMeta;
  recommendedWorkflows?: string[];
  sections: HeaderDocSection[];
  links?: HeaderDocLink[];
}

const DEFAULT_CONTENT_META: ContentMeta = {
  sourceTier: 'app-docs',
  visibility: 'internal',
  status: 'active',
  scope: 'global-header-shell',
  version: '1.0.0',
  conceptIds: [],
  intentTags: [],
  keywords: [],
  tags: [],
};

function withDefaultContentMeta(definition: Omit<HeaderDocDefinition, 'contentMeta'>): HeaderDocDefinition {
  return {
    ...definition,
    contentMeta: {
      ...DEFAULT_CONTENT_META,
      scope: `${DEFAULT_CONTENT_META.scope}:${definition.id}`,
    },
  };
}

// [6.5.d] shell-globalHeader · Primitive · "Header Documentation Definitions"
// Concern: Knowledge · Catalog: data.collection
// Notes: Encodes contextual documentation surfaced via info icon modal per concern.
export const HEADER_DOC_DEFINITIONS: Record<string, HeaderDocDefinition> = {
  'doc-build': withDefaultContentMeta({
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
  }),
  'doc-logic': withDefaultContentMeta({
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
  }),
  'doc-knowledge': withDefaultContentMeta({
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
  }),
  'doc-results': withDefaultContentMeta({
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
  }),
};

// [6.5.e] shell-globalHeader · Primitive · "Header Documentation Resolver"
// Concern: Knowledge · Catalog: data.accessor
// Notes: Provides safe lookup for modal consumption with null fallback when docId is unknown.
export function resolveHeaderDoc(docId: string): HeaderDocDefinition | null {
  return HEADER_DOC_DEFINITIONS[docId] ?? null;
}
