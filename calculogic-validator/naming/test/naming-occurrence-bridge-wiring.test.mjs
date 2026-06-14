import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  projectNamingOccurrenceBridge,
  projectNamingSemanticFamilyBridge,
  runNamingValidator,
} from '../src/naming-validator.host.mjs';

const createRuntimeOutput = () => ({
  findings: [
    {
      path: 'src/build-surface.logic.mjs',
      classification: 'canonical',
      details: {
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
        familySubgroup: 'surface',
      },
    },
  ],
});

const validNamespace = {
  addressProfileId: 'tree-codebase',
  addressedSnapshotId: 'snapshot-001',
  occurrenceRecords: [
    {
      repoRelativePath: 'src/build-surface.logic.mjs',
      path: 'src/build-surface.logic.mjs',
      occurrenceAddress: 'A.1',
      addressPath: 'A.1',
      occurrenceType: 'file',
    },
  ],
};

test('projectNamingOccurrenceBridge produces versioned payload without changing path-keyed semantic-family bridge', () => {
  const runtimeOutput = createRuntimeOutput();
  const pathKeyedBridgeBefore = projectNamingSemanticFamilyBridge(runtimeOutput);

  const occurrenceBridge = projectNamingOccurrenceBridge(runtimeOutput, {
    addressedOccurrenceNamespace: validNamespace,
  });

  assert.equal(occurrenceBridge.bridgeContractVersion, 'naming-occurrence-bridge.v1');
  assert.equal(occurrenceBridge.compatibility.pathKeyedSemanticPayloadPreserved, true);
  assert.deepEqual(projectNamingSemanticFamilyBridge(runtimeOutput), pathKeyedBridgeBefore);
  assert.deepEqual(pathKeyedBridgeBefore, {
    observations: [
      {
        path: 'src/build-surface.logic.mjs',
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
        familySubgroup: 'surface',
      },
    ],
  });
});

test('projectNamingOccurrenceBridge attaches addresses for a valid namespace and omits Tree conclusions', () => {
  const occurrenceBridge = projectNamingOccurrenceBridge(createRuntimeOutput(), {
    addressedOccurrenceNamespace: validNamespace,
  });

  assert.deepEqual(occurrenceBridge.observations, [
    {
      addressProfileId: 'tree-codebase',
      addressedSnapshotId: 'snapshot-001',
      occurrenceAddress: 'A.1',
      repoRelativePath: 'src/build-surface.logic.mjs',
      path: 'src/build-surface.logic.mjs',
      addressPath: 'A.1',
      occurrenceType: 'file',
      semanticName: 'build-surface',
      semanticFamily: 'build-surface',
      familyRoot: 'build',
      familySubgroup: 'surface',
    },
  ]);

  const forbiddenTreeConclusionFields = [
    'semanticHome',
    'structuralHome',
    'folderKind',
    'placementConfidence',
    'scatter',
    'cluster',
    'drift',
  ];
  for (const field of forbiddenTreeConclusionFields) {
    assert.equal(Object.hasOwn(occurrenceBridge.observations[0], field), false);
  }
});

test('projectNamingOccurrenceBridge keeps missing namespace diagnostics visible with empty address-attached observations', () => {
  const occurrenceBridge = projectNamingOccurrenceBridge(createRuntimeOutput());

  assert.equal(occurrenceBridge.addressProfileId, null);
  assert.equal(occurrenceBridge.addressedSnapshotId, null);
  assert.deepEqual(occurrenceBridge.observations, []);
  assert.equal(occurrenceBridge.compatibility.addressedNamespaceValid, false);
  assert.deepEqual(
    occurrenceBridge.diagnostics.map((diagnostic) => diagnostic.reason),
    ['missing-address-profile-id', 'missing-addressed-snapshot-id'],
  );
});

test('runNamingValidator stages occurrence bridge only when an addressed namespace is supplied', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-occurrence-bridge-wiring-'));
  try {
    fs.mkdirSync(path.join(tempRoot, 'src'));
    fs.writeFileSync(path.join(tempRoot, 'src', 'build-surface.logic.mjs'), 'export const value = true;\n');

    const withoutNamespace = runNamingValidator(tempRoot, { scope: 'repo' });
    assert.equal(Object.hasOwn(withoutNamespace, 'namingOccurrenceBridge'), false);

    const withNamespace = runNamingValidator(tempRoot, {
      scope: 'repo',
      addressedOccurrenceNamespace: validNamespace,
    });

    assert.equal(withNamespace.namingOccurrenceBridge.bridgeContractVersion, 'naming-occurrence-bridge.v1');
    assert.equal(withNamespace.namingOccurrenceBridge.observations.length, 1);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
