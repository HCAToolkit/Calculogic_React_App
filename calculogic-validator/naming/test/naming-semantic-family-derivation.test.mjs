import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveSemanticFamilyDetails,
  attachRelatedSemanticNames,
  isSemanticFamilyEvidenceFinding,
  isSemanticFamilyRootEvidenceFinding,
  isSingularSemanticFamilyEvidenceFinding,
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

test('semantic-family evidence gates distinguish root evidence from singular family evidence', () => {
  const canonicalAmbiguousFinding = {
    classification: 'canonical',
    details: {
      semanticName: 'order-payment-refund-reconcile',
      semanticFamily: 'order-payment',
      familyRoot: 'order',
      ambiguityFlags: ['family-boundary-heuristic'],
    },
  };

  assert.equal(isSemanticFamilyEvidenceFinding(canonicalAmbiguousFinding), true);
  assert.equal(isSemanticFamilyRootEvidenceFinding(canonicalAmbiguousFinding), true);
  assert.equal(isSingularSemanticFamilyEvidenceFinding(canonicalAmbiguousFinding), false);

  assert.equal(
    isSemanticFamilyRootEvidenceFinding({
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

test('attaches same-family peer names only for singular canonical semantic-family evidence', () => {
  const findings = attachRelatedSemanticNames([
    {
      classification: 'canonical',
      path: 'a',
      details: {
        semanticName: 'naming-role-matrix',
        semanticFamily: 'naming',
        familyRoot: 'naming',
      },
    },
    {
      classification: 'canonical',
      path: 'b',
      details: {
        semanticName: 'naming-role-index',
        semanticFamily: 'naming',
        familyRoot: 'naming',
      },
    },
    {
      classification: 'canonical',
      path: 'c',
      details: {
        semanticName: 'order-payment-refund-reconcile',
        semanticFamily: 'order-payment',
        familyRoot: 'order',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
    },
    {
      classification: 'invalid-ambiguous',
      path: 'd',
      details: {
        semanticName: 'naming-role-bad-case',
        semanticFamily: 'naming',
        familyRoot: 'naming',
      },
    },
    {
      classification: 'canonical',
      path: 'e',
      details: {
        semanticName: 'tree-occurrence-model-and-addressing',
        semanticFamily: 'tree',
        familyRoot: 'tree',
      },
    },
  ]);

  assert.deepEqual(findings[0].details.relatedSemanticNames, ['naming-role-index']);
  assert.deepEqual(findings[1].details.relatedSemanticNames, ['naming-role-matrix']);
  assert.equal(findings[2].details.relatedSemanticNames, undefined);
  assert.equal(findings[3].details.relatedSemanticNames, undefined);
  assert.equal(findings[4].details.relatedSemanticNames, undefined);
});

test('adds split-family markers only when singular observed families share one root', () => {
  const findings = attachRelatedSemanticNames([
    {
      classification: 'canonical',
      path: 'a',
      details: {
        semanticName: 'order-payment-index',
        semanticFamily: 'order',
        familyRoot: 'order',
      },
    },
    {
      classification: 'canonical',
      path: 'b',
      details: {
        semanticName: 'order-payment-refund-reconcile',
        semanticFamily: 'order-payment',
        familyRoot: 'order',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
    },
    {
      classification: 'canonical',
      path: 'c',
      details: {
        semanticName: 'order-shipping-index',
        semanticFamily: 'order-shipping',
        familyRoot: 'order',
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

  assert.deepEqual(findings[0].details.splitFamilyFlags, ['family-root-observed-multiple-families']);
  assert.equal(findings[1].details.splitFamilyFlags, undefined);
  assert.deepEqual(findings[2].details.splitFamilyFlags, ['family-root-observed-multiple-families']);
  assert.equal(findings[3].details.splitFamilyFlags, undefined);
});

test('summary counts family roots from canonical root evidence but reserves family/subgroup counts for singular evidence', () => {
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
      classification: 'canonical',
      code: 'NAMING_CANONICAL',
      severity: 'info',
      details: {
        semanticName: 'order-payment-refund-reconcile',
        familyRoot: 'order',
        familySubgroup: 'payment-refund',
        semanticFamily: 'order-payment',
        ambiguityFlags: ['family-boundary-heuristic'],
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
    order: 1,
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
