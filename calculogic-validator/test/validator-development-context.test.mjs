import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveValidatorDevelopmentContext } from '../src/core/validator-development-context.logic.mjs';

const makeTempRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), 'validator-context-'));

test('resolves embedded React-app development context', () => {
  const target = makeTempRoot();
  const packageRoot = path.join(target, 'calculogic-validator');
  fs.mkdirSync(packageRoot);
  const context = resolveValidatorDevelopmentContext({ targetRepositoryRoot: target, packageRoot });
  assert.equal(context.kind, 'embedded-development');
  assert.equal(context.targetRepositoryRoot, fs.realpathSync.native(target));
  assert.equal(context.packageRoot, fs.realpathSync.native(packageRoot));
  assert.equal(context.validatorDevelopmentRoot, fs.realpathSync.native(packageRoot));
});

test('resolves standalone validator development context', () => {
  const target = makeTempRoot();
  const context = resolveValidatorDevelopmentContext({ targetRepositoryRoot: target, packageRoot: target });
  assert.equal(context.kind, 'standalone-development');
  assert.equal(context.packageRoot, fs.realpathSync.native(target));
  assert.equal(context.targetRepositoryRoot, fs.realpathSync.native(target));
  assert.equal(context.validatorDevelopmentRoot, fs.realpathSync.native(target));
});

test('resolves installed consumer context without using node_modules as development root', () => {
  const target = makeTempRoot();
  const packageRoot = path.join(target, 'node_modules', '@calculogic', 'validator');
  fs.mkdirSync(packageRoot, { recursive: true });
  const context = resolveValidatorDevelopmentContext({ targetRepositoryRoot: target, packageRoot });
  assert.equal(context.kind, 'installed-consumer');
  assert.equal(context.packageRoot, fs.realpathSync.native(packageRoot));
  assert.equal(context.targetRepositoryRoot, fs.realpathSync.native(target));
  assert.equal(context.validatorDevelopmentRoot, null);
});
