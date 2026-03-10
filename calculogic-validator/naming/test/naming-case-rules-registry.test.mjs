import test from 'node:test';
import assert from 'node:assert/strict';
import caseRulesRegistry from '../src/registries/_builtin/case-rules.registry.json' with { type: 'json' };
import { resolveNamingRegistryInputs } from '../src/registries/registry-state.logic.mjs';
import { toCaseRulesRuntime } from '../src/naming-runtime-converters.logic.mjs';
import { getSemanticNameCaseRule } from '../src/rules/naming-rule-check-semantic-case.logic.mjs';
import { isCanonicalSemanticName } from '../src/rules/naming-rule-check-semantic-case.logic.mjs';

const getPreparedCaseRulesRuntime = () => {
  const registryInputs = resolveNamingRegistryInputs({ config: {} });
  return toCaseRulesRuntime(registryInputs.caseRules);
};

test('semantic-name case rule runtime is sourced from builtin registry style', () => {
  const semanticCaseRule = getSemanticNameCaseRule(getPreparedCaseRulesRuntime());

  assert.equal(semanticCaseRule.style, caseRulesRegistry.semanticName.style);
  assert.equal(semanticCaseRule.style, 'kebab-case');
  assert.equal(semanticCaseRule.pattern.test('left-panel'), true);
  assert.equal(semanticCaseRule.pattern.test('leftPanel'), false);
});

test('kebab-case semantic names are canonical', () => {
  const caseRulesRuntime = getPreparedCaseRulesRuntime();
  assert.equal(isCanonicalSemanticName('leftpanel', caseRulesRuntime), true);
  assert.equal(isCanonicalSemanticName('left-panel', caseRulesRuntime), true);
  assert.equal(isCanonicalSemanticName('left-panel-v2', caseRulesRuntime), true);
  assert.equal(isCanonicalSemanticName('v2-left-panel', caseRulesRuntime), true);
});

test('non-kebab semantic names are non-canonical', () => {
  const caseRulesRuntime = getPreparedCaseRulesRuntime();
  assert.equal(isCanonicalSemanticName('LeftPanel', caseRulesRuntime), false);
  assert.equal(isCanonicalSemanticName('leftPanel', caseRulesRuntime), false);
  assert.equal(isCanonicalSemanticName('left_panel', caseRulesRuntime), false);
  assert.equal(isCanonicalSemanticName('left..panel', caseRulesRuntime), false);
  assert.equal(isCanonicalSemanticName('left--panel', caseRulesRuntime), false);
});
