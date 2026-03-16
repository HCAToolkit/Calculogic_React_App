import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyPath } from '../src/naming-validator.host.mjs';

test('classifies two-segment reportable filename as missing role', () => {
  const finding = classifyPath('src/App.tsx');
  assert.equal(finding.code, 'NAMING_MISSING_ROLE');
  assert.equal(finding.classification, 'legacy-exception');
  assert.equal(finding.severity, 'info');
});

test('keeps hyphen-appended role ambiguity precedence', () => {
  const finding = classifyPath('src/leftpanel-wiring.ts');
  assert.equal(finding.code, 'NAMING_ROLE_HYPHEN_AMBIGUITY');
});

test('classifies module.css two-part semantic pattern as missing role', () => {
  const finding = classifyPath('src/buildsurface.module.css');
  assert.equal(finding.code, 'NAMING_MISSING_ROLE');
  assert.equal(finding.details?.extension, 'module.css');
});

test('preserves allowed special-case behavior', () => {
  const finding = classifyPath('README.md');
  assert.equal(finding.code, 'NAMING_ALLOWED_SPECIAL_CASE');
});
