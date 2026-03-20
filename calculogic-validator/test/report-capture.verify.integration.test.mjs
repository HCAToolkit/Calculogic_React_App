import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const verifierScriptPath = path.resolve('calculogic-validator/scripts/report-capture-verify.host.mjs');

const runVerifier = ({ reportsDir, scopes }) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [verifierScriptPath, `--scopes=${scopes.join(',')}`], {
      env: {
        ...process.env,
        REPORTS_DIR: reportsDir,
      },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });
  });

test('report-capture verifier emits and validates docs scope report in custom reports dir', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-capture-verify-'));

  try {
    const result = await runVerifier({
      reportsDir: tempDir,
      scopes: ['docs'],
    });

    assert.equal(result.exitCode, 0, result.stderr || result.stdout);

    const files = fs.readdirSync(tempDir).filter((name) => /^naming-docs-.*\.txt$/u.test(name));
    assert.equal(files.length, 1, `expected one report file, got ${files.join(',')}`);

    const reportPath = path.join(tempDir, files[0]);
    const parsedReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    assert.equal(parsedReport.scope, 'docs');
    assert.equal(parsedReport.mode, 'report');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
