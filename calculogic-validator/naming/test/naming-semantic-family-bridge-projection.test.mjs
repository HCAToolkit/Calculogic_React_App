import test from 'node:test';
import assert from 'node:assert/strict';
import { projectNamingSemanticFamilyBridge } from '../src/naming-validator.host.mjs';

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
