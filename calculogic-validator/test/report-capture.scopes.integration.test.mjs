import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const scopes = ['repo', 'app', 'docs', 'validator', 'system'];
const hostPath = path.resolve(
  'calculogic-validator/tools/report-capture/src/report-capture.host.mjs',
);

const runReportCapture = (prefix, scriptPath, scope, outputDir) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
      hostPath,
      '--dir',
      outputDir,
      '--keep',
      '50',
      '--prefix',
      prefix,
      '--',
      process.execPath,
      '--experimental-strip-types',
      scriptPath,
      `--scope=${scope}`,
    ]);

    child.on('error', reject);
    child.on('close', (code) => {
      if (typeof code !== 'number') {
        reject(new Error(`report capture returned non-numeric exit code for ${prefix}`));
        return;
      }

      resolve(code);
    });
  });

const reportFilesForPrefix = (dirPath, prefix) =>
  fs
    .readdirSync(dirPath)
    .filter((name) => name.startsWith(`${prefix}-`) && name.endsWith('.txt'))
    .sort();

test('report-capture host emits naming reports for repo/app/docs/validator/system scopes', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-capture-scopes-naming-'));

  try {
    for (const scope of scopes) {
      const prefix = `naming-${scope}`;
      const before = reportFilesForPrefix(tempDir, prefix);

      const exitCode = await runReportCapture(
        prefix,
        'calculogic-validator/scripts/validate-naming.host.mjs',
        scope,
        tempDir,
      );
      assert.ok([0, 1, 2].includes(exitCode));

      const after = reportFilesForPrefix(tempDir, prefix);
      assert.equal(after.length, before.length + 1);

      const newest = after.at(-1);
      assert.ok(newest, `missing report file for ${prefix}`);

      const reportContent = fs.readFileSync(path.join(tempDir, newest), 'utf8');
      assert.ok(reportContent.includes(`"scope": "${scope}"`));
      assert.ok(reportContent.includes('"mode": "report"'));
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('report-capture host emits validate-all reports for repo/app/docs/validator/system scopes', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-capture-scopes-all-'));

  try {
    for (const scope of scopes) {
      const prefix = `validate-all-${scope}`;
      const before = reportFilesForPrefix(tempDir, prefix);

      const exitCode = await runReportCapture(
        prefix,
        'calculogic-validator/scripts/validate-all.host.mjs',
        scope,
        tempDir,
      );
      assert.ok([0, 1, 2].includes(exitCode));

      const after = reportFilesForPrefix(tempDir, prefix);
      assert.equal(after.length, before.length + 1);

      const newest = after.at(-1);
      assert.ok(newest, `missing report file for ${prefix}`);

      const reportContent = fs.readFileSync(path.join(tempDir, newest), 'utf8');
      assert.ok(reportContent.includes(`"scope": "${scope}"`));
      assert.ok(reportContent.includes('"mode": "report"'));
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});


test('report-capture host emits validate-tree reports for repo/app/docs/validator/system scopes', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-capture-scopes-tree-'));

  try {
    for (const scope of scopes) {
      const prefix = `validate-tree-${scope}`;
      const before = reportFilesForPrefix(tempDir, prefix);

      const exitCode = await runReportCapture(
        prefix,
        'calculogic-validator/scripts/validate-tree.host.mjs',
        scope,
        tempDir,
      );
      assert.ok([0, 1, 2].includes(exitCode));

      const after = reportFilesForPrefix(tempDir, prefix);
      assert.equal(after.length, before.length + 1);

      const newest = after.at(-1);
      assert.ok(newest, `missing report file for ${prefix}`);

      const reportContent = fs.readFileSync(path.join(tempDir, newest), 'utf8');
      assert.ok(reportContent.includes(`"scope": "${scope}"`));
      assert.ok(reportContent.includes('"mode": "report"'));
      assert.ok(reportContent.includes('"id": "tree-structure-advisor"'));
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
