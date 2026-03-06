import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { collectRepositoryPaths } from '../src/validators/naming-validator.logic.mjs';
import {
  BUILTIN_WALK_EXCLUSIONS_REGISTRY_PATH,
  getBuiltinWalkExclusions,
} from '../src/naming/registries/naming-special-cases.knowledge.mjs';

const writeFile = (rootDirectory, relativePath) => {
  const absolutePath = path.join(rootDirectory, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, 'x', 'utf8');
};

test('runtime walk exclusions are loaded from builtin registry json', () => {
  const registryJson = JSON.parse(fs.readFileSync(BUILTIN_WALK_EXCLUSIONS_REGISTRY_PATH, 'utf8'));
  const runtime = getBuiltinWalkExclusions();

  assert.deepEqual(
    Array.from(runtime.excludedDirectories).sort(),
    [...registryJson.excludedDirectories].sort(),
  );
  assert.equal(runtime.skipDotDirectories, registryJson.skipDotDirectories);
  assert.deepEqual(Array.from(runtime.allowDotFiles).sort(), [...registryJson.allowDotFiles].sort());
});

test('collectRepositoryPaths preserves excluded-directories and dot-directory behavior while allowing reportable dot-files', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'naming-walk-exclusions-'));

  try {
    writeFile(tempRoot, 'src/visible.logic.ts');
    writeFile(tempRoot, '.eslintrc');
    writeFile(tempRoot, '.hidden.ts');
    writeFile(tempRoot, '.config/inside.logic.ts');
    writeFile(tempRoot, '.lintstagedrc.js');

    for (const excludedDirectory of getBuiltinWalkExclusions().excludedDirectories) {
      writeFile(tempRoot, `${excludedDirectory}/ignored.logic.ts`);
    }

    const collected = collectRepositoryPaths(tempRoot, {
      scope: 'repo',
      reportableExtensions: new Set(['', '.ts', '.js']),
    });

    assert.equal(collected.includes('src/visible.logic.ts'), true);
    assert.equal(collected.includes('.eslintrc'), true);
    assert.equal(collected.includes('.hidden.ts'), true);
    assert.equal(collected.includes('.lintstagedrc.js'), true);
    assert.equal(collected.includes('.config/inside.logic.ts'), false);

    for (const excludedDirectory of getBuiltinWalkExclusions().excludedDirectories) {
      assert.equal(collected.includes(`${excludedDirectory}/ignored.logic.ts`), false);
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
