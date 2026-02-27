import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repositoryRoot = path.resolve(__dirname, '..', '..');

test('validator health check exits successfully', () => {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', 'calculogic-validator/scripts/validator-health-check.host.mjs'],
    {
      cwd: repositoryRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0, `Expected exit code 0, got ${result.status}\n${result.stderr}`);
  assert.match(result.stdout, /OK:/);
});
