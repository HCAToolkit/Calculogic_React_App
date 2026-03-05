import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveNamingRegistryInputs } from '../src/naming/registries/registry-state.logic.mjs';

const makeTempRegistryRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), 'registry-state-test-'));

const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
};

const assertDigestShape = (digest) => {
  assert.equal(typeof digest, 'string');
  assert.equal(digest.length, 64);
  assert.match(digest, /^[a-f0-9]{64}$/u);
};

test('defaults to builtin when registry-state.json is missing', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    const result = resolveNamingRegistryInputs({ registryRootDir: tempRoot });

    assert.equal(result.registryState, 'builtin');
    assert.equal(result.registrySource, 'builtin');
    assertDigestShape(result.registryDigests.builtin);
    assertDigestShape(result.registryDigests.custom);
    assertDigestShape(result.registryDigests.resolved);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('builtin state selects builtin and digests stay stable across calls', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'builtin',
    });

    const first = resolveNamingRegistryInputs({ registryRootDir: tempRoot });
    const second = resolveNamingRegistryInputs({ registryRootDir: tempRoot });

    assert.equal(first.registryState, 'builtin');
    assert.equal(first.registrySource, 'builtin');
    assert.equal(first.registryDigests.builtin, second.registryDigests.builtin);
    assert.equal(first.registryDigests.custom, second.registryDigests.custom);
    assert.equal(first.registryDigests.resolved, second.registryDigests.resolved);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('custom state selects custom and digests diverge from builtin when payload differs', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });

    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'host', category: 'architecture-support', status: 'active' },
      { role: 'custom-role', category: 'architecture-support', status: 'active' },
    ]);

    writeJson(path.join(tempRoot, '_custom', 'reportable-extensions.registry.custom.json'), [
      '.ts',
      '.abc',
    ]);

    const result = resolveNamingRegistryInputs({ registryRootDir: tempRoot });

    assert.equal(result.registryState, 'custom');
    assert.equal(result.registrySource, 'custom');
    assert.notEqual(result.registryDigests.custom, result.registryDigests.builtin);
    assert.equal(result.registryDigests.resolved, result.registryDigests.custom);
    assert.ok(result.roles.some((entry) => entry.role === 'custom-role'));
    assert.ok(result.reportableExtensions.includes('.abc'));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('throws on invalid activeRegistry value', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'nope',
    });

    assert.throws(
      () => resolveNamingRegistryInputs({ registryRootDir: tempRoot }),
      /Invalid activeRegistry/u,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('throws when custom is active and custom files are missing', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });

    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'host', category: 'architecture-support', status: 'active' },
    ]);

    assert.throws(
      () => resolveNamingRegistryInputs({ registryRootDir: tempRoot }),
      /Custom registry file missing: _custom\/reportable-extensions\.registry\.custom\.json\./u,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('throws when custom roles include invalid category', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });

    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'x', category: 'nope', status: 'active' },
    ]);

    writeJson(path.join(tempRoot, '_custom', 'reportable-extensions.registry.custom.json'), [
      '.ts',
    ]);

    assert.throws(
      () => resolveNamingRegistryInputs({ registryRootDir: tempRoot }),
      /category must be one of/u,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('throws when custom roles include invalid status', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });

    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'x', category: 'architecture-support', status: 'provisional' },
    ]);

    writeJson(path.join(tempRoot, '_custom', 'reportable-extensions.registry.custom.json'), [
      '.ts',
    ]);

    assert.throws(
      () => resolveNamingRegistryInputs({ registryRootDir: tempRoot }),
      /status must be "active" or "deprecated"/u,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('throws when custom reportable extension omits leading dot', () => {
  const tempRoot = makeTempRegistryRoot();

  try {
    writeJson(path.join(tempRoot, 'registry-state.json'), {
      schemaVersion: '1',
      activeRegistry: 'custom',
    });

    writeJson(path.join(tempRoot, '_custom', 'roles.registry.custom.json'), [
      { role: 'host', category: 'architecture-support', status: 'active' },
    ]);

    writeJson(path.join(tempRoot, '_custom', 'reportable-extensions.registry.custom.json'), ['ts']);

    assert.throws(
      () => resolveNamingRegistryInputs({ registryRootDir: tempRoot }),
      /must start with "\."|must start with "."/u,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
