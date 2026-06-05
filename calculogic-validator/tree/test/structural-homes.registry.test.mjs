import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

const STRUCTURAL_HOMES_REGISTRY_PATH = new URL(
  '../src/registries/_builtin/structural-homes.registry.json',
  import.meta.url,
);

const EXPECTED_STRUCTURAL_HOMES = [
  'app',
  'assets',
  'bin',
  'calculogic-doc-engine',
  'calculogic-validator',
  'compat',
  'config',
  'data',
  'doc',
  'docs',
  'examples',
  'experimental',
  'generated',
  'ops',
  'public',
  'scripts',
  'src',
  'test',
  'tests',
  'tools',
  'vendor',
];

test('structural-homes registry provides deterministic active structural-home identities', () => {
  const payload = JSON.parse(fs.readFileSync(STRUCTURAL_HOMES_REGISTRY_PATH, 'utf8'));

  assert.equal(payload.version, '1');
  assert.deepEqual(
    payload.structuralHomes.map((entry) => entry.structuralHome),
    EXPECTED_STRUCTURAL_HOMES,
  );

  payload.structuralHomes.forEach((entry, index) => {
    assert.equal(entry.status, 'active', `structuralHomes[${index}] should be active`);
    assert.equal(typeof entry.definition, 'string');
    assert.equal(entry.definition.length > 0, true);
  });
});
