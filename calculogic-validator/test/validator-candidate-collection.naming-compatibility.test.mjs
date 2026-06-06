import test from 'node:test';
import assert from 'node:assert/strict';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  collectRepositoryPaths as collectNamingRepositoryPaths,
  prepareNamingRuntimeInputs,
  prepareNamingValidatorInputs,
  runNamingValidator,
  summarizeFindings,
} from '../naming/src/naming-validator.wiring.mjs';
import { runNamingValidator as runNamingValidatorRuntime } from '../naming/src/naming-validator.logic.mjs';
import { createValidatorCandidatePolicyFromValues } from '../src/core/validator-candidate-policy.logic.mjs';
import { collectValidatorCandidatePaths } from '../src/core/validator-candidate-collection.logic.mjs';
import {
  DEFAULT_VALIDATOR_SCOPE,
  getValidatorScopeProfile,
} from '../src/core/validator-scopes.logic.mjs';
import {
  filterScopedPathsByProfile,
  filterScopedPathsByTargets,
  normalizePath,
  resolveScopedTargets,
} from '../src/core/scoped-target-paths.logic.mjs';

const writeFixtureFile = async (fixtureDir, relativePath, content = 'fixture\n') => {
  const absolutePath = path.join(fixtureDir, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, 'utf8');
};

const sortPaths = (paths) => Array.from(paths).sort((left, right) => left.localeCompare(right));

const isLegacyNamingReportablePath = (relativePath, reportableExtensions, reportableRootFiles) =>
  reportableExtensions.has(path.extname(relativePath)) ||
  reportableRootFiles.has(path.basename(relativePath));

const collectLegacyNamingWalkPaths = (repositoryRoot, options = {}) => {
  const absoluteRoot = path.resolve(repositoryRoot);
  if (!fsSync.existsSync(absoluteRoot) || !fsSync.statSync(absoluteRoot).isDirectory()) {
    return [];
  }

  const collected = [];
  const walk = (absoluteDirectoryPath) => {
    for (const entry of fsSync.readdirSync(absoluteDirectoryPath, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (options.walkExclusions.excludedDirectories.has(entry.name)) {
          continue;
        }

        if (entry.name.startsWith('.') && options.walkExclusions.skipDotDirectories) {
          continue;
        }

        walk(path.join(absoluteDirectoryPath, entry.name));
        continue;
      }

      const relativePath = normalizePath(
        path.relative(repositoryRoot, path.join(absoluteDirectoryPath, entry.name)),
      );
      if (
        isLegacyNamingReportablePath(
          relativePath,
          options.reportableExtensions,
          options.reportableRootFiles,
        )
      ) {
        collected.push(relativePath);
      }
    }
  };

  walk(absoluteRoot);
  return collected;
};

const collectLegacyNamingRepositoryPaths = (repositoryRoot, options = {}) => {
  const selectedScope = options.scope ?? DEFAULT_VALIDATOR_SCOPE;
  const profile = getValidatorScopeProfile(selectedScope);
  if (!profile) {
    throw new Error(`Invalid scope profile: ${selectedScope}`);
  }

  const allReportablePaths = collectLegacyNamingWalkPaths(repositoryRoot, options);
  if (selectedScope === 'repo') {
    return sortPaths(new Set(allReportablePaths));
  }

  return filterScopedPathsByProfile(allReportablePaths, profile);
};

const filterLegacyNamingPathsByTargets = (repositoryRoot, relativePaths, targets = []) => {
  const resolvedTargets = resolveScopedTargets(repositoryRoot, targets);
  return filterScopedPathsByTargets(repositoryRoot, relativePaths, resolvedTargets);
};

const createCandidateFixture = async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-candidates-'));

  await Promise.all([
    writeFixtureFile(fixtureDir, 'package.json', '{}\n'),
    writeFixtureFile(fixtureDir, 'package-lock.json', '{}\n'),
    writeFixtureFile(fixtureDir, 'README.md', '# repo\n'),
    writeFixtureFile(fixtureDir, 'src/app.logic.ts'),
    writeFixtureFile(fixtureDir, 'src/App.tsx'),
    writeFixtureFile(fixtureDir, 'src/style.css'),
    writeFixtureFile(fixtureDir, 'src/data.json', '{}\n'),
    writeFixtureFile(fixtureDir, 'test/app.test.js'),
    writeFixtureFile(fixtureDir, 'doc/guide.md', '# guide\n'),
    writeFixtureFile(fixtureDir, 'calculogic-validator/src/core/example.logic.mjs'),
    writeFixtureFile(fixtureDir, 'calculogic-validator/src/core/example.logic.js'),
    writeFixtureFile(fixtureDir, 'calculogic-validator/test/example.test.mjs'),
    writeFixtureFile(fixtureDir, 'node_modules/pkg/ignored.logic.ts'),
    writeFixtureFile(fixtureDir, 'dist/ignored.logic.ts'),
    writeFixtureFile(fixtureDir, '.hidden/ignored.logic.ts'),
  ]);

  return fixtureDir;
};

const createNamingCandidatePolicy = (overrides = {}) => {
  const namingRuntimeInputs = prepareNamingRuntimeInputs();

  return createValidatorCandidatePolicyFromValues({
    candidateExtensions:
      overrides.reportableExtensions ?? namingRuntimeInputs.reportableExtensions,
    candidateRootFiles:
      overrides.reportableRootFiles ?? namingRuntimeInputs.reportableRootFiles,
    walkExclusions: overrides.walkExclusions ?? namingRuntimeInputs.walkExclusions,
  });
};

const assertNamingCandidateParity = (fixtureDir, options = {}) => {
  const candidatePolicy = createNamingCandidatePolicy(options);
  const oldNamingPaths = collectLegacyNamingRepositoryPaths(fixtureDir, {
    scope: options.scope,
    reportableExtensions:
      options.reportableExtensions ?? new Set(candidatePolicy.candidateExtensions),
    reportableRootFiles:
      options.reportableRootFiles ?? new Set(candidatePolicy.candidateRootFiles),
    walkExclusions:
      options.walkExclusions ?? {
        excludedDirectories: new Set(candidatePolicy.walkExcludedDirectories),
        skipDotDirectories: candidatePolicy.skipDotDirectories,
      },
  });

  assert.deepEqual(
    collectNamingRepositoryPaths(fixtureDir, {
      scope: options.scope,
      targets: options.targets,
      reportableExtensions: options.reportableExtensions,
      reportableRootFiles: options.reportableRootFiles,
      walkExclusions: options.walkExclusions,
    }),
    options.targets?.length
      ? filterLegacyNamingPathsByTargets(fixtureDir, oldNamingPaths, options.targets)
      : oldNamingPaths,
  );
  const newCandidatePaths = collectValidatorCandidatePaths(fixtureDir, {
    scope: options.scope,
    targets: options.targets,
    candidatePolicy,
  });

  if (options.targets?.length) {
    assert.deepEqual(
      newCandidatePaths.selectedPaths,
      filterLegacyNamingPathsByTargets(fixtureDir, oldNamingPaths, options.targets),
    );
  } else {
    assert.deepEqual(newCandidatePaths.selectedPaths, oldNamingPaths);
  }

  assert.deepEqual(newCandidatePaths.inScopePaths, oldNamingPaths);
  return newCandidatePaths;
};

test('suite-core candidate helper reproduces current Naming repo candidate collection', async () => {
  const fixtureDir = await createCandidateFixture();

  try {
    const newCandidatePaths = assertNamingCandidateParity(fixtureDir, { scope: 'repo' });

    assert.deepEqual(newCandidatePaths.selectedPaths, [
      'calculogic-validator/src/core/example.logic.js',
      'calculogic-validator/src/core/example.logic.mjs',
      'calculogic-validator/test/example.test.mjs',
      'doc/guide.md',
      'package-lock.json',
      'package.json',
      'README.md',
      'src/app.logic.ts',
      'src/App.tsx',
      'src/data.json',
      'src/style.css',
      'test/app.test.js',
    ]);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('suite-core candidate helper reproduces current Naming scoped candidate collection', async () => {
  const fixtureDir = await createCandidateFixture();

  try {
    const appCandidates = assertNamingCandidateParity(fixtureDir, { scope: 'app' });
    const validatorCandidates = assertNamingCandidateParity(fixtureDir, { scope: 'validator' });

    assert.deepEqual(appCandidates.selectedPaths, [
      'src/app.logic.ts',
      'src/App.tsx',
      'src/data.json',
      'src/style.css',
      'test/app.test.js',
    ]);
    assert.deepEqual(validatorCandidates.selectedPaths, [
      'calculogic-validator/src/core/example.logic.js',
      'calculogic-validator/src/core/example.logic.mjs',
      'calculogic-validator/test/example.test.mjs',
    ]);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('Naming candidate helper skips symlinked scoped roots to preserve legacy walk behavior', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'naming-symlink-scope-'));
  const outsideDir = await fs.mkdtemp(path.join(os.tmpdir(), 'naming-symlink-outside-'));

  try {
    await writeFixtureFile(outsideDir, 'outside.logic.ts', 'export const outside = true;\n');
    await fs.symlink(outsideDir, path.join(fixtureDir, 'src'), 'dir');
    await writeFixtureFile(fixtureDir, 'test/inside.test.js', 'export const inside = true;\n');

    const runtimeInputs = prepareNamingRuntimeInputs();
    const legacyAppPaths = collectLegacyNamingRepositoryPaths(fixtureDir, {
      scope: 'app',
      reportableExtensions: runtimeInputs.reportableExtensions,
      reportableRootFiles: runtimeInputs.reportableRootFiles,
      walkExclusions: runtimeInputs.walkExclusions,
    });
    const namingAppPaths = collectNamingRepositoryPaths(fixtureDir, { scope: 'app' });
    const directCandidatePaths = collectValidatorCandidatePaths(fixtureDir, {
      scope: 'app',
      skipSymlinkedCandidateScopeRoots: true,
      candidatePolicy: createNamingCandidatePolicy(),
    });

    assert.deepEqual(legacyAppPaths, ['test/inside.test.js']);
    assert.deepEqual(namingAppPaths, legacyAppPaths);
    assert.deepEqual(directCandidatePaths.selectedPaths, legacyAppPaths);
    assert.equal(namingAppPaths.includes('src/outside.logic.ts'), false);
    assert.equal(namingAppPaths.some((selectedPath) => selectedPath.startsWith('src/')), false);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
    await fs.rm(outsideDir, { recursive: true, force: true });
  }
});

test('suite-core candidate helper reproduces current Naming target filtering', async () => {
  const fixtureDir = await createCandidateFixture();

  try {
    const targetCandidates = assertNamingCandidateParity(fixtureDir, {
      scope: 'validator',
      targets: ['calculogic-validator/src/core'],
    });

    assert.deepEqual(targetCandidates.selectedPaths, [
      'calculogic-validator/src/core/example.logic.js',
      'calculogic-validator/src/core/example.logic.mjs',
    ]);
    assert.deepEqual(targetCandidates.targetDescriptors, [
      {
        kind: 'dir',
        relPath: 'calculogic-validator/src/core',
      },
    ]);
    assert.deepEqual(targetCandidates.targets, ['calculogic-validator/src/core']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('suite-core candidate helper preserves current Naming root-file and sorting behavior', async () => {
  const fixtureDir = await createCandidateFixture();

  try {
    const rootFileCandidates = assertNamingCandidateParity(fixtureDir, {
      scope: 'repo',
      reportableExtensions: new Set(['.mjs', '.ts']),
      reportableRootFiles: new Set(['package.json', 'package-lock.json']),
    });

    assert.deepEqual(rootFileCandidates.selectedPaths, [
      'calculogic-validator/src/core/example.logic.mjs',
      'calculogic-validator/test/example.test.mjs',
      'package-lock.json',
      'package.json',
      'src/app.logic.ts',
    ]);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('Naming candidate helper migration preserves config overlay extension additions', async () => {
  const fixtureDir = await createCandidateFixture();

  try {
    await writeFixtureFile(fixtureDir, 'src/overlay.customext', 'overlay\n');

    const defaultPrepared = prepareNamingValidatorInputs(fixtureDir, { scope: 'app' });
    const overlayPrepared = prepareNamingValidatorInputs(fixtureDir, {
      scope: 'app',
      config: { naming: { reportableExtensions: { add: ['.customext'] } } },
    });

    assert.equal(defaultPrepared.selectedPaths.includes('src/overlay.customext'), false);
    assert.equal(overlayPrepared.selectedPaths.includes('src/overlay.customext'), true);
    assert.deepEqual(
      overlayPrepared.selectedPaths,
      [
        'src/app.logic.ts',
        'src/App.tsx',
        'src/data.json',
        'src/overlay.customext',
        'src/style.css',
        'test/app.test.js',
      ],
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('Naming report findings and summaries remain stable when selected paths come from suite-core helper', async () => {
  const fixtureDir = await createCandidateFixture();

  try {
    const prepared = prepareNamingValidatorInputs(fixtureDir, {
      scope: 'validator',
      targets: ['calculogic-validator/src/core'],
    });
    const legacySelectedPaths = filterLegacyNamingPathsByTargets(
      fixtureDir,
      collectLegacyNamingRepositoryPaths(fixtureDir, {
        scope: 'validator',
        reportableExtensions: prepared.reportableExtensions,
        reportableRootFiles: prepared.reportableRootFiles,
        walkExclusions: prepared.walkExclusions,
      }),
      ['calculogic-validator/src/core'],
    );

    assert.deepEqual(prepared.selectedPaths, legacySelectedPaths);

    const migratedReport = runNamingValidator(fixtureDir, {
      scope: 'validator',
      targets: ['calculogic-validator/src/core'],
    });
    const legacyReport = runNamingValidatorRuntime({
      ...prepared,
      selectedPaths: legacySelectedPaths,
      targets: ['calculogic-validator/src/core'],
    });
    const migratedSummary = summarizeFindings(migratedReport.findings);
    const legacySummary = summarizeFindings(legacyReport.findings);

    assert.deepEqual(migratedReport.findings, legacyReport.findings);
    assert.equal(migratedReport.totalFilesScanned, legacyReport.totalFilesScanned);
    assert.deepEqual(migratedReport.filters, legacyReport.filters);
    assert.deepEqual(migratedSummary, legacySummary);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});
