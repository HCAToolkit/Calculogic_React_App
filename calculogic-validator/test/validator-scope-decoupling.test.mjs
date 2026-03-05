import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const validateAllScriptPath = 'calculogic-validator/scripts/validate-all.mjs';
const calculateValidateBinPath = 'calculogic-validator/bin/calculogic-validate.mjs';

const assertDecoupledFromNamingScopeHelpers = (filePath) => {
  const fileContents = fs.readFileSync(filePath, 'utf8');

  assert.equal(fileContents.includes('listNamingValidatorScopes'), false);
  assert.equal(fileContents.includes('getScopeProfile'), false);
  assert.equal(fileContents.includes('../src/naming/naming-validator.host.mjs'), false);
};

test('validate-all script does not couple scope usage to naming validator host helpers', () => {
  assertDecoupledFromNamingScopeHelpers(validateAllScriptPath);
});

test('calculogic-validate bin does not couple scope usage to naming validator host helpers', () => {
  assertDecoupledFromNamingScopeHelpers(calculateValidateBinPath);
});
