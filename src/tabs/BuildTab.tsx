/**
 * Concern: BuildTabEntrypoint
 * Layer: Build
 * BuildIndex: 10.00
 * AttachesTo: builder-root
 * Responsibility: Re-export the Build tab assembly for the App frame without exposing folder structure.
 * Invariants: Default export stays stable for routing, underlying build module is proxied as-is.
 */

// [Section 10.10] SurfaceForwarder
// Purpose: Keep the App shell decoupled from internal build folder layout.
// Inputs: ./build module export
// Outputs: Default Build tab component
// Constraints: Remains a pure barrel with no side effects.
export { default } from './build';
