import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  prepareTreeNamingOccurrenceAddressJoinEvidence,
  prepareTreeNamingOccurrenceBridgeIntake,
} from '../src/tree-naming-occurrence-intake.logic.mjs';
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

test('Tree occurrence bridge intake preserves Naming invalid namespace diagnostics without changing path-keyed findings', () => {
  const namingInvalidNamespaceOccurrenceBridge = {
    bridgeContractVersion: 'naming-occurrence-bridge.v1',
    addressProfileId: null,
    addressedSnapshotId: null,
    compatibility: {
      pathKeyedSemanticPayloadPreserved: true,
      addressedNamespaceValid: false,
      invalidAddressedNamespaceDiagnosticCount: 2,
      sourceObservationCount: pathKeyedSemanticBridge.observations.length,
      addressAttachedObservationCount: 0,
      missingIdentityDiagnosticCount: 0,
      totalDiagnosticCount: 2,
    },
    observations: [],
    diagnostics: [
      {
        diagnosticType: 'invalid-addressed-namespace',
        reason: 'missing-address-profile-id',
        addressProfileId: null,
        addressedSnapshotId: null,
      },
      {
        diagnosticType: 'invalid-addressed-namespace',
        reason: 'missing-addressed-snapshot-id',
        addressProfileId: null,
        addressedSnapshotId: null,
      },
    ],
  };

  const intake = prepareTreeNamingOccurrenceBridgeIntake({
    namingOccurrenceBridge: namingInvalidNamespaceOccurrenceBridge,
  });
  const withNamingDiagnostics = findingCodes({
    ...pathKeyedSemanticBridge,
    namingOccurrenceBridge: namingInvalidNamespaceOccurrenceBridge,
  });

  assert.equal(intake.status, 'recognized-with-diagnostics');
  assert.equal(intake.usedForCurrentTreeJoins, false);
  assert.deepEqual(intake.identityTuples, []);
  assert.equal(
    intake.diagnostics.some((diagnostic) => diagnostic.reason === 'source-naming-diagnostics-present'),
    true,
  );
  assert.equal(
    intake.diagnostics.some((diagnostic) =>
      diagnostic.reason === 'source-naming-compatibility-diagnostics-present' &&
      diagnostic.addressedNamespaceValid === false &&
      diagnostic.diagnosticCounts.invalidAddressedNamespaceDiagnosticCount === 2 &&
      diagnostic.diagnosticCounts.totalDiagnosticCount === 2,
    ),
    true,
  );
  assert.equal(JSON.stringify(intake.diagnostics).includes('missing-address-profile-id'), true);
  assert.equal(JSON.stringify(intake.diagnostics).includes('missing-addressed-snapshot-id'), true);
  assert.deepEqual(withNamingDiagnostics, findingCodes(pathKeyedSemanticBridge));
});


const addressedOccurrenceNamespace = {
  addressProfileId: 'tree-codebase',
  addressedSnapshotId: 'snapshot-001',
  occurrenceRecords: [
    {
      occurrenceAddress: 'A.1',
      addressPath: 'A.1',
      path: 'src/alpha/shared.logic.ts',
      resolvedPath: 'src/alpha/shared.logic.ts',
      name: 'shared.logic.ts',
      occurrenceType: 'file',
    },
    {
      occurrenceAddress: 'A.2',
      addressPath: 'A.2',
      path: 'src/beta/shared.logic.ts',
      resolvedPath: 'src/beta/shared.logic.ts',
      name: 'shared.logic.ts',
      occurrenceType: 'file',
    },
  ],
};

const addressBridge = {
  bridgeContractVersion: 'naming-occurrence-bridge.v1',
  observations: [
    {
      addressProfileId: 'tree-codebase',
      addressedSnapshotId: 'snapshot-001',
      occurrenceAddress: 'A.1',
      repoRelativePath: 'src/alpha/shared.logic.ts',
      path: 'src/alpha/shared.logic.ts',
      semanticName: 'shared',
      familyRoot: 'shared',
      semanticFamily: 'shared-runtime',
      familySubgroup: 'runtime',
    },
  ],
};

test('Tree address join produces explicit prepared evidence for a valid full tuple', () => {
  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: addressBridge,
    addressedOccurrenceNamespace,
  });

  assert.equal(prepared.status, 'joined');
  assert.equal(prepared.usedForCurrentTreeJoins, true);
  assert.equal(prepared.joinedEvidence.length, 1);
  assert.deepEqual(prepared.joinedEvidence[0].identityTuple, {
    addressProfileId: 'tree-codebase',
    addressedSnapshotId: 'snapshot-001',
    occurrenceAddress: 'A.1',
  });
  assert.equal(prepared.joinedEvidence[0].namingObservation.semanticFamily, 'shared-runtime');
  assert.equal(prepared.joinedEvidence[0].occurrenceRecord.path, 'src/alpha/shared.logic.ts');
});

test('Tree address join preserves Naming-owned ambiguity and split-family flags as string arrays', () => {
  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: {
      bridgeContractVersion: 'naming-occurrence-bridge.v1',
      observations: [
        {
          ...addressBridge.observations[0],
          ambiguityFlags: ['multiple-family-candidates', 42, null, 'case-variant-candidate'],
          splitFamilyFlags: ['split-across-surfaces', false, 'role-gap'],
        },
      ],
    },
    addressedOccurrenceNamespace,
  });

  assert.equal(prepared.status, 'joined');
  assert.deepEqual(prepared.joinedEvidence[0].namingObservation.ambiguityFlags, [
    'multiple-family-candidates',
    'case-variant-candidate',
  ]);
  assert.deepEqual(prepared.joinedEvidence[0].namingObservation.splitFamilyFlags, [
    'split-across-surfaces',
    'role-gap',
  ]);
});

test('Tree address join disambiguates duplicate same-family observations by full tuple', () => {
  const duplicateSameFamilyBridge = {
    bridgeContractVersion: 'naming-occurrence-bridge.v1',
    observations: [
      {
        addressProfileId: 'tree-codebase',
        addressedSnapshotId: 'snapshot-001',
        occurrenceAddress: 'A.2',
        repoRelativePath: 'src/beta/shared.logic.ts',
        path: 'src/beta/shared.logic.ts',
        semanticName: 'shared',
        familyRoot: 'shared',
        semanticFamily: 'shared-runtime',
        familySubgroup: 'runtime',
      },
      {
        addressProfileId: 'tree-codebase',
        addressedSnapshotId: 'snapshot-001',
        occurrenceAddress: 'A.1',
        repoRelativePath: 'src/alpha/shared.logic.ts',
        path: 'src/alpha/shared.logic.ts',
        semanticName: 'shared',
        familyRoot: 'shared',
        semanticFamily: 'shared-runtime',
        familySubgroup: 'runtime',
      },
    ],
  };

  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: duplicateSameFamilyBridge,
    addressedOccurrenceNamespace,
  });

  assert.equal(prepared.status, 'joined');
  assert.deepEqual(
    prepared.joinedEvidence.map((entry) => [entry.identityTuple.occurrenceAddress, entry.occurrenceRecord.path]),
    [
      ['A.1', 'src/alpha/shared.logic.ts'],
      ['A.2', 'src/beta/shared.logic.ts'],
    ],
  );
});

test('Tree address join reports valid empty bridge input as explicit no-evidence state', () => {
  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: {
      bridgeContractVersion: 'naming-occurrence-bridge.v1',
      observations: [],
    },
    addressedOccurrenceNamespace,
  });

  assert.equal(prepared.status, 'no-joined-evidence');
  assert.equal(prepared.usedForCurrentTreeJoins, false);
  assert.deepEqual(prepared.joinedEvidence, []);
  assert.deepEqual(prepared.skippedJoins, []);
  assert.deepEqual(prepared.diagnostics, []);
});

for (const [fieldName, expectedReason] of [
  ['addressProfileId', 'invalid-observation-identity-tuple'],
  ['addressedSnapshotId', 'invalid-observation-identity-tuple'],
  ['occurrenceAddress', 'invalid-observation-identity-tuple'],
]) {
  test(`Tree address join skips when Naming observation is missing ${fieldName}`, () => {
    const observation = { ...addressBridge.observations[0] };
    delete observation[fieldName];
    const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
      namingOccurrenceBridge: { bridgeContractVersion: 'naming-occurrence-bridge.v1', observations: [observation] },
      addressedOccurrenceNamespace,
    });

    assert.equal(prepared.status, 'skipped-with-diagnostics');
    assert.equal(prepared.joinedEvidence.length, 0);
    assert.equal(
      prepared.diagnostics.some((diagnostic) => diagnostic.reason === expectedReason),
      true,
    );
  });
}

test('Tree address join skips mismatched profile snapshot and address tuples explicitly', () => {
  for (const patch of [
    { addressProfileId: 'other-profile' },
    { addressedSnapshotId: 'snapshot-999' },
    { occurrenceAddress: 'A.999' },
  ]) {
    const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
      namingOccurrenceBridge: {
        bridgeContractVersion: 'naming-occurrence-bridge.v1',
        observations: [{ ...addressBridge.observations[0], ...patch }],
      },
      addressedOccurrenceNamespace,
    });

    assert.equal(prepared.status, 'joined-with-skips');
    assert.equal(prepared.joinedEvidence.length, 0);
    assert.equal(prepared.skippedJoins[0].reason, 'no-matching-occurrence-record-identity-tuple');
  }
});

test('Tree address join does not produce clean joins for diagnostic-bearing occurrence bridge intake', () => {
  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: {
      ...addressBridge,
      diagnostics: [{ diagnosticType: 'invalid-addressed-namespace', reason: 'missing-address-profile-id' }],
    },
    addressedOccurrenceNamespace,
  });

  assert.equal(prepared.status, 'skipped-with-diagnostics');
  assert.equal(prepared.joinedEvidence.length, 0);
  assert.equal(
    prepared.diagnostics.some((diagnostic) => diagnostic.reason === 'source-naming-diagnostics-present'),
    true,
  );
});


test('Tree address join does not re-derive Naming semantics from filenames when bridge semantic fields are absent', () => {
  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: {
      bridgeContractVersion: 'naming-occurrence-bridge.v1',
      observations: [
        {
          addressProfileId: 'tree-codebase',
          addressedSnapshotId: 'snapshot-001',
          occurrenceAddress: 'A.1',
          repoRelativePath: 'src/alpha/shared.logic.ts',
          path: 'src/alpha/shared.logic.ts',
        },
      ],
    },
    addressedOccurrenceNamespace,
  });

  assert.equal(prepared.status, 'joined');
  assert.equal(prepared.joinedEvidence[0].namingObservation.semanticFamily, null);
  assert.equal(prepared.joinedEvidence[0].namingObservation.familyRoot, null);
  assert.equal(prepared.joinedEvidence[0].namingObservation.familySubgroup, null);
});

test('Tree address join treats malformed occurrence bridge observations as diagnostic skipped state, not clean empty', () => {
  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: {
      bridgeContractVersion: 'naming-occurrence-bridge.v1',
      observations: { not: 'an-array' },
    },
    addressedOccurrenceNamespace,
  });

  assert.equal(prepared.status, 'skipped-with-diagnostics');
  assert.equal(prepared.usedForCurrentTreeJoins, false);
  assert.deepEqual(prepared.joinedEvidence, []);
  assert.equal(
    prepared.diagnostics.some((diagnostic) => diagnostic.reason === 'observations-not-array'),
    true,
  );
});

test('Tree address join exposes malformed occurrence records even when another record matches', () => {
  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: addressBridge,
    addressedOccurrenceNamespace: {
      ...addressedOccurrenceNamespace,
      occurrenceRecords: [
        { path: 'src/malformed/missing-address.logic.ts', occurrenceType: 'file' },
        ...addressedOccurrenceNamespace.occurrenceRecords,
      ],
    },
  });

  assert.notEqual(prepared.status, 'joined');
  assert.equal(prepared.status, 'joined-with-skips');
  assert.equal(prepared.usedForCurrentTreeJoins, false);
  assert.equal(prepared.joinedEvidence.length, 1);
  assert.equal(
    prepared.diagnostics.some((diagnostic) => diagnostic.reason === 'invalid-occurrence-record-identity-tuple'),
    true,
  );
});

test('Tree v1 intake ignores versioned Naming enrichment sidecar and preserves path fallback findings', () => {
  const enrichedOccurrenceBridge = {
    ...occurrenceBridge,
    occurrenceContextEnrichment: {
      enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1',
      identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
      enrichedObservations: [
        {
          addressProfileId: 'tree-codebase',
          addressedSnapshotId: 'snapshot-001',
          occurrenceAddress: 'O.1',
          parentOccurrenceAddress: 'O',
          occurrenceDepth: 2,
          occurrenceOrderIndex: 1,
          disambiguationNotes: [{ noteType: 'role-like-folder-token', token: 'host' }],
        },
      ],
    },
  };

  const intake = prepareTreeNamingOccurrenceBridgeIntake({ namingOccurrenceBridge: enrichedOccurrenceBridge });
  const withEnrichment = findingCodes({
    ...pathKeyedSemanticBridge,
    namingOccurrenceBridge: enrichedOccurrenceBridge,
  });

  assert.equal(intake.status, 'recognized-future-evidence-only');
  assert.equal(intake.usedForCurrentTreeJoins, false);
  assert.deepEqual(withEnrichment, findingCodes(pathKeyedSemanticBridge));
});
