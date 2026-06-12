import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  prepareTreeOccurrenceClassificationReplacementRuntime,
} from '../src/tree-occurrence-classification.logic.mjs';
import { prepareTreeOccurrenceSnapshot } from '../src/tree-occurrence-snapshot.logic.mjs';
import { prepareTreeStructuralAddressSnapshot } from '../src/tree-structural-address-snapshot.logic.mjs';

const TEST_REPO_SHAPE_POLICY = {
  allowedTopLevelDirectories: [
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
  ],
};
const classifySnapshot = (snapshot) => {
  const replacementRuntime = prepareTreeOccurrenceClassificationReplacementRuntime({
    treeStructuralHomeEvidence: {
      source: 'test',
      evidenceRecords: [{ path: 'src', occurrenceType: 'folder', structuralHome: 'src' }],
    },
    treeSemanticHomeEvidence: {
      source: 'test',
      evidenceRecords: [{ path: 'calculogic-validator', occurrenceType: 'folder', semanticHome: 'validator' }],
    },
    treeRepoShapePolicy: TEST_REPO_SHAPE_POLICY,
    treeFolderKindEvidence: {
      source: 'test',
      evidenceRecords: [
        { path: 'src', occurrenceType: 'folder', folderKind: 'structural' },
        { path: 'calculogic-validator', occurrenceType: 'folder', folderKind: 'semantic' },
        { path: 'experiments', occurrenceType: 'folder', folderKind: 'unspecified' },
      ],
    },
  });

  return replacementRuntime.classifyOccurrenceRecords(snapshot.occurrenceRecords);
};

const byResolvedPath = (occurrenceRecords) =>
  Object.fromEntries(occurrenceRecords.map((record) => [record.resolvedPath, record]));

test('tree occurrence classification marks replacement repo-top structural roots deterministically', () => {
  const snapshot = prepareTreeOccurrenceSnapshot({
    selectedPaths: ['src/index.js'],
    includeRoots: [],
    targets: [],
  });

  const records = byResolvedPath(classifySnapshot(snapshot));

  assert.equal(records.src.structuralClass, 'repo-top-structural-root');
  assert.equal(records.src.structuralKind, 'top-root-structural');
  assert.equal(records.src.isRepoShapeAllowedTopLevelDirectory, true);
  assert.equal(records.src.isStructuralRoot, true);
  assert.equal(records.src.isSemanticRoot, false);
});

test('tree occurrence classification marks replacement repo-top semantic roots deterministically', () => {
  const snapshot = prepareTreeOccurrenceSnapshot({
    selectedPaths: ['calculogic-validator/src/index.mjs'],
    includeRoots: [],
    targets: [],
  });

  const records = byResolvedPath(classifySnapshot(snapshot));

  assert.equal(records['calculogic-validator'].structuralClass, 'repo-top-semantic-root');
  assert.equal(records['calculogic-validator'].structuralKind, 'semantic-root');
  assert.equal(records['calculogic-validator'].isRepoShapeAllowedTopLevelDirectory, true);
  assert.equal(records['calculogic-validator'].isStructuralRoot, false);
  assert.equal(records['calculogic-validator'].isSemanticRoot, true);
});

test('tree occurrence classification keeps repo-top class semantics stable across scoped rebasing', () => {
  const snapshot = prepareTreeOccurrenceSnapshot({
    selectedPaths: ['calculogic-validator/tree/src/tree-structure-advisor.logic.mjs'],
    includeRoots: ['calculogic-validator'],
    targets: [{ relPath: 'calculogic-validator/tree', kind: 'dir' }],
  });

  const records = byResolvedPath(classifySnapshot(snapshot));

  assert.equal(records['calculogic-validator/tree'].isScopedRootOccurrence, true);
  assert.equal(records['calculogic-validator/tree'].isRepoTopOccurrence, false);
  assert.equal(records['calculogic-validator/tree'].structuralClass, 'unclassified');
  assert.equal(records['calculogic-validator/tree'].structuralKind, 'unknown');
});

test('tree occurrence classification keeps repeated names distinct across depth and context', () => {
  const snapshot = prepareTreeOccurrenceSnapshot({
    selectedPaths: ['src/components/button.js', 'calculogic-validator/src/tree/components/rule.mjs'],
    includeRoots: [],
    targets: [],
  });

  const records = byResolvedPath(classifySnapshot(snapshot));

  assert.equal(records['src/components'].structuralClass, 'subtree-structural-partition-candidate');
  assert.equal(
    records['calculogic-validator/src/tree/components'].structuralClass,
    'subtree-structural-partition-candidate',
  );
  assert.notEqual(
    records['src/components'].lineageSegments.join('/'),
    records['calculogic-validator/src/tree/components'].lineageSegments.join('/'),
  );
});

test('tree occurrence classification keeps unknown cases deterministic and bounded', () => {
  const snapshot = prepareTreeOccurrenceSnapshot({
    selectedPaths: ['experiments/notes.txt'],
    includeRoots: [],
    targets: [],
  });

  const records = byResolvedPath(classifySnapshot(snapshot));

  assert.equal(records.experiments.structuralClass, 'unclassified');
  assert.equal(records.experiments.structuralKind, 'unknown');
  assert.equal(records.experiments.isRepoShapeAllowedTopLevelDirectory, false);
  assert.equal(records.experiments.isSubtreePartitionCandidate, false);
});


test('tree occurrence classification replacement runtime classifies from prepared Tree evidence', () => {
  const snapshot = prepareTreeOccurrenceSnapshot({
    selectedPaths: ['src/components/button.js', 'calculogic-validator/tree/index.mjs'],
    includeRoots: [],
    targets: [],
  });
  const addressedSnapshot = prepareTreeStructuralAddressSnapshot({
    occurrenceSnapshot: snapshot,
    selectedPaths: ['src/components/button.js', 'calculogic-validator/tree/index.mjs'],
    targets: [],
    includeRoots: [],
    scope: { source: 'test' },
  });
  const replacementRuntime = prepareTreeOccurrenceClassificationReplacementRuntime({
    treeStructuralHomeEvidence: {
      source: 'test',
      evidenceRecords: [{ path: 'src', occurrenceType: 'folder', structuralHome: 'src' }],
    },
    treeSemanticHomeEvidence: {
      source: 'test',
      evidenceRecords: [{ path: 'calculogic-validator', occurrenceType: 'folder', semanticHome: 'validator' }],
    },
    treeRepoShapePolicy: TEST_REPO_SHAPE_POLICY,
    treeFolderKindEvidence: {
      source: 'test',
      evidenceRecords: [
        { path: 'src', occurrenceType: 'folder', folderKind: 'structural' },
        { path: 'calculogic-validator', occurrenceType: 'folder', folderKind: 'semantic' },
      ],
    },
  });

  const records = byResolvedPath(replacementRuntime.classifyOccurrenceRecords(addressedSnapshot.occurrenceRecords));

  assert.equal(replacementRuntime.source, 'tree-occurrence-classification-replacement-runtime');
  assert.equal(records.src.structuralClass, 'repo-top-structural-root');
  assert.equal(records.src.structuralKind, 'top-root-structural');
  assert.equal(records.src.isRepoShapeAllowedTopLevelDirectory, true);
  assert.equal(records.src.isStructuralRoot, true);
  assert.equal(records.src.isSemanticRoot, false);
  assert.equal(records['calculogic-validator'].structuralClass, 'repo-top-semantic-root');
  assert.equal(records['calculogic-validator'].structuralKind, 'semantic-root');
  assert.equal(records['calculogic-validator'].isRepoShapeAllowedTopLevelDirectory, true);
  assert.equal(records['calculogic-validator'].isStructuralRoot, false);
  assert.equal(records['calculogic-validator'].isSemanticRoot, true);
  assert.equal(records['src/components'].structuralClass, 'subtree-structural-partition-candidate');
  assert.equal(records['src/components'].isSubtreePartitionCandidate, true);
});

test('tree occurrence classification replacement runtime collects unexpected top-level directories from repo-shape policy', () => {
  const replacementRuntime = prepareTreeOccurrenceClassificationReplacementRuntime({
    treeStructuralHomeEvidence: {
      source: 'test',
      evidenceRecords: [{ path: 'src', occurrenceType: 'folder', structuralHome: 'src' }],
    },
    treeSemanticHomeEvidence: {
      source: 'test',
      evidenceRecords: [{ path: 'calculogic-validator', occurrenceType: 'folder', semanticHome: 'validator' }],
    },
    treeRepoShapePolicy: TEST_REPO_SHAPE_POLICY,
    treeFolderKindEvidence: {
      source: 'test',
      evidenceRecords: [
        { path: 'src', occurrenceType: 'folder', folderKind: 'structural' },
        { path: 'calculogic-validator', occurrenceType: 'folder', folderKind: 'semantic' },
        { path: 'experiments', occurrenceType: 'folder', folderKind: 'unspecified' },
      ],
    },
  });

  assert.deepEqual(
    replacementRuntime.collectUnexpectedTopLevelDirectoryNames(['src', 'experiments', 'calculogic-validator']),
    ['experiments'],
  );
});

test('tree unexpected top-level replacement policy does not allow general structural-home folders', () => {
  const replacementRuntime = prepareTreeOccurrenceClassificationReplacementRuntime({
    treeStructuralHomeEvidence: {
      source: 'test',
      evidenceRecords: [
        { path: 'data', occurrenceType: 'folder', structuralHome: 'data' },
        { path: 'vendor', occurrenceType: 'folder', structuralHome: 'vendor' },
        { path: 'assets', occurrenceType: 'folder', structuralHome: 'assets' },
        { path: 'ops', occurrenceType: 'folder', structuralHome: 'ops' },
      ],
    },
    treeSemanticHomeEvidence: {
      source: 'test',
      evidenceRecords: [],
    },
    treeRepoShapePolicy: TEST_REPO_SHAPE_POLICY,
    treeFolderKindEvidence: {
      source: 'test',
      evidenceRecords: [
        { path: 'data', occurrenceType: 'folder', folderKind: 'structural' },
        { path: 'vendor', occurrenceType: 'folder', folderKind: 'structural' },
        { path: 'assets', occurrenceType: 'folder', folderKind: 'structural' },
        { path: 'ops', occurrenceType: 'folder', folderKind: 'structural' },
      ],
    },
  });

  assert.deepEqual(
    replacementRuntime.collectUnexpectedTopLevelDirectoryNames(['src', 'data', 'vendor', 'assets', 'ops']),
    ['assets', 'data', 'ops', 'vendor'],
  );
});
