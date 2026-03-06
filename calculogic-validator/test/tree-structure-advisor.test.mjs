import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
  runTreeStructureAdvisor,
  summarizeFindings,
} from '../src/tree-structure-advisor.host.mjs';
import { listRegisteredValidators } from '../src/core/validator-registry.knowledge.mjs';

const writeJson = async (filePath, value) => {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
};

const writeBaseFixtureRepo = async (fixtureDir) => {
  await fs.mkdir(path.join(fixtureDir, 'src'), { recursive: true });
  await fs.mkdir(path.join(fixtureDir, 'doc'), { recursive: true });
  await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src'), { recursive: true });

  await writeJson(path.join(fixtureDir, 'package.json'), {
    name: 'tree-structure-advisor-fixture',
    version: '1.0.0',
  });
  await fs.writeFile(path.join(fixtureDir, 'src', 'app-shell.logic.ts'), 'export const app = true\n', 'utf8');
  await fs.writeFile(path.join(fixtureDir, 'doc', 'README.md'), '# fixture\n', 'utf8');
  await fs.writeFile(
    path.join(fixtureDir, 'calculogic-validator', 'src', 'naming-validator.logic.mjs'),
    'export const fixture = true\n',
    'utf8',
  );
};

test('tree-structure-advisor is registered as a validator slice', () => {
  assert.deepEqual(listRegisteredValidators(), ['naming', 'tree-structure-advisor']);
});

test('tree-structure-advisor is conservative for normal known repository shape', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-safe-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(result.scope, 'repo');
    assert.equal(result.findings.length, 0);
    assert.equal(typeof result.totalFilesScanned, 'number');
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor findings are deterministic and summary-stable', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-deterministic-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'experiments'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'validator-runner.logic.mjs'),
      'export const misplaced = true\n',
      'utf8',
    );

    const first = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const second = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.deepEqual(first.findings, second.findings);

    const findingKeys = first.findings.map((finding) => `${finding.path}|${finding.code}`);
    const sortedFindingKeys = [...findingKeys].sort((left, right) => left.localeCompare(right));
    assert.deepEqual(findingKeys, sortedFindingKeys);

    const summary = summarizeFindings(first.findings);
    assert.deepEqual(summary.counts, { 'advisory-structure': 2 });
    assert.deepEqual(summary.codeCounts, {
      TREE_UNEXPECTED_TOP_LEVEL_FOLDER: 1,
      TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE: 1,
    });
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor flags validator-owned-looking file outside validator tree', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-misplaced-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'naming-validator.wiring.mjs'),
      'export const misplaced = true\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const advisory = result.findings.find(
      (finding) => finding.code === 'TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE',
    );

    assert.ok(advisory);
    assert.equal(advisory.severity, 'info');
    assert.equal(advisory.classification, 'advisory-structure');
    assert.equal(advisory.path, 'src/naming-validator.wiring.mjs');
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});
