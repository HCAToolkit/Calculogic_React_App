import assert from 'node:assert/strict';
import { test } from 'node:test';
import { classifyTreeOccurrenceRecords } from '../src/tree-occurrence-classification.logic.mjs';
import { prepareTreeOccurrenceSnapshot } from '../src/tree-occurrence-snapshot.logic.mjs';
import { getBuiltinTreeKnownRoots } from '../src/registries/tree-known-roots-registry.logic.mjs';

const TREE_KNOWN_ROOTS = getBuiltinTreeKnownRoots();

const classifySnapshot = (snapshot) =>
  classifyTreeOccurrenceRecords({
    occurrenceRecords: snapshot.occurrenceRecords,
    treeKnownRoots: TREE_KNOWN_ROOTS,
  });

const byResolvedPath = (occurrenceRecords) =>
  Object.fromEntries(occurrenceRecords.map((record) => [record.resolvedPath, record]));

test('tree occurrence classification marks known repo-top structural roots deterministically', () => {
  const snapshot = prepareTreeOccurrenceSnapshot({
    selectedPaths: ['src/index.js'],
    includeRoots: [],
    targets: [],
  });

  const records = byResolvedPath(classifySnapshot(snapshot));

  assert.equal(records.src.structuralClass, 'repo-top-structural-root');
  assert.equal(records.src.structuralKind, 'top-root-structural');
  assert.equal(records.src.isKnownTopRoot, true);
  assert.equal(records.src.isStructuralRoot, true);
  assert.equal(records.src.isSemanticRoot, false);
});

test('tree occurrence classification marks known repo-top semantic roots deterministically', () => {
  const snapshot = prepareTreeOccurrenceSnapshot({
    selectedPaths: ['calculogic-validator/src/index.mjs'],
    includeRoots: [],
    targets: [],
  });

  const records = byResolvedPath(classifySnapshot(snapshot));

  assert.equal(records['calculogic-validator'].structuralClass, 'repo-top-semantic-root');
  assert.equal(records['calculogic-validator'].structuralKind, 'semantic-root');
  assert.equal(records['calculogic-validator'].isKnownTopRoot, true);
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
  assert.equal(records.experiments.isKnownTopRoot, false);
  assert.equal(records.experiments.isSubtreePartitionCandidate, false);
});
