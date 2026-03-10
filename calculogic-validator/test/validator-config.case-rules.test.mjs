import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadValidatorConfigFromFile } from '../src/core/config/validator-config.logic.mjs';

const writeTempConfig = (filename, payload) => {
  const tempPath = path.join(process.cwd(), `calculogic-validator/test/fixtures/${filename}`);
  fs.writeFileSync(tempPath, JSON.stringify(payload));
  return tempPath;
};

test('accepts naming.caseRules.semanticName.style kebab-case and normalizes value', () => {
  const tempPath = writeTempConfig('tmp-case-rules-valid-kebab-case.json', {
    version: '0.1',
    naming: {
      caseRules: {
        semanticName: {
          style: ' kebab-case ',
        },
      },
    },
  });

  try {
    const config = loadValidatorConfigFromFile(tempPath, { cwd: '/' });
    assert.deepEqual(config.naming?.caseRules, {
      semanticName: {
        style: 'kebab-case',
      },
    });
  } finally {
    fs.rmSync(tempPath, { force: true });
  }
});

test('rejects unsupported naming.caseRules.semanticName.style value', () => {
  const tempPath = writeTempConfig('tmp-case-rules-invalid-style.json', {
    version: '0.1',
    naming: {
      caseRules: {
        semanticName: {
          style: 'snake_case',
        },
      },
    },
  });

  try {
    assert.throws(
      () => loadValidatorConfigFromFile(tempPath, { cwd: '/' }),
      /Invalid validator config: naming\.caseRules\.semanticName\.style must be "kebab-case"\./u,
    );
  } finally {
    fs.rmSync(tempPath, { force: true });
  }
});

test('rejects unknown key under naming.caseRules', () => {
  const tempPath = writeTempConfig('tmp-case-rules-unknown-key.json', {
    version: '0.1',
    naming: {
      caseRules: {
        semanticName: {
          style: 'kebab-case',
        },
        extra: {},
      },
    },
  });

  try {
    assert.throws(
      () => loadValidatorConfigFromFile(tempPath, { cwd: '/' }),
      /Invalid validator config: naming\.caseRules contains unknown key "extra"\./u,
    );
  } finally {
    fs.rmSync(tempPath, { force: true });
  }
});
