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

test('matches repo-top folder paths against known-roots compatibility data and preserves deterministic ordering', () => {
  const result = prepareTreeKnownRootsCompatibilityEvidence({
    addressedTreeSnapshot: {
      occurrenceRecords: [
        { addressPath: 'A', parentAddressPath: null, depth: 0, path: 'src', name: 'src', occurrenceType: 'folder' },
        { addressPath: 'B', parentAddressPath: null, depth: 0, path: 'test', name: 'test', occurrenceType: 'folder' },
        { addressPath: 'C', parentAddressPath: null, depth: 0, path: 'docs/test', name: 'test', occurrenceType: 'folder' },
        { addressPath: 'D', parentAddressPath: null, depth: 0, path: 'src/index.js', name: 'index.js', occurrenceType: 'file' },
      ],
    },
    knownRootsRegistry: normalizeKnownRootsRegistry({
      topRoots: [
        { root: 'src', kind: 'structural', ownershipSource: 'builtin', styleClass: 'generic-builtin' },
        { root: 'test', kind: 'structural', ownershipSource: 'builtin' },
      ],
    }),
  });

  assert.deepEqual(result.evidenceRecords.map((record) => record.addressPath), ['A', 'B']);
  assert.equal(result.evidenceRecords.some((record) => record.occurrenceType === 'file'), false);
  assert.equal(result.evidenceRecords[0].path, 'src');
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
        { addressPath: 'A', parentAddressPath: null, depth: 0, path: 'test', name: 'test', occurrenceType: 'folder' },
        { addressPath: 'B', parentAddressPath: null, depth: 0, path: 'tests', name: 'tests', occurrenceType: 'folder' },
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
      occurrenceRecords: [{ addressPath: 'A', parentAddressPath: null, depth: 0, path: 'src', name: 'src', occurrenceType: 'folder' }],
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
        name: 'src',
        path: 'src',
        occurrenceType: 'folder',
        children: [
          { name: 'core', path: 'src/core', occurrenceType: 'folder', children: [] },
          { name: 'file.txt', path: 'src/file.txt', occurrenceType: 'file' },
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
  assert.equal(result.evidenceRecords[0].addressPath, 'A');
});

test('repo-top path-shape guard excludes scoped and nested known-root name matches', () => {
  const result = prepareTreeKnownRootsCompatibilityEvidence({
    addressedTreeSnapshot: {
      occurrenceRecords: [
        { addressPath: 'A', path: 'src', name: 'src', occurrenceType: 'folder', depth: 0, parentAddressPath: null },
        { addressPath: 'A.A', path: 'calculogic-validator/src', name: 'src', occurrenceType: 'folder', depth: 1, parentAddressPath: 'A' },
        { addressPath: 'A.B', path: 'docs/test', name: 'test', occurrenceType: 'folder', depth: 1, parentAddressPath: 'A' },
        { addressPath: 'A.C', path: 'packages/foo/src', name: 'src', occurrenceType: 'folder', depth: 2, parentAddressPath: 'A.B' },
        { addressPath: 'A.1', path: 'src.ts', name: 'src', occurrenceType: 'file', depth: 1, parentAddressPath: 'A' },
      ],
    },
    knownRootsRegistry: normalizeKnownRootsRegistry({
      topRoots: [
        { root: 'src', kind: 'structural', ownershipSource: 'builtin' },
        { root: 'test', kind: 'structural', ownershipSource: 'builtin' },
      ],
    }),
  });

  assert.deepEqual(result.evidenceRecords.map((record) => record.path), ['src']);
});
