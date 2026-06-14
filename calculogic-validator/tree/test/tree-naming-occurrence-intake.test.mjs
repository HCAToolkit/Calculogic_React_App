import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareTreeNamingOccurrenceBridgeIntake } from '../src/tree-naming-occurrence-intake.logic.mjs';
import { collectNamingSemanticFamilyBridgeFindings } from '../src/contributors/tree-naming-semantic-family-bridge-contributor.logic.mjs';

const pathKeyedSemanticBridge = {
  observations: [
    {
      path: 'src/shared/build/build-surface.logic.ts',
      semanticName: 'build-surface',
      familyRoot: 'build',
      semanticFamily: 'build-surface',
    },
    {
      path: 'src/features/build/build-surface.results.ts',
      semanticName: 'build-surface',
      familyRoot: 'build',
      semanticFamily: 'build-surface',
    },
    {
      path: 'src/features/build/build-surface.knowledge.ts',
      semanticName: 'build-surface',
      familyRoot: 'build',
      semanticFamily: 'build-surface',
    },
    {
      path: 'src/features/build/build-surface.build.tsx',
      semanticName: 'build-surface',
      familyRoot: 'build',
      semanticFamily: 'build-surface',
    },
  ],
};

const occurrenceBridge = {
  bridgeContractVersion: 'naming-occurrence-bridge.v1',
  observations: [
    {
      addressProfileId: 'tree-codebase',
      addressedSnapshotId: 'snapshot-001',
      occurrenceAddress: 'O.1',
      repoRelativePath: 'different/address-keyed-only.logic.ts',
      path: 'different/address-keyed-only.logic.ts',
      semanticName: 'address-keyed-only',
      familyRoot: 'address',
      semanticFamily: 'address-keyed-only',
    },
  ],
};

const findingCodes = (payload) =>
  collectNamingSemanticFamilyBridgeFindings(payload)
    .map((finding) => finding.code)
    .sort((left, right) => left.localeCompare(right));

test('tree occurrence bridge intake recognizes future identity tuple without enabling joins', () => {
  const intake = prepareTreeNamingOccurrenceBridgeIntake({ namingOccurrenceBridge: occurrenceBridge });

  assert.equal(intake.status, 'recognized-future-evidence-only');
  assert.equal(intake.usedForCurrentTreeJoins, false);
  assert.deepEqual(intake.identityTupleFields, ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress']);
  assert.deepEqual(intake.identityTuples, [
    {
      addressProfileId: 'tree-codebase',
      addressedSnapshotId: 'snapshot-001',
      occurrenceAddress: 'O.1',
    },
  ]);
});

test('sibling occurrence bridge payload does not change current path-keyed semantic-family findings', () => {
  const withoutOccurrenceBridge = findingCodes(pathKeyedSemanticBridge);
  const withOccurrenceBridge = findingCodes({
    ...pathKeyedSemanticBridge,
    namingOccurrenceBridge: occurrenceBridge,
  });

  assert.deepEqual(withoutOccurrenceBridge, ['TREE_FAMILY_SCATTERED']);
  assert.deepEqual(withOccurrenceBridge, withoutOccurrenceBridge);
});

test('malformed occurrence bridge namespace state does not change current Tree findings', () => {
  const malformedOccurrenceBridge = {
    bridgeContractVersion: 'naming-occurrence-bridge.v1',
    observations: [
      {
        addressedSnapshotId: 'snapshot-001',
        occurrenceAddress: 'O.2',
        semanticFamily: 'malformed-only',
      },
    ],
  };

  const intake = prepareTreeNamingOccurrenceBridgeIntake({ namingOccurrenceBridge: malformedOccurrenceBridge });
  const withMalformedOccurrenceBridge = findingCodes({
    ...pathKeyedSemanticBridge,
    namingOccurrenceBridge: malformedOccurrenceBridge,
  });

  assert.equal(intake.status, 'recognized-with-diagnostics');
  assert.equal(intake.usedForCurrentTreeJoins, false);
  assert.deepEqual(intake.identityTuples, []);
  assert.deepEqual(withMalformedOccurrenceBridge, findingCodes(pathKeyedSemanticBridge));
});

test('Tree does not derive naming semantic-family findings from occurrence bridge observations alone', () => {
  const intake = prepareTreeNamingOccurrenceBridgeIntake({ namingOccurrenceBridge: occurrenceBridge });
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [],
    namingOccurrenceBridge: occurrenceBridge,
  });

  assert.equal(intake.recognized, true);
  assert.deepEqual(findings, []);
});

test('Tree does not derive semantic-family interpretation from filenames when bridge evidence is missing', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      { path: 'src/features/build/build-surface.logic.ts' },
      { path: 'src/shared/build/build-surface.results.ts' },
      { path: 'src/tools/build/build-surface.knowledge.ts' },
    ],
  });

  assert.deepEqual(findings, []);
});
