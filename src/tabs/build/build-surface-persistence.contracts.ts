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

export type BuildSurfacePersistenceFallbackReasonCode =
  | 'malformed-json'
  | 'unsupported-version'
  | 'invalid-shape';

export interface BuildSurfacePersistenceParseResult<TPayload> {
  state: TPayload;
  wasFallback: boolean;
  wasMigrated: boolean;
  reasonCode?: BuildSurfacePersistenceFallbackReasonCode;
  reason?: string;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function hasUnsupportedVersion(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const parsed = value as { version?: unknown };
  return typeof parsed.version === 'number' && parsed.version !== BUILD_SURFACE_PERSISTENCE_VERSION;
}

function parsePayloadContract<TVersionedPayload, TLegacyPayload>(
  raw: string,
  fallback: TVersionedPayload,
  fallbackLabel: string,
  isVersionedPayload: (value: unknown) => value is TVersionedPayload,
  isLegacyPayload: (value: unknown) => value is TLegacyPayload,
  upgradeLegacyPayload: (legacyPayload: TLegacyPayload) => TVersionedPayload,
): BuildSurfacePersistenceParseResult<TVersionedPayload> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      state: fallback,
      wasFallback: true,
      wasMigrated: false,
      reasonCode: 'malformed-json',
      reason: `${fallbackLabel}: malformed-json`,
    };
  }

  if (isVersionedPayload(parsed)) {
    return { state: parsed, wasFallback: false, wasMigrated: false };
  }

  if (isLegacyPayload(parsed)) {
    return {
      state: upgradeLegacyPayload(parsed),
      wasFallback: false,
      wasMigrated: true,
    };
  }

  if (hasUnsupportedVersion(parsed)) {
    return {
      state: fallback,
      wasFallback: true,
      wasMigrated: false,
      reasonCode: 'unsupported-version',
      reason: `${fallbackLabel}: unsupported-version`,
    };
  }

  return {
    state: fallback,
    wasFallback: true,
    wasMigrated: false,
    reasonCode: 'invalid-shape',
    reason: `${fallbackLabel}: invalid-shape`,
  };
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

function isVersionedSectionStatePayload(value: unknown): value is VersionedSectionStatePayload {
  const parsed = value as Partial<VersionedSectionStatePayload>;
  return (
    parsed?.version === BUILD_SURFACE_PERSISTENCE_VERSION
    && isFiniteNumber(parsed.height)
    && typeof parsed.collapsed === 'boolean'
  );
}

function isLegacySectionStatePayload(value: unknown): value is Omit<VersionedSectionStatePayload, 'version'> {
  const parsed = value as Partial<VersionedSectionStatePayload>;
  return (
    parsed?.version === undefined
    && isFiniteNumber(parsed.height)
    && typeof parsed.collapsed === 'boolean'
  );
}

export function parseSectionStatePayload(
  raw: string,
  fallback: Omit<VersionedSectionStatePayload, 'version'>,
): BuildSurfacePersistenceParseResult<VersionedSectionStatePayload> {
  return parsePayloadContract(
    raw,
    serializeSectionStatePayload(fallback),
    'Malformed persisted section state payload',
    isVersionedSectionStatePayload,
    isLegacySectionStatePayload,
    serializeSectionStatePayload,
  );
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

function isVersionedRightPanelStatePayload(value: unknown): value is VersionedRightPanelStatePayload {
  const parsed = value as Partial<VersionedRightPanelStatePayload>;
  return (
    parsed?.version === BUILD_SURFACE_PERSISTENCE_VERSION
    && isFiniteNumber(parsed.width)
    && typeof parsed.collapsed === 'boolean'
  );
}

function isLegacyRightPanelStatePayload(
  value: unknown,
): value is Omit<VersionedRightPanelStatePayload, 'version'> {
  const parsed = value as Partial<VersionedRightPanelStatePayload>;
  return (
    parsed?.version === undefined
    && isFiniteNumber(parsed.width)
    && typeof parsed.collapsed === 'boolean'
  );
}

export function parseRightPanelStatePayload(
  raw: string,
  fallback: Omit<VersionedRightPanelStatePayload, 'version'>,
): BuildSurfacePersistenceParseResult<VersionedRightPanelStatePayload> {
  return parsePayloadContract(
    raw,
    serializeRightPanelStatePayload(fallback),
    'Malformed persisted right panel state payload',
    isVersionedRightPanelStatePayload,
    isLegacyRightPanelStatePayload,
    serializeRightPanelStatePayload,
  );
}
