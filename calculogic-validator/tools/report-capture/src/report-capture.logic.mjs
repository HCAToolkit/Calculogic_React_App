import fs from 'node:fs/promises';
import path from 'node:path';

const pad2 = (value) => String(value).padStart(2, '0');

export const formatTimestamp = (date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

export const sanitizePrefix = (prefix) => {
  const safe = String(prefix ?? 'report')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return safe || 'report';
};

export const buildReportFilename = ({ prefix = 'report', date = new Date() } = {}) =>
  `${sanitizePrefix(prefix)}-${formatTimestamp(date)}.txt`;

export const shouldPrune = ({ noPrune = false } = {}) => !noPrune;

const isMatchingReport = ({ fileName, prefix }) =>
  fileName.startsWith(`${prefix}-`) && fileName.endsWith('.txt');

export const listMatchingReports = async (directory, { prefix = 'report' } = {}) => {
  const safePrefix = sanitizePrefix(prefix);
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const stats = await Promise.all(
    entries
      .filter(
        (entry) => entry.isFile() && isMatchingReport({ fileName: entry.name, prefix: safePrefix }),
      )
      .map(async (entry) => {
        const filePath = path.join(directory, entry.name);
        const fileStat = await fs.stat(filePath);
        return {
          fileName: entry.name,
          filePath,
          mtimeMs: fileStat.mtimeMs,
        };
      }),
  );

  stats.sort(
    (left, right) => right.mtimeMs - left.mtimeMs || left.fileName.localeCompare(right.fileName),
  );
  return stats;
};

export const pruneReports = async (directory, { prefix = 'report', keep = 20 } = {}) => {
  const safeKeep = Math.max(0, Number.parseInt(String(keep), 10) || 0);
  const reports = await listMatchingReports(directory, { prefix });
  const toDelete = reports.slice(safeKeep);

  await Promise.all(toDelete.map((report) => fs.unlink(report.filePath)));

  return {
    kept: reports.slice(0, safeKeep),
    deleted: toDelete,
  };
};
