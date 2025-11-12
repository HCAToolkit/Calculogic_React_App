/**
 * Configuration: cfg-buildSurface (Build Surface)
 * Concern File: Build
 * Source NL: doc/nl-config/cfg-buildSurface.md
 * Responsibility: Expose the Build tab configuration via a stable barrel export.
 * Invariants: Default export remains aligned with build/index.tsx without side effects.
 */

// ─────────────────────────────────────────────
// 3. Build – cfg-buildSurface (Build Surface)
// NL Sections: §3.1 in cfg-buildSurface.md
// Purpose: Forward the Build tab assembly without leaking folder structure.
// Constraints: Re-export only; avoid additional logic or imports.
// ─────────────────────────────────────────────

// [3.1] cfg-buildSurface · Container · "Build Tab Assembly"
// Concern: Build · Parent: "—" · Catalog: layout.barrel
// Notes: Delegates to the build folder's default export to keep App frame imports stable.
export { default } from './build';
