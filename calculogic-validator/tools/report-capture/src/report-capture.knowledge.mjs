import os from 'node:os';
import path from 'node:path';

export const getDefaultCacheBaseDir = (platform = process.platform, env = process.env, homeDir = os.homedir()) => {
  if (platform === 'win32') {
    return env.LOCALAPPDATA && env.LOCALAPPDATA.trim()
      ? env.LOCALAPPDATA
      : path.join(homeDir, 'AppData', 'Local');
  }

  if (platform === 'darwin') {
    return path.join(homeDir, 'Library', 'Caches');
  }

  if (env.XDG_CACHE_HOME && env.XDG_CACHE_HOME.trim()) {
    return env.XDG_CACHE_HOME;
  }

  return path.join(homeDir, '.cache');
};

export const getDefaultReportsDir = (platform = process.platform, env = process.env, homeDir = os.homedir()) =>
  path.join(getDefaultCacheBaseDir(platform, env, homeDir), 'calculogic-report-capture', 'reports');
