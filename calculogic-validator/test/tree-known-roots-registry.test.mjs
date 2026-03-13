import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeTreeKnownRootsRegistryPayload } from '../tree/src/registries/tree-known-roots.registry.logic.mjs';

const EXPECTED_KNOWN_ROOTS = [
  'bin',
  'calculogic-doc-engine',
  'calculogic-validator',
  'doc',
  'docs',
  'public',
  'scripts',
  'src',
  'test',
  'tools',
];

test('tree-known-roots registry supports flat-only payloads', () => {
  const normalized = normalizeTreeKnownRootsRegistryPayload({
    knownTopLevelDirectories: EXPECTED_KNOWN_ROOTS,
  });

  assert.deepEqual([...normalized.knownTopLevelDirectories], EXPECTED_KNOWN_ROOTS);
  assert.equal(normalized.topRoots[0].root, 'bin');
  assert.equal(normalized.topRoots[0].kind, 'structural');
  assert.equal(normalized.topRoots[0].ownershipSource, 'builtin');
});

test('tree-known-roots registry supports structured-only payloads', () => {
  const normalized = normalizeTreeKnownRootsRegistryPayload({
    topRoots: [
      {
        root: 'src',
        kind: 'structural',
        ownershipSource: 'builtin',
        styleClass: 'generic-builtin',
      },
      {
        root: 'calculogic-validator',
        kind: 'semantic',
        ownershipSource: 'custom',
        styleClass: 'custom-style',
      },
      {
        root: 'calculogic-doc-engine',
        kind: 'semantic',
        ownershipSource: 'custom',
      },
    ],
  });

  assert.deepEqual([...normalized.knownTopLevelDirectories], [
    'calculogic-doc-engine',
    'calculogic-validator',
    'src',
  ]);
  assert.deepEqual(
    normalized.topRoots.map((entry) => entry.root),
    ['calculogic-doc-engine', 'calculogic-validator', 'src'],
  );
});

test('tree-known-roots registry uses structured precedence for dual-shape payloads', () => {
  const normalized = normalizeTreeKnownRootsRegistryPayload({
    topRoots: [
      {
        root: 'src',
        kind: 'structural',
        ownershipSource: 'builtin',
      },
      {
        root: 'calculogic-validator',
        kind: 'semantic',
        ownershipSource: 'custom',
      },
    ],
    knownTopLevelDirectories: ['src', 'tools', 'legacy-root'],
  });

  assert.deepEqual([...normalized.knownTopLevelDirectories], ['calculogic-validator', 'src']);
});

test('tree-known-roots registry fails clearly for invalid structured enums', () => {
  assert.throws(
    () =>
      normalizeTreeKnownRootsRegistryPayload({
        topRoots: [{ root: 'src', kind: 'invalid', ownershipSource: 'builtin' }],
      }),
    /topRoots\[0\]\.kind must be one of structural\|semantic/u,
  );

  assert.throws(
    () =>
      normalizeTreeKnownRootsRegistryPayload({
        topRoots: [{ root: 'src', kind: 'structural', ownershipSource: 'invalid' }],
      }),
    /topRoots\[0\]\.ownershipSource must be one of builtin\|custom/u,
  );
});

test('tree-known-roots registry fails clearly for duplicate structured root metadata conflicts', () => {
  assert.throws(
    () =>
      normalizeTreeKnownRootsRegistryPayload({
        topRoots: [
          { root: 'src', kind: 'structural', ownershipSource: 'builtin', styleClass: 'generic-builtin' },
          { root: 'src', kind: 'semantic', ownershipSource: 'builtin', styleClass: 'generic-builtin' },
        ],
      }),
    /duplicate topRoots entry for root "src" has conflicting metadata/u,
  );

  assert.throws(
    () =>
      normalizeTreeKnownRootsRegistryPayload({
        topRoots: [
          { root: 'src', kind: 'structural', ownershipSource: 'builtin', styleClass: 'generic-builtin' },
          { root: 'src', kind: 'structural', ownershipSource: 'custom', styleClass: 'generic-builtin' },
        ],
      }),
    /duplicate topRoots entry for root "src" has conflicting metadata/u,
  );

  assert.throws(
    () =>
      normalizeTreeKnownRootsRegistryPayload({
        topRoots: [
          { root: 'src', kind: 'structural', ownershipSource: 'builtin', styleClass: 'generic-builtin' },
          { root: 'src', kind: 'structural', ownershipSource: 'builtin', styleClass: 'semantic-custom' },
        ],
      }),
    /duplicate topRoots entry for root "src" has conflicting metadata/u,
  );
});

test('tree-known-roots registry fails clearly for empty or missing accepted shapes', () => {
  assert.throws(
    () => normalizeTreeKnownRootsRegistryPayload({ topRoots: [] }),
    /topRoots must contain at least one entry/u,
  );

  assert.throws(
    () => normalizeTreeKnownRootsRegistryPayload({ knownTopLevelDirectories: [] }),
    /knownTopLevelDirectories must contain at least one entry/u,
  );

  assert.throws(
    () => normalizeTreeKnownRootsRegistryPayload({ someOtherShape: [] }),
    /expected topRoots array or knownTopLevelDirectories array/u,
  );
});

test('tree-known-roots registry fails clearly for invalid optional styleClass', () => {
  assert.throws(
    () =>
      normalizeTreeKnownRootsRegistryPayload({
        topRoots: [{ root: 'src', kind: 'structural', ownershipSource: 'builtin', styleClass: '' }],
      }),
    /topRoots\[0\]\.styleClass must be a non-empty string when provided/u,
  );

  assert.throws(
    () =>
      normalizeTreeKnownRootsRegistryPayload({
        topRoots: [{ root: 'src', kind: 'structural', ownershipSource: 'builtin', styleClass: 123 }],
      }),
    /topRoots\[0\]\.styleClass must be a non-empty string when provided/u,
  );
});

test('tree-known-roots registry keeps known roots stable with structured repo-local semantic entries', () => {
  const normalized = normalizeTreeKnownRootsRegistryPayload({
    topRoots: EXPECTED_KNOWN_ROOTS.map((root) => ({
      root,
      kind:
        root === 'calculogic-validator' || root === 'calculogic-doc-engine' ? 'semantic' : 'structural',
      ownershipSource:
        root === 'calculogic-validator' || root === 'calculogic-doc-engine' ? 'custom' : 'builtin',
      styleClass:
        root === 'calculogic-validator' || root === 'calculogic-doc-engine'
          ? 'custom-style'
          : 'generic-builtin',
    })),
  });

  assert.deepEqual([...normalized.knownTopLevelDirectories], EXPECTED_KNOWN_ROOTS);
});
