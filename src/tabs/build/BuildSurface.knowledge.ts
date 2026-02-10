/**
 * Configuration: cfg-buildSurface (Build Surface Configuration)
 * Concern File: Knowledge
 * Source NL: doc/nl-config/cfg-buildSurface.md
 * Responsibility: Publish labels and static copy for Build surface sections, grips, and placeholders.
 * Invariants: Section identifiers map deterministically to human-readable copy.
 */
// ─────────────────────────────────────────────
// 6. Knowledge – cfg-buildSurface (Build Surface Configuration)
// NL Sections: §6.2 in cfg-buildSurface.md
// Purpose: Centralize text constants reused across Build and Logic concerns.
// Constraints: Keep copy pure and serializable.
// ─────────────────────────────────────────────

// [6.2.1] cfg-buildSurface · Primitive · "Section Labels"
// Concern: Knowledge · Parent: "Anchor Registry" · Catalog: content.label
// Notes: Human-readable labels keyed by section identifiers.
export const BUILD_SECTION_LABELS: Record<'configurations' | 'atomic-components' | 'search-configurations', string> = {
  configurations: 'Configurations',
  'atomic-components': 'Atomic Components',
  'search-configurations': 'Search Configurations',
};

// [6.2.2] cfg-buildSurface · Primitive · "Grip Aria Labels"
// Concern: Knowledge · Parent: "Anchor Registry" · Catalog: content.a11y
// Notes: ARIA labels for section and panel resize separators.
export const BUILD_GRIP_ARIA_LABELS = {
  leftPanel: 'Resize left panel',
  rightPanel: 'Resize right panel',
  section: (label: string) => `Resize ${label}`,
} as const;

// [6.2.3] cfg-buildSurface · Primitive · "Placeholder Copy"
// Concern: Knowledge · Parent: "Anchor Registry" · Catalog: content.copy
// Notes: Placeholder/empty-state text for Build surface regions.
export const BUILD_PLACEHOLDER_COPY = {
  preview: 'Form preview placeholder',
  settings: 'Select a field on the canvas to edit its settings.',
} as const;
