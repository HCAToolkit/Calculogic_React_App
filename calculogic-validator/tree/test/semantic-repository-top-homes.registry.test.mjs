import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

import {
  getBuiltinSemanticRepositoryTopHomesRegistry,
} from '../src/registries/tree-semantic-repository-top-homes-registry.logic.mjs';

const SEMANTIC_REPOSITORY_TOP_HOMES_REGISTRY_PATH = new URL(
  '../src/registries/_builtin/semantic-repository-top-homes.registry.json',
  import.meta.url,
);

const EXPECTED_SEMANTIC_REPOSITORY_TOP_HOMES = [
  'calculogic-doc-engine',
  'calculogic-validator',
];

test('semantic repository-top homes registry provides deterministic active Tree-owned semantic identities', () => {
  const payload = JSON.parse(fs.readFileSync(SEMANTIC_REPOSITORY_TOP_HOMES_REGISTRY_PATH, 'utf8'));

  assert.equal(payload.version, '1');
  assert.deepEqual(
    payload.semanticRepositoryTopHomes.map((entry) => entry.semanticRepositoryTopHome),
    EXPECTED_SEMANTIC_REPOSITORY_TOP_HOMES,
  );

  payload.semanticRepositoryTopHomes.forEach((entry, index) => {
    assert.equal(entry.status, 'active', `semanticRepositoryTopHomes[${index}] should be active`);
    assert.equal(typeof entry.definition, 'string');
    assert.equal(entry.definition.length > 0, true);
  });
});

test('semantic repository-top homes loader exposes the builtin payload', () => {
  assert.deepEqual(
    getBuiltinSemanticRepositoryTopHomesRegistry().semanticRepositoryTopHomes.map((entry) => entry.semanticRepositoryTopHome),
    EXPECTED_SEMANTIC_REPOSITORY_TOP_HOMES,
  );
});
