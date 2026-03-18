import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveSemanticFamilyDetails,
  attachRelatedSemanticNames,
} from '../src/rules/naming-rule-derive-semantic-family.logic.mjs';
import { summarizeFindings } from '../src/naming-validator.host.mjs';

test('derives bounded semantic-family details for supported list-like semantic-name shapes', () => {
  assert.deepEqual(deriveSemanticFamilyDetails({ semanticName: 'order-payment-refund-reconcile' }), {
    semanticTokens: ['order', 'payment', 'refund', 'reconcile'],
    semanticFamily: 'order-payment',
    familyRoot: 'order',
    familySubgroup: 'payment-refund',
  });
});

test('derives connector-aware subgroup details without promoting connectors to family roots', () => {
  assert.deepEqual(
    deriveSemanticFamilyDetails({ semanticName: 'tree-occurrence-model-and-addressing' }),
    {
      semanticTokens: ['tree', 'occurrence', 'model', 'and', 'addressing'],
      semanticFamily: 'tree',
      familyRoot: 'tree',
      familySubgroup: 'occurrence-model-and-addressing',
    },
  );
});

test('derives bounded subgroup details for shorter supported semantic-name shapes', () => {
  assert.deepEqual(deriveSemanticFamilyDetails({ semanticName: 'naming-role-index' }), {
    semanticTokens: ['naming', 'role', 'index'],
    semanticFamily: 'naming',
    familyRoot: 'naming',
    familySubgroup: 'role-index',
  });
});

test('does not derive semantic-family details for unsupported single-token semantic-name shapes', () => {
  assert.equal(deriveSemanticFamilyDetails({ semanticName: 'tree' }), null);
});

test('attaches related semantic names by observed semantic-family clusters only', () => {
  const findings = attachRelatedSemanticNames([
    {
      path: 'a',
      details: {
        semanticName: 'naming-role-index',
        semanticFamily: 'naming',
      },
    },
    {
      path: 'b',
      details: {
        semanticName: 'naming-role-matrix',
        semanticFamily: 'naming',
      },
    },
    {
      path: 'c',
      details: {
        semanticName: 'tree-occurrence-model-and-addressing',
        semanticFamily: 'tree',
      },
    },
  ]);

  assert.deepEqual(findings[0].details.relatedSemanticNames, ['naming-role-matrix']);
  assert.deepEqual(findings[1].details.relatedSemanticNames, ['naming-role-index']);
  assert.equal(findings[2].details.relatedSemanticNames, undefined);
});

test('summary emits deterministic semantic-family observation counts from derived details', () => {
  const summary = summarizeFindings([
    {
      classification: 'canonical',
      code: 'NAMING_CANONICAL',
      severity: 'info',
      details: {
        familyRoot: 'tree',
        familySubgroup: 'occurrence-model-and-addressing',
        semanticFamily: 'tree',
      },
    },
    {
      classification: 'canonical',
      code: 'NAMING_CANONICAL',
      severity: 'info',
      details: {
        familyRoot: 'naming',
        familySubgroup: 'role-index',
        semanticFamily: 'naming',
      },
    },
    {
      classification: 'canonical',
      code: 'NAMING_CANONICAL',
      severity: 'info',
      details: {
        familyRoot: 'naming',
        familySubgroup: 'role-matrix',
        semanticFamily: 'naming',
      },
    },
  ]);

  assert.deepEqual(summary.familyRootCounts, {
    naming: 2,
    tree: 1,
  });
  assert.deepEqual(summary.familySubgroupCounts, {
    'occurrence-model-and-addressing': 1,
    'role-index': 1,
    'role-matrix': 1,
  });
  assert.deepEqual(summary.semanticFamilyCounts, {
    naming: 2,
    tree: 1,
  });
});
