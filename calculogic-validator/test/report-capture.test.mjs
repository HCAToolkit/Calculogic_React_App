import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
  formatTimestamp,
  pruneReports,
  shouldPrune,
} from '../tools/report-capture/src/report-capture.logic.mjs';

const createTempDir = async () => fs.mkdtemp(path.join(os.tmpdir(), 'report-capture-test-'));

test('formatTimestamp formats deterministic local timestamp token', () => {
  const fixed = new Date(2026, 1, 26, 18, 41, 3);
  assert.equal(formatTimestamp(fixed), '2026-02-26_18-41-03');
});

test('pruneReports keeps newest N reports by mtime', async () => {
  const tempDir = await createTempDir();

  try {
    for (let i = 0; i < 5; i += 1) {
      const filePath = path.join(tempDir, `report-2026-02-2${i}_00-00-00.txt`);
      await fs.writeFile(filePath, `report-${i}`);
      const mtime = new Date(2026, 1, i + 1, 12, 0, 0);
      await fs.utimes(filePath, mtime, mtime);
    }

    await pruneReports(tempDir, { prefix: 'report', keep: 2 });

    const remaining = (await fs.readdir(tempDir)).sort();
    assert.deepEqual(remaining, [
      'report-2026-02-23_00-00-00.txt',
      'report-2026-02-24_00-00-00.txt',
    ]);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('shouldPrune reflects --no-prune setting', () => {
  assert.equal(shouldPrune({ noPrune: true }), false);
  assert.equal(shouldPrune({ noPrune: false }), true);
});

test('host propagates child exit code and writes report file', async () => {
  const tempDir = await createTempDir();

  try {
    const hostPath = path.resolve(
      'calculogic-validator/tools/report-capture/src/report-capture.host.mjs',
    );
    const exitCode = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [
        hostPath,
        '--dir',
        tempDir,
        '--keep',
        '50',
        '--',
        process.execPath,
        '-e',
        'process.exit(7)',
      ]);

      child.on('error', reject);
      child.on('close', (code) => resolve(code));
    });

    assert.equal(exitCode, 7);

    const reports = (await fs.readdir(tempDir)).filter(
      (name) => name.startsWith('report-') && name.endsWith('.txt'),
    );
    assert.equal(reports.length, 1);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
