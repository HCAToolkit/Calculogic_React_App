import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  classifyPath as classifyPathRuntime,
  collectRepositoryPaths as collectRepositoryPathsRuntime,
} from '../src/naming/naming-validator.logic.mjs';
import {
  classifyPath,
  collectRepositoryPaths,
  prepareNamingRuntimeInputs,
} from '../src/validators/naming-validator.logic.mjs';

const writeFile = (rootDirectory, relativePath) => {
  const absolutePath = path.join(rootDirectory, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, 'x', 'utf8');
};

test('wiring-injected classifyPath aligns with runtime when using prepared registry payload', () => {
  const prepared = prepareNamingRuntimeInputs({});

  const wiringCanonical = classifyPath('src/rightpanel.results-style.css');
  const runtimeCanonical = classifyPathRuntime(
    'src/rightpanel.results-style.css',
    prepared.namingRolesRuntime,
  );
  assert.deepEqual(wiringCanonical, runtimeCanonical);

  const wiringDeprecated = classifyPath('src/tabs/build/BuildSurface.view.css');
  const runtimeDeprecated = classifyPathRuntime(
    'src/tabs/build/BuildSurface.view.css',
    prepared.namingRolesRuntime,
  );
  assert.deepEqual(wiringDeprecated, runtimeDeprecated);
});

test('wiring-injected collectRepositoryPaths aligns with runtime when using prepared reportable extensions', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-default-runtime-'));

  try {
    writeFile(tempRoot, 'src/visible.logic.ts');
    writeFile(tempRoot, 'doc/readme.spec.md');
    writeFile(tempRoot, 'src/skip.tmp');

    const prepared = prepareNamingRuntimeInputs({});

    const collectedWiring = collectRepositoryPaths(tempRoot, { scope: 'repo' });
    const collectedRuntime = collectRepositoryPathsRuntime(tempRoot, {
      scope: 'repo',
      reportableExtensions: prepared.reportableExtensions,
    });

    assert.deepEqual(collectedWiring, collectedRuntime);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('wiring helper overrides still win over prepared defaults', () => {
  const runtimeWithoutHost = {
    roleMetadata: new Map([
      ['logic', { role: 'logic', category: 'concern-core', status: 'active' }],
    ]),
    activeRoles: new Set(['logic']),
    roleSuffixes: ['logic'],
  };

  const defaultFinding = classifyPath('src/panel.host.tsx');
  const overrideFinding = classifyPath('src/panel.host.tsx', runtimeWithoutHost);

  assert.equal(defaultFinding.code, 'NAMING_CANONICAL');
  assert.equal(overrideFinding.code, 'NAMING_UNKNOWN_ROLE');
});

test('wiring helper reportableExtensions override still wins over prepared defaults', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-default-ext-'));

  try {
    writeFile(tempRoot, 'src/notes.tmp');
    writeFile(tempRoot, 'src/visible.logic.ts');

    const defaultCollected = collectRepositoryPaths(tempRoot, { scope: 'repo' });
    const overrideCollected = collectRepositoryPaths(tempRoot, {
      scope: 'repo',
      reportableExtensions: new Set(['.tmp']),
    });

    assert.equal(defaultCollected.includes('src/notes.tmp'), false);
    assert.equal(overrideCollected.includes('src/notes.tmp'), true);
    assert.equal(overrideCollected.includes('src/visible.logic.ts'), false);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
