import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { buildNamingValidatorReport } from '../src/cli/naming-report-builder.logic.mjs';
import { summarizeFindings } from '../src/naming-validator.host.mjs';
import { getValidatorById } from '../../src/core/validator-registry.knowledge.mjs';

const fixedStartedAtDate = new Date('2026-01-02T03:04:05.000Z');
const fixedEndedAtDate = new Date('2026-01-02T03:04:06.234Z');

const stableSourceSnapshot = {
  git: {
    commit: 'test-commit',
    branch: 'test-branch',
    dirty: false,
  },
};

const stableRegistry = {
  registryState: 'builtin',
  registrySource: 'builtin',
  registryDigests: {
    builtin: 'a'.repeat(64),
    custom: 'b'.repeat(64),
    resolved: 'c'.repeat(64),
  },
};

const stableScopeProfile = {
  description: 'Stable validator scope profile for direct report parity tests.',
  includeRoots: ['calculogic-validator/src'],
  includeRootFiles: ['package.json'],
};

const stableCanonicalFinding = {
  code: 'NAMING_CANONICAL',
  severity: 'info',
  path: 'calculogic-validator/src/core/validator-direct-report.logic.mjs',
  classification: 'canonical',
  message: 'Filename is canonical.',
  ruleRef:
    'calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md#core-filename-grammar',
  details: {
    semanticName: 'validator-direct-report',
    role: 'logic',
    extension: 'mjs',
    roleStatus: 'active',
    roleCategory: 'concern-core',
    semanticTokens: ['validator', 'direct', 'report'],
    semanticFamily: 'validator',
    familyRoot: 'validator',
    familySubgroup: 'direct-report',
  },
};

const buildLegacyNamingDirectReportShape = ({ findings, configDigest }) => {
  const summary = summarizeFindings(findings);

  return {
    mode: 'report',
    validatorId: 'naming',
    toolVersion: '0.1.0-test',
    validatorVersion: '0.1.0-test',
    ...(configDigest ? { configDigest } : {}),
    sourceSnapshot: stableSourceSnapshot,
    registryState: stableRegistry.registryState,
    registrySource: stableRegistry.registrySource,
    registryDigests: stableRegistry.registryDigests,
    startedAt: fixedStartedAtDate.toISOString(),
    endedAt: fixedEndedAtDate.toISOString(),
    durationMs: fixedEndedAtDate.getTime() - fixedStartedAtDate.getTime(),
    scope: 'validator',
    totalFilesScanned: findings.length,
    filters: { isFiltered: true, targets: ['calculogic-validator/src/core'] },
    scopeSummary: {
      scope: 'validator',
      reportableFilesInScope: findings.length,
      findingsGenerated: findings.length,
    },
    scopeContract: {
      description: stableScopeProfile.description,
      includeRoots: stableScopeProfile.includeRoots,
      includeRootFiles: stableScopeProfile.includeRootFiles,
    },
    counts: summary.counts,
    codeCounts: summary.codeCounts,
    specialCaseTypeCounts: summary.specialCaseTypeCounts,
    warningRoleStatusCounts: summary.warningRoleStatusCounts,
    warningRoleCategoryCounts: summary.warningRoleCategoryCounts,
    familyRootCounts: summary.familyRootCounts,
    familySubgroupCounts: summary.familySubgroupCounts,
    semanticFamilyCounts: summary.semanticFamilyCounts,
    findings,
  };
};

const buildCurrentNamingDirectReport = ({ findings, configDigest }) =>
  buildNamingValidatorReport({
    findings,
    totalFilesScanned: findings.length,
    scope: 'validator',
    filters: { isFiltered: true, targets: ['calculogic-validator/src/core'] },
    registry: stableRegistry,
    toolVersion: '0.1.0-test',
    ...(configDigest ? { configDigest } : {}),
    sourceSnapshot: stableSourceSnapshot,
    selectedScopeProfile: stableScopeProfile,
    startedAtDate: fixedStartedAtDate,
    endedAtDate: fixedEndedAtDate,
    registryEntry: getValidatorById('naming'),
  });

test('Naming direct report builder preserves exact legacy shape when findings are present', () => {
  assert.deepEqual(
    buildCurrentNamingDirectReport({ findings: [stableCanonicalFinding] }),
    buildLegacyNamingDirectReportShape({ findings: [stableCanonicalFinding] }),
  );
});

test('Naming direct report builder preserves exact legacy shape when no findings are present', () => {
  assert.deepEqual(
    buildCurrentNamingDirectReport({ findings: [], configDigest: 'd'.repeat(64) }),
    buildLegacyNamingDirectReportShape({ findings: [], configDigest: 'd'.repeat(64) }),
  );
});

const runValidateNaming = (args) =>
  spawnSync(
    process.execPath,
    [
      '--experimental-strip-types',
      'calculogic-validator/scripts/validate-naming.host.mjs',
      ...args,
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

test('validate:naming direct stdout remains parseable JSON with findings present', () => {
  const result = runValidateNaming([
    '--scope=validator',
    '--target=calculogic-validator/test/fixtures',
  ]);

  assert.equal(result.status, 2);
  assert.equal(result.stderr, '');

  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, 'report');
  assert.equal(report.validatorId, 'naming');
  assert.equal(report.scope, 'validator');
  assert.equal(report.filters.isFiltered, true);
  assert.deepEqual(report.filters.targets, ['calculogic-validator/test/fixtures']);
  assert.equal(report.findings.length > 0, true);
  assert.equal(report.scopeSummary.findingsGenerated, report.findings.length);
  assert.equal(report.scopeSummary.reportableFilesInScope, report.totalFilesScanned);
  assert.equal(typeof report.startedAt, 'string');
  assert.equal(typeof report.endedAt, 'string');
  assert.equal(typeof report.durationMs, 'number');
  assert.equal(typeof report.sourceSnapshot, 'object');
});

test('validate:naming direct stdout remains parseable JSON with no findings present', () => {
  const result = runValidateNaming([
    '--scope=validator',
    '--target=calculogic-validator/test/fixtures/no-reportable-files',
  ]);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');

  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, 'report');
  assert.equal(report.validatorId, 'naming');
  assert.equal(report.scope, 'validator');
  assert.equal(report.totalFilesScanned, 0);
  assert.deepEqual(report.findings, []);
  assert.equal(report.scopeSummary.findingsGenerated, 0);
  assert.equal(report.scopeSummary.reportableFilesInScope, 0);
  assert.equal(report.counts.canonical, 0);
});

test('validate:naming help keeps current command usage surface from registry command metadata', () => {
  const result = runValidateNaming(['--help']);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.equal(
    result.stdout,
    [
      'Usage: npm run validate:naming -- [--scope=<repo|app|docs|validator|system>] [--target=<path>]... [--config=<path>] [--strict]',
      'Scopes:',
      '  - app: Application-only scan (src/** and test/**).',
      '  - docs: Documentation-focused scan (doc/docs and root conventional docs: README.md).',
      '  - repo: Repository-wide scan of all reportable files.',
      '  - system: System/tooling files scan (root package/tsconfig/eslint/vite files).',
      '  - validator: Validator-only scan (calculogic-validator/**).',
      'Default scope: repo',
      'Examples:',
      '  ✅ npm run validate:naming -- --scope=app',
      '  ✅ npm run validate:naming -- --scope=app --target src/buildsurface',
      '  ✅ npm run validate:naming -- --scope=app --target src/buildsurface --target src/shared',
      '  ✅ npm run validate:all -- --validators=naming --scope=docs',
      '  ✅ node calculogic-validator/bin/calculogic-validate-naming.host.mjs --scope=app',
      '  ✅ node calculogic-validator/bin/calculogic-validate.host.mjs --scope=docs',
      '  ✅ npm run validate:naming -- --scope=repo --strict',
      '',
    ].join('\n'),
  );
});
