import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadFindingPolicyFromFile } from '../src/registries/naming-finding-policy.registry.logic.mjs';
import { resolveNamingRegistryInputs } from '../src/registries/registry-state.logic.mjs';
import { toNamingRolesRuntime, toMissingRolePatternsRuntime } from '../src/naming-runtime-converters.logic.mjs';
import { classifyPath } from '../src/naming-validator.logic.mjs';

const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
};

test('finding-policy registry loader canonicalizes and validates payload shape', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-finding-policy-'));
  const filePath = path.join(tempRoot, 'finding-policy.registry.json');

  try {
    writeJson(filePath, {
      outcomes: {
        canonical: {
          code: 'NAMING_CANONICAL',
          severity: 'info',
          classification: 'canonical',
          message: 'Filename is canonical.',
          ruleRef: 'rule',
        },
      },
    });

    const policy = loadFindingPolicyFromFile(filePath);
    assert.deepEqual(Object.keys(policy), ['canonical']);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('missing outcome policy entry fails deterministically during classification', () => {
  const registryInputs = resolveNamingRegistryInputs({ config: {} });

  assert.throws(
    () =>
      classifyPath(
        'src/rightpanel.results-style.css',
        toNamingRolesRuntime(registryInputs.roles),
        toMissingRolePatternsRuntime(registryInputs.missingRolePatterns),
        new Map(),
      ),
    /Missing naming finding policy for outcome "canonical"/u,
  );
});
