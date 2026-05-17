import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareTreeKnownRootsCompatibilityEvidence } from '../src/tree-known-roots-compatibility-evidence.logic.mjs';
import { normalizeTreeKnownRootsRegistryPayload } from '../src/registries/tree-known-roots-registry.logic.mjs';
import { prepareTreeCodebaseAddressedSnapshot } from '../../structural-addressing/src/structural-addressing-tree-codebase.logic.mjs';

const normalizeKnownRootsRegistry = (payload) => normalizeTreeKnownRootsRegistryPayload(payload);

test('returns empty evidence for empty addressed occurrence records', () => {
  const result = prepareTreeKnownRootsCompatibilityEvidence({
    addressedTreeSnapshot: { occurrenceRecords: [] },
    knownRootsRegistry: normalizeKnownRootsRegistry({
      topRoots: [{ root: 'src', kind: 'structural', ownershipSource: 'builtin' }],
    }),
  });

  assert.deepEqual(result, { source: 'tree-known-roots-compatibility', evidenceRecords: [] });
});

test('matches folder occurrence names against known-roots compatibility data and preserves deterministic ordering', () => {
  const result = prepareTreeKnownRootsCompatibilityEvidence({
    addressedTreeSnapshot: {
      occurrenceRecords: [
        { addressPath: 'A', parentAddressPath: null, depth: 0, path: 'repo', name: 'repo', occurrenceType: 'folder' },
        { addressPath: 'A.A', parentAddressPath: 'A', depth: 1, path: 'repo/src', name: 'src', occurrenceType: 'folder' },
        { addressPath: 'A.A.A', parentAddressPath: 'A.A', depth: 2, path: 'repo/src/test', name: 'test', occurrenceType: 'folder' },
        { addressPath: 'A.1', parentAddressPath: 'A', depth: 1, path: 'repo/readme.md', name: 'readme.md', occurrenceType: 'file' },
      ],
    },
    knownRootsRegistry: normalizeKnownRootsRegistry({
      topRoots: [
        { root: 'src', kind: 'structural', ownershipSource: 'builtin', styleClass: 'generic-builtin' },
        { root: 'test', kind: 'structural', ownershipSource: 'builtin' },
      ],
    }),
  });

  assert.deepEqual(result.evidenceRecords.map((record) => record.addressPath), ['A.A']);
  assert.equal(result.evidenceRecords.some((record) => record.occurrenceType === 'file'), false);
  assert.equal(result.evidenceRecords[0].path, 'repo/src');
  assert.equal(result.evidenceRecords[0].name, 'src');
  assert.equal(result.evidenceRecords[0].occurrenceType, 'folder');
  assert.equal(result.evidenceRecords[0].knownRootKind, 'structural');
  assert.equal(result.evidenceRecords[0].knownRootOwnershipSource, 'builtin');
  assert.equal(result.evidenceRecords[0].knownRootStyleClass, 'generic-builtin');
});

test('preserves current known-root values without test/tests normalization', () => {
  const result = prepareTreeKnownRootsCompatibilityEvidence({
    addressedTreeSnapshot: {
      occurrenceRecords: [
        { addressPath: 'A', parentAddressPath: null, depth: 0, path: 'repo', name: 'repo', occurrenceType: 'folder' },
        { addressPath: 'A.A', parentAddressPath: 'A', depth: 1, path: 'repo/test', name: 'test', occurrenceType: 'folder' },
        { addressPath: 'A.B', parentAddressPath: 'A', depth: 1, path: 'repo/tests', name: 'tests', occurrenceType: 'folder' },
      ],
    },
    knownRootsRegistry: normalizeKnownRootsRegistry({
      topRoots: [{ root: 'test', kind: 'structural', ownershipSource: 'builtin' }],
    }),
  });

  assert.deepEqual(result.evidenceRecords.map((record) => record.name), ['test']);
});

test('does not emit findings, severity, placement verdicts, confidence scores, or validation report fields', () => {
  const result = prepareTreeKnownRootsCompatibilityEvidence({
    addressedTreeSnapshot: {
      occurrenceRecords: [{ addressPath: 'A.A', parentAddressPath: 'A', depth: 1, path: 'repo/src', name: 'src', occurrenceType: 'folder' }],
    },
    knownRootsRegistry: normalizeKnownRootsRegistry({
      topRoots: [{ root: 'src', kind: 'structural', ownershipSource: 'builtin' }],
    }),
  });

  const evidenceRecord = result.evidenceRecords[0];
  const forbiddenKeys = ['findingCode', 'severity', 'placementVerdict', 'confidenceScore', 'report'];
  for (const forbiddenKey of forbiddenKeys) {
    assert.equal(Object.hasOwn(evidenceRecord, forbiddenKey), false);
  }
});

test('rejects invalid input deterministically', () => {
  assert.throws(() => prepareTreeKnownRootsCompatibilityEvidence(), /input must be an object/u);
  assert.throws(
    () => prepareTreeKnownRootsCompatibilityEvidence({ addressedTreeSnapshot: { occurrenceRecords: [] } }),
    /must include knownRootsRegistry object/u,
  );
  assert.throws(
    () => prepareTreeKnownRootsCompatibilityEvidence({ knownRootsRegistry: { topRoots: [] } }),
    /must include addressedTreeSnapshot object/u,
  );
});

test('consumes an addressed snapshot prepared by prepareTreeCodebaseAddressedSnapshot', () => {
  const addressedTreeSnapshot = prepareTreeCodebaseAddressedSnapshot({
    scopeRoots: [
      {
        name: 'repo',
        path: 'repo',
        occurrenceType: 'folder',
        children: [
          { name: 'src', path: 'repo/src', occurrenceType: 'folder', children: [] },
          { name: 'file.txt', path: 'repo/file.txt', occurrenceType: 'file' },
        ],
      },
    ],
  });

  const result = prepareTreeKnownRootsCompatibilityEvidence({
    addressedTreeSnapshot,
    knownRootsRegistry: normalizeKnownRootsRegistry({
      topRoots: [{ root: 'src', kind: 'structural', ownershipSource: 'builtin' }],
    }),
  });

  assert.equal(result.evidenceRecords.length, 1);
  assert.equal(result.evidenceRecords[0].name, 'src');
  assert.equal(result.evidenceRecords[0].addressPath, 'A.A');
});


test('matches only scope-top folder children and excludes scope root nested folders and files', () => {
  const result = prepareTreeKnownRootsCompatibilityEvidence({
    addressedTreeSnapshot: {
      occurrenceRecords: [
        { addressPath: 'A', parentAddressPath: null, depth: 0, path: 'repo/src', name: 'src', occurrenceType: 'folder' },
        { addressPath: 'A.A', parentAddressPath: 'A', depth: 1, path: 'repo/src', name: 'src', occurrenceType: 'folder' },
        { addressPath: 'A.A.A', parentAddressPath: 'A.A', depth: 2, path: 'repo/src/src', name: 'src', occurrenceType: 'folder' },
        { addressPath: 'A.1', parentAddressPath: 'A', depth: 1, path: 'repo/src.js', name: 'src', occurrenceType: 'file' },
      ],
    },
    knownRootsRegistry: normalizeKnownRootsRegistry({
      topRoots: [{ root: 'src', kind: 'structural', ownershipSource: 'builtin' }],
    }),
  });

  assert.deepEqual(result.evidenceRecords.map((record) => record.addressPath), ['A.A']);
});
