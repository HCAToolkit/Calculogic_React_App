/**
 * Configuration: cfg-buildSurface (Build Surface Configuration)
 * Concern File: Build
 * Source NL: doc/nl-config/cfg-buildSurface.md
 * Responsibility: Bind the Build surface view to its logic and scoped styles.
 * Invariants: BuildSurface receives a full binding object; stylesheet import remains colocated.
 */
import { BuildSurface } from './BuildSurface.build';
import { useBuildSurfaceLogic } from './BuildSurface.logic';
import './BuildSurface.view.css';

// ─────────────────────────────────────────────
// 3. Build – cfg-buildSurface (Build Surface Configuration)
// NL Sections: §3.1.1 in cfg-buildSurface.md
// Purpose: Pair Build logic bindings with the structural surface renderer.
// Constraints: Composition stays synchronous and side-effect free.
// ─────────────────────────────────────────────

// [3.1.1] cfg-buildSurface · Subcontainer · "Build Surface Composer"
// Concern: Build · Parent: "Build Tab Forwarder" · Catalog: composition.composer
// Notes: Invokes logic hook once and forwards bindings to the view.
export default function BuildTab() {
  const bindings = useBuildSurfaceLogic();
  return <BuildSurface {...bindings} />;
}
