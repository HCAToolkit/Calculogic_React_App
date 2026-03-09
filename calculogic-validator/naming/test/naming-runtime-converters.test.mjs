import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveNamingRegistryInputs } from '../src/registries/registry-state.logic.mjs';
import {
  toNamingRolesRuntime,
  toReportableExtensionsSet,
  toReportableRootFilesSet,
  toMissingRolePatternsRuntime,
  toFindingPolicyRuntime,
} from '../src/naming-runtime-converters.logic.mjs';
import { runNamingValidator as runNamingValidatorRuntime } from '../src/naming-validator.logic.mjs';
import { getBuiltinWalkExclusions } from '../src/registries/naming-walk-exclusions.registry.logic.mjs';
import { runNamingValidator as runNamingValidatorWiring } from '../src/naming-validator.wiring.mjs';
import { collectRepositoryPaths } from '../src/naming-validator.wiring.mjs';

const writeFile = (rootDirectory, relativePath) => {
  const absolutePath = path.join(rootDirectory, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, 'x', 'utf8');
};

test('shared naming roles converter keeps deterministic first-wins metadata and length-sorted suffixes', () => {
  const runtime = toNamingRolesRuntime([
    { role: 'logic', category: 'concern-core', status: 'active' },
    { role: 'results-style', category: 'concern-core', status: 'active' },
    { role: 'logic', category: 'deprecated', status: 'deprecated' },
    { role: 'view', category: 'deprecated', status: 'deprecated' },
  ]);

  assert.equal(runtime.roleMetadata.get('logic')?.status, 'active');
  assert.equal(runtime.activeRoles.has('logic'), true);
  assert.equal(runtime.activeRoles.has('view'), false);
  assert.deepEqual(runtime.roleSuffixes, ['results-style', 'logic', 'view']);
});

test('shared reportable extension converter returns a Set preserving extension membership semantics', () => {
  const reportableExtensions = toReportableExtensionsSet(['.ts', '.tsx', '.ts']);

  assert.equal(reportableExtensions instanceof Set, true);
  assert.equal(reportableExtensions.has('.ts'), true);
  assert.equal(reportableExtensions.has('.tsx'), true);
  assert.equal(reportableExtensions.has('.tmp'), false);
  assert.equal(reportableExtensions.size, 2);
});


test('shared reportable root files converter returns a Set preserving filename membership semantics', () => {
  const reportableRootFiles = toReportableRootFilesSet(['package.json', 'package-lock.json', 'package.json']);

  assert.equal(reportableRootFiles instanceof Set, true);
  assert.equal(reportableRootFiles.has('package.json'), true);
  assert.equal(reportableRootFiles.has('package-lock.json'), true);
  assert.equal(reportableRootFiles.has('README.md'), false);
  assert.equal(reportableRootFiles.size, 2);
});


test('missing-role pattern runtime converter preserves deterministic pattern entries', () => {
  const runtimePatterns = toMissingRolePatternsRuntime([
    {
      patternId: 'single-extension',
      dotSegments: 2,
      semanticSegmentIndex: 0,
      extensionSegmentIndexes: [1],
      literalSegmentConstraints: {},
      compoundExtension: '',
    },
  ]);

  assert.equal(Array.isArray(runtimePatterns), true);
  assert.equal(runtimePatterns[0].patternId, 'single-extension');
  assert.deepEqual(runtimePatterns[0].extensionSegmentIndexes, [1]);
  assert.deepEqual(runtimePatterns[0].literalSegmentConstraints, {});
});

test('finding-policy runtime converter returns outcome-addressable policy map', () => {
  const runtimePolicy = toFindingPolicyRuntime({
    canonical: {
      code: 'NAMING_CANONICAL',
      severity: 'info',
      classification: 'canonical',
      message: 'Filename is canonical.',
      ruleRef: 'rule-ref',
    },
  });

  assert.equal(runtimePolicy instanceof Map, true);
  assert.deepEqual(runtimePolicy.get('canonical'), {
    code: 'NAMING_CANONICAL',
    severity: 'info',
    classification: 'canonical',
    message: 'Filename is canonical.',
    ruleRef: 'rule-ref',
  });
});

test('direct runtime and wiring derive equivalent runtime validation output from the same resolver payload', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-runtime-converter-parity-'));

  try {
    writeFile(tempRoot, 'src/panel.logic.ts');
    writeFile(tempRoot, 'src/panel.host.tsx');
    writeFile(tempRoot, 'src/legacy.tmp');

    const registryInputs = resolveNamingRegistryInputs({ config: {} });
    const runtimeResult = runNamingValidatorRuntime({
      scope: 'repo',
      selectedPaths: collectRepositoryPaths(tempRoot, {
        scope: 'repo',
        reportableExtensions: toReportableExtensionsSet(registryInputs.reportableExtensions),
        reportableRootFiles: toReportableRootFilesSet(registryInputs.reportableRootFiles),
        walkExclusions: getBuiltinWalkExclusions(),
      }),
      targets: [],
      namingRolesRuntime: toNamingRolesRuntime(registryInputs.roles),
      missingRolePatternsRuntime: toMissingRolePatternsRuntime(registryInputs.missingRolePatterns),
      findingPolicyRuntime: toFindingPolicyRuntime(registryInputs.findingPolicy),
    });

    const wiringResult = runNamingValidatorWiring(tempRoot, { scope: 'repo', config: {} });

    assert.deepEqual(wiringResult.findings, runtimeResult.findings);
    assert.equal(wiringResult.totalFilesScanned, runtimeResult.totalFilesScanned);
    assert.equal(wiringResult.scope, runtimeResult.scope);
    assert.deepEqual(wiringResult.filters, runtimeResult.filters);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
