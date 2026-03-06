import test from 'node:test';
import assert from 'node:assert/strict';
import { detectNpmArgForwardingFootgun } from '../src/core/npm-arg-forwarding-guard.logic.mjs';

test('returns null when npm_config_argv is missing and fallback has no suspicious env flags', () => {
  const message = detectNpmArgForwardingFootgun({
    argv: [],
    npmConfigArgvJson: undefined,
    lifecycleEvent: 'validate:naming',
    expectedLifecycleEvent: 'validate:naming',
    supportedFlagNames: ['scope', 'target', 'config', 'strict'],
    env: {},
  });

  assert.equal(message, null);
});

test('returns null when lifecycle event mismatches expected script', () => {
  const message = detectNpmArgForwardingFootgun({
    argv: [],
    npmConfigArgvJson: JSON.stringify({ original: ['run', 'validate:naming', '--scope=app'] }),
    lifecycleEvent: 'test',
    expectedLifecycleEvent: 'validate:naming',
    supportedFlagNames: ['scope', 'target', 'config', 'strict'],
    env: {},
  });

  assert.equal(message, null);
});

test('returns null when npm original args have no supported flags', () => {
  const message = detectNpmArgForwardingFootgun({
    argv: [],
    npmConfigArgvJson: JSON.stringify({ original: ['run', 'validate:naming', '--silent'] }),
    lifecycleEvent: 'validate:naming',
    expectedLifecycleEvent: 'validate:naming',
    supportedFlagNames: ['scope', 'target', 'config', 'strict'],
    env: {},
  });

  assert.equal(message, null);
});

test('returns guidance message when npm original args contain supported flags but argv has none', () => {
  const message = detectNpmArgForwardingFootgun({
    argv: [],
    npmConfigArgvJson: JSON.stringify({ original: ['run', 'validate:naming', '--scope=app'] }),
    lifecycleEvent: 'validate:naming',
    expectedLifecycleEvent: 'validate:naming',
    supportedFlagNames: ['scope', 'target', 'config', 'strict'],
    env: {},
  });

  assert.equal(
    message,
    'Detected npm argument forwarding issue: use "npm run validate:naming -- --scope=app" (note the extra --).',
  );
});

test('returns null when forwarded argv already includes supported flags', () => {
  const message = detectNpmArgForwardingFootgun({
    argv: ['--scope=app'],
    npmConfigArgvJson: JSON.stringify({ original: ['run', 'validate:naming', '--scope=app'] }),
    lifecycleEvent: 'validate:naming',
    expectedLifecycleEvent: 'validate:naming',
    supportedFlagNames: ['scope', 'target', 'config', 'strict'],
    env: {},
  });

  assert.equal(message, null);
});

test('returns message when lifecycle matches and npm_config_scope is valid scope and argv lacks flags', () => {
  const message = detectNpmArgForwardingFootgun({
    argv: [],
    npmConfigArgvJson: undefined,
    lifecycleEvent: 'validate:naming',
    expectedLifecycleEvent: 'validate:naming',
    supportedFlagNames: ['scope', 'target', 'config', 'strict'],
    env: { npm_config_scope: 'app' },
  });

  assert.equal(typeof message, 'string');
  assert.match(message, /Detected npm argument forwarding issue/u);
  assert.match(message, /Detected npm_config flags: --scope/u);
});

test('returns message when lifecycle matches and npm_config_target present and argv lacks flags', () => {
  const message = detectNpmArgForwardingFootgun({
    argv: [],
    npmConfigArgvJson: undefined,
    lifecycleEvent: 'validate:naming',
    expectedLifecycleEvent: 'validate:naming',
    supportedFlagNames: ['scope', 'target', 'config', 'strict'],
    env: { npm_config_target: 'src/tabs/build' },
  });

  assert.equal(typeof message, 'string');
  assert.match(message, /Detected npm_config flags: --target/u);
});

test('returns null when argv already includes flag even if npm_config_scope present', () => {
  const message = detectNpmArgForwardingFootgun({
    argv: ['--scope=app'],
    npmConfigArgvJson: undefined,
    lifecycleEvent: 'validate:naming',
    expectedLifecycleEvent: 'validate:naming',
    supportedFlagNames: ['scope', 'target', 'config', 'strict'],
    env: { npm_config_scope: 'app' },
  });

  assert.equal(message, null);
});

test('returns null when npm_config_scope is not a known validator scope', () => {
  const message = detectNpmArgForwardingFootgun({
    argv: [],
    npmConfigArgvJson: undefined,
    lifecycleEvent: 'validate:naming',
    expectedLifecycleEvent: 'validate:naming',
    supportedFlagNames: ['scope', 'target', 'config', 'strict'],
    env: { npm_config_scope: '@someone/package' },
  });

  assert.equal(message, null);
});

test('returns message for validate:all when npm_config_validators indicates forwarded validator intent', () => {
  const message = detectNpmArgForwardingFootgun({
    argv: [],
    npmConfigArgvJson: undefined,
    lifecycleEvent: 'validate:all',
    expectedLifecycleEvent: 'validate:all',
    supportedFlagNames: ['scope', 'target', 'config', 'strict', 'validators'],
    env: { npm_config_validators: 'naming' },
  });

  assert.equal(typeof message, 'string');
  assert.match(message, /Detected npm_config flags: --validators/u);
});
