import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runNamingHealthCheck } from '../naming/src/health/naming-health-check.logic.mjs';
import {
  resolveNamingHealthPackageRoot,
  shouldRequireEmbeddedDocsForNamingHealth,
} from '../naming/src/health/naming-health-check.host.mjs';

const testFilePath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(testFilePath), '..', '..');
const packageRoot = path.resolve(repositoryRoot, 'calculogic-validator');

const runRootHealth = () =>
  spawnSync('npm', ['run', 'health:validator'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });

test('embedded source health requires docs and reports them as checked when present', () => {
  assert.equal(resolveNamingHealthPackageRoot(), packageRoot);
  assert.equal(
    shouldRequireEmbeddedDocsForNamingHealth({ repositoryRoot, packageRoot }),
    true,
  );

  const result = runRootHealth();
  assert.equal(result.status, 0, `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.match(result.stdout, /OK: docs match app scope roots/u);
  assert.doesNotMatch(result.stdout, /docs check skipped/u);
});

test('embedded source health fails when expected source docs are absent', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'naming-health-source-docs-missing-'));

  try {
    await fs.writeFile(
      path.join(fixtureRoot, 'package.json'),
      JSON.stringify({ name: 'naming-health-source-docs-missing', version: '1.0.0' }, null, 2),
      'utf8',
    );

    assert.throws(
      () => runNamingHealthCheck(fixtureRoot, { requireDocs: true }),
      /NamingValidatorSpec\.md/u,
    );
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});

test('installed consumer health context does not require embedded source docs', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'naming-health-installed-context-'));

  try {
    const installedPackageRoot = path.join(
      fixtureRoot,
      'node_modules',
      '@calculogic',
      'validator',
    );

    assert.equal(
      shouldRequireEmbeddedDocsForNamingHealth({
        repositoryRoot: fixtureRoot,
        packageRoot: installedPackageRoot,
      }),
      false,
    );
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});
