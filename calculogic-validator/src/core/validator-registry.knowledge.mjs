import { runNamingValidator, summarizeFindings } from '../../naming/src/naming-validator.host.mjs';
import {
  runTreeStructureAdvisor,
  summarizeFindings as summarizeTreeStructureAdvisorFindings,
} from '../../tree/src/tree-structure-advisor.host.mjs';

const runNamingValidatorHook = (repositoryRoot, options = {}) => {
  const scope = options.scope;
  const config = options.config;
  const targets = options.targets;
  const namingResult = runNamingValidator(repositoryRoot, { scope, config, targets });
  const summary = summarizeFindings(namingResult.findings);
  const meta = {};

  if (namingResult.filters?.isFiltered) {
    meta.filters = {
      isFiltered: true,
      targets: namingResult.filters.targets,
    };
  }

  if (namingResult.registry) {
    meta.registry = namingResult.registry;
  }

  return {
    scope: namingResult.scope,
    totalFilesScanned: namingResult.totalFilesScanned,
    findings: namingResult.findings,
    summary,
    ...(Object.keys(meta).length > 0 ? { meta } : {}),
  };
};

const runTreeStructureAdvisorHook = (repositoryRoot, options = {}) => {
  const scope = options.scope;
  const config = options.config;
  const targets = options.targets;
  const namingSemanticFamilyBridge = options.namingSemanticFamilyBridge;
  const treeStructureAdvisorResult = runTreeStructureAdvisor(repositoryRoot, {
    scope,
    config,
    targets,
    namingSemanticFamilyBridge,
  });
  const summary = summarizeTreeStructureAdvisorFindings(treeStructureAdvisorResult.findings);
  const meta = {};

  if (treeStructureAdvisorResult.filters?.isFiltered) {
    meta.filters = {
      isFiltered: true,
      targets: treeStructureAdvisorResult.filters.targets,
    };
  }

  return {
    scope: treeStructureAdvisorResult.scope,
    totalFilesScanned: treeStructureAdvisorResult.totalFilesScanned,
    findings: treeStructureAdvisorResult.findings,
    summary,
    ...(Object.keys(meta).length > 0 ? { meta } : {}),
  };
};

const REPORT_CAPTURE_DEFAULT_OPTIONS = {
  captureCommand: 'calculogic-report-capture',
  json: true,
  dir: './.reports',
  keep: 20,
};

const buildValidatorReportCapturePresets = ({
  scriptNamespace,
  profileId,
  directScriptPath,
  prefixBase,
  semanticPolicyOwner,
  scopes,
}) =>
  scopes.map((scope) => ({
    scriptName: `report:${scriptNamespace}:${scope}`,
    profileId,
    commandSurface: 'validator-report-capture',
    semanticPolicyOwner,
    capture: {
      ...REPORT_CAPTURE_DEFAULT_OPTIONS,
      prefix: `${prefixBase}-${scope}`,
    },
    wrappedCommand: {
      executable: 'node',
      args: ['--experimental-strip-types', directScriptPath, `--scope=${scope}`],
    },
  }));

const namingValidatorSliceReportCapturePresets = [
  ...buildValidatorReportCapturePresets({
    scriptNamespace: 'naming',
    profileId: 'naming',
    directScriptPath: 'calculogic-validator/scripts/validate-naming.host.mjs',
    prefixBase: 'naming',
    semanticPolicyOwner: 'naming',
    scopes: ['repo', 'app', 'docs'],
  }),
  {
    scriptName: 'report:naming:validator',
    profileId: 'naming',
    commandSurface: 'validator-report-capture',
    semanticPolicyOwner: 'naming',
    capture: {
      ...REPORT_CAPTURE_DEFAULT_OPTIONS,
      prefix: 'naming-validator',
    },
    wrappedCommand: {
      executable: 'node',
      args: [
        '--experimental-strip-types',
        'calculogic-validator/scripts/validate-naming.host.mjs',
        '--scope=validator',
      ],
    },
  },
  {
    scriptName: 'report:naming:validator:entry',
    profileId: 'naming',
    commandSurface: 'validator-report-capture',
    semanticPolicyOwner: 'naming',
    capture: {
      ...REPORT_CAPTURE_DEFAULT_OPTIONS,
      prefix: 'naming-validator-entry',
    },
    wrappedCommand: {
      executable: 'node',
      args: [
        '--experimental-strip-types',
        'calculogic-validator/scripts/validate-naming.host.mjs',
        '--scope=validator',
        '--target',
        'calculogic-validator/bin',
        '--target',
        'calculogic-validator/scripts',
      ],
    },
  },
  ...['naming', 'tree', 'doc'].map((targetName) => ({
    scriptName: `report:naming:validator:${targetName}`,
    profileId: 'naming',
    commandSurface: 'validator-report-capture',
    semanticPolicyOwner: 'naming',
    capture: {
      ...REPORT_CAPTURE_DEFAULT_OPTIONS,
      prefix: `naming-validator-${targetName}`,
    },
    wrappedCommand: {
      executable: 'node',
      args: [
        '--experimental-strip-types',
        'calculogic-validator/scripts/validate-naming.host.mjs',
        '--scope=validator',
        '--target',
        `calculogic-validator/${targetName}`,
      ],
    },
  })),
  {
    scriptName: 'report:naming:system',
    profileId: 'naming',
    commandSurface: 'validator-report-capture',
    semanticPolicyOwner: 'naming',
    capture: {
      ...REPORT_CAPTURE_DEFAULT_OPTIONS,
      prefix: 'naming-system',
    },
    wrappedCommand: {
      executable: 'node',
      args: [
        '--experimental-strip-types',
        'calculogic-validator/scripts/validate-naming.host.mjs',
        '--scope=system',
      ],
    },
  },
];

export const VALIDATOR_REPORT_CAPTURE_PRESETS = [
  ...namingValidatorSliceReportCapturePresets,
  ...buildValidatorReportCapturePresets({
    scriptNamespace: 'all',
    profileId: 'validate-all',
    directScriptPath: 'calculogic-validator/scripts/validate-all.host.mjs',
    prefixBase: 'validate-all',
    semanticPolicyOwner: 'suite-core-runner',
    scopes: ['repo', 'app', 'docs', 'validator', 'system'],
  }),
  ...buildValidatorReportCapturePresets({
    scriptNamespace: 'tree',
    profileId: 'tree-structure-advisor',
    directScriptPath: 'calculogic-validator/scripts/validate-tree.host.mjs',
    prefixBase: 'validate-tree',
    semanticPolicyOwner: 'tree',
    scopes: ['repo', 'app', 'docs', 'validator', 'system'],
  }),
  {
    scriptName: 'report:addressing:get-tree:validator',
    profileId: 'addressing-get-tree',
    commandSurface: 'validator-report-capture',
    semanticPolicyOwner: 'addressing-deferred',
    capture: {
      ...REPORT_CAPTURE_DEFAULT_OPTIONS,
      prefix: 'addressing-get-tree-validator',
    },
    wrappedCommand: {
      executable: 'npm',
      args: ['run', 'addressing:get-tree', '--', '--scope=validator', '--format=both'],
    },
  },
];

export const VALIDATOR_REGISTRY = [
  {
    id: 'naming',
    description: 'Filename naming validator (report-mode).',
    metadata: {
      sliceId: 'naming',
      report: {
        entryId: 'naming',
        validatorId: 'naming',
        description: 'Filename naming validator (report-mode).',
        mode: 'report',
        profileId: 'naming',
      },
      commands: {
        repoLocalNpmScript: 'validate:naming',
        repoLocalNpmInvocation: 'npm run validate:naming --',
        directScriptPath: 'calculogic-validator/scripts/validate-naming.host.mjs',
      },
      packageBin: {
        expectedName: 'calculogic-validate-naming',
        available: true,
      },
      runner: {
        defaultIncludedInValidateAll: true,
        directRunnable: true,
        runnerOnly: false,
        selectionId: 'naming',
      },
      bridge: {
        provides: [
          {
            id: 'naming-semantic-family-bridge',
            consumerValidatorIds: ['tree-structure-advisor'],
            stagedBy: 'validator-runner',
          },
        ],
        consumes: [],
      },
      reportCapture: {
        profileId: 'naming',
        scriptPattern: 'report:naming:<scope>',
        prefixPattern: 'naming-<scope>',
        scopes: ['repo', 'app', 'docs', 'validator', 'system'],
      },
      compatibility: {
        behaviorPreservingMetadataOnly: true,
        selectedByRegistryId: true,
        reportShapeDrivenByRunner: true,
      },
    },
    run: runNamingValidatorHook,
  },
  {
    id: 'tree-structure-advisor',
    description: 'Repository tree structure advisory validator (report-only).',
    metadata: {
      sliceId: 'tree-structure-advisor',
      report: {
        entryId: 'tree-structure-advisor',
        validatorId: 'tree-structure-advisor',
        description: 'Repository tree structure advisory validator (report-only).',
        mode: 'report',
        profileId: 'tree-structure-advisor',
      },
      commands: {
        repoLocalNpmScript: 'validate:tree',
        repoLocalNpmInvocation: 'npm run validate:tree --',
        directScriptPath: 'calculogic-validator/scripts/validate-tree.host.mjs',
      },
      packageBin: {
        expectedName: 'calculogic-validate-tree',
        available: false,
      },
      runner: {
        defaultIncludedInValidateAll: true,
        directRunnable: true,
        runnerOnly: false,
        selectionId: 'tree-structure-advisor',
      },
      bridge: {
        provides: [],
        consumes: [
          {
            id: 'naming-semantic-family-bridge',
            providerValidatorId: 'naming',
            stagedBy: 'validator-runner',
          },
        ],
      },
      reportCapture: {
        profileId: 'tree-structure-advisor',
        scriptPattern: 'report:tree:<scope>',
        prefixPattern: 'validate-tree-<scope>',
        scopes: ['repo', 'app', 'docs', 'validator', 'system'],
      },
      compatibility: {
        behaviorPreservingMetadataOnly: true,
        selectedByRegistryId: true,
        reportShapeDrivenByRunner: true,
      },
    },
    run: runTreeStructureAdvisorHook,
  },
];

export const listRegisteredValidators = () =>
  VALIDATOR_REGISTRY.map((validator) => validator.id).sort((a, b) => a.localeCompare(b));

export const getValidatorById = (id) =>
  VALIDATOR_REGISTRY.find((validator) => validator.id === id) ?? null;
