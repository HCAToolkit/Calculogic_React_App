import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadValidatorConfigFromFile } from '../src/validator-config.logic.mjs';

const fixturePath = 'calculogic-validator/test/fixtures/validator-config.roles.contracts.json';

const writeTempConfig = (filename, payload) => {
  const tempPath = path.join(process.cwd(), `calculogic-validator/test/fixtures/${filename}`);
  fs.writeFileSync(tempPath, JSON.stringify(payload));
  return tempPath;
};

test('loads validator config with naming.roles.add entries', () => {
  const config = loadValidatorConfigFromFile(fixturePath, { cwd: process.cwd() });

  assert.equal(config.version, '0.1');
  assert.deepEqual(config.naming?.roles?.add, [
    {
      role: 'provider',
      category: 'architecture-support',
      status: 'active',
      notes: 'Extension role for provider-oriented module naming.',
    },
  ]);
});

test('normalizes naming.roles.add by trimming and deduplicating first role entry', () => {
  const tempPath = writeTempConfig('tmp-roles-normalize.json', {
    version: '0.1',
    naming: {
      roles: {
        add: [
          { role: ' provider ', category: 'architecture-support', status: 'active' },
          {
            role: 'provider',
            category: 'deprecated',
            status: 'deprecated',
            notes: 'ignored duplicate',
          },
        ],
      },
    },
  });

  try {
    const config = loadValidatorConfigFromFile(tempPath, { cwd: '/' });
    assert.deepEqual(config.naming?.roles?.add, [
      { role: 'provider', category: 'architecture-support', status: 'active' },
    ]);
  } finally {
    fs.rmSync(tempPath, { force: true });
  }
});

test('fails when role addition entry is missing required role field', () => {
  const tempPath = writeTempConfig('tmp-roles-missing-role.json', {
    version: '0.1',
    naming: {
      roles: {
        add: [{ category: 'architecture-support', status: 'active' }],
      },
    },
  });

  try {
    assert.throws(
      () => loadValidatorConfigFromFile(tempPath, { cwd: '/' }),
      /Invalid validator config: naming\.roles\.add\[0\]\.role must be a non-empty string\./u,
    );
  } finally {
    fs.rmSync(tempPath, { force: true });
  }
});

test('fails when naming.roles.add category or status is invalid', () => {
  const invalidCategoryPath = writeTempConfig('tmp-roles-invalid-category.json', {
    version: '0.1',
    naming: {
      roles: {
        add: [{ role: 'provider', category: 'wrong-category', status: 'active' }],
      },
    },
  });

  const invalidStatusPath = writeTempConfig('tmp-roles-invalid-status.json', {
    version: '0.1',
    naming: {
      roles: {
        add: [{ role: 'provider', category: 'architecture-support', status: 'wrong-status' }],
      },
    },
  });

  try {
    assert.throws(
      () => loadValidatorConfigFromFile(invalidCategoryPath, { cwd: '/' }),
      /Invalid validator config: naming\.roles\.add\[0\]\.category must be one of: concern-core, architecture-support, documentation, deprecated\./u,
    );

    assert.throws(
      () => loadValidatorConfigFromFile(invalidStatusPath, { cwd: '/' }),
      /Invalid validator config: naming\.roles\.add\[0\]\.status must be one of: active, deprecated\./u,
    );
  } finally {
    fs.rmSync(invalidCategoryPath, { force: true });
    fs.rmSync(invalidStatusPath, { force: true });
  }
});
