import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  prepareTreeCodebaseAddressedSnapshot,
} from '../structural-addressing/src/structural-addressing-tree-codebase.logic.mjs';
import {
  renderTreeCodebaseAddressedSnapshot,
} from '../structural-addressing/src/structural-addressing-render-tree.logic.mjs';
import {
  GET_TREE_RENDER_VIEW,
  STRUCTURAL_ADDRESSING_RENDER_FORMATS,
  STRUCTURAL_ADDRESSING_OCCURRENCE_TYPES,
} from '../structural-addressing/src/structural-addressing-profile.knowledge.mjs';

const SUPPORTED_SCOPE = 'validator';
const SOURCE_NAMESPACE = 'calculogic-validator';
const DEFAULT_SCOPE_ROOT = 'calculogic-validator';
const EXCLUDED_WALK_NAMES = new Set(['.git', 'node_modules', '.reports', 'dist', 'build', 'coverage']);

const USAGE_TEXT =
  'Usage: node --experimental-strip-types calculogic-validator/scripts/addressing-get-tree.host.mjs --scope=validator [--target <path>] [--format text|json|both]';

const normalizeCliPath = (inputPath) => inputPath.trim().replaceAll('\\', '/');

const normalizeRelativePath = ({ absolutePath, repoRoot }) => normalizeCliPath(path.relative(repoRoot, absolutePath));

const resolveRepoRelativeTarget = ({ repoRoot, target }) => path.resolve(repoRoot, target);

const isInsideOrEqual = ({ child, parent }) => {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

export const findRepositoryRoot = async ({ cwd }) => {
  let cursor = path.resolve(cwd);

  while (true) {
    try {
      await fs.access(path.join(cursor, '.git'));
      return cursor;
    } catch {
      const parent = path.dirname(cursor);
      if (parent === cursor) {
        throw new Error('Unable to locate repository root.');
      }
      cursor = parent;
    }
  }
};

const buildScopeConfig = ({ scope, repoRoot }) => {
  if (scope !== SUPPORTED_SCOPE) {
    throw new Error(`Unsupported scope: ${scope ?? '(missing)'}`);
  }

  return {
    scope: SUPPORTED_SCOPE,
    sourceNamespace: SOURCE_NAMESPACE,
    defaultRoots: [DEFAULT_SCOPE_ROOT],
    allowedRootAbsolute: path.resolve(repoRoot, DEFAULT_SCOPE_ROOT),
  };
};

export const parseAddressingGetTreeArgs = (argv) => {
  let scope;
  let format = GET_TREE_RENDER_VIEW.defaultFormat;
  const targets = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--help' || argument === '-h') {
      return { helpRequested: true, scope, format, targets };
    }

    if (argument === '--scope') {
      const rawScope = argv[index + 1];
      if (!rawScope || rawScope.startsWith('--')) {
        throw new Error('Missing required value for --scope');
      }
      scope = rawScope;
      index += 1;
      continue;
    }

    if (argument.startsWith('--scope=')) {
      scope = argument.slice('--scope='.length);
      continue;
    }

    if (argument === '--target') {
      const rawTarget = argv[index + 1];
      if (!rawTarget || rawTarget.startsWith('--')) {
        throw new Error('Missing required value for --target');
      }
      targets.push(normalizeCliPath(rawTarget));
      index += 1;
      continue;
    }

    if (argument.startsWith('--target=')) {
      const rawTarget = argument.slice('--target='.length);
      if (!rawTarget) {
        throw new Error('Missing required value for --target');
      }
      targets.push(normalizeCliPath(rawTarget));
      continue;
    }

    if (argument === '--format') {
      const rawFormat = argv[index + 1];
      if (!rawFormat || rawFormat.startsWith('--')) {
        throw new Error('Missing required value for --format');
      }
      format = rawFormat;
      index += 1;
      continue;
    }

    if (argument.startsWith('--format=')) {
      const rawFormat = argument.slice('--format='.length);
      if (!rawFormat) {
        throw new Error('Missing required value for --format');
      }
      format = rawFormat;
      continue;
    }

    throw new Error(`Unknown flag: ${argument}`);
  }

  if (!scope) {
    throw new Error('Missing required --scope');
  }

  if (scope !== SUPPORTED_SCOPE) {
    throw new Error(`Unsupported scope: ${scope}`);
  }

  if (!GET_TREE_RENDER_VIEW.supportedFormats.includes(format)) {
    throw new Error(`Unsupported format: ${format}`);
  }

  return { helpRequested: false, scope, format, targets };
};


const assertNoSymlinkPathSegments = async ({ absolutePath, allowedRootAbsolute, target }) => {
  const relative = path.relative(allowedRootAbsolute, absolutePath);

  if (relative === '') {
    const rootStat = await fs.lstat(absolutePath);
    if (rootStat.isSymbolicLink()) {
      throw new Error(`Target path is a symbolic link and cannot be walked safely: ${target}`);
    }
    return;
  }

  const segments = relative.split(path.sep).filter(Boolean);
  let cursor = allowedRootAbsolute;

  for (const segment of segments) {
    cursor = path.join(cursor, segment);

    let segmentStat;
    try {
      segmentStat = await fs.lstat(cursor);
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new Error(`Target path does not exist: ${target}`);
      }
      throw error;
    }

    if (segmentStat.isSymbolicLink()) {
      throw new Error(`Target path traverses a symbolic link and cannot be walked safely: ${target}`);
    }
  }
};

const toOccurrenceNode = async ({ absolutePath, repoRoot }) => {
  const stat = await fs.lstat(absolutePath);

  if (stat.isSymbolicLink()) {
    return null;
  }

  const relativePath = normalizeRelativePath({ absolutePath, repoRoot });
  const name = path.basename(absolutePath);

  if (stat.isDirectory()) {
    const children = await fs.readdir(absolutePath);
    const includedChildren = children.filter((childName) => !EXCLUDED_WALK_NAMES.has(childName));
    includedChildren.sort((left, right) => left.localeCompare(right));

    const childNodes = [];

    for (const childName of includedChildren) {
      const childNode = await toOccurrenceNode({ absolutePath: path.join(absolutePath, childName), repoRoot });
      if (childNode) {
        childNodes.push(childNode);
      }
    }

    return {
      name,
      path: relativePath,
      occurrenceType: STRUCTURAL_ADDRESSING_OCCURRENCE_TYPES.FOLDER,
      children: childNodes,
    };
  }

  return {
    name,
    path: relativePath,
    occurrenceType: STRUCTURAL_ADDRESSING_OCCURRENCE_TYPES.FILE,
  };
};

export const buildTreeCodebaseInputFromFileSystem = async ({ scope, targets, cwd }) => {
  const repoRoot = await findRepositoryRoot({ cwd });
  const scopeConfig = buildScopeConfig({ scope, repoRoot });

  const selectedTargets = targets.length > 0 ? [...targets] : scopeConfig.defaultRoots;
  const scopeRoots = [];

  for (const target of selectedTargets) {
    const resolvedTarget = resolveRepoRelativeTarget({ repoRoot, target });

    if (!isInsideOrEqual({ child: resolvedTarget, parent: scopeConfig.allowedRootAbsolute })) {
      throw new Error(`Target is outside supported scope: ${target}`);
    }

    await assertNoSymlinkPathSegments({
      absolutePath: resolvedTarget,
      allowedRootAbsolute: scopeConfig.allowedRootAbsolute,
      target,
    });

    const rootNode = await toOccurrenceNode({ absolutePath: resolvedTarget, repoRoot });

    if (!rootNode) {
      throw new Error(`Target path is a symbolic link and cannot be walked safely: ${target}`);
    }

    scopeRoots.push(rootNode);
  }

  scopeRoots.sort((left, right) => left.path.localeCompare(right.path));

  return {
    sourceNamespace: scopeConfig.sourceNamespace,
    scope: scopeConfig.scope,
    target: targets.length > 0 ? [...targets] : null,
    scopeRoots,
  };
};

export const runAddressingGetTreeHost = async ({ argv, cwd, stdout, stderr }) => {
  try {
    const parsed = parseAddressingGetTreeArgs(argv);

    if (parsed.helpRequested) {
      stdout.write(`${USAGE_TEXT}\n`);
      return 0;
    }

    const input = await buildTreeCodebaseInputFromFileSystem({
      scope: parsed.scope,
      targets: parsed.targets,
      cwd,
    });
    const addressedTreeSnapshot = prepareTreeCodebaseAddressedSnapshot(input);
    const { renderedTree } = renderTreeCodebaseAddressedSnapshot(addressedTreeSnapshot);

    if (parsed.format === STRUCTURAL_ADDRESSING_RENDER_FORMATS.TEXT) {
      stdout.write(`${renderedTree}\n`);
      return 0;
    }

    if (parsed.format === STRUCTURAL_ADDRESSING_RENDER_FORMATS.JSON) {
      stdout.write(`${JSON.stringify({ addressedTreeSnapshot }, null, 2)}\n`);
      return 0;
    }

    stdout.write(`${JSON.stringify({ addressedTreeSnapshot, renderedTree }, null, 2)}\n`);
    return 0;
  } catch (error) {
    stderr.write(`Error: ${error.message}\n`);
    return 1;
  }
};

export const isDirectCliEntrypoint = ({ importMetaUrl, argvPath }) => {
  if (!argvPath) {
    return false;
  }

  return importMetaUrl === pathToFileURL(argvPath).href;
};

if (isDirectCliEntrypoint({ importMetaUrl: import.meta.url, argvPath: process.argv[1] })) {
  const exitCode = await runAddressingGetTreeHost({
    argv: process.argv.slice(2),
    cwd: process.cwd(),
    stdout: process.stdout,
    stderr: process.stderr,
  });

  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}
