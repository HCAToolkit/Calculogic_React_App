/**
 * Configuration: cfg-buildSurface (Build Surface Configuration)
 * Concern File: Logic
 * Source NL: doc/nl-config/cfg-buildSurface.md
 * Responsibility: Provide shared persistence wrappers and non-fatal failure reporting for Build surface storage access.
 * Invariants: Persistence failures never throw to UI flow; development logs include operation and storage key.
 */

export type BuildSurfacePersistenceOperation = "read" | "write";

export interface BuildSurfacePersistenceFailure {
  operation: BuildSurfacePersistenceOperation;
  storageKey: string;
  error: unknown;
}

export type BuildSurfacePersistenceReporter = (
  failure: BuildSurfacePersistenceFailure,
) => void;

// [5.2.6] cfg-buildSurface · Primitive · "Persistence Failure Reporter"
// Concern: Logic · Parent: "Persistence Effect" · Catalog: telemetry.signal
// Notes: Emits non-fatal diagnostics for persistence errors while preserving silent UX recovery.
export const defaultBuildSurfacePersistenceReporter: BuildSurfacePersistenceReporter =
  ({ operation, storageKey, error }) => {
    if (import.meta.env.DEV) {
      console.warn(
        `[build-surface][persistence:${operation}] ${storageKey}`,
        error,
      );
    }
  };

// [5.2.4] cfg-buildSurface · Primitive · "Persistence Effect"
// Concern: Logic · Parent: "Section Logic Hook" · Catalog: effect.persistence
// Notes: Wraps localStorage access in a common non-throwing read helper.
export function readBuildSurfaceStorage<T>(
  storageKey: string,
  read: () => T,
  fallback: T,
  reporter: BuildSurfacePersistenceReporter = defaultBuildSurfacePersistenceReporter,
): T {
  try {
    return read();
  } catch (error) {
    reporter({ operation: "read", storageKey, error });
    return fallback;
  }
}

// [5.2.4] cfg-buildSurface · Primitive · "Persistence Effect"
// Concern: Logic · Parent: "Section Logic Hook" · Catalog: effect.persistence
// Notes: Wraps localStorage writes in a common non-throwing write helper.
export function writeBuildSurfaceStorage(
  storageKey: string,
  write: () => void,
  reporter: BuildSurfacePersistenceReporter = defaultBuildSurfacePersistenceReporter,
): void {
  try {
    write();
  } catch (error) {
    reporter({ operation: "write", storageKey, error });
  }
}
