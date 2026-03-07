import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  classifyPath,
  collectRepositoryPaths,
  runNamingValidator,
} from '../src/naming-validator.logic.mjs';
import { resolveNamingRegistryInputs } from '../src/registries/registry-state.logic.mjs';
import {
  toNamingRolesRuntime,
  toReportableExtensionsSet,
} from '../src/naming-runtime-converters.logic.mjs';
import { getBuiltinWalkExclusions } from '../src/registries/naming-walk-exclusions.registry.logic.mjs';

const writeFile = (rootDirectory, relativePath) => {
  const absolutePath = path.join(rootDirectory, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, 'x', 'utf8');
};

test('runtime accepts externally prepared naming runtime dependencies', () => {
  const registryInputs = resolveNamingRegistryInputs({ config: {} });
  const namingRolesRuntime = toNamingRolesRuntime(registryInputs.roles);
  const reportableExtensions = toReportableExtensionsSet(registryInputs.reportableExtensions);

  const canonicalFinding = classifyPath('src/rightpanel.results-style.css', namingRolesRuntime);
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
        walkExclusions: getBuiltinWalkExclusions(),
      }),
      namingRolesRuntime,
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
    () => runNamingValidator({
      scope: 'repo',
      namingRolesRuntime: toNamingRolesRuntime(resolveNamingRegistryInputs({ config: {} }).roles),
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
    /requires prepared walkExclusions/u,
  );
});
