import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { prepareTreeStructureAdvisorInputs } from '@calculogic/validator/tree';
import { prepareNamingTreeStagingInputs, runNamingValidator } from '@calculogic/validator/naming';

const repoRoot = fs.realpathSync(process.cwd());
const packageJsonPath = path.join(repoRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const ordinaryPublicRoutes = {
  'validate:naming': 'calculogic-validate-naming',
  'validate:all': 'calculogic-validate',
  'validate:tree': 'calculogic-validate-tree',
  'health:validator': 'calculogic-validator-health',
};

const reportCommands = [
  {
    label: 'Naming public route for repo scope',
    command: ['npm', 'run', '--silent', 'validate:naming', '--', '--scope=repo'],
    expectedScope: 'repo',
  },
  {
    label: 'generic/all public route for app scope',
    command: ['npm', 'run', '--silent', 'validate:all', '--', '--scope=app'],
    expectedScope: 'app',
  },
  {
    label: 'Tree public route for docs scope',
    command: ['npm', 'run', '--silent', 'validate:tree', '--', '--scope=docs'],
    expectedScope: 'docs',
  },
  {
    label: 'generic/all public route for system scope',
    command: ['npm', 'run', '--silent', 'validate:all', '--', '--scope=system'],
    expectedScope: 'system',
  },
];

const reportExitStatuses = new Set([0, 1, 2]);

function commandDiagnostic({ command, status, stdout, stderr }) {
  return JSON.stringify(
    { command: command.join(' '), cwd: repoRoot, status, stdout, stderr },
    null,
    2,
  );
}

function runCommand(command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });

  assert.ifError(result.error);

  return {
    command,
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function parseReport(commandResult) {
  try {
    return JSON.parse(commandResult.stdout);
  } catch (error) {
    assert.fail(`Expected validator JSON report output.\n${commandDiagnostic(commandResult)}\n${error}`);
  }
}

test('root public validator workflows route through package command names', () => {
  for (const [scriptName, expectedPublicCommand] of Object.entries(ordinaryPublicRoutes)) {
    const script = packageJson.scripts?.[scriptName];

    assert.equal(script, expectedPublicCommand, `${scriptName} should route to the public package command`);
    assert.doesNotMatch(script, /calculogic-validator\/(scripts|bin)\//);
  }
});

test('root test script keeps app-owned consumer tests separate from validator-owned tests', () => {
  const testScript = packageJson.scripts?.test ?? '';

  assert.match(testScript, /test\/\*\*\/\*\.test\.mjs/);
  assert.doesNotMatch(testScript, /calculogic-validator\/.*test/);
  assert.doesNotMatch(testScript, /npm\s+--prefix\s+calculogic-validator\s+test/);
});

for (const { label, command, expectedScope } of reportCommands) {
  test(`${label} validates the React app repository root as target`, () => {
    const commandResult = runCommand(command);
    const report = parseReport(commandResult);

    assert.ok(
      reportExitStatuses.has(commandResult.status),
      `Unexpected validator report exit status.\n${commandDiagnostic(commandResult)}`,
    );
    assert.equal(report.scope, expectedScope, commandDiagnostic(commandResult));

    const reportedRoot = fs.realpathSync(report.sourceSnapshot.repositoryRoot);
    assert.equal(reportedRoot, repoRoot, commandDiagnostic(commandResult));
    const relativeReportedRoot = path.relative(repoRoot, reportedRoot).replaceAll('\\', '/');
    assert.notEqual(relativeReportedRoot, 'calculogic-validator');
    assert.equal(relativeReportedRoot.startsWith('calculogic-validator/'), false);
    assert.doesNotMatch(reportedRoot, /(?:^|[\\/])node_modules(?:[\\/]|$)/);
    assert.doesNotMatch(reportedRoot, /(?:^|[\\/])node_modules[\\/]@calculogic[\\/]validator(?:[\\/]|$)/);
  });
}

// The installed package runs health in its installed-consumer context: it checks only the
// scopes available here and reads no documents from this checkout (HCAToolkit/calculogic-validator#32).
test('health public route reports installed-consumer health without reading app documents', () => {
  const commandResult = runCommand(['npm', 'run', '--silent', 'health:validator']);

  assert.equal(commandResult.status, 0, commandDiagnostic(commandResult));
  assert.equal(
    commandResult.stdout,
    [
      'OK: naming validator deterministic for repo|app|docs|system',
      'SKIP: scope validator not checked (validator-development-root-unavailable)',
      'OK: docs sanity check not applicable (installed-consumer: no validator development root)',
      '',
    ].join('\n'),
    commandDiagnostic(commandResult),
  );
});

// README.md: Validator compatibility and retained output. These are installed-artifact probes;
// internal Addressing/Foundation modules are inspected only here, never imported by application code.
const installedValidatorRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.resolve('@calculogic/validator/tree'))), '..', '..',
);

test('the stable installed artifact couples C1 code-unit ordering with revision 1', async () => {
  assert.equal(fs.lstatSync(path.join(repoRoot, 'node_modules/@calculogic/validator')).isSymbolicLink(), false);
  assert.equal(installedValidatorRoot, fs.realpathSync(path.join(repoRoot, 'node_modules/@calculogic/validator')));
  const { prepareTreeCodebaseAddressedSnapshot } = await import(pathToFileURL(path.join(
    installedValidatorRoot, 'structural-addressing/src/structural-addressing-tree-codebase.logic.mjs',
  )).href);
  const names = ['é', 'a_b', '2', '\uE000', 'a', '😀', 'e\u0301', 'A', '10', 'a-b'];
  const input = { scopeRoots: names.map((name) => ({ name, path: `root/${name}`, occurrenceType: 'file' })) };
  const original = structuredClone(input);
  const snapshot = prepareTreeCodebaseAddressedSnapshot(input);
  assert.equal(snapshot.profileId, 'tree-codebase');
  assert.equal(snapshot.addressProfileId, 'tree-codebase@1');
  assert.deepEqual(snapshot.compatibilityPolicy, { status: 'versioned', revision: '1' });
  assert.deepEqual(snapshot.occurrenceRecords.map((record) => record.name), ['10', '2', 'A', 'a', 'a-b', 'a_b', 'e\u0301', 'é', '😀', '\uE000']);
  assert.deepEqual(snapshot.occurrenceRecords.map((record) => record.orderIndex), names.map((_, index) => index));
  assert.deepEqual(snapshot.occurrenceRecords.map((record) => record.addressPath), names.map((_, index) => String(index + 1)));
  assert.deepEqual(input, original);
});

test('installed Tree qualifies addressed evidence without legacy recovery or historical relabeling', async () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'react-validator-compatibility-'));
  try {
    fs.writeFileSync(path.join(fixtureRoot, 'package.json'), '{"name":"consumer-check"}\n');
    for (const name of ['build-surface.logic.mjs', 'build-surface.results.mjs']) {
      fs.mkdirSync(path.join(fixtureRoot, 'src/build'), { recursive: true });
      fs.writeFileSync(path.join(fixtureRoot, 'src/build', name), 'export {};\n');
    }
    const { prepareLinguisticFoundation } = await import(pathToFileURL(path.join(installedValidatorRoot,
      'linguistic-foundation/src/linguistic-foundation.wiring.mjs')).href);
    const { resolveActiveRegistrySet } = await import(pathToFileURL(path.join(installedValidatorRoot,
      'src/core/registry-lifecycle/registry-lifecycle-resolution.logic.mjs')).href);
    const registryResolution = resolveActiveRegistrySet({ targetRoot: fixtureRoot });
    const linguisticFoundation = prepareLinguisticFoundation({ profileSelection: { profileId: 'english' } });
    const staged = prepareNamingTreeStagingInputs(runNamingValidator(fixtureRoot, { scope: 'repo', registryResolution }), {
      registryResolution, linguisticFoundation,
    });
    staged.namingSemanticFamilyBridge.observations.push({ path: 'src/build', occurrenceType: 'folder',
      semanticName: 'build', semanticFamily: 'build', familyRoot: 'build', semanticEvidenceKind: 'semantic-family-root-folder' });
    const prepare = (options) => prepareTreeStructureAdvisorInputs(fixtureRoot, { scope: 'repo', registryResolution, ...options });
    const baseline = prepare(staged).preparedDependencies;
    const payload = baseline.addressedNamingOccurrenceBridge;
    const sectionNames = ['bridgeObservations', 'semanticEvidenceEnrichment', 'folderLabelObservations'];
    assert.equal(payload.addressProfileId, 'tree-codebase@1');
    assert.equal(payload.addressedSnapshotId, 'tree-structure-advisor-current-snapshot');
    for (const name of sectionNames) assert.ok(baseline.treeNamingSectionIntake[name].acceptedRecords.length > 0);
    assert.ok(baseline.treeLexicalIdentityIntake.acceptedRecords.length > 0);
    assert.ok(baseline.treeFamilyRootFolderEvidence.evidenceRecords.length > 0);
    assert.ok(payload.namingRepositoryPackageLabels);
    assert.ok(payload.namingRoleCategoryVocabulary);
    const callerControl = prepare({ namingOccurrenceBridge: payload }).preparedDependencies;
    const assertRejected = (foreign) => {
      const before = structuredClone(foreign);
      const deps = prepare({ namingOccurrenceBridge: foreign }).preparedDependencies;
      for (const name of sectionNames) assert.deepEqual(deps.treeNamingSectionIntake[name].acceptedRecords, []);
      assert.deepEqual(deps.treeLexicalIdentityIntake.acceptedRecords, []);
      assert.deepEqual(deps.addressedNamingSemanticEvidenceBridge.observations, []);
      assert.deepEqual(deps.treeFamilyRootFolderEvidence.evidenceRecords, []);
      assert.deepEqual(deps.treeSemanticNamingFolderTypeRelationshipEvidence.relationshipRecords, []);
      assert.deepEqual(deps.treeRepositoryPackageIntake, callerControl.treeRepositoryPackageIntake);
      assert.equal(deps.addressedNamingOccurrenceBridge.namingRoleCategoryVocabulary, foreign.namingRoleCategoryVocabulary);
      assert.ok(deps.treeNamingOccurrenceBridgeIntake.diagnostics.length > 0);
      assert.deepEqual(foreign, before);
      return deps;
    };
    for (const identity of ['tree-structure-advisor-address-profile', 'tree-codebase@2', 'tree-codebase@01', null, '']) {
      const foreign = structuredClone(payload); foreign.addressProfileId = identity;
      assert.deepEqual(foreign.observations.map(({ path: sourcePath, occurrenceAddress }) => [sourcePath, occurrenceAddress]),
        payload.observations.map(({ path: sourcePath, occurrenceAddress }) => [sourcePath, occurrenceAddress]));
      assertRejected(foreign);
    }
    const missing = structuredClone(payload); delete missing.addressProfileId; delete missing.addressedSnapshotId;
    assertRejected(missing);
    const inherited = structuredClone(payload); delete inherited.addressProfileId;
    Object.setPrototypeOf(inherited, { addressProfileId: payload.addressProfileId });
    // structuredClone removes prototypes; verify inherited ownership separately from immutability above.
    const inheritedResult = prepare({ namingOccurrenceBridge: inherited }).preparedDependencies;
    assert.deepEqual(inheritedResult.treeNamingSectionIntake.bridgeObservations.acceptedRecords, []);
    assert.equal(Object.hasOwn(inherited, 'addressProfileId'), false);
    for (const field of ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress']) {
      const recordPayload = structuredClone(payload);
      const record = recordPayload.observations[0]; const value = record[field]; delete record[field];
      Object.setPrototypeOf(record, { [field]: value });
      const result = prepare({ namingOccurrenceBridge: recordPayload }).preparedDependencies;
      assert.equal(result.treeNamingSectionIntake.bridgeObservations.acceptedRecords.length, payload.observations.length - 1);
      assert.equal(result.addressedNamingSemanticEvidenceBridge.observations.length, payload.observations.length - 1);
      assert.equal(Object.hasOwn(record, field), false);
    }
    const mixed = structuredClone(payload); mixed.observations[0].addressProfileId = 'tree-codebase@2';
    const mixedResult = prepare({ namingOccurrenceBridge: mixed }).preparedDependencies;
    assert.equal(mixedResult.treeNamingSectionIntake.bridgeObservations.acceptedRecords.length, payload.observations.length - 1);
    assert.equal(mixedResult.addressedNamingSemanticEvidenceBridge.observations.length, payload.observations.length - 1);
    const badPath = structuredClone(payload); badPath.observations[0].repoRelativePath = 'wrong/path';
    const pathResult = prepare({ namingOccurrenceBridge: badPath }).preparedDependencies;
    assert.ok(pathResult.treeNamingSectionIntake.bridgeObservations.rejectedRecords.some(({ reason }) => reason === 'path-mismatch'));
    const omittedPath = structuredClone(payload); delete omittedPath.observations[0].repoRelativePath;
    const omittedResult = prepare({ namingOccurrenceBridge: omittedPath }).preparedDependencies.treeNamingSectionIntake;
    assert.equal(omittedResult.bridgeObservations.acceptedRecords.length, payload.observations.length);
    assert.ok(omittedResult.diagnostics.some(({ reason }) => reason === 'source-path-unverified'));
    const sameIdentity = (left, right) => ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress']
      .every((field) => left[field] === right[field]);
    const cascadeIndex = payload.observations.findIndex((observation) => observation.occurrenceType === 'file' &&
      payload.namingSemanticEvidenceEnrichment.records.some((record) => sameIdentity(record, observation)));
    assert.notEqual(cascadeIndex, -1, 'fixture requires a v1 file observation with an N1 record sharing its complete identity tuple');
    const cascadeObservation = payload.observations[cascadeIndex];
    const cascadeN1 = payload.namingSemanticEvidenceEnrichment.records.find((record) => sameIdentity(record, cascadeObservation));
    assert.ok(cascadeN1, 'fixture requires the corresponding source N1 record');
    assert.ok(callerControl.treeNamingSectionIntake.bridgeObservations.acceptedRecords.some((record) => sameIdentity(record, cascadeObservation)),
      'unmodified v1 file observation must be accepted');
    assert.ok(callerControl.treeNamingSectionIntake.semanticEvidenceEnrichment.acceptedRecords.some((record) => sameIdentity(record, cascadeN1)),
      'unmodified corresponding N1 record must be accepted');
    for (const value of [undefined, null, '', '../escape', 1]) {
      const malformed = structuredClone(payload); malformed.observations[cascadeIndex].repoRelativePath = value;
      assert.deepEqual(malformed.namingSemanticEvidenceEnrichment.records.find((record) => sameIdentity(record, cascadeN1)), cascadeN1,
        'only the v1 source path changes; corresponding N1 evidence stays intact');
      const result = prepare({ namingOccurrenceBridge: malformed }).preparedDependencies.treeNamingSectionIntake;
      assert.equal(result.bridgeObservations.rejectedRecords.find(({ identityTuple }) => sameIdentity(identityTuple, cascadeObservation))?.reason,
        'invalid-source-path', 'the selected v1 file must be rejected for its malformed source path');
      assert.equal(result.semanticEvidenceEnrichment.rejectedRecords.find(({ identityTuple }) => sameIdentity(identityTuple, cascadeN1))?.reason,
        'unmatched-record', 'the unchanged corresponding N1 record must lose its accepted v1 dependency');
    }
    const missingFolderPath = structuredClone(payload); delete missingFolderPath.namingFolderLabelObservations.records[0].repoRelativePath;
    const folderResult = prepare({ namingOccurrenceBridge: missingFolderPath }).preparedDependencies;
    assert.ok(folderResult.treeNamingSectionIntake.folderLabelObservations.rejectedRecords.some(({ reason }) => reason === 'invalid-record-shape'));
    const framed = { ...payload }; delete framed.bridgeContractVersion;
    const blockedStaging = prepare({ namingSemanticFamilyBridge: framed }).preparedDependencies;
    assert.ok(blockedStaging.treeNamingOccurrenceBridgeIntake.diagnostics.some(({ reason }) => reason === 'addressed-payload-in-staging'));
    const incidental = { observations: staged.namingSemanticFamilyBridge.observations.map((record) => ({ ...record, occurrenceAddress: 'incidental' })) };
    const allowedStaging = prepare({ ...staged, namingSemanticFamilyBridge: incidental }).preparedDependencies;
    assert.ok(allowedStaging.treeNamingSectionIntake.bridgeObservations.acceptedRecords.length > 0);
    assert.equal(allowedStaging.treeNamingOccurrenceBridgeIntake.diagnostics.some(({ reason }) => reason === 'addressed-payload-in-staging'), false);
  } finally { fs.rmSync(fixtureRoot, { recursive: true, force: true }); }
});
