import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  classifyPath,
  collectRepositoryPaths,
  runNamingValidator,
  summarizeFindings,
} from '../src/naming-validator.logic.mjs';
import { resolveNamingRegistryInputs } from '../src/registries/registry-state.logic.mjs';
import {
  toNamingRolesRuntime,
  toReportableExtensionsSet,
  toReportableRootFilesSet,
  toMissingRolePatternsRuntime,
  toFindingPolicyRuntime,
  toCaseRulesRuntime,
} from '../src/naming-runtime-converters.logic.mjs';
import { getBuiltinWalkExclusions } from '../src/registries/naming-walk-exclusions-registry.logic.mjs';

const writeFile = (rootDirectory, relativePath) => {
  const absolutePath = path.join(rootDirectory, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, 'x', 'utf8');
};

test('runtime accepts externally prepared naming runtime dependencies', () => {
  const registryInputs = resolveNamingRegistryInputs({ config: {} });
  const namingRolesRuntime = toNamingRolesRuntime(registryInputs.roles);
  const reportableExtensions = toReportableExtensionsSet(registryInputs.reportableExtensions);
  const reportableRootFiles = toReportableRootFilesSet(registryInputs.reportableRootFiles);

  const canonicalFinding = classifyPath(
    'src/rightpanel.results-style.css',
    namingRolesRuntime,
    toMissingRolePatternsRuntime(registryInputs.missingRolePatterns),
    toFindingPolicyRuntime(registryInputs.findingPolicy),
    toCaseRulesRuntime(registryInputs.caseRules),
  );
  assert.equal(canonicalFinding.code, 'NAMING_CANONICAL');

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-runtime-inputs-'));

  try {
    writeFile(tempRoot, 'src/panel.logic.ts');
    writeFile(tempRoot, 'src/skip.tmp');

    const result = runNamingValidator({
      scope: 'repo',
      selectedPaths: collectRepositoryPaths(tempRoot, {
        scope: 'repo',
        reportableExtensions,
        reportableRootFiles,
        walkExclusions: getBuiltinWalkExclusions(),
      }),
      namingRolesRuntime,
      missingRolePatternsRuntime: toMissingRolePatternsRuntime(registryInputs.missingRolePatterns),
      findingPolicyRuntime: toFindingPolicyRuntime(registryInputs.findingPolicy),
      caseRulesRuntime: toCaseRulesRuntime(registryInputs.caseRules),
      targets: [],
    });

    assert.equal(result.totalFilesScanned, 1);
    assert.deepEqual(
      result.findings.map((finding) => finding.path),
      ['src/panel.logic.ts'],
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('runtime enforces prepared dependency injection contract', () => {
  assert.throws(
    () => classifyPath('src/rightpanel.results-style.css'),
    /requires prepared namingRolesRuntime/u,
  );

  assert.throws(
    () =>
      classifyPath(
        'src/rightpanel.results-style.css',
        toNamingRolesRuntime(resolveNamingRegistryInputs({ config: {} }).roles),
      ),
    /requires prepared missingRolePatternsRuntime/u,
  );

  assert.throws(
    () =>
      classifyPath(
        'src/rightpanel.results-style.css',
        toNamingRolesRuntime(resolveNamingRegistryInputs({ config: {} }).roles),
        toMissingRolePatternsRuntime(resolveNamingRegistryInputs({ config: {} }).missingRolePatterns),
      ),
    /requires prepared findingPolicyRuntime/u,
  );

  assert.throws(
    () =>
      classifyPath(
        'src/rightpanel.results-style.css',
        toNamingRolesRuntime(resolveNamingRegistryInputs({ config: {} }).roles),
        toMissingRolePatternsRuntime(resolveNamingRegistryInputs({ config: {} }).missingRolePatterns),
        toFindingPolicyRuntime(resolveNamingRegistryInputs({ config: {} }).findingPolicy),
      ),
    /requires prepared caseRulesRuntime/u,
  );

  assert.throws(
    () => runNamingValidator({
      scope: 'repo',
      namingRolesRuntime: toNamingRolesRuntime(resolveNamingRegistryInputs({ config: {} }).roles),
      missingRolePatternsRuntime: toMissingRolePatternsRuntime(
        resolveNamingRegistryInputs({ config: {} }).missingRolePatterns,
      ),
      findingPolicyRuntime: toFindingPolicyRuntime(resolveNamingRegistryInputs({ config: {} }).findingPolicy),
      caseRulesRuntime: toCaseRulesRuntime(resolveNamingRegistryInputs({ config: {} }).caseRules),
      targets: [],
    }),
    /requires prepared selectedPaths/u,
  );

  assert.throws(
    () => collectRepositoryPaths(process.cwd(), { scope: 'repo' }),
    /requires prepared reportableExtensions/u,
  );

  assert.throws(
    () => collectRepositoryPaths(process.cwd(), {
      scope: 'repo',
      reportableExtensions: new Set(['.ts']),
    }),
    /requires prepared reportableRootFiles/u,
  );

  assert.throws(
    () => collectRepositoryPaths(process.cwd(), {
      scope: 'repo',
      reportableExtensions: new Set(['.ts']),
      reportableRootFiles: new Set(['package.json']),
    }),
    /requires prepared walkExclusions/u,
  );


  assert.throws(
    () => summarizeFindings([]),
    /requires prepared summaryBucketsRuntime/u,
  );
});

test('toNamingRolesRuntime prepares disambiguation role token set for runtime consumers', () => {
  const registryInputs = resolveNamingRegistryInputs({ config: {} });
  const namingRolesRuntime = toNamingRolesRuntime(registryInputs.roles);
  const disambiguationRoleTokens = namingRolesRuntime.disambiguationRoleTokens;

  assert.ok(disambiguationRoleTokens instanceof Set);
  assert.equal(disambiguationRoleTokens.has('host'), true);
  assert.equal(disambiguationRoleTokens.has('wiring'), true);
  assert.equal(disambiguationRoleTokens.has('logic'), false);
});
