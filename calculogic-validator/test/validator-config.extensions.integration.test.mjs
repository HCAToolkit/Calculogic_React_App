import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runNamingValidator } from '../src/naming/naming-validator.host.mjs';
import { loadValidatorConfigFromFile } from '../src/core/config/validator-config.logic.mjs';

test('config reportableExtensions.add includes .py files in scan set', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'validator-config-ext-'));

  try {
    fs.mkdirSync(path.join(tempRoot, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tempRoot, 'src', 'script.py'), 'print("hello")\n');

    const withoutConfig = runNamingValidator(tempRoot, { scope: 'repo' });
    const config = loadValidatorConfigFromFile(
      'calculogic-validator/test/fixtures/validator-config.extensions.contracts.json',
      { cwd: process.cwd() },
    );
    const withConfig = runNamingValidator(tempRoot, { scope: 'repo', config });

    assert.equal(withoutConfig.totalFilesScanned, 0);
    assert.equal(withConfig.totalFilesScanned, 1);
    assert.equal(withConfig.findings[0].path, 'src/script.py');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
