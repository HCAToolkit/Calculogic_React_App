// Registered pinned links to the standalone Validator repository (Refs #713).
// Contract: doc/nl-config/cfg-validatorPinConsistency.md §2.2.
//
// `packaged` targets are distributed in the installed @calculogic/validator package;
// `unpackaged` targets are repository-owned standalone development documentation that the
// package does not distribute, so they are never expected in node_modules.

export const VALIDATOR_PACKAGE_NAME = '@calculogic/validator';

export const VALIDATOR_REPOSITORY_BLOB_URL_PREFIX = 'https://github.com/HCAToolkit/calculogic-validator/blob/';

export const VALIDATOR_PIN_LINK_REGISTRY = [
  {
    id: 'ccpp',
    sourceDocument: 'doc/ConventionRoutines/CCPP.md',
    targetPath: 'doc/ConventionRoutines/CCPP.md',
    distribution: 'packaged',
  },
  {
    id: 'ccs',
    sourceDocument: 'doc/ConventionRoutines/CCS.md',
    targetPath: 'doc/ConventionRoutines/CCS.md',
    distribution: 'packaged',
  },
  {
    id: 'tree-structure-advisor',
    sourceDocument: 'doc/nl-config/cfg-treeStructureAdvisor.md',
    targetPath: 'doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md',
    distribution: 'unpackaged',
  },
  {
    id: 'naming-validator',
    sourceDocument: 'doc/nl-config/cfg-namingValidator.md',
    targetPath: 'doc/ValidatorSpecs/nl-config/cfg-namingValidator.md',
    distribution: 'unpackaged',
  },
  {
    id: 'validator-runner',
    sourceDocument: 'doc/nl-config/cfg-validatorRunner.md',
    targetPath: 'doc/ValidatorSpecs/nl-config/cfg-validatorRunner.md',
    distribution: 'unpackaged',
  },
];

// The embedded pre-extraction tree keeps its own historical references and is excluded from
// the discovery guard.
export const VALIDATOR_PIN_DISCOVERY_EXCLUDED_PREFIXES = ['calculogic-validator/'];
