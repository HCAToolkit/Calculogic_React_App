import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadOverlayCapabilitiesFromFile } from '../src/registries/naming-overlay-capabilities.registry.logic.mjs';

const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
};

test('overlay capabilities loader canonicalizes bounded entries', () => {
  const registryPath = path.join(
    'calculogic-validator',
    'naming',
    'src',
    'registries',
    '_builtin',
    'overlay-capabilities.registry.json',
  );

  const loaded = loadOverlayCapabilitiesFromFile(registryPath);

  assert.ok(Array.isArray(loaded.entries));
  assert.deepEqual(Object.keys(loaded.byPathOperation).sort((a, b) => a.localeCompare(b)), [
    'naming.reportableExtensions:add',
    'naming.roles:add',
  ]);
});

test('overlay capabilities loader rejects malformed payload deterministically', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'overlay-cap-registry-'));

  try {
    const malformedPath = path.join(tempRoot, 'overlay-capabilities.registry.json');
    writeJson(malformedPath, {
      version: '1',
      capabilities: [
        {
          configPath: 'naming.roles',
          operation: 'replace',
          payloadType: 'role-array',
          target: 'roles',
        },
      ],
    });

    assert.throws(
      () => loadOverlayCapabilitiesFromFile(malformedPath),
      /operation must be "add"/u,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
