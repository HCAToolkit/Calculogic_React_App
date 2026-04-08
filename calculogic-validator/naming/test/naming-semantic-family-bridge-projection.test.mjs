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
