import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  buildReportCapturePackageScript,
  getValidatorReportCapturePresetByScriptName,
  listValidatorReportCapturePresets,
} from '../src/core/validator-report-capture-metadata.logic.mjs';

const rootPackageJson = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
);

const directScriptByPreset = {
  'report:naming:system': 'calculogic-validator/scripts/validate-naming.host.mjs',
  'report:tree:system': 'calculogic-validator/scripts/validate-tree.host.mjs',
  'report:all:system': 'calculogic-validator/scripts/validate-all.host.mjs',
};

const reportCapturePackageScripts = Object.entries(rootPackageJson.scripts)
  .filter(([, command]) => command.includes('calculogic-report-capture'))
  .map(([scriptName]) => scriptName)
  .sort((left, right) => left.localeCompare(right));

const normalizeReport = (report) => {
  const normalized = structuredClone(report);
  delete normalized.startedAt;
  delete normalized.endedAt;
  delete normalized.durationMs;
  return normalized;
};

const runDirectReport = ({ scriptPath, scope }) => {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', scriptPath, `--scope=${scope}`],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  assert.ok([0, 1, 2].includes(result.status));
  assert.equal(result.stderr, '');
  return JSON.parse(result.stdout);
};

const runCapturedReport = ({ preset, outputDir }) => {
  const hostPath = path.resolve(
    'calculogic-validator/tools/report-capture/src/report-capture.host.mjs',
  );
  const result = spawnSync(
    process.execPath,
    [
      hostPath,
      '--dir',
      outputDir,
      '--keep',
      '20',
      '--prefix',
      preset.capture.prefix,
      '--json',
      '--',
      preset.wrappedCommand.executable,
      ...preset.wrappedCommand.args,
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  assert.ok([0, 1, 2].includes(result.status));
  const metadataLine = result.stderr
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .find((line) => line.startsWith('{') && line.includes('"path"'));
  assert.ok(metadataLine, `missing report-capture metadata line in stderr: ${result.stderr}`);

  const metadata = JSON.parse(metadataLine);
  const capturedContent = fs.readFileSync(metadata.path, 'utf8');
  assert.equal(capturedContent, result.stdout);
  return JSON.parse(capturedContent);
};

test('report-capture preset metadata matches current package script surfaces exactly', () => {
  const presets = listValidatorReportCapturePresets();
  const presetScriptNames = presets
    .map((preset) => preset.scriptName)
    .sort((a, b) => a.localeCompare(b));

  assert.deepEqual(presetScriptNames, reportCapturePackageScripts);

  for (const preset of presets) {
    assert.equal(
      rootPackageJson.scripts[preset.scriptName],
      buildReportCapturePackageScript(preset),
    );
    assert.deepEqual(getValidatorReportCapturePresetByScriptName(preset.scriptName), preset);
    assert.equal(preset.commandSurface, 'validator-report-capture');
    assert.equal(preset.capture.captureCommand, 'calculogic-report-capture');
    assert.equal(preset.capture.json, true);
    assert.equal(preset.capture.dir, './.reports');
    assert.equal(preset.capture.keep, 20);
  }

  assert.equal(getValidatorReportCapturePresetByScriptName('report:missing'), null);
});

test('report-capture preset metadata records command mechanics but not semantic policy', () => {
  const presets = listValidatorReportCapturePresets();
  const forbiddenSemanticPolicyKeys = new Set([
    'findings',
    'summaries',
    'severities',
    'severity',
    'rules',
    'filenameParsing',
    'semanticName',
    'semanticFamily',
    'placement',
    'folderKind',
    'structuralHome',
    'semanticHome',
  ]);

  const visitKeys = (value, seenKeys = []) => {
    if (!value || typeof value !== 'object') return seenKeys;
    for (const [key, child] of Object.entries(value)) {
      seenKeys.push(key);
      visitKeys(child, seenKeys);
    }
    return seenKeys;
  };

  for (const preset of presets) {
    for (const key of visitKeys(preset)) {
      assert.equal(
        forbiddenSemanticPolicyKeys.has(key),
        false,
        `${preset.scriptName} stores ${key}`,
      );
    }
  }

  assert.equal(
    getValidatorReportCapturePresetByScriptName('report:naming:system').semanticPolicyOwner,
    'naming',
  );
  assert.equal(
    getValidatorReportCapturePresetByScriptName('report:tree:system').semanticPolicyOwner,
    'tree',
  );
  assert.equal(
    getValidatorReportCapturePresetByScriptName('report:all:system').semanticPolicyOwner,
    'suite-core-runner',
  );
  assert.equal(
    getValidatorReportCapturePresetByScriptName('report:addressing:get-tree:validator')
      .semanticPolicyOwner,
    'addressing-deferred',
  );
});

for (const [scriptName, scriptPath] of Object.entries(directScriptByPreset)) {
  test(`${scriptName} capture metadata preserves emitted report JSON`, () => {
    const preset = getValidatorReportCapturePresetByScriptName(scriptName);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-capture-registry-parity-'));

    try {
      const directReport = runDirectReport({ scriptPath, scope: 'system' });
      const capturedReport = runCapturedReport({ preset, outputDir: tempDir });

      assert.deepEqual(normalizeReport(capturedReport), normalizeReport(directReport));
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
}
