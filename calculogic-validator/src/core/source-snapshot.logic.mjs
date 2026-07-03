import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const runGit = (cwd, args) =>
  spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

const parseStatusDiagnostics = (statusOutput) => {
  const lines = statusOutput
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean);

  const untrackedCount = lines.filter((line) => line.startsWith('??')).length;
  const changedCount = lines.length - untrackedCount;

  return {
    isDirty: lines.length > 0,
    changedCount,
    untrackedCount,
  };
};

export const getSourceSnapshot = ({ cwd }) => {
  const repositoryRoot = cwd ? path.resolve(cwd) : undefined;
  const baseSnapshot = {
    source: 'fs',
    ...(repositoryRoot ? { repositoryRoot } : {}),
  };

  if (!cwd || !existsSync(`${cwd}/.git`)) {
    return baseSnapshot;
  }

  const headShaResult = runGit(cwd, ['rev-parse', 'HEAD']);
  if (headShaResult.error || headShaResult.status !== 0) {
    return baseSnapshot;
  }

  const statusResult = runGit(cwd, ['status', '--porcelain']);
  if (statusResult.error || statusResult.status !== 0) {
    return {
      ...baseSnapshot,
      gitRef: 'HEAD',
      gitHeadSha: headShaResult.stdout.trim(),
    };
  }

  return {
    ...baseSnapshot,
    gitRef: 'HEAD',
    gitHeadSha: headShaResult.stdout.trim(),
    diagnostics: parseStatusDiagnostics(statusResult.stdout),
  };
};
