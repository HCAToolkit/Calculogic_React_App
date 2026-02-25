import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyPath, parseCanonicalName } from '../src/validators/naming-validator.logic.mjs';

test('parse canonical filename with simple extension', () => {
  assert.deepEqual(parseCanonicalName('leftpanel.host.tsx'), {
    semanticName: 'leftpanel',
    role: 'host',
    extension: 'tsx',
  });
});

test('parse canonical filename with module css extension', () => {
  assert.deepEqual(parseCanonicalName('buildsurface.build-style.module.css'), {
    semanticName: 'buildsurface',
    role: 'build-style',
    extension: 'module.css',
  });
});

test('returns null for invalid pattern with insufficient segments', () => {
  assert.equal(parseCanonicalName('helpers.ts'), null);
});

test('classifies canonical valid example', () => {
  const finding = classifyPath('src/rightpanel.results-style.css');
  assert.equal(finding.classification, 'canonical');
  assert.equal(finding.code, 'NAMING_CANONICAL');
});

test('classifies unknown role as invalid-ambiguous', () => {
  const finding = classifyPath('src/rightpanel.widget.ts');
  assert.equal(finding.classification, 'invalid-ambiguous');
  assert.equal(finding.code, 'NAMING_UNKNOWN_ROLE');
});

test('classifies semantic-name casing violation as invalid-ambiguous', () => {
  const finding = classifyPath('src/RightPanel.logic.ts');
  assert.equal(finding.classification, 'invalid-ambiguous');
  assert.equal(finding.code, 'NAMING_BAD_SEMANTIC_CASE');
});

test('classifies hyphen-appended role ambiguity as invalid-ambiguous', () => {
  const finding = classifyPath('src/leftpanel-selector-wiring.ts');
  assert.equal(finding.classification, 'invalid-ambiguous');
  assert.equal(finding.code, 'NAMING_ROLE_HYPHEN_AMBIGUITY');
});

test('classifies allowed special case for test files', () => {
  const finding = classifyPath('test/content-provider-registry.test.mjs');
  assert.equal(finding.classification, 'allowed-special-case');
  assert.equal(finding.code, 'NAMING_ALLOWED_SPECIAL_CASE');
});

test('classifies legacy exceptions for non-canonical legacy names', () => {
  const finding = classifyPath('src/App.tsx');
  assert.equal(finding.classification, 'legacy-exception');
  assert.equal(finding.code, 'NAMING_LEGACY_EXCEPTION');
});
