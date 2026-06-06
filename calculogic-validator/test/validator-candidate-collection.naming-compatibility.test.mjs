import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  collectRepositoryPaths as collectNamingRepositoryPaths,
  prepareNamingRuntimeInputs,
  prepareNamingValidatorInputs,
} from '../naming/src/naming-validator.wiring.mjs';
import { createValidatorCandidatePolicyFromValues } from '../src/core/validator-candidate-policy.logic.mjs';
import { collectValidatorCandidatePaths } from '../src/core/validator-candidate-collection.logic.mjs';

const writeFixtureFile = async (fixtureDir, relativePath, content = 'fixture\n') => {
  const absolutePath = path.join(fixtureDir, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, 'utf8');
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
  const oldNamingPaths = collectNamingRepositoryPaths(fixtureDir, {
    scope: options.scope,
    reportableExtensions: options.reportableExtensions,
    reportableRootFiles: options.reportableRootFiles,
    walkExclusions: options.walkExclusions,
  });
  const newCandidatePaths = collectValidatorCandidatePaths(fixtureDir, {
    scope: options.scope,
    targets: options.targets,
    candidatePolicy,
  });

  if (options.targets?.length) {
    const oldPreparedInputs = prepareNamingValidatorInputs(fixtureDir, {
      scope: options.scope,
      targets: options.targets,
    });

    assert.deepEqual(newCandidatePaths.selectedPaths, oldPreparedInputs.selectedPaths);
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
