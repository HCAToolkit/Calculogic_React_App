import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareTreeOccurrenceClassificationParityEvidence } from '../src/tree-occurrence-classification-parity-evidence.logic.mjs';

const baseInput = () => ({
  addressedOccurrenceRecords: [
    { addressPath: 'A', parentAddressPath: null, path: 'src', name: 'src', occurrenceType: 'folder' },
    { addressPath: 'B', parentAddressPath: null, path: 'docs', name: 'docs', occurrenceType: 'folder' },
    { addressPath: 'C', parentAddressPath: null, path: 'feature', name: 'feature', occurrenceType: 'folder' },
    { addressPath: 'D', parentAddressPath: null, path: 'README.md', name: 'README.md', occurrenceType: 'file' },
  ],
  currentOccurrenceClassificationRecords: [
    { addressPath: 'A', path: 'src', occurrenceType: 'folder', structuralClass: 'repo-top-structural-root', structuralKind: 'top-root-structural', isKnownTopRoot: true, isStructuralRoot: true, isSemanticRoot: false },
    { addressPath: 'B', path: 'docs', occurrenceType: 'folder', structuralClass: 'repo-top-semantic-root', structuralKind: 'semantic-root', isKnownTopRoot: true, isStructuralRoot: false, isSemanticRoot: true },
    { addressPath: 'C', path: 'feature', occurrenceType: 'folder', structuralClass: 'unclassified', structuralKind: 'unknown', isKnownTopRoot: false, isStructuralRoot: false, isSemanticRoot: false },
    { addressPath: 'D', path: 'README.md', occurrenceType: 'file', structuralClass: 'unclassified', structuralKind: 'unknown', isKnownTopRoot: false, isStructuralRoot: false, isSemanticRoot: false },
  ],
  treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [{ addressPath: 'A', path: 'src', occurrenceType: 'folder', structuralHome: 'src' }] },
  treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [{ addressPath: 'B', path: 'docs', occurrenceType: 'folder', semanticHome: 'documentation' }] },
  treeFolderKindEvidence: {
    source: 'x',
    evidenceRecords: [
      { addressPath: 'A', path: 'src', occurrenceType: 'folder', folderKind: 'structural' },
      { addressPath: 'B', path: 'docs', occurrenceType: 'folder', folderKind: 'semantic' },
      { addressPath: 'C', path: 'feature', occurrenceType: 'folder', folderKind: 'structural' },
    ],
  },
});

test('returns deterministic evidence-only parity records and summary', () => {
  const input = baseInput();
  const before = structuredClone(input);

  const result = prepareTreeOccurrenceClassificationParityEvidence(input);

  assert.deepEqual(input, before);
  assert.equal(result.source, 'tree-occurrence-classification-parity-evidence');
  assert.deepEqual(result.parityRecords.map((record) => record.path), ['docs', 'feature', 'README.md', 'src']);
  assert.deepEqual(result.parityRecords.map((record) => record.parityStatus), ['matches', 'differs', 'not-applicable', 'matches']);
  assert.deepEqual(result.summary, { matches: 2, differs: 1, 'insufficient-evidence': 0, 'not-applicable': 1 });
});

test('records insufficient-evidence without guessing and omits advisor output fields', () => {
  const input = baseInput();
  input.treeFolderKindEvidence = { source: 'x', evidenceRecords: [] };
  input.treeStructuralHomeEvidence = { source: 'x', evidenceRecords: [] };
  input.treeSemanticHomeEvidence = { source: 'x', evidenceRecords: [] };

  const result = prepareTreeOccurrenceClassificationParityEvidence(input);
  const docsRecord = result.parityRecords.find((record) => record.path === 'docs');

  assert.equal(docsRecord.parityStatus, 'insufficient-evidence');

  const forbiddenKeys = ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'];
  for (const forbiddenKey of forbiddenKeys) {
    assert.equal(Object.hasOwn(docsRecord, forbiddenKey), false);
  }
});

test('handles empty input safely', () => {
  const result = prepareTreeOccurrenceClassificationParityEvidence({
    addressedOccurrenceRecords: [],
    currentOccurrenceClassificationRecords: [],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeFolderKindEvidence: { source: 'x', evidenceRecords: [] },
  });

  assert.deepEqual(result, {
    source: 'tree-occurrence-classification-parity-evidence',
    parityRecords: [],
    summary: { matches: 0, differs: 0, 'insufficient-evidence': 0, 'not-applicable': 0 },
  });
});

test('rejects invalid input deterministically', () => {
  assert.throws(() => prepareTreeOccurrenceClassificationParityEvidence(), /input must be an object/u);
  assert.throws(
    () => prepareTreeOccurrenceClassificationParityEvidence({ addressedOccurrenceRecords: [] }),
    /currentOccurrenceClassificationRecords must be an array/u,
  );
});
