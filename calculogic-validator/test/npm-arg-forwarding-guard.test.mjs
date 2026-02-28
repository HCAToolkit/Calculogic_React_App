import test from 'node:test';
import assert from 'node:assert/strict';
import { detectNpmArgForwardingFootgun } from '../src/npm-arg-forwarding-guard.logic.mjs';

test('returns null when npm_config_argv is missing', () => {
  const message = detectNpmArgForwardingFootgun({
    argv: [],
    npmConfigArgvJson: undefined,
    lifecycleEvent: 'validate:naming',
    expectedLifecycleEvent: 'validate:naming',
    supportedFlagNames: ['scope', 'target', 'config', 'strict'],
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
  });

  assert.equal(message, null);
});
