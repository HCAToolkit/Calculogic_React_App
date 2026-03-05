import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runNamingValidator } from '../src/naming/naming-validator.host.mjs';
import { loadValidatorConfigFromFile } from '../src/validator-config.logic.mjs';

test('config naming.roles.add recognizes added role and changes classification delta', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'validator-config-roles-'));

  try {
    fs.mkdirSync(path.join(tempRoot, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tempRoot, 'src', 'demo.provider.ts'), 'export const demo = 1;\n');

    const withoutConfig = runNamingValidator(tempRoot, { scope: 'repo' });
    const noConfigFinding = withoutConfig.findings.find(
      (finding) => finding.path === 'src/demo.provider.ts',
    );

    assert.ok(noConfigFinding);
    assert.equal(noConfigFinding.code, 'NAMING_UNKNOWN_ROLE');

    const config = loadValidatorConfigFromFile(
      'calculogic-validator/test/fixtures/validator-config.roles.contracts.json',
      { cwd: process.cwd() },
    );
    const withConfig = runNamingValidator(tempRoot, { scope: 'repo', config });
    const withConfigFinding = withConfig.findings.find(
      (finding) => finding.path === 'src/demo.provider.ts',
    );

    assert.ok(withConfigFinding);
    assert.notEqual(withConfigFinding.code, 'NAMING_UNKNOWN_ROLE');
    assert.equal(withConfigFinding.code, 'NAMING_CANONICAL');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
