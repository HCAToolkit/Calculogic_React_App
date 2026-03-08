import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
  runTreeStructureAdvisor,
  summarizeFindings,
} from '../tree/src/tree-structure-advisor.host.mjs';
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
    assert.equal(result.filters.isFiltered, false);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});


test('tree-structure-advisor known roots come from bounded registry policy without behavior drift', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-known-roots-registry-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'experiments'), { recursive: true });

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const advisory = result.findings.find(
      (finding) => finding.code === 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER' && finding.path === 'experiments',
    );

    assert.ok(advisory);
    assert.deepEqual(advisory.details.knownRoots, [
      'bin',
      'calculogic-validator',
      'doc',
      'docs',
      'public',
      'scripts',
      'src',
      'test',
      'tools',
    ]);
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


test('tree-structure-advisor detects flat thin re-export shim deterministically', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-reexport-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'validator-runner.logic.mjs'),
      "export * from '../calculogic-validator/src/core/validator-runner.logic.mjs';\n",
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const findings = result.findings.filter(
      (finding) => finding.path === 'src/validator-runner.logic.mjs' && finding.code.startsWith('TREE_SHIM_'),
    );

    assert.deepEqual(
      findings.map((finding) => finding.code),
      ['TREE_SHIM_OUTSIDE_COMPAT', 'TREE_SHIM_SURFACE_PRESENT'],
    );
    const shimSurface = findings.find((finding) => finding.code === 'TREE_SHIM_SURFACE_PRESENT');
    assert.ok(shimSurface);
    assert.equal(shimSurface.details.matchedShimSignals.thinReexportShim, true);
    assert.equal(
      shimSurface.details.canonicalTargetPath,
      '../calculogic-validator/src/core/validator-runner.logic.mjs',
    );
    assert.equal(shimSurface.details.insideCompatSurface, false);
    assert.equal('suppressedAsIntentionalPassThrough' in shimSurface.details, false);
    assert.equal('suppressedBySurfaceContext' in shimSurface.details, false);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor detects shim-like path inside compat surface without outside warning', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-compat-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'src', 'compat'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'compat', 'legacy-api.logic.mjs'),
      "export * from '../../calculogic-validator/src/core/validator-runner.logic.mjs';\n",
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some(
        (finding) =>
          finding.path === 'src/compat/legacy-api.logic.mjs' && finding.code === 'TREE_SHIM_SURFACE_PRESENT',
      ),
      true,
    );
    assert.equal(
      result.findings.some(
        (finding) =>
          finding.path === 'src/compat/legacy-api.logic.mjs' && finding.code === 'TREE_SHIM_OUTSIDE_COMPAT',
      ),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor suppresses token-only shim signals on quality surfaces', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-quality-suppressed-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'test'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'test', 'core-entrypoints-contract.test.mjs'),
      'export const testCase = true\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some(
        (finding) => finding.path === 'calculogic-validator/test/core-entrypoints-contract.test.mjs',
      ),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor keeps runtime token-only shim path as informational signal only', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-runtime-token-only-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'src', 'bridges'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'bridges', 'legacy-api.logic.mjs'),
      'export const maybeBridge = true\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const shimFindings = result.findings.filter((finding) => finding.path === 'src/bridges/legacy-api.logic.mjs');

    assert.deepEqual(
      shimFindings.map((finding) => finding.code),
      ['TREE_SHIM_SURFACE_PRESENT'],
    );
    assert.equal(shimFindings[0].details.artifactSurface, 'runtimeish');
    assert.equal(shimFindings[0].details.matchedShimSignals.thinReexportShim, false);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});


test('tree-structure-advisor suppresses weak token-only shim signal for tree shim detector implementation file', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-detector-impl-suppressed-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'tree', 'src'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'tree', 'src', 'tree-shim-detection.logic.mjs'),
      'export const collectShimEvidence = () => null\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some(
        (finding) => finding.path === 'calculogic-validator/tree/src/tree-shim-detection.logic.mjs',
      ),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor does not treat canonical host-to-wiring pass-through as shim debt', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-host-wiring-pass-through-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'tree', 'src'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'tree', 'src', 'tree-structure-advisor.host.mjs'),
      "export * from './tree-structure-advisor.wiring.mjs';\n",
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'tree', 'src', 'tree-structure-advisor.wiring.mjs'),
      'export const treeAdvisor = true\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some(
        (finding) => finding.path === 'calculogic-validator/tree/src/tree-structure-advisor.host.mjs',
      ),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor does not treat public index entrypoint barrel as shim debt', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-public-entrypoint-pass-through-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'index.mjs'),
      [
        "export * from './core/validator-runner.logic.mjs';",
        "export * as naming from '../naming/src/naming-validator.host.mjs';",
        "export * as treeStructureAdvisor from '../tree/src/tree-structure-advisor.host.mjs';",
      ].join('\n'),
      'utf8',
    );
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src', 'core'), { recursive: true });
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'naming', 'src'), { recursive: true });
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'tree', 'src'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'core', 'validator-runner.logic.mjs'),
      'export const validatorRunner = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'naming', 'src', 'naming-validator.host.mjs'),
      'export const namingHost = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'tree', 'src', 'tree-structure-advisor.host.mjs'),
      'export const treeHost = true\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some((finding) => finding.path === 'calculogic-validator/src/index.mjs'),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor does not flag normal non-shim files for shim findings', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-non-shim-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(result.findings.some((finding) => finding.code.startsWith('TREE_SHIM_')), false);
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

test('tree-structure-advisor directory target narrows analyzed paths/findings', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-target-dir-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'validator-runner.logic.mjs'),
      'export const misplaced = true\n',
      'utf8',
    );

    const unfiltered = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const filtered = runTreeStructureAdvisor(fixtureDir, {
      scope: 'repo',
      targets: ['calculogic-validator'],
    });

    assert.equal(filtered.filters.isFiltered, true);
    assert.deepEqual(filtered.filters.targets, ['calculogic-validator']);
    assert.equal(
      unfiltered.findings.some((finding) => finding.path === 'src/validator-runner.logic.mjs'),
      true,
    );
    assert.equal(filtered.findings.some((finding) => finding.path === 'src/validator-runner.logic.mjs'), false);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor file target narrows analyzed paths/findings', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-target-file-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'naming-validator.wiring.mjs'),
      'export const misplaced = true\n',
      'utf8',
    );

    const filtered = runTreeStructureAdvisor(fixtureDir, {
      scope: 'repo',
      targets: ['src/app-shell.logic.ts'],
    });

    assert.equal(filtered.filters.isFiltered, true);
    assert.deepEqual(filtered.filters.targets, ['src/app-shell.logic.ts']);
    assert.equal(
      filtered.findings.some((finding) => finding.code === 'TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE'),
      false,
    );
    assert.equal(filtered.totalFilesScanned, 1);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor throws for invalid target path', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-target-invalid-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    assert.throws(
      () => runTreeStructureAdvisor(fixtureDir, { scope: 'repo', targets: ['does-not-exist'] }),
      /Target path does not exist: does-not-exist/u,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor throws for target path escaping repository root', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-target-escape-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    assert.throws(
      () => runTreeStructureAdvisor(fixtureDir, { scope: 'repo', targets: ['..'] }),
      /Target path escapes repository root: ../u,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor no-target behavior remains unchanged for findings', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-target-compat-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'validator-runner.logic.mjs'),
      'export const misplaced = true\n',
      'utf8',
    );

    const withoutTargets = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const explicitEmptyTargets = runTreeStructureAdvisor(fixtureDir, { scope: 'repo', targets: [] });

    assert.deepEqual(withoutTargets.findings, explicitEmptyTargets.findings);
    assert.equal(withoutTargets.filters.isFiltered, false);
    assert.equal(explicitEmptyTargets.filters.isFiltered, false);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});
