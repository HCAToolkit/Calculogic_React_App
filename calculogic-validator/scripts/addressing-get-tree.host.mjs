import fs from 'node:fs/promises';
import path from 'node:path';
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

const normalizeRelativePath = ({ absolutePath, cwd }) => normalizeCliPath(path.relative(cwd, absolutePath));

const buildScopeConfig = (scope) => {
  if (scope !== SUPPORTED_SCOPE) {
    throw new Error(`Unsupported scope: ${scope ?? '(missing)'}`);
  }

  return {
    scope: SUPPORTED_SCOPE,
    sourceNamespace: SOURCE_NAMESPACE,
    defaultRoots: [DEFAULT_SCOPE_ROOT],
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

  buildScopeConfig(scope);

  if (!GET_TREE_RENDER_VIEW.supportedFormats.includes(format)) {
    throw new Error(`Unsupported format: ${format}`);
  }

  return { helpRequested: false, scope, format, targets };
};

const toOccurrenceNode = async ({ absolutePath, cwd }) => {
  const stat = await fs.stat(absolutePath);
  const relativePath = normalizeRelativePath({ absolutePath, cwd });
  const name = path.basename(absolutePath);

  if (stat.isDirectory()) {
    const children = await fs.readdir(absolutePath);
    const includedChildren = children.filter((childName) => !EXCLUDED_WALK_NAMES.has(childName));
    includedChildren.sort((left, right) => left.localeCompare(right));

    const childNodes = [];

    for (const childName of includedChildren) {
      childNodes.push(
        await toOccurrenceNode({
          absolutePath: path.join(absolutePath, childName),
          cwd,
        }),
      );
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
  const scopeConfig = buildScopeConfig(scope);

  const selectedTargets = targets.length > 0 ? [...targets] : scopeConfig.defaultRoots;
  const scopeRoots = [];

  for (const target of selectedTargets) {
    const resolvedTarget = path.resolve(cwd, target);
    const relativeTarget = normalizeRelativePath({ absolutePath: resolvedTarget, cwd });

    if (relativeTarget.startsWith('..')) {
      throw new Error(`Target is outside supported scope: ${target}`);
    }

    const validatorRootAbsolute = path.resolve(cwd, DEFAULT_SCOPE_ROOT);
    const relativeToValidatorRoot = normalizeCliPath(path.relative(validatorRootAbsolute, resolvedTarget));
    if (!(relativeToValidatorRoot === '' || (!relativeToValidatorRoot.startsWith('..') && !path.isAbsolute(relativeToValidatorRoot)))) {
      throw new Error(`Target is outside supported scope: ${target}`);
    }

    try {
      await fs.access(resolvedTarget);
    } catch {
      throw new Error(`Target path does not exist: ${target}`);
    }

    scopeRoots.push(await toOccurrenceNode({ absolutePath: resolvedTarget, cwd }));
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

if (import.meta.url === `file://${process.argv[1]}`) {
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
