import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareTreeStructuralHomeEvidence } from '../src/tree-structural-home-evidence.logic.mjs';

const structuralHomesRegistryFixture = {
  version: '1',
  structuralHomes: [
    { structuralHome: 'src', status: 'active', definition: 'source home' },
    { structuralHome: 'tests', status: 'active', definition: 'tests home' },
  ],
};

test('returns empty evidence for empty addressed occurrence records', () => {
  const result = prepareTreeStructuralHomeEvidence({
    addressedOccurrenceRecords: [],
    structuralHomesRegistry: structuralHomesRegistryFixture,
  });

  assert.deepEqual(result, { source: 'tree-structural-home-evidence', evidenceRecords: [] });
});

test('returns evidence-only records using repo-top folder matches and preserves ordering', () => {
  const result = prepareTreeStructuralHomeEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A', parentAddressPath: null, path: 'src', name: 'src', occurrenceType: 'folder' },
      { addressPath: 'B', parentAddressPath: null, path: 'docs', name: 'docs', occurrenceType: 'folder' },
      { addressPath: 'C', parentAddressPath: null, path: 'tests', name: 'tests', occurrenceType: 'folder' },
    ],
    structuralHomesRegistry: structuralHomesRegistryFixture,
  });

  assert.deepEqual(result.evidenceRecords.map((record) => record.addressPath), ['A', 'C']);
  assert.deepEqual(Object.keys(result.evidenceRecords[0]).sort(), [
    'addressPath',
    'name',
    'occurrenceType',
    'parentAddressPath',
    'path',
    'rationale',
    'structuralHome',
    'structuralHomeDefinition',
    'structuralHomeEvidenceStrength',
    'structuralHomeSource',
    'structuralHomeStatus',
  ]);
});

test('does not emit findings/verdict or known-roots replacement fields', () => {
  const result = prepareTreeStructuralHomeEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A', parentAddressPath: null, path: 'src', name: 'src', occurrenceType: 'folder' },
    ],
    structuralHomesRegistry: structuralHomesRegistryFixture,
  });

  const evidenceRecord = result.evidenceRecords[0];
  const forbiddenKeys = [
    'finding',
    'findingCode',
    'severity',
    'verdict',
    'placementVerdict',
    'isKnownTopRoot',
    'isStructuralRoot',
    'isSemanticRoot',
    'structuralClass',
    'structuralKind',
  ];

  for (const forbiddenKey of forbiddenKeys) {
    assert.equal(Object.hasOwn(evidenceRecord, forbiddenKey), false);
  }
});

test('does not mutate structural homes registry input', () => {
  const inputRegistry = {
    version: '1',
    structuralHomes: [{ structuralHome: 'src', status: 'active', definition: 'source home' }],
  };
  const inputRegistrySnapshot = JSON.parse(JSON.stringify(inputRegistry));

  prepareTreeStructuralHomeEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A', parentAddressPath: null, path: 'src', name: 'src', occurrenceType: 'folder' },
    ],
    structuralHomesRegistry: inputRegistry,
  });

  assert.deepEqual(inputRegistry, inputRegistrySnapshot);
});

test('handles non-folder occurrences and nested basename matches safely', () => {
  const result = prepareTreeStructuralHomeEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A', parentAddressPath: null, path: 'src', name: 'src', occurrenceType: 'folder' },
      { addressPath: 'A.1', parentAddressPath: 'A', path: 'src/index.mjs', name: 'index.mjs', occurrenceType: 'file' },
      { addressPath: 'B', parentAddressPath: null, path: 'calculogic-validator/src', name: 'src', occurrenceType: 'folder' },
    ],
    structuralHomesRegistry: structuralHomesRegistryFixture,
  });

  assert.deepEqual(result.evidenceRecords.map((record) => record.path), ['src']);
});

test('rejects invalid input deterministically', () => {
  assert.throws(() => prepareTreeStructuralHomeEvidence(), /input must be an object/u);
  assert.throws(
    () => prepareTreeStructuralHomeEvidence({ addressedOccurrenceRecords: [] }),
    /must include structuralHomesRegistry object/u,
  );
  assert.throws(
    () => prepareTreeStructuralHomeEvidence({ structuralHomesRegistry: { structuralHomes: [] } }),
    /addressedOccurrenceRecords must be an array/u,
  );
});
