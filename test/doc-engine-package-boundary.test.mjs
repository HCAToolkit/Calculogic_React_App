import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, 'src');

const forbiddenNeedles = [
  '../doc-engine/',
  '../../doc-engine/',
  'src/doc-engine/',
  'calculogic-doc-engine/src/',
];

const isScannable = (p) =>
  p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.js') || p.endsWith('.mjs');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && isScannable(full)) out.push(full);
  }
  return out;
}

test('doc-engine is consumed only via @calculogic/doc-engine (no shims/deep imports)', () => {
  const files = walk(srcRoot);
  const violations = [];

  for (const file of files) {
    const rel = path.relative(repoRoot, file).replaceAll('\\', '/');
    const text = fs.readFileSync(file, 'utf8');

    for (const needle of forbiddenNeedles) {
      if (text.includes(needle)) {
        violations.push({ file: rel, needle });
      }
    }
  }

  assert.deepEqual(violations, []);
});
