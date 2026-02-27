import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadValidatorConfigFromFile } from '../src/validator-config.logic.mjs';

const fixturePath = 'calculogic-validator/test/fixtures/validator-config.extensions.contracts.json';

test('loads validator config and normalizes reportable extension additions', () => {
  const config = loadValidatorConfigFromFile(fixturePath, { cwd: process.cwd() });

  assert.equal(config.version, '0.1');
  assert.deepEqual(config.naming?.reportableExtensions?.add, ['.py']);
});

test('fails when version is not supported', () => {
  const invalidPath = path.join(process.cwd(), 'calculogic-validator/test/fixtures/tmp-invalid-version.json');
  fs.writeFileSync(invalidPath, JSON.stringify({ version: '9.9' }));

  try {
    assert.throws(
      () => loadValidatorConfigFromFile(invalidPath, { cwd: '/' }),
      /Invalid validator config: version must be "0.1"\./u,
    );
  } finally {
    fs.rmSync(invalidPath, { force: true });
  }
});

test('fails when extension entries do not start with dot', () => {
  const invalidPath = path.join(process.cwd(), 'calculogic-validator/test/fixtures/tmp-invalid-extension.json');
  fs.writeFileSync(
    invalidPath,
    JSON.stringify({
      version: '0.1',
      naming: { reportableExtensions: { add: ['py'] } },
    }),
  );

  try {
    assert.throws(
      () => loadValidatorConfigFromFile(invalidPath, { cwd: '/' }),
      /Invalid validator config: naming\.reportableExtensions\.add\[0\] must start with "\."\./u,
    );
  } finally {
    fs.rmSync(invalidPath, { force: true });
  }
});
