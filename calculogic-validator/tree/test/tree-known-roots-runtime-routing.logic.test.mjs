import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  resolveTreeOccurrenceClassificationRuntime,
  resolveTreeUnexpectedTopLevelDirectoryRuntime,
  selectTreeKnownRootsRuntimeRoute,
  TREE_KNOWN_ROOTS_RUNTIME_MODES,
} from '../src/tree-known-roots-runtime-routing.logic.mjs';

const safeRuntimeExecutionContract = {
  executionMode: 'execution-candidate',
  requiredGuards: [
    { id: 'parity-alignment', satisfied: true },
    { id: 'shadow-alignment', satisfied: true },
    { id: 'high-confidence', satisfied: true },
    { id: 'runtime-observability', satisfied: true },
    { id: 'rollback-available', satisfied: true },
  ],
};

const unsafeRuntimeExecutionContract = {
  executionMode: 'execution-candidate',
  requiredGuards: [
    { id: 'parity-alignment', satisfied: true },
    { id: 'rollback-available', satisfied: false },
  ],
};

const alignedReplacementRuntime = {
  classifyOccurrenceRecords: (occurrenceRecords) => occurrenceRecords.map((record) => ({
    ...record,
    structuralClass: 'repo-top-structural-root',
    structuralKind: 'top-root-structural',
    isKnownTopRoot: true,
    isStructuralRoot: true,
    isSemanticRoot: false,
    isSubtreePartitionCandidate: false,
  })),
  collectUnexpectedTopLevelDirectoryNames: (topLevelDirectoryNames) =>
    topLevelDirectoryNames.filter((directoryName) => directoryName === 'experiments'),
};

const legacyClassifyOccurrenceRecords = (occurrenceRecords) => occurrenceRecords.map((record) => ({
  ...record,
  structuralClass: 'repo-top-structural-root',
  structuralKind: 'top-root-structural',
  isKnownTopRoot: true,
  isStructuralRoot: true,
  isSemanticRoot: false,
  isSubtreePartitionCandidate: false,
}));

const occurrenceRecords = [
  {
    path: 'src',
    resolvedPath: 'src',
    actualName: 'src',
    occurrenceType: 'folder',
  },
];

test('tree known-roots runtime routing defaults to the legacy known-roots-backed path', () => {
  const route = selectTreeKnownRootsRuntimeRoute();

  assert.deepEqual(route, {
    source: 'tree-known-roots-runtime-routing',
    requestedMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.LEGACY,
    activeExecutionMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.LEGACY,
    fallbackUsed: false,
    fallbackReason: null,
    replacementAvailable: false,
    replacementSafe: false,
    legacyRuntimeTruth: {
      unexpectedTopLevelFolders: 'knownTopLevelDirectories',
      occurrenceClassification: 'topRoots[].kind',
    },
  });
});

test('tree known-roots runtime routing falls back when replacement is explicitly requested but unavailable', () => {
  const route = selectTreeKnownRootsRuntimeRoute({
    requestedMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT,
    runtimeExecutionContract: safeRuntimeExecutionContract,
  });

  assert.equal(route.activeExecutionMode, TREE_KNOWN_ROOTS_RUNTIME_MODES.FALLBACK);
  assert.equal(route.fallbackUsed, true);
  assert.equal(route.fallbackReason, 'replacement-runtime-unavailable');
  assert.equal(route.replacementAvailable, false);
  assert.equal(route.replacementSafe, true);
});

test('tree known-roots runtime routing falls back when replacement is explicitly requested but unsafe', () => {
  const route = selectTreeKnownRootsRuntimeRoute({
    requestedMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT,
    replacementRuntime: alignedReplacementRuntime,
    runtimeExecutionContract: unsafeRuntimeExecutionContract,
  });

  assert.equal(route.activeExecutionMode, TREE_KNOWN_ROOTS_RUNTIME_MODES.FALLBACK);
  assert.equal(route.fallbackUsed, true);
  assert.equal(route.fallbackReason, 'replacement-runtime-unsafe');
  assert.equal(route.replacementAvailable, true);
  assert.equal(route.replacementSafe, false);
});

test('tree known-roots runtime routing selects replacement only when explicit, available, and safe', () => {
  const route = selectTreeKnownRootsRuntimeRoute({
    requestedMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT,
    replacementRuntime: alignedReplacementRuntime,
    runtimeExecutionContract: safeRuntimeExecutionContract,
  });

  assert.equal(route.activeExecutionMode, TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT);
  assert.equal(route.fallbackUsed, false);
  assert.equal(route.replacementAvailable, true);
  assert.equal(route.replacementSafe, true);
  assert.equal(route.replacementRuntime, alignedReplacementRuntime);
});

test('tree known-roots runtime routing preserves legacy occurrence classification on divergent replacement output', () => {
  const divergentReplacementRuntime = {
    ...alignedReplacementRuntime,
    classifyOccurrenceRecords: (records) => records.map((record) => ({
      ...record,
      structuralClass: 'repo-top-semantic-root',
      structuralKind: 'semantic-root',
      isKnownTopRoot: true,
      isStructuralRoot: false,
      isSemanticRoot: true,
      isSubtreePartitionCandidate: false,
    })),
  };
  const route = selectTreeKnownRootsRuntimeRoute({
    requestedMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT,
    replacementRuntime: divergentReplacementRuntime,
    runtimeExecutionContract: safeRuntimeExecutionContract,
  });

  const resolved = resolveTreeOccurrenceClassificationRuntime({
    occurrenceRecords,
    legacyClassifyOccurrenceRecords,
    route,
  });

  assert.equal(resolved.route.activeExecutionMode, TREE_KNOWN_ROOTS_RUNTIME_MODES.FALLBACK);
  assert.equal(resolved.route.fallbackReason, 'replacement-runtime-divergent');
  assert.deepEqual(resolved.records, legacyClassifyOccurrenceRecords(occurrenceRecords));
});

test('tree known-roots runtime routing preserves legacy occurrence classification when replacement omits resolvedPath', () => {
  const missingResolvedPathReplacementRuntime = {
    ...alignedReplacementRuntime,
    classifyOccurrenceRecords: (records) => records.map((record) => {
      const { resolvedPath: _omittedResolvedPath, ...recordWithoutResolvedPath } = record;

      return {
        ...recordWithoutResolvedPath,
        structuralClass: 'repo-top-structural-root',
        structuralKind: 'top-root-structural',
        isKnownTopRoot: true,
        isStructuralRoot: true,
        isSemanticRoot: false,
        isSubtreePartitionCandidate: false,
      };
    }),
  };
  const route = selectTreeKnownRootsRuntimeRoute({
    requestedMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT,
    replacementRuntime: missingResolvedPathReplacementRuntime,
    runtimeExecutionContract: safeRuntimeExecutionContract,
  });

  const resolved = resolveTreeOccurrenceClassificationRuntime({
    occurrenceRecords,
    legacyClassifyOccurrenceRecords,
    route,
  });

  assert.equal(resolved.route.activeExecutionMode, TREE_KNOWN_ROOTS_RUNTIME_MODES.FALLBACK);
  assert.equal(resolved.route.fallbackReason, 'replacement-runtime-divergent');
  assert.deepEqual(resolved.records, legacyClassifyOccurrenceRecords(occurrenceRecords));
});

test('tree known-roots runtime routing preserves legacy unexpected top-level behavior on divergent replacement output', () => {
  const divergentReplacementRuntime = {
    ...alignedReplacementRuntime,
    collectUnexpectedTopLevelDirectoryNames: () => [],
  };
  const route = selectTreeKnownRootsRuntimeRoute({
    requestedMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT,
    replacementRuntime: divergentReplacementRuntime,
    runtimeExecutionContract: safeRuntimeExecutionContract,
  });

  const resolved = resolveTreeUnexpectedTopLevelDirectoryRuntime({
    topLevelDirectoryNames: ['experiments', 'src'],
    legacyCollectUnexpectedDirectoryNames: (topLevelDirectoryNames) =>
      topLevelDirectoryNames.filter((directoryName) => directoryName === 'experiments'),
    route,
  });

  assert.equal(resolved.route.activeExecutionMode, TREE_KNOWN_ROOTS_RUNTIME_MODES.FALLBACK);
  assert.equal(resolved.route.fallbackReason, 'replacement-runtime-divergent');
  assert.deepEqual(resolved.unexpectedDirectoryNames, ['experiments']);
});
