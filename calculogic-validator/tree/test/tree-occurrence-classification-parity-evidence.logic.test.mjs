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
    { addressPath: 'A', path: 'src', occurrenceType: 'folder', structuralClass: 'repo-top-structural-root', structuralKind: 'top-root-structural', isRepoShapeAllowedTopLevelDirectory: true, isStructuralRoot: true, isSemanticRoot: false },
    { addressPath: 'B', path: 'docs', occurrenceType: 'folder', structuralClass: 'repo-top-semantic-root', structuralKind: 'semantic-root', isRepoShapeAllowedTopLevelDirectory: true, isStructuralRoot: false, isSemanticRoot: true },
    { addressPath: 'C', path: 'feature', occurrenceType: 'folder', structuralClass: 'unclassified', structuralKind: 'unknown', isRepoShapeAllowedTopLevelDirectory: false, isStructuralRoot: false, isSemanticRoot: false },
    { addressPath: 'D', path: 'README.md', occurrenceType: 'file', structuralClass: 'unclassified', structuralKind: 'unknown', isRepoShapeAllowedTopLevelDirectory: false, isStructuralRoot: false, isSemanticRoot: false },
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

test('falls back from addressPath to path+occurrenceType for current and replacement evidence lookup', () => {
  const result = prepareTreeOccurrenceClassificationParityEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'Z.9', parentAddressPath: null, path: 'src', name: 'src', occurrenceType: 'folder' },
    ],
    currentOccurrenceClassificationRecords: [
      { path: 'src', occurrenceType: 'folder', structuralClass: 'repo-top-structural-root', structuralKind: 'top-root-structural', isRepoShapeAllowedTopLevelDirectory: true, isStructuralRoot: true, isSemanticRoot: false },
    ],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [{ path: 'src', occurrenceType: 'folder', structuralHome: 'src' }] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeFolderKindEvidence: { source: 'x', evidenceRecords: [{ path: 'src', occurrenceType: 'folder', folderKind: 'structural' }] },
  });

  assert.equal(result.parityRecords[0].currentIsStructuralRoot, true);
  assert.equal(result.parityRecords[0].replacementFolderKind, 'structural');
  assert.equal(result.parityRecords[0].parityStatus, 'matches');
});

test('falls back to path when only path evidence exists and preserves precedence ordering', () => {
  const result = prepareTreeOccurrenceClassificationParityEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'Z.1', parentAddressPath: null, path: 'docs', name: 'docs', occurrenceType: 'folder' },
      { addressPath: 'Z.2', parentAddressPath: null, path: 'lib', name: 'lib', occurrenceType: 'folder' },
    ],
    currentOccurrenceClassificationRecords: [
      { path: 'docs', structuralClass: 'repo-top-semantic-root', structuralKind: 'semantic-root', isRepoShapeAllowedTopLevelDirectory: true, isStructuralRoot: false, isSemanticRoot: true },
      { path: 'lib', occurrenceType: 'folder', structuralClass: 'repo-top-structural-root', structuralKind: 'top-root-structural', isRepoShapeAllowedTopLevelDirectory: true, isStructuralRoot: true, isSemanticRoot: false },
      { path: 'lib', structuralClass: 'repo-top-semantic-root', structuralKind: 'semantic-root', isRepoShapeAllowedTopLevelDirectory: true, isStructuralRoot: false, isSemanticRoot: true },
    ],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [{ path: 'lib', structuralHome: 'lib' }] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [{ path: 'docs', semanticHome: 'documentation' }] },
    treeFolderKindEvidence: {
      source: 'x',
      evidenceRecords: [
        { path: 'docs', folderKind: 'semantic' },
        { path: 'lib', occurrenceType: 'folder', folderKind: 'structural' },
        { path: 'lib', folderKind: 'semantic' },
      ],
    },
  });

  const docsRecord = result.parityRecords.find((record) => record.path === 'docs');
  const libRecord = result.parityRecords.find((record) => record.path === 'lib');

  assert.equal(docsRecord.currentIsSemanticRoot, true);
  assert.equal(docsRecord.replacementFolderKind, 'semantic');
  assert.equal(libRecord.currentIsStructuralRoot, true);
  assert.equal(libRecord.replacementFolderKind, 'structural');
});

test('addressPath match wins and avoids opportunistic file/folder merge when occurrenceType-safe evidence exists', () => {
  const result = prepareTreeOccurrenceClassificationParityEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A', parentAddressPath: null, path: 'pkg', name: 'pkg', occurrenceType: 'folder' },
      { addressPath: 'A.1', parentAddressPath: 'A', path: 'pkg', name: 'pkg', occurrenceType: 'file' },
    ],
    currentOccurrenceClassificationRecords: [
      { addressPath: 'A', path: 'pkg', occurrenceType: 'folder', structuralClass: 'repo-top-structural-root', structuralKind: 'top-root-structural', isRepoShapeAllowedTopLevelDirectory: true, isStructuralRoot: true, isSemanticRoot: false },
      { path: 'pkg', occurrenceType: 'folder', structuralClass: 'repo-top-semantic-root', structuralKind: 'semantic-root', isRepoShapeAllowedTopLevelDirectory: true, isStructuralRoot: false, isSemanticRoot: true },
      { path: 'pkg', occurrenceType: 'file', structuralClass: 'unclassified', structuralKind: 'unknown', isRepoShapeAllowedTopLevelDirectory: false, isStructuralRoot: false, isSemanticRoot: false },
    ],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [{ path: 'pkg', occurrenceType: 'folder', structuralHome: 'pkg' }] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [{ path: 'pkg', occurrenceType: 'file', semanticHome: 'file-semantic' }] },
    treeFolderKindEvidence: {
      source: 'x',
      evidenceRecords: [
        { addressPath: 'A', path: 'pkg', occurrenceType: 'folder', folderKind: 'structural' },
        { path: 'pkg', occurrenceType: 'file', folderKind: 'semantic' },
      ],
    },
  });

  const folderRecord = result.parityRecords.find((record) => record.addressPath === 'A');
  const fileRecord = result.parityRecords.find((record) => record.addressPath === 'A.1');

  assert.equal(folderRecord.currentIsStructuralRoot, true);
  assert.equal(folderRecord.replacementFolderKind, 'structural');
  assert.equal(fileRecord.currentIsStructuralRoot, false);
  assert.equal(fileRecord.replacementFolderKind, 'semantic');
  assert.equal(fileRecord.parityStatus, 'not-applicable');
});


test('nested folder with replacement folder-kind evidence remains not-applicable', () => {
  const result = prepareTreeOccurrenceClassificationParityEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A.B', parentAddressPath: 'A', path: 'src/nested', name: 'nested', occurrenceType: 'folder', depth: 1 },
    ],
    currentOccurrenceClassificationRecords: [
      { path: 'src/nested', occurrenceType: 'folder', structuralClass: 'unclassified', structuralKind: 'unknown', isRepoShapeAllowedTopLevelDirectory: false, isStructuralRoot: false, isSemanticRoot: false },
    ],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeFolderKindEvidence: { source: 'x', evidenceRecords: [{ path: 'src/nested', occurrenceType: 'folder', folderKind: 'structural' }] },
  });

  assert.equal(result.parityRecords[0].parityStatus, 'not-applicable');
});

test('nested folder with semantic-home evidence remains not-applicable', () => {
  const result = prepareTreeOccurrenceClassificationParityEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A.B', parentAddressPath: 'A', path: 'docs/guide', name: 'guide', occurrenceType: 'folder', depth: 1 },
    ],
    currentOccurrenceClassificationRecords: [
      { path: 'docs/guide', occurrenceType: 'folder', structuralClass: 'unclassified', structuralKind: 'unknown', isRepoShapeAllowedTopLevelDirectory: false, isStructuralRoot: false, isSemanticRoot: false },
    ],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [{ path: 'docs/guide', occurrenceType: 'folder', semanticHome: 'documentation' }] },
    treeFolderKindEvidence: { source: 'x', evidenceRecords: [{ path: 'docs/guide', occurrenceType: 'folder', folderKind: 'semantic' }] },
  });

  assert.equal(result.parityRecords[0].parityStatus, 'not-applicable');
});

test('top-root candidate with missing current classification becomes insufficient-evidence', () => {
  const result = prepareTreeOccurrenceClassificationParityEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A', parentAddressPath: null, path: 'src', name: 'src', occurrenceType: 'folder', depth: 0 },
    ],
    currentOccurrenceClassificationRecords: [],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [{ path: 'src', occurrenceType: 'folder', structuralHome: 'src' }] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeFolderKindEvidence: { source: 'x', evidenceRecords: [{ path: 'src', occurrenceType: 'folder', folderKind: 'structural' }] },
  });

  assert.equal(result.parityRecords[0].parityStatus, 'insufficient-evidence');
});

test('matched current non-root remains distinguishable from missing current classification', () => {
  const matchedCurrent = prepareTreeOccurrenceClassificationParityEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A', parentAddressPath: null, path: 'feature', name: 'feature', occurrenceType: 'folder', depth: 0 },
    ],
    currentOccurrenceClassificationRecords: [
      { path: 'feature', occurrenceType: 'folder', structuralClass: 'unclassified', structuralKind: 'unknown', isRepoShapeAllowedTopLevelDirectory: false, isStructuralRoot: false, isSemanticRoot: false },
    ],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeFolderKindEvidence: { source: 'x', evidenceRecords: [{ path: 'feature', occurrenceType: 'folder', folderKind: 'unspecified' }] },
  });

  const missingCurrent = prepareTreeOccurrenceClassificationParityEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A', parentAddressPath: null, path: 'feature', name: 'feature', occurrenceType: 'folder', depth: 0 },
    ],
    currentOccurrenceClassificationRecords: [],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeFolderKindEvidence: { source: 'x', evidenceRecords: [{ path: 'feature', occurrenceType: 'folder', folderKind: 'unspecified' }] },
  });

  assert.equal(matchedCurrent.parityRecords[0].parityStatus, 'matches');
  assert.equal(missingCurrent.parityRecords[0].parityStatus, 'insufficient-evidence');
});
