import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  runNamingValidator,
  summarizeFindings,
  getScopeProfile,
} from '../src/naming/naming-validator.host.mjs';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repositoryRoot = path.resolve(__dirname, '..', '..');

const SCOPES = ['repo', 'app', 'docs'];

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runScopeSummary = scope => {
  const { findings, totalFilesScanned } = runNamingValidator(repositoryRoot, { scope });
  const summary = summarizeFindings(findings);

  return {
    totalFilesScanned,
    counts: summary.counts,
    codeCounts: summary.codeCounts,
    specialCaseTypeCounts: summary.specialCaseTypeCounts,
    warningRoleStatusCounts: summary.warningRoleStatusCounts,
    warningRoleCategoryCounts: summary.warningRoleCategoryCounts,
  };
};

const assertDeterministicScope = scope => {
  const profile = getScopeProfile(scope);
  assert(profile, `Missing naming validator scope profile: ${scope}`);

  const firstRun = runScopeSummary(scope);
  const secondRun = runScopeSummary(scope);

  assert(
    firstRun.totalFilesScanned === secondRun.totalFilesScanned,
    `Non-deterministic totalFilesScanned for scope=${scope}`,
  );

  const comparableKeys = [
    'counts',
    'codeCounts',
    'specialCaseTypeCounts',
    'warningRoleStatusCounts',
    'warningRoleCategoryCounts',
  ];

  for (const key of comparableKeys) {
    const firstSerialized = JSON.stringify(firstRun[key]);
    const secondSerialized = JSON.stringify(secondRun[key]);
    assert(
      firstSerialized === secondSerialized,
      `Non-deterministic summary.${key} for scope=${scope}`,
    );
  }
};

const assertAppScopeDocs = () => {
  const docsToValidate = [
    path.resolve(repositoryRoot, 'doc/ConventionRoutines/NamingValidatorSpec.md'),
    path.resolve(repositoryRoot, 'doc/nl-config/cfg-namingValidator.md'),
  ];

  const requiredMentions = ['src/', 'test/', 'calculogic-validator/'];

  for (const absoluteDocPath of docsToValidate) {
    const content = fs.readFileSync(absoluteDocPath, 'utf8');
    for (const requiredMention of requiredMentions) {
      assert(
        content.includes(requiredMention),
        `Docs drift detected in ${path.relative(repositoryRoot, absoluteDocPath)}: missing "${requiredMention}" mention for app scope`,
      );
    }
  }
};

const main = () => {
  for (const scope of SCOPES) {
    assertDeterministicScope(scope);
  }

  assertAppScopeDocs();

  console.log('OK: naming validator deterministic for repo|app|docs');
  console.log('OK: docs match app scope roots');
};

try {
  main();
  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Validator health check failed: ${message}`);
  process.exit(1);
}
