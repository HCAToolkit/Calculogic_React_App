/**
 * Configuration: cfg-buildSurface (Build Surface Configuration)
 * Concern File: Build
 * Source NL: doc/nl-config/cfg-buildSurface.md
 * Responsibility: Forward the Build tab entry point without exposing internal module layout.
 * Invariants: Default export remains stable; barrel stays side-effect free.
 */

// ─────────────────────────────────────────────
// 3. Build – cfg-buildSurface (Build Surface Configuration)
// NL Sections: §3.1 in cfg-buildSurface.md
// Purpose: Keep the App shell decoupled through a focused Build tab barrel.
// Constraints: Barrel stays stateless and transparent.
// ─────────────────────────────────────────────

// [3.1] cfg-buildSurface · Container · "Build Tab Forwarder"
// Concern: Build · Catalog: composition.forwarder
// Notes: Re-exports the build assembly to preserve the App router contract.
export { default } from './build';
