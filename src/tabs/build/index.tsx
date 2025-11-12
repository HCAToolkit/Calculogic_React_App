/**
 * Configuration: cfg-buildSurface (Build Surface)
 * Concern File: Build
 * Source NL: doc/nl-config/cfg-buildSurface.md
 * Responsibility: Compose the Build surface with live logic bindings and scoped styling.
 * Invariants: BuildSurface receives complete bindings; stylesheet import stays colocated.
 */
import { BuildSurface } from './BuildSurface.build';
import { useBuildSurfaceLogic } from './BuildSurface.logic';
import './BuildSurface.view.css';

// ─────────────────────────────────────────────
// 3. Build – cfg-buildSurface (Build Surface)
// NL Sections: §3.1.1 in cfg-buildSurface.md
// Purpose: Bind logic to the Build surface view and export the composed component.
// Constraints: Keep assembly synchronous; avoid additional wrappers or side effects.
// ─────────────────────────────────────────────

// [3.1.1] cfg-buildSurface · Subcontainer · "Build Surface Composer"
// Concern: Build · Parent: "Build Tab Forwarder" · Catalog: layout.composer
// Notes: Instantiates logic bindings and renders the Build surface with scoped styles.
export default function BuildTab() {
  const bindings = useBuildSurfaceLogic();
  return <BuildSurface {...bindings} />;
}
