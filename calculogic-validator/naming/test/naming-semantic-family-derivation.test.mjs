import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveSemanticFamilyDetails,
  attachRelatedSemanticNames,
  isSemanticFamilyEvidenceFinding,
} from '../src/rules/naming-rule-derive-semantic-family.logic.mjs';
import { summarizeFindings } from '../src/naming-validator.host.mjs';

test('derives bounded semantic-family details for supported list-like semantic-name shapes', () => {
  assert.deepEqual(deriveSemanticFamilyDetails({ semanticName: 'order-payment-refund-reconcile' }), {
    semanticTokens: ['order', 'payment', 'refund', 'reconcile'],
    semanticFamily: 'order-payment',
    familyRoot: 'order',
    familySubgroup: 'payment-refund',
    ambiguityFlags: ['family-boundary-heuristic'],
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

test('semantic-family evidence gate only accepts canonical findings with complete derived signals', () => {
  assert.equal(
    isSemanticFamilyEvidenceFinding({
      classification: 'canonical',
      details: {
        semanticName: 'naming-role-index',
        semanticFamily: 'naming',
        familyRoot: 'naming',
      },
    }),
    true,
  );

  assert.equal(
    isSemanticFamilyEvidenceFinding({
      classification: 'invalid-ambiguous',
      details: {
        semanticName: 'naming-role-index',
        semanticFamily: 'naming',
        familyRoot: 'naming',
      },
    }),
    false,
  );
});

test('attaches same-family peer names only for canonical semantic-family evidence', () => {
  const findings = attachRelatedSemanticNames([
    {
      classification: 'canonical',
      path: 'a',
      details: {
        semanticName: 'naming-role-index',
        semanticFamily: 'naming',
        familyRoot: 'naming',
      },
    },
    {
      classification: 'canonical',
      path: 'b',
      details: {
        semanticName: 'naming-role-matrix',
        semanticFamily: 'naming',
        familyRoot: 'naming',
      },
    },
    {
      classification: 'invalid-ambiguous',
      path: 'c',
      details: {
        semanticName: 'naming-role-bad-case',
        semanticFamily: 'naming',
        familyRoot: 'naming',
      },
    },
    {
      classification: 'canonical',
      path: 'd',
      details: {
        semanticName: 'tree-occurrence-model-and-addressing',
        semanticFamily: 'tree',
        familyRoot: 'tree',
      },
    },
  ]);

  assert.deepEqual(findings[0].details.relatedSemanticNames, ['naming-role-matrix']);
  assert.deepEqual(findings[1].details.relatedSemanticNames, ['naming-role-index']);
  assert.equal(findings[2].details.relatedSemanticNames, undefined);
  assert.equal(findings[3].details.relatedSemanticNames, undefined);
});

test('adds split-family markers when one root maps to multiple observed families', () => {
  const findings = attachRelatedSemanticNames([
    {
      classification: 'canonical',
      path: 'a',
      details: {
        semanticName: 'order-payment-refund-reconcile',
        semanticFamily: 'order-payment',
        familyRoot: 'order',
      },
    },
    {
      classification: 'canonical',
      path: 'b',
      details: {
        semanticName: 'order-shipping-tracker-sync',
        semanticFamily: 'order-shipping',
        familyRoot: 'order',
      },
    },
    {
      classification: 'canonical',
      path: 'c',
      details: {
        semanticName: 'tree-occurrence-model-and-addressing',
        semanticFamily: 'tree',
        familyRoot: 'tree',
      },
    },
  ]);

  assert.deepEqual(findings[0].details.splitFamilyFlags, ['family-root-observed-multiple-families']);
  assert.deepEqual(findings[1].details.splitFamilyFlags, ['family-root-observed-multiple-families']);
  assert.equal(findings[2].details.splitFamilyFlags, undefined);
});

test('summary emits deterministic semantic-family observation counts from canonical evidence only', () => {
  const summary = summarizeFindings([
    {
      classification: 'canonical',
      code: 'NAMING_CANONICAL',
      severity: 'info',
      details: {
        semanticName: 'tree-occurrence-model-and-addressing',
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
        semanticName: 'naming-role-index',
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
        semanticName: 'naming-role-matrix',
        familyRoot: 'naming',
        familySubgroup: 'role-matrix',
        semanticFamily: 'naming',
      },
    },
    {
      classification: 'invalid-ambiguous',
      code: 'NAMING_BAD_SEMANTIC_CASE',
      severity: 'warn',
      details: {
        semanticName: 'Naming-Role-Matrix',
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
