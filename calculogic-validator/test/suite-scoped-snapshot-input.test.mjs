import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { collectSuiteScopedSnapshotInputs } from '../src/core/suite-scoped-snapshot-input.logic.mjs';

test('suite scoped snapshot helper collects scope roots and root files deterministically', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'suite-scoped-snapshot-docs-'));

  try {
    await fs.mkdir(path.join(fixtureDir, 'doc'), { recursive: true });
    await fs.writeFile(path.join(fixtureDir, 'doc', 'README.md'), '# docs\n', 'utf8');
    await fs.writeFile(path.join(fixtureDir, 'README.md'), '# root\n', 'utf8');

    const snapshot = collectSuiteScopedSnapshotInputs(fixtureDir, { scope: 'docs' });

    assert.equal(snapshot.scope, 'docs');
    assert.deepEqual(snapshot.includeRoots, ['doc', 'docs']);
    assert.deepEqual(snapshot.includeRootFiles, ['README.md']);
    assert.deepEqual(snapshot.inScopePaths, ['doc/README.md', 'README.md']);
    assert.deepEqual(snapshot.selectedPaths, ['doc/README.md', 'README.md']);
    assert.deepEqual(snapshot.targetDescriptors, []);
    assert.equal(snapshot.targets.length, 0);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('suite scoped snapshot helper applies target filtering after scoped collection', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'suite-scoped-snapshot-targets-'));

  try {
    await fs.mkdir(path.join(fixtureDir, 'src'), { recursive: true });
    await fs.writeFile(path.join(fixtureDir, 'src', 'a.logic.ts'), 'export const a = true\n', 'utf8');
    await fs.writeFile(path.join(fixtureDir, 'src', 'b.logic.ts'), 'export const b = true\n', 'utf8');

    const snapshot = collectSuiteScopedSnapshotInputs(fixtureDir, {
      scope: 'app',
      targets: ['src/a.logic.ts'],
    });

    assert.equal(snapshot.scope, 'app');
    assert.deepEqual(snapshot.selectedPaths, ['src/a.logic.ts']);
    assert.deepEqual(snapshot.targetDescriptors, [
      {
        kind: 'file',
        relPath: 'src/a.logic.ts',
      },
    ]);
    assert.deepEqual(snapshot.targets, ['src/a.logic.ts']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('suite scoped snapshot helper keeps existing symlinked scope-root traversal by default', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'suite-scoped-snapshot-symlink-'));
  const outsideDir = await fs.mkdtemp(path.join(os.tmpdir(), 'suite-scoped-snapshot-outside-'));

  try {
    await fs.writeFile(
      path.join(outsideDir, 'outside.logic.ts'),
      'export const outside = true;\n',
      'utf8',
    );
    await fs.symlink(outsideDir, path.join(fixtureDir, 'src'), 'dir');

    const snapshot = collectSuiteScopedSnapshotInputs(fixtureDir, { scope: 'app' });

    assert.deepEqual(snapshot.inScopePaths, ['src/outside.logic.ts']);
    assert.deepEqual(snapshot.selectedPaths, ['src/outside.logic.ts']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
    await fs.rm(outsideDir, { recursive: true, force: true });
  }
});
