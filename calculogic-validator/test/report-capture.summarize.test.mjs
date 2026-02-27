import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const summarizerScriptPath = path.resolve('calculogic-validator/scripts/report-capture-summarize.mjs');

const runSummarizer = args => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [summarizerScriptPath, ...args]);

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', chunk => {
    stdout += chunk.toString();
  });

  child.stderr.on('data', chunk => {
    stderr += chunk.toString();
  });

  child.on('error', reject);
  child.on('close', code => {
    resolve({ exitCode: code ?? 1, stdout, stderr });
  });
});

const writeReport = ({ dir, filename, report, mtime }) => {
  const reportPath = path.join(dir, filename);
  fs.writeFileSync(reportPath, JSON.stringify(report));
  fs.utimesSync(reportPath, mtime, mtime);
};

test('report-capture summarizer uses newest file and prints compact docs scope summary', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-capture-summarize-'));

  try {
    writeReport({
      dir: tempDir,
      filename: 'naming-docs-2026-02-26_09-00-00.txt',
      mtime: new Date('2026-02-26T09:00:00.000Z'),
      report: {
        scope: 'docs',
        totalFilesScanned: 10,
        findingsGenerated: 2,
        counts: {
          canonical: 8,
          allowed: 1,
          legacy: 0,
          invalid: 1,
        },
        codeCounts: {
          olderRule: 2,
        },
        findings: [
          {
            severity: 'warn',
            code: 'olderRule',
            path: 'doc/old.md',
          },
        ],
      },
    });

    writeReport({
      dir: tempDir,
      filename: 'naming-docs-2026-02-26_10-00-00.txt',
      mtime: new Date('2026-02-26T10:00:00.000Z'),
      report: {
        scope: 'docs',
        totalFilesScanned: 11,
        findingsGenerated: 3,
        counts: {
          canonical: 8,
          allowed: 1,
          legacy: 1,
          invalid: 1,
        },
        codeCounts: {
          warnRuleA: 2,
          warnRuleB: 1,
          infoRuleC: 4,
        },
        findings: [
          {
            severity: 'warn',
            code: 'warnRuleA',
            path: 'doc/new.md',
          },
          {
            severity: 'error',
            code: 'errRuleA',
            path: 'doc/err.md',
          },
        ],
      },
    });

    const result = await runSummarizer([
      `--dir=${tempDir}`,
      '--prefixes=naming-docs',
      '--top=3',
      '--warn-samples=1',
    ]);

    assert.equal(result.exitCode, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /naming-docs/u);
    assert.match(result.stdout, /naming-docs-2026-02-26_10-00-00\.txt/u);
    assert.match(result.stdout, /scope:\s*docs/u);
    assert.match(result.stdout, /warnCount:\s*1/u);
    assert.match(result.stdout, /warnRuleA:\s*doc\/new\.md/u);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('report-capture summarizer exits non-zero in strict mode when requested prefix has no report files', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-capture-summarize-missing-'));

  try {
    const result = await runSummarizer([
      `--dir=${tempDir}`,
      '--prefixes=naming-missing',
      '--strict',
    ]);

    assert.notEqual(result.exitCode, 0);
    assert.match(result.stderr, /SKIP naming-missing/u);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
