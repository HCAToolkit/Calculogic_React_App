import test from 'node:test';
import assert from 'node:assert/strict';
import { projectNamingSemanticFamilyBridge } from '../src/naming-validator.host.mjs';
import { projectNamingFolderCompositionBridge } from '../src/naming-folder-composition-projection.logic.mjs';

test('naming bridge projection emits bounded semantic-family observation fields only', () => {
  const projected = projectNamingSemanticFamilyBridge({
    findings: [
      {
        path: 'src/a/build-surface.logic.ts',
        classification: 'canonical',
        details: {
          semanticName: 'build-surface',
          familyRoot: 'build',
          semanticFamily: 'build-surface',
          familySubgroup: 'surface',
          ambiguityFlags: ['family-boundary-heuristic', 'family-boundary-heuristic'],
          splitFamilyFlags: ['family-root-observed-multiple-families'],
          unrelatedRuntimeField: 'must-not-leak',
        },
        unrelatedFindingField: 'must-not-leak',
      },
      {
        path: 'src/b/non-canonical.logic.ts',
        classification: 'invalid-legacy',
        details: {
          semanticName: 'non-canonical',
          familyRoot: 'non',
          semanticFamily: 'non-canonical',
        },
      },
    ],
  });

  assert.deepEqual(projected, {
    observations: [
      {
        path: 'src/a/build-surface.logic.ts',
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
        familySubgroup: 'surface',
        ambiguityFlags: ['family-boundary-heuristic'],
        splitFamilyFlags: ['family-root-observed-multiple-families'],
      },
    ],
  });
});

test('naming bridge projection tolerates missing findings arrays with empty observations', () => {
  assert.deepEqual(projectNamingSemanticFamilyBridge({}), { observations: [] });
});

test('naming bridge projection emits package-root folder semantic-family-root observations', () => {
  const projected = projectNamingSemanticFamilyBridge({
    findings: [
      {
        code: 'NAMING_ALLOWED_SPECIAL_CASE',
        severity: 'info',
        path: 'calculogic-validator/package.json',
        classification: 'allowed-special-case',
        details: { specialCaseType: 'ecosystem-required' },
      },
      {
        code: 'NAMING_ALLOWED_SPECIAL_CASE',
        severity: 'info',
        path: 'package.json',
        classification: 'allowed-special-case',
        details: { specialCaseType: 'ecosystem-required' },
      },
    ],
  });

  assert.deepEqual(projected.observations, [
    {
      path: 'calculogic-validator',
      repoRelativePath: 'calculogic-validator',
      occurrenceType: 'folder',
      semanticName: 'calculogic-validator',
      familyRoot: 'calculogic',
      semanticFamily: 'calculogic-validator',
      semanticEvidenceKind: 'semantic-family-root-folder',
      familyRootQualification: 'package-root-folder',
      evidenceSource: 'naming-semantic-family-bridge-projection',
      evidenceProvenance: {
        sourceFindingCode: 'NAMING_ALLOWED_SPECIAL_CASE',
        sourceFindingPath: 'calculogic-validator/package.json',
        sourceSpecialCaseType: 'ecosystem-required',
      },
    },
  ]);
});

test('naming folder-composition bridge emits only explicit folder observations from registry-backed patterns', () => {
  const result = projectNamingFolderCompositionBridge({
    folderOccurrenceRecords: [
      { path: 'calculogic-validator/naming/naming-src', name: 'naming-src', occurrenceType: 'folder' },
      { path: 'calculogic-validator/naming/naming-src.logic.mjs', name: 'naming-src.logic.mjs', occurrenceType: 'file' },
      { path: 'calculogic-validator/naming/tree-src', name: 'tree-src', occurrenceType: 'folder' },
    ],
    folderCompositionPatternsRegistry: {
      folderCompositionPatterns: [{
        patternId: 'semantic-qualified-src-container.v1',
        status: 'active',
        compositionKind: 'semantic-qualified-structural-container',
        semanticQualifier: 'naming',
        structuralRoleToken: 'src',
        tokenOrder: ['semantic-qualifier', 'structural-role-token'],
        folderName: 'naming-src',
        qualification: 'explicit-supported-folder-composition',
        confidence: 'bounded',
      }],
      folderSemanticContextPatterns: [{
        patternId: 'naming-folder-semantic-context.v1',
        status: 'active',
        folderName: 'naming',
        semanticContext: 'naming',
        qualification: 'explicit-supported-folder-semantic-context',
        confidence: 'bounded',
      }],
    },
  });

  assert.deepEqual(
    result.observations.map((observation) => [observation.path, observation.semanticEvidenceKind]),
    [
      ['calculogic-validator/naming/naming-src', 'folder-semantic-structural-composition'],
    ],
  );
  assert.equal(result.observations[0].semanticQualifier, 'naming');
  assert.equal(result.observations[0].structuralRoleToken, 'src');
  assert.equal(result.observations[0].folderCompositionKind, 'semantic-qualified-structural-container');
});

test('naming folder-composition projection emits explicit ancestor semantic-context observations separately from composition observations', () => {
  const result = projectNamingFolderCompositionBridge({
    folderOccurrenceRecords: [
      { path: 'calculogic-validator/naming', name: 'naming', occurrenceType: 'folder' },
      { path: 'calculogic-validator/naming/naming-src', name: 'naming-src', occurrenceType: 'folder' },
    ],
    folderCompositionPatternsRegistry: {
      folderCompositionPatterns: [{
        patternId: 'semantic-qualified-src-container.v1',
        status: 'active',
        compositionKind: 'semantic-qualified-structural-container',
        semanticQualifier: 'naming',
        structuralRoleToken: 'src',
        tokenOrder: ['semantic-qualifier', 'structural-role-token'],
        folderName: 'naming-src',
      }],
      folderSemanticContextPatterns: [{
        patternId: 'naming-folder-semantic-context.v1',
        status: 'active',
        folderName: 'naming',
        semanticContext: 'naming',
        qualification: 'explicit-supported-folder-semantic-context',
        confidence: 'bounded',
      }],
    },
  });

  assert.deepEqual(
    result.observations.map((observation) => [observation.path, observation.semanticEvidenceKind, observation.semanticContext ?? observation.semanticQualifier]),
    [
      ['calculogic-validator/naming', 'folder-semantic-context', 'naming'],
      ['calculogic-validator/naming/naming-src', 'folder-semantic-structural-composition', 'naming'],
    ],
  );
});
