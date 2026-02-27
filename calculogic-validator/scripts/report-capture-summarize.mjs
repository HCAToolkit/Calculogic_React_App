#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const defaultPrefixes = [
  'naming-repo',
  'naming-app',
  'naming-docs',
  'naming-validator',
  'naming-system',
  'validate-all-repo',
  'validate-all-app',
  'validate-all-docs',
  'validate-all-validator',
  'validate-all-system',
];

const parsePositiveInteger = (value, optionName) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${optionName} must be a positive integer.`);
  }

  return parsed;
};

const parseOptions = argv => {
  const options = {
    dir: './.reports',
    prefixes: defaultPrefixes,
    top: 6,
    warnSamples: 5,
  };

  for (const argument of argv) {
    if (argument.startsWith('--dir=')) {
      options.dir = argument.slice('--dir='.length);
      continue;
    }

    if (argument.startsWith('--prefixes=')) {
      const parsedPrefixes = argument
        .slice('--prefixes='.length)
        .split(',')
        .map(prefix => prefix.trim())
        .filter(Boolean);

      if (parsedPrefixes.length === 0) {
        throw new Error('--prefixes must provide at least one prefix.');
      }

      options.prefixes = parsedPrefixes;
      continue;
    }

    if (argument.startsWith('--top=')) {
      options.top = parsePositiveInteger(argument.slice('--top='.length), '--top');
      continue;
    }

    if (argument.startsWith('--warn-samples=')) {
      options.warnSamples = parsePositiveInteger(argument.slice('--warn-samples='.length), '--warn-samples');
      continue;
    }

    throw new Error(`Unknown option: ${argument}`);
  }

  return options;
};

const getLatestReportForPrefix = async ({ dir, prefix }) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const matchingFiles = entries
    .filter(entry => entry.isFile() && entry.name.startsWith(`${prefix}-`) && entry.name.endsWith('.txt'))
    .map(entry => entry.name);

  if (matchingFiles.length === 0) {
    throw new Error(`No report files found for prefix "${prefix}" in ${dir}`);
  }

  const reportsWithStats = await Promise.all(matchingFiles.map(async filename => {
    const filePath = path.join(dir, filename);
    const stats = await fs.stat(filePath);
    return {
      filename,
      filePath,
      mtimeMs: stats.mtimeMs,
      bytes: stats.size,
    };
  }));

  reportsWithStats.sort((a, b) => b.mtimeMs - a.mtimeMs || b.filename.localeCompare(a.filename));
  return reportsWithStats[0];
};

const parseReportJson = async report => {
  const raw = await fs.readFile(report.filePath, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return { raw, parsed };
  } catch (error) {
    throw new Error(`Invalid JSON in ${report.filename}: ${error.message}`);
  }
};

const formatCodeCounts = ({ codeCounts, top }) => {
  const entries = Object.entries(codeCounts ?? {});

  if (entries.length === 0) {
    return 'none';
  }

  return entries
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, top)
    .map(([code, count]) => `${code}:${count}`)
    .join(', ');
};

const printSummary = ({ prefix, report, parsedReport, top, warnSamples }) => {
  const findings = Array.isArray(parsedReport.findings) ? parsedReport.findings : [];
  const warnFindings = findings.filter(finding => finding?.severity === 'warn');
  const warnSampleLines = warnFindings
    .slice(0, warnSamples)
    .map(finding => `${finding.code ?? 'unknown'}: ${finding.path ?? '(no path)'}`);

  process.stdout.write(`=== ${prefix} (latest) ===\n`);
  process.stdout.write(`file: ${report.filename} | bytes: ${report.bytes}\n`);
  process.stdout.write(`scope: ${parsedReport.scope ?? 'unknown'} | totalFilesScanned: ${parsedReport.totalFilesScanned ?? 0} | findingsGenerated: ${parsedReport.findingsGenerated ?? findings.length}\n`);

  const counts = parsedReport.counts ?? {};
  process.stdout.write(`counts: canonical=${counts.canonical ?? 0}, allowed=${counts.allowed ?? 0}, legacy=${counts.legacy ?? 0}, invalid=${counts.invalid ?? 0}\n`);
  process.stdout.write(`topCodeCounts(${top}): ${formatCodeCounts({ codeCounts: parsedReport.codeCounts, top })}\n`);
  process.stdout.write(`warnCount: ${warnFindings.length}\n`);

  if (warnSampleLines.length > 0) {
    process.stdout.write(`warnSamples: ${warnSampleLines.join(' | ')}\n`);
  }

  process.stdout.write('\n');
};

const run = async () => {
  const options = parseOptions(process.argv.slice(2));
  const reportsDir = path.resolve(options.dir);

  let hasFailures = false;

  for (const prefix of options.prefixes) {
    try {
      const latestReport = await getLatestReportForPrefix({ dir: reportsDir, prefix });
      const { parsed } = await parseReportJson(latestReport);
      printSummary({
        prefix,
        report: latestReport,
        parsedReport: parsed,
        top: options.top,
        warnSamples: options.warnSamples,
      });
    } catch (error) {
      hasFailures = true;
      process.stderr.write(`FAIL ${prefix}: ${error.message}\n`);
    }
  }

  process.exit(hasFailures ? 1 : 0);
};

run().catch(error => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
