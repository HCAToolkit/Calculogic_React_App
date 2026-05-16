import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareTreeCodebaseAddressedSnapshot } from '../src/structural-addressing-tree-codebase.logic.mjs';
import { renderTreeCodebaseAddressedSnapshot } from '../src/structural-addressing-render-tree.logic.mjs';

const buildInput = () => ({
  sourceNamespace: 'calculogic-validator',
  scope: 'validator',
  target: null,
  scopeRoots: [
    {
      name: 'calculogic-validator',
      path: 'calculogic-validator',
      occurrenceType: 'folder',
      children: [
        { name: 'README.md', path: 'calculogic-validator/README.md', occurrenceType: 'file' },
        { name: 'LICENSE', path: 'calculogic-validator/LICENSE', occurrenceType: 'file' },
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

const expectedTree = `A: calculogic-validator/
├─ A: doc/
│  └─ A: ConventionRoutines/
├─ 1: LICENSE
└─ 2: README.md`;

test('renderedTree is produced deterministically from occurrenceRecords with branch glyph format', () => {
  const snapshot = prepareTreeCodebaseAddressedSnapshot(buildInput());
  const result = renderTreeCodebaseAddressedSnapshot(snapshot);
  assert.deepEqual(result, { renderedTree: expectedTree });
});

test('renderer output follows addressed snapshot order and not raw fixture order', () => {
  const snapshot = prepareTreeCodebaseAddressedSnapshot(buildInput());
  const rawChildOrder = buildInput().scopeRoots[0].children.map((child) => child.name);
  assert.deepEqual(rawChildOrder, ['README.md', 'LICENSE', 'doc']);
  assert.match(snapshot.occurrenceRecords.map((record) => record.name).join(','), /doc,ConventionRoutines,LICENSE,README\.md/u);
  const result = renderTreeCodebaseAddressedSnapshot(snapshot);
  assert.match(result.renderedTree, /├─ A: doc\/\n│  └─ A: ConventionRoutines\/\n├─ 1: LICENSE/u);
});

test('folder with descendants and a later sibling renders with branch connector and continuation bars', () => {
  const snapshot = prepareTreeCodebaseAddressedSnapshot(buildInput());
  const result = renderTreeCodebaseAddressedSnapshot(snapshot);

  assert.match(result.renderedTree, /^├─ A: doc\/$/mu);
  assert.match(result.renderedTree, /^│  └─ A: ConventionRoutines\/$/mu);
});



test('later-sibling detection stays correct across non-adjacent preorder subtree boundaries', () => {
  const snapshot = prepareTreeCodebaseAddressedSnapshot({
    sourceNamespace: 'calculogic-validator',
    scope: 'validator',
    target: null,
    scopeRoots: [
      {
        name: 'root',
        path: 'root',
        occurrenceType: 'folder',
        children: [
          {
            name: 'folder-a',
            path: 'root/folder-a',
            occurrenceType: 'folder',
            children: [
              { name: 'nested', path: 'root/folder-a/nested', occurrenceType: 'folder', children: [] },
            ],
          },
          { name: 'folder-b', path: 'root/folder-b', occurrenceType: 'folder', children: [] },
          { name: 'z-file-c', path: 'root/z-file-c', occurrenceType: 'file' },
        ],
      },
    ],
  });

  const { renderedTree } = renderTreeCodebaseAddressedSnapshot(snapshot);
  assert.match(renderedTree, /^├─ A: folder-a\/$/mu);
  assert.match(renderedTree, /^│  └─ A: nested\/$/mu);
  assert.match(renderedTree, /^├─ B: folder-b\/$/mu);
  assert.match(renderedTree, /^└─ 1: z-file-c$/mu);
});
test('last sibling with descendants renders with terminal connector', () => {
  const snapshot = prepareTreeCodebaseAddressedSnapshot({
    sourceNamespace: 'calculogic-validator',
    scope: 'validator',
    target: null,
    scopeRoots: [
      {
        name: 'root',
        path: 'root',
        occurrenceType: 'folder',
        children: [
          { name: 'a.txt', path: 'root/a.txt', occurrenceType: 'file' },
          {
            name: 'z-doc',
            path: 'root/z-doc',
            occurrenceType: 'folder',
            children: [{ name: 'nested.md', path: 'root/z-doc/nested.md', occurrenceType: 'file' }],
          },
        ],
      },
    ],
  });

  const result = renderTreeCodebaseAddressedSnapshot(snapshot);
  assert.match(result.renderedTree, /^└─ A: z-doc\/$/mu);
});

test('render is stable for repeated calls with the same snapshot', () => {
  const snapshot = prepareTreeCodebaseAddressedSnapshot(buildInput());
  const first = renderTreeCodebaseAddressedSnapshot(snapshot);
  const second = renderTreeCodebaseAddressedSnapshot(snapshot);
  assert.deepEqual(first, second);
});

test('render handles empty occurrenceRecords deterministically', () => {
  const result = renderTreeCodebaseAddressedSnapshot({ occurrenceRecords: [] });
  assert.deepEqual(result, { renderedTree: '' });
});

test('fails deterministically for missing and invalid top-level input/occurrenceRecords', () => {
  assert.throws(
    () => renderTreeCodebaseAddressedSnapshot(undefined),
    /Tree-codebase renderedTree snapshot input is required\./u,
  );
  assert.throws(
    () => renderTreeCodebaseAddressedSnapshot('invalid'),
    /Tree-codebase renderedTree snapshot input must be an object\./u,
  );
  assert.throws(
    () => renderTreeCodebaseAddressedSnapshot({}),
    /Tree-codebase renderedTree snapshot input must include occurrenceRecords\./u,
  );
  assert.throws(
    () => renderTreeCodebaseAddressedSnapshot({ occurrenceRecords: 'invalid' }),
    /Tree-codebase renderedTree occurrenceRecords must be an array\./u,
  );
});

test('fails deterministically for missing required record fields and unsupported occurrenceType', () => {
  assert.throws(
    () => renderTreeCodebaseAddressedSnapshot({ occurrenceRecords: [{ displayMarker: 'A', occurrenceType: 'folder', name: 'x', path: 'x', parentAddressPath: null, depth: 0, orderIndex: 0 }] }),
    /Tree-codebase renderedTree occurrence record addressPath is required\./u,
  );
  assert.throws(
    () => renderTreeCodebaseAddressedSnapshot({ occurrenceRecords: [{ addressPath: 'A', occurrenceType: 'folder', name: 'x', path: 'x', parentAddressPath: null, depth: 0, orderIndex: 0 }] }),
    /Tree-codebase renderedTree occurrence record displayMarker is required\./u,
  );
  assert.throws(
    () => renderTreeCodebaseAddressedSnapshot({ occurrenceRecords: [{ addressPath: 'A', displayMarker: 'A', name: 'x', path: 'x', parentAddressPath: null, depth: 0, orderIndex: 0 }] }),
    /Tree-codebase renderedTree occurrence type is unsupported: \(missing\)\./u,
  );
});

test('fails deterministically for invalid parentAddressPath, depth, and orderIndex', () => {
  assert.throws(
    () => renderTreeCodebaseAddressedSnapshot({ occurrenceRecords: [{ addressPath: 'A', displayMarker: 'A', occurrenceType: 'folder', name: 'x', path: 'x', parentAddressPath: 1, depth: 0, orderIndex: 0 }] }),
    /Tree-codebase renderedTree occurrence record parentAddressPath must be string or null\./u,
  );
  assert.throws(
    () => renderTreeCodebaseAddressedSnapshot({ occurrenceRecords: [{ addressPath: 'A', displayMarker: 'A', occurrenceType: 'folder', name: 'x', path: 'x', parentAddressPath: null, depth: -1, orderIndex: 0 }] }),
    /Tree-codebase renderedTree occurrence record depth must be a non-negative integer\./u,
  );
  assert.throws(
    () => renderTreeCodebaseAddressedSnapshot({ occurrenceRecords: [{ addressPath: 'A', displayMarker: 'A', occurrenceType: 'folder', name: 'x', path: 'x', parentAddressPath: null, depth: 0, orderIndex: -1 }] }),
    /Tree-codebase renderedTree occurrence record orderIndex must be a non-negative integer\./u,
  );
});
