import test from 'node:test';
import assert from 'node:assert/strict';
import caseRulesRegistry from '../src/naming/registries/_builtin/case-rules.registry.json' with { type: 'json' };
import { getSemanticNameCaseRule } from '../src/naming/rules/naming-rule-check-semantic-case.logic.mjs';
import { isCanonicalSemanticName } from '../src/naming/rules/naming-rule-check-semantic-case.logic.mjs';

test('semantic-name case rule runtime is sourced from builtin registry style', () => {
  const semanticCaseRule = getSemanticNameCaseRule();

  assert.equal(semanticCaseRule.style, caseRulesRegistry.semanticName.style);
  assert.equal(semanticCaseRule.style, 'kebab-case');
  assert.equal(semanticCaseRule.pattern.test('left-panel'), true);
  assert.equal(semanticCaseRule.pattern.test('leftPanel'), false);
});

test('kebab-case semantic names are canonical', () => {
  assert.equal(isCanonicalSemanticName('leftpanel'), true);
  assert.equal(isCanonicalSemanticName('left-panel'), true);
  assert.equal(isCanonicalSemanticName('left-panel-v2'), true);
  assert.equal(isCanonicalSemanticName('v2-left-panel'), true);
});

test('non-kebab semantic names are non-canonical', () => {
  assert.equal(isCanonicalSemanticName('LeftPanel'), false);
  assert.equal(isCanonicalSemanticName('leftPanel'), false);
  assert.equal(isCanonicalSemanticName('left_panel'), false);
  assert.equal(isCanonicalSemanticName('left..panel'), false);
  assert.equal(isCanonicalSemanticName('left--panel'), false);
});
