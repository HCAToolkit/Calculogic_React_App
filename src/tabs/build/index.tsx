/**
 * Concern: BuildSurfaceAssembly
 * Layer: Build
 * BuildIndex: 20.00
 * AttachesTo: builder-root
 * Responsibility: Bind the Build surface view to its logic and scoped styles.
 * Invariants: BuildSurface receives a full binding object, stylesheet import remains colocated.
 */
import { BuildSurface } from './BuildSurface.build';
import { useBuildSurfaceLogic } from './BuildSurface.logic';
import './BuildSurface.view.css';

// [Section 20.05] SurfaceBootstrap
// Purpose: Compose the Build surface with live bindings for rendering.
// Inputs: useBuildSurfaceLogic hook
// Outputs: BuildSurface element tree
// Constraints: No side effects beyond hook execution; component stays synchronous.
export default function BuildTab() {
  const bindings = useBuildSurfaceLogic();
  return <BuildSurface {...bindings} />;
}
