/**
 * Configuration: cfg-buildSurface (Build Surface Configuration)
 * Concern File: Logic
 * Source NL: doc/nl-config/cfg-buildSurface.md
 * Responsibility: Define Build-surface persistence payload contracts with backward-compatible parsing and versioned serialization.
 * Invariants: Versioned payloads write with schema version 1; legacy unversioned section/right-panel payloads remain readable.
 */

export const BUILD_SURFACE_PERSISTENCE_VERSION = 1 as const;

// [5.2.7] cfg-buildSurface · Primitive · "Versioned Payload Contract"
// Concern: Logic · Parent: "Section Contracts" · Catalog: contract.persistence
// Notes: Centralizes Build-surface payload parsing/serialization with backward-compatible legacy JSON upgrades.

export interface VersionedSectionStatePayload {
  version: typeof BUILD_SURFACE_PERSISTENCE_VERSION;
  height: number;
  collapsed: boolean;
}

export interface VersionedRightPanelStatePayload {
  version: typeof BUILD_SURFACE_PERSISTENCE_VERSION;
  width: number;
  collapsed: boolean;
}

export interface BuildSurfacePersistenceParseResult<TPayload> {
  state: TPayload;
  wasFallback: boolean;
  reason?: string;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function serializeSectionStatePayload(
  state: Omit<VersionedSectionStatePayload, 'version'>,
): VersionedSectionStatePayload {
  return {
    version: BUILD_SURFACE_PERSISTENCE_VERSION,
    height: state.height,
    collapsed: state.collapsed,
  };
}

export function parseSectionStatePayload(
  raw: string,
  fallback: Omit<VersionedSectionStatePayload, 'version'>,
): BuildSurfacePersistenceParseResult<VersionedSectionStatePayload> {
  const parsed = JSON.parse(raw) as Partial<VersionedSectionStatePayload>;

  if (
    parsed.version === BUILD_SURFACE_PERSISTENCE_VERSION
    && isFiniteNumber(parsed.height)
    && typeof parsed.collapsed === 'boolean'
  ) {
    return { state: parsed as VersionedSectionStatePayload, wasFallback: false };
  }

  if (
    parsed.version === undefined
    && isFiniteNumber(parsed.height)
    && typeof parsed.collapsed === 'boolean'
  ) {
    return {
      state: serializeSectionStatePayload({
        height: parsed.height,
        collapsed: parsed.collapsed,
      }),
      wasFallback: false,
    };
  }

  return {
    state: serializeSectionStatePayload(fallback),
    wasFallback: true,
    reason: 'Malformed persisted section state payload',
  };
}

export function serializeRightPanelStatePayload(
  state: Omit<VersionedRightPanelStatePayload, 'version'>,
): VersionedRightPanelStatePayload {
  return {
    version: BUILD_SURFACE_PERSISTENCE_VERSION,
    width: state.width,
    collapsed: state.collapsed,
  };
}

export function parseRightPanelStatePayload(
  raw: string,
  fallback: Omit<VersionedRightPanelStatePayload, 'version'>,
): BuildSurfacePersistenceParseResult<VersionedRightPanelStatePayload> {
  const parsed = JSON.parse(raw) as Partial<VersionedRightPanelStatePayload>;

  if (
    parsed.version === BUILD_SURFACE_PERSISTENCE_VERSION
    && isFiniteNumber(parsed.width)
    && typeof parsed.collapsed === 'boolean'
  ) {
    return { state: parsed as VersionedRightPanelStatePayload, wasFallback: false };
  }

  if (
    parsed.version === undefined
    && isFiniteNumber(parsed.width)
    && typeof parsed.collapsed === 'boolean'
  ) {
    return {
      state: serializeRightPanelStatePayload({
        width: parsed.width,
        collapsed: parsed.collapsed,
      }),
      wasFallback: false,
    };
  }

  return {
    state: serializeRightPanelStatePayload(fallback),
    wasFallback: true,
    reason: 'Malformed persisted right panel state payload',
  };
}
