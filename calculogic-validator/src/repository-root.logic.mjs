import path from 'node:path';
import fs from 'node:fs';

export const fileExists = filePath => {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export const isDirectory = filePath => {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
};

export const resolveRepositoryRoot = ({ cwd = process.cwd() } = {}) => {
  let currentDirectory = path.resolve(cwd);

  while (true) {
    const gitPath = path.join(currentDirectory, '.git');
    if (fileExists(gitPath)) {
      return currentDirectory;
    }

    const packageJsonPath = path.join(currentDirectory, 'package.json');
    if (fileExists(packageJsonPath) && !isDirectory(packageJsonPath)) {
      return currentDirectory;
    }

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return path.resolve(cwd);
    }

    currentDirectory = parentDirectory;
  }
};
