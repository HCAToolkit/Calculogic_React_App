import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareTreeStructuralAddressSnapshot } from '../src/tree-structural-address-snapshot.logic.mjs';

const byResolvedPath = (occurrenceRecords) =>
  Object.fromEntries(occurrenceRecords.map((record) => [record.resolvedPath, record]));

test('structural-address snapshot returns neutral evidence envelope shape', () => {
  const snapshot = prepareTreeStructuralAddressSnapshot({
    selectedPaths: ['calculogic-validator/tree/src/tree-structure-advisor.logic.mjs'],
    includeRoots: ['calculogic-validator'],
  });

  assert.deepEqual(Object.keys(snapshot).sort(), ['occurrenceRecords', 'scope', 'scopeRoots']);
  assert.deepEqual(Object.keys(snapshot.scope).sort(), ['scopeRootPath', 'source', 'targetKind']);
  assert.equal(Array.isArray(snapshot.scopeRoots), true);
  assert.equal(Array.isArray(snapshot.occurrenceRecords), true);
  assert.equal(snapshot.occurrenceRecords.some((record) => Object.hasOwn(record, 'resolvedPath')), true);
  assert.equal(snapshot.occurrenceRecords.some((record) => Object.hasOwn(record, 'path')), true);
  assert.equal(snapshot.occurrenceRecords.some((record) => Object.hasOwn(record, 'name')), true);
  assert.equal(snapshot.occurrenceRecords.some((record) => Object.hasOwn(record, 'addressPath')), true);
  assert.equal(snapshot.occurrenceRecords.some((record) => Object.hasOwn(record, 'parentAddressPath')), true);
  assert.equal(snapshot.occurrenceRecords.some((record) => Object.hasOwn(record, 'code')), false);
  assert.equal(snapshot.occurrenceRecords.some((record) => Object.hasOwn(record, 'severity')), false);
  assert.equal(snapshot.occurrenceRecords.some((record) => Object.hasOwn(record, 'placementConfidence')), false);
});

test('structural-address snapshot markers preserve deterministic folder/file addressing semantics', () => {
  const snapshot = prepareTreeStructuralAddressSnapshot({
    selectedPaths: [
      'root/folder-a/file-a-1.txt',
      'root/folder-a/file-a-2.txt',
      'root/folder-b/sub-a/file-b-1.txt',
      'root/folder-b/sub-b/file-b-2.txt',
      'root/folder-b/sub-b/file-b-3.txt',
    ],
    includeRoots: ['root'],
    scope: { targetKind: 'dir', source: 'test-fixture' },
  });

  const records = byResolvedPath(snapshot.occurrenceRecords);

  assert.equal(records.root.occurrenceMarker, 'A');
  assert.equal(records['root/folder-a'].occurrenceMarker, 'A.A');
  assert.equal(records['root/folder-b'].occurrenceMarker, 'A.B');
  assert.equal(records['root/folder-a/file-a-1.txt'].occurrenceMarker, 'A.A.1');
  assert.equal(records['root/folder-a/file-a-2.txt'].occurrenceMarker, 'A.A.2');
  assert.equal(records['root/folder-b/sub-a'].occurrenceMarker, 'A.B.A');
  assert.equal(records['root/folder-b/sub-b'].occurrenceMarker, 'A.B.B');
  assert.equal(records['root/folder-b/sub-a/file-b-1.txt'].occurrenceMarker, 'A.B.A.1');
  assert.equal(records['root/folder-b/sub-b/file-b-2.txt'].occurrenceMarker, 'A.B.B.1');
  assert.equal(records['root/folder-b/sub-b/file-b-3.txt'].occurrenceMarker, 'A.B.B.2');
  assert.equal(records['root/folder-b/sub-b/file-b-2.txt'].resolvedPath, 'root/folder-b/sub-b/file-b-2.txt');
  assert.equal(records['root/folder-b/sub-b/file-b-2.txt'].path, 'root/folder-b/sub-b/file-b-2.txt');
  assert.equal(records['root/folder-b/sub-b/file-b-2.txt'].name, 'file-b-2.txt');
  assert.equal(records['root/folder-b/sub-b/file-b-2.txt'].addressPath, 'A.B.B.1');
  assert.equal(records['root/folder-b/sub-b/file-b-2.txt'].parentAddressPath, 'A.B.B');
  assert.deepEqual(records['root/folder-b/sub-b/file-b-3.txt'].markerSegments, ['A', 'B', 'B', '2']);
});

test('structural-address snapshot infers target kind for single string file target', () => {
  const snapshot = prepareTreeStructuralAddressSnapshot({
    selectedPaths: ['root/folder/file.txt'],
    targets: ['root/folder/file.txt'],
  });

  assert.equal(snapshot.scope.targetKind, 'file');
});

test('structural-address snapshot infers target kind for single string directory target', () => {
  const snapshot = prepareTreeStructuralAddressSnapshot({
    selectedPaths: ['root/folder/file.txt'],
    targets: ['root/folder'],
  });

  assert.equal(snapshot.scope.targetKind, 'dir');
});
