import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { VALIDATOR_REGISTRY, getValidatorById, listRegisteredValidators } from '../src/core/validator-registry.knowledge.mjs';
import { runValidatorRunner } from '../src/core/validator-runner.logic.mjs';

const rootPackageJson = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const validatorPackageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const expectedMetadataShapeKeys = [
  'sliceId',
  'report',
  'commands',
  'packageBin',
  'runner',
  'bridge',
  'reportCapture',
  'compatibility',
];

const expectedReportScopes = ['repo', 'app', 'docs', 'validator', 'system'];

const visitFunctionPaths = (value, pathSegments = []) => {
  if (typeof value === 'function') {
    return [pathSegments.join('.')];
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.entries(value).flatMap(([key, childValue]) =>
    visitFunctionPaths(childValue, [...pathSegments, key]),
  );
};

test('registry ordering and list helper remain stable', () => {
  assert.deepEqual(
    VALIDATOR_REGISTRY.map((validator) => validator.id),
    ['naming', 'tree-structure-advisor'],
  );
  assert.deepEqual(listRegisteredValidators(), ['naming', 'tree-structure-advisor']);
});

test('get helper still returns registered validators by id and null for unknown ids', () => {
  assert.equal(getValidatorById('naming')?.id, 'naming');
  assert.equal(getValidatorById('tree-structure-advisor')?.id, 'tree-structure-advisor');
  assert.equal(getValidatorById('missing-validator'), null);
});

test('all registered validators expose required data-only metadata fields', () => {
  for (const validator of VALIDATOR_REGISTRY) {
    assert.equal(typeof validator.id, 'string');
    assert.equal(typeof validator.description, 'string');
    assert.equal(typeof validator.run, 'function');
    assert.deepEqual(Object.keys(validator.metadata), expectedMetadataShapeKeys);

    assert.equal(validator.metadata.sliceId, validator.id);
    assert.equal(validator.metadata.report.entryId, validator.id);
    assert.equal(validator.metadata.report.validatorId, validator.id);
    assert.equal(validator.metadata.report.description, validator.description);
    assert.equal(validator.metadata.report.mode, 'report');
    assert.equal(validator.metadata.runner.selectionId, validator.id);
    assert.equal(validator.metadata.runner.defaultIncludedInValidateAll, true);
    assert.equal(validator.metadata.runner.directRunnable, true);
    assert.equal(validator.metadata.runner.runnerOnly, false);
    assert.deepEqual(validator.metadata.reportCapture.scopes, expectedReportScopes);
    assert.equal(validator.metadata.compatibility.behaviorPreservingMetadataOnly, true);
    assert.equal(validator.metadata.compatibility.selectedByRegistryId, true);
    assert.equal(validator.metadata.compatibility.reportShapeDrivenByRunner, true);
  }
});

test('registry metadata command, report, and bin fields match current naming patterns and package surfaces', () => {
  for (const validator of VALIDATOR_REGISTRY) {
    const { commands, packageBin, report, reportCapture } = validator.metadata;

    assert.match(commands.repoLocalNpmScript, /^validate:(?:naming|tree)$/u);
    assert.equal(rootPackageJson.scripts[commands.repoLocalNpmScript]?.startsWith('node '), true);
    assert.equal(commands.repoLocalNpmInvocation, `npm run ${commands.repoLocalNpmScript} --`);
    assert.match(commands.directScriptPath, /^calculogic-validator\/scripts\/validate-[a-z-]+\.host\.mjs$/u);
    assert.equal(fs.existsSync(path.join(process.cwd(), commands.directScriptPath)), true);

    assert.match(report.profileId, /^[a-z][a-z0-9-]*$/u);
    assert.equal(report.profileId, report.entryId);
    assert.match(reportCapture.profileId, /^[a-z][a-z0-9-]*$/u);
    assert.equal(reportCapture.profileId, report.profileId);
    assert.match(reportCapture.scriptPattern, /^report:[a-z]+:<scope>$/u);
    assert.match(reportCapture.prefixPattern, /^[a-z]+(?:-[a-z]+)*-<scope>$/u);

    for (const scope of reportCapture.scopes) {
      const scriptName = reportCapture.scriptPattern.replace('<scope>', scope);
      const expectedPrefix = reportCapture.prefixPattern.replace('<scope>', scope);
      assert.ok(rootPackageJson.scripts[scriptName], `${scriptName} should exist`);
      assert.match(rootPackageJson.scripts[scriptName], new RegExp(`--prefix ${expectedPrefix}\\b`, 'u'));
    }

    assert.match(packageBin.expectedName, /^calculogic-validate(?:-[a-z]+)?$/u);
    assert.equal(Boolean(validatorPackageJson.bin?.[packageBin.expectedName]), packageBin.available);
  }
});

test('validate:all/default inclusion metadata matches current runner behavior', async () => {
  const fixtureRoot = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'validator-registry-default-'));

  try {
    const report = runValidatorRunner(fixtureRoot, { scope: 'repo' });
    const defaultIncludedIds = VALIDATOR_REGISTRY.filter(
      (validator) => validator.metadata.runner.defaultIncludedInValidateAll,
    ).map((validator) => validator.id);

    assert.deepEqual(
      report.validators.map((validator) => validator.id),
      defaultIncludedIds,
    );
  } finally {
    await fsPromises.rm(fixtureRoot, { recursive: true, force: true });
  }
});

test('bridge metadata documents current Naming to Tree relationship without driving runner behavior', () => {
  const namingMetadata = getValidatorById('naming').metadata;
  const treeMetadata = getValidatorById('tree-structure-advisor').metadata;

  assert.deepEqual(namingMetadata.bridge.provides, [
    {
      id: 'naming-semantic-family-bridge',
      consumerValidatorIds: ['tree-structure-advisor'],
      stagedBy: 'validator-runner',
    },
  ]);
  assert.deepEqual(namingMetadata.bridge.consumes, []);
  assert.deepEqual(treeMetadata.bridge.provides, []);
  assert.deepEqual(treeMetadata.bridge.consumes, [
    {
      id: 'naming-semantic-family-bridge',
      providerValidatorId: 'naming',
      stagedBy: 'validator-runner',
    },
  ]);
});

test('registry metadata keeps Addressing classified outside standalone runnable validator slices', () => {
  assert.equal(getValidatorById('addressing'), null);
  assert.equal(getValidatorById('structural-addressing'), null);

  const registeredBridgeIds = VALIDATOR_REGISTRY.flatMap((validator) => [
    ...validator.metadata.bridge.provides.map((bridge) => bridge.id),
    ...validator.metadata.bridge.consumes.map((bridge) => bridge.id),
  ]).sort((left, right) => left.localeCompare(right));

  assert.deepEqual(registeredBridgeIds, [
    'naming-semantic-family-bridge',
    'naming-semantic-family-bridge',
  ]);
});

test('registry metadata is serializable and only run hooks remain executable functions', () => {
  for (const validator of VALIDATOR_REGISTRY) {
    assert.doesNotThrow(() => JSON.stringify(validator.metadata));
    assert.deepEqual(visitFunctionPaths(validator.metadata), []);
    assert.deepEqual(visitFunctionPaths(validator), ['run']);
    assert.equal(typeof validator.run, 'function');
  }
});
