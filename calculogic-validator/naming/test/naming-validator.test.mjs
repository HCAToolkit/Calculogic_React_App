import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  classifyPath,
  parseCanonicalName,
  collectRepositoryPaths,
} from '../src/naming-validator.host.mjs';

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

test('classifies documentation spec role as canonical with role metadata', () => {
  const finding = classifyPath('doc/ConventionRoutines/ccs.spec.md');
  assert.equal(finding.classification, 'canonical');
  assert.equal(finding.code, 'NAMING_CANONICAL');
  assert.equal(finding.details?.roleCategory, 'documentation');
  assert.equal(finding.details?.roleStatus, 'active');
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

test('classifies ecosystem-required special case with subtype', () => {
  const finding = classifyPath('vite.config.ts');
  assert.equal(finding.classification, 'allowed-special-case');
  assert.equal(finding.code, 'NAMING_ALLOWED_SPECIAL_CASE');
  assert.equal(finding.details?.specialCaseType, 'ecosystem-required');
});

test('classifies barrel special case with subtype', () => {
  const finding = classifyPath('src/tabs/build/index.ts');
  assert.equal(finding.classification, 'allowed-special-case');
  assert.equal(finding.code, 'NAMING_ALLOWED_SPECIAL_CASE');
  assert.equal(finding.details?.specialCaseType, 'barrel');
});

test('classifies test convention special case with subtype', () => {
  const finding = classifyPath('test/content-provider-registry.test.mjs');
  assert.equal(finding.classification, 'allowed-special-case');
  assert.equal(finding.code, 'NAMING_ALLOWED_SPECIAL_CASE');
  assert.equal(finding.details?.specialCaseType, 'test-convention');
});

test('classifies spec test convention file with code extension as special case', () => {
  const finding = classifyPath('test/content-provider-registry.spec.ts');
  assert.equal(finding.classification, 'allowed-special-case');
  assert.equal(finding.code, 'NAMING_ALLOWED_SPECIAL_CASE');
  assert.equal(finding.details?.specialCaseType, 'test-convention');
});

test('classifies deprecated role usage as invalid-ambiguous with metadata', () => {
  const finding = classifyPath('src/tabs/build/BuildSurface.view.css');
  assert.equal(finding.classification, 'invalid-ambiguous');
  assert.equal(finding.code, 'NAMING_DEPRECATED_ROLE');
  assert.equal(finding.details?.roleStatus, 'deprecated');
  assert.equal(finding.details?.roleCategory, 'deprecated');
});

test('classifies README as conventional-doc special case', () => {
  const finding = classifyPath('README.md');
  assert.equal(finding.classification, 'allowed-special-case');
  assert.equal(finding.code, 'NAMING_ALLOWED_SPECIAL_CASE');
  assert.equal(finding.details?.specialCaseType, 'conventional-doc');
});

test('classifies missing-role teaching case for non-canonical two-segment names', () => {
  const finding = classifyPath('src/App.tsx');
  assert.equal(finding.classification, 'legacy-exception');
  assert.equal(finding.code, 'NAMING_MISSING_ROLE');
});

test('repo scope includes docs + src + root config examples', () => {
  const paths = collectRepositoryPaths(process.cwd(), { scope: 'repo' });
  assert.ok(paths.includes('calculogic-validator/naming/src/naming-validator.host.mjs'));
  assert.ok(paths.includes('calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md'));
  assert.ok(paths.includes('package.json'));
});


test('repo scope keeps package root-file adjunct reportability for package manifests', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-reportable-root-files-'));

  try {
    fs.writeFileSync(path.join(tempRoot, 'package.json'), '{}');
    fs.writeFileSync(path.join(tempRoot, 'package-lock.json'), '{}');
    fs.writeFileSync(path.join(tempRoot, 'pnpm-lock.yaml'), 'lockfileVersion: 9');

    const paths = collectRepositoryPaths(tempRoot, { scope: 'repo' });

    assert.equal(paths.includes('package.json'), true);
    assert.equal(paths.includes('package-lock.json'), true);
    assert.equal(paths.includes('pnpm-lock.yaml'), false);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('app scope includes only src/test and excludes docs, validator, and system root files', () => {
  const paths = collectRepositoryPaths(process.cwd(), { scope: 'app' });
  assert.ok(paths.some((p) => p.startsWith('src/')));
  assert.ok(paths.some((p) => p.startsWith('test/')));
  assert.equal(
    paths.some((p) => p.startsWith('doc/')),
    false,
  );
  assert.equal(
    paths.some((p) => p.startsWith('docs/')),
    false,
  );
  assert.equal(
    paths.some((p) => p.startsWith('calculogic-validator/')),
    false,
  );
  assert.equal(paths.includes('package.json'), false);
});

test('docs scope includes doc/docs and excludes src', () => {
  const paths = collectRepositoryPaths(process.cwd(), { scope: 'docs' });
  assert.equal(
    paths.some((p) => p.startsWith('src/')),
    false,
  );
  assert.equal(
    paths.some((p) => p.startsWith('calculogic-validator/')),
    false,
  );
});

test('scope filtering output order is deterministic', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-scope-order-'));
  try {
    fs.mkdirSync(path.join(tempRoot, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tempRoot, 'test'), { recursive: true });
    fs.mkdirSync(path.join(tempRoot, 'doc'), { recursive: true });

    fs.writeFileSync(path.join(tempRoot, 'src', 'z-last.logic.ts'), '');
    fs.writeFileSync(path.join(tempRoot, 'src', 'a-first.logic.ts'), '');
    fs.writeFileSync(path.join(tempRoot, 'test', 'c-mid.test.mjs'), '');
    fs.writeFileSync(path.join(tempRoot, 'doc', 'b-guide.md'), '');
    fs.writeFileSync(path.join(tempRoot, 'package.json'), '{}');

    const first = collectRepositoryPaths(tempRoot, { scope: 'app' });
    const second = collectRepositoryPaths(tempRoot, { scope: 'app' });

    assert.deepEqual(first, second);
    assert.deepEqual(
      first,
      [...first].sort((a, b) => a.localeCompare(b)),
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('invalid CLI scope returns deterministic usage error and non-zero exit', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--experimental-strip-types',
      'calculogic-validator/scripts/validate-naming.mjs',
      '--scope=invalid-scope',
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid scope: invalid-scope/u);
  assert.match(result.stderr, /Usage: npm run validate:naming/u);
});
