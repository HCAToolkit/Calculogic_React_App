import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  collectRepositoryPaths,
  getScopeProfile,
  listNamingValidatorScopes,
} from '../src/validators/naming-validator.logic.mjs';

const runValidatorCli = args =>
  spawnSync(process.execPath, ['--experimental-strip-types', 'calculogic-validator/scripts/validate-naming.mjs', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

test('scope registry exposes deterministic supported scopes', () => {
  assert.deepEqual(listNamingValidatorScopes(), ['app', 'docs', 'repo']);
});

test('default/no-scope behavior resolves to repo', () => {
  const implicit = collectRepositoryPaths(process.cwd());
  const explicit = collectRepositoryPaths(process.cwd(), { scope: 'repo' });
  assert.deepEqual(implicit, explicit);
});

test('--scope=repo aligns with repo contract roots', () => {
  const repoPaths = collectRepositoryPaths(process.cwd(), { scope: 'repo' });
  assert.ok(repoPaths.includes('calculogic-validator/src/validators/naming-validator.logic.mjs'));
  assert.ok(repoPaths.includes('doc/ConventionRoutines/NamingValidatorSpec.md'));
  assert.ok(repoPaths.includes('README.md'));
});

test('--scope=docs includes doc/**, docs/**, and root README.md only from root conventional docs set', () => {
  const docsPaths = collectRepositoryPaths(process.cwd(), { scope: 'docs' });
  assert.ok(docsPaths.includes('doc/ConventionRoutines/NamingValidatorSpec.md'));
  assert.ok(docsPaths.includes('README.md'));
  assert.equal(docsPaths.some(pathname => pathname.startsWith('src/')), false);
  assert.equal(docsPaths.some(pathname => pathname === 'package.json'), false);
});

test('--scope=app excludes doc/docs folders while including app roots and root tooling files', () => {
  const appPaths = collectRepositoryPaths(process.cwd(), { scope: 'app' });
  assert.ok(appPaths.includes('calculogic-validator/src/validators/naming-validator.logic.mjs'));
  assert.ok(appPaths.includes('calculogic-validator/test/naming-validator.test.mjs'));
  assert.ok(appPaths.includes('calculogic-validator/scripts/validate-naming.mjs'));
  assert.ok(appPaths.includes('package.json'));
  assert.equal(appPaths.some(pathname => pathname.startsWith('doc/')), false);
  assert.equal(appPaths.some(pathname => pathname.startsWith('docs/')), false);
});

test('docs scope profile explicitly declares root conventional docs inclusion contract', () => {
  const profile = getScopeProfile('docs');
  assert.deepEqual(profile, {
    description: 'Documentation-focused scan (doc/docs and root conventional docs: README.md).',
    includeRoots: ['doc', 'docs'],
    includeRootFiles: ['README.md'],
  });
});


test('scoped path sets diverge by contract (docs excludes app roots and app excludes docs roots)', () => {
  const appPaths = collectRepositoryPaths(process.cwd(), { scope: 'app' });
  const docsPaths = collectRepositoryPaths(process.cwd(), { scope: 'docs' });
  const repoPaths = collectRepositoryPaths(process.cwd(), { scope: 'repo' });

  assert.notDeepEqual(appPaths, docsPaths);
  assert.ok(repoPaths.length >= appPaths.length);
  assert.ok(repoPaths.length >= docsPaths.length);
  assert.equal(docsPaths.some(pathname => pathname.startsWith('src/')), false);
  assert.equal(docsPaths.some(pathname => pathname.startsWith('test/')), false);
  assert.equal(docsPaths.some(pathname => pathname.startsWith('scripts/')), false);
  assert.equal(appPaths.some(pathname => pathname.startsWith('doc/')), false);
  assert.equal(appPaths.some(pathname => pathname.startsWith('docs/')), false);
});

test('invalid scope handling is deterministic (usage error + non-zero exit)', () => {
  const result = runValidatorCli(['--scope=not-a-scope']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid scope: not-a-scope/u);
  assert.match(result.stderr, /Usage: npm run validate:naming -- --scope=<repo\|app\|docs>/u);
});

test('CLI default scope report is repo', () => {
  const result = runValidatorCli([]);
  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.scope, 'repo');
});

test('CLI explicit scope reports selected scope and scope summary metadata', () => {
  const result = runValidatorCli(['--scope=docs']);
  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.scope, 'docs');
  assert.deepEqual(report.scopeContract.includeRoots, ['doc', 'docs']);
  assert.deepEqual(report.scopeContract.includeRootFiles, ['README.md']);
  assert.equal(report.scopeSummary.scope, 'docs');
  assert.equal(report.scopeSummary.reportableFilesInScope, report.totalFilesScanned);
  assert.equal(report.scopeSummary.findingsGenerated, report.findings.length);
});
