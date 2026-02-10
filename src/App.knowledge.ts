/**
 * Configuration: cfg-appFrame (App Frame)
 * Concern File: Knowledge
 * Source NL: doc/nl-config/cfg-appFrame.md
 * Responsibility: Centralize static copy and icon labels for the frame theme toggle.
 * Invariants: Theme labels stay deterministic; Build imports copy instead of inlining text.
 */

// ─────────────────────────────────────────────
// 6. Knowledge – cfg-appFrame (App Frame)
// NL Sections: §6.2–6.3 in cfg-appFrame.md
// Purpose: Publish theme-toggle copy contracts for Build and Logic concerns.
// Constraints: Keep static strings serializable and concern-local.
// ─────────────────────────────────────────────

// [6.2.1] cfg-appFrame · Primitive · "Theme Toggle Copy"
// Concern: Knowledge · Parent: "—" · Catalog: content.copy
// Notes: Labels rendered in toggle text and aria-label.
export const THEME_TOGGLE_COPY = {
  ariaLabel: 'Toggle dark mode',
  dark: '🌙 Dark',
  light: '☀️ Light',
} as const;

// [6.2.2] cfg-appFrame · Primitive · "Theme Icon Descriptions"
// Concern: Knowledge · Parent: "Theme Toggle Copy" · Catalog: content.a11y
// Notes: Text alternatives for icon semantics when needed by future tooltips/help text.
export const THEME_ICON_DESCRIPTIONS = {
  dark: 'Dark mode enabled',
  light: 'Light mode enabled',
} as const;
