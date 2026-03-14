import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
  runTreeStructureAdvisor,
  summarizeFindings,
} from '../src/tree-structure-advisor.host.mjs';
import { prepareTreeStructureAdvisorInputs } from '../src/tree-structure-advisor.wiring.mjs';
import { runTreeStructureAdvisor as runTreeStructureAdvisorRuntime } from '../src/tree-structure-advisor.logic.mjs';
import { collectShimCompatFindings } from '../src/tree-shim-detection.logic.mjs';
import { listRegisteredValidators } from '../../src/core/validator-registry.knowledge.mjs';
import { getValidatorScopeProfile } from '../../src/core/validator-scopes.runtime.mjs';

const writeJson = async (filePath, value) => {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
};


const collectExpectedPathsFromScopeProfile = async (fixtureDir, scope) => {
  const profile = getValidatorScopeProfile(scope);

  if (!profile) {
    throw new Error(`Expected known scope profile: ${scope}`);
  }

  const collected = new Set();

  for (const scopeRoot of profile.includeRoots) {
    const absoluteRoot = path.join(fixtureDir, scopeRoot);

    try {
      const rootStat = await fs.stat(absoluteRoot);
      if (!rootStat.isDirectory()) {
        continue;
      }
    } catch {
      continue;
    }

    const walk = async (absoluteDirectoryPath) => {
      const entries = await fs.readdir(absoluteDirectoryPath, { withFileTypes: true });
      entries.sort((left, right) => left.name.localeCompare(right.name));

      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            continue;
          }

          await walk(path.join(absoluteDirectoryPath, entry.name));
          continue;
        }

        collected.add(path.relative(fixtureDir, path.join(absoluteDirectoryPath, entry.name)).replace(/\\/gu, '/'));
      }
    };

    await walk(absoluteRoot);
  }

  for (const rootFilePath of profile.includeRootFiles) {
    const absolutePath = path.join(fixtureDir, rootFilePath);

    if (path.dirname(absolutePath) !== fixtureDir) {
      continue;
    }

    try {
      const rootFileStat = await fs.stat(absolutePath);
      if (!rootFileStat.isFile()) {
        continue;
      }
    } catch {
      continue;
    }

    collected.add(path.relative(fixtureDir, absolutePath).replace(/\\/gu, '/'));
  }

  return [...collected].sort((left, right) => left.localeCompare(right));
};


const writeBaseFixtureRepo = async (fixtureDir) => {
  await fs.mkdir(path.join(fixtureDir, 'src'), { recursive: true });
  await fs.mkdir(path.join(fixtureDir, 'doc'), { recursive: true });
  await fs.mkdir(path.join(fixtureDir, 'calculogic-doc-engine', 'src'), { recursive: true });
  await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src'), { recursive: true });

  await writeJson(path.join(fixtureDir, 'package.json'), {
    name: 'tree-structure-advisor-fixture',
    version: '1.0.0',
  });
  await fs.writeFile(path.join(fixtureDir, 'src', 'app-shell.logic.ts'), 'export const app = true\n', 'utf8');
  await fs.writeFile(path.join(fixtureDir, 'doc', 'README.md'), '# fixture\n', 'utf8');
  await fs.writeFile(
    path.join(fixtureDir, 'calculogic-doc-engine', 'src', 'doc-engine.logic.mjs'),
    'export const docEngine = true\n',
    'utf8',
  );
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

    assert.equal(
      result.findings.some(
        (finding) =>
          finding.code === 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER' && finding.path === 'calculogic-doc-engine',
      ),
      false,
    );
    assert.ok(advisory);
    assert.deepEqual(advisory.details.knownRoots, [
      'bin',
      'calculogic-doc-engine',
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
        "export * as treeStructureAdvisor from '../src/tree-structure-advisor.host.mjs';",
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



test('tree shim detection stages content reads and skips non-candidate runtime files', () => {
  const selectedPaths = [
    'src/app-shell.logic.ts',
    'src/compat/legacy-api.logic.mjs',
    'src/bridge-runtime.logic.mjs',
  ];
  const readCalls = [];
  const contentByPath = new Map([
    [
      'src/compat/legacy-api.logic.mjs',
      "export * from '../../calculogic-validator/src/core/validator-runner.logic.mjs';\n",
    ],
    ['src/bridge-runtime.logic.mjs', 'export const bridge = true\n'],
  ]);

  const findings = collectShimCompatFindings(selectedPaths, (relativePath) => {
    readCalls.push(relativePath);
    return contentByPath.get(relativePath) ?? 'export const noop = true\n';
  });

  assert.deepEqual(readCalls, ['src/compat/legacy-api.logic.mjs', 'src/bridge-runtime.logic.mjs']);
  assert.equal(readCalls.includes('src/app-shell.logic.ts'), false);
  assert.deepEqual(
    findings.filter((finding) => finding.path === 'src/compat/legacy-api.logic.mjs').map((finding) => finding.code),
    ['TREE_SHIM_SURFACE_PRESENT'],
  );
  assert.deepEqual(
    findings.filter((finding) => finding.path === 'src/bridge-runtime.logic.mjs').map((finding) => finding.code),
    ['TREE_SHIM_SURFACE_PRESENT'],
  );
});

test('tree shim detection emits outside-compat warning only for thin re-export evidence outside compat', () => {
  const selectedPaths = [
    'src/bridge-runtime.logic.mjs',
    'src/compat/legacy-api.logic.mjs',
    'src/validator-runner.logic.mjs',
  ];
  const contentByPath = new Map([
    ['src/bridge-runtime.logic.mjs', 'export const bridge = true\n'],
    ['src/compat/legacy-api.logic.mjs', "export * from '../../calculogic-validator/src/core/validator-runner.logic.mjs';\n"],
    ['src/validator-runner.logic.mjs', "export * from '../calculogic-validator/src/core/validator-runner.logic.mjs';\n"],
  ]);

  const findings = collectShimCompatFindings(selectedPaths, (relativePath) => contentByPath.get(relativePath));
  const outsideCompatCodes = findings
    .filter((finding) => finding.code === 'TREE_SHIM_OUTSIDE_COMPAT')
    .map((finding) => finding.path);

  assert.deepEqual(outsideCompatCodes, ['src/validator-runner.logic.mjs']);
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


test('tree-structure-advisor boundary drift keeps suite-core shared infra carveouts quiet', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-boundary-shared-infra-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src', 'core', 'naming'), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'core', 'naming', 'naming-validator.logic.mjs'),
      'export const namingCore = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'core', 'naming', 'naming-validator.wiring.mjs'),
      'export const namingWiring = true\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some((finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT'),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor emits owned-slice boundary drift for clear subsystem growth under suite-core', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-boundary-drift-owned-growth-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src', 'tree-structure-advisor'), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(
        fixtureDir,
        'calculogic-validator',
        'src',
        'tree-structure-advisor',
        'tree-structure-advisor.logic.mjs',
      ),
      'export const treeLogic = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(
        fixtureDir,
        'calculogic-validator',
        'src',
        'tree-structure-advisor',
        'tree-structure-advisor.wiring.mjs',
      ),
      'export const treeWiring = true\n',
      'utf8',
    );

    const first = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const second = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const firstDriftFindings = first.findings.filter(
      (finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT',
    );
    const secondDriftFindings = second.findings.filter(
      (finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT',
    );

    assert.equal(firstDriftFindings.length, 1);
    assert.deepEqual(firstDriftFindings, secondDriftFindings);
    assert.equal(firstDriftFindings[0].path, 'calculogic-validator/src/tree-structure-advisor/');
    assert.deepEqual(firstDriftFindings[0].details.matchedOwnedSignalPaths, [
      'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.logic.mjs',
      'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.wiring.mjs',
    ]);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor boundary drift preserves compat and public-entry carveouts', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-boundary-drift-carveouts-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src', 'compat'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'compat', 'legacy-validator.logic.mjs'),
      'export const compatLogic = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'compat', 'legacy-validator.wiring.mjs'),
      'export const compatWiring = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'index.mjs'),
      "export * from './core/validator-runner.logic.mjs';\n",
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some((finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT'),
      false,
    );
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



test('tree-structure-advisor docs scope includes declared root README when present', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-scope-docs-root-file-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(path.join(fixtureDir, 'README.md'), '# root readme\n', 'utf8');

    const prepared = prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'docs' });

    assert.deepEqual(prepared.selectedPaths, ['doc/README.md', 'README.md']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor system scope includes present root files and ignores missing declarations', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-scope-system-root-files-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(path.join(fixtureDir, 'eslint.config.mjs'), 'export default []\n', 'utf8');
    await fs.writeFile(path.join(fixtureDir, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8');

    const prepared = prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'system' });

    assert.deepEqual(prepared.selectedPaths, ['eslint.config.mjs', 'package.json', 'tsconfig.json']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor root-file target filtering works for docs scope target', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-scope-docs-target-root-file-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(path.join(fixtureDir, 'README.md'), '# root readme\n', 'utf8');

    const result = runTreeStructureAdvisor(fixtureDir, {
      scope: 'docs',
      targets: ['README.md'],
    });

    assert.equal(result.filters.isFiltered, true);
    assert.deepEqual(result.filters.targets, ['README.md']);
    assert.equal(result.totalFilesScanned, 1);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});


test('tree-structure-advisor scope collection follows suite profiles uniformly, including repo', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-scope-uniform-suite-profile-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(path.join(fixtureDir, 'README.md'), '# root readme\n', 'utf8');
    await fs.writeFile(path.join(fixtureDir, 'eslint.config.mjs'), 'export default []\n', 'utf8');
    await fs.writeFile(path.join(fixtureDir, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8');

    for (const scope of ['repo', 'docs', 'system']) {
      const prepared = prepareTreeStructureAdvisorInputs(fixtureDir, { scope });
      const expectedPaths = await collectExpectedPathsFromScopeProfile(fixtureDir, scope);

      assert.deepEqual(prepared.selectedPaths, expectedPaths);
    }
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor rejects invalid scope deterministically', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-invalid-scope-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    assert.throws(
      () => prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'unknown-scope' }),
      /Invalid scope profile: unknown-scope/u,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});




test('tree-structure-advisor computes occurrence-derived file reasoning input once per runtime run', () => {
  let occurrenceRecordReads = 0;
  const occurrenceSnapshot = {};

  Object.defineProperty(occurrenceSnapshot, 'occurrenceRecords', {
    get() {
      occurrenceRecordReads += 1;
      return [
        {
          resolvedPath: 'src/validator-runner.logic.mjs',
          occurrenceType: 'file',
        },
      ];
    },
  });

  const result = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: ['doc/README.md'],
    occurrenceSnapshot,
    topLevelDirectoryNames: [],
    targets: [],
  });

  assert.equal(occurrenceRecordReads, 1);
  assert.equal(result.totalFilesScanned, 1);
  assert.equal(
    result.findings.some(
      (finding) =>
        finding.code === 'TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE' &&
        finding.path === 'src/validator-runner.logic.mjs',
    ),
    true,
  );
});
test('tree-structure-advisor consumes occurrence snapshot file records for validator-owned outside-tree reasoning', () => {
  const fromOccurrenceSnapshot = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: ['calculogic-validator/tree/src/tree-structure-advisor.logic.mjs'],
    occurrenceSnapshot: {
      scopeRoots: ['src'],
      occurrenceRecords: [
        {
          resolvedPath: 'src/validator-runner.logic.mjs',
          occurrenceType: 'file',
        },
      ],
    },
    topLevelDirectoryNames: [],
    targets: [],
  });

  const withoutOccurrenceSnapshot = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: ['src/validator-runner.logic.mjs'],
    topLevelDirectoryNames: [],
    targets: [],
  });

  assert.deepEqual(fromOccurrenceSnapshot.findings, withoutOccurrenceSnapshot.findings);
  assert.equal(fromOccurrenceSnapshot.totalFilesScanned, 1);
});



test('tree-structure-advisor consumes occurrence-derived file paths for owned-slice boundary drift reasoning', () => {
  const fromOccurrenceSnapshot = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: ['doc/README.md'],
    occurrenceSnapshot: {
      scopeRoots: ['calculogic-validator'],
      occurrenceRecords: [
        {
          resolvedPath: 'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.logic.mjs',
          occurrenceType: 'file',
        },
        {
          resolvedPath: 'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.wiring.mjs',
          occurrenceType: 'file',
        },
      ],
    },
    topLevelDirectoryNames: [],
    targets: [],
  });

  const withoutOccurrenceSnapshot = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: [
      'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.logic.mjs',
      'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.wiring.mjs',
    ],
    topLevelDirectoryNames: [],
    targets: [],
  });

  const fromSnapshotBoundaryDrift = fromOccurrenceSnapshot.findings.filter(
    (finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT',
  );
  const fromSelectedPathsBoundaryDrift = withoutOccurrenceSnapshot.findings.filter(
    (finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT',
  );

  assert.deepEqual(fromSnapshotBoundaryDrift, fromSelectedPathsBoundaryDrift);
  assert.equal(fromSnapshotBoundaryDrift.length, 1);
});

test('tree-structure-advisor occurrence-derived boundary drift reasoning remains stable for repeated-name subtree paths', () => {
  const result = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: ['doc/README.md'],
    occurrenceSnapshot: {
      scopeRoots: ['calculogic-validator'],
      occurrenceRecords: [
        {
          resolvedPath: 'calculogic-validator/src/src-helper/src-helper.logic.mjs',
          occurrenceType: 'file',
        },
        {
          resolvedPath: 'calculogic-validator/src/src-helper/src-helper.wiring.mjs',
          occurrenceType: 'file',
        },
      ],
    },
    topLevelDirectoryNames: [],
    targets: [],
  });

  const driftFinding = result.findings.find((finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT');

  assert.ok(driftFinding);
  assert.equal(driftFinding.path, 'calculogic-validator/src/src-helper/');
  assert.deepEqual(driftFinding.details.matchedOwnedSignalPaths, [
    'calculogic-validator/src/src-helper/src-helper.logic.mjs',
    'calculogic-validator/src/src-helper/src-helper.wiring.mjs',
  ]);
});

test('tree-structure-advisor occurrence-derived boundary drift reasoning remains stable for rebased scope roots', () => {
  const result = runTreeStructureAdvisorRuntime({
    scope: 'validator',
    selectedPaths: ['doc/README.md'],
    occurrenceSnapshot: {
      scopeRoots: ['calculogic-validator/tree'],
      occurrenceRecords: [
        {
          resolvedPath: 'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.logic.mjs',
          occurrenceType: 'file',
          scopeRootPath: 'calculogic-validator/tree',
          isScopeTopOccurrence: false,
        },
        {
          resolvedPath: 'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.wiring.mjs',
          occurrenceType: 'file',
          scopeRootPath: 'calculogic-validator/tree',
          isScopeTopOccurrence: false,
        },
      ],
    },
    topLevelDirectoryNames: [],
    targets: ['calculogic-validator/tree'],
  });

  const driftFinding = result.findings.find((finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT');

  assert.ok(driftFinding);
  assert.equal(driftFinding.path, 'calculogic-validator/src/tree-structure-advisor/');
});

test('tree-structure-advisor falls back to selectedPaths when occurrence snapshot is malformed', () => {
  const result = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: [
      'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.logic.mjs',
      'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.wiring.mjs',
    ],
    occurrenceSnapshot: {
      occurrenceRecords: 'malformed',
    },
    topLevelDirectoryNames: [],
    targets: [],
  });

  assert.equal(
    result.findings.some((finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT'),
    true,
  );
});

test('tree-structure-advisor prepared runtime contract accepts tree-core inputs without contributors', () => {
  const result = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: [],
    topLevelDirectoryNames: [],
    targets: [],
  });

  assert.deepEqual(result.findings, []);
  assert.equal(result.totalFilesScanned, 0);
});

test('tree-structure-advisor wiring composes shim contributor with lazy staged content reads', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-lazy-content-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'src', 'compat'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'compat', 'legacy-api.logic.mjs'),
      "export * from '../../calculogic-validator/src/core/validator-runner.logic.mjs';\\n",
      'utf8',
    );

    const prepared = prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'repo' });

    assert.equal(Array.isArray(prepared.findingContributors), true);
    assert.equal(prepared.findingContributors.length, 1);

    const shimFindingsFirst = prepared.findingContributors[0](prepared);
    assert.deepEqual(
      shimFindingsFirst.filter((finding) => finding.path === 'src/compat/legacy-api.logic.mjs').map((finding) => finding.code),
      ['TREE_SHIM_SURFACE_PRESENT'],
    );

    await fs.writeFile(
      path.join(fixtureDir, 'src', 'compat', 'legacy-api.logic.mjs'),
      'export const changed = true\\n',
      'utf8',
    );

    const shimFindingsSecond = prepared.findingContributors[0](prepared);
    assert.deepEqual(
      shimFindingsSecond.filter((finding) => finding.path === 'src/compat/legacy-api.logic.mjs').map((finding) => finding.code),
      ['TREE_SHIM_SURFACE_PRESENT'],
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});
