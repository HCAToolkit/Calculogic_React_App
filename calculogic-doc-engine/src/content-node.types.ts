/**
 * Configuration: cfg-contentNodeSchema (Doc Engine ContentNode Schema Configuration)
 * Concern File: Knowledge
 * Source NL: calculogic-doc-engine/doc/NL/cfg-contentNodeSchema.md
 * Responsibility: Define normalized content node schemas and block primitives used by doc-engine consumers.
 * Invariants: Every content node includes metadata and either top-level blocks or section collections.
 */

// ─────────────────────────────────────────────
// 6. Knowledge – cfg-contentNodeSchema (Doc Engine ContentNode Schema Configuration)
// NL Sections: §6.1 in cfg-contentNodeSchema.md
// Purpose: Capture shared type contracts for content payload normalization.
// Constraints: Keep schema framework-agnostic and serializable.
// ─────────────────────────────────────────────

// [6.1] cfg-contentNodeSchema · Container · "ContentNode Schema"
// Concern: Knowledge · Parent: "Doc Engine ContentNode Schema Configuration" · Catalog: schema.metadata
// Notes: Metadata model enables retrieval, ranking, and governance attributes.
export type ContentMeta = {
  tags: string[];
  keywords: string[];
  intentTags: string[];
  conceptIds: string[];
  sourceTier?: 'tier-1' | 'tier-2' | 'tier-3' | string;
  visibility?: 'public' | 'internal' | 'private' | string;
  status?: 'draft' | 'review' | 'published' | 'archived' | string;
  scope?: 'global' | 'team' | 'project' | string;
  version?: string;
};

type ContentNodeBase = {
  contentId: string;
  anchorId?: string;
  meta: ContentMeta;
};

export type ParagraphBlock = {
  type: 'paragraph';
  text: string;
};

export type HeadingBlock = {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
};

export type CalloutBlock = {
  type: 'callout';
  tone?: 'info' | 'warning' | 'success' | 'danger' | string;
  title?: string;
  body: string;
};

export type StepsBlock = {
  type: 'steps';
  steps: Array<{
    title?: string;
    body: string;
  }>;
};

export type CodeBlock = {
  type: 'code';
  language?: string;
  code: string;
  caption?: string;
};

export type GlossaryRefBlock = {
  type: 'glossaryRef';
  termId: string;
  label?: string;
};

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | CalloutBlock
  | StepsBlock
  | CodeBlock
  | GlossaryRefBlock;

export type ContentSection = {
  sectionId: string;
  anchorId?: string;
  title?: string;
  blocks: ContentBlock[];
};

export type ContentNode =
  | (ContentNodeBase & {
      blocks: ContentBlock[];
    })
  | (ContentNodeBase & {
      sections: ContentSection[];
    });
