export const EXCLUDED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'coverage', '.vite']);

export const ROOT_APP_FILES = new Set([
  'package.json',
  'package-lock.json',
  'eslint.config.js',
  'eslint.config.mjs',
  'vite.config.ts',
  'vite.config.js',
  'vite.config.mjs',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
]);

export const TEST_CONVENTION_PATTERN = /\.test\.[^.]+$|\.spec\.[^.]+$/u;
export const AMBIENT_DECLARATION_PATTERN = /\.d\.ts$/u;
export const TSCONFIG_PATTERN = /^tsconfig(\..+)?\.json$/u;
export const TOOLING_CONFIG_PATTERN = /^vite\.config\.[^.]+$|^eslint\.config\.[^.]+$/u;
