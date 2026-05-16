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

test('root package script wiring exposes report:addressing:get-tree:validator capture command', async () => {
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  const reportScript = packageJson.scripts['report:addressing:get-tree:validator'];

  assert.equal(typeof reportScript, 'string');
  assert.match(reportScript, /calculogic-report-capture/u);
  assert.match(reportScript, /--json/u);
  assert.match(reportScript, /--dir \.\/\.reports/u);
  assert.match(reportScript, /--keep 20/u);
  assert.match(reportScript, /--prefix addressing-get-tree-validator/u);
  assert.match(reportScript, /npm run addressing:get-tree/u);
  assert.match(reportScript, /npm run addressing:get-tree -- --scope=validator/u);
  assert.match(reportScript, /--format=both/u);
  assert.doesNotMatch(reportScript, /validate:addressing/u);
  assert.doesNotMatch(reportScript, /runValidatorRunnerCli/u);
  assert.doesNotMatch(reportScript, /runValidatorRunner/u);
});


test('root package script wiring keeps validate:addressing namespace unimplemented for get-tree V0', async () => {
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  const scriptNames = Object.keys(packageJson.scripts);

  assert.equal(scriptNames.some((name) => name.startsWith('validate:addressing')), false);
});
