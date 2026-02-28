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
  assert.deepEqual(listNamingValidatorScopes(), ['app', 'docs', 'repo', 'system', 'validator']);
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

test('--scope=app includes src/test and excludes docs, validator, and root tooling files', () => {
  const appPaths = collectRepositoryPaths(process.cwd(), { scope: 'app' });
  assert.ok(appPaths.some(pathname => pathname.startsWith('src/')));
  assert.ok(appPaths.some(pathname => pathname.startsWith('test/')));
  assert.equal(appPaths.some(pathname => pathname.startsWith('doc/')), false);
  assert.equal(appPaths.some(pathname => pathname.startsWith('docs/')), false);
  assert.equal(appPaths.some(pathname => pathname.startsWith('calculogic-validator/')), false);
  assert.equal(appPaths.includes('package.json'), false);
});

test('--scope=validator includes calculogic-validator only and excludes app/docs/system files', () => {
  const validatorPaths = collectRepositoryPaths(process.cwd(), { scope: 'validator' });
  assert.ok(validatorPaths.includes('calculogic-validator/scripts/validate-naming.mjs'));
  assert.ok(validatorPaths.some(pathname => pathname.startsWith('calculogic-validator/src/')));
  assert.ok(validatorPaths.some(pathname => pathname.startsWith('calculogic-validator/test/')));
  assert.equal(validatorPaths.some(pathname => pathname.startsWith('src/')), false);
  assert.equal(validatorPaths.some(pathname => pathname.startsWith('doc/')), false);
  assert.equal(validatorPaths.some(pathname => pathname.startsWith('docs/')), false);
  assert.equal(validatorPaths.includes('package.json'), false);
});

test('--scope=system includes root tooling files only and excludes all folders', () => {
  const systemPaths = collectRepositoryPaths(process.cwd(), { scope: 'system' });
  assert.ok(systemPaths.includes('package.json'));
  assert.ok(systemPaths.includes('tsconfig.json'));
  assert.equal(systemPaths.some(pathname => pathname.startsWith('src/')), false);
  assert.equal(systemPaths.some(pathname => pathname.startsWith('test/')), false);
  assert.equal(systemPaths.some(pathname => pathname.startsWith('doc/')), false);
  assert.equal(systemPaths.some(pathname => pathname.startsWith('docs/')), false);
  assert.equal(systemPaths.some(pathname => pathname.startsWith('calculogic-validator/')), false);
  assert.equal(systemPaths.some(pathname => pathname.includes('/')), false);
});

test('docs scope profile explicitly declares root conventional docs inclusion contract', () => {
  const profile = getScopeProfile('docs');
  assert.deepEqual(profile, {
    description: 'Documentation-focused scan (doc/docs and root conventional docs: README.md).',
    includeRoots: ['doc', 'docs'],
    includeRootFiles: ['README.md'],
  });
});

test('scoped path sets diverge by contract', () => {
  const appPaths = collectRepositoryPaths(process.cwd(), { scope: 'app' });
  const docsPaths = collectRepositoryPaths(process.cwd(), { scope: 'docs' });
  const validatorPaths = collectRepositoryPaths(process.cwd(), { scope: 'validator' });
  const systemPaths = collectRepositoryPaths(process.cwd(), { scope: 'system' });

  assert.notDeepEqual(appPaths, docsPaths);
  assert.notDeepEqual(validatorPaths, appPaths);
  assert.notDeepEqual(validatorPaths, docsPaths);
  assert.notDeepEqual(validatorPaths, systemPaths);
  assert.equal(systemPaths.some(pathname => pathname.includes('/')), false);
});

test('invalid scope handling is deterministic (usage error + non-zero exit)', () => {
  const result = runValidatorCli(['--scope=not-a-scope']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid scope: not-a-scope/u);
  assert.match(result.stderr, /Usage: npm run validate:naming/u);
});

test('CLI default scope report is repo', () => {
  const result = runValidatorCli([]);
  assert.ok([0, 1, 2].includes(result.status));
  const report = JSON.parse(result.stdout);
  assert.equal(report.scope, 'repo');
});

test('CLI explicit scope reports selected scope and scope summary metadata', () => {
  const result = runValidatorCli(['--scope=docs']);
  assert.ok([0, 1, 2].includes(result.status));
  const report = JSON.parse(result.stdout);
  assert.equal(report.scope, 'docs');
  assert.deepEqual(report.scopeContract.includeRoots, ['doc', 'docs']);
  assert.deepEqual(report.scopeContract.includeRootFiles, ['README.md']);
  assert.equal(report.scopeSummary.scope, 'docs');
  assert.equal(report.scopeSummary.reportableFilesInScope, report.totalFilesScanned);
  assert.equal(report.scopeSummary.findingsGenerated, report.findings.length);
});


test('CLI no-target regression keeps scope behavior and unfiltered metadata', () => {
  const result = runValidatorCli(['--scope=app']);
  assert.ok([0, 1, 2].includes(result.status));
  const report = JSON.parse(result.stdout);
  assert.equal(report.scope, 'app');
  assert.equal(report.filters.isFiltered, false);
  assert.equal(report.filters.targets, undefined);
});

test('CLI file target filters to one in-scope file and reports normalized targets', () => {
  const appPaths = collectRepositoryPaths(process.cwd(), { scope: 'app' });
  const targetPath = appPaths.find(pathname => pathname.endsWith('.tsx') || pathname.endsWith('.ts')) ?? appPaths[0];
  assert.ok(targetPath, 'Expected at least one app-scope path for target test');

  const result = runValidatorCli(['--scope=app', `--target=${targetPath}`]);
  assert.ok([0, 1, 2].includes(result.status));
  const report = JSON.parse(result.stdout);

  assert.equal(report.filters.isFiltered, true);
  assert.deepEqual(report.filters.targets, [targetPath]);
  assert.deepEqual(report.findings.map(finding => finding.path), [targetPath]);
});

test('CLI directory target filters recursively within scope', () => {
  const appPaths = collectRepositoryPaths(process.cwd(), { scope: 'app' });
  const targetDirectory = 'src';
  const expectedPaths = appPaths.filter(pathname => pathname === targetDirectory || pathname.startsWith(`${targetDirectory}/`));
  assert.ok(expectedPaths.length > 0, 'Expected src directory to contain app-scope reportable files');

  const result = runValidatorCli(['--scope=app', '--target', targetDirectory]);
  assert.ok([0, 1, 2].includes(result.status));
  const report = JSON.parse(result.stdout);

  assert.equal(report.filters.isFiltered, true);
  assert.deepEqual(report.filters.targets, [targetDirectory]);
  assert.deepEqual(report.findings.map(finding => finding.path), expectedPaths);
});

test('CLI multiple targets apply union semantics', () => {
  const appPaths = collectRepositoryPaths(process.cwd(), { scope: 'app' });
  const targetDirectories = ['src', 'test'];
  const expectedPaths = appPaths.filter(pathname =>
    targetDirectories.some(target => pathname === target || pathname.startsWith(`${target}/`)),
  );
  assert.ok(expectedPaths.length > 0, 'Expected app scope to include files under src or test');

  const result = runValidatorCli(['--scope=app', '--target=src', '--target', 'test']);
  assert.ok([0, 1, 2].includes(result.status));
  const report = JSON.parse(result.stdout);

  assert.equal(report.filters.isFiltered, true);
  assert.deepEqual(report.filters.targets, targetDirectories);
  assert.deepEqual(report.findings.map(finding => finding.path), expectedPaths);
});

test('CLI nonexistent target fails deterministically with stable message', () => {
  const result = runValidatorCli(['--scope=app', '--target=src/does-not-exist-target']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Target path does not exist: src\/does-not-exist-target/u);
  assert.match(result.stderr, /Usage: npm run validate:naming --/u);
});
