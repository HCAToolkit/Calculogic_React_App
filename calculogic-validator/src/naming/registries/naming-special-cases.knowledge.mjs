import { ROOT_APP_FILES } from '../../validator-root-files.knowledge.mjs';

export const EXCLUDED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'coverage', '.vite']);

export { ROOT_APP_FILES };

export const TEST_CONVENTION_PATTERN = /\.test\.[^.]+$|\.spec\.[^.]+$/u;
export const AMBIENT_DECLARATION_PATTERN = /\.d\.ts$/u;
export const TSCONFIG_PATTERN = /^tsconfig(\..+)?\.json$/u;
export const TOOLING_CONFIG_PATTERN = /^vite\.config\.[^.]+$|^eslint\.config\.[^.]+$/u;
