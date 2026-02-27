import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { VALIDATOR_CONFIG_VERSION } from '../src/validator-config.contracts.mjs';

test('validator config schema version const matches runtime contract version', () => {
  const schemaPath = path.join(process.cwd(), 'calculogic-validator/src/validator-config.schema.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  assert.equal(schema?.properties?.version?.const, VALIDATOR_CONFIG_VERSION);
});
