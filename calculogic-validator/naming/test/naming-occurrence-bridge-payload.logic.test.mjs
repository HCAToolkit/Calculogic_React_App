import test from 'node:test';
import assert from 'node:assert/strict';
import { createNamingOccurrenceBridgePayload } from '../src/naming-occurrence-bridge-payload.logic.mjs';

const treeOwnedFields = [
  'structuralHome',
  'semanticHome',
  'folderKind',
  'repoShape',
  'placement',
  'placementConfidence',
  'scatterStatus',
  'clusterStatus',
  'driftStatus',
  'severity',
  'verdict',
  'parentStructuralHome',
  'childStructuralHome',
  'rootLanePlacement',
];

test('createNamingOccurrenceBridgePayload creates a versioned Naming bridge envelope', () => {
  const result = createNamingOccurrenceBridgePayload({
    namingSemanticFamilyBridge: { observations: [] },
    addressedOccurrenceNamespace: {
      addressProfileId: 'tree-codebase',
      addressedSnapshotId: 'snapshot-001',
      occurrenceRecords: [],
    },
    sourceReportRef: { reportId: 'naming-report-001' },
    sourceSnapshotRef: { snapshotId: 'source-snapshot-001' },
  });

  assert.equal(result.bridgeContractVersion, 'naming-occurrence-bridge.v1');
  assert.equal(result.bridgeSource, 'calculogic-validator/naming');
  assert.equal(result.bridgeProducerId, 'naming-semantic-family-occurrence-bridge');
  assert.equal(result.addressProfileId, 'tree-codebase');
  assert.equal(result.addressedSnapshotId, 'snapshot-001');
  assert.deepEqual(result.sourceReportRef, { reportId: 'naming-report-001' });
  assert.deepEqual(result.sourceSnapshotRef, { snapshotId: 'source-snapshot-001' });
  assert.deepEqual(result.observations, []);
  assert.equal(result.compatibility.pathKeyedSemanticPayloadPreserved, true);
});

test('createNamingOccurrenceBridgePayload attaches full occurrence identity and preserves Naming semantic payloads', () => {
  const result = createNamingOccurrenceBridgePayload({
    namingSemanticFamilyBridge: {
      observations: [
        {
          path: 'calculogic-validator/naming/src/naming-semantic-family-bridge-projection.logic.mjs',
          semanticName: 'naming-semantic-family-bridge-projection',
          semanticFamily: 'naming-semantic-family',
          familyRoot: 'naming',
          familySubgroup: 'semantic-family',
          ambiguityFlags: ['family-boundary-heuristic'],
          splitFamilyFlags: ['family-root-observed-multiple-families'],
        },
      ],
    },
    addressedOccurrenceNamespace: {
      addressProfileId: 'tree-codebase',
      addressedSnapshotId: 'snapshot-001',
      occurrenceRecords: [
        {
          occurrenceAddress: 'A.B.1',
          addressPath: 'A.B.1',
          path: 'calculogic-validator/naming/src/naming-semantic-family-bridge-projection.logic.mjs',
          occurrenceType: 'file',
        },
      ],
    },
  });

  assert.deepEqual(result.observations, [
    {
      addressProfileId: 'tree-codebase',
      addressedSnapshotId: 'snapshot-001',
      occurrenceAddress: 'A.B.1',
      repoRelativePath: 'calculogic-validator/naming/src/naming-semantic-family-bridge-projection.logic.mjs',
      path: 'calculogic-validator/naming/src/naming-semantic-family-bridge-projection.logic.mjs',
      addressPath: 'A.B.1',
      occurrenceType: 'file',
      semanticName: 'naming-semantic-family-bridge-projection',
      semanticFamily: 'naming-semantic-family',
      familyRoot: 'naming',
      familySubgroup: 'semantic-family',
      ambiguityFlags: ['family-boundary-heuristic'],
      splitFamilyFlags: ['family-root-observed-multiple-families'],
    },
  ]);
});

test('createNamingOccurrenceBridgePayload makes missing or unmatched occurrence identity visible', () => {
  const result = createNamingOccurrenceBridgePayload({
    namingSemanticFamilyBridge: {
      observations: [
        { path: 'src/missing.logic.mjs', semanticName: 'missing', semanticFamily: 'missing', familyRoot: 'missing' },
        { path: 'src/incomplete.logic.mjs', semanticName: 'incomplete', semanticFamily: 'incomplete', familyRoot: 'incomplete' },
      ],
    },
    addressedOccurrenceNamespace: {
      addressProfileId: 'tree-codebase',
      addressedSnapshotId: 'snapshot-001',
      occurrenceRecords: [{ path: 'src/incomplete.logic.mjs', occurrenceType: 'file' }],
    },
  });

  assert.deepEqual(result.observations, []);
  assert.equal(result.compatibility.addressAttachedObservationsOmitMissingIdentity, true);
  assert.equal(result.compatibility.missingIdentityDiagnosticCount, 2);
  assert.deepEqual(result.diagnostics.map((diagnostic) => diagnostic.reason), [
    'unmatched-occurrence-record',
    'incomplete-occurrence-identity',
  ]);
});

test('createNamingOccurrenceBridgePayload does not emit Tree-owned conclusion fields', () => {
  const result = createNamingOccurrenceBridgePayload({
    namingSemanticFamilyBridge: {
      observations: [
        {
          path: 'src/app.logic.mjs',
          semanticName: 'app',
          semanticFamily: 'app',
          familyRoot: 'app',
          structuralHome: 'src',
          semanticHome: 'app',
          folderKind: 'semantic',
          placementConfidence: 'high',
          severity: 'warning',
          verdict: 'drift',
        },
      ],
    },
    addressedOccurrenceNamespace: {
      addressProfileId: 'tree-codebase',
      addressedSnapshotId: 'snapshot-001',
      occurrenceRecords: [{ occurrenceAddress: 'A.1', addressPath: 'A.1', path: 'src/app.logic.mjs', occurrenceType: 'file' }],
    },
  });

  for (const observation of result.observations) {
    for (const field of treeOwnedFields) {
      assert.equal(Object.hasOwn(observation, field), false, `${field} must not be emitted`);
    }
  }
});
