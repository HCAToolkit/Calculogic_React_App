import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareTreeCodebaseAddressedSnapshot } from '../src/structural-addressing-tree-codebase.logic.mjs';

const buildFixtureInput = () => ({
  sourceNamespace: 'calculogic-validator',
  scope: 'validator',
  target: null,
  scopeRoots: [
    {
      name: 'calculogic-validator',
      path: 'calculogic-validator',
      occurrenceType: 'folder',
      children: [
        { name: 'LICENSE', path: 'calculogic-validator/LICENSE', occurrenceType: 'file' },
        { name: 'README.md', path: 'calculogic-validator/README.md', occurrenceType: 'file' },
        {
          name: 'doc',
          path: 'calculogic-validator/doc',
          occurrenceType: 'folder',
          children: [
            {
              name: 'ConventionRoutines',
              path: 'calculogic-validator/doc/ConventionRoutines',
              occurrenceType: 'folder',
              children: [],
            },
          ],
        },
      ],
    },
  ],
});

const getRecordByPath = (records, path) => records.find((record) => record.path === path);

test('returns addressedTreeSnapshot/tree-codebase/T and preserves source scope target', () => {
  const result = prepareTreeCodebaseAddressedSnapshot(buildFixtureInput());

  assert.equal(result.snapshotOutputId, 'addressedTreeSnapshot');
  assert.equal(result.profileId, 'tree-codebase');
  assert.equal(result.domainPrefix, 'T');
  assert.equal(result.sourceNamespace, 'calculogic-validator');
  assert.equal(result.scope, 'validator');
  assert.equal(result.target, null);
});

test('scope root and descendants receive deterministic address paths', () => {
  const result = prepareTreeCodebaseAddressedSnapshot(buildFixtureInput());

  assert.equal(getRecordByPath(result.occurrenceRecords, 'calculogic-validator')?.addressPath, 'A');
  assert.equal(getRecordByPath(result.occurrenceRecords, 'calculogic-validator/LICENSE')?.addressPath, 'A.1');
  assert.equal(getRecordByPath(result.occurrenceRecords, 'calculogic-validator/README.md')?.addressPath, 'A.2');
  assert.equal(getRecordByPath(result.occurrenceRecords, 'calculogic-validator/doc')?.addressPath, 'A.A');
  assert.equal(
    getRecordByPath(result.occurrenceRecords, 'calculogic-validator/doc/ConventionRoutines')?.addressPath,
    'A.A.A',
  );
});

test('counters reset per parent and split by occurrence type', () => {
  const input = {
    sourceNamespace: 'calculogic-validator',
    scope: 'validator',
    target: null,
    scopeRoots: [
      {
        name: 'root',
        path: 'root',
        occurrenceType: 'folder',
        children: [
          { name: 'file-1', path: 'root/file-1', occurrenceType: 'file' },
          { name: 'folder-1', path: 'root/folder-1', occurrenceType: 'folder', children: [] },
          {
            name: 'folder-2',
            path: 'root/folder-2',
            occurrenceType: 'folder',
            children: [
              { name: 'nested-file', path: 'root/folder-2/nested-file', occurrenceType: 'file' },
              { name: 'nested-folder', path: 'root/folder-2/nested-folder', occurrenceType: 'folder', children: [] },
            ],
          },
        ],
      },
    ],
  };

  const result = prepareTreeCodebaseAddressedSnapshot(input);

  assert.equal(getRecordByPath(result.occurrenceRecords, 'root/file-1')?.addressPath, 'A.1');
  assert.equal(getRecordByPath(result.occurrenceRecords, 'root/folder-1')?.addressPath, 'A.A');
  assert.equal(getRecordByPath(result.occurrenceRecords, 'root/folder-2')?.addressPath, 'A.B');
  assert.equal(getRecordByPath(result.occurrenceRecords, 'root/folder-2/nested-file')?.addressPath, 'A.B.1');
  assert.equal(getRecordByPath(result.occurrenceRecords, 'root/folder-2/nested-folder')?.addressPath, 'A.B.A');
});

test('multiple scope roots receive deterministic root folder markers', () => {
  const input = {
    sourceNamespace: 'calculogic-validator',
    scope: 'validator',
    target: null,
    scopeRoots: [
      { name: 'first-root', path: 'first-root', occurrenceType: 'folder', children: [] },
      { name: 'second-root', path: 'second-root', occurrenceType: 'folder', children: [] },
    ],
  };

  const result = prepareTreeCodebaseAddressedSnapshot(input);

  assert.equal(getRecordByPath(result.occurrenceRecords, 'first-root')?.addressPath, 'A');
  assert.equal(getRecordByPath(result.occurrenceRecords, 'second-root')?.addressPath, 'B');
});

test('occurrence records include required fields with deterministic parentAddressPath/depth/orderIndex', () => {
  const result = prepareTreeCodebaseAddressedSnapshot(buildFixtureInput());
  const root = getRecordByPath(result.occurrenceRecords, 'calculogic-validator');
  const childFile = getRecordByPath(result.occurrenceRecords, 'calculogic-validator/LICENSE');

  assert.deepEqual(Object.keys(root).sort(), [
    'address',
    'addressPath',
    'depth',
    'displayMarker',
    'name',
    'occurrenceType',
    'orderIndex',
    'parentAddressPath',
    'path',
  ]);

  assert.equal(root?.parentAddressPath, null);
  assert.equal(root?.depth, 0);
  assert.equal(root?.orderIndex, 0);

  assert.equal(childFile?.parentAddressPath, 'A');
  assert.equal(childFile?.depth, 1);
  assert.equal(childFile?.orderIndex, 1);
  assert.deepEqual(result.occurrenceRecords.map((record) => record.orderIndex), [0, 1, 2, 3, 4]);
});

test('fails deterministically for missing and invalid top-level input', () => {
  assert.throws(
    () => prepareTreeCodebaseAddressedSnapshot(undefined),
    /Tree-codebase addressed snapshot input is required\./u,
  );
  assert.throws(
    () => prepareTreeCodebaseAddressedSnapshot('invalid'),
    /Tree-codebase addressed snapshot input must be an object\./u,
  );
  assert.throws(
    () => prepareTreeCodebaseAddressedSnapshot({}),
    /Tree-codebase addressed snapshot input must include scopeRoots\./u,
  );
  assert.throws(
    () => prepareTreeCodebaseAddressedSnapshot({ scopeRoots: 'invalid' }),
    /Tree-codebase addressed snapshot scopeRoots must be an array\./u,
  );
});

test('fails deterministically for unsupported occurrenceType and missing required occurrence fields', () => {
  assert.throws(
    () =>
      prepareTreeCodebaseAddressedSnapshot({
        scopeRoots: [{ name: 'root', path: 'root', occurrenceType: 'unknown', children: [] }],
      }),
    /Tree-codebase occurrence type is unsupported: unknown\./u,
  );

  assert.throws(
    () =>
      prepareTreeCodebaseAddressedSnapshot({
        scopeRoots: [{ path: 'root', occurrenceType: 'folder', children: [] }],
      }),
    /Tree-codebase occurrence node name is required\./u,
  );

  assert.throws(
    () =>
      prepareTreeCodebaseAddressedSnapshot({
        scopeRoots: [{ name: 'root', occurrenceType: 'folder', children: [] }],
      }),
    /Tree-codebase occurrence node path is required\./u,
  );
});

test('fails deterministically for invalid children shape', () => {
  assert.throws(
    () =>
      prepareTreeCodebaseAddressedSnapshot({
        scopeRoots: [{ name: 'root', path: 'root', occurrenceType: 'folder', children: {} }],
      }),
    /Tree-codebase occurrence node children must be an array when provided\./u,
  );
});
