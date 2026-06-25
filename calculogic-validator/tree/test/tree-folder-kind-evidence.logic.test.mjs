import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareTreeFolderKindEvidence } from '../src/tree-folder-kind-evidence.logic.mjs';

const folderKindsRegistryFixture = {
  version: '1',
  folderKinds: [
    { folderKind: 'structural', status: 'active' },
    { folderKind: 'semantic', status: 'active' },
    { folderKind: 'semantic-qualified-structural-container', status: 'active' },
    { folderKind: 'unspecified', status: 'active' },
  ],
};

test('returns deterministic evidence-only records from tree-owned inputs', () => {
  const addressedOccurrenceRecords = [
    { addressPath: 'A', parentAddressPath: null, path: 'src', name: 'src', occurrenceType: 'folder' },
    { addressPath: 'A.1', parentAddressPath: 'A', path: 'src/runtime', name: 'runtime', occurrenceType: 'folder' },
    { addressPath: 'A.2', parentAddressPath: 'A', path: 'src/readme.md', name: 'readme.md', occurrenceType: 'file' },
  ];

  const structuralEvidence = {
    source: 'tree-structural-home-evidence',
    evidenceRecords: [{ path: 'src', structuralHome: 'src' }],
  };
  const semanticEvidence = {
    source: 'tree-semantic-home-evidence',
    evidenceRecords: [{ path: 'src/runtime', semanticHome: 'runtime-core' }],
  };

  const beforeAddressed = structuredClone(addressedOccurrenceRecords);
  const beforeStructural = structuredClone(structuralEvidence);
  const beforeSemantic = structuredClone(semanticEvidence);
  const beforeRegistry = structuredClone(folderKindsRegistryFixture);

  const result = prepareTreeFolderKindEvidence({
    addressedOccurrenceRecords,
    treeStructuralHomeEvidence: structuralEvidence,
    treeSemanticHomeEvidence: semanticEvidence,
    folderKindsRegistry: folderKindsRegistryFixture,
  });

  assert.deepEqual(addressedOccurrenceRecords, beforeAddressed);
  assert.deepEqual(structuralEvidence, beforeStructural);
  assert.deepEqual(semanticEvidence, beforeSemantic);
  assert.deepEqual(folderKindsRegistryFixture, beforeRegistry);
  assert.deepEqual(result.evidenceRecords.map((record) => record.path), ['src', 'src/runtime']);
  assert.deepEqual(result.evidenceRecords.map((record) => record.folderKind), ['structural', 'semantic']);
  assert.deepEqual(Object.keys(result.evidenceRecords[0]).sort(), [
    'addressPath',
    'folderKind',
    'folderKindEvidenceStrength',
    'folderKindSource',
    'name',
    'occurrenceType',
    'parentAddressPath',
    'path',
    'rationale',
    'semanticHome',
    'structuralHome',
  ]);
});


test('emits relationship-qualified folder-kind evidence only for aligned mixed-folder relationships', () => {
  const result = prepareTreeFolderKindEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A.1', parentAddressPath: null, path: 'calculogic-validator/naming/naming-src', name: 'naming-src', occurrenceType: 'folder' },
      { addressPath: 'A.2', parentAddressPath: null, path: 'calculogic-validator/tree/naming-src', name: 'naming-src', occurrenceType: 'folder' },
      { addressPath: 'A.3', parentAddressPath: null, path: 'calculogic-validator/naming-without-context/naming-src', name: 'naming-src', occurrenceType: 'folder' },
    ],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeSemanticNamingFolderTypeRelationshipEvidence: {
      relationshipRecords: [
        { path: 'calculogic-validator/naming/naming-src', relationshipPerspective: 'semantic-qualified-structural-container', relationshipInterpretation: 'semantic-qualified-structural-container-aligned', structuralRole: 'implementation-container', establishedSemanticContext: 'naming', semanticContextEvidenceAddressPath: 'A.naming' },
        { path: 'calculogic-validator/tree/naming-src', relationshipPerspective: 'semantic-qualified-structural-container', relationshipInterpretation: 'semantic-qualified-structural-container-semantic-context-mismatch', structuralRole: 'implementation-container', establishedSemanticContext: 'tree', semanticContextEvidenceAddressPath: 'A.tree' },
        { path: 'calculogic-validator/naming-without-context/naming-src', relationshipPerspective: 'semantic-qualified-structural-container', relationshipInterpretation: 'semantic-qualified-structural-container-context-unresolved', structuralRole: 'implementation-container' },
      ],
    },
    folderKindsRegistry: folderKindsRegistryFixture,
  });

  assert.deepEqual(result.evidenceRecords.map((record) => record.path), ['calculogic-validator/naming/naming-src']);
  assert.equal(result.evidenceRecords[0].folderKind, 'semantic-qualified-structural-container');
  assert.equal(result.evidenceRecords[0].relationshipQualified, true);
  assert.equal(result.evidenceRecords[0].relationshipInterpretation, 'semantic-qualified-structural-container-aligned');
  assert.equal(result.evidenceRecords[0].semanticHome, null);
});


test('skips aligned relationship-qualified folder-kind evidence outside the current addressed scope', () => {
  const result = prepareTreeFolderKindEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A.2', parentAddressPath: null, path: 'calculogic-validator/tree/naming-src', name: 'naming-src', occurrenceType: 'folder' },
    ],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeSemanticNamingFolderTypeRelationshipEvidence: {
      relationshipRecords: [
        { path: 'calculogic-validator/naming/naming-src', relationshipPerspective: 'semantic-qualified-structural-container', relationshipInterpretation: 'semantic-qualified-structural-container-aligned', structuralRole: 'implementation-container', establishedSemanticContext: 'naming', semanticContextEvidenceAddressPath: 'A.naming' },
      ],
    },
    folderKindsRegistry: folderKindsRegistryFixture,
  });

  assert.equal(
    result.evidenceRecords.some((record) => record.path === 'calculogic-validator/naming/naming-src'),
    false,
  );
});


test('does not emit findings/verdict or retired root-classification fields', () => {
  const result = prepareTreeFolderKindEvidence({
    addressedOccurrenceRecords: [{ addressPath: 'A', parentAddressPath: null, path: 'src', name: 'src', occurrenceType: 'folder' }],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [{ path: 'src', structuralHome: 'src' }] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [] },
    folderKindsRegistry: folderKindsRegistryFixture,
  });

  const forbiddenKeys = [
    'finding',
    'findingCode',
    'severity',
    'verdict',
    'placementVerdict',
    'advisorDecision',
    'isRepoShapeAllowedTopLevelDirectory',
    'isStructuralRoot',
    'isSemanticRoot',
    'structuralClass',
    'structuralKind',
  ];

  for (const forbiddenKey of forbiddenKeys) {
    assert.equal(Object.hasOwn(result.evidenceRecords[0], forbiddenKey), false);
  }
});

test('skips unlinked evidence and handles empty input safely without basename inference', () => {
  const result = prepareTreeFolderKindEvidence({
    addressedOccurrenceRecords: [
      { addressPath: 'A', parentAddressPath: null, path: 'src/semantic', name: 'semantic', occurrenceType: 'folder' },
    ],
    treeStructuralHomeEvidence: { source: 'x', evidenceRecords: [] },
    treeSemanticHomeEvidence: { source: 'x', evidenceRecords: [] },
    folderKindsRegistry: {
      version: '1',
      folderKinds: [
        { folderKind: 'structural', status: 'active' },
        { folderKind: 'semantic', status: 'active' },
      ],
    },
  });

  assert.deepEqual(result, { source: 'tree-folder-kind-evidence', evidenceRecords: [] });
});

test('rejects invalid input deterministically', () => {
  assert.throws(() => prepareTreeFolderKindEvidence(), /input must be an object/u);
  assert.throws(
    () => prepareTreeFolderKindEvidence({ addressedOccurrenceRecords: [] }),
    /must include folderKindsRegistry object/u,
  );
  assert.throws(
    () => prepareTreeFolderKindEvidence({
      addressedOccurrenceRecords: [],
      folderKindsRegistry: { folderKinds: [] },
      treeStructuralHomeEvidence: { evidenceRecords: [] },
    }),
    /must include treeSemanticHomeEvidence object/u,
  );
});
