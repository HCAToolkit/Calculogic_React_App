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

test('fails when config root contains unknown key', () => {
  const tempPath = writeTempConfig('tmp-config-unknown-root-key.json', {
    version: '0.1',
    extra: true,
  });

  try {
    assert.throws(
      () => loadValidatorConfigFromFile(tempPath, { cwd: '/' }),
      /Invalid validator config: root contains unknown key "extra"\./u,
    );
  } finally {
    fs.rmSync(tempPath, { force: true });
  }
});

test('fails when naming contains unknown key', () => {
  const tempPath = writeTempConfig('tmp-config-unknown-naming-key.json', {
    version: '0.1',
    naming: {
      foo: {},
    },
  });

  try {
    assert.throws(
      () => loadValidatorConfigFromFile(tempPath, { cwd: '/' }),
      /Invalid validator config: naming contains unknown key "foo"\./u,
    );
  } finally {
    fs.rmSync(tempPath, { force: true });
  }
});

test('fails when role entry contains unknown key', () => {
  const tempPath = writeTempConfig('tmp-config-unknown-role-entry-key.json', {
    version: '0.1',
    naming: {
      roles: {
        add: [{ role: 'x', category: 'documentation', status: 'active', extra: 1 }],
      },
    },
  });

  try {
    assert.throws(
      () => loadValidatorConfigFromFile(tempPath, { cwd: '/' }),
      /Invalid validator config: naming\.roles\.add\[0\] contains unknown key "extra"\./u,
    );
  } finally {
    fs.rmSync(tempPath, { force: true });
  }
});

test('still loads existing roles fixture under strict validation', () => {
  const config = loadValidatorConfigFromFile(fixturePath, { cwd: process.cwd() });

  assert.equal(config.version, '0.1');
  assert.equal(config.naming?.roles?.add?.[0]?.role, 'provider');
});
