import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  prepareTreeNamingOccurrenceAddressJoinEvidence,
  prepareTreeNamingOccurrenceBridgeIntake,
  prepareTreeSemanticHomeEvidenceInputFromJoinedOccurrence,
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
          disambiguationNotes: [{ code: 'role-like-folder-token', message: 'Role-like folder token: host', source: 'naming' }],
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

test('Tree address join attaches valid enrichment to exact occurrence tuple without changing join readiness', () => {
  const bridge = {
    ...addressBridge,
    occurrenceContextEnrichment: {
      enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1',
      identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
      enrichedObservations: [
        {
          addressProfileId: 'tree-codebase',
          addressedSnapshotId: 'snapshot-001',
          occurrenceAddress: 'A.1',
          parentOccurrenceAddress: null,
          occurrenceDepth: 0,
          occurrenceOrderIndex: 0,
          disambiguationNotes: [{ code: 'role-like-folder-token', message: 'Role-like folder token.', source: 'naming' }],
          evidenceLimitNotes: [{ code: 'limited-context', message: 'Limited deterministic context.', source: 'naming' }],
        },
      ],
    },
  };

  const withoutEnrichment = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: addressBridge,
    addressedOccurrenceNamespace,
  });
  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: bridge,
    addressedOccurrenceNamespace,
  });

  assert.equal(prepared.status, withoutEnrichment.status);
  assert.equal(prepared.usedForCurrentTreeJoins, withoutEnrichment.usedForCurrentTreeJoins);
  assert.deepEqual(prepared.diagnostics, withoutEnrichment.diagnostics);
  assert.deepEqual(prepared.skippedJoins, withoutEnrichment.skippedJoins);
  assert.deepEqual(prepared.enrichmentDiagnostics, []);
  assert.deepEqual(prepared.joinedEvidence[0].occurrenceContextEnrichment, {
    evidenceType: 'tree-local-naming-occurrence-context-enrichment',
    sourceIdentityTuple: {
      addressProfileId: 'tree-codebase',
      addressedSnapshotId: 'snapshot-001',
      occurrenceAddress: 'A.1',
    },
    addressingContext: {
      parentOccurrenceAddress: null,
      occurrenceDepth: 0,
      occurrenceOrderIndex: 0,
    },
    namingMetadata: {
      disambiguationNotes: [{ code: 'role-like-folder-token', message: 'Role-like folder token.', source: 'naming' }],
      evidenceLimitNotes: [{ code: 'limited-context', message: 'Limited deterministic context.', source: 'naming' }],
    },
  });
  assert.equal(prepared.joinedEvidence[0].namingObservation.semanticFamily, 'shared-runtime');
});

test('Tree enrichment sidecar keeps same-family nested occurrences isolated by canonical tuple', () => {
  const sameFamilyBridge = {
    bridgeContractVersion: 'naming-occurrence-bridge.v1',
    observations: [
      { ...addressBridge.observations[0], occurrenceAddress: 'A.1', path: 'src/alpha/shared.logic.ts' },
      { ...addressBridge.observations[0], occurrenceAddress: 'A.2', path: 'src/beta/shared.logic.ts' },
    ],
    occurrenceContextEnrichment: {
      enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1',
      identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
      enrichedObservations: [
        {
          addressProfileId: 'tree-codebase',
          addressedSnapshotId: 'snapshot-001',
          occurrenceAddress: 'A.2',
          parentOccurrenceAddress: 'A',
          occurrenceDepth: 2,
          occurrenceOrderIndex: 1,
        },
        {
          addressProfileId: 'tree-codebase',
          addressedSnapshotId: 'snapshot-001',
          occurrenceAddress: 'A.1',
          parentOccurrenceAddress: null,
          occurrenceDepth: 1,
          occurrenceOrderIndex: 0,
        },
      ],
    },
  };

  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: sameFamilyBridge,
    addressedOccurrenceNamespace,
  });

  assert.equal(prepared.status, 'joined');
  assert.deepEqual(
    prepared.joinedEvidence.map((entry) => [
      entry.identityTuple.occurrenceAddress,
      entry.namingObservation.semanticFamily,
      entry.occurrenceContextEnrichment.addressingContext,
    ]),
    [
      ['A.1', 'shared-runtime', { parentOccurrenceAddress: null, occurrenceDepth: 1, occurrenceOrderIndex: 0 }],
      ['A.2', 'shared-runtime', { parentOccurrenceAddress: 'A', occurrenceDepth: 2, occurrenceOrderIndex: 1 }],
    ],
  );
});

test('Tree enrichment sidecar failures are isolated from v1 joins and path-keyed fallback', () => {
  const cases = [
    { occurrenceContextEnrichment: { enrichmentContractVersion: 'other', identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'], enrichedObservations: [] }, reason: 'unsupported-enrichment-sidecar-version' },
    { occurrenceContextEnrichment: { enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1', identityTupleFields: ['addressedSnapshotId', 'addressProfileId', 'occurrenceAddress'], enrichedObservations: [] }, reason: 'malformed-enrichment-sidecar' },
    { occurrenceContextEnrichment: { enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1', identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'], enrichedObservations: [{ addressProfileId: '', addressedSnapshotId: 'snapshot-001', occurrenceAddress: 'A.1' }] }, reason: 'invalid-enrichment-identity-tuple' },
    { occurrenceContextEnrichment: { enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1', identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'], enrichedObservations: [{ addressProfileId: 'tree-codebase', addressedSnapshotId: 'snapshot-001', occurrenceAddress: 'A.1' }, { addressProfileId: 'tree-codebase', addressedSnapshotId: 'snapshot-001', occurrenceAddress: 'A.1' }] }, reason: 'duplicate-enrichment-identity-tuple' },
    { occurrenceContextEnrichment: { enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1', identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'], enrichedObservations: [{ addressProfileId: 'tree-codebase', addressedSnapshotId: 'snapshot-001', occurrenceAddress: 'A.999' }] }, reason: 'unmatched-enrichment-identity-tuple' },
    { occurrenceContextEnrichment: { enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1', identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'], enrichedObservations: [{ addressProfileId: 'tree-codebase', addressedSnapshotId: 'snapshot-001', occurrenceAddress: 'A.1', occurrenceDepth: -1 }] }, reason: 'invalid-enrichment-field' },
  ];

  for (const { occurrenceContextEnrichment, reason } of cases) {
    const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
      namingOccurrenceBridge: { ...addressBridge, occurrenceContextEnrichment },
      addressedOccurrenceNamespace,
    });
    assert.equal(prepared.status, 'joined');
    assert.equal(prepared.usedForCurrentTreeJoins, true);
    assert.equal(prepared.joinedEvidence.length, 1);
    assert.equal(prepared.enrichmentDiagnostics.some((diagnostic) => diagnostic.reason === reason), true);
    assert.deepEqual(
      findingCodes({ ...pathKeyedSemanticBridge, namingOccurrenceBridge: { ...addressBridge, occurrenceContextEnrichment } }),
      findingCodes(pathKeyedSemanticBridge),
    );
  }
});

const authoritativeOccurrenceNamespace = {
  addressProfileId: 'tree-codebase',
  addressedSnapshotId: 'snapshot-001',
  occurrenceRecords: [
    {
      occurrenceAddress: 'A.1',
      addressPath: 'A.1',
      parentAddressPath: null,
      depth: 1,
      orderIndex: 0,
      path: 'src/alpha/shared.logic.ts',
      resolvedPath: 'src/alpha/shared.logic.ts',
      name: 'shared.logic.ts',
      occurrenceType: 'file',
    },
    {
      occurrenceAddress: 'A.2',
      addressPath: 'A.2',
      parentAddressPath: 'A',
      depth: 2,
      orderIndex: 5,
      path: 'src/beta/shared.logic.ts',
      resolvedPath: 'src/beta/shared.logic.ts',
      name: 'shared.logic.ts',
      occurrenceType: 'file',
    },
  ],
};

const sameFamilyTwoObservationBridge = {
  bridgeContractVersion: 'naming-occurrence-bridge.v1',
  observations: [
    { ...addressBridge.observations[0], occurrenceAddress: 'A.1', path: 'src/alpha/shared.logic.ts' },
    { ...addressBridge.observations[0], occurrenceAddress: 'A.2', path: 'src/beta/shared.logic.ts' },
  ],
};

const enrichedBridgeForFieldLocalCase = (record) => ({
  ...sameFamilyTwoObservationBridge,
  observations: [sameFamilyTwoObservationBridge.observations.find((observation) => observation.occurrenceAddress === record.occurrenceAddress)],
  occurrenceContextEnrichment: {
    enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1',
    identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
    enrichedObservations: [record],
  },
});

const baseA2EnrichmentRecord = {
  addressProfileId: 'tree-codebase',
  addressedSnapshotId: 'snapshot-001',
  occurrenceAddress: 'A.2',
  parentOccurrenceAddress: 'A',
  occurrenceDepth: 2,
  occurrenceOrderIndex: 5,
  disambiguationNotes: [{ code: 'role-like-folder-token', message: 'Role-like folder token.', source: 'naming' }],
  evidenceLimitNotes: [{ code: 'source-limit', message: 'Source is bounded.', source: 'naming' }],
};

const prepareFieldLocalCase = (record) => prepareTreeNamingOccurrenceAddressJoinEvidence({
  namingOccurrenceBridge: enrichedBridgeForFieldLocalCase(record),
  addressedOccurrenceNamespace: authoritativeOccurrenceNamespace,
});

const fieldDiagnosticCount = (prepared, fieldName) =>
  prepared.enrichmentDiagnostics.filter(
    (diagnostic) => diagnostic.reason === 'invalid-enrichment-field' && diagnostic.fieldName === fieldName,
  ).length;

test('Tree enrichment omits invalid negative occurrenceDepth while preserving valid sibling fields', () => {
  const prepared = prepareFieldLocalCase({ ...baseA2EnrichmentRecord, occurrenceDepth: -1 });
  const enrichment = prepared.joinedEvidence[0].occurrenceContextEnrichment;

  assert.equal(fieldDiagnosticCount(prepared, 'occurrenceDepth'), 1);
  assert.deepEqual(enrichment.addressingContext, { parentOccurrenceAddress: 'A', occurrenceOrderIndex: 5 });
  assert.deepEqual(enrichment.namingMetadata.evidenceLimitNotes, baseA2EnrichmentRecord.evidenceLimitNotes);
  assert.deepEqual(enrichment.namingMetadata.disambiguationNotes, baseA2EnrichmentRecord.disambiguationNotes);
});

test('Tree enrichment omits non-integer occurrenceOrderIndex while preserving valid sibling fields', () => {
  const prepared = prepareFieldLocalCase({ ...baseA2EnrichmentRecord, occurrenceOrderIndex: 1.5 });
  const enrichment = prepared.joinedEvidence[0].occurrenceContextEnrichment;

  assert.equal(fieldDiagnosticCount(prepared, 'occurrenceOrderIndex'), 1);
  assert.deepEqual(enrichment.addressingContext, { parentOccurrenceAddress: 'A', occurrenceDepth: 2 });
  assert.deepEqual(enrichment.namingMetadata.evidenceLimitNotes, baseA2EnrichmentRecord.evidenceLimitNotes);
  assert.deepEqual(enrichment.namingMetadata.disambiguationNotes, baseA2EnrichmentRecord.disambiguationNotes);
});

test('Tree enrichment omits malformed parentOccurrenceAddress while preserving valid sibling fields', () => {
  const prepared = prepareFieldLocalCase({ ...baseA2EnrichmentRecord, parentOccurrenceAddress: '' });
  const enrichment = prepared.joinedEvidence[0].occurrenceContextEnrichment;

  assert.equal(fieldDiagnosticCount(prepared, 'parentOccurrenceAddress'), 1);
  assert.deepEqual(enrichment.addressingContext, { occurrenceDepth: 2, occurrenceOrderIndex: 5 });
  assert.deepEqual(enrichment.namingMetadata.evidenceLimitNotes, baseA2EnrichmentRecord.evidenceLimitNotes);
  assert.deepEqual(enrichment.namingMetadata.disambiguationNotes, baseA2EnrichmentRecord.disambiguationNotes);
});

test('Tree enrichment omits malformed disambiguationNotes while preserving neutral context and evidence limits', () => {
  const prepared = prepareFieldLocalCase({ ...baseA2EnrichmentRecord, disambiguationNotes: [{ code: 'bad', message: '', source: 'naming' }] });
  const enrichment = prepared.joinedEvidence[0].occurrenceContextEnrichment;

  assert.equal(fieldDiagnosticCount(prepared, 'disambiguationNotes'), 1);
  assert.deepEqual(enrichment.addressingContext, { parentOccurrenceAddress: 'A', occurrenceDepth: 2, occurrenceOrderIndex: 5 });
  assert.equal(Object.hasOwn(enrichment.namingMetadata, 'disambiguationNotes'), false);
  assert.deepEqual(enrichment.namingMetadata.evidenceLimitNotes, baseA2EnrichmentRecord.evidenceLimitNotes);
});

test('Tree enrichment omits malformed evidenceLimitNotes while preserving neutral context and disambiguation notes', () => {
  const prepared = prepareFieldLocalCase({ ...baseA2EnrichmentRecord, evidenceLimitNotes: [{ code: 'source-limit', message: 'Source is bounded.', source: 'tree' }] });
  const enrichment = prepared.joinedEvidence[0].occurrenceContextEnrichment;

  assert.equal(fieldDiagnosticCount(prepared, 'evidenceLimitNotes'), 1);
  assert.deepEqual(enrichment.addressingContext, { parentOccurrenceAddress: 'A', occurrenceDepth: 2, occurrenceOrderIndex: 5 });
  assert.deepEqual(enrichment.namingMetadata.disambiguationNotes, baseA2EnrichmentRecord.disambiguationNotes);
  assert.equal(Object.hasOwn(enrichment.namingMetadata, 'evidenceLimitNotes'), false);
});

test('Tree enrichment invalid field diagnostics identify tuple and field deterministically', () => {
  const prepared = prepareFieldLocalCase({ ...baseA2EnrichmentRecord, occurrenceDepth: 1.5 });

  assert.deepEqual(prepared.enrichmentDiagnostics, [
    {
      reason: 'invalid-enrichment-field',
      fieldName: 'occurrenceDepth',
      identityTuple: {
        addressProfileId: 'tree-codebase',
        addressedSnapshotId: 'snapshot-001',
        occurrenceAddress: 'A.2',
      },
    },
  ]);
});

test('Tree enrichment rejects whole record when valid parent depth or order conflicts with authoritative occurrence context', () => {
  for (const conflictingField of [
    { parentOccurrenceAddress: 'B' },
    { occurrenceDepth: 3 },
    { occurrenceOrderIndex: 6 },
  ]) {
    const prepared = prepareFieldLocalCase({ ...baseA2EnrichmentRecord, ...conflictingField });

    assert.equal(prepared.joinedEvidence[0].occurrenceContextEnrichment, undefined);
    assert.equal(
      prepared.enrichmentDiagnostics.some((diagnostic) => diagnostic.reason === 'authoritative-enrichment-context-mismatch'),
      true,
    );
  }
});

test('Tree enrichment field-local omission on one same-family occurrence does not affect another tuple', () => {
  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: {
      ...sameFamilyTwoObservationBridge,
      occurrenceContextEnrichment: {
        enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1',
        identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
        enrichedObservations: [
          {
            ...baseA2EnrichmentRecord,
            occurrenceDepth: -1,
          },
          {
            addressProfileId: 'tree-codebase',
            addressedSnapshotId: 'snapshot-001',
            occurrenceAddress: 'A.1',
            parentOccurrenceAddress: null,
            occurrenceDepth: 1,
            occurrenceOrderIndex: 0,
            evidenceLimitNotes: [{ code: 'alpha-limit', message: 'Alpha bounded.', source: 'naming' }],
          },
        ],
      },
    },
    addressedOccurrenceNamespace: authoritativeOccurrenceNamespace,
  });

  assert.equal(fieldDiagnosticCount(prepared, 'occurrenceDepth'), 1);
  assert.deepEqual(
    prepared.joinedEvidence.map((entry) => [
      entry.identityTuple.occurrenceAddress,
      entry.occurrenceContextEnrichment.addressingContext,
      entry.occurrenceContextEnrichment.namingMetadata,
    ]),
    [
      [
        'A.1',
        { parentOccurrenceAddress: null, occurrenceDepth: 1, occurrenceOrderIndex: 0 },
        { evidenceLimitNotes: [{ code: 'alpha-limit', message: 'Alpha bounded.', source: 'naming' }] },
      ],
      [
        'A.2',
        { parentOccurrenceAddress: 'A', occurrenceOrderIndex: 5 },
        {
          disambiguationNotes: baseA2EnrichmentRecord.disambiguationNotes,
          evidenceLimitNotes: baseA2EnrichmentRecord.evidenceLimitNotes,
        },
      ],
    ],
  );
});

test('Tree enrichment preserves explicit root parent null as authoritative during parent comparison', () => {
  const rootNamespace = {
    addressProfileId: 'tree-codebase',
    addressedSnapshotId: 'snapshot-001',
    occurrenceRecords: [
      {
        occurrenceAddress: 'R',
        addressPath: 'R',
        parentOccurrenceAddress: null,
        path: 'src/root.logic.ts',
        resolvedPath: 'src/root.logic.ts',
        name: 'root.logic.ts',
        occurrenceType: 'file',
      },
    ],
  };
  const rootObservation = {
    ...addressBridge.observations[0],
    occurrenceAddress: 'R',
    path: 'src/root.logic.ts',
  };

  const conflicting = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: {
      bridgeContractVersion: 'naming-occurrence-bridge.v1',
      observations: [rootObservation],
      occurrenceContextEnrichment: {
        enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1',
        identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
        enrichedObservations: [
          {
            addressProfileId: 'tree-codebase',
            addressedSnapshotId: 'snapshot-001',
            occurrenceAddress: 'R',
            parentOccurrenceAddress: 'B',
            evidenceLimitNotes: [{ code: 'root-context', message: 'Root context.', source: 'naming' }],
          },
        ],
      },
    },
    addressedOccurrenceNamespace: rootNamespace,
  });

  assert.equal(conflicting.joinedEvidence[0].occurrenceContextEnrichment, undefined);
  assert.deepEqual(conflicting.enrichmentDiagnostics, [
    {
      reason: 'authoritative-enrichment-context-mismatch',
      fieldName: 'parentOccurrenceAddress',
      identityTuple: {
        addressProfileId: 'tree-codebase',
        addressedSnapshotId: 'snapshot-001',
        occurrenceAddress: 'R',
      },
    },
  ]);

  const matching = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: {
      bridgeContractVersion: 'naming-occurrence-bridge.v1',
      observations: [rootObservation],
      occurrenceContextEnrichment: {
        enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1',
        identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
        enrichedObservations: [
          {
            addressProfileId: 'tree-codebase',
            addressedSnapshotId: 'snapshot-001',
            occurrenceAddress: 'R',
            parentOccurrenceAddress: null,
            evidenceLimitNotes: [{ code: 'root-context', message: 'Root context.', source: 'naming' }],
          },
        ],
      },
    },
    addressedOccurrenceNamespace: rootNamespace,
  });

  assert.deepEqual(matching.enrichmentDiagnostics, []);
  assert.deepEqual(matching.joinedEvidence[0].occurrenceContextEnrichment.addressingContext, {
    parentOccurrenceAddress: null,
  });
  assert.deepEqual(matching.joinedEvidence[0].occurrenceContextEnrichment.namingMetadata, {
    evidenceLimitNotes: [{ code: 'root-context', message: 'Root context.', source: 'naming' }],
  });
});

test('Tree enrichment keeps no-authoritative-parent-alias compatibility while retaining invalid field-local behavior', () => {
  const noParentAliasNamespace = {
    addressProfileId: 'tree-codebase',
    addressedSnapshotId: 'snapshot-001',
    occurrenceRecords: [
      {
        occurrenceAddress: 'N',
        addressPath: 'N',
        path: 'src/no-parent-alias.logic.ts',
        resolvedPath: 'src/no-parent-alias.logic.ts',
        name: 'no-parent-alias.logic.ts',
        occurrenceType: 'file',
      },
    ],
  };

  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: {
      bridgeContractVersion: 'naming-occurrence-bridge.v1',
      observations: [
        {
          ...addressBridge.observations[0],
          occurrenceAddress: 'N',
          path: 'src/no-parent-alias.logic.ts',
        },
      ],
      occurrenceContextEnrichment: {
        enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1',
        identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
        enrichedObservations: [
          {
            addressProfileId: 'tree-codebase',
            addressedSnapshotId: 'snapshot-001',
            occurrenceAddress: 'N',
            parentOccurrenceAddress: 'B',
            occurrenceDepth: -1,
            occurrenceOrderIndex: 2,
            evidenceLimitNotes: [{ code: 'no-parent-authority', message: 'No parent authority.', source: 'naming' }],
          },
        ],
      },
    },
    addressedOccurrenceNamespace: noParentAliasNamespace,
  });

  assert.equal(fieldDiagnosticCount(prepared, 'occurrenceDepth'), 1);
  assert.deepEqual(prepared.joinedEvidence[0].occurrenceContextEnrichment.addressingContext, {
    parentOccurrenceAddress: 'B',
    occurrenceOrderIndex: 2,
  });
  assert.deepEqual(prepared.joinedEvidence[0].occurrenceContextEnrichment.namingMetadata, {
    evidenceLimitNotes: [{ code: 'no-parent-authority', message: 'No parent authority.', source: 'naming' }],
  });
});

test('Tree enrichment rejects numeric-leading disambiguation note codes field-locally', () => {
  const prepared = prepareFieldLocalCase({
    ...baseA2EnrichmentRecord,
    disambiguationNotes: [{ code: '1-warning', message: 'Numeric-leading code.', source: 'naming' }],
    evidenceLimitNotes: [{ code: 'a1-warning', message: 'Letter-leading code with digit.', source: 'naming' }],
  });
  const enrichment = prepared.joinedEvidence[0].occurrenceContextEnrichment;

  assert.equal(fieldDiagnosticCount(prepared, 'disambiguationNotes'), 1);
  assert.deepEqual(enrichment.addressingContext, {
    parentOccurrenceAddress: 'A',
    occurrenceDepth: 2,
    occurrenceOrderIndex: 5,
  });
  assert.equal(Object.hasOwn(enrichment.namingMetadata, 'disambiguationNotes'), false);
  assert.deepEqual(enrichment.namingMetadata.evidenceLimitNotes, [
    { code: 'a1-warning', message: 'Letter-leading code with digit.', source: 'naming' },
  ]);
});

test('Tree enrichment rejects numeric-leading evidence limit note codes field-locally', () => {
  const prepared = prepareFieldLocalCase({
    ...baseA2EnrichmentRecord,
    disambiguationNotes: [
      { code: 'role-like-folder-token', message: 'Role-like folder token.', source: 'naming' },
      { code: 'a1-warning', message: 'Letter-leading code with digit.', source: 'naming' },
    ],
    evidenceLimitNotes: [{ code: '1-warning', message: 'Numeric-leading code.', source: 'naming' }],
  });
  const enrichment = prepared.joinedEvidence[0].occurrenceContextEnrichment;

  assert.equal(fieldDiagnosticCount(prepared, 'evidenceLimitNotes'), 1);
  assert.deepEqual(enrichment.addressingContext, {
    parentOccurrenceAddress: 'A',
    occurrenceDepth: 2,
    occurrenceOrderIndex: 5,
  });
  assert.deepEqual(enrichment.namingMetadata.disambiguationNotes, [
    { code: 'a1-warning', message: 'Letter-leading code with digit.', source: 'naming' },
    { code: 'role-like-folder-token', message: 'Role-like folder token.', source: 'naming' },
  ]);
  assert.equal(Object.hasOwn(enrichment.namingMetadata, 'evidenceLimitNotes'), false);
});

test('Tree enrichment canonicalizes disambiguation notes by removing duplicates and sorting by code then message', () => {
  const prepared = prepareFieldLocalCase({
    ...baseA2EnrichmentRecord,
    disambiguationNotes: [
      { code: 'role-warning', message: 'Zulu message.', source: 'naming' },
      { code: 'a1-warning', message: 'Middle message.', source: 'naming' },
      { code: 'role-warning', message: 'Alpha message.', source: 'naming' },
      { code: 'a1-warning', message: 'Middle message.', source: 'naming' },
    ],
  });

  assert.deepEqual(prepared.joinedEvidence[0].occurrenceContextEnrichment.namingMetadata.disambiguationNotes, [
    { code: 'a1-warning', message: 'Middle message.', source: 'naming' },
    { code: 'role-warning', message: 'Alpha message.', source: 'naming' },
    { code: 'role-warning', message: 'Zulu message.', source: 'naming' },
  ]);
});

test('Tree enrichment canonicalizes evidence limit notes and keeps sibling invalid-note behavior field-local', () => {
  const prepared = prepareFieldLocalCase({
    ...baseA2EnrichmentRecord,
    disambiguationNotes: [{ code: '1-warning', message: 'Numeric-leading code.', source: 'naming' }],
    evidenceLimitNotes: [
      { code: 'source-limit', message: 'Zulu source.', source: 'naming' },
      { code: 'a1-warning', message: 'Letter-leading code with digit.', source: 'naming' },
      { code: 'source-limit', message: 'Alpha source.', source: 'naming' },
      { code: 'source-limit', message: 'Alpha source.', source: 'naming' },
    ],
  });
  const enrichment = prepared.joinedEvidence[0].occurrenceContextEnrichment;

  assert.equal(fieldDiagnosticCount(prepared, 'disambiguationNotes'), 1);
  assert.deepEqual(enrichment.addressingContext, {
    parentOccurrenceAddress: 'A',
    occurrenceDepth: 2,
    occurrenceOrderIndex: 5,
  });
  assert.equal(Object.hasOwn(enrichment.namingMetadata, 'disambiguationNotes'), false);
  assert.deepEqual(enrichment.namingMetadata.evidenceLimitNotes, [
    { code: 'a1-warning', message: 'Letter-leading code with digit.', source: 'naming' },
    { code: 'source-limit', message: 'Alpha source.', source: 'naming' },
    { code: 'source-limit', message: 'Zulu source.', source: 'naming' },
  ]);
});

test('Tree enrichment skips empty wrapper when only invalid occurrenceDepth remains', () => {
  const prepared = prepareFieldLocalCase({
    addressProfileId: 'tree-codebase',
    addressedSnapshotId: 'snapshot-001',
    occurrenceAddress: 'A.2',
    occurrenceDepth: -1,
  });

  assert.equal(fieldDiagnosticCount(prepared, 'occurrenceDepth'), 1);
  assert.equal(prepared.joinedEvidence[0].occurrenceContextEnrichment, undefined);
  assert.equal(prepared.status, 'joined');
  assert.equal(prepared.usedForCurrentTreeJoins, true);
});

test('Tree enrichment skips empty wrapper when only malformed disambiguationNotes remain', () => {
  const prepared = prepareFieldLocalCase({
    addressProfileId: 'tree-codebase',
    addressedSnapshotId: 'snapshot-001',
    occurrenceAddress: 'A.2',
    disambiguationNotes: [{ code: '1-warning', message: 'Numeric-leading code.', source: 'naming' }],
  });

  assert.equal(fieldDiagnosticCount(prepared, 'disambiguationNotes'), 1);
  assert.equal(prepared.joinedEvidence[0].occurrenceContextEnrichment, undefined);
});

test('Tree enrichment skips empty wrapper for multiple invalid optional fields while retaining diagnostics', () => {
  const prepared = prepareFieldLocalCase({
    addressProfileId: 'tree-codebase',
    addressedSnapshotId: 'snapshot-001',
    occurrenceAddress: 'A.2',
    occurrenceDepth: -1,
    occurrenceOrderIndex: 1.5,
    parentOccurrenceAddress: '',
    evidenceLimitNotes: [{ code: '1-warning', message: 'Numeric-leading code.', source: 'naming' }],
  });

  assert.equal(prepared.joinedEvidence[0].occurrenceContextEnrichment, undefined);
  assert.deepEqual(
    prepared.enrichmentDiagnostics.map((diagnostic) => [diagnostic.reason, diagnostic.fieldName]),
    [
      ['invalid-enrichment-field', 'evidenceLimitNotes'],
      ['invalid-enrichment-field', 'occurrenceDepth'],
      ['invalid-enrichment-field', 'occurrenceOrderIndex'],
      ['invalid-enrichment-field', 'parentOccurrenceAddress'],
    ],
  );
});

test('Tree enrichment keeps partial valid metadata when sibling field validation empties addressing context', () => {
  const prepared = prepareFieldLocalCase({
    addressProfileId: 'tree-codebase',
    addressedSnapshotId: 'snapshot-001',
    occurrenceAddress: 'A.2',
    occurrenceDepth: -1,
    evidenceLimitNotes: [{ code: 'source-limit', message: 'Source is bounded.', source: 'naming' }],
  });

  assert.equal(fieldDiagnosticCount(prepared, 'occurrenceDepth'), 1);
  assert.deepEqual(prepared.joinedEvidence[0].occurrenceContextEnrichment.addressingContext, {});
  assert.deepEqual(prepared.joinedEvidence[0].occurrenceContextEnrichment.namingMetadata, {
    evidenceLimitNotes: [{ code: 'source-limit', message: 'Source is bounded.', source: 'naming' }],
  });
});

test('Tree enrichment absent sidecar remains unchanged without empty attachment or enrichment diagnostics', () => {
  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: addressBridge,
    addressedOccurrenceNamespace,
  });

  assert.equal(prepared.status, 'joined');
  assert.equal(prepared.usedForCurrentTreeJoins, true);
  assert.equal(Object.hasOwn(prepared.joinedEvidence[0], 'occurrenceContextEnrichment'), false);
  assert.deepEqual(prepared.enrichmentDiagnostics, []);
});


test('Tree prepared semantic-home input retains tuple, Naming observation, context, and metadata', () => {
  const bridge = {
    ...addressBridge,
    observations: [{ ...addressBridge.observations[0], role: 'logic', ambiguity: { status: 'none' } }],
    occurrenceContextEnrichment: {
      enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1',
      identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
      enrichedObservations: [
        {
          addressProfileId: 'tree-codebase',
          addressedSnapshotId: 'snapshot-001',
          occurrenceAddress: 'A.1',
          parentOccurrenceAddress: null,
          occurrenceDepth: 0,
          occurrenceOrderIndex: 0,
          disambiguationNotes: [{ code: 'role-like-folder-token', message: 'Role-like folder token.', source: 'naming' }],
          evidenceLimitNotes: [{ code: 'limited-context', message: 'Limited deterministic context.', source: 'naming' }],
        },
      ],
    },
  };

  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: bridge,
    addressedOccurrenceNamespace,
  });
  const joinedEntry = prepared.joinedEvidence[0];

  assert.deepEqual(joinedEntry.preparedSemanticHomeEvidence, {
    sourceIdentityTuple: {
      addressProfileId: 'tree-codebase',
      addressedSnapshotId: 'snapshot-001',
      occurrenceAddress: 'A.1',
    },
    namingObservation: joinedEntry.namingObservation,
    addressingContext: {
      resolvedPath: 'src/alpha/shared.logic.ts',
      path: 'src/alpha/shared.logic.ts',
      name: 'shared.logic.ts',
      occurrenceType: 'file',
      addressPath: 'A.1',
      parentOccurrenceAddress: null,
      occurrenceDepth: 0,
      occurrenceOrderIndex: 0,
    },
    namingMetadata: {
      disambiguationNotes: [{ code: 'role-like-folder-token', message: 'Role-like folder token.', source: 'naming' }],
      evidenceLimitNotes: [{ code: 'limited-context', message: 'Limited deterministic context.', source: 'naming' }],
    },
  });
  assert.equal(joinedEntry.preparedSemanticHomeEvidence.namingObservation.role, 'logic');
  assert.deepEqual(joinedEntry.preparedSemanticHomeEvidence.namingObservation.ambiguity, { status: 'none' });
});

test('Tree prepared semantic-home input keeps same-family occurrences distinct without metadata leakage', () => {
  const sameFamilyBridge = {
    bridgeContractVersion: 'naming-occurrence-bridge.v1',
    observations: [
      { ...addressBridge.observations[0], occurrenceAddress: 'A.1', path: 'src/alpha/shared.logic.ts' },
      { ...addressBridge.observations[0], occurrenceAddress: 'A.2', path: 'src/beta/shared.logic.ts' },
    ],
    occurrenceContextEnrichment: {
      enrichmentContractVersion: 'naming-occurrence-bridge-enrichment.v1',
      identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
      enrichedObservations: [
        {
          addressProfileId: 'tree-codebase',
          addressedSnapshotId: 'snapshot-001',
          occurrenceAddress: 'A.2',
          parentOccurrenceAddress: 'A',
          occurrenceDepth: 2,
          occurrenceOrderIndex: 1,
          disambiguationNotes: [{ code: 'beta-context', message: 'Beta context only.', source: 'naming' }],
        },
      ],
    },
  };

  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: sameFamilyBridge,
    addressedOccurrenceNamespace,
  });

  assert.deepEqual(
    prepared.joinedEvidence.map((entry) => [
      entry.preparedSemanticHomeEvidence.sourceIdentityTuple.occurrenceAddress,
      entry.preparedSemanticHomeEvidence.namingObservation.semanticFamily,
      entry.preparedSemanticHomeEvidence.addressingContext.path,
      entry.preparedSemanticHomeEvidence.addressingContext.addressPath,
      entry.preparedSemanticHomeEvidence.addressingContext.parentOccurrenceAddress,
      entry.preparedSemanticHomeEvidence.addressingContext.occurrenceDepth,
      entry.preparedSemanticHomeEvidence.namingMetadata?.disambiguationNotes?.[0]?.code ?? null,
    ]),
    [
      ['A.1', 'shared-runtime', 'src/alpha/shared.logic.ts', 'A.1', undefined, undefined, null],
      ['A.2', 'shared-runtime', 'src/beta/shared.logic.ts', 'A.2', 'A', 2, 'beta-context'],
    ],
  );
});

test('Tree prepared semantic-home input falls back to v1 joined observation when enrichment is absent', () => {
  const prepared = prepareTreeNamingOccurrenceAddressJoinEvidence({
    namingOccurrenceBridge: addressBridge,
    addressedOccurrenceNamespace,
  });
  const preparedSemanticHomeEvidence = prepared.joinedEvidence[0].preparedSemanticHomeEvidence;

  assert.deepEqual(preparedSemanticHomeEvidence.sourceIdentityTuple, prepared.joinedEvidence[0].identityTuple);
  assert.deepEqual(preparedSemanticHomeEvidence.namingObservation, prepared.joinedEvidence[0].namingObservation);
  assert.equal(preparedSemanticHomeEvidence.addressingContext.path, 'src/alpha/shared.logic.ts');
  assert.equal(Object.hasOwn(preparedSemanticHomeEvidence, 'namingMetadata'), false);
});

test('Tree prepared semantic-home helper rejects malformed joined entries without synthesizing Naming semantics', () => {
  assert.equal(prepareTreeSemanticHomeEvidenceInputFromJoinedOccurrence(null), null);
  assert.equal(prepareTreeSemanticHomeEvidenceInputFromJoinedOccurrence({ identityTuple: { occurrenceAddress: 'A.1' } }), null);
});
