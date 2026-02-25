import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runNamingValidator, summarizeFindings } from '../src/validators/naming-validator.logic.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repositoryRoot = path.resolve(__dirname, '..');

const { findings, totalFilesScanned } = runNamingValidator(repositoryRoot);
const summary = summarizeFindings(findings);

const report = {
  mode: 'report',
  totalFilesScanned,
  counts: summary.counts,
  codeCounts: summary.codeCounts,
  specialCaseTypeCounts: summary.specialCaseTypeCounts,
  warningRoleStatusCounts: summary.warningRoleStatusCounts,
  warningRoleCategoryCounts: summary.warningRoleCategoryCounts,
  findings,
};

console.log(JSON.stringify(report, null, 2));
process.exit(0);
