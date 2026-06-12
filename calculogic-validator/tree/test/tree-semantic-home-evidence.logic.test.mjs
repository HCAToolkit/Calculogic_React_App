import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareTreeSemanticHomeEvidence } from '../src/tree-semantic-home-evidence.logic.mjs';

const namingSemanticEvidenceFixture = [
  {
    path: 'src/app-shell.logic.ts',
    semanticName: 'app-shell',
    semanticFamily: 'app-shell',
    familyRoot: 'app',
    familySubgroup: 'shell',
    evidenceSource: 'namingSemanticFamilyBridge',
    evidenceStrength: 'high',
  },
  {
    path: 'test/tree-structure-advisor.test.mjs',
    semanticName: 'tree-structure-advisor',
    semanticFamily: 'tree-structure-advisor',
    familyRoot: 'tree',
    evidenceSource: 'namingSemanticFamilyBridge',
    evidenceStrength: 'bounded',
    occurrenceType: 'file',
  },
];

test('returns deterministic evidence-only records joined by path and preserves addressed ordering', () => {
  const addressedOccurrenceRecords = [
    { addressPath: 'A', parentAddressPath: null, path: 'src/app-shell.logic.ts', name: 'app-shell.logic.ts', occurrenceType: 'file' },
    { addressPath: 'B', parentAddressPath: null, path: 'src', name: 'src', occurrenceType: 'folder' },
    { addressPath: 'C', parentAddressPath: null, path: 'test/tree-structure-advisor.test.mjs', name: 'tree-structure-advisor.test.mjs', occurrenceType: 'file' },
  ];

  const beforeAddressed = structuredClone(addressedOccurrenceRecords);
  const beforeNaming = structuredClone(namingSemanticEvidenceFixture);
  const result = prepareTreeSemanticHomeEvidence({ addressedOccurrenceRecords, namingSemanticEvidenceRecords: namingSemanticEvidenceFixture });

  assert.deepEqual(addressedOccurrenceRecords, beforeAddressed);
  assert.deepEqual(namingSemanticEvidenceFixture, beforeNaming);
  assert.deepEqual(result.evidenceRecords.map((record) => record.addressPath), ['A', 'C']);
  assert.equal(result.evidenceRecords[0].addressPath, 'A');
  assert.equal(result.evidenceRecords[0].parentAddressPath, null);
  assert.equal(result.evidenceRecords[0].path, 'src/app-shell.logic.ts');
  assert.equal(result.evidenceRecords[0].semanticName, 'app-shell');
  assert.equal(result.evidenceRecords[0].semanticFamily, 'app-shell');
  assert.equal(result.evidenceRecords[0].familyRoot, 'app');
  assert.equal(result.evidenceRecords[0].familySubgroup, 'shell');
});

test('does not emit finding/verdict/advisor or retired root-classification fields', () => {
  const result = prepareTreeSemanticHomeEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A', parentAddressPath: null, path: 'src/app-shell.logic.ts', name: 'app-shell.logic.ts', occurrenceType: 'file' },
    ],
    namingSemanticEvidenceRecords: namingSemanticEvidenceFixture,
  });

  const evidenceRecord = result.evidenceRecords[0];
  const forbiddenKeys = [
    'finding',
    'findingCode',
    'severity',
    'verdict',
    'placementVerdict',
    'advisorDecision',
    'isRepoShapeAllowedTopLevelDirectory',
    'isStructuralRoot',
    'isSemanticRoot',
    'structuralClass',
    'structuralKind',
  ];

  for (const key of forbiddenKeys) {
    assert.equal(Object.hasOwn(evidenceRecord, key), false);
  }
});

test('safely skips unlinked naming evidence and unlinked addressed occurrences', () => {
  const result = prepareTreeSemanticHomeEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A', parentAddressPath: null, path: 'src/only-addressed.logic.ts', name: 'only-addressed.logic.ts', occurrenceType: 'file' },
    ],
    namingSemanticEvidenceRecords: [
      { path: 'src/only-naming.logic.ts', semanticName: 'only-naming', semanticFamily: 'only-naming', familyRoot: 'only' },
    ],
  });

  assert.deepEqual(result, { source: 'tree-semantic-home-evidence', evidenceRecords: [] });
});

test('handles empty inputs and deterministically rejects invalid payloads', () => {
  assert.deepEqual(
    prepareTreeSemanticHomeEvidence({ addressedOccurrenceRecords: [], namingSemanticEvidenceRecords: [] }),
    { source: 'tree-semantic-home-evidence', evidenceRecords: [] },
  );

  assert.throws(() => prepareTreeSemanticHomeEvidence(), /input must be an object/u);
  assert.throws(
    () => prepareTreeSemanticHomeEvidence({ addressedOccurrenceRecords: [] }),
    /namingSemanticEvidenceRecords must be an array/u,
  );
  assert.throws(
    () => prepareTreeSemanticHomeEvidence({ namingSemanticEvidenceRecords: [] }),
    /addressedOccurrenceRecords must be an array/u,
  );
});
