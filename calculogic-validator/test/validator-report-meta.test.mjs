import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadValidatorConfigFromFile } from '../src/core/config/validator-config.logic.mjs';
import {
  computeConfigDigest,
  getValidatorToolVersion,
} from '../src/core/validator-report-meta.logic.mjs';

test('getValidatorToolVersion matches calculogic-validator/package.json version', () => {
  const packageJsonPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'package.json',
  );
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  assert.equal(getValidatorToolVersion(), packageJson.version);
});

test('validate-naming report includes stable configDigest when config is supplied', () => {
  const config = loadValidatorConfigFromFile(
    'calculogic-validator/test/fixtures/validator-config.extensions.contracts.json',
    { cwd: process.cwd() },
  );
  const expectedDigest = computeConfigDigest(config);

  const runWithConfig = () =>
    spawnSync(
      process.execPath,
      [
        '--experimental-strip-types',
        'calculogic-validator/scripts/validate-naming.host.mjs',
        '--scope=docs',
        '--config=calculogic-validator/test/fixtures/validator-config.extensions.contracts.json',
      ],
      { cwd: process.cwd(), encoding: 'utf8' },
    );

  const first = runWithConfig();
  const second = runWithConfig();

  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);

  const firstReport = JSON.parse(first.stdout);
  const secondReport = JSON.parse(second.stdout);

  assert.equal(firstReport.toolVersion, getValidatorToolVersion());
  assert.equal(firstReport.configDigest, expectedDigest);
  assert.equal(secondReport.configDigest, expectedDigest);
});
