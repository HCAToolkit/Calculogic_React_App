import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  classifyPath,
  collectRepositoryPaths,
} from '../src/validators/naming-validator.logic.mjs';
import { resolveNamingRegistryInputs } from '../src/naming/registries/registry-state.logic.mjs';

const toNamingRolesRuntime = (rolesArray) => {
  const roleMetadata = new Map();

  rolesArray.forEach((entry) => {
    if (!roleMetadata.has(entry.role)) {
      roleMetadata.set(entry.role, entry);
    }
  });

  const activeRoles = new Set(
    Array.from(roleMetadata.values())
      .filter((entry) => entry.status === 'active')
      .map((entry) => entry.role),
  );

  const roleSuffixes = Array.from(roleMetadata.keys()).sort(
    (left, right) => right.length - left.length,
  );

  return {
    roleMetadata,
    activeRoles,
    roleSuffixes,
  };
};

const writeFile = (rootDirectory, relativePath) => {
  const absolutePath = path.join(rootDirectory, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, 'x', 'utf8');
};

test('default direct classifyPath runtime aligns with builtin registry resolver payload', () => {
  const registryInputs = resolveNamingRegistryInputs({ config: {} });
  const explicitRuntime = toNamingRolesRuntime(registryInputs.roles);

  const canonicalDefault = classifyPath('src/rightpanel.results-style.css');
  const canonicalExplicit = classifyPath('src/rightpanel.results-style.css', explicitRuntime);
  assert.deepEqual(canonicalDefault, canonicalExplicit);

  const deprecatedDefault = classifyPath('src/tabs/build/BuildSurface.view.css');
  const deprecatedExplicit = classifyPath('src/tabs/build/BuildSurface.view.css', explicitRuntime);
  assert.deepEqual(deprecatedDefault, deprecatedExplicit);
});

test('default direct collectRepositoryPaths reportable extension behavior aligns with builtin registry resolver payload', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-default-runtime-'));

  try {
    writeFile(tempRoot, 'src/visible.logic.ts');
    writeFile(tempRoot, 'doc/readme.spec.md');
    writeFile(tempRoot, 'src/skip.tmp');

    const registryInputs = resolveNamingRegistryInputs({ config: {} });
    const explicitReportableExtensions = new Set(registryInputs.reportableExtensions);

    const collectedDefault = collectRepositoryPaths(tempRoot, { scope: 'repo' });
    const collectedExplicit = collectRepositoryPaths(tempRoot, {
      scope: 'repo',
      reportableExtensions: explicitReportableExtensions,
    });

    assert.deepEqual(collectedDefault, collectedExplicit);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('direct runtime overrides still win over default registry-backed runtime', () => {
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

test('direct reportableExtensions override still wins over default registry-backed extensions', () => {
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

test('default direct runtime remains builtin-backed even when registry-state is custom', async () => {
  const registryDir = path.resolve(
    process.cwd(),
    'calculogic-validator/src/naming/registries',
  );
  const registryStatePath = path.join(registryDir, 'registry-state.json');
  const customExtensionsPath = path.join(
    registryDir,
    '_custom',
    'reportable-extensions.registry.custom.json',
  );

  const originalRegistryState = fs.readFileSync(registryStatePath, 'utf8');
  const originalCustomExtensions = fs.readFileSync(customExtensionsPath, 'utf8');

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-default-builtin-pinned-'));

  try {
    fs.writeFileSync(
      registryStatePath,
      JSON.stringify({ schemaVersion: '1', activeRegistry: 'custom' }, null, 2),
      'utf8',
    );
    fs.writeFileSync(
      customExtensionsPath,
      JSON.stringify(['.tmp'], null, 2),
      'utf8',
    );

    writeFile(tempRoot, 'src/visible.logic.ts');
    writeFile(tempRoot, 'src/custom-only.tmp');

    const modulePath = path.resolve(
      process.cwd(),
      'calculogic-validator/src/naming/naming-validator.logic.mjs',
    );
    const cacheBypassSpecifier = `file://${modulePath}?builtin-default-check=${Date.now()}`;
    const { collectRepositoryPaths: collectRepositoryPathsDirect } = await import(
      cacheBypassSpecifier
    );

    const collected = collectRepositoryPathsDirect(tempRoot, { scope: 'repo' });

    assert.equal(collected.includes('src/visible.logic.ts'), true);
    assert.equal(collected.includes('src/custom-only.tmp'), false);
  } finally {
    fs.writeFileSync(registryStatePath, originalRegistryState, 'utf8');
    fs.writeFileSync(customExtensionsPath, originalCustomExtensions, 'utf8');
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
