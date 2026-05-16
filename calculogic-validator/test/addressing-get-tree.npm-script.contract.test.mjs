import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const packageJsonPath = path.resolve(process.cwd(), 'package.json');

test('root package script wiring exposes addressing:get-tree direct host command', async () => {
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

  assert.equal(
    packageJson.scripts['addressing:get-tree'],
    'node --experimental-strip-types calculogic-validator/scripts/addressing-get-tree.host.mjs',
  );
});
