#!/usr/bin/env node
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
  buildReportFilename,
  listMatchingReports,
  pruneReports,
  sanitizePrefix,
  shouldPrune,
} from './report-capture.logic.mjs';
import { getDefaultReportsDir } from './report-capture.knowledge.mjs';

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const parseArgs = argv => {
  const separatorIndex = argv.indexOf('--');
  if (separatorIndex === -1) {
    throw new Error('Missing command separator "--" and wrapped command.');
  }

  const flagArgs = argv.slice(0, separatorIndex);
  const commandArgs = argv.slice(separatorIndex + 1);
  if (commandArgs.length === 0) {
    throw new Error('Missing wrapped command after "--".');
  }

  const options = {
    dir: null,
    keep: 20,
    noPrune: false,
    prefix: 'report',
    warnOnPrune: true,
    json: false,
  };

  for (let i = 0; i < flagArgs.length; i += 1) {
    const arg = flagArgs[i];

    if (arg === '--dir') {
      const value = flagArgs[i + 1];
      if (!value) throw new Error('Missing value for --dir');
      options.dir = value;
      i += 1;
      continue;
    }

    if (arg === '--keep') {
      const value = flagArgs[i + 1];
      if (!value) throw new Error('Missing value for --keep');
      options.keep = parsePositiveInt(value, 20);
      i += 1;
      continue;
    }

    if (arg === '--no-prune') {
      options.noPrune = true;
      continue;
    }

    if (arg === '--prefix') {
      const value = flagArgs[i + 1];
      if (!value) throw new Error('Missing value for --prefix');
      options.prefix = value;
      i += 1;
      continue;
    }

    if (arg === '--warn-on-prune') {
      options.warnOnPrune = true;
      continue;
    }

    if (arg === '--no-warn-on-prune') {
      options.warnOnPrune = false;
      continue;
    }

    if (arg === '--json') {
      options.json = true;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return {
    options: {
      ...options,
      prefix: sanitizePrefix(options.prefix),
    },
    command: commandArgs[0],
    commandArgs: commandArgs.slice(1),
  };
};

const resolveWindowsCommand = command => {
  if (process.platform !== 'win32') {
    return command;
  }

  const ext = path.extname(command);
  if (ext) {
    return command;
  }

  const pathValue = process.env.PATH || '';
  const pathEntries = pathValue.split(path.delimiter).filter(Boolean);
  const pathextValue = process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD';
  const pathext = pathextValue.split(';').filter(Boolean);

  for (const directory of pathEntries) {
    for (const extension of pathext) {
      const candidate = path.join(directory, `${command}${extension.toLowerCase()}`);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return command;
};

const run = async () => {
  const startedAt = new Date();
  const { options, command, commandArgs } = parseArgs(process.argv.slice(2));

  const reportDir = path.resolve(process.cwd(), options.dir ?? getDefaultReportsDir());
  await fsp.mkdir(reportDir, { recursive: true });

  if (shouldPrune({ noPrune: options.noPrune }) && options.warnOnPrune) {
    const existing = await listMatchingReports(reportDir, { prefix: options.prefix });
    if (existing.length >= options.keep) {
      process.stderr.write(`WARNING: This run will prune reports beyond the newest ${options.keep}. Save anything you want to keep before continuing.\n`);
    }
  }

  const reportPath = path.join(reportDir, buildReportFilename({ prefix: options.prefix, date: startedAt }));
  const reportStream = fs.createWriteStream(reportPath, { flags: 'a' });

  const resolvedCommand = resolveWindowsCommand(command);
  const child = spawn(resolvedCommand, commandArgs, {
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  let bytes = 0;
  child.stdout.on('data', chunk => {
    bytes += chunk.length;
    process.stdout.write(chunk);
    reportStream.write(chunk);
  });

  child.stderr.on('data', chunk => {
    bytes += chunk.length;
    process.stderr.write(chunk);
    reportStream.write(chunk);
  });

  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', code => resolve(code ?? 1));
  });

  await new Promise((resolve, reject) => {
    reportStream.end(error => (error ? reject(error) : resolve()));
  });

  if (shouldPrune({ noPrune: options.noPrune })) {
    await pruneReports(reportDir, { prefix: options.prefix, keep: options.keep });
  }

  const endedAt = new Date();
  if (options.json) {
    const metadata = {
      path: reportPath,
      exitCode,
      bytes,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationMs: endedAt.getTime() - startedAt.getTime(),
      dir: reportDir,
      prefix: options.prefix,
    };
    process.stderr.write(`${JSON.stringify(metadata)}\n`);
  }

  process.exit(exitCode);
};

run().catch(error => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
