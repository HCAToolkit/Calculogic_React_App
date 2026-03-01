/**
 * Configuration: cfg-contentDrawer (Content Drawer Configuration)
 * Concern File: Build
 * Source NL: doc/nl-doc-engine/cfg-contentDrawer.md
 * Responsibility: Provide deterministic heading-to-anchor normalization for drawer section ids.
 * Invariants: Output is lowercase, punctuation-stripped, and whitespace-collapsed with hyphen separators.
 */

// ─────────────────────────────────────────────
// 3. Build – cfg-contentDrawer (Content Drawer Configuration)
// NL Sections: §3.4 in cfg-contentDrawer.md
// Purpose: Share pure anchor-id normalization primitive between renderer and tests.
// Constraints: Keep transformation deterministic and side-effect free.
// ─────────────────────────────────────────────

// [3.4] cfg-contentDrawer · Primitive · "Anchor Jump Target"
// Concern: Build · Parent: "Drawer Body" · Catalog: navigation.anchor
// Notes: Mirrors section headings into deterministic ids for hash-like in-drawer jumps.
export function toAnchorId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
