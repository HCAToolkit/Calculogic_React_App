/**
 * Configuration: cfg-buildSurface (Build Surface Configuration)
 * Concern File: Knowledge
 * Source NL: doc/nl-config/cfg-buildSurface.md
 * Responsibility: Centralize public anchor contracts shared across Build layers.
 * Invariants: Anchor names remain stable; builder-root stays the ordering source.
 */

// ─────────────────────────────────────────────
// 6. Knowledge – cfg-buildSurface (Build Surface Configuration)
// NL Sections: §6.1–§6.2 in cfg-buildSurface.md
// Purpose: Publish anchor naming contracts for reuse across concerns.
// Constraints: Anchor registry stays deterministic and pure.
// ─────────────────────────────────────────────

// [6.1] cfg-buildSurface · Primitive · "Anchor Registry"
// Concern: Knowledge · Catalog: contract.anchor
// Notes: Enumerates public anchor factories consumed by Build, BuildStyle, and Logic.
export const BUILD_ANCHORS = {
  root: 'builder-root',
  header: 'builder-header',
  tabList: 'builder-tabs',
  tabButton: (name: string) => `builder-tab-${name}`,
  layout: 'builder-layout',
  leftPanel: 'builder-left-panel',
  leftGrip: 'builder-left-grip',
  section: (id: string) => `builder-section-${id}`,
  sectionContent: (id: string) => `builder-section-${id}-content`,
  sectionGrip: (id: string) => `builder-section-${id}-grip`,
  centerPanel: 'builder-center-panel',
  centerInner: 'builder-center-inner',
  rightGrip: 'builder-right-grip',
  rightPanel: 'builder-right-panel',
  rightContent: 'builder-right-content',
  buttonGroup: (id: string) => `builder-button-group-${id}`,
  placeholder: (id: string) => `builder-placeholder-${id}`,
  list: (id: string) => `builder-list-${id}`,
} as const;

// [6.2] cfg-buildSurface · Primitive · "Anchor Type Alias"
// Concern: Knowledge · Parent: "Anchor Registry" · Catalog: contract.type
// Notes: Provides union of anchor identifiers for compile-time validation.
export type BuildAnchorId = typeof BUILD_ANCHORS[keyof typeof BUILD_ANCHORS];
